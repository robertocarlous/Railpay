/**
 * ProofRails API Client
 * Integrates with ProofRails middleware for ISO 20022 payment receipts
 * API: https://middleware-iso20022-v13-production-5084.up.railway.app
 */

const PROOFRAILS_API_URL =
  process.env.NEXT_PUBLIC_PROOFRAILS_API_URL ||
  "https://middleware-iso20022-v13-production-5084.up.railway.app";

export interface ProofRailsRecordTipRequest {
  tip_tx_hash: string;
  chain: "coston2" | "flare";
  amount: string;
  currency: string;
  sender_wallet: string;
  receiver_wallet: string;
  reference: string;
  callback_url?: string;
}

export interface ProofRailsRecordTipResponse {
  receipt_id: string;
  status: "pending" | "anchored" | "failed";
  bundle_url?: string;
  receipt_url?: string;
}

export interface ProofRailsReceipt {
  receipt_id: string;
  status: "pending" | "anchored" | "failed";
  tip_tx_hash: string;
  chain: string;
  amount: string;
  currency: string;
  sender_wallet: string;
  receiver_wallet: string;
  reference: string;
  bundle_url?: string;
  receipt_url?: string;
  created_at: string;
  anchored_at?: string;
}

/**
 * Record a payment tip with ProofRails
 * This should be called after a successful batch payout transaction
 */
export async function recordProofRailsTip(
  request: ProofRailsRecordTipRequest,
  apiKey?: string
): Promise<ProofRailsRecordTipResponse> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch(`${PROOFRAILS_API_URL}/v1/iso/record-tip`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ProofRails API error: ${error}`);
  }

  return response.json();
}

/**
 * Get receipt details from ProofRails
 */
export async function getProofRailsReceipt(
  receiptId: string,
  apiKey?: string
): Promise<ProofRailsReceipt> {
  const headers: HeadersInit = {};

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch(
    `${PROOFRAILS_API_URL}/v1/iso/receipts/${receiptId}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ProofRails API error: ${error}`);
  }

  return response.json();
}

/**
 * Verify a ProofRails bundle
 */
export async function verifyProofRailsBundle(
  bundleUrl: string,
  apiKey?: string
): Promise<{ matches_onchain: boolean; verified: boolean }> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch(`${PROOFRAILS_API_URL}/v1/iso/verify`, {
    method: "POST",
    headers,
    body: JSON.stringify({ bundle_url: bundleUrl }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ProofRails API error: ${error}`);
  }

  return response.json();
}

/**
 * Record batch payout with ProofRails
 * Creates individual receipts for each recipient in the batch
 */
export async function recordBatchPayoutToProofRails(
  txHash: string,
  initiator: string,
  recipients: string[],
  amounts: string[],
  currency: string,
  reference: string,
  apiKey?: string
): Promise<ProofRailsRecordTipResponse[]> {
  const receipts: ProofRailsRecordTipResponse[] = [];

  for (let i = 0; i < recipients.length; i++) {
    try {
      const receipt = await recordProofRailsTip(
        {
          tip_tx_hash: txHash,
          chain: "coston2",
          amount: amounts[i],
          currency: currency,
          sender_wallet: initiator,
          receiver_wallet: recipients[i],
          reference: `${reference}:recipient:${i}`,
        },
        apiKey
      );
      receipts.push(receipt);
    } catch (error) {
      console.error(`Failed to record ProofRails receipt for recipient ${i}:`, error);
      // Continue with other recipients even if one fails
    }
  }

  return receipts;
}
