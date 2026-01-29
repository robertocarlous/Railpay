import { deploy } from "@nomicfoundation/hardhat-ignition";
import BatchPayoutModule from "../ignition/modules/BatchPayout";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Get USDT0 address from environment or use placeholder
  const USDT0_ADDRESS = process.env.USDT0_ADDRESS || process.env.NEXT_PUBLIC_USDT0_ADDRESS;
  
  if (!USDT0_ADDRESS || USDT0_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ ERROR: USDT0_ADDRESS not set!");
    console.log("\nPlease set USDT0_ADDRESS in your .env file:");
    console.log("USDT0_ADDRESS=0x...");
    console.log("\nTo find USDT0 address on Flare Testnet:");
    console.log("1. Check Flare documentation");
    console.log("2. Check explorer: https://coston2-explorer.flare.network");
    console.log("3. Or contact Flare team");
    process.exit(1);
  }

  console.log("🚀 Deploying BatchPayout contract to Flare Testnet...");
  console.log("📍 USDT0 Address:", USDT0_ADDRESS);
  console.log("🌐 Network: Flare Testnet (Coston2)");
  console.log("");

  try {
    const { batchPayout } = await deploy(BatchPayoutModule, {
      parameters: {
        BatchPayoutModule: {
          usdt0Address: USDT0_ADDRESS,
        },
      },
    });

    const contractAddress = await batchPayout.getAddress();
    
    console.log("✅ Contract deployed successfully!");
    console.log("📝 Contract Address:", contractAddress);
    console.log("\n📋 Next Steps:");
    console.log("1. Add to frontend/.env.local:");
    console.log(`   NEXT_PUBLIC_BATCH_PAYOUT_ADDRESS=${contractAddress}`);
    console.log("\n2. Copy ABI to frontend:");
    console.log("   cp artifacts/contracts/BatchPayout.sol/BatchPayout.json ../frontend/lib/contracts/");
    console.log("\n3. Verify contract on explorer:");
    console.log(`   https://coston2-explorer.flare.network/address/${contractAddress}`);
    console.log("\n4. Test the contract with a small batch payout");
  } catch (error: any) {
    console.error("❌ Deployment failed:", error.message);
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Tip: Fund your wallet with testnet FLR tokens");
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
