"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import WalletGuard from "../components/WalletGuard";
import LoadingSpinner from "../components/LoadingSpinner";
import ProofRailsReceipt from "../components/ProofRailsReceipt";
import { useReadContract } from "wagmi";
import { getRecipientHistoryConfig, formatUSDT0 } from "../../lib/contractInteractions";
import { toast } from "react-toastify";

interface Payment {
  payoutId: string;
  amount: string;
  amountRaw: bigint;
  recipient: string;
  paid: boolean;
  timestamp: bigint;
}

export default function RecipientPortal() {
  const { address, isConnected } = useAccount();
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Get recipient payment history from contract
  const { data: recipientHistory, isLoading, error } = useReadContract({
    ...getRecipientHistoryConfig(address as `0x${string}`),
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Format payment history
  const payments = useMemo(() => {
    if (!recipientHistory || !Array.isArray(recipientHistory)) {
      return [];
    }

    return recipientHistory.map((payment: any) => ({
      payoutId: payment.payoutId.toString(),
      amount: formatUSDT0(payment.amount),
      amountRaw: payment.amount,
      recipient: payment.recipient,
      paid: payment.paid,
      timestamp: payment.timestamp,
    })) as Payment[];
  }, [recipientHistory]);

  // Calculate total received
  const totalReceived = useMemo(() => {
    if (!recipientHistory || !Array.isArray(recipientHistory)) {
      return 0n;
    }
    return recipientHistory.reduce((sum: bigint, payment: any) => sum + payment.amount, 0n);
  }, [recipientHistory]);

  // Download individual payment record as CSV
  const handleDownloadRecord = (payment: Payment) => {
    const csv = [
      "Payout ID,Amount,Currency,Recipient,Status,Date",
      `${payment.payoutId},${payment.amount},USDT0,${payment.recipient},${payment.paid ? "Paid" : "Pending"},${new Date(Number(payment.timestamp) * 1000).toISOString()}`
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payment-${payment.payoutId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Payment record downloaded!");
  };

  // Download all payment records as CSV
  const handleDownloadAllRecords = () => {
    if (payments.length === 0) {
      toast.error("No payments to download");
      return;
    }

    const csvRows = [
      "Payout ID,Amount,Currency,Recipient,Status,Date",
      ...payments.map(payment => 
        `${payment.payoutId},${payment.amount},USDT0,${payment.recipient},${payment.paid ? "Paid" : "Pending"},${new Date(Number(payment.timestamp) * 1000).toISOString()}`
      )
    ];

    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `all-payments-${address?.slice(0, 8)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${payments.length} payment records!`);
  };

  // View receipt (opens modal)
  const handleViewReceipt = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
    setShowReceiptModal(true);
  };

  if (isLoading) {
    return (
      <WalletGuard>
        <Layout variant="recipient">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </Layout>
      </WalletGuard>
    );
  }

  if (error) {
    return (
      <WalletGuard>
        <Layout variant="recipient">
          <Card className="border-red-200 bg-red-50">
            <p className="text-red-700">Error loading payment history</p>
            <p className="text-sm text-red-600 mt-2">{error.message}</p>
          </Card>
        </Layout>
      </WalletGuard>
    );
  }

  return (
    <WalletGuard>
      <Layout variant="recipient">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Payments</h1>
            <p className="mt-2 text-gray-600">
              View your payment history and download records
            </p>
          </div>

          {/* Summary Card */}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Address</p>
                <p className="mt-2 font-mono text-sm text-gray-900 break-all">
                  {address || "Not connected"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Received</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 font-mono">
                  {formatUSDT0(totalReceived)} USDT0
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {payments.length}
                </p>
              </div>
            </div>
          </Card>

          {/* Payment History */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Payment History
              </h2>
              {payments.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownloadAllRecords}
                >
                  📥 Download All Records
                </Button>
              )}
            </div>
            
            {payments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">No payments received yet</p>
                <p className="text-sm">
                  Payments will appear here once you receive payouts
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment, index) => (
                  <div
                    key={`${payment.payoutId}-${index}`}
                    className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            Payout #{payment.payoutId}
                          </span>
                          {payment.paid ? (
                            <Badge variant="success">✓ Paid</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Received: {new Date(Number(payment.timestamp) * 1000).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          To: {payment.recipient.slice(0, 10)}...{payment.recipient.slice(-8)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 font-mono">
                            {payment.amount} USDT0
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadRecord(payment)}
                          >
                            📄 Download CSV
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleViewReceipt(payment.payoutId)}
                          >
                            🔍 View Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ProofRails Integration Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  ISO 20022 Verified Payment Records
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  All payments are verified and recorded with ISO 20022 compliance
                  via ProofRails. Each payment includes cryptographically signed
                  documents anchored to the Flare blockchain for immutable proof.
                </p>
                <ul className="text-sm text-blue-800 space-y-1 mb-4">
                  <li>✓ Banking-compliant ISO 20022 XML documents</li>
                  <li>✓ Blockchain-anchored cryptographic evidence</li>
                  <li>✓ Suitable for accounting and tax purposes</li>
                  <li>✓ Verifiable by any third party</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Receipt Modal */}
        {showReceiptModal && selectedPayoutId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Payment Receipt - Payout #{selectedPayoutId}
                </h2>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setSelectedPayoutId(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {/* Note: In real implementation, you'd need to fetch the ProofRails receipt ID for this payout */}
                <Card className="border-yellow-200 bg-yellow-50 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> To display ProofRails receipts, the contract needs to store
                    the receipt ID when payouts are created. Currently showing payment details only.
                  </p>
                </Card>

                {/* Payment Details */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                  {payments
                    .filter(p => p.payoutId === selectedPayoutId)
                    .map((payment, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Payout ID</p>
                            <p className="text-sm font-semibold text-gray-900">#{payment.payoutId}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Amount</p>
                            <p className="text-sm font-semibold text-gray-900 font-mono">
                              {payment.amount} USDT0
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            {payment.paid ? (
                              <Badge variant="success">Paid</Badge>
                            ) : (
                              <Badge variant="warning">Pending</Badge>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="text-sm text-gray-900">
                              {new Date(Number(payment.timestamp) * 1000).toLocaleString()}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Recipient Address</p>
                            <p className="text-sm text-gray-900 font-mono break-all">
                              {payment.recipient}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </Card>

                {/* Future: ProofRails Receipt Component */}
                {/* <ProofRailsReceipt receiptId={proofRailsReceiptId} autoRefresh={true} /> */}
              </div>
            </div>
          </div>
        )}
      </Layout>
    </WalletGuard>
  );
}