import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// USDT0 contract address - testnet (Coston2)
// Testnet: 0x87B677383400973be3163D87abe922178EA04869
// Mainnet: 0xe7cd86e13AC4309349F30B3435a9d337750fC82D
const USDT0_ADDRESS = "0x87B677383400973be3163D87abe922178EA04869";

const BatchPayoutModule = buildModule("BatchPayoutModule", (m) => {
  const usdt0Address = m.getParameter("usdt0Address", USDT0_ADDRESS);

  const batchPayout = m.contract("BatchPayout", [usdt0Address]);

  return { batchPayout };
});

export default BatchPayoutModule;
