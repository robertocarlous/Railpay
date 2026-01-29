"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAccount, useChainId } from "wagmi";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import Card from "./Card";

interface WalletGuardProps {
  children: React.ReactNode;
}

const FLARE_TESTNET_CHAIN_ID = 114;

export default function WalletGuard({ children }: WalletGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected, isConnecting } = useAccount();
  const chainId = useChainId();

  // Allow access to home page without wallet
  const publicPaths = ["/"];

  useEffect(() => {
    // Skip check for public paths
    if (publicPaths.includes(pathname)) {
      return;
    }

    // Redirect if wallet not connected
    if (!isConnecting && !isConnected) {
      toast.error("Please connect your wallet to continue");
      router.push("/");
      return;
    }

    // Check network
    if (isConnected && chainId !== FLARE_TESTNET_CHAIN_ID) {
      toast.error("Please switch to Flare Testnet network");
    }
  }, [isConnected, isConnecting, chainId, pathname, router]);

  // Show loading while connecting
  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center p-8">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Connecting wallet...</p>
        </Card>
      </div>
    );
  }

  // Block access if wallet not connected (except public paths)
  if (!publicPaths.includes(pathname) && !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center p-8 max-w-md">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Wallet Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access this page. Make sure you're
            connected to Flare Testnet.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </Card>
      </div>
    );
  }

  // Block access if wrong network
  if (isConnected && chainId !== FLARE_TESTNET_CHAIN_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center p-8 max-w-md">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-amber-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Wrong Network
          </h2>
          <p className="text-gray-600 mb-6">
            Please switch to Flare Testnet to use this application.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
