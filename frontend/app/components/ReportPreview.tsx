"use client";

import { useState } from "react";
import { PayoutData } from "@/lib/usePayouts";
import { formatUSDT0 } from "@/lib/contractInteractions";
import {
  generateCSV,
  generateDetailedCSV,
  generateJSON,
  generateSummaryJSON,
  generateHTMLReport,
  downloadCSVReport,
  downloadJSONReport,
  downloadPDFReport,
  downloadHTMLReport,
} from "@/lib/reportUtils";
import { toast } from "react-toastify";

interface ReportPreviewProps {
  payouts: PayoutData[];
  isOpen: boolean;
  onClose: () => void;
}

type PreviewFormat = "summary-csv" | "detailed-csv" | "json" | "html";

export default function ReportPreview({ payouts, isOpen, onClose }: ReportPreviewProps) {
  const [activeFormat, setActiveFormat] = useState<PreviewFormat>("summary-csv");
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      setIsExporting(true);
      
      switch (activeFormat) {
        case "summary-csv":
          downloadCSVReport(payouts, false);
          toast.success("Summary CSV downloaded!");
          break;
        case "detailed-csv":
          downloadCSVReport(payouts, true);
          toast.success("Detailed CSV downloaded!");
          break;
        case "json":
          downloadJSONReport(payouts, true);
          toast.success("JSON report downloaded!");
          break;
        case "html":
          downloadHTMLReport(payouts);
          toast.success("HTML report downloaded!");
          break;
      }
    } catch (error: any) {
      toast.error(`Download failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    downloadPDFReport(payouts);
    toast.info("Print dialog opened");
  };

  const getPreviewContent = () => {
    switch (activeFormat) {
      case "summary-csv":
        return (
          <div className="font-mono text-xs overflow-auto max-h-[500px]">
            <pre className="whitespace-pre">{generateCSV(payouts)}</pre>
          </div>
        );
      
      case "detailed-csv":
        return (
          <div className="font-mono text-xs overflow-auto max-h-[500px]">
            <pre className="whitespace-pre">{generateDetailedCSV(payouts)}</pre>
          </div>
        );
      
      case "json":
        const jsonData = generateSummaryJSON(payouts);
        return (
          <div className="font-mono text-xs overflow-auto max-h-[500px]">
            <pre className="whitespace-pre text-gray-800">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        );
      
      case "html":
        return (
          <div className="overflow-auto max-h-[500px]">
            <iframe
              srcDoc={generateHTMLReport(payouts)}
              className="w-full h-[500px] border-0 bg-white"
              title="HTML Report Preview"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const formats = [
    { id: "summary-csv" as const, name: "Summary CSV", icon: "📊" },
    { id: "detailed-csv" as const, name: "Detailed CSV", icon: "📋" },
    { id: "json" as const, name: "JSON", icon: "🔧" },
    { id: "html" as const, name: "HTML", icon: "🌐" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Report Preview</h2>
            <p className="text-sm text-gray-600 mt-1">
              {payouts.length} payout{payouts.length !== 1 ? "s" : ""} • Preview before downloading
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Format Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setActiveFormat(format.id)}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
                activeFormat === format.id
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{format.icon}</span>
              {format.name}
            </button>
          ))}
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6 bg-gray-50 h-full">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full overflow-hidden">
              {getPreviewContent()}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {activeFormat === "summary-csv" && "High-level payout overview"}
              {activeFormat === "detailed-csv" && "Individual recipient breakdown"}
              {activeFormat === "json" && "Complete data with summary"}
              {activeFormat === "html" && "Formatted report for viewing"}
            </span>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            
            {activeFormat === "html" && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print PDF</span>
              </button>
            )}
            
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download {formats.find(f => f.id === activeFormat)?.name}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}