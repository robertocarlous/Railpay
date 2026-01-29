# Railpay Relayer Service

Relayer service for gasless USDT0 batch payouts on Flare Network using EIP-3009.

## Overview

This relayer service enables gasless batch payouts by:
1. Receiving EIP-712 signed authorizations from users
2. Executing `transferWithAuthorization` on USDT0 contract
3. Recording payouts in GaslessBatchPayout contract
4. Paying all gas fees on behalf of users

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```

3. **Configure environment variables:**
```env
FLARE_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
USD0_ADDRESS=0x... # USDT0 contract address
RELAYER_PRIVATE_KEY=0x... # Relayer wallet (must be funded with FLR)
BATCH_PAYOUT_CONTRACT=0x... # GaslessBatchPayout contract address
PORT=3000
```

4. **Fund relayer wallet:**
   - Send FLR tokens to the relayer address for gas fees
   - Check balance: `cast balance <relayer_address> --rpc-url $FLARE_RPC_URL`

## Running

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /
```

### Relay Batch Payout
```
POST /relay-batch-payout
Content-Type: application/json

{
  "authorizations": [
    {
      "payload": {
        "from": "0x...",
        "to": "0x...",
        "value": "1000000",
        "validAfter": 1234567890,
        "validBefore": 1234571490,
        "nonce": "0x..."
      },
      "v": 27,
      "r": "0x...",
      "s": "0x..."
    }
  ],
  "payoutRef": "payout:123"
}
```

**Response:**
```json
{
  "success": true,
  "payoutId": "1",
  "transactionHashes": ["0x...", "0x..."],
  "recipients": ["0x...", "0x..."],
  "amounts": ["1000000", "2000000"]
}
```

## Security Considerations

- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Authentication**: Consider adding API key authentication
- **Nonce Validation**: Contract validates nonces, but relayer should also check
- **Timestamp Validation**: Already implemented in relayer
- **Error Handling**: Comprehensive error handling for failed transactions

## Monitoring

Monitor:
- Relayer wallet balance (needs FLR for gas)
- Failed transactions
- API response times
- Transaction success rate

## Resources

- [Flare Gasless USDT0 Guide](https://dev.flare.network/network/guides/gasless-usdt0-transfers)
- [EIP-3009 Specification](https://eips.ethereum.org/EIPS/eip-3009)
- [EIP-712 Specification](https://eips.ethereum.org/EIPS/eip-712)
