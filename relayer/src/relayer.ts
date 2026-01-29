/**
 * Railpay Relayer Service
 * Handles gasless USDT0 batch payouts using EIP-3009 transferWithAuthorization
 * Based on: https://dev.flare.network/network/guides/gasless-usdt0-transfers
 */

import express, { Request, Response } from "express";
import cors from "cors";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Environment variables
const FLARE_RPC_URL = process.env.FLARE_RPC_URL || "https://coston2-api.flare.network/ext/C/rpc";
const USD0_ADDRESS = process.env.USD0_ADDRESS || ""; // USDT0 contract address
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || "";
const BATCH_PAYOUT_CONTRACT = process.env.BATCH_PAYOUT_CONTRACT || ""; // GaslessBatchPayout contract
const PORT = parseInt(process.env.PORT || "3000", 10);

if (!RELAYER_PRIVATE_KEY) {
  throw new Error("RELAYER_PRIVATE_KEY is required");
}
if (!USD0_ADDRESS) {
  throw new Error("USD0_ADDRESS is required");
}

// USDT0 ABI (minimal - only what we need)
const USD0_ABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "validAfter", type: "uint256" },
      { internalType: "uint256", name: "validBefore", type: "uint256" },
      { internalType: "bytes32", name: "nonce", type: "bytes32" },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "transferWithAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// GaslessBatchPayout ABI
const BATCH_PAYOUT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "initiator", type: "address" },
      { internalType: "address[]", name: "recipients", type: "address[]" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
      { internalType: "bytes32[]", name: "nonces", type: "bytes32[]" },
      { internalType: "string", name: "payoutRef", type: "string" },
    ],
    name: "recordBatchPayout",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider(FLARE_RPC_URL);
const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
const usd0Contract = new ethers.Contract(USD0_ADDRESS, USD0_ABI, wallet);
const batchPayoutContract = BATCH_PAYOUT_CONTRACT
  ? new ethers.Contract(BATCH_PAYOUT_CONTRACT, BATCH_PAYOUT_ABI, wallet)
  : null;

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Railpay Relayer",
    relayerAddress: wallet.address,
    network: "Flare Testnet",
  });
});

// Relay batch payout
interface AuthorizationPayload {
  from: string;
  to: string;
  value: string;
  validAfter: number;
  validBefore: number;
  nonce: string;
}

interface BatchRelayRequest {
  authorizations: Array<{
    payload: AuthorizationPayload;
    v: number;
    r: string;
    s: string;
  }>;
  payoutRef: string;
}

app.post("/relay-batch-payout", async (req: Request, res: Response) => {
  try {
    const { authorizations, payoutRef }: BatchRelayRequest = req.body;

    if (!authorizations || authorizations.length === 0) {
      return res.status(400).json({ error: "No authorizations provided" });
    }

    const initiator = authorizations[0].payload.from;
    const recipients: string[] = [];
    const amounts: bigint[] = [];
    const nonces: string[] = [];

    // Execute all transferWithAuthorization calls
    const txPromises = authorizations.map(async (auth) => {
      const { payload, v, r, s } = auth;
      
      // Validate timestamp
      const now = Math.floor(Date.now() / 1000);
      if (now < payload.validAfter || now > payload.validBefore) {
        throw new Error(`Authorization expired or not yet valid. Now: ${now}, Valid: ${payload.validAfter}-${payload.validBefore}`);
      }

      // Reconstruct signature
      const signature = ethers.Signature.from({ v, r, s }).serialized;

      // Execute transferWithAuthorization
      const tx = await usd0Contract.transferWithAuthorization(
        payload.from,
        payload.to,
        payload.value,
        payload.validAfter,
        payload.validBefore,
        payload.nonce,
        signature
      );

      // Wait for confirmation
      const receipt = await tx.wait();

      // Store data for contract recording
      recipients.push(payload.to);
      amounts.push(BigInt(payload.value));
      nonces.push(payload.nonce);

      return receipt;
    });

    // Execute all transfers
    const receipts = await Promise.all(txPromises);

    // Record payout in contract if available
    let payoutId: bigint | null = null;
    if (batchPayoutContract) {
      try {
        const recordTx = await batchPayoutContract.recordBatchPayout(
          initiator,
          recipients,
          amounts,
          nonces,
          payoutRef
        );
        const recordReceipt = await recordTx.wait();
        // Extract payoutId from events if available
        payoutId = BigInt(0); // You'd parse this from events
      } catch (error) {
        console.error("Failed to record payout in contract:", error);
        // Continue even if contract recording fails
      }
    }

    // Return success with transaction hashes
    res.json({
      success: true,
      payoutId: payoutId?.toString() || null,
      transactionHashes: receipts.map((r) => r.hash),
      recipients,
      amounts: amounts.map((a) => a.toString()),
    });
  } catch (error: any) {
    console.error("Relay error:", error);
    res.status(500).json({
      error: error.message || "Failed to relay batch payout",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Railpay Relayer running on port ${PORT}`);
  console.log(`📍 Relayer address: ${wallet.address}`);
  console.log(`🌐 Network: ${FLARE_RPC_URL}`);
  console.log(`💵 USDT0 Contract: ${USD0_ADDRESS}`);
  if (batchPayoutContract) {
    console.log(`📝 BatchPayout Contract: ${BATCH_PAYOUT_CONTRACT}`);
  }
});
