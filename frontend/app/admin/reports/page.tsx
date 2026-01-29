import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Button from "../../components/Button";
import WalletGuard from "../../components/WalletGuard";

export default function Reports() {
  // Mock data
  const reportData = {
    totalPayouts: 24,
    totalAmount: "1,245,000",
    totalRecipients: 1234,
    averagePayout: "51,875",
    period: "Last 30 days",
  };

  const topRecipients = [
    { address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", amount: "45,000", count: 12 },
    { address: "0x8ba1f109551bD432803012645Hac136c22C39", amount: "38,500", count: 8 },
    { address: "0x1234567890123456789012345678901234567890", amount: "32,000", count: 6 },
  ];

  const monthlyBreakdown = [
    { month: "Jan 2024", payouts: 8, amount: "425,000", recipients: 412 },
    { month: "Dec 2023", payouts: 10, amount: "520,000", recipients: 523 },
    { month: "Nov 2023", payouts: 6, amount: "300,000", recipients: 299 },
  ];

  return (
    <WalletGuard>
      <Layout variant="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="mt-2 text-gray-600">
              Comprehensive payout analytics and insights
            </p>
          </div>
          <Button variant="outline" size="lg">
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card padding="lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payouts</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {reportData.totalPayouts}
              </p>
              <p className="mt-1 text-sm text-gray-500">{reportData.period}</p>
            </div>
          </Card>
          <Card padding="lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {reportData.totalAmount}
              </p>
              <p className="mt-1 text-sm text-gray-500 font-mono">USDT0</p>
            </div>
          </Card>
          <Card padding="lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recipients</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {reportData.totalRecipients.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-gray-500">Unique addresses</p>
            </div>
          </Card>
          <Card padding="lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Payout</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {reportData.averagePayout}
              </p>
              <p className="mt-1 text-sm text-gray-500 font-mono">USDT0</p>
            </div>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Monthly Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payouts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyBreakdown.map((month) => (
                  <tr key={month.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {month.payouts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                      {month.amount} USDT0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {month.recipients}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Recipients */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Top Recipients
          </h2>
          <div className="space-y-4">
            {topRecipients.map((recipient, index) => (
              <div
                key={recipient.address}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {recipient.address.slice(0, 20)}...
                      {recipient.address.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {recipient.count} payments
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 font-mono">
                    {recipient.amount} USDT0
                  </p>
                  <p className="text-xs text-gray-500">Total received</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Export Options */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Export Options
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Download comprehensive reports in various formats for accounting and
            compliance purposes.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">Export CSV</Button>
            <Button variant="outline">Export PDF</Button>
            <Button variant="outline">Export JSON</Button>
            <Button variant="primary">Generate Full Report</Button>
          </div>
        </Card>
      </div>
    </Layout>
    </WalletGuard>
  );
}
