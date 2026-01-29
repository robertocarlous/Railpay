# How to Find USDT0 Contract Address on Flare Testnet

## Method 1: Check Flare Documentation

1. Visit: https://dev.flare.network/
2. Search for "USDT0" or "Retrieving Contract Addresses"
3. Look for testnet addresses section

## Method 2: Use Flare Explorer

1. Go to: https://coston2-explorer.flare.network
2. Search for:
   - "USDT0"
   - "TetherToken"
   - "USD0"
3. Look for verified contracts with high transaction count

## Method 3: Check Gasless USDT0 Guide

The Flare guide mentions:
- **Mainnet**: `0xe7cd86e13AC4309349F30B3435a9d337750fC82D` (TetherTokenOFTExtension)
- **Testnet**: Check the guide or use the same pattern

Visit: https://dev.flare.network/network/guides/gasless-usdt0-transfers

## Method 4: Query via RPC

You can query the network directly:

```bash
# Using cast (from foundry)
cast call 0x... "name()(string)" --rpc-url https://coston2-api.flare.network/ext/C/rpc

# Or use a script to search for contracts with "USDT0" or "Tether" in name
```

## Method 5: Check Flare Community

- Flare Discord
- Flare Telegram
- Flare GitHub issues/discussions

## Temporary Solution

If you can't find it immediately, you can:

1. **Deploy with placeholder** - Use `0x0000000000000000000000000000000000000000` initially
2. **Update later** - Once you find the address, you can redeploy or use a proxy pattern
3. **Test locally first** - Use MockERC20 for testing

## What to Look For

The USDT0 contract should:
- Have `transferWithAuthorization` function (EIP-3009)
- Have `name()` returning "USDT0" or "TetherToken"
- Be verified on the explorer
- Have many transactions (indicating it's the official one)

---

**Let me know if you find it, or we can proceed with a placeholder for now!**
