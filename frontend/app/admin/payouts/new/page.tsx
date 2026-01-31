"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Layout from "../../../components/Layout";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Badge from "../../../components/Badge";
import WalletGuard from "../../../components/WalletGuard";
import {
  getApproveConfig,
  getBatchPayoutConfig,
  getAllowanceConfig,
  getBalanceConfig,
  parseUSDT0,
  formatUSDT0,
} from "@/lib/contractInteractions";
import {
  recordBatchPayoutToProofRails,
  getProofRailsAPIUrl,
} from "@/lib/proofRailsClient";
import { batchPayoutContract } from "@/lib/contracts";

interface Recipient {
  address: string;
  amount: string;
}

export default function NewPayout() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [inputMethod, setInputMethod] = useState<"manual" | "csv">("manual");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [payoutRef, setPayoutRef] = useState("");
  const [step, setStep] = useState<"input" | "approve" | "execute" | "proofrails">("input");

  // Calculate total amount
  const totalAmount = recipients.reduce((sum, r) => {
    const amount = parseFloat(r.amount) || 0;
    return sum + amount;
  }, 0);

  const totalAmountWei = totalAmount > 0 ? parseUSDT0(totalAmount.toFixed(6)) : BigInt(0);

  // Check USDT0 balance
  const { data: balance, isLoading: balanceLoading } = useReadContract({
    ...getBalanceConfig(address as `0x${string}`),
    query: { enabled: !!address && isConnected },
  });

  // Check allowance
  const { data: allowance, isLoading: allowanceLoading, refetch: refetchAllowance } = useReadContract({
    ...getAllowanceConfig(address as `0x${string}`),
    query: { enabled: !!address && isConnected },
  });

  // Approve transaction
  const {
    writeContract: approve,
    data: approveHash,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract();

  // Wait for approve transaction
  const { isLoading: isWaitingApprove, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Batch payout transaction
  const {
    writeContract: executePayout,
    data: payoutHash,
    isPending: isExecuting,
    error: payoutError,
  } = useWriteContract();

  // Wait for payout transaction
  const { isLoading: isWaitingPayout, isSuccess: payoutSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash: payoutHash,
  });

  // Handle approve success
  useEffect(() => {
    if (approveSuccess) {
      toast.success("USDT0 approval successful!");
      console.log("Approval successful, refetching allowance...");
      
      // Wait a bit before refetching to ensure blockchain state is updated
      setTimeout(async () => {
        const newAllowance = await refetchAllowance();
        console.log("New allowance after approval:", newAllowance?.data?.toString());
        setStep("execute");
      }, 1000);
    }
  }, [approveSuccess, refetchAllowance]);

  // Handle payout success and ProofRails integration
  useEffect(() => {
    if (payoutSuccess && receipt && recipients.length > 0) {
      handleProofRailsIntegration();
    }
  }, [payoutSuccess, receipt]);

  const handleAddRecipient = () => {
    setRecipients([...recipients, { address: "", amount: "" }]);
  };

  const handleRecipientChange = (
    index: number,
    field: keyof Recipient,
    value: string
  ) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      const parsed: Recipient[] = [];

      lines.forEach((line, index) => {
        if (index === 0) return; // Skip header
        const [address, amount] = line.split(",").map((s) => s.trim());
        if (address && amount) {
          parsed.push({ address, amount });
        }
      });

      setRecipients(parsed);
    };
    reader.readAsText(file);
  };

  const validateRecipients = (): string[] => {
    const validationErrors: string[] = [];
    if (recipients.length === 0) {
      validationErrors.push("Please add at least one recipient");
    }

    recipients.forEach((recipient, index) => {
      if (!recipient.address) {
        validationErrors.push(`Recipient ${index + 1}: Address is required`);
      } else if (!recipient.address.startsWith("0x") || recipient.address.length !== 42) {
        validationErrors.push(`Recipient ${index + 1}: Invalid address format`);
      }
      if (!recipient.amount || parseFloat(recipient.amount) <= 0) {
        validationErrors.push(
          `Recipient ${index + 1}: Valid amount is required`
        );
      }
    });

    return validationErrors;
  };

  const handleApprove = () => {
    const validationErrors = validateRecipients();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    // Approve with 20% buffer to account for any rounding issues
    // Or approve max uint256 for convenience (uncomment below)
    const approveAmountDecimal = (totalAmount * 1.2).toFixed(6);
    
    // Alternative: Approve maximum amount (unlimited approval)
    // const maxApproval = "115792089237316195423570985008687907853269984665640564039457.584007";
    
    console.log("Approving amount:", approveAmountDecimal, "USDT0");
    console.log("Total amount needed:", totalAmount, "USDT0");
    console.log("Total amount in wei:", totalAmountWei.toString());
    console.log("Approval amount in wei:", parseUSDT0(approveAmountDecimal).toString());
    
    try {
      approve(getApproveConfig(approveAmountDecimal));
      setStep("approve");
      toast.info("Approve transaction submitted...");
    } catch (error: any) {
      console.error("Approval error:", error);
      toast.error(`Approval failed: ${error.message}`);
    }
  };

  const handleExecutePayout = () => {
    const validationErrors = validateRecipients();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!payoutRef.trim()) {
      toast.error("Please enter a payout reference");
      return;
    }

    // Debug logging
    console.log("=== Execute Payout Debug ===");
    console.log("Current allowance:", allowance?.toString());
    console.log("Total amount needed (wei):", totalAmountWei.toString());
    console.log("Total amount (decimal):", totalAmount);
    console.log("Has enough allowance:", allowance && allowance >= totalAmountWei);

    // Check if allowance is sufficient
    if (!allowance || allowance < totalAmountWei) {
      toast.error(`Insufficient allowance. Current: ${allowance ? formatUSDT0(allowance) : '0'}, Needed: ${formatUSDT0(totalAmountWei)}`);
      return;
    }

    const recipientAddresses = recipients.map((r) => r.address as `0x${string}`);
    const amounts = recipients.map((r) => r.amount);

    console.log("Recipients:", recipientAddresses);
    console.log("Amounts:", amounts);

    try {
      executePayout(getBatchPayoutConfig(recipientAddresses, amounts, payoutRef.trim()));
      setStep("execute");
      toast.info("Payout transaction submitted...");
    } catch (error: any) {
      console.error("Execute payout error:", error);
      toast.error(`Payout failed: ${error.message}`);
    }
  };

  const handleProofRailsIntegration = async () => {
    if (!payoutHash || !address || recipients.length === 0) return;

    setStep("proofrails");
    toast.info("Recording payments to ProofRails...");

    try {
      const amounts = recipients.map((r) => r.amount);
      const recipientAddresses = recipients.map((r) => r.address);

      const receipts = await recordBatchPayoutToProofRails(
        payoutHash,
        address,
        recipientAddresses,
        amounts,
        "USDT0",
        payoutRef || `payout-${Date.now()}`,
        process.env.NEXT_PUBLIC_PROOFRAILS_API_KEY
      );

      toast.success(`Successfully recorded ${receipts.length} receipts to ProofRails!`);
      
      // Redirect to payout details or history
      setTimeout(() => {
        router.push("/admin/payouts");
      }, 2000);
    } catch (error: any) {
      console.error("ProofRails integration error:", error);
      toast.error(`ProofRails integration failed: ${error.message}`);
      // Still redirect even if ProofRails fails
      setTimeout(() => {
        router.push("/admin/payouts");
      }, 3000);
    }
  };

  // Check if approval is needed
  // Only check if we have recipients (totalAmountWei > 0)
  const needsApproval = totalAmountWei > BigInt(0) && (!allowance || allowance < totalAmountWei);
  const hasEnoughBalance = balance && (totalAmountWei === BigInt(0) || balance >= totalAmountWei);

  return (
    <WalletGuard>
      <Layout variant="admin">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Payout</h1>
            <p className="mt-2 text-gray-600">
              Batch payout execution on Flare Testnet (Coston2) using USDT0
            </p>
          </div>

          {/* Balance and Allowance Info */}
          {address && (
            <>
              <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Your USDT0 Balance</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">
                      {balanceLoading ? "Loading..." : balance ? formatUSDT0(balance) : "0"} USDT0
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Allowance</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">
                      {allowanceLoading ? "Loading..." : allowance ? formatUSDT0(allowance) : "0"} USDT0
                    </p>
                    <button
                      onClick={() => refetchAllowance()}
                      className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    {needsApproval ? (
                      <Badge variant="warning">Approval Needed</Badge>
                    ) : hasEnoughBalance ? (
                      <Badge variant="success">Ready</Badge>
                    ) : (
                      <Badge variant="error">Insufficient Balance</Badge>
                    )}
                  </div>
                </div>
              </Card>

              {/* Debug Info - Remove this in production */}
              {recipients.length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Debug Info</h3>
                  <div className="text-xs text-blue-800 space-y-1 font-mono">
                    <p>Total Amount (decimal): {totalAmount}</p>
                    <p>Total Amount (wei): {totalAmountWei.toString()}</p>
                    <p>Current Allowance (wei): {allowance?.toString() || '0'}</p>
                    <p>Balance (wei): {balance?.toString() || '0'}</p>
                    <p>Needs Approval: {needsApproval ? 'Yes' : 'No'}</p>
                    <p>Has Enough Balance: {hasEnoughBalance ? 'Yes' : 'No'}</p>
                    <p>Allowance &gt;= Total: {allowance && allowance >= totalAmountWei ? 'Yes' : 'No'}</p>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Input Method Selection */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Input Method
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setInputMethod("manual")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  inputMethod === "manual"
                    ? "bg-blue-50 text-blue-700 border-2 border-blue-200"
                    : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setInputMethod("csv")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  inputMethod === "csv"
                    ? "bg-blue-50 text-blue-700 border-2 border-blue-200"
                    : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                CSV Upload
              </button>
            </div>
          </Card>

          {/* CSV Upload */}
          {inputMethod === "csv" && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Upload CSV File
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                CSV format: address,amount (one recipient per line)
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {csvFile && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ {csvFile.name} loaded ({recipients.length} recipients)
                </p>
              )}
            </Card>
          )}

          {/* Recipients List */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recipients ({recipients.length})
              </h2>
              <Button variant="outline" size="sm" onClick={handleAddRecipient}>
                + Add Recipient
              </Button>
            </div>

            {recipients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No recipients added yet.</p>
                <p className="text-sm mt-2">
                  {inputMethod === "manual"
                    ? "Click 'Add Recipient' to start"
                    : "Upload a CSV file to import recipients"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recipients.map((recipient, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={recipient.address}
                        onChange={(e) =>
                          handleRecipientChange(index, "address", e.target.value)
                        }
                        placeholder="0x..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="w-48">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (USDT0)
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={recipient.amount}
                        onChange={(e) =>
                          handleRecipientChange(index, "amount", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleRemoveRecipient(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Payout Reference */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payout Reference
            </h2>
            <input
              type="text"
              value={payoutRef}
              onChange={(e) => setPayoutRef(e.target.value)}
              placeholder="e.g., Q4-2024-Affiliate-Payout"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-600">
              This reference will be used for ProofRails receipts and tracking
            </p>
          </Card>

          {/* Summary */}
          {recipients.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payout Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Total Recipients:</span>
                  <span className="font-medium text-gray-900">
                    {recipients.length}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total Amount:</span>
                  <span className="font-medium text-gray-900 font-mono">
                    {totalAmount.toLocaleString()} USDT0
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total to Pay:
                    </span>
                    <span className="text-xl font-bold text-gray-900 font-mono">
                      {totalAmount.toLocaleString()} USDT0
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <h3 className="text-red-800 font-semibold mb-2">Validation Errors</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Transaction Errors */}
          {(approveError || payoutError) && (
            <Card className="border-red-200 bg-red-50">
              <h3 className="text-red-800 font-semibold mb-2">Transaction Error</h3>
              <p className="text-sm text-red-700">
                {approveError?.message || payoutError?.message}
              </p>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/admin/payouts")}
            >
              Cancel
            </Button>
            {needsApproval ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleApprove}
                isLoading={isApproving || isWaitingApprove}
                disabled={recipients.length === 0 || !hasEnoughBalance}
              >
                {isApproving || isWaitingApprove
                  ? "Approving..."
                  : "Approve USDT0"}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleExecutePayout}
                isLoading={isExecuting || isWaitingPayout || step === "proofrails"}
                disabled={recipients.length === 0 || !hasEnoughBalance || !payoutRef.trim()}
              >
                {step === "proofrails"
                  ? "Recording to ProofRails..."
                  : isExecuting || isWaitingPayout
                  ? "Executing..."
                  : "Execute Payout"}
              </Button>
            )}
          </div>

          {/* Transaction Status */}
          {approveHash && (
            <Card className="border-blue-200 bg-blue-50">
              <h3 className="text-blue-800 font-semibold mb-2">Approval Transaction</h3>
              <p className="text-sm text-blue-700 font-mono break-all">
                {approveHash}
              </p>
              <a
                href={`https://coston2-explorer.flare.network/tx/${approveHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                View on Coston2 Explorer →
              </a>
            </Card>
          )}

          {payoutHash && (
            <Card className="border-green-200 bg-green-50">
              <h3 className="text-green-800 font-semibold mb-2">Payout Transaction</h3>
              <p className="text-sm text-green-700 font-mono break-all">
                {payoutHash}
              </p>
              <a
                href={`https://coston2-explorer.flare.network/tx/${payoutHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline mt-2 inline-block"
              >
                View on Coston2 Explorer →
              </a>
            </Card>
          )}
        </div>
      </Layout>
    </WalletGuard>
  );
}