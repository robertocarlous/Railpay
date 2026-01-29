# BatchPayout Contract Deployment Guide

## Prerequisites

1. **USDT0 Contract Address on Flare Mainnet**
   - Official USDT0 address: `0xe7cd86e13AC4309349F30B3435a9d337750fC82D`
   - Flare Mainnet Chain ID: 14
   - Explorer: https://flare-explorer.flare.network

2. **Fund Your Wallet**
   - Ensure wallet has enough FLR tokens for deployment gas fees
   - Mainnet requires real FLR tokens (not testnet tokens)

3. **Get Private Key**
   - Export private key from your wallet (for deployment)
   - Keep it secure! Never commit private keys to git

## Step 1: Create Environment File

```bash
cd smartcontract
cat > .env << EOF
FLARE_MAINNET_RPC_URL=https://flare-api.flare.network/ext/C/rpc
FLARE_MAINNET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
USDT0_ADDRESS=0xe7cd86e13AC4309349F30B3435a9d337750fC82D
EOF
```

## Step 2: Update Deployment Module

The `BatchPayout.ts` module already has the mainnet USDT0 address configured:
```typescript
const USDT0_ADDRESS = "0xe7cd86e13AC4309349F30B3435a9d337750fC82D";
```

## Step 3: Deploy Contract

```bash
cd smartcontract
npm install  # If not already done
npm run compile  # Compile contracts first
npx hardhat ignition deploy ignition/modules/BatchPayout.ts --network flareMainnet
```

Or use the deployment script:
```bash
npm run deploy:testnet  # Note: script name may need updating
```

## Step 4: Save Contract Address

After deployment, you'll get a contract address. Save it:

```bash
# Add to frontend/.env.local
echo "NEXT_PUBLIC_BATCH_PAYOUT_ADDRESS=0x..." >> ../frontend/.env.local
echo "NEXT_PUBLIC_USDT0_ADDRESS=0xe7cd86e13AC4309349F30B3435a9d337750fC82D" >> ../frontend/.env.local
```

## Step 5: Get Contract ABI

Copy the ABI to frontend:

```bash
# Copy ABI
cp artifacts/contracts/BatchPayout.sol/BatchPayout.json ../frontend/lib/contracts/
```

## Verification

1. Check contract on explorer: https://flare-explorer.flare.network/address/YOUR_CONTRACT_ADDRESS
2. Verify contract code
3. Test a small batch payout

## Troubleshooting

- **"insufficient funds"**: Fund your wallet with FLR tokens for gas fees
- **"invalid USDT0 address"**: Verify USDT0 address is correct: `0xe7cd86e13AC4309349F30B3435a9d337750fC82D`
- **"nonce too low"**: Wait a moment and retry
- **Network errors**: Ensure you're using the correct RPC URL for Flare Mainnet
