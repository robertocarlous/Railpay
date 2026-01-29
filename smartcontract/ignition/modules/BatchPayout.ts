import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// USDT0 contract address on Flare Testnet (Coston2)
// This should be updated with the actual USDT0 address when available
const USDT0_ADDRESS = "0x0000000000000000000000000000000000000000"; // TODO: Update with actual USDT0 address

const BatchPayoutModule = buildModule("BatchPayoutModule", (m) => {
  const usdt0Address = m.getParameter("usdt0Address", USDT0_ADDRESS);

  const batchPayout = m.contract("BatchPayout", [usdt0Address]);

  return { batchPayout };
});

export default BatchPayoutModule;
