import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// USDT0 contract address - testnet (Coston2)
// Testnet: 0xC1A5B41512496B80903D1f32d6dEa3a73212E71F
// Mainnet: 0xe7cd86e13AC4309349F30B3435a9d337750fC82D
const USDT0_ADDRESS = "0xC1A5B41512496B80903D1f32d6dEa3a73212E71F";

const BatchPayoutModule = buildModule("BatchPayoutModule", (m) => {
  const usdt0Address = m.getParameter("usdt0Address", USDT0_ADDRESS);

  const batchPayout = m.contract("BatchPayout", [usdt0Address]);

  return { batchPayout };
});

export default BatchPayoutModule;
