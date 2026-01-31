"use client";

import { useParams, useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Badge from "../../../components/Badge";
import WalletGuard from "../../../components/WalletGuard";
import { usePayout } from "../../../../lib/usePayouts";
import { formatUSDT0 } from "../../../../lib/contractInteractions";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ProofRailsReceipt from "../../../components/ProofRailsReceipt";
import { use } from "react";
export default function PayoutDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const payoutId = BigInt(resolvedParams.id);

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
          <Card className="border-red-200 bg-red-50">
            <p className="text-red-700">
              {error ? "Error loading payout" : "Payout not found"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/payouts")}
              className="mt-4"
            >
              ← Back to Payouts
            </Button>
          </Card>
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
              <h1 className="text-3xl font-bold text-gray-900">
                Payout Details
              </h1>
              <p className="mt-2 text-gray-600 font-mono">
                Payout ID: #{payout.payoutId.toString()}
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/admin/payouts")}
            >
              ← Back to Payouts
            </Button>
          </div>

          {/* Payout Overview */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Payout Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                {payout.completed ? (
                  <Badge variant="success">Completed</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-gray-900 font-mono">
                  {formatUSDT0(payout.totalAmount)} USDT0
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recipients</p>
                <p className="text-xl font-bold text-gray-900">
                  {payout.recipientCount.toString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(Number(payout.timestamp) * 1000).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Initiator</p>
                <a
                  href={`https://coston2-explorer.flare.network/address/${payout.initiator}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-blue-600 hover:underline"
                >
                  {payout.initiator}
                </a>
              </div>
            </div>
          </Card>

          {/* ProofRails Receipt */}
          {payout.proofRailsId && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ISO 20022 Compliance Receipt
              </h2>
              <ProofRailsReceipt 
                receiptId={payout.proofRailsId} 
                autoRefresh={true}
              />
            </div>
          )}

          {/* No ProofRails Receipt */}
          {!payout.proofRailsId && (
            <Card className="border-yellow-200 bg-yellow-50">
              <div className="text-center py-8">
                <p className="text-yellow-800 font-medium mb-2">
                  No ISO 20022 receipt available
                </p>
                <p className="text-sm text-yellow-700">
                  This payout was created before ProofRails integration was enabled.
                </p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Recipient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payout.recipients.map((recipient, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={`https://coston2-explorer.flare.network/address/${recipient.recipient}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-blue-600 hover:underline"
                          >
                            {recipient.recipient}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 font-mono">
                            {formatUSDT0(recipient.amount)} USDT0
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {recipient.paid ? (
                            <Badge variant="success">Paid</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recipient details available</p>
              </div>
            )}
          </Card>
        </div>
      </Layout>
    </WalletGuard>
  );
}