"use client";
import React, { useState, useEffect } from "react";
import { useWalletClient, useAccount, usePublicClient, useSwitchChain } from "wagmi";
import { parseEther, formatEther } from "viem";
import {
    sepolia,
    optimismSepolia,
    baseSepolia,
    arbitrumSepolia,
    unichainSepolia,
    soneiumMinato,
} from "wagmi/chains";


const vaultAbi = [
    {
        type: "function",
        name: "deposit",
        stateMutability: "payable",
        inputs: [],
        outputs: [],
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "redeem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const erc20Abi = [
    {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        type: "function",
        name: "getUserInterestRate",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
];

export default function Deposit() {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { isConnected, address, chainId } = useAccount();

    const [amount, setAmount] = useState("");
    const [redeemAmount, setRedeemAmount] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const [selectChain, setSelectChain] = useState(arbitrumSepolia.id);
    const { switchChainAsync, switchChain } = useSwitchChain();

    const [userBalance, setUserBalance] = useState("0");
    const [userInterestRate, setUserInterestRate] = useState("0");

    function getVaultAddress(selectChainId) {
        switch (Number(selectChainId)) {
            case sepolia.id:
                return process.env.NEXT_PUBLIC_SEPOLIA_VAULT_ADDRESS;
            case optimismSepolia.id:
                return process.env.NEXT_PUBLIC_OP_VAULT_ADDRESS;
            case arbitrumSepolia.id:
                return process.env.NEXT_PUBLIC_ARBITRUM_VAULT_ADDRESS;
            case baseSepolia.id:
                return process.env.NEXT_PUBLIC_BASE_VAULT_ADDRESS;
            case unichainSepolia.id:
                return process.env.NEXT_PUBLIC_UNI_VAULT_ADDRESS;
            case soneiumMinato.id:
                return process.env.NEXT_PUBLIC_SONEIUM_VAULT_ADDRESS;
        }
    }

    function getRebaseTokenAddress(selectChainId) {
        switch (Number(selectChainId)) {
            case sepolia.id:
                return process.env.NEXT_PUBLIC_SEPOLIA_REBASE_TOKEN_ADDRESS;
            case optimismSepolia.id:
                return process.env.NEXT_PUBLIC_OP_REBASE_TOKEN_ADDRESS;
            case arbitrumSepolia.id:
                return process.env.NEXT_PUBLIC_ARBITRUM_REBASE_TOKEN_ADDRESS;
            case baseSepolia.id:
                return process.env.NEXT_PUBLIC_BASE_REBASE_TOKEN_ADDRESS;
            case unichainSepolia.id:
                return process.env.NEXT_PUBLIC_UNI_REBASE_TOKEN_ADDRESS;
            case soneiumMinato.id:
                return process.env.NEXT_PUBLIC_SONEIUM_REBASE_TOKEN_ADDRESS;
        }
    }

    async function getUserBalance() {
        try {
            if (!publicClient || !address || !selectChain) throw new Error("Missing inputs");

            const tokenAddress = getRebaseTokenAddress(selectChain);
            if (!tokenAddress) throw new Error("Token address not found for this chain");

            const balance = await publicClient.readContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: "balanceOf",
                args: [address],
            });

            console.log("💰 User balance:", balance);
            console.log("💰 Formatted balance:", formatEther(balance));

            setUserBalance(formatEther(balance));
        } catch (err) {
            console.error("❌ Error fetching user balance:", err);
            return "0";
        }
    }

    async function getUserInterestRate() {
        try {
            const tokenAddress = getRebaseTokenAddress(selectChain);
            if (!tokenAddress) throw new Error("Token address not found for this chain");

            const interestRate = await publicClient.readContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: "getUserInterestRate",
                args: [address],
            });

            console.log("💰 User InterestRate:", interestRate);
            console.log("💰 Formatted InterestRate:", formatEther(interestRate));

            setUserInterestRate(formatEther(interestRate));
        } catch (err) {
            console.error("❌ Error fetching user balance:", err);
            return "0";
        }
    }

    async function handleDeposit() {
        if (!walletClient || !isConnected) {
            setStatusMessage("⚠️ Please connect your wallet first.");
            return;
        }

        try {
            // Step 1: Simulate transaction
            setStatusMessage("🔍 Simulating deposit transaction...");

            const simulation = await publicClient.simulateContract({
                address: getVaultAddress(selectChain),
                abi: vaultAbi,
                functionName: "deposit",
                account: walletClient.account,
                value: parseEther(amount),
            });

            console.log("🧪 Simulation result:", simulation);
            setStatusMessage("✅ Simulation successful. Executing transaction...");

            // Step 2: Execute transaction
            const txHash = await walletClient.writeContract(simulation.request);
            console.log("🚀 Transaction sent:", txHash);
            setStatusMessage("⏳ Waiting for confirmation...");

            // Step 3: Wait for confirmation
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
            console.log("🎉 Deposit confirmed:", receipt);
            setStatusMessage("✅ Deposit successful!");

            handleChainChange();
        } catch (err) {
            console.error("❌ Deposit failed:", err);
            setStatusMessage("❌ Deposit failed. Check console for details.");
        }
    }

    async function handleWithdraw() {
        if (!walletClient || !isConnected) {
            setStatusMessage("⚠️ Please connect your wallet first.");
            return;
        }

        try {
            // Step 1: Prepare amount (use max if empty)
            const withdrawAmount = redeemAmount && redeemAmount !== ""
                ? parseEther(redeemAmount)
                : BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"); // type(uint256).max

            // Step 2: Simulate transaction
            setStatusMessage("🔍 Simulating withdraw transaction...");

            const simulation = await publicClient.simulateContract({
                address: getVaultAddress(selectChain),
                abi: vaultAbi,
                functionName: "redeem",
                account: walletClient.account,
                args: [withdrawAmount],
            });

            console.log("🧪 Simulation result:", simulation);
            setStatusMessage("✅ Simulation successful. Executing transaction...");

            // Step 3: Execute transaction
            const txHash = await walletClient.writeContract(simulation.request);
            console.log("🚀 Transaction sent:", txHash);
            setStatusMessage("⏳ Waiting for confirmation...");

            // Step 4: Wait for confirmation
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
            console.log("🎉 Withdraw confirmed:", receipt);
            setStatusMessage("✅ Withdraw successful!");

            handleChainChange();
        } catch (err) {
            console.error("❌ Withdraw failed:", err);
            setStatusMessage("❌ Withdraw failed. Check console for details.");
        }
    }


    function getChainName(chainId) {
        switch (Number(chainId)) {
            case sepolia.id:
                return "ETH Sepolia";
            case optimismSepolia.id:
                return "OP Sepolia";
            case arbitrumSepolia.id:
                return "Arbitrum Sepolia";
            case baseSepolia.id:
                return "Base Sepolia";
            case unichainSepolia.id:
                return "Unichain Sepolia";
            case soneiumMinato.id:
                return "Soneium Sepolia";
            default:
                return "Unknown Chain";
        }
    }

    function getDailyInterestRate(ratePerSecond) {
        const secondsPerDay = 86400; // 24 * 60 * 60
        const ratePerDay = ratePerSecond * secondsPerDay;

        return {
            decimal: ratePerDay,              // e.g. 0.00432
            percent: ratePerDay * 100,        // e.g. 0.432%
            formatted: `${(ratePerDay * 100).toFixed(6)}% per day`,
        };
    }

    async function handleChainChange() {
        try {
            console.log("🔄 Switching to chain:", selectChain);
            const switched = await switchChainAsync({ chainId: Number(selectChain) });
            console.log("✅ Chain switched:", switched.name);

            // 🔥 Recreate the public client for the new chain
            const { createPublicClient, http } = await import("viem");

            const newPublicClient = createPublicClient({
                chain: switched, // use the newly switched chain config
                transport: http(),
            });

            // manually override your publicClient reference
            Object.assign(publicClient, newPublicClient);

            // ✅ Now safely fetch data from the correct chain
            await getUserBalance();
            await getUserInterestRate();
        } catch (err) {
            console.error("❌ Error switching chain or fetching data:", err);
        }
    }

    useEffect(() => {
        if (isConnected && selectChain) handleChainChange();
    }, [selectChain, isConnected]);



    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">User Balance: {Number(userBalance).toFixed(4)} RBT</h2>
            <p className="text-md">User Interest Rate: {getDailyInterestRate(userInterestRate).percent}% per day</p>

            <select value={selectChain} onChange={(e) => {
                setSelectChain(e.target.value)
            }}>
                <option value={sepolia.id}>{getChainName(sepolia.id)}</option>
                <option value={arbitrumSepolia.id}>{getChainName(arbitrumSepolia.id)}</option>
                <option value={baseSepolia.id}>{getChainName(baseSepolia.id)}</option>
                <option value={optimismSepolia.id}>{getChainName(optimismSepolia.id)}</option>
                <option value={unichainSepolia.id}>{getChainName(unichainSepolia.id)}</option>
                <option value={soneiumMinato.id}>{getChainName(soneiumMinato.id)}</option>
            </select>

            <input
                type="number"
                placeholder="Amount in ETH"
                className="border p-2 rounded mr-2"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <button
                onClick={handleDeposit}
                disabled={!isConnected || !amount}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                Deposit
            </button>

            <input
                type="number"
                placeholder="Amount in ETH"
                className="border p-2 rounded mr-2"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
            />

            <button
                onClick={handleWithdraw}
                disabled={!isConnected || !redeemAmount}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                Withdraw
            </button>

            {statusMessage && (
                <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">{statusMessage}</p>
            )}
        </div>
    );
}
