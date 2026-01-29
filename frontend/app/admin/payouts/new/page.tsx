"use client";

import { useState } from "react";
import Layout from "../../../components/Layout";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Badge from "../../../components/Badge";
import WalletGuard from "../../../components/WalletGuard";

interface Recipient {
  address: string;
  amount: string;
}

export default function NewPayout() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [inputMethod, setInputMethod] = useState<"manual" | "csv">("manual");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

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

  const handleSubmit = async () => {
    setErrors([]);
    setIsProcessing(true);

    // Validation
    const validationErrors: string[] = [];
    if (recipients.length === 0) {
      validationErrors.push("Please add at least one recipient");
    }

    recipients.forEach((recipient, index) => {
      if (!recipient.address) {
        validationErrors.push(`Recipient ${index + 1}: Address is required`);
      }
      if (!recipient.amount || parseFloat(recipient.amount) <= 0) {
        validationErrors.push(
          `Recipient ${index + 1}: Valid amount is required`
        );
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsProcessing(false);
      return;
    }

    // TODO: Implement actual payout logic
    setTimeout(() => {
      setIsProcessing(false);
      alert("Payout created successfully! (This is a mock)");
    }, 2000);
  };

  const totalAmount = recipients.reduce((sum, r) => {
    const amount = parseFloat(r.amount) || 0;
    return sum + amount;
  }, 0);

  return (
    <WalletGuard>
      <Layout variant="admin">
        <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Payout</h1>
          <p className="mt-2 text-gray-600">
            Batch payout execution on Flare using USDT0
          </p>
        </div>

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
                      step="0.01"
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

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" size="lg">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            isLoading={isProcessing}
            disabled={recipients.length === 0}
          >
            Execute Payout
          </Button>
        </div>
      </div>
    </Layout>
    </WalletGuard>
  );
}
