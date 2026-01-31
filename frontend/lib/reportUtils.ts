/**
 * Report Generation Utilities
 * Functions to export payout data in various formats (CSV, JSON, PDF)
 */

import { PayoutData } from "./usePayouts";
import { formatUSDT0 } from "./contractInteractions";

/**
 * Convert payouts data to CSV format
 */
export function generateCSV(payouts: PayoutData[]): string {
  // CSV Headers
  const headers = [
    "Payout ID",
    "Date",
    "Time",
    "Initiator",
    "Total Amount (USDT0)",
    "Recipients Count",
    "Status",
    "Transaction Hash",
    "ProofRails ID",
  ].join(",");

  // CSV Rows
  const rows = payouts.map((payout) => {
    const date = new Date(Number(payout.timestamp) * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return [
      payout.payoutId.toString(),
      dateStr,
      timeStr,
      payout.initiator,
      formatUSDT0(payout.totalAmount),
      payout.recipientCount.toString(),
      payout.completed ? "Completed" : "Pending",
      payout.txHash || "",
      payout.proofRailsId || "",
    ]
      .map((field) => `"${field}"`) // Quote fields to handle commas
      .join(",");
  });

  return [headers, ...rows].join("\n");
}

/**
 * Generate detailed CSV with recipient breakdown
 */
export function generateDetailedCSV(payouts: PayoutData[]): string {
  const headers = [
    "Payout ID",
    "Date",
    "Initiator",
    "Recipient Address",
    "Amount (USDT0)",
    "Status",
    "Transaction Hash",
  ].join(",");

  const rows: string[] = [];

  payouts.forEach((payout) => {
    const date = new Date(Number(payout.timestamp) * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const status = payout.completed ? "Completed" : "Pending";

    if (payout.recipients && payout.recipients.length > 0) {
      payout.recipients.forEach((recipient) => {
        rows.push(
          [
            payout.payoutId.toString(),
            dateStr,
            payout.initiator,
            recipient.recipient,
            formatUSDT0(recipient.amount),
            status,
            payout.txHash || "",
          ]
            .map((field) => `"${field}"`)
            .join(",")
        );
      });
    } else {
      // If no recipients data, add a single row for the payout
      rows.push(
        [
          payout.payoutId.toString(),
          dateStr,
          payout.initiator,
          "",
          formatUSDT0(payout.totalAmount),
          status,
          payout.txHash || "",
        ]
          .map((field) => `"${field}"`)
          .join(",")
      );
    }
  });

  return [headers, ...rows].join("\n");
}

/**
 * Convert payouts data to JSON format
 */
export function generateJSON(payouts: PayoutData[]): string {
  const data = payouts.map((payout) => ({
    payoutId: payout.payoutId.toString(),
    date: payout.date || new Date(Number(payout.timestamp) * 1000).toISOString(),
    initiator: payout.initiator,
    totalAmount: formatUSDT0(payout.totalAmount),
    recipientCount: Number(payout.recipientCount),
    status: payout.completed ? "completed" : "pending",
    transactionHash: payout.txHash || null,
    proofRailsId: payout.proofRailsId || null,
    recipients: payout.recipients?.map((r) => ({
      address: r.recipient,
      amount: formatUSDT0(r.amount),
    })) || [],
  }));

  return JSON.stringify(data, null, 2);
}

/**
 * Generate summary statistics object
 */
export function generateSummaryJSON(payouts: PayoutData[]) {
  const totalAmount = payouts.reduce((sum, p) => sum + p.totalAmount, 0n);
  const totalRecipients = payouts.reduce((sum, p) => sum + p.recipientCount, 0n);
  const completedPayouts = payouts.filter((p) => p.completed).length;
  const pendingPayouts = payouts.filter((p) => !p.completed).length;

  // Get unique recipients
  const uniqueRecipients = new Set<string>();
  payouts.forEach((payout) => {
    payout.recipients?.forEach((r) => {
      uniqueRecipients.add(r.recipient.toLowerCase());
    });
  });

  // Calculate date range
  const timestamps = payouts.map((p) => Number(p.timestamp));
  const earliestDate = timestamps.length > 0 ? new Date(Math.min(...timestamps) * 1000) : null;
  const latestDate = timestamps.length > 0 ? new Date(Math.max(...timestamps) * 1000) : null;

  return {
    summary: {
      totalPayouts: payouts.length,
      completedPayouts,
      pendingPayouts,
      totalAmount: formatUSDT0(totalAmount),
      totalRecipients: Number(totalRecipients),
      uniqueRecipients: uniqueRecipients.size,
      dateRange: {
        from: earliestDate?.toISOString() || null,
        to: latestDate?.toISOString() || null,
      },
    },
    payouts: payouts.map((payout) => ({
      payoutId: payout.payoutId.toString(),
      date: new Date(Number(payout.timestamp) * 1000).toISOString(),
      initiator: payout.initiator,
      totalAmount: formatUSDT0(payout.totalAmount),
      recipientCount: Number(payout.recipientCount),
      status: payout.completed ? "completed" : "pending",
      transactionHash: payout.txHash || null,
      proofRailsId: payout.proofRailsId || null,
      recipients: payout.recipients?.map((r) => ({
        address: r.recipient,
        amount: formatUSDT0(r.amount),
      })) || [],
    })),
  };
}

/**
 * Download file to user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download CSV report
 */
export function downloadCSVReport(payouts: PayoutData[], detailed: boolean = false) {
  const csv = detailed ? generateDetailedCSV(payouts) : generateCSV(payouts);
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = detailed
    ? `railpay-detailed-report-${timestamp}.csv`
    : `railpay-summary-${timestamp}.csv`;
  
  downloadFile(csv, filename, "text/csv;charset=utf-8;");
}

/**
 * Generate and download JSON report
 */
export function downloadJSONReport(payouts: PayoutData[], withSummary: boolean = true) {
  const json = withSummary 
    ? JSON.stringify(generateSummaryJSON(payouts), null, 2)
    : generateJSON(payouts);
  
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `railpay-report-${timestamp}.json`;
  
  downloadFile(json, filename, "application/json;charset=utf-8;");
}

/**
 * Generate HTML report content
 */
export function generateHTMLReport(payouts: PayoutData[]): string {
  const summary = generateSummaryJSON(payouts);
  const timestamp = new Date().toISOString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Railpay Payout Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #059669 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card p {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      color: #111827;
    }
    .summary-card .unit {
      font-size: 16px;
      color: #6b7280;
      font-weight: normal;
    }
    table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-collapse: collapse;
    }
    thead {
      background: #f3f4f6;
    }
    th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
    }
    tr:hover {
      background: #f9fafb;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .status.completed {
      background: #d1fae5;
      color: #065f46;
    }
    .status.pending {
      background: #fef3c7;
      color: #92400e;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .mono {
      font-family: 'Monaco', 'Courier New', monospace;
    }
    @media print {
      body {
        background: white;
      }
      .summary {
        page-break-inside: avoid;
      }
      table {
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Railpay Payout Report</h1>
    <p>Generated on ${new Date(timestamp).toLocaleString()}</p>
    <p>Period: ${summary.summary.dateRange.from ? new Date(summary.summary.dateRange.from).toLocaleDateString() : 'N/A'} - ${summary.summary.dateRange.to ? new Date(summary.summary.dateRange.to).toLocaleDateString() : 'N/A'}</p>
  </div>

  <div class="summary">
    <div class="summary-card">
      <h3>Total Payouts</h3>
      <p>${summary.summary.totalPayouts}</p>
    </div>
    <div class="summary-card">
      <h3>Total Amount</h3>
      <p class="mono">${summary.summary.totalAmount} <span class="unit">USDT0</span></p>
    </div>
    <div class="summary-card">
      <h3>Total Recipients</h3>
      <p>${summary.summary.totalRecipients}</p>
    </div>
    <div class="summary-card">
      <h3>Unique Recipients</h3>
      <p>${summary.summary.uniqueRecipients}</p>
    </div>
    <div class="summary-card">
      <h3>Completed</h3>
      <p>${summary.summary.completedPayouts}</p>
    </div>
    <div class="summary-card">
      <h3>Pending</h3>
      <p>${summary.summary.pendingPayouts}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Payout ID</th>
        <th>Date</th>
        <th>Recipients</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Transaction</th>
      </tr>
    </thead>
    <tbody>
      ${payouts.map((payout) => {
        const date = new Date(Number(payout.timestamp) * 1000);
        return `
          <tr>
            <td class="mono">#${payout.payoutId.toString()}</td>
            <td>${date.toLocaleDateString()}</td>
            <td>${payout.recipientCount.toString()}</td>
            <td class="mono">${formatUSDT0(payout.totalAmount)} USDT0</td>
            <td>
              <span class="status ${payout.completed ? 'completed' : 'pending'}">
                ${payout.completed ? 'Completed' : 'Pending'}
              </span>
            </td>
            <td class="mono" style="font-size: 12px;">
              ${payout.txHash ? payout.txHash.slice(0, 10) + '...' + payout.txHash.slice(-8) : '—'}
            </td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>This report was generated by Railpay - Batch Payment System on Flare Network</p>
    <p>All amounts are in USDT0 tokens on Coston2 Testnet</p>
  </div>

  <script>
    // Auto-print on load (optional)
    // window.print();
  </script>
</body>
</html>
  `.trim();
}

/**
 * Generate and download PDF report (via print dialog)
 */
export function downloadPDFReport(payouts: PayoutData[]) {
  const html = generateHTMLReport(payouts);
  const timestamp = new Date().toISOString().split("T")[0];
  
  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}

/**
 * Download HTML report file
 */
export function downloadHTMLReport(payouts: PayoutData[]) {
  const html = generateHTMLReport(payouts);
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `railpay-report-${timestamp}.html`;
  
  downloadFile(html, filename, "text/html;charset=utf-8;");
}
