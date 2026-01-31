/**
 * Custom hook to fetch payout data from the contract
 * Fetches ALL payouts directly from contract using getPayoutCount()
 * This ensures all historical data is available regardless of deployment/browser
 */

import { useReadContract, usePublicClient } from "wagmi";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { batchPayoutContract, batchPayoutABI } from "./contracts";
import { getPayoutConfig, getPayoutRecipientsConfig, formatUSDT0 } from "./contractInteractions";

export interface PayoutData {
  payoutId: bigint;
  initiator: `0x${string}`;
  totalAmount: bigint;
  recipientCount: bigint;
  timestamp: bigint;
  completed: boolean;
  proofRailsId: string;
  recipients?: Array<{
    recipient: `0x${string}`;
    amount: bigint;
    payoutId: bigint;
    paid: boolean;
    timestamp: bigint;
  }>;
  txHash?: `0x${string}`;
  date?: string;
}

/**
 * Hook to get total payout count from contract
 * Returns the total number of payouts ever created
 */
export function usePayoutCount() {
  const { data: count, isLoading, error, refetch } = useReadContract({
    address: batchPayoutContract.address,
    abi: batchPayoutABI,
    functionName: "getPayoutCount",
  });

  return {
    count: count ? Number(count) : 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch ALL payouts from contract
 * Uses getPayoutCount() to know how many payouts exist, then fetches each one
 * This is reliable and works across all deployments/browsers
 */
export function useAllPayouts() {
  const publicClient = usePublicClient();
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { count, isLoading: countLoading } = usePayoutCount();

  useEffect(() => {
    async function fetchAllPayouts() {
      // Wait for public client and count
      if (!publicClient || countLoading) {
        return;
      }

      // If no payouts exist, set empty and exit
      if (count === 0) {
        setPayouts([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`📊 Fetching ${count} payouts from contract...`);

        // Payout IDs start from 1, not 0
        // getPayoutCount() returns the next ID to be used, so actual payouts are 1 to count
        const payoutIds = Array.from({ length: count }, (_, i) => BigInt(i + 1));

        // Fetch all payouts in parallel for better performance
        const payoutPromises = payoutIds.map(async (payoutId) => {
          try {
            // Fetch payout details
            const payoutData = await publicClient.readContract({
              address: batchPayoutContract.address,
              abi: batchPayoutABI,
              functionName: "getPayout",
              args: [payoutId],
            }) as any;

            // Fetch recipients for this payout
            const recipients = await publicClient.readContract({
              address: batchPayoutContract.address,
              abi: batchPayoutABI,
              functionName: "getPayoutRecipients",
              args: [payoutId],
            }) as any;

            // Format date
            const date = new Date(Number(payoutData.timestamp) * 1000);

            return {
              payoutId: payoutData.payoutId,
              initiator: payoutData.initiator,
              totalAmount: payoutData.totalAmount,
              recipientCount: payoutData.recipientCount,
              timestamp: payoutData.timestamp,
              completed: payoutData.completed,
              proofRailsId: payoutData.proofRailsId || "",
              recipients: recipients.map((r: any) => ({
                recipient: r.recipient,
                amount: r.amount,
                payoutId: r.payoutId,
                paid: r.paid,
                timestamp: r.timestamp,
              })),
              txHash: undefined, // Not stored in contract
              date: date.toISOString().split("T")[0],
            } as PayoutData;
          } catch (err) {
            console.error(`❌ Error fetching payout ${payoutId}:`, err);
            return null;
          }
        });

        // Wait for all fetches to complete
        const results = await Promise.all(payoutPromises);
        
        // Filter out failed fetches and sort by ID (newest first)
        const validPayouts = results
          .filter((p): p is PayoutData => p !== null)
          .sort((a, b) => Number(b.payoutId - a.payoutId));

        console.log(`✅ Successfully fetched ${validPayouts.length}/${count} payouts`);
        setPayouts(validPayouts);
      } catch (err) {
        console.error("❌ Error fetching payouts:", err);
        setError(err as Error);
        setPayouts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllPayouts();
  }, [publicClient, count, countLoading]);

  return {
    payouts,
    isLoading: isLoading || countLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      // Re-run the effect
    },
  };
}

/**
 * Hook to get payouts filtered by initiator (current user)
 * Shows only payouts created by the connected wallet
 */
export function useUserPayouts() {
  const { address } = useAccount();
  const { payouts, isLoading, error } = useAllPayouts();

  const userPayouts = address
    ? payouts.filter((p) => p.initiator.toLowerCase() === address.toLowerCase())
    : [];

  console.log(`👤 User ${address?.slice(0, 6)}... has ${userPayouts.length} payouts`);

  return {
    payouts: userPayouts,
    isLoading,
    error,
  };
}

/**
 * Hook to get a single payout by ID
 * Fetches payout details and recipients directly from contract
 */
export function usePayout(payoutId: bigint | null) {
  const { data: payoutData, isLoading, error } = useReadContract({
    ...getPayoutConfig(payoutId || 0n),
    query: {
      enabled: payoutId !== null && payoutId > 0n,
    },
  });

  const { data: recipients } = useReadContract({
    ...getPayoutRecipientsConfig(payoutId || 0n),
    query: {
      enabled: payoutId !== null && payoutId > 0n,
    },
  });

  if (!payoutId || !payoutData) {
    return {
      payout: null,
      isLoading: false,
      error: null,
    };
  }

  const date = new Date(Number((payoutData as any).timestamp) * 1000);

  return {
    payout: {
      ...(payoutData as any),
      recipients: recipients || [],
      date: date.toISOString().split("T")[0],
    } as PayoutData,
    isLoading,
    error,
  };
}

/**
 * Calculate statistics from payout data
 * Used for dashboard and reports
 */
export function calculateStats(payouts: PayoutData[]) {
  const totalPayouts = payouts.length;
  const totalAmount = payouts.reduce((sum, p) => sum + p.totalAmount, 0n);
  const totalRecipients = payouts.reduce((sum, p) => sum + p.recipientCount, 0n);
  const pendingPayouts = payouts.filter((p) => !p.completed).length;
  const completedPayouts = payouts.filter((p) => p.completed).length;

  return {
    totalPayouts,
    totalAmount: formatUSDT0(totalAmount),
    totalRecipients: Number(totalRecipients),
    pendingPayouts,
    completedPayouts,
    averagePayout: totalPayouts > 0 ? formatUSDT0(totalAmount / BigInt(totalPayouts)) : "0",
  };
}