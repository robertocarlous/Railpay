import Layout from "../../../components/Layout";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Badge from "../../../components/Badge";
import Link from "next/link";
import WalletGuard from "../../../components/WalletGuard";

interface PageProps {
  params: {
    id: string;
  };
}

export default function PayoutDetails({ params }: PageProps) {
  // Mock data - in real app, fetch based on params.id
  const payout = {
    id: params.id,
    date: "2024-01-15",
    time: "14:32",
    recipients: 45,
    amount: "125,000",
    status: "completed",
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    description: "Q4 2023 Affiliate Payout",
  };

  const recipients = Array.from({ length: 10 }, (_, i) => ({
    address: `0x${Math.random().toString(16).substr(2, 40)}`,
    amount: (Math.random() * 5000 + 1000).toFixed(2),
  }));

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link
              href="/admin/payouts"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
            >
              ← Back to Payouts
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Payout Details
            </h1>
            <p className="mt-2 text-gray-600">
              {payout.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg">
              Export
            </Button>
            <Button variant="primary" size="lg">
              Download Report
            </Button>
          </div>
        </div>

        {/* Payout Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payout Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Payout ID</p>
                <p className="mt-1 font-mono text-sm font-medium text-gray-900">
                  {payout.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {payout.date} at {payout.time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="mt-1">{getStatusBadge(payout.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="mt-1 text-xl font-bold text-gray-900 font-mono">
                  {payout.amount} USDT0
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Recipients</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {payout.recipients}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Transaction Hash</p>
                <a
                  href={`https://flare-explorer.flare.network/tx/${payout.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 font-mono text-sm text-blue-600 hover:text-blue-700 break-all block"
                >
                  {payout.txHash}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-600">Network</p>
                <p className="mt-1 text-sm font-medium text-gray-900">Flare</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Token</p>
                <p className="mt-1 text-sm font-medium text-gray-900">USDT0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ProofRails Record</p>
                <Button variant="outline" size="sm" className="mt-2">
                  View on ProofRails
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Recipients List */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recipients ({payout.recipients})
            </h2>
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recipients.map((recipient, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-900">
                        {recipient.address}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                      {parseFloat(recipient.amount).toLocaleString()} USDT0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="success">Paid</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing 10 of {payout.recipients} recipients
            </p>
          </div>
        </Card>
      </div>
    </Layout>
    </WalletGuard>
  );
}
