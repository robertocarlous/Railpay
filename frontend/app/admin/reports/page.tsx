"use client";

import { useMemo, useState } from "react";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Button from "../../components/Button";
import WalletGuard from "../../components/WalletGuard";
import { useUserPayouts, calculateStats } from "../../../lib/usePayouts";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatUSDT0 } from "../../../lib/contractInteractions";
import {
  downloadCSVReport,
  downloadJSONReport,
  downloadPDFReport,
  downloadHTMLReport,
} from "../../../lib/reportUtils";
import { toast } from "react-toastify";
import ReportPreview from "../../components/ReportPreview";

export default function Reports() {
  const { payouts, isLoading } = useUserPayouts();
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const stats = useMemo(() => {
    if (isLoading || payouts.length === 0) {
      return {
        totalPayouts: 0,
        totalAmount: "0",
        totalRecipients: 0,
        averagePayout: "0",
        period: "All time",
      };
    }

    const calculated = calculateStats(payouts);
    return {
      totalPayouts: calculated.totalPayouts,
      totalAmount: calculated.totalAmount,
      totalRecipients: calculated.totalRecipients,
      averagePayout: calculated.averagePayout,
      period: "All time",
    };
  }, [payouts, isLoading]);

  // Calculate top recipients
  const topRecipients = useMemo(() => {
    if (!payouts || payouts.length === 0) return [];

    const recipientMap = new Map<string, { amount: bigint; count: number }>();

    payouts.forEach((payout) => {
      payout.recipients?.forEach((recipient) => {
        const address = recipient.recipient.toLowerCase();
        const existing = recipientMap.get(address) || { amount: 0n, count: 0 };
        recipientMap.set(address, {
          amount: existing.amount + recipient.amount,
          count: existing.count + 1,
        });
      });
    });

    return Array.from(recipientMap.entries())
      .map(([address, data]) => ({
        address: address as `0x${string}`,
        amount: formatUSDT0(data.amount),
        count: data.count,
      }))
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 10);
  }, [payouts]);

  // Calculate monthly breakdown
  const monthlyBreakdown = useMemo(() => {
    if (!payouts || payouts.length === 0) return [];

    const monthMap = new Map<string, { payouts: number; amount: bigint; recipients: Set<string> }>();

    payouts.forEach((payout) => {
      const date = new Date(Number(payout.timestamp) * 1000);
      const monthKey = date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
      
      const existing = monthMap.get(monthKey) || {
        payouts: 0,
        amount: 0n,
        recipients: new Set<string>(),
      };

      existing.payouts += 1;
      existing.amount += payout.totalAmount;
      payout.recipients?.forEach((r) => existing.recipients.add(r.recipient.toLowerCase()));

      monthMap.set(monthKey, existing);
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        payouts: data.payouts,
        amount: formatUSDT0(data.amount),
        recipients: data.recipients.size,
      }))
      .sort((a, b) => {
        // Sort by date descending
        return new Date(b.month).getTime() - new Date(a.month).getTime();
      })
      .slice(0, 12); // Last 12 months
  }, [payouts]);

  // Export handlers
  const handleExportCSV = (detailed: boolean = false) => {
    try {
      setIsExporting(true);
      downloadCSVReport(payouts, detailed);
      toast.success(`CSV report downloaded successfully!`);
    } catch (error: any) {
      toast.error(`Failed to export CSV: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    try {
      setIsExporting(true);
      downloadJSONReport(payouts, true);
      toast.success("JSON report downloaded successfully!");
    } catch (error: any) {
      toast.error(`Failed to export JSON: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      downloadPDFReport(payouts);
      toast.info("Print dialog opened. Save as PDF from the print menu.");
    } catch (error: any) {
      toast.error(`Failed to export PDF: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHTML = () => {
    try {
      setIsExporting(true);
      downloadHTMLReport(payouts);
      toast.success("HTML report downloaded successfully!");
    } catch (error: any) {
      toast.error(`Failed to export HTML: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateFullReport = () => {
    try {
      setIsExporting(true);
      // Generate all formats
      downloadCSVReport(payouts, true); // Detailed CSV
      downloadJSONReport(payouts, true);
      downloadHTMLReport(payouts);
      toast.success("Full report package downloaded successfully!");
    } catch (error: any) {
      toast.error(`Failed to generate full report: ${error.message}`);
    } finally {
      setIsExporting(false);
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
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="mt-2 text-gray-600">
                Comprehensive payout analytics and insights
              </p>
            </div>
            <Button 
              variant="primary" 
              size="lg" 
              disabled={payouts.length === 0}
              onClick={() => setShowPreview(true)}
            >
              👁️ Preview & Download
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card padding="lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.totalPayouts}
                </p>
                <p className="mt-1 text-sm text-gray-500">{stats.period}</p>
              </div>
            </Card>
            <Card padding="lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.totalAmount}
                </p>
                <p className="mt-1 text-sm text-gray-500 font-mono">USDT0</p>
              </div>
            </Card>
            <Card padding="lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.totalRecipients.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-gray-500">Unique addresses</p>
              </div>
            </Card>
            <Card padding="lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Payout</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.averagePayout}
                </p>
                <p className="mt-1 text-sm text-gray-500 font-mono">USDT0</p>
              </div>
            </Card>
          </div>

          {/* Monthly Breakdown */}
          {monthlyBreakdown.length > 0 ? (
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
          ) : (
            <Card>
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">No data available</p>
                <p className="text-sm">Create payouts to see monthly breakdown</p>
              </div>
            </Card>
          )}

          {/* Top Recipients */}
          {topRecipients.length > 0 ? (
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
                          {recipient.count} payment{recipient.count !== 1 ? "s" : ""}
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
          ) : (
            <Card>
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">No recipients yet</p>
                <p className="text-sm">Create payouts to see top recipients</p>
              </div>
            </Card>
          )}

          {/* Export Options */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Export Options
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Preview your reports before downloading in various formats for accounting and
              compliance purposes.
            </p>
            
            {/* Primary Preview Button */}
            <div className="mb-6">
              <Button 
                variant="primary" 
                size="lg"
                disabled={payouts.length === 0}
                onClick={() => setShowPreview(true)}
                className="w-full sm:w-auto"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview & Download Report</span>
                </span>
              </Button>
            </div>

            {/* Quick Download Options */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Downloads (No Preview)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  disabled={payouts.length === 0 || isExporting}
                  onClick={() => handleExportCSV(false)}
                  isLoading={isExporting}
                >
                  📊 Summary CSV
                </Button>
                <Button 
                  variant="outline" 
                  disabled={payouts.length === 0 || isExporting}
                  onClick={() => handleExportCSV(true)}
                  isLoading={isExporting}
                >
                  📋 Detailed CSV
                </Button>
                <Button 
                  variant="outline" 
                  disabled={payouts.length === 0 || isExporting}
                  onClick={handleExportPDF}
                  isLoading={isExporting}
                >
                  📄 Print PDF
                </Button>
                <Button 
                  variant="outline" 
                  disabled={payouts.length === 0 || isExporting}
                  onClick={handleExportJSON}
                  isLoading={isExporting}
                >
                  🔧 JSON
                </Button>
                <Button 
                  variant="outline" 
                  disabled={payouts.length === 0 || isExporting}
                  onClick={handleExportHTML}
                  isLoading={isExporting}
                >
                  🌐 HTML
                </Button>
                <Button 
                  variant="outline" 
                  disabled={payouts.length === 0 || isExporting}
                  onClick={handleGenerateFullReport}
                  isLoading={isExporting}
                  className="sm:col-span-2 lg:col-span-3"
                >
                  📦 Full Package
                </Button>
              </div>
            </div>
            
            {payouts.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Pro Tip:</h3>
                <p className="text-sm text-blue-800">
                  Use the <strong>Preview & Download</strong> button to see your report before downloading. 
                  You can switch between formats and verify data accuracy.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Preview Modal */}
        <ReportPreview
          payouts={payouts}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      </Layout>
    </WalletGuard>
  );
}