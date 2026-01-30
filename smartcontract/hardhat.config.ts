import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-verify";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable IR-based code generation to handle stack too deep
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    flareTestnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("FLARE_TESTNET_RPC_URL") || "https://coston2-api.flare.network/ext/C/rpc",
      accounts: configVariable("FLARE_TESTNET_PRIVATE_KEY") ? [configVariable("FLARE_TESTNET_PRIVATE_KEY")] : [],
      chainId: 114,
    },
    flareMainnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("FLARE_MAINNET_RPC_URL") || "https://flare-api.flare.network/ext/C/rpc",
      accounts: configVariable("FLARE_MAINNET_PRIVATE_KEY") ? [configVariable("FLARE_MAINNET_PRIVATE_KEY")] : [],
      chainId: 14,
    },
  },
  etherscan: {
    apiKey: {
      flareMainnet: process.env.FLARE_EXPLORER_API_KEY || "",
    },
    customChains: [
      {
        network: "flareMainnet",
        chainId: 14,
        urls: {
          apiURL: "https://flare-explorer.flare.network/api",
          browserURL: "https://flare-explorer.flare.network",
        },
      },
    ],
  },
});
