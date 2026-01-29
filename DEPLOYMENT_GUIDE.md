# BatchPayout Contract Deployment Guide

## Prerequisites

1. **Get USDT0 Contract Address on Flare Testnet**
   - Check Flare documentation or explorer
   - Flare Testnet (Coston2) Chain ID: 114
   - Explorer: https://coston2-explorer.flare.network

2. **Fund Your Wallet**
   - Get testnet FLR tokens from faucet
   - Ensure wallet has enough FLR for deployment gas

3. **Get Private Key**
   - Export private key from your wallet (for deployment)
   - Keep it secure!

## Step 1: Create Environment File

```bash
cd smartcontract
cat > .env << EOF
FLARE_TESTNET_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
FLARE_TESTNET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
USDT0_ADDRESS=0xUSDT0_CONTRACT_ADDRESS_HERE
EOF
```

## Step 2: Update Deployment Module

Edit `smartcontract/ignition/modules/BatchPayout.ts`:

```typescript
const USDT0_ADDRESS = "0x..."; // Your USDT0 address
```

Or pass it as parameter during deployment.

## Step 3: Deploy Contract

```bash
cd smartcontract
npm install  # If not already done
npm run compile  # Compile contracts first
npm run deploy:testnet
```

## Step 4: Save Contract Address

After deployment, you'll get a contract address. Save it:

```bash
# Add to frontend/.env.local
echo "NEXT_PUBLIC_BATCH_PAYOUT_ADDRESS=0x..." >> ../frontend/.env.local
```

## Step 5: Get Contract ABI

Copy the ABI to frontend:

```bash
# Copy ABI
cp artifacts/contracts/BatchPayout.sol/BatchPayout.json ../frontend/lib/contracts/
```

## Verification

1. Check contract on explorer: https://coston2-explorer.flare.network
2. Verify contract code
3. Test a small batch payout

## Troubleshooting

- **"insufficient funds"**: Fund your wallet with testnet FLR
- **"invalid USDT0 address"**: Double-check USDT0 address
- **"nonce too low"**: Wait a moment and retry
