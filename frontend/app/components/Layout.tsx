"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { toast } from "react-toastify";

interface LayoutProps {
  children: React.ReactNode;
  variant?: "admin" | "recipient";
}

export default function Layout({ children, variant = "admin" }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  // Flare Testnet Chain ID is 114
  const FLARE_TESTNET_CHAIN_ID = 114;

  useEffect(() => {
    // Check if wallet is connected and on correct network
    if (pathname !== "/" && !pathname.startsWith("/admin") && !pathname.startsWith("/recipient")) {
      return;
    }

    if (pathname !== "/") {
      if (!isConnected) {
        toast.error("Please connect your wallet to continue");
        router.push("/");
        return;
      }

      if (chainId !== FLARE_TESTNET_CHAIN_ID) {
        toast.error("Please switch to Flare Testnet network");
      }
    }
  }, [isConnected, chainId, pathname, router]);

  const adminNav = [
    { name: "Dashboard", href: "/admin" },
    { name: "New Payout", href: "/admin/payouts/new" },
    { name: "Payout History", href: "/admin/payouts" },
    { name: "Reports", href: "/admin/reports" },
  ];

  const recipientNav = [
    { name: "My Payments", href: "/recipient" },
    { name: "Download Records", href: "/recipient/downloads" },
  ];

  const navItems = variant === "admin" ? adminNav : recipientNav;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-green-700 bg-clip-text text-transparent">
                  Railpay
                </h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <ConnectButton
                  chainStatus="icon"
                  showBalance={false}
                />
              </div>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="px-4 py-2">
                <ConnectButton chainStatus="icon" showBalance={false} />
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Network Warning */}
      {isConnected && chainId !== FLARE_TESTNET_CHAIN_ID && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-amber-800">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">
                Please switch to Flare Testnet to use this application
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
