import { deploy } from "@nomicfoundation/hardhat-ignition";
import BatchPayoutModule from "../ignition/modules/BatchPayout";

async function main() {
  // USDT0 contract address on Flare Testnet
  // Update this with the actual USDT0 address
  const USDT0_ADDRESS = process.env.USDT0_ADDRESS || "0x0000000000000000000000000000000000000000";

  console.log("Deploying BatchPayout contract...");
  console.log("USDT0 Address:", USDT0_ADDRESS);

  const { batchPayout } = await deploy(BatchPayoutModule, {
    parameters: {
      BatchPayoutModule: {
        usdt0Address: USDT0_ADDRESS,
      },
    },
  });

  console.log("BatchPayout deployed to:", await batchPayout.getAddress());
  console.log("\nContract deployment complete!");
  console.log("Next steps:");
  console.log("1. Update the contract address in your frontend");
  console.log("2. Update the ABI in your frontend");
  console.log("3. Test the batch payout functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
