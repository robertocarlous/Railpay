import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// USDT0 contract address on Flare Testnet (Coston2)
const USDT0_ADDRESS = "0x87B677383400973be3163D87abe922178EA04869";

// Relayer address - the address that will execute gasless transfers
const RELAYER_ADDRESS = "0x0000000000000000000000000000000000000000"; // TODO: Update with relayer address

const GaslessBatchPayoutModule = buildModule("GaslessBatchPayoutModule", (m) => {
  const usdt0Address = m.getParameter("usdt0Address", USDT0_ADDRESS);
  const relayerAddress = m.getParameter("relayerAddress", RELAYER_ADDRESS);

  const gaslessBatchPayout = m.contract("GaslessBatchPayout", [usdt0Address, relayerAddress]);

  return { gaslessBatchPayout };
});

export default GaslessBatchPayoutModule;
