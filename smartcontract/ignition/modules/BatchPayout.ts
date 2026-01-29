import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// USDT0 contract address on Flare Mainnet
// Official USDT0 address: 0xe7cd86e13AC4309349F30B3435a9d337750fC82D
const USDT0_ADDRESS = "0xe7cd86e13AC4309349F30B3435a9d337750fC82D";

const BatchPayoutModule = buildModule("BatchPayoutModule", (m) => {
  const usdt0Address = m.getParameter("usdt0Address", USDT0_ADDRESS);

  const batchPayout = m.contract("BatchPayout", [usdt0Address]);

  return { batchPayout };
});

export default BatchPayoutModule;
