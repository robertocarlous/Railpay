# Gasless USDT0 Batch Payout Implementation

This document explains how to implement gasless USDT0 transfers for batch payouts using EIP-3009, based on the [Flare documentation](https://dev.flare.network/network/guides/gasless-usdt0-transfers).

## Overview

Instead of users paying gas fees for batch payouts, we implement a **gasless** system where:
1. **Users sign authorizations** (EIP-712) - No gas cost
2. **Relayer executes transfers** - Relayer pays gas
3. **Contract records payout** - For tracking and ProofRails integration

## Architecture

```
User → Sign Authorizations (Gasless) → Relayer → Execute Transfers (Pays Gas) → Contract Records
```

## Components

### 1. GaslessBatchPayout Contract

**Location:** `smartcontract/contracts/GaslessBatchPayout.sol`

**Key Features:**
- Records batch payouts executed via gasless transfers
- Tracks nonces to prevent replay attacks
- Only relayer can record payouts
- Maintains same payout tracking as regular BatchPayout

**Key Function:**
```solidity
function recordBatchPayout(
    address initiator,
    address[] calldata recipients,
    uint256[] calldata amounts,
    bytes32[] calldata nonces,
    string calldata payoutRef
) external onlyRelayer returns (uint256)
```

### 2. Relayer Service

**Location:** `relayer/src/relayer.ts`

**Responsibilities:**
- Receives signed authorizations from frontend
- Executes `transferWithAuthorization` for each recipient
- Records payout in GaslessBatchPayout contract
- Pays all gas fees

**API Endpoint:**
```
POST /relay-batch-payout
Body: {
  authorizations: [...],
  payoutRef: "payout:123"
}
```

### 3. Frontend Client

**Location:** `frontend/lib/gaslessPayout.ts`

**Functions:**
- `createAuthorization()` - Creates EIP-712 signature
- `executeGaslessBatchPayout()` - Sends to relayer

## Setup Instructions

### 1. Deploy GaslessBatchPayout Contract

```bash
cd smartcontract
# Update ignition/modules/GaslessBatchPayout.ts with relayer address
npm run deploy:testnet
```

### 2. Setup Relayer Service

```bash
cd relayer
npm install

# Create .env file
cp .env.example .env
# Update with:
# - USDT0 address
# - Relayer private key (funded with FLR)
# - GaslessBatchPayout contract address

# Run relayer
npm run dev
```

### 3. Update Frontend

```bash
cd frontend
# Add to .env.local:
NEXT_PUBLIC_USDT0_ADDRESS=0x...
NEXT_PUBLIC_RELAYER_URL=http://localhost:3000
```

## Usage Flow

### Frontend (User Experience)

```typescript
import { executeGaslessBatchPayout } from '@/lib/gaslessPayout';

// User signs authorizations (no gas cost!)
const result = await executeGaslessBatchPayout(signer, {
  recipients: ['0x...', '0x...'],
  amounts: ['100', '200'],
  payoutRef: 'payout:123'
});

// Relayer executes transfers and records payout
// User gets transaction hashes
```

### Relayer Processing

1. Receives authorizations
2. Validates timestamps and nonces
3. Executes `transferWithAuthorization` for each
4. Records payout in contract
5. Returns transaction hashes

## Benefits

✅ **Zero gas cost for users** - They only sign messages
✅ **Better UX** - No need to approve tokens or pay gas
✅ **Batch efficiency** - All transfers in one relayer transaction
✅ **Same tracking** - Contract still records everything for ProofRails

## Considerations

⚠️ **Relayer must be funded** - Needs FLR for gas
⚠️ **Relayer security** - Must be trusted or use multi-sig
⚠️ **Rate limiting** - Prevent abuse of free relayer service
⚠️ **Nonce management** - Track used nonces to prevent replay

## Integration with Existing System

You can support **both** gasless and regular payouts:

1. **Option A:** User chooses (gasless vs regular)
2. **Option B:** Always use gasless (if relayer available)
3. **Option C:** Fallback to regular if relayer unavailable

## Next Steps

1. Get USDT0 address on Flare Testnet
2. Deploy GaslessBatchPayout contract
3. Setup and fund relayer
4. Test gasless batch payout
5. Integrate with frontend
6. Add ProofRails integration (same as regular payouts)

## Resources

- [Flare Gasless USDT0 Guide](https://dev.flare.network/network/guides/gasless-usdt0-transfers)
- [EIP-712 Specification](https://eips.ethereum.org/EIPS/eip-712)
- [EIP-3009 Specification](https://eips.ethereum.org/EIPS/eip-3009)
