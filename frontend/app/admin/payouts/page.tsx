"use client";

import { useMemo } from "react";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Link from "next/link";
import Badge from "../../components/Badge";
import WalletGuard from "../../components/WalletGuard";
import { useUserPayouts } from "../../../lib/usePayouts";
import { formatUSDT0 } from "../../../lib/contractInteractions";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PayoutHistory() {
  const { payouts, isLoading } = useUserPayouts();

  const formattedPayouts = useMemo(() => {
    return payouts.map((payout) => {
      const date = new Date(Number(payout.timestamp) * 1000);
      return {
        id: payout.payoutId.toString(),
        date: date.toISOString().split("T")[0],
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        recipients: Number(payout.recipientCount),
        amount: formatUSDT0(payout.totalAmount),
        status: payout.completed ? "completed" : "pending",
        txHash: payout.txHash,
      };
    });
  }, [payouts]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <WalletGuard>
        <Layout variant="admin">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </Layout>
      </WalletGuard>
    );
  }

  return (
    <WalletGuard>
      <Layout variant="admin">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payout History</h1>
              <p className="mt-2 text-gray-600">
                View and manage all payout transactions
              </p>
            </div>
            <Link href="/admin/payouts/new">
              <Button variant="primary" size="lg">
                New Payout
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card>
            <div className="flex flex-wrap gap-4">
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Completed</option>
                <option>Pending</option>
              </select>
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Search by ID or address..."
                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </Card>

          {/* Payouts Table */}
          {formattedPayouts.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">No payouts found</p>
                <p className="text-sm mb-4">
                  Create your first payout to get started
                </p>
                <Link href="/admin/payouts/new">
                  <Button variant="primary" size="lg">
                    Create New Payout
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payout ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formattedPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            #{payout.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{payout.date}</div>
                          <div className="text-sm text-gray-500">{payout.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {payout.recipients}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 font-mono">
                            {payout.amount} USDT0
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payout.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payout.txHash ? (
                            <a
                              href={`https://flare-explorer.flare.network/tx/${payout.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-mono text-sm"
                            >
                              {payout.txHash.slice(0, 10)}...{payout.txHash.slice(-8)}
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/admin/payouts/${payout.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Pagination */}
          {formattedPayouts.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing 1-{formattedPayouts.length} of {formattedPayouts.length} payouts
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </WalletGuard>
  );
}
