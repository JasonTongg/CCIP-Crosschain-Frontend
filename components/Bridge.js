"use client";
import React, { useState, useEffect } from "react";
import {
    useWalletClient,
    usePublicClient,
    useAccount,
    useSwitchChain,
} from "wagmi";
import { parseEther } from "viem";
import {
    sepolia,
    optimismSepolia,
    baseSepolia,
    arbitrumSepolia,
    unichainSepolia,
    soneiumMinato,
} from "wagmi/chains";

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
    {
        name: "allowance",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        outputs: [{ name: "remaining", type: "uint256" }],
    },
];

const bridgeAbi = [
    {
        type: "function",
        name: "bridgeTokens",
        inputs: [
            {
                name: "amountToSend",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "tokenToSendAddress",
                type: "address",
                internalType: "address",
            },
            {
                name: "receiverAddress",
                type: "address",
                internalType: "address",
            },
            {
                name: "destinationChainSelector",
                type: "uint64",
                internalType: "uint64",
            },
            {
                name: "linkTokenAddress",
                type: "address",
                internalType: "address",
            },
            {
                name: "routerAddress",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
];

export default function Bridge() {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address, isConnected, chainId } = useAccount();
    const [loading, setLoading] = useState(false);
    const { switchChain } = useSwitchChain();
    const [originalChainId, setOriginalChainId] = useState(arbitrumSepolia.id);
    const [destinationChainId, setDestinationChainId] = useState(
        sepolia.id
    );
    const [supportedDestinationChain, setSupportedDestinationChain] = useState([
        arbitrumSepolia.id,
        optimismSepolia.id,
        baseSepolia.id,
        unichainSepolia.id,
        soneiumMinato.id,
    ]);

    const [bridgeStatus, setBridgeStatus] = useState([true, false, false]);
    const [bridgeMessage, setBridgeMessage] = useState("");

    function getChainDetails(originalChainId, destinationChainId) {
        let rebaseToken, bridgeContract, linkAddress, destSelector, router;

        if (originalChainId == sepolia.id) {
            rebaseToken = process.env.NEXT_PUBLIC_SEPOLIA_REBASE_TOKEN_ADDRESS;
            bridgeContract = process.env.NEXT_PUBLIC_SEPOLIA_BRIDGE_CONTRACT;
            linkAddress = process.env.NEXT_PUBLIC_SEPOLIA_LINK_ADDRESS;
            router = process.env.NEXT_PUBLIC_SEPOLIA_ROUTER;
        } else if (originalChainId == arbitrumSepolia.id) {
            rebaseToken = process.env.NEXT_PUBLIC_ARBITRUM_REBASE_TOKEN_ADDRESS;
            bridgeContract = process.env.NEXT_PUBLIC_ARBITRUM_BRIDGE_CONTRACT;
            linkAddress = process.env.NEXT_PUBLIC_ARBITRUM_LINK_ADDRESS;
            router = process.env.NEXT_PUBLIC_ARBITRUM_ROUTER;
        } else if (originalChainId == baseSepolia.id) {
            rebaseToken = process.env.NEXT_PUBLIC_BASE_REBASE_TOKEN_ADDRESS;
            bridgeContract = process.env.NEXT_PUBLIC_BASE_BRIDGE_CONTRACT;
            linkAddress = process.env.NEXT_PUBLIC_BASE_LINK_ADDRESS;
            router = process.env.NEXT_PUBLIC_BASE_ROUTER;
        } else if (originalChainId == optimismSepolia.id) {
            rebaseToken = process.env.NEXT_PUBLIC_OP_REBASE_TOKEN_ADDRESS;
            bridgeContract = process.env.NEXT_PUBLIC_OP_BRIDGE_CONTRACT;
            linkAddress = process.env.NEXT_PUBLIC_OP_LINK_ADDRESS;
            router = process.env.NEXT_PUBLIC_OP_ROUTER;
        } else if (originalChainId == unichainSepolia.id) {
            rebaseToken = process.env.NEXT_PUBLIC_UNI_REBASE_TOKEN_ADDRESS;
            bridgeContract = process.env.NEXT_PUBLIC_UNICHAIN_BRIDGE_CONTRACT;
            linkAddress = process.env.NEXT_PUBLIC_UNI_LINK_ADDRESS;
            router = process.env.NEXT_PUBLIC_UNI_ROUTER;
        } else if (originalChainId == soneiumMinato.id) {
            rebaseToken = process.env.NEXT_PUBLIC_SONEIUM_REBASE_TOKEN_ADDRESS;
            bridgeContract = process.env.NEXT_PUBLIC_SONEIUM_BRIDGE_CONTRACT;
            linkAddress = process.env.NEXT_PUBLIC_SONEIUM_LINK_ADDRESS;
            router = process.env.NEXT_PUBLIC_SONEIUM_ROUTER;
        }

        if (destinationChainId == sepolia.id) {
            destSelector = BigInt(process.env.NEXT_PUBLIC_SEPOLIA_CHAIN_SELECTOR);
        } else if (destinationChainId == arbitrumSepolia.id) {
            destSelector = BigInt(
                process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_CHAIN_SELECTOR
            );
        } else if (destinationChainId == baseSepolia.id) {
            destSelector = BigInt(process.env.NEXT_PUBLIC_BASE_CHAIN_SELECTOR);
        } else if (destinationChainId == optimismSepolia.id) {
            destSelector = BigInt(process.env.NEXT_PUBLIC_OP_CHAIN_SELECTOR);
        } else if (destinationChainId == unichainSepolia.id) {
            destSelector = BigInt(process.env.NEXT_PUBLIC_UNI_CHAIN_SELECTOR);
        } else if (destinationChainId == soneiumMinato.id) {
            destSelector = BigInt(process.env.NEXT_PUBLIC_SONEIUM_CHAIN_SELECTOR);
        }

        return { rebaseToken, bridgeContract, linkAddress, destSelector, router };
    }

    async function approveRBT(rebaseToken, bridgeContract, amount) {
        console.log("🔍 Checking rebase token allowance...");

        let currentAllowance = 0n;

        try {
            currentAllowance = await publicClient.readContract({
                address: rebaseToken,
                abi: erc20Abi,
                functionName: "allowance",
                args: [address, bridgeContract],
            });

            console.log(
                `💰 Current rebase token allowance: ${currentAllowance.toString()}`
            );
        } catch (error) {
            console.error("🚨 Failed to read rebase token allowance:", error);

            if (error.shortMessage) {
                setBridgeMessage(`❌ Failed to fetch allowance: ${error.shortMessage}`);
            } else if (error.message) {
                setBridgeMessage(`❌ Failed to fetch allowance: ${error.message}`);
            } else {
                setBridgeMessage("❌ Unknown error occurred while fetching allowance.");
            }
            return;
        }

        // --- Approve Rebase Token ---
        console.log(currentAllowance);
        console.log(amount);
        console.log(currentAllowance < amount);
        try {
            if (currentAllowance < amount) {
                console.log("🔍 Simulating approve transaction...");

                const simulation = await publicClient.simulateContract({
                    account: walletClient.account,
                    address: rebaseToken,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [bridgeContract, amount * 2n],
                });

                console.log("Simmulation done");
                console.log("Executring");
                const approveHash = await walletClient.writeContract(
                    simulation.request
                );

                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: approveHash,
                });

                if (receipt.status !== "success" && !receipt.status !== 1n) {
                    setBridgeMessage("❌ Approval failed on-chain.");
                }
            }
        } catch (error) {
            console.error("🚨 Simulation or transaction failed:", error);

            if (error.shortMessage) {
                setBridgeMessage(`❌ Transaction failed: ${error.shortMessage}`);
            } else if (error.message) {
                setBridgeMessage(`❌ Transaction failed: ${error.message}`);
            } else {
                setBridgeMessage("❌ Unknown error occurred during approval.");
            }
        }
    }

    async function approveLink(bridgeContract, linkAddress) {
        console.log("🔍 Checking LINK allowance...");

        let linkAllowance = 0n;

        try {
            linkAllowance = await publicClient.readContract({
                address: linkAddress,
                abi: erc20Abi,
                functionName: "allowance",
                args: [address, bridgeContract],
            });

            console.log(`💰 Current LINK allowance: ${linkAllowance.toString()}`);
        } catch (error) {
            console.error("🚨 Failed to read LINK token allowance:", error);

            if (error.shortMessage) {
                setBridgeMessage(
                    `❌ Failed to fetch LINK allowance: ${error.shortMessage}`
                );
            } else if (error.message) {
                setBridgeMessage(`❌ Failed to fetch LINK allowance: ${error.message}`);
            } else {
                setBridgeMessage(
                    "❌ Unknown error occurred while fetching LINK allowance."
                );
            }
            return;
        }

        // --- Approve LINK Token ---
        const minLinkAmount = parseEther("0.5");

        try {
            if (linkAllowance < minLinkAmount) {
                console.log("🔍 Simulating LINK approval...");

                const simulation = await publicClient.simulateContract({
                    account: walletClient.account,
                    address: linkAddress,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [bridgeContract, parseEther("5")],
                });

                const approveLinkHash = await walletClient.writeContract(
                    simulation.request
                );

                const receiptLink = await publicClient.waitForTransactionReceipt({
                    hash: approveLinkHash,
                });

                if (receiptLink.status !== "success" && receiptLink.status !== 1n) {
                    setBridgeMessage("❌ LINK approval transaction failed on-chain.");
                }
            }
        } catch (error) {
            console.error(
                "🚨 LINK approval simulation or transaction failed:",
                error
            );

            if (error.shortMessage) {
                setBridgeMessage(`❌ LINK approval failed: ${error.shortMessage}`);
            } else if (error.message) {
                setBridgeMessage(`❌ LINK approval failed: ${error.message}`);
            } else {
                setBridgeMessage("❌ Unknown error occurred during LINK approval.");
            }
        }
    }

    async function handleBridge(
        originalChainId,
        destinationChainId,
        tokenAmount
    ) {
        console.log(originalChainId, destinationChainId, tokenAmount);
        if (!walletClient || !isConnected)
            return alert("Connect your wallet first");

        switchChain({ chainId: originalChainId });
        let amount = parseEther(String(tokenAmount));
        let { rebaseToken, bridgeContract, linkAddress, destSelector, router } =
            getChainDetails(originalChainId, destinationChainId);

        try {
            setLoading(true);
            setBridgeStatus([true, false, false]);

            await approveRBT(rebaseToken, bridgeContract, amount);

            setBridgeStatus([true, true, false]);

            await approveLink(bridgeContract, linkAddress);

            setBridgeStatus([true, true, true]);

            // --- Bridge Tokens ---
            try {
                console.log(`🔍 Simulating bridge transaction...`);

                const simulation = await publicClient.simulateContract({
                    account: walletClient.account,
                    address: bridgeContract,
                    abi: bridgeAbi,
                    functionName: "bridgeTokens",
                    args: [
                        amount,
                        rebaseToken,
                        address,
                        destSelector,
                        linkAddress,
                        router,
                    ],
                });

                const bridgeHash = await walletClient.writeContract(simulation.request);

                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: bridgeHash,
                });

                if (receipt.status !== "success" && receipt.status !== 1n) {
                    setBridgeMessage("❌ Bridge transaction failed on-chain.");
                } else {
                    alert("Bridge Success");
                }

                console.log(receipt);
            } catch (error) {
                console.error("🚨 Bridge simulation or execution failed:", error);

                if (error.shortMessage) {
                    setBridgeMessage(`❌ Bridge failed: ${error.shortMessage}`);
                } else if (error.message) {
                    setBridgeMessage(`❌ Bridge failed: ${error.message}`);
                } else {
                    setBridgeMessage("❌ Unknown error occurred during bridging.");
                }
            }
        } catch (err) {
            console.error("❌ Error:", err);
            setBridgeMessage(`Error: ${err.shortMessage || err.message}`);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        switchChain({ chainId: arbitrumSepolia.id });
    }, [isConnected])

    useEffect(() => {
        if (originalChainId == sepolia.id) {
            setSupportedDestinationChain([
                arbitrumSepolia.id,
                optimismSepolia.id,
                baseSepolia.id,
                unichainSepolia.id,
                soneiumMinato.id,
            ])
        }
        else if (originalChainId == arbitrumSepolia.id) {
            setSupportedDestinationChain([
                sepolia.id,
                optimismSepolia.id,
                baseSepolia.id,
                soneiumMinato.id,
            ])
        }
        else if (originalChainId == optimismSepolia.id) {
            setSupportedDestinationChain([
                arbitrumSepolia.id,
                baseSepolia.id,
                sepolia.id
            ])
        }
        else if (originalChainId == baseSepolia.id) {
            setSupportedDestinationChain([
                arbitrumSepolia.id,
                optimismSepolia.id,
                sepolia.id
            ])
        }
        else if (originalChainId == unichainSepolia.id) {
            setSupportedDestinationChain([
                sepolia.id
            ])
        }
        else if (originalChainId == soneiumMinato.id) {
            setSupportedDestinationChain([
                arbitrumSepolia.id,
                sepolia.id
            ])
        }
    }, [originalChainId])

    useEffect(() => {
        setOriginalChainId(chainId);
    }, [chainId])

    return (
        <div className='w-full relative min-h-screen flex flex-col items-center justify-center gap-4'>
            <select
                onChange={(e) => {
                    setOriginalChainId(e.target.value)
                    switchChain({ chainId: Number(e.target.value) });
                }}
                value={originalChainId}
            >
                <option value={sepolia.id}>ETH Sepolia</option>
                <option value={optimismSepolia.id}>OP Sepolia</option>
                <option value={arbitrumSepolia.id}>Arbitrum Sepolia</option>
                <option value={baseSepolia.id}>Base Sepolia</option>
                <option value={unichainSepolia.id}>Unichain Sepolia</option>
                <option value={soneiumMinato.id}>Soneium Sepolia</option>
            </select>
            <select
                onChange={(e) => setDestinationChainId(e.target.value)}
                value={destinationChainId}
            >
                {supportedDestinationChain.map((item, index) => (
                    <option key={index} value={item}>
                        {getChainName(item)}
                    </option>
                ))}
            </select>
            {loading === true && bridgeStatus[0] === true && (
                <p>Approving Rebase Token </p>
            )}
            {loading === true && bridgeStatus[1] === true && (
                <p>Approving Link Token </p>
            )}
            {loading === true && bridgeStatus[2] === true && <p>Bridging </p>}
            <p>{bridgeMessage}</p>
            <button
                onClick={() =>
                    handleBridge(originalChainId, destinationChainId, "0.00001")
                }
                disabled={!isConnected || loading}
                className='bg-blue-500 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-600 disabled:opacity-50'
            >
                {loading ? "Processing..." : "Bridge Tokens"}
            </button>
        </div>
    );
}
