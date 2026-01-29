import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Button from "../../components/Button";
import WalletGuard from "../../components/WalletGuard";

export default function Downloads() {
  const downloadOptions = [
    {
      title: "Payment History (CSV)",
      description: "Download all payment records in CSV format",
      format: "CSV",
      icon: "📊",
    },
    {
      title: "Tax Report (PDF)",
      description: "Generate a formatted tax report for all payments",
      format: "PDF",
      icon: "📄",
    },
    {
      title: "ProofRails Records",
      description: "Download verified payment proofs from ProofRails",
      format: "JSON",
      icon: "🔒",
    },
    {
      title: "Custom Date Range",
      description: "Select a specific date range for your records",
      format: "Multiple",
      icon: "📅",
    },
  ];

  return (
    <WalletGuard>
      <Layout variant="recipient">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Download Records</h1>
          <p className="mt-2 text-gray-600">
            Download your payment records in various formats
          </p>
        </div>

        {/* Download Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {downloadOptions.map((option) => (
            <Card key={option.title} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{option.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {option.title}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                      {option.format}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {option.description}
                  </p>
                  <Button variant="primary" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="border-green-200 bg-green-50">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            About Your Records
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                All records are verified on-chain and through ProofRails
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                Records include transaction hashes for blockchain verification
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                Formats are compatible with accounting software and tax tools
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </Layout>
    </WalletGuard>
  );
}
