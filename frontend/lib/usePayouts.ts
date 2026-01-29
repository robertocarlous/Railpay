/**
 * Custom hook to fetch payout data from the contract using event logs
 */

import { useReadContract, usePublicClient } from "wagmi";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { batchPayoutContract, batchPayoutABI } from "./contracts";
import { getPayoutConfig, getPayoutRecipientsConfig, formatUSDT0 } from "./contractInteractions";
import { formatUnits } from "viem";

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
  }>;
  txHash?: `0x${string}`;
  date?: string;
}

/**
 * Hook to get payout count from contract
 */
export function usePayoutCount() {
  const { data: count, isLoading, error } = useReadContract({
    address: batchPayoutContract.address,
    abi: batchPayoutABI,
    functionName: "getPayoutCount",
  });

  return {
    count: count ? Number(count) : 0,
    isLoading,
    error,
  };
}

/**
 * Hook to get all payouts by fetching event logs
 */
export function useAllPayouts() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { count } = usePayoutCount();

  useEffect(() => {
    async function fetchPayouts() {
      if (!publicClient) {
        setIsLoading(false);
        return;
      }

      try {
        // Get all PayoutCreated events using the ABI from the contract
        const payoutCreatedEvent = batchPayoutABI.find(
          (item: any) => item.type === "event" && item.name === "PayoutCreated"
        );

        if (!payoutCreatedEvent) {
          console.error("PayoutCreated event not found in ABI");
          setIsLoading(false);
          return;
        }

        const events = await publicClient.getLogs({
          address: batchPayoutContract.address,
          event: payoutCreatedEvent as any,
          fromBlock: 0n,
        });

        // Fetch payout details for each event
        const payoutPromises = events.map(async (event) => {
          const payoutId = event.args.payoutId as bigint;
          if (!payoutId) return null;

          try {
            const payoutData = await publicClient.readContract({
              address: batchPayoutContract.address,
              abi: batchPayoutABI,
              functionName: "getPayout",
              args: [payoutId],
            });

            const recipients = await publicClient.readContract({
              address: batchPayoutContract.address,
              abi: batchPayoutABI,
              functionName: "getPayoutRecipients",
              args: [payoutId],
            });

            const date = new Date(Number((payoutData as any).timestamp) * 1000);

            return {
              payoutId,
              initiator: (payoutData as any).initiator,
              totalAmount: (payoutData as any).totalAmount,
              recipientCount: (payoutData as any).recipientCount,
              timestamp: (payoutData as any).timestamp,
              completed: (payoutData as any).completed,
              proofRailsId: (payoutData as any).proofRailsId,
              recipients: recipients as any,
              txHash: event.transactionHash,
              date: date.toISOString().split("T")[0],
            } as PayoutData;
          } catch (error) {
            console.error(`Error fetching payout ${payoutId}:`, error);
            return null;
          }
        });

        const fetchedPayouts = (await Promise.all(payoutPromises)).filter(
          (p): p is PayoutData => p !== null
        );

        // Sort by payout ID descending (newest first)
        fetchedPayouts.sort((a, b) => Number(b.payoutId - a.payoutId));

        setPayouts(fetchedPayouts);
      } catch (error) {
        console.error("Error fetching payouts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPayouts();
  }, [publicClient, count]);

  return {
    payouts,
    isLoading,
    refetch: () => {
      setIsLoading(true);
      // Trigger re-fetch by updating a dependency
    },
  };
}

/**
 * Hook to get payouts filtered by initiator (current user)
 */
export function useUserPayouts() {
  const { address } = useAccount();
  const { payouts, isLoading } = useAllPayouts();

  const userPayouts = address
    ? payouts.filter((p) => p.initiator.toLowerCase() === address.toLowerCase())
    : [];

  return {
    payouts: userPayouts,
    isLoading,
  };
}

/**
 * Hook to get a single payout by ID
 */
export function usePayout(payoutId: bigint | null) {
  const { data: payoutData, isLoading, error } = useReadContract({
    ...getPayoutConfig(payoutId || 0n),
    query: {
      enabled: payoutId !== null,
    },
  });

  const { data: recipients } = useReadContract({
    ...getPayoutRecipientsConfig(payoutId || 0n),
    query: {
      enabled: payoutId !== null,
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
 * Calculate stats from payout data
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
