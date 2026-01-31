"use client";

import { useState, useEffect } from "react";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";
import { getReceipt, getReceiptPageUrl, subscribeToReceipt } from "@/lib/proofRailsClient";
import type { Receipt } from "@/lib/proofRailsClient";

interface ProofRailsReceiptProps {
  receiptId: string;
  autoRefresh?: boolean;
}

export default function ProofRailsReceipt({ receiptId, autoRefresh = true }: ProofRailsReceiptProps) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReceipt();

    // Subscribe to real-time updates if autoRefresh is enabled
    if (autoRefresh) {
      const unsubscribe = subscribeToReceipt(
        receiptId,
        (updatedReceipt) => {
          setReceipt(updatedReceipt);
          setIsLoading(false);
        },
        (err) => {
          console.error("SSE error:", err);
        }
      );

      return () => unsubscribe();
    }
  }, [receiptId, autoRefresh]);

  const loadReceipt = async () => {
    try {
      setIsLoading(true);
      const data = await getReceipt(receiptId);
      
      if (data) {
        setReceipt(data);
      } else {
        setError("Failed to load receipt");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-purple-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading ISO 20022 receipt...</span>
        </div>
      </Card>
    );
  }

  if (error || !receipt) {
    return (
      <Card className="border-red-200 bg-red-50">
        <div className="text-center py-8">
          <p className="text-red-700">Failed to load receipt: {error}</p>
          <Button variant="outline" size="sm" onClick={loadReceipt} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const isAnchored = receipt.status === "anchored";
  const isPending = receipt.status === "pending";

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`border-2 ${isAnchored ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ISO 20022 Compliance Receipt
            </h3>
            <p className="text-sm text-gray-600 font-mono">
              Receipt ID: {receipt.receipt_id}
            </p>
          </div>
          <div className="text-right">
            {isPending && (
              <Badge variant="warning">
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Anchoring...
                </span>
              </Badge>
            )}
            {isAnchored && <Badge variant="success">✓ Anchored</Badge>}
          </div>
        </div>

        {isPending && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">
              🔄 Your payment receipt is being anchored to the Flare blockchain. This usually takes 30-60 seconds.
            </p>
          </div>
        )}
      </Card>

      {/* Transaction Details */}
      <Card>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Transaction Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Transaction Hash</p>
            <a
              href={`https://coston2-explorer.flare.network/tx/${receipt.tip_tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-blue-600 hover:underline break-all"
            >
              {receipt.tip_tx_hash.slice(0, 20)}...{receipt.tip_tx_hash.slice(-10)}
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-600">Network</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">{receipt.chain}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="text-sm font-semibold text-gray-900 font-mono">
              {parseFloat(receipt.amount) / 1_000_000} {receipt.currency}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reference</p>
            <p className="text-sm font-semibold text-gray-900">{receipt.reference}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created At</p>
            <p className="text-sm text-gray-900">
              {new Date(receipt.created_at).toLocaleString()}
            </p>
          </div>
          {receipt.updated_at && (
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-sm text-gray-900">
                {new Date(receipt.updated_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Blockchain Anchor Info (only when anchored) */}
      {isAnchored && receipt.flare_txid && (
        <Card className="border-green-200 bg-green-50">
          <h4 className="text-md font-semibold text-green-900 mb-4">
            ⛓️ Blockchain Anchor
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-green-700">Anchor Transaction</p>
              <a
                href={`https://coston2-explorer.flare.network/tx/${receipt.flare_txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-green-800 hover:underline break-all font-semibold"
              >
                {receipt.flare_txid}
              </a>
            </div>
            <div>
              <p className="text-sm text-green-700">Bundle Hash</p>
              <p className="text-sm font-mono text-green-800 break-all">
                {receipt.bundle_hash}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ISO 20022 Documents (only when anchored) */}
      {isAnchored && (
        <Card>
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            📄 ISO 20022 Documents
          </h4>
          <div className="space-y-3">
            {receipt.pain001_url && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    pain.001.001.09 - Customer Credit Transfer
                  </p>
                  <p className="text-xs text-gray-600">
                    Payment instruction XML for banking systems
                  </p>
                </div>
                <a
                  href={receipt.pain001_url}
                  download
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Download
                </a>
              </div>
            )}

            {receipt.pain002_url && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    pain.002 - Payment Status Report
                  </p>
                  <p className="text-xs text-gray-600">
                    Confirmation and status of payment
                  </p>
                </div>
                <a
                  href={receipt.pain002_url}
                  download
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Download
                </a>
              </div>
            )}

            {receipt.camt054_url && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    camt.054 - Credit Notification
                  </p>
                  <p className="text-xs text-gray-600">
                    Bank credit notification document
                  </p>
                </div>
                <a
                  href={receipt.camt054_url}
                  download
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Download
                </a>
              </div>
            )}

            {receipt.bundle_url && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <p className="text-sm font-semibold text-purple-900">
                    evidence.zip - Complete Evidence Bundle
                  </p>
                  <p className="text-xs text-purple-700">
                    Cryptographically signed bundle with all documents
                  </p>
                </div>
                <a
                  href={receipt.bundle_url}
                  download
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <a
            href={getReceiptPageUrl(receipt.receipt_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            🔍 View Full Receipt on ProofRails
          </a>
          
          {isAnchored && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(receipt.receipt_id);
                alert("Receipt ID copied to clipboard!");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              📋 Copy Receipt ID
            </button>
          )}

          <button
            onClick={loadReceipt}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            🔄 Refresh
          </button>
        </div>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          💡 About ISO 20022 Compliance
        </h4>
        <p className="text-sm text-blue-800">
          These documents provide banking-compliant proof of your blockchain payment. 
          They can be used for accounting, audits, tax reporting, and integration with 
          traditional financial systems. All documents are cryptographically signed and 
          anchored to the Flare blockchain for immutable verification.
        </p>
      </Card>
    </div>
  );
}