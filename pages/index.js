"use client";
import React, { useState } from "react";
import { useWalletClient, usePublicClient, useAccount } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const ARBITRUM_REBASE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_ARBITRUM_REBASE_TOKEN_ADDRESS;
const ARBITRUM_LINK_ADDRESS = process.env.NEXT_PUBLIC_ARBITRUM_LINK_ADDRESS;
const ARBITRUM_BRIDGE_CONTRACT = process.env.NEXT_PUBLIC_ARBITRUM_BRIDGE_CONTRACT;
const ARBITRUM_ROUTER = process.env.NEXT_PUBLIC_ARBITRUM_ROUTER;
const DEST_SELECTOR = BigInt(process.env.NEXT_PUBLIC_SEPOLIA_CHAIN_SELECTOR);

const erc20Abi = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
];

const bridgeAbi = [
  {
    name: "bridgeTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountToSend", type: "uint256" },
      { name: "tokenToSendAddress", type: "address" },
      { name: "receiverAddress", type: "address" },
      { name: "destinationChainSelector", type: "uint64" },
      { name: "linkTokenAddress", type: "address" },
      { name: "routerAddress", type: "address" },
    ],
    outputs: [],
  },
];

export default function Index() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);

  async function handleBridge() {
    if (!walletClient || !isConnected) return alert("Connect your wallet first");

    const amount = parseEther("0.01");

    try {
      setLoading(true);

      // --- Approve Rebase Token ---
      console.log("🔁 Approving rebase token...");
      const approveTokenHash = await walletClient.writeContract({
        address: ARBITRUM_REBASE_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [ARBITRUM_BRIDGE_CONTRACT, amount * 2n],
      });

      await publicClient.waitForTransactionReceipt({ hash: approveTokenHash });
      console.log("✅ Rebase token approved");

      // --- Approve LINK Token ---
      console.log("🔁 Approving LINK...");
      const approveLinkHash = await walletClient.writeContract({
        address: ARBITRUM_LINK_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [ARBITRUM_BRIDGE_CONTRACT, parseEther("5")],
      });

      await publicClient.waitForTransactionReceipt({ hash: approveLinkHash });
      console.log("✅ LINK approved");

      // --- Bridge Tokens ---
      console.log(`🔁 Bridging ${amount} from Arbitrum → Sepolia...`);
      const bridgeHash = await walletClient.writeContract({
        address: ARBITRUM_BRIDGE_CONTRACT,
        abi: bridgeAbi,
        functionName: "bridgeTokens",
        args: [
          amount,
          ARBITRUM_REBASE_TOKEN_ADDRESS,
          address,
          DEST_SELECTOR,
          ARBITRUM_LINK_ADDRESS,
          ARBITRUM_ROUTER,
        ],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: bridgeHash });

      // Log out the transaction receipt
      console.log("✅ Bridge transaction confirmed");
      console.log("🧾 Transaction receipt:", receipt);

      alert("✅ Bridge transaction completed successfully!");
    } catch (err) {
      console.error("❌ Error:", err);
      alert(`Error: ${err.shortMessage || err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full relative min-h-screen flex flex-col items-center justify-center gap-4">
      <ConnectButton />
      <button
        onClick={handleBridge}
        disabled={!isConnected || loading}
        className="bg-blue-500 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Bridge Tokens"}
      </button>
    </div>
  );
}
