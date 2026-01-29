import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import WalletGuard from "../components/WalletGuard";
import Link from "next/link";

export default function AdminDashboard() {
  // Mock data - will be replaced with real data later
  const stats = [
    {
      label: "Total Payouts",
      value: "24",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Total Amount",
      value: "1,245,000",
      unit: "USDT0",
      change: "+8%",
      trend: "up",
    },
    {
      label: "Recipients",
      value: "1,234",
      change: "+23%",
      trend: "up",
    },
    {
      label: "Pending",
      value: "3",
      change: "-2",
      trend: "down",
    },
  ];

  const recentPayouts = [
    {
      id: "PAY-001",
      date: "2024-01-15",
      recipients: 45,
      amount: "125,000 USDT0",
      status: "completed",
    },
    {
      id: "PAY-002",
      date: "2024-01-14",
      recipients: 32,
      amount: "89,500 USDT0",
      status: "completed",
    },
    {
      id: "PAY-003",
      date: "2024-01-13",
      recipients: 28,
      amount: "67,200 USDT0",
      status: "pending",
    },
  ];

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
                <div
                  className={`text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </div>
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
                        {payout.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payout.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payout.recipients}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payout.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payout.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {payout.status}
                      </span>
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
        </Card>
      </div>
    </Layout>
    </WalletGuard>
  );
}
