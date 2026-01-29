# Railpay Smart Contracts

Batch payout smart contract for Flare Network with ProofRails integration.

## Overview

The `BatchPayout` contract enables efficient batch payments using USDT0 on Flare Network. It integrates with ProofRails for payment verification and record-keeping.

## Features

- **Batch Payments**: Execute multiple payouts in a single transaction
- **USDT0 Integration**: Native support for USDT0 token on Flare
- **ProofRails Integration**: Emits events for ProofRails verification
- **Payment Tracking**: Complete history of all payouts and recipient payments
- **Gas Efficient**: Reduces gas costs by batching multiple transfers

## Contract Structure

### BatchPayout.sol

Main contract that handles batch payouts.

**Key Functions:**
- `batchPayout(address[] recipients, uint256[] amounts, string proofRailsId)`: Execute batch payment
- `getPayout(uint256 payoutId)`: Get payout details
- `getPayoutRecipients(uint256 payoutId)`: Get all recipients for a payout
- `getRecipientHistory(address recipient)`: Get payment history for a recipient
- `updateProofRailsId(uint256 payoutId, string newProofRailsId)`: Update ProofRails ID

**Events:**
- `PayoutCreated`: Emitted when a payout is created
- `PaymentExecuted`: Emitted for each individual payment
- `PayoutCompleted`: Emitted when payout is completed
- `ProofRailsIdUpdated`: Emitted when ProofRails ID is updated

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
FLARE_TESTNET_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
FLARE_TESTNET_PRIVATE_KEY=your_private_key_here
USDT0_ADDRESS=0x... # USDT0 contract address on Flare Testnet
```

3. Compile contracts:
```bash
npm run compile
```

4. Run tests:
```bash
npm run test
```

## Deployment

### Deploy to Flare Testnet

```bash
npm run deploy:testnet
```

Make sure to:
1. Update `USDT0_ADDRESS` in `.env` with the actual USDT0 contract address
2. Have testnet FLR tokens for gas
3. Update the contract address in your frontend after deployment

## ProofRails Integration

The contract emits events that can be verified by ProofRails:

1. **PayoutCreated Event**: Contains payout metadata and ProofRails ID
2. **PaymentExecuted Event**: Individual payment records for each recipient
3. **PayoutCompleted Event**: Confirms completion of the entire batch

These events provide on-chain proof that can be verified off-chain through ProofRails API.

## Usage Example

```solidity
// Approve contract to spend USDT0
usdt0.approve(batchPayoutAddress, totalAmount);

// Execute batch payout
uint256 payoutId = batchPayout.batchPayout(
    recipients,      // Array of recipient addresses
    amounts,         // Array of amounts
    "proofrails-123" // ProofRails verification ID
);
```

## Network Configuration

- **Flare Testnet (Coston2)**: Chain ID 114
- **RPC URL**: https://coston2-api.flare.network/ext/C/rpc
- **Explorer**: https://coston2-explorer.flare.network

## Security Considerations

- Always verify the USDT0 contract address before deployment
- Use proper access controls (only owner can update ProofRails IDs)
- Validate all inputs (recipients, amounts, array lengths)
- Check allowances and balances before executing payouts

## License

MIT
