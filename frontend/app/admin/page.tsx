"use client";

import { useMemo } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import WalletGuard from "../components/WalletGuard";
import Link from "next/link";
import { useUserPayouts, calculateStats } from "../../lib/usePayouts";
import LoadingSpinner from "../components/LoadingSpinner";
import Badge from "../components/Badge";
import { formatUSDT0 } from "../../lib/contractInteractions";

export default function AdminDashboard() {
  const { payouts, isLoading } = useUserPayouts();

  const stats = useMemo(() => {
    if (isLoading || payouts.length === 0) {
      return [
        {
          label: "Total Payouts",
          value: "0",
          change: "—",
          trend: "neutral" as const,
        },
        {
          label: "Total Amount",
          value: "0",
          unit: "USDT0",
          change: "—",
          trend: "neutral" as const,
        },
        {
          label: "Recipients",
          value: "0",
          change: "—",
          trend: "neutral" as const,
        },
        {
          label: "Pending",
          value: "0",
          change: "—",
          trend: "neutral" as const,
        },
      ];
    }

    const calculated = calculateStats(payouts);
    return [
        {
          label: "Total Payouts",
          value: calculated.totalPayouts.toString(),
          change: "—",
          trend: "neutral" as "up" | "down" | "neutral",
        },
        {
          label: "Total Amount",
          value: calculated.totalAmount,
          unit: "USDT0",
          change: "—",
          trend: "neutral" as "up" | "down" | "neutral",
        },
        {
          label: "Recipients",
          value: calculated.totalRecipients.toLocaleString(),
          change: "—",
          trend: "neutral" as "up" | "down" | "neutral",
        },
        {
          label: "Pending",
          value: calculated.pendingPayouts.toString(),
          change: "—",
          trend: "neutral" as "up" | "down" | "neutral",
        },
    ];
  }, [payouts, isLoading]);

  // Get recent payouts (last 5)
  const recentPayouts = useMemo(() => {
    return payouts.slice(0, 5).map((payout) => ({
      id: payout.payoutId.toString(),
      date: payout.date || new Date(Number(payout.timestamp) * 1000).toISOString().split("T")[0],
      recipients: Number(payout.recipientCount),
      amount: formatUSDT0(payout.totalAmount),
      status: payout.completed ? "completed" : "pending",
    }));
  }, [payouts]);

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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Overview of your payout operations
              </p>
            </div>
            <Link href="/admin/payouts/new">
              <Button variant="primary" size="lg">
                Create New Payout
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} padding="lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {stat.value}
                      {stat.unit && (
                        <span className="text-lg text-gray-500 ml-1">
                          {stat.unit}
                        </span>
                      )}
                    </p>
                  </div>
                  {stat.change !== "—" && (
                    <div
                      className={`text-sm font-medium ${
                        stat.trend === "up"
                          ? "text-green-600"
                          : stat.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {stat.change}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Payouts */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Payouts
              </h2>
              <Link href="/admin/payouts">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            {recentPayouts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">No payouts yet</p>
                <p className="text-sm">
                  Create your first payout to get started
                </p>
                <Link href="/admin/payouts/new">
                  <Button variant="primary" size="lg" className="mt-4">
                    Create New Payout
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payout ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            #{payout.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {payout.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {payout.recipients}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                          {payout.amount} USDT0
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payout.status === "completed" ? (
                            <Badge variant="success">Completed</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/admin/payouts/${payout.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </Layout>
    </WalletGuard>
  );
}
