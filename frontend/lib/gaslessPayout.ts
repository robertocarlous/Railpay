/**
 * Gasless USDT0 Batch Payout Client
 * Handles EIP-712 signing and communication with relayer
 * Based on: https://dev.flare.network/network/guides/gasless-usdt0-transfers
 */

import { ethers } from "ethers";

const EIP712_DOMAIN_VERSION = "1";
const SIGNATURE_VALIDITY_PERIOD_SECONDS = 3600; // 1 hour
const USD0_DECIMALS = 6; // USDT0 uses 6 decimals

interface AuthorizationPayload {
  from: string;
  to: string;
  value: string;
  validAfter: number;
  validBefore: number;
  nonce: string;
}

interface Authorization {
  payload: AuthorizationPayload;
  v: number;
  r: string;
  s: string;
}

interface BatchPayoutRequest {
  recipients: string[];
  amounts: string[]; // In USDT0 (e.g., "100.5")
  payoutRef: string;
}

/**
 * Get USDT0 contract address from environment
 */
export function getUSDT0Address(): string {
  return (
    process.env.NEXT_PUBLIC_USDT0_ADDRESS ||
    "0xe7cd86e13AC4309349F30B3435a9d337750fC82D" // Flare Mainnet USDT0 address
  );
}

/**
 * Get relayer URL from environment
 */
export function getRelayerURL(): string {
  return (
    process.env.NEXT_PUBLIC_RELAYER_URL ||
    "http://localhost:3000"
  );
}

/**
 * Create EIP-712 signature for transferWithAuthorization
 */
export async function createAuthorization(
  signer: ethers.Signer,
  from: string,
  to: string,
  amount: string,
  usdt0Address: string
): Promise<Authorization> {
  const provider = signer.provider;
  if (!provider) {
    throw new Error("Provider required");
  }

  // Get network and token name
  const [network, tokenName] = await Promise.all([
    provider.getNetwork(),
    new ethers.Contract(
      usdt0Address,
      [{ name: "name", type: "function", inputs: [], outputs: [{ type: "string" }] }],
      provider
    ).name(),
  ]);

  // EIP-712 Domain
  const domain = {
    name: tokenName,
    version: EIP712_DOMAIN_VERSION,
    chainId: Number(network.chainId),
    verifyingContract: usdt0Address,
  };

  // EIP-712 Types
  const types = {
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  };

  // Build message
  const nowSeconds = Math.floor(Date.now() / 1000);
  const message = {
    from,
    to,
    value: ethers.parseUnits(amount, USD0_DECIMALS).toString(),
    validAfter: nowSeconds,
    validBefore: nowSeconds + SIGNATURE_VALIDITY_PERIOD_SECONDS,
    nonce: ethers.hexlify(ethers.randomBytes(32)),
  };

  // Sign typed data
  const signature = await signer.signTypedData(domain, types, message);
  const { v, r, s } = ethers.Signature.from(signature);

  return {
    payload: {
      from: message.from,
      to: message.to,
      value: message.value,
      validAfter: message.validAfter,
      validBefore: message.validBefore,
      nonce: message.nonce,
    },
    v,
    r,
    s,
  };
}

/**
 * Execute gasless batch payout
 */
export async function executeGaslessBatchPayout(
  signer: ethers.Signer,
  request: BatchPayoutRequest
): Promise<{
  success: boolean;
  payoutId: string | null;
  transactionHashes: string[];
}> {
  const from = await signer.getAddress();
  const usdt0Address = getUSDT0Address();
  const relayerURL = getRelayerURL();

  // Create authorizations for all recipients
  const authorizations: Authorization[] = [];
  
  for (let i = 0; i < request.recipients.length; i++) {
    const auth = await createAuthorization(
      signer,
      from,
      request.recipients[i],
      request.amounts[i],
      usdt0Address
    );
    authorizations.push(auth);
  }

  // Send to relayer
  const response = await fetch(`${relayerURL}/relay-batch-payout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorizations,
      payoutRef: request.payoutRef,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `Relayer request failed with status: ${response.status}`,
    }));
    throw new Error(error.error || "Relayer request failed");
  }

  return response.json();
}

/**
 * Hook for React components to use gasless batch payout
 */
export function useGaslessBatchPayout() {
  return {
    executeGaslessBatchPayout,
    createAuthorization,
  };
}
