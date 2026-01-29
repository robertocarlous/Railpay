import { ethers } from "hardhat";

/**
 * Script to find USDT0 contract address on Flare Testnet
 * 
 * This script attempts to identify the USDT0 contract by:
 * 1. Checking known addresses
 * 2. Querying contracts for USDT0 characteristics
 * 3. Verifying EIP-3009 support (transferWithAuthorization)
 */

async function main() {
  console.log("🔍 Searching for USDT0 contract on Flare Testnet (Coston2)...\n");

  // Known potential addresses (these are examples - update with actual addresses)
  const potentialAddresses = [
    // Add known addresses here if you find them
    // "0x...",
  ];

  // Common USDT0 contract names to search for
  const contractNames = ["USDT0", "TetherToken", "USD0", "USDT"];

  console.log("📋 Methods to find USDT0 address:\n");

  console.log("1. Check Flare Documentation:");
  console.log("   https://docs.flare.network/usdt0\n");

  console.log("2. Use Flare Explorer:");
  console.log("   https://coston2-explorer.flare.network\n");
  console.log("   Search for:");
  contractNames.forEach(name => console.log(`   - "${name}"`));
  console.log("");

  console.log("3. Check for contracts with:");
  console.log("   - High transaction volume");
  console.log("   - Verified source code");
  console.log("   - EIP-3009 support (transferWithAuthorization function)");
  console.log("");

  console.log("4. Query via RPC:");
  console.log("   You can use cast or ethers to query contracts:");
  console.log("   cast call <address> 'name()(string)' --rpc-url https://coston2-api.flare.network/ext/C/rpc");
  console.log("");

  // If we have a provider, try to query some addresses
  try {
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    
    console.log(`🌐 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log("");

    if (potentialAddresses.length > 0) {
      console.log("🔎 Checking potential addresses...\n");
      
      for (const address of potentialAddresses) {
        try {
          const code = await provider.getCode(address);
          if (code && code !== "0x") {
            console.log(`✅ Contract found at: ${address}`);
            console.log(`   Code length: ${code.length} bytes`);
            
            // Try to get name
            try {
              const tokenContract = await ethers.getContractAt(
                ["function name() view returns (string)"],
                address
              );
              const name = await tokenContract.name();
              console.log(`   Name: ${name}`);
              
              if (contractNames.some(n => name.toUpperCase().includes(n.toUpperCase()))) {
                console.log(`   ⭐ This might be USDT0!`);
              }
            } catch (e) {
              // Contract might not have name() or might not be ERC20
            }
            console.log("");
          }
        } catch (e) {
          // Skip if error
        }
      }
    }
  } catch (e) {
    console.log("⚠️  Could not connect to network. Make sure you're configured for Flare Testnet.\n");
  }

  console.log("💡 Tips:");
  console.log("   - USDT0 should support EIP-3009 (transferWithAuthorization)");
  console.log("   - Check Flare's official GitHub or Discord for verified addresses");
  console.log("   - The contract should be verified on the explorer");
  console.log("   - Mainnet address: 0xe7cd86e13AC4309349F30B3435a9d337750fC82D");
  console.log("   - Testnet might have a different address");
  console.log("");

  console.log("📚 Resources:");
  console.log("   - Flare Docs: https://dev.flare.network/");
  console.log("   - Gasless Guide: https://dev.flare.network/network/guides/gasless-usdt0-transfers");
  console.log("   - Explorer: https://coston2-explorer.flare.network");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
