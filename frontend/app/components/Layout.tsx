"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, useChainId } from "wagmi";
import { toast } from "react-toastify";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  variant?: "admin" | "recipient";
}

export default function Layout({ children, variant = "admin" }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected } = useAccount();
  const chainId = useChainId();

  // Flare Testnet (Coston2) Chain ID is 114
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
        toast.error("Please switch to Flare Testnet (Coston2) network");
      }
    }
  }, [isConnected, chainId, pathname, router]);

  // Check if we should show sidebar (admin or recipient pages)
  const showSidebar = pathname.startsWith("/admin") || pathname.startsWith("/recipient");

  return (
    <div className="min-h-screen bg-gray-50">
      {showSidebar && <Sidebar variant={variant} />}
      
      {/* Main Content */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          showSidebar ? "ml-64" : ""
        }`}
      >
        {/* Top Header for pages with sidebar */}
        {showSidebar && (
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  {/* Page title will be rendered by individual pages */}
                </div>
                <div className="flex items-center space-x-4">
                  {/* Network indicator */}
                  {isConnected && chainId === FLARE_TESTNET_CHAIN_ID && (
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-green-700">
                        Coston2
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <div className={showSidebar ? "p-6" : ""}>
          {children}
        </div>
      </main>
    </div>
  );
}