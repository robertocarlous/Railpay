# ProofRails Integration Guide

This guide explains how the BatchPayout contract integrates with ProofRails middleware.

## Integration Flow

### 1. Contract Execution Flow

```
User → Frontend → Contract.batchPayout() → Transaction Confirmed → Events Emitted
                                                                    ↓
                                                          Frontend Listens to Events
                                                                    ↓
                                                          Frontend Calls ProofRails API
                                                                    ↓
                                                          ProofRails Returns receipt_id
                                                                    ↓
                                                          Frontend Updates Contract
                                                                    ↓
                                                          Contract.updateProofRailsId()
```

### 2. Contract Events

The contract emits events that contain all necessary data for ProofRails:

#### PayoutCreated Event
```solidity
event PayoutCreated(
    uint256 indexed payoutId,
    address indexed initiator,
    uint256 totalAmount,
    uint256 recipientCount,
    uint256 timestamp,
    string reference,
    address[] recipients,
    uint256[] amounts
);
```

This event contains:
- `payoutId`: Unique payout identifier
- `initiator`: Address that initiated the payout
- `totalAmount`: Total amount paid
- `recipientCount`: Number of recipients
- `timestamp`: Block timestamp
- `reference`: Reference string for ProofRails
- `recipients`: Array of recipient addresses
- `amounts`: Array of amounts per recipient

#### PaymentExecuted Event
```solidity
event PaymentExecuted(
    uint256 indexed payoutId,
    address indexed recipient,
    uint256 amount,
    uint256 timestamp
);
```

Emitted for each individual payment in the batch.

### 3. Frontend Integration

After the transaction is confirmed, the frontend should:

1. **Listen to Contract Events**
   ```typescript
   // Using wagmi/viem
   const { data: events } = useWatchContractEvent({
     address: BATCH_PAYOUT_ADDRESS,
     abi: BatchPayoutABI,
     eventName: 'PayoutCreated',
     onLogs: async (logs) => {
       // Handle event
     }
   });
   ```

2. **Call ProofRails API**
   ```typescript
   import { recordBatchPayoutToProofRails } from '@/lib/proofRailsClient';
   
   // After transaction is confirmed
   const txHash = receipt.transactionHash;
   const receipts = await recordBatchPayoutToProofRails(
     txHash,
     initiatorAddress,
     recipients,
     amounts,
     'USDT0',
     `payout:${payoutId}`
   );
   ```

3. **Update Contract with ProofRails ID**
   ```typescript
   // Update contract with receipt_id from ProofRails
   await writeContract({
     address: BATCH_PAYOUT_ADDRESS,
     abi: BatchPayoutABI,
     functionName: 'updateProofRailsId',
     args: [payoutId, receiptId]
   });
   ```

## ProofRails API Endpoints

Based on the [ProofRails documentation](https://github.com/ESE-MONDAY/Middleware-ISO20022-v1.3/blob/main/SETUP_GUIDE_SOCIAL.md):

### Record Tip (Payment)
```
POST /v1/iso/record-tip
```

**Request Body:**
```json
{
  "tip_tx_hash": "0x...",
  "chain": "coston2",
  "amount": "100.5",
  "currency": "USDT0",
  "sender_wallet": "0x...",
  "receiver_wallet": "0x...",
  "reference": "payout:123:recipient:0",
  "callback_url": "https://your-app.com/callback"
}
```

**Response:**
```json
{
  "receipt_id": "receipt-abc123",
  "status": "pending",
  "bundle_url": "https://...",
  "receipt_url": "https://..."
}
```

### Get Receipt
```
GET /v1/iso/receipts/{receipt_id}
```

### Verify Bundle
```
POST /v1/iso/verify
```

**Request Body:**
```json
{
  "bundle_url": "https://..."
}
```

## Contract Functions

### batchPayout()
```solidity
function batchPayout(
    address[] calldata recipients,
    uint256[] calldata amounts,
    string calldata reference
) external returns (uint256)
```

**Parameters:**
- `recipients`: Array of recipient addresses
- `amounts`: Array of amounts (in USDT0 decimals)
- `reference`: Reference string for ProofRails (e.g., "payout:123")

**Returns:**
- `payoutId`: Unique identifier for this payout

**Events Emitted:**
- `PayoutCreated`: Contains all payout data
- `PaymentExecuted`: For each recipient
- `PayoutCompleted`: When batch is complete

### updateProofRailsId()
```solidity
function updateProofRailsId(
    uint256 payoutId,
    string calldata newProofRailsId
) external
```

**Parameters:**
- `payoutId`: The payout ID to update
- `newProofRailsId`: The receipt_id from ProofRails API

**When to Call:**
- After successfully calling ProofRails API
- When ProofRails returns a receipt_id

## Example Integration

```typescript
// 1. Execute batch payout
const hash = await writeContract({
  address: BATCH_PAYOUT_ADDRESS,
  abi: BatchPayoutABI,
  functionName: 'batchPayout',
  args: [
    recipients,
    amounts,
    `payout:${Date.now()}`
  ]
});

// 2. Wait for transaction confirmation
const receipt = await waitForTransactionReceipt({ hash });

// 3. Call ProofRails API for each recipient
const proofRailsReceipts = await recordBatchPayoutToProofRails(
  receipt.transactionHash,
  account.address,
  recipients,
  amounts.map(a => formatUnits(a, 18)), // Convert to readable format
  'USDT0',
  `payout:${payoutId}`
);

// 4. Update contract with ProofRails receipt IDs
// Store the first receipt_id as the main payout receipt
if (proofRailsReceipts.length > 0) {
  await writeContract({
    address: BATCH_PAYOUT_ADDRESS,
    abi: BatchPayoutABI,
    functionName: 'updateProofRailsId',
    args: [payoutId, proofRailsReceipts[0].receipt_id]
  });
}
```

## Important Notes

1. **Transaction Hash**: ProofRails requires the transaction hash, which is available after the transaction is confirmed.

2. **Individual Receipts**: For batch payouts, you may want to create individual ProofRails receipts for each recipient, or a single receipt for the entire batch.

3. **Status Updates**: ProofRails receipts start as "pending" and update to "anchored" once the bundle is anchored on Flare.

4. **Error Handling**: If ProofRails API call fails, the contract payout is still valid. You can retry the ProofRails call later.

5. **Reference Format**: Use a consistent reference format like `payout:{payoutId}:recipient:{index}` for easy tracking.

## Testing

1. Deploy contract to Flare Testnet
2. Execute a test batch payout
3. Monitor events
4. Call ProofRails API with transaction hash
5. Verify receipt is created and anchored
6. Update contract with receipt_id

## Resources

- [ProofRails Setup Guide](https://github.com/ESE-MONDAY/Middleware-ISO20022-v1.3/blob/main/SETUP_GUIDE_SOCIAL.md)
- [ProofRails API](https://middleware-iso20022-v13-production-5084.up.railway.app/docs)
- Flare Testnet: https://coston2-explorer.flare.network
