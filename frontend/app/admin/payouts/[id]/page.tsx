"use client";

import { useParams, useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Badge from "../../../components/Badge";
import WalletGuard from "../../../components/WalletGuard";
import Link from "next/link";
import { usePayout } from "../../../../lib/usePayouts";
import { formatUSDT0 } from "../../../../lib/contractInteractions";
import LoadingSpinner from "../../../components/LoadingSpinner";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PayoutDetails({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = useParams();
  const payoutId = resolvedParams?.id ? BigInt(resolvedParams.id as string) : null;
  const { payout, isLoading, error } = usePayout(payoutId);

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

  if (error || !payout) {
    return (
      <WalletGuard>
        <Layout variant="admin">
          <Card>
            <div className="text-center py-12">
              <p className="text-lg font-medium text-gray-900 mb-2">
                Payout not found
              </p>
              <p className="text-sm text-gray-600 mb-4">
                The payout you're looking for doesn't exist or couldn't be loaded.
              </p>
              <Link href="/admin/payouts">
                <Button variant="primary">Back to Payouts</Button>
              </Link>
            </div>
          </Card>
        </Layout>
      </WalletGuard>
    );
  }

  const date = new Date(Number(payout.timestamp) * 1000);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <WalletGuard>
      <Layout variant="admin">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/admin/payouts"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
              >
                ← Back to Payouts
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Payout #{payout.payoutId.toString()}
              </h1>
              <p className="mt-2 text-gray-600">
                {formattedDate} at {formattedTime}
              </p>
            </div>
            <div className="flex space-x-3">
              {payout.completed ? (
                <Badge variant="success">Completed</Badge>
              ) : (
                <Badge variant="warning">Pending</Badge>
              )}
            </div>
          </div>

          {/* Payout Summary */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 font-mono">
                  {formatUSDT0(payout.totalAmount)} USDT0
                </p>
              </div>
            </Card>
            <Card>
              <div>
                <p className="text-sm font-medium text-gray-600">Recipients</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {Number(payout.recipientCount)}
                </p>
              </div>
            </Card>
            <Card>
              <div>
                <p className="text-sm font-medium text-gray-600">Initiator</p>
                <p className="mt-2 text-sm font-mono text-gray-900 break-all">
                  {payout.initiator}
                </p>
              </div>
            </Card>
          </div>

          {/* ProofRails Info */}
          {payout.proofRailsId && (
            <Card className="border-green-200 bg-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    ProofRails Receipt ID
                  </p>
                  <p className="mt-1 text-sm font-mono text-green-700">
                    {payout.proofRailsId}
                  </p>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>
            </Card>
          )}

          {/* Recipients List */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Recipients ({payout.recipients?.length || 0})
            </h2>
            {payout.recipients && payout.recipients.length > 0 ? (
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payout.recipients.map((recipient, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm text-gray-900">
                            {recipient.recipient}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 font-mono">
                            {formatUSDT0(recipient.amount)} USDT0
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recipients found for this payout</p>
              </div>
            )}
          </Card>

          {/* Transaction Info */}
          {payout.txHash && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Transaction Details
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transaction Hash:</span>
                  <a
                    href={`https://flare-explorer.flare.network/tx/${payout.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-blue-600 hover:text-blue-700 break-all"
                  >
                    {payout.txHash}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Timestamp:</span>
                  <span className="text-sm text-gray-900">
                    {formattedDate} at {formattedTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  {payout.completed ? (
                    <Badge variant="success">Completed</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </Layout>
    </WalletGuard>
  );
}
