"use client";

import { useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import WalletGuard from "../components/WalletGuard";

export default function RecipientPortal() {
  const [address] = useState("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"); // Mock address

  // Mock data
  const payments = [
    {
      id: "PAY-001",
      date: "2024-01-15",
      amount: "2,500",
      status: "completed",
      txHash: "0x1234...5678",
      description: "Affiliate commission - Q4 2023",
    },
    {
      id: "PAY-002",
      date: "2024-01-10",
      amount: "1,800",
      status: "completed",
      txHash: "0xabcd...efgh",
      description: "Reward payout - Campaign #42",
    },
    {
      id: "PAY-003",
      date: "2024-01-05",
      amount: "3,200",
      status: "completed",
      txHash: "0x9876...5432",
      description: "Contributor payment - Project Alpha",
    },
  ];

  const totalReceived = payments.reduce(
    (sum, p) => sum + parseFloat(p.amount.replace(/,/g, "")),
    0
  );

  const getStatusBadge = (status: string) => {
    return status === "completed" ? (
      <Badge variant="success">Completed</Badge>
    ) : (
      <Badge variant="warning">{status}</Badge>
    );
  };

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
                {address}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Received</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 font-mono">
                {totalReceived.toLocaleString()} USDT0
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
            <Button variant="outline" size="sm">
              Download All Records
            </Button>
          </div>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {payment.id}
                      </span>
                      {getStatusBadge(payment.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {payment.description}
                    </p>
                    <p className="text-xs text-gray-500">{payment.date}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 font-mono">
                        {payment.amount} USDT0
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a
                        href={`https://flare-explorer.flare.network/tx/${payment.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View TX
                      </a>
                      <Button variant="outline" size="sm">
                        Download Record
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                Verified Payment Records
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                All your payments are verified and recorded on ProofRails,
                providing immutable proof of payment for accounting and
                compliance purposes.
              </p>
              <Button variant="primary" size="sm">
                View on ProofRails
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
    </WalletGuard>
  );
}
