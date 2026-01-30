/**
 * Contract Interaction Utilities
 * Helper functions for contract interactions
 * Use with wagmi hooks: useWriteContract, useReadContract, etc.
 */

import { parseUnits, formatUnits } from "viem";
import { batchPayoutContract, batchPayoutABI } from "./contracts";

/**
 * Get USDT0 contract address from environment
 */
export function getUSDT0Address(): `0x${string}` {
  const address = process.env.NEXT_PUBLIC_USDT0_ADDRESS;
  if (!address) {
    throw new Error("NEXT_PUBLIC_USDT0_ADDRESS is not set in environment variables");
  }
  if (!address.startsWith("0x") || address.length !== 42) {
    throw new Error("Invalid USDT0 address format");
  }
  return address as `0x${string}`;
}

/**
 * USDT0 ABI for approve and balance checks
 */
export const USDT0_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Convert USDT0 amount to wei (6 decimals)
 */
export function parseUSDT0(amount: string): bigint {
  return parseUnits(amount, 6);
}

/**
 * Convert wei to USDT0 amount (6 decimals)
 */
export function formatUSDT0(amount: bigint): string {
  return formatUnits(amount, 6);
}

/**
 * Get contract configuration for approve
 */
export function getApproveConfig(amount: string) {
  const usdt0Address = getUSDT0Address();
  const amountWei = parseUSDT0(amount);

  return {
    address: usdt0Address,
    abi: USDT0_ABI,
    functionName: "approve" as const,
    args: [batchPayoutContract.address, amountWei] as const,
  };
}

/**
 * Get contract configuration for batch payout
 */
export function getBatchPayoutConfig(
  recipients: `0x${string}`[],
  amounts: string[],
  payoutRef: string
) {
  const amountsWei = amounts.map((amount) => parseUSDT0(amount));

  return {
    address: batchPayoutContract.address,
    abi: batchPayoutABI,
    functionName: "batchPayout" as const,
    args: [recipients, amountsWei, payoutRef] as const,
  };
}

/**
 * Get contract configuration for reading payout
 */
export function getPayoutConfig(payoutId: bigint) {
  return {
    address: batchPayoutContract.address,
    abi: batchPayoutABI,
    functionName: "getPayout" as const,
    args: [payoutId] as const,
  };
}

/**
 * Get contract configuration for reading payout recipients
 */
export function getPayoutRecipientsConfig(payoutId: bigint) {
  return {
    address: batchPayoutContract.address,
    abi: batchPayoutABI,
    functionName: "getPayoutRecipients" as const,
    args: [payoutId] as const,
  };
}

/**
 * Get contract configuration for reading recipient history
 */
export function getRecipientHistoryConfig(recipient: `0x${string}`) {
  return {
    address: batchPayoutContract.address,
    abi: batchPayoutABI,
    functionName: "getRecipientHistory" as const,
    args: [recipient] as const,
  };
}

/**
 * Get contract configuration for USDT0 allowance
 */
export function getAllowanceConfig(owner: `0x${string}`) {
  const usdt0Address = getUSDT0Address();

  return {
    address: usdt0Address,
    abi: USDT0_ABI,
    functionName: "allowance" as const,
    args: [owner, batchPayoutContract.address] as const,
  };
}

/**
 * Get contract configuration for USDT0 balance
 */
export function getBalanceConfig(address: `0x${string}`) {
  const usdt0Address = getUSDT0Address();

  return {
    address: usdt0Address,
    abi: USDT0_ABI,
    functionName: "balanceOf" as const,
    args: [address] as const,
  };
}
