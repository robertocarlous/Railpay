# Next Steps - Railpay Development Roadmap

## 🎯 Current Status

✅ **Completed:**
- UI/UX implementation (admin dashboard, recipient portal, landing page)
- Wallet connection (RainbowKit with Flare Testnet)
- Route protection (WalletGuard)
- Smart contract (BatchPayout.sol compiled successfully)
- ProofRails integration (frontend client + contract events)
- Documentation
- Code committed to `feature/railpay-core-implementation` branch

## 📋 Next Steps (Priority Order)

### 1. **Deploy Smart Contract to Flare Testnet** 🔥 HIGH PRIORITY

**Tasks:**
- [ ] Get USDT0 contract address on Flare Testnet (Coston2)
  - Check Flare documentation or explorer
  - Update `.env` file with `USDT0_ADDRESS`
- [ ] Fund wallet with testnet FLR for gas fees
- [ ] Deploy BatchPayout contract:
  ```bash
  cd smartcontract
  npm run deploy:testnet
  ```
- [ ] Save deployed contract address
- [ ] Verify contract on Flare explorer

**Files to update:**
- `smartcontract/.env` - Add USDT0 address and private key
- `frontend/.env.local` - Add deployed contract address

---

### 2. **Frontend Contract Integration** 🔥 HIGH PRIORITY

**Tasks:**
- [ ] Create contract ABI file in frontend
  - Copy from `smartcontract/artifacts/contracts/BatchPayout.sol/BatchPayout.json`
- [ ] Create contract interaction hooks/utilities
  - Use wagmi hooks (useReadContract, useWriteContract, useWatchContractEvent)
- [ ] Update "New Payout" page to:
  - Connect to deployed contract
  - Execute batchPayout transaction
  - Listen to events
  - Call ProofRails API after transaction
  - Update contract with ProofRails receipt ID
- [ ] Update payout history to fetch from contract
- [ ] Update recipient portal to fetch from contract

**Files to create:**
- `frontend/lib/contract.ts` - Contract configuration and ABI
- `frontend/lib/useBatchPayout.ts` - Custom hooks for contract interaction
- `frontend/app/api/proofrails/route.ts` - API route for ProofRails calls (optional)

---

### 3. **ProofRails Integration Testing** 🔥 HIGH PRIORITY

**Tasks:**
- [ ] Test ProofRails API connection
  - Get API key from ProofRails dashboard
  - Test `recordProofRailsTip` function
- [ ] Implement event listener for PaymentExecuted events
- [ ] Automatically call ProofRails API after transaction confirmation
- [ ] Update contract with ProofRails receipt ID
- [ ] Verify receipts are anchored on Flare
- [ ] Test receipt verification

**Files to update:**
- `frontend/lib/proofRailsClient.ts` - Add API key handling
- `frontend/app/admin/payouts/new/page.tsx` - Integrate ProofRails calls

---

### 4. **Testing & Bug Fixes** ⚠️ MEDIUM PRIORITY

**Tasks:**
- [ ] Test complete payout flow:
  1. Add recipients (CSV + manual)
  2. Execute batch payout
  3. Verify ProofRails receipts created
  4. Check recipient portal shows payments
  5. Download records
- [ ] Test error handling:
  - Insufficient balance
  - Wrong network
  - Failed transactions
  - ProofRails API failures
- [ ] Test edge cases:
  - Single recipient
  - Large batches (100+ recipients)
  - Duplicate addresses
- [ ] Fix any bugs found

---

### 5. **UI/UX Polish** ⚠️ MEDIUM PRIORITY

**Tasks:**
- [ ] Add loading states during transactions
- [ ] Add success/error toast notifications
- [ ] Improve mobile responsiveness
- [ ] Add transaction status indicators
- [ ] Add ProofRails receipt links
- [ ] Add copy-to-clipboard for addresses
- [ ] Add transaction hash links to explorer

---

### 6. **Backend/API (Optional)** 📝 LOW PRIORITY

**Tasks:**
- [ ] Create API routes for:
  - Storing payout metadata
  - Caching contract data
  - ProofRails webhook handling
- [ ] Add database for:
  - Payout history
  - User preferences
  - Analytics

---

### 7. **Deployment** 🚀 FINAL STEP

**Tasks:**
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Set environment variables
- [ ] Test production deployment
- [ ] Update documentation
- [ ] Create user guide

---

## 🔧 Immediate Action Items

### Right Now:
1. **Get USDT0 Address on Flare Testnet**
   - Check: https://coston2-explorer.flare.network
   - Or: https://docs.flare.network/usdt0

2. **Deploy Contract**
   ```bash
   cd smartcontract
   # Create .env file
   echo "USDT0_ADDRESS=0x..." > .env
   echo "FLARE_TESTNET_PRIVATE_KEY=0x..." >> .env
   echo "FLARE_TESTNET_RPC_URL=https://coston2-api.flare.network/ext/C/rpc" >> .env
   
   # Deploy
   npm run deploy:testnet
   ```

3. **Update Frontend with Contract Address**
   ```bash
   cd frontend
   # Create .env.local
   echo "NEXT_PUBLIC_BATCH_PAYOUT_ADDRESS=0x..." > .env.local
   echo "NEXT_PUBLIC_PROOFRAILS_API_URL=https://middleware-iso20022-v13-production-5084.up.railway.app" >> .env.local
   ```

---

## 📚 Resources

- **Flare Testnet Explorer**: https://coston2-explorer.flare.network
- **Flare RPC**: https://coston2-api.flare.network/ext/C/rpc
- **ProofRails API**: https://middleware-iso20022-v13-production-5084.up.railway.app/docs
- **USDT0 Docs**: https://flare.network/news/get-started-usdt0
- **ProofRails Setup**: https://github.com/ESE-MONDAY/Middleware-ISO20022-v1.3

---

## 🎯 Success Criteria

Before considering the project complete:
- [ ] Contract deployed and verified on Flare Testnet
- [ ] Frontend connected to deployed contract
- [ ] Batch payout executes successfully
- [ ] ProofRails receipts created and anchored
- [ ] Recipients can view their payment history
- [ ] All features tested and working
- [ ] Documentation complete

---

**Ready to start? Begin with Step 1: Deploy Smart Contract!** 🚀
