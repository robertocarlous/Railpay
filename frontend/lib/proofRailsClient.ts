/**
 * ProofRails ISO 20022 Client
 * Uses Next.js API proxy to avoid CORS issues
 */

const PROOFRAILS_API_URL = process.env.NEXT_PUBLIC_PROOFRAILS_API_URL || 
  "https://middleware-iso20022-v13-production-5084.up.railway.app";

const PROOFRAILS_API_KEY = process.env.NEXT_PUBLIC_PROOFRAILS_API_KEY;

// Use proxy for server-side requests to avoid CORS
const USE_PROXY = true; // Set to false if ProofRails adds CORS headers

interface RecordTipPayload {
  tip_tx_hash: string;
  chain: "coston2" | "flare";
  amount: string;
  currency: string;
  sender_wallet: string;
  receiver_wallet: string;
  reference: string;
  callback_url?: string;
}

interface RecordTipResponse {
  receipt_id: string;
  status: "pending";
}

export interface Receipt {
  receipt_id: string;
  status: "pending" | "anchored" | "failed";
  tip_tx_hash: string;
  chain: string;
  amount: string;
  currency: string;
  sender_wallet: string;
  receiver_wallet: string;
  reference: string;
  created_at: string;
  updated_at: string;
  flare_txid?: string;
  bundle_hash?: string;
  bundle_url?: string;
  pain001_url?: string;
  pain002_url?: string;
  camt054_url?: string;
}

/**
 * Record a payout transaction with ProofRails
 * 
 * Call this AFTER your blockchain payout succeeds
 */
export async function recordPayoutReceipt(params: {
  txHash: string;
  chain: "coston2" | "flare";
  payoutId: number;
  totalAmount: string;
  recipientCount: number;
  initiator: string;
  currency?: string;
}): Promise<{ receiptId: string; status: string } | null> {
  
  if (!PROOFRAILS_API_KEY) {
    console.warn("⚠️ ProofRails API key not configured - skipping receipt creation");
    return null;
  }

  try {
    const payload: RecordTipPayload = {
      tip_tx_hash: params.txHash,
      chain: params.chain,
      amount: params.totalAmount,
      currency: params.currency || "USDT0",
      sender_wallet: params.initiator,
      receiver_wallet: params.initiator,
      reference: `railpay:payout:${params.payoutId}`,
    };

    console.log("📤 Recording payout receipt with ProofRails:", payload);

    // Use Next.js API proxy to avoid CORS
    const endpoint = USE_PROXY 
      ? '/api/proofrails/record'  // Next.js proxy route
      : `${PROOFRAILS_API_URL}/v1/iso/record-tip`; // Direct (requires CORS)

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Only add API key for direct requests (proxy handles it server-side)
    if (!USE_PROXY) {
      headers['X-API-Key'] = PROOFRAILS_API_KEY;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ ProofRails API error:", response.status, errorText);
      return null;
    }

    const result: RecordTipResponse = await response.json();
    
    console.log("✅ ProofRails receipt created:", result.receipt_id);
    
    return {
      receiptId: result.receipt_id,
      status: result.status,
    };

  } catch (error: any) {
    console.error("❌ Failed to record ProofRails receipt:", error);
    return null;
  }
}

/**
 * Get receipt status and artifacts
 */
export async function getReceipt(receiptId: string): Promise<Receipt | null> {
  if (!PROOFRAILS_API_KEY) {
    console.warn("⚠️ ProofRails API key not configured");
    return null;
  }

  try {
    const response = await fetch(
      `${PROOFRAILS_API_URL}/v1/iso/receipts/${receiptId}`,
      {
        headers: {
          "X-API-Key": PROOFRAILS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("❌ Failed to fetch receipt:", response.status);
      return null;
    }

    const receipt: Receipt = await response.json();
    return receipt;

  } catch (error: any) {
    console.error("❌ Error fetching receipt:", error);
    return null;
  }
}

/**
 * Subscribe to receipt updates via Server-Sent Events (SSE)
 */
export function subscribeToReceipt(
  receiptId: string,
  onUpdate: (receipt: Receipt) => void,
  onError?: (error: Error) => void
): () => void {
  
  const eventSource = new EventSource(
    `${PROOFRAILS_API_URL}/v1/iso/events/${receiptId}`
  );

  eventSource.onmessage = (event) => {
    try {
      const receipt: Receipt = JSON.parse(event.data);
      onUpdate(receipt);
    } catch (error: any) {
      console.error("Failed to parse SSE event:", error);
      onError?.(error);
    }
  };

  eventSource.onerror = (error) => {
    console.error("SSE connection error:", error);
    onError?.(new Error("SSE connection failed"));
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}

/**
 * Verify an evidence bundle
 */
export async function verifyBundle(params: {
  bundleUrl?: string;
  bundleHash?: string;
}): Promise<{ valid: boolean; details?: any } | null> {
  
  try {
    const response = await fetch(`${PROOFRAILS_API_URL}/v1/iso/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error("❌ Verification failed:", response.status);
      return null;
    }

    return await response.json();

  } catch (error: any) {
    console.error("❌ Error verifying bundle:", error);
    return null;
  }
}

/**
 * Get receipt page URL
 */
export function getReceiptPageUrl(receiptId: string): string {
  return `${PROOFRAILS_API_URL}/receipt/${receiptId}`;
}

/**
 * Get embeddable receipt widget URL
 */
export function getReceiptWidgetUrl(
  receiptId: string,
  theme: "light" | "dark" = "light"
): string {
  return `${PROOFRAILS_API_URL}/embed/receipt?rid=${receiptId}&theme=${theme}`;
}

/**
 * Helper to get chain name for ProofRails API
 */
export function getChainForProofRails(chainId: number): "coston2" | "flare" {
  if (chainId === 114) return "coston2";
  if (chainId === 14) return "flare";
  
  console.warn(`Unknown chain ID ${chainId}, defaulting to coston2`);
  return "coston2";
}