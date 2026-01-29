# Gasless vs Regular Batch Payouts

Railpay supports **two modes** for batch payouts:

## Option 1: Regular Batch Payout (Current Implementation)

**How it works:**
- User approves USDT0 to contract
- User calls `batchPayout()` directly
- User pays gas fees
- Contract executes transfers

**Pros:**
- ✅ Simple - no relayer needed
- ✅ Decentralized - user controls everything
- ✅ No trust required

**Cons:**
- ❌ User pays gas fees
- ❌ Requires token approval step
- ❌ Higher barrier for users

**Contract:** `BatchPayout.sol`

---

## Option 2: Gasless Batch Payout (New Implementation)

**How it works:**
- User signs EIP-712 authorizations (gasless)
- Relayer executes `transferWithAuthorization` (pays gas)
- Relayer records payout in contract
- User pays zero gas

**Pros:**
- ✅ Zero gas cost for users
- ✅ Better UX - just sign, no approval needed
- ✅ Lower barrier to entry

**Cons:**
- ❌ Requires relayer service
- ❌ Relayer must be funded
- ❌ Requires trust in relayer (or use multi-sig)

**Contract:** `GaslessBatchPayout.sol`

---

## Which Should You Use?

### Use **Regular** if:
- You want fully decentralized solution
- Users are comfortable with gas fees
- You don't want to maintain a relayer

### Use **Gasless** if:
- You want best user experience
- You can maintain a relayer service
- You want to subsidize gas costs for users
- You're building a B2B product where you cover costs

### Use **Both** if:
- Give users choice
- Fallback to regular if relayer unavailable
- Different tiers (free users = gasless, premium = regular)

---

## Implementation Status

✅ **Regular BatchPayout** - Complete and ready
✅ **GaslessBatchPayout** - Contract created, needs deployment
✅ **Relayer Service** - Created, needs setup
✅ **Frontend Client** - Created, needs integration

---

## Next Steps for Gasless

1. Deploy GaslessBatchPayout contract
2. Setup relayer service
3. Fund relayer wallet
4. Integrate frontend to use gasless client
5. Test end-to-end flow

See `GASLESS_IMPLEMENTATION.md` for detailed setup instructions.
