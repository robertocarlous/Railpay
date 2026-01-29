import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Link from "next/link";
import Badge from "../../components/Badge";
import WalletGuard from "../../components/WalletGuard";

export default function PayoutHistory() {
  // Mock data
  const payouts = [
    {
      id: "PAY-001",
      date: "2024-01-15",
      time: "14:32",
      recipients: 45,
      amount: "125,000",
      status: "completed",
      txHash: "0x1234...5678",
    },
    {
      id: "PAY-002",
      date: "2024-01-14",
      time: "10:15",
      recipients: 32,
      amount: "89,500",
      status: "completed",
      txHash: "0xabcd...efgh",
    },
    {
      id: "PAY-003",
      date: "2024-01-13",
      time: "16:45",
      recipients: 28,
      amount: "67,200",
      status: "pending",
      txHash: null,
    },
    {
      id: "PAY-004",
      date: "2024-01-12",
      time: "09:20",
      recipients: 67,
      amount: "234,500",
      status: "completed",
      txHash: "0x9876...5432",
    },
    {
      id: "PAY-005",
      date: "2024-01-11",
      time: "11:30",
      recipients: 15,
      amount: "45,000",
      status: "failed",
      txHash: null,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "failed":
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

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
              <option>Failed</option>
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
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {payout.id}
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
                          {payout.txHash}
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

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing 1-{payouts.length} of {payouts.length} payouts
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
      </div>
    </Layout>
    </WalletGuard>
  );
}
