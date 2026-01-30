import BatchPayoutABI from "./BatchPayout.json";

// Get contract address from environment variable
const getContractAddress = (): `0x${string}` => {
  const address = process.env.NEXT_PUBLIC_BATCH_PAYOUT_ADDRESS;
  if (!address) {
    throw new Error("NEXT_PUBLIC_BATCH_PAYOUT_ADDRESS is not set in environment variables");
  }
  if (!address.startsWith("0x") || address.length !== 42) {
    throw new Error("Invalid contract address format");
  }
  return address as `0x${string}`;
};

// BatchPayout.json is the ABI array directly
export const batchPayoutABI = BatchPayoutABI;

export const batchPayoutContract = {
  address: getContractAddress(),
  abi: BatchPayoutABI,
};