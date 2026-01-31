# Railpay

**Batch payment platform on Flare Network with automated ISO 20022 receipts**

Railpay makes it dead simple to send payments to multiple people at once on the Flare blockchain. Whether you're paying affiliates, distributing rewards, or managing payroll, Railpay handles it in one transaction with automatic receipt generation.

---

## What Does This Do?

Instead of sending 50 separate transactions to pay 50 people (expensive and time-consuming), Railpay lets you:
- Upload a list of addresses and amounts
- Click one button
- Everyone gets paid in a single transaction
- Receipts are automatically created for compliance

That's it. No complicated smart contract calls, no manual tracking, no spreadsheet hell.

---

## Features

### For Admins (People Sending Money)

- **Batch Payouts** - Pay unlimited recipients in one transaction
- **CSV Import** - Upload a spreadsheet, we'll handle the rest
- **Manual Entry** - Add recipients one by one if you prefer
- **Automatic Receipts** - ISO 20022 compliant receipts via ProofRails
- **Payout History** - See every payment you've ever made
- **Reports & Analytics** - Download reports in CSV, JSON, HTML, or PDF
- **Preview Reports** - Check your data before downloading

### For Recipients (People Getting Paid)

- **Payment Dashboard** - See all payments sent to you
- **Download Records** - Export your payment history
- **Blockchain Verification** - Every payment is on-chain and verifiable

---

## Tech Stack

This is a Next.js 14 app using the App Router. Here's what powers it:

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- RainbowKit for wallet connections

**Blockchain:**
- Flare Network (Testnet: Coston2)
- Wagmi v2 for smart contract interactions
- Viem for Ethereum utilities

**Smart Contracts:**
- BatchPayout contract for multi-recipient transfers
- USDT0 token (6 decimals) for payments

**Services:**
- ProofRails API for ISO 20022 receipt generation
- Web3 wallet (MetaMask, WalletConnect, etc.)

---

## Getting Started

### Prerequisites

You need:
- Node.js 18 or higher
- A Web3 wallet (MetaMask recommended)
- Some C2FLR tokens for gas (get from Coston2 faucet)
- USDT0 tokens for testing (get from faucet or swap)

### Installation

1. **Clone this repo**
```bash
git clone https://github.com/robertocarlous/Railpay.git
cd railpay
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root:

```env
# Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_USDT0_ADDRESS=0xYourUSDT0ContractAddress
NEXT_PUBLIC_BATCH_PAYOUT_ADDRESS=0xYourBatchPayoutContractAddress

# Optional (for ProofRails receipts)
NEXT_PUBLIC_PROOFRAILS_API_URL=https://middleware-iso20022-v13-production-5084.up.railway.app
NEXT_PUBLIC_PROOFRAILS_API_KEY=your_api_key_here

# Network
NEXT_PUBLIC_NETWORK=testnet
```

**Where to get these:**
- **WalletConnect Project ID**: Sign up at https://cloud.walletconnect.com
- **Contract Addresses**: Deploy contracts or ask your team
- **ProofRails API Key**: Contact ProofRails team

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

---

## How To Use

### For First-Time Users

1. **Connect Your Wallet**
   - Click "Connect Wallet" in the top right
   - Choose your wallet (MetaMask, WalletConnect, etc.)
   - Make sure you're on Coston2 testnet (Chain ID: 114)

2. **Get Some Test Tokens**
   - C2FLR for gas: https://faucet.flare.network/coston2
   - USDT0 for payments: [Ask your team or use faucet]

3. **Go to Admin Dashboard**
   - Click "Dashboard" in the sidebar
   - You'll see your stats (probably all zeros for now)

### Making Your First Payout

1. **Click "New Payout"** in the sidebar

2. **Add Recipients**
   
   **Option A: Manual Entry**
   - Click "+ Add Recipient"
   - Paste wallet address
   - Enter amount in USDT0
   - Repeat for each person
   
   **Option B: CSV Upload**
   - Click "CSV Upload"
   - Upload a file with this format:
     ```csv
     address,amount
     0x1234...,10.50
     0x5678...,25.00
     ```

3. **Add a Payout Reference**
   - Example: "January 2026 Affiliate Payments"
   - This helps you track what the payment was for

4. **Approve USDT0 Tokens**
   - Click "Approve USDT0"
   - Sign the transaction in your wallet
   - Wait for confirmation
   - Click the refresh button next to "Current Allowance"

5. **Execute the Payout**
   - Click "Execute Payout"
   - Sign the transaction
   - Wait for confirmation
   - Everyone gets paid!

6. **Receipts (Optional)**
   - If ProofRails is configured, receipts are created automatically
   - If not, you'll see a warning but the payment still works

### Viewing Reports

1. **Click "Reports"** in the sidebar

2. **See Your Analytics**
   - Total payouts made
   - Total amount sent
   - Top recipients
   - Monthly breakdown

3. **Download Reports**
   - Click "Preview & Download Report"
   - Choose format (CSV, JSON, HTML, PDF)
   - Preview your data
   - Click "Download [Format]"

---

## Project Structure

```
railpay/
├── app/                          # Next.js 14 App Router
│   ├── admin/                    # Admin dashboard pages
│   │   ├── page.tsx             # Dashboard home
│   │   ├── payouts/
│   │   │   ├── page.tsx         # Payout history
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # Create new payout
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Payout details
│   │   └── reports/
│   │       └── page.tsx         # Reports & analytics
│   ├── recipient/               # Recipient pages
│   │   ├── page.tsx            # My payments
│   │   └── downloads/
│   │       └── page.tsx        # Download records
│   ├── components/              # Reusable components
│   │   ├── Layout.tsx          # Main layout with sidebar
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── WalletGuard.tsx     # Wallet connection guard
│   │   ├── Card.tsx            # Card container
│   │   ├── Button.tsx          # Button component
│   │   ├── Badge.tsx           # Status badges
│   │   ├── LoadingSpinner.tsx  # Loading indicator
│   │   └── ReportPreview.tsx   # Report preview modal
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── providers.tsx           # Web3 providers setup
├── lib/                         # Utilities and helpers
│   ├── contracts.ts            # Contract ABIs and addresses
│   ├── contractInteractions.ts # Contract interaction helpers
│   ├── usePayouts.ts           # Payout data hooks
│   ├── proofRailsClient.ts     # ProofRails API client
│   └── reportUtils.ts          # Report generation utilities
├── public/                      # Static assets
├── .env.local                   # Environment variables (create this)
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind config
└── README.md                   # You are here
```

---

## Configuration

### Network Settings

The app currently uses **Flare Testnet (Coston2)**:
- Chain ID: 114
- RPC: https://coston2-api.flare.network/ext/C/rpc
- Explorer: https://coston2-explorer.flare.network
- Native Token: C2FLR

To switch to mainnet, update `app/providers.tsx`:
```typescript
// Change this:
const flareTestnet = defineChain({ id: 114, ... })

// To this:
const flareMainnet = defineChain({ id: 14, ... })
```

Also update:
- `WalletGuard.tsx` (chain ID check)
- `Layout.tsx` (chain ID check)
- `Sidebar.tsx` (network warning)

### Contract Addresses

Set these in `.env.local`:

```env
NEXT_PUBLIC_USDT0_ADDRESS=0x...           # USDT0 token contract
NEXT_PUBLIC_BATCH_PAYOUT_ADDRESS=0x...     # BatchPayout contract
```

These are defined in `lib/contracts.ts` and used throughout the app.

### ProofRails Integration

ProofRails is optional but recommended for ISO 20022 receipts.

**To enable:**
1. Get API key from ProofRails team
2. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_PROOFRAILS_API_KEY=your_key
   ```

**To disable:**
- Leave the API key empty
- Payouts will still work
- You'll see a warning about receipt creation

**CORS Issues:**
If you get CORS errors (common in development), ProofRails needs to add your domain to their allowed origins. Contact them or use the proxy workaround in `PROOFRAILS_CORS_FIX.md`.

---

## Smart Contracts

### BatchPayout Contract

**What it does:**
Sends USDT0 tokens to multiple addresses in one transaction.

**Main function:**
```solidity
function batchPayout(
    address[] recipients,
    uint256[] amounts,
    string memory reference
) public
```

**How it works:**
1. You approve the contract to spend your USDT0
2. You call `batchPayout` with addresses, amounts, and a reference
3. Contract transfers tokens to each recipient
4. Emits `PayoutExecuted` event for tracking

### USDT0 Token

**What it is:**
A USDT-like token on Flare with 6 decimals.

**Important:**
- NOT actual USDT (it's a test token)
- 6 decimals (not 18 like most tokens)
- Standard ERC20 interface

**Getting USDT0:**
- Use the faucet (if available)
- Swap C2FLR for USDT0 on a DEX
- Ask your team

---

## Common Issues

### "Please connect your wallet"

**Problem:** You're not connected to a Web3 wallet.

**Fix:**
- Click "Connect Wallet"
- Select your wallet
- Approve the connection

---

### "Wrong Network"

**Problem:** You're on the wrong blockchain.

**Fix:**
1. Open your wallet (MetaMask)
2. Click the network dropdown
3. Add Coston2 manually:
   - Network Name: Coston2
   - RPC URL: https://coston2-api.flare.network/ext/C/rpc
   - Chain ID: 114
   - Currency: C2FLR
   - Block Explorer: https://coston2-explorer.flare.network

---

### "Insufficient Allowance"

**Problem:** Contract doesn't have permission to spend your USDT0.

**Fix:**
1. Click "Approve USDT0" button
2. Sign the transaction
3. Wait for confirmation (check block explorer)
4. Click the refresh button next to allowance
5. Try executing payout again

**Still not working?**
- Check the debug info card (shows exact amounts)
- Make sure allowance ≥ total payout amount
- Try approving again (it adds to existing allowance)

---

### "Insufficient Balance"

**Problem:** You don't have enough USDT0 or C2FLR.

**Fix:**
- Get USDT0 from faucet or DEX
- Get C2FLR from https://faucet.flare.network/coston2
- Check your balance in the dashboard

---

### "No Payouts Found"

**Problem:** No payout history showing up.

**Why:**
- You haven't made any payouts yet, OR
- The block range is too small (RPC limits)

**Fix:**
If you HAVE made payouts but don't see them:
1. Check `lib/usePayouts.tsx`
2. Increase `BLOCKS_TO_FETCH` (currently 1000)
3. Or use the paginated version in `usePayouts-paginated.tsx`

---

### CORS Errors with ProofRails

**Problem:** Browser blocks ProofRails API requests.

**Fix:**
See `PROOFRAILS_CORS_FIX.md` for detailed solutions. Quick fix:
- ProofRails team needs to add CORS headers
- OR use the proxy route (see guide)
- OR ignore receipts (payments still work)

---

### Reports Not Downloading

**Problem:** Click download but nothing happens.

**Fix:**
- Check browser popup blocker
- Try different browser
- Check console for errors
- Make sure you have payouts to export

---

## Development

### Running Tests

```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
```

### Building for Production

```bash
npm run build      # Build the app
npm run start      # Start production server
```

### Linting

```bash
npm run lint       # Check for issues
npm run lint:fix   # Auto-fix issues
```

### Type Checking

```bash
npx tsc --noEmit   # Check TypeScript types
```

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables
5. Deploy

Vercel automatically:
- Builds your app
- Serves it globally
- Updates on every push

### Other Platforms

Works on any platform that supports Next.js 14:
- Netlify
- Railway
- AWS Amplify
- Your own server with Docker

---

## Environment Variables Reference

```env
# === REQUIRED ===

# WalletConnect Project ID
# Get from: https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123...

# Smart Contract Addresses
NEXT_PUBLIC_USDT0_ADDRESS=0x...
NEXT_PUBLIC_BATCH_PAYOUT_ADDRESS=0x...

# === OPTIONAL ===

# ProofRails (for receipts)
NEXT_PUBLIC_PROOFRAILS_API_URL=https://middleware-iso20022-v13-production-5084.up.railway.app
NEXT_PUBLIC_PROOFRAILS_API_KEY=your_key

# Network (affects ProofRails chain selection)
NEXT_PUBLIC_NETWORK=testnet  # or "mainnet"
```

---

## Contributing

Want to help? Here's how:

1. **Fork the repo**
2. **Create a branch** (`git checkout -b feature/cool-thing`)
3. **Make your changes**
4. **Test everything** (seriously, test it)
5. **Commit** (`git commit -m 'Add cool thing'`)
6. **Push** (`git push origin feature/cool-thing`)
7. **Open a Pull Request**

### Guidelines

- Write clean, readable code
- Add comments for complex logic
- Update documentation if needed
- Test on both desktop and mobile
- Check TypeScript types pass
- Run the linter

---

## Security

### Important Notes

- **Private Keys:** Never commit your private keys or seed phrases
- **Environment Variables:** Keep `.env.local` out of git (already in .gitignore)
- **Smart Contracts:** Audit before using on mainnet with real money
- **Testing:** Always test on testnet first
- **Approvals:** Be careful with token approvals (use limited amounts)

## FAQ

**Q: Do I need to run a blockchain node?**
A: No. The app connects to public Flare RPC endpoints.

**Q: Can I use this on mainnet?**
A: Yes, but change the network configuration and TEST THOROUGHLY first.

**Q: What if ProofRails is down?**
A: Payouts still work. You just won't get automatic receipts.

**Q: Can recipients be smart contracts?**
A: Yes, any address that can receive ERC20 tokens.

**Q: Is there a limit on recipients?**
A: Gas limit is the main constraint. Tested with 100+ recipients successfully.

**Q: Can I cancel a payout?**
A: No. Once executed, it's on-chain and final.

**Q: How do I get my transaction hash?**
A: It's shown after execution and saved in payout history.

**Q: Can I export data for taxes?**
A: Yes, use the Reports page to download CSV or JSON.

---

## License

MIT License - see LICENSE file for details.

You can use this code for commercial projects, modify it, distribute it, whatever. Just include the original license.

---

## Credits

Built with:
- Next.js by Vercel
- RainbowKit by Rainbow
- Wagmi by wagmi.sh
- Viem by wagmi.sh
- Flare Network
- ProofRails for ISO 20022 compliance

---

## Changelog

### v1.0.0 (Current)
- Initial release
- Batch payouts
- CSV import
- Payout history
- Reports & analytics
- ProofRails integration
- Report preview feature
- Sidebar navigation

---

**Made with ❤️ for the Flare community**

If this helped you, consider starring the repo ⭐
