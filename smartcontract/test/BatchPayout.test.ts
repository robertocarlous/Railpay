import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { getAddress, parseEther } from "viem";
import hre from "hardhat";

// Mock ERC20 token for testing
const MOCK_TOKEN_ABI = [
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "decimals", type: "uint8" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

describe("BatchPayout", function () {
  async function deployBatchPayoutFixture() {
    const [owner, payer, recipient1, recipient2, recipient3] =
      await hre.viem.getWalletClients();

    // Deploy mock ERC20 token (simulating USDT0)
    const mockToken = await hre.viem.deployContract("MockERC20", [
      "USDT0",
      "USDT0",
      18,
    ]);

    // Deploy BatchPayout contract
    const batchPayout = await hre.viem.deployContract("BatchPayout", [
      await mockToken.getAddress(),
    ]);

    // Mint tokens to payer
    const mintAmount = parseEther("10000");
    await mockToken.write.mint([await payer.account.address, mintAmount]);

    return {
      batchPayout,
      mockToken,
      owner,
      payer,
      recipient1,
      recipient2,
      recipient3,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct USDT0 address", async function () {
      const { batchPayout, mockToken } = await loadFixture(
        deployBatchPayoutFixture
      );

      const usdt0Address = await batchPayout.read.usdt0();
      expect(usdt0Address.toLowerCase()).to.equal(
        (await mockToken.getAddress()).toLowerCase()
      );
    });

    it("Should set the deployer as owner", async function () {
      const { batchPayout, owner } = await loadFixture(
        deployBatchPayoutFixture
      );

      const contractOwner = await batchPayout.read.owner();
      expect(contractOwner.toLowerCase()).to.equal(
        (await owner.account.address).toLowerCase()
      );
    });
  });

  describe("Batch Payout", function () {
    it("Should execute batch payout successfully", async function () {
      const { batchPayout, mockToken, payer, recipient1, recipient2 } =
        await loadFixture(deployBatchPayoutFixture);

      const recipients = [
        await recipient1.account.address,
        await recipient2.account.address,
      ];
      const amounts = [parseEther("100"), parseEther("200")];
      const proofRailsId = "proof-123";

      // Approve contract to spend tokens
      const totalAmount = amounts[0] + amounts[1];
      await mockToken.write.approve(
        [await batchPayout.getAddress(), totalAmount],
        { account: payer.account }
      );

      // Execute batch payout
      const tx = await batchPayout.write.batchPayout(
        [recipients, amounts, proofRailsId],
        { account: payer.account }
      );

      // Check balances
      const balance1 = await mockToken.read.balanceOf([
        await recipient1.account.address,
      ]);
      const balance2 = await mockToken.read.balanceOf([
        await recipient2.account.address,
      ]);

      expect(balance1).to.equal(amounts[0]);
      expect(balance2).to.equal(amounts[1]);
    });

    it("Should revert if arrays length mismatch", async function () {
      const { batchPayout, payer, recipient1 } = await loadFixture(
        deployBatchPayoutFixture
      );

      const recipients = [await recipient1.account.address];
      const amounts = [parseEther("100"), parseEther("200")]; // Different length
      const proofRailsId = "proof-123";

      await expect(
        batchPayout.write.batchPayout([recipients, amounts, proofRailsId], {
          account: payer.account,
        })
      ).to.be.rejectedWith("BatchPayout: array length mismatch");
    });

    it("Should revert if insufficient allowance", async function () {
      const { batchPayout, payer, recipient1 } = await loadFixture(
        deployBatchPayoutFixture
      );

      const recipients = [await recipient1.account.address];
      const amounts = [parseEther("100")];
      const proofRailsId = "proof-123";

      // Don't approve - should fail
      await expect(
        batchPayout.write.batchPayout([recipients, amounts, proofRailsId], {
          account: payer.account,
        })
      ).to.be.rejectedWith("BatchPayout: insufficient allowance");
    });
  });
});
