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
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Eth from "../public/assets/eth.png";
import Base from "../public/assets/base.png";
import Arb from "../public/assets/arb.png";
import Op from "../public/assets/op.png";
import Soneium from "../public/assets/soneium.png";
import Uni from "../public/assets/uni.png";
import Image from "next/image";
import { MdOutlineSwapVert } from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Link from "next/link";
import Loading from "../public/assets/loading.gif";
import { motion } from "framer-motion";
import { LuArrowRight } from "react-icons/lu";
import Animation from "../public/assets/animation.gif";

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

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "#f4f5f6",
	boxShadow: 24,
	p: 4,
	color: "black",
	borderRadius: "20px",
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	textAlign: "center",
};

export default function Bridge() {
	const publicClient = usePublicClient();
	const { data: walletClient } = useWalletClient();
	const { address, isConnected, chainId } = useAccount();
	const [loading, setLoading] = useState(false);
	const { switchChain } = useSwitchChain();
	const [originalChainId, setOriginalChainId] = useState(arbitrumSepolia.id);
	const [destinationChainId, setDestinationChainId] = useState(sepolia.id);
	const [supportedDestinationChain, setSupportedDestinationChain] = useState([
		arbitrumSepolia.id,
		optimismSepolia.id,
		baseSepolia.id,
		unichainSepolia.id,
		soneiumMinato.id,
	]);
	const { RBTBalance, LinkBalance } = useSelector((data) => data.data);
	const [bridgeAmount, setBridgeAmount] = useState("");

	const [bridgeStatus, setBridgeStatus] = useState([true, false, false, false]);
	const [bridgeMessage, setBridgeMessage] = useState("");

	const [isBridging, setIsBridging] = useState(false);

	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

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
		} catch (error) {
			if (error.shortMessage) {
				toast.error(`Failed to fetch allowance: ${error.shortMessage}`);
			} else if (error.message) {
				toast.error(`Failed to fetch allowance: ${error.message}`);
			} else {
				toast.error("Unknown error occurred while fetching allowance.");
			}
			return;
		}

		try {
			if (currentAllowance < amount) {
				const simulation = await publicClient.simulateContract({
					account: walletClient.account,
					address: rebaseToken,
					abi: erc20Abi,
					functionName: "approve",
					args: [bridgeContract, amount * 2n],
				});

				const approveHash = await walletClient.writeContract(
					simulation.request
				);

				const receipt = await publicClient.waitForTransactionReceipt({
					hash: approveHash,
				});

				if (receipt.status !== "success" && !receipt.status !== 1n) {
					toast.error("Approval failed on-chain.");
				}
			}
		} catch (error) {
			if (error.shortMessage) {
				toast.error(`Transaction failed: ${error.shortMessage}`);
			} else if (error.message) {
				toast.error(`Transaction failed: ${error.message}`);
			} else {
				toast.error("Unknown error occurred during approval.");
			}
		}
	}

	async function approveLink(bridgeContract, linkAddress) {
		let linkAllowance = 0n;

		try {
			linkAllowance = await publicClient.readContract({
				address: linkAddress,
				abi: erc20Abi,
				functionName: "allowance",
				args: [address, bridgeContract],
			});
		} catch (error) {
			if (error.shortMessage) {
				toast.error(`Failed to fetch LINK allowance: ${error.shortMessage}`);
			} else if (error.message) {
				toast.error(`Failed to fetch LINK allowance: ${error.message}`);
			} else {
				toast.error("Unknown error occurred while fetching LINK allowance.");
			}
			return;
		}

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
					toast.error("LINK approval transaction failed on-chain.");
				}
			}
		} catch (error) {
			if (error.shortMessage) {
				toast.error(`LINK approval failed: ${error.shortMessage}`);
			} else if (error.message) {
				toast.error(`LINK approval failed: ${error.message}`);
			} else {
				toast.error("Unknown error occurred during LINK approval.");
			}
		}
	}

	async function handleBridge(
		originalChainId,
		destinationChainId,
		tokenAmount
	) {
		console.log(originalChainId, destinationChainId, tokenAmount);
		if (!walletClient || !isConnected) {
			toast.error("⚠️ Please connect your wallet first.");
			return;
		}

		if (Number(bridgeAmount) <= 0) {
			toast.error("⚠️ Amount must be larger then 0");
			return;
		}

		switchChain({ chainId: originalChainId });
		let amount = parseEther(String(tokenAmount));
		let { rebaseToken, bridgeContract, linkAddress, destSelector, router } =
			getChainDetails(originalChainId, destinationChainId);

		try {
			setLoading(true);
			setIsBridging(true);
			setBridgeStatus([true, false, false, false]);

			await approveRBT(rebaseToken, bridgeContract, amount);

			setBridgeStatus([true, true, false, false]);

			await approveLink(bridgeContract, linkAddress);

			setBridgeStatus([true, true, true, false]);

			try {
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
					toast.error("Bridge transaction failed on-chain.");
				} else {
					setBridgeStatus([true, true, true, true]);
					handleOpen();
				}

				console.log(receipt);
			} catch (error) {
				if (error.shortMessage) {
					toast.error(`Bridge failed: ${error.shortMessage}`);
				} else if (error.message) {
					toast.error(`Bridge failed: ${error.message}`);
				} else {
					toast.error("Unknown error occurred during bridging.");
				}
			}
		} catch (err) {
			toast.error(`Error: ${err.shortMessage || err.message}`);
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

	function getImage(chainId) {
		switch (Number(chainId)) {
			case sepolia.id:
				return Eth;
			case optimismSepolia.id:
				return Op;
			case arbitrumSepolia.id:
				return Arb;
			case baseSepolia.id:
				return Base;
			case unichainSepolia.id:
				return Uni;
			case soneiumMinato.id:
				return Soneium;
		}
	}

	useEffect(() => {
		switchChain({ chainId: arbitrumSepolia.id });
	}, [isConnected]);

	useEffect(() => {
		if (originalChainId == sepolia.id) {
			setSupportedDestinationChain([
				arbitrumSepolia.id,
				optimismSepolia.id,
				baseSepolia.id,
				unichainSepolia.id,
				soneiumMinato.id,
			]);
			setDestinationChainId(arbitrumSepolia.id);
		} else if (originalChainId == arbitrumSepolia.id) {
			setSupportedDestinationChain([
				sepolia.id,
				optimismSepolia.id,
				baseSepolia.id,
				soneiumMinato.id,
			]);
			setDestinationChainId(sepolia.id);
		} else if (originalChainId == optimismSepolia.id) {
			setSupportedDestinationChain([
				arbitrumSepolia.id,
				baseSepolia.id,
				sepolia.id,
			]);
			setDestinationChainId(arbitrumSepolia.id);
		} else if (originalChainId == baseSepolia.id) {
			setSupportedDestinationChain([
				arbitrumSepolia.id,
				optimismSepolia.id,
				sepolia.id,
			]);
			setDestinationChainId(arbitrumSepolia.id);
		} else if (originalChainId == unichainSepolia.id) {
			setSupportedDestinationChain([sepolia.id]);
			setDestinationChainId(sepolia.id);
		} else if (originalChainId == soneiumMinato.id) {
			setSupportedDestinationChain([arbitrumSepolia.id, sepolia.id]);
			setDestinationChainId(arbitrumSepolia.id);
		}
	}, [originalChainId]);

	useEffect(() => {
		setOriginalChainId(chainId);
	}, [chainId]);

	return (
		<>
			<motion.div
				initial={{ transform: "translateX(-100px)", opacity: 0 }}
				whileInView={{ transform: "translateX(0px)", opacity: 1 }}
				exit={{ transform: "translateX(-100px)", opacity: 0 }}
				transition={{ duration: 0.5 }}
			>
				<Modal open={open} onClose={handleClose}>
					<Box sx={style}>
						<Image src={Loading} className='w-[100px] mx-auto mb-[0.5rem]' />
						<Typography variant='h6' fontWeight='bold' gutterBottom>
							Token Bridge in Progress
						</Typography>
						<Typography variant='body1' sx={{ mb: 2 }}>
							Your token bridge transaction is being processed. <br />
							Estimated arrival time: <b>~30 minutes</b>.
						</Typography>
						<Typography variant='body2'>
							You can track the progress using the link below:
						</Typography>
						<Link
							href={`https://ccip.chain.link/address/${address}`}
							target='_blank'
							rel='noopener noreferrer'
							className='font-bold text-blue-500 inline-block mt-1'
						>
							View Transaction Progress
						</Link>
					</Box>
				</Modal>
			</motion.div>
			{isBridging ? (
				<motion.div
					initial={{ transform: "translateX(-100px)", opacity: 0 }}
					whileInView={{ transform: "translateX(0px)", opacity: 1 }}
					exit={{ transform: "translateX(-100px)", opacity: 0 }}
					transition={{ duration: 0.5 }}
					id='bridge'
					className='w-full relative grid gap-4 pb-[1rem]'
					style={{
						gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
					}}
				>
					<div className='w-full flex flex-col gap-4'>
						<h2 className='text-2xl font-bold '>Transfer</h2>
						<p className='text-gray-500'>
							Your token transfer is curretly being sent securely cross chain
							using Chainlink CCIP.
						</p>
						<div className='flex flex-col gap-5'>
							<div className='flex items-center justify-start gap-7'>
								{bridgeStatus[0] === true ? (
									<div className='w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_3px_rgba(59,130,246,0.7)]'></div>
								) : (
									<div className='w-3 h-3 bg-gray-300 rounded-full shadow-[0_0_10px_3px_rgba(107,114,128,0.4)]'></div>
								)}
								<p
									className='text-lg font-bold'
									style={{
										color: bridgeStatus[0] === false ? "#d1d5db" : "inherit",
									}}
								>
									Approve RBT Token
								</p>
								{bridgeStatus[0] === true && bridgeStatus[1] === false && (
									<div className='rounded-[100px] px-3 py-1 bg-blue-200 text-blue-600 text-center'>
										In Progress
									</div>
								)}
							</div>
							<div className='flex items-center justify-start gap-7'>
								{bridgeStatus[1] === true ? (
									<div className='w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_3px_rgba(59,130,246,0.7)]'></div>
								) : (
									<div className='w-3 h-3 bg-gray-300 rounded-full shadow-[0_0_10px_3px_rgba(107,114,128,0.4)]'></div>
								)}
								<p
									className='text-lg font-bold'
									style={{
										color: bridgeStatus[1] === false ? "#d1d5db" : "inherit",
									}}
								>
									Approve LINK Token
								</p>
								{bridgeStatus[1] === true && bridgeStatus[2] === false && (
									<div className='rounded-[100px] px-3 py-1 bg-blue-200 text-blue-600 text-center'>
										In Progress
									</div>
								)}
							</div>
							<div className='flex items-center justify-start gap-7'>
								{bridgeStatus[2] === true ? (
									<div className='w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_3px_rgba(59,130,246,0.7)]'></div>
								) : (
									<div className='w-3 h-3 bg-gray-300 rounded-full shadow-[0_0_10px_3px_rgba(107,114,128,0.4)]'></div>
								)}
								<p
									className='text-lg font-bold'
									style={{
										color: bridgeStatus[2] === false ? "#d1d5db" : "inherit",
									}}
								>
									Publishing CCIP commitment
								</p>
								{bridgeStatus[2] === true && bridgeStatus[3] === false && (
									<div className='rounded-[100px] px-3 py-1 bg-blue-200 text-blue-600 text-center'>
										In Progress
									</div>
								)}
							</div>
							<div className='flex items-center justify-start gap-7'>
								{bridgeStatus[3] === true ? (
									<div className='w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_3px_rgba(59,130,246,0.7)]'></div>
								) : (
									<div className='w-3 h-3 bg-gray-300 rounded-full shadow-[0_0_10px_3px_rgba(107,114,128,0.4)]'></div>
								)}
								<p
									className='text-lg font-bold'
									style={{
										color: bridgeStatus[3] === false ? "#d1d5db" : "inherit",
									}}
								>
									Bridging
								</p>
								{bridgeStatus[3] === true && bridgeStatus[4] === false && (
									<div className='rounded-[100px] px-3 py-1 bg-blue-200 text-blue-600 text-center'>
										In Progress
									</div>
								)}
							</div>
						</div>
						<h2 className='text-2xl font-bold mt-[1.7rem]'>Summary</h2>
						<div className='flex items-center justify-start gap-3'>
							<Image
								src={getImage(originalChainId)}
								className='w-[50px] h-auto'
							/>
							<LuArrowRight className='text-2xl' />
							<p className='text-xl font-bold text-center'>
								{bridgeAmount} RBT
							</p>
							<LuArrowRight className='text-2xl' />
							<Image
								src={getImage(destinationChainId)}
								className='w-[50px] h-auto'
							/>
						</div>
						{bridgeStatus.some((item) => item === false) === false && (
							<button
								onClick={() => {
									setIsBridging(false);
									setBridgeAmount("");
								}}
								className='w-full bg-gradient-to-tr from-cyan-500 font-bold to-teal-400 hover:scale-105 transition-all text-white rounded-[10px] px-8 py-3 mt-[0.5rem]'
							>
								BACK TO BRIDGE
							</button>
						)}
					</div>
					<div className='bg-gray-500 w-full'></div>
				</motion.div>
			) : (
				<motion.div
					initial={{ transform: "translateX(-100px)", opacity: 0 }}
					whileInView={{ transform: "translateX(0px)", opacity: 1 }}
					exit={{ transform: "translateX(-100px)", opacity: 0 }}
					transition={{ duration: 0.5 }}
					id='bridge'
					className='w-full relative grid gap-4 pb-[1rem]'
					style={{
						gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
					}}
				>
					<div className='min-h-[200px]  w-full'>
						<h2 className='text-2xl font-bold mb-[1.5rem]'>Networks</h2>
						<div className='flex flex-col items-start justify-center'>
							<p className='text-gray-500'>From</p>
							<Box sx={{ minWidth: 120, width: "100%" }}>
								<FormControl fullWidth>
									<Select
										labelId='demo-simple-select-label'
										id='demo-simple-select'
										value={originalChainId}
										displayEmpty
										onChange={(e) => {
											setOriginalChainId(e.target.value);
											switchChain({ chainId: Number(e.target.value) });
										}}
										sx={{
											color: "black !important",
											"& .MuiOutlinedInput-notchedOutline": {
												borderColor: "rgba(156,163,175,0.5) !important",
											},
											"&:hover .MuiOutlinedInput-notchedOutline": {
												borderColor: "rgba(156,163,175,0.5) !important",
											},
											"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
												borderColor: "rgba(156,163,175,0.5) !important",
											},
											"& .MuiSvgIcon-root": {
												color: "black !important",
											},
										}}
									>
										<MenuItem value={sepolia.id}>
											<div className='flex items-center gap-2'>
												<Image
													src={Eth}
													className='w-[30px] h-auto rounded-[8px]'
												/>{" "}
												ETH Sepolia
											</div>
										</MenuItem>
										<MenuItem value={optimismSepolia.id}>
											<div className='flex items-center gap-2'>
												<Image
													src={Op}
													className='w-[30px] h-auto rounded-[8px]'
												/>{" "}
												OP Sepolia
											</div>
										</MenuItem>
										<MenuItem value={arbitrumSepolia.id}>
											<div className='flex items-center gap-2'>
												<Image
													src={Arb}
													className='w-[30px] h-auto rounded-[8px]'
												/>{" "}
												Arbitrum Sepolia
											</div>
										</MenuItem>
										<MenuItem value={baseSepolia.id}>
											<div className='flex items-center gap-2'>
												<Image
													src={Base}
													className='w-[30px] h-auto rounded-[8px]'
												/>{" "}
												Base Sepolia
											</div>
										</MenuItem>
										<MenuItem value={unichainSepolia.id}>
											<div className='flex items-center gap-2'>
												<Image
													src={Uni}
													className='w-[30px] h-auto rounded-[8px]'
												/>{" "}
												Unichain Sepolia
											</div>
										</MenuItem>
										<MenuItem value={soneiumMinato.id}>
											<div className='flex items-center gap-2'>
												<Image
													src={Soneium}
													className='w-[30px] h-auto rounded-[8px]'
												/>{" "}
												Soneium Sepolia
											</div>
										</MenuItem>
									</Select>
								</FormControl>
							</Box>
						</div>
						<MdOutlineSwapVert className='text-[2rem] translate-y-2 mx-auto mt-[0.7rem]' />
						<div className='flex flex-col items-start justify-center'>
							<p className='text-gray-500'>To</p>
							<Box sx={{ minWidth: 120, width: "100%" }}>
								<FormControl fullWidth>
									<Select
										labelId='demo-simple-select-label'
										id='demo-simple-select'
										displayEmpty
										onChange={(e) => setDestinationChainId(e.target.value)}
										value={destinationChainId}
										sx={{
											color: "black !important",
											"& .MuiOutlinedInput-notchedOutline": {
												borderColor: "rgba(156,163,175,0.5) !important",
											},
											"&:hover .MuiOutlinedInput-notchedOutline": {
												borderColor: "rgba(156,163,175,0.5) !important",
											},
											"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
												borderColor: "rgba(156,163,175,0.5) !important",
											},
											"& .MuiSvgIcon-root": {
												color: "black !important",
											},
										}}
									>
										{supportedDestinationChain.map((item, index) => (
											<MenuItem key={index} value={item}>
												<div className='flex items-center gap-2'>
													<Image
														src={getImage(item)}
														className='w-[30px] h-auto rounded-[8px]'
													/>{" "}
													{getChainName(item)}
												</div>
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
						</div>
						<div
							className='grid gap-2 border-gray-300 border-[1px] rounded-[10px] py-1 px-3 items-center justify-center mt-[1.5rem] mb-[0.5rem] w-full'
							style={{ gridTemplateColumns: "auto 1fr auto" }}
						>
							<div className='border-r-[2px] border-gray-300 px-2 py-1'>
								RBT
							</div>
							<input
								type='number'
								className='py-2 px-3 text-xl outline-none border-none w-full'
								placeholder='0'
								onChange={(e) => {
									if (Number(e.target.value) > Number(RBTBalance)) {
										setBridgeAmount(Number(RBTBalance));
									} else {
										setBridgeAmount(e.target.value);
									}
								}}
								value={bridgeAmount}
							/>
							<button
								onClick={(e) => setBridgeAmount(Number(RBTBalance))}
								className='border-[1px] border-gray-300 rounded-[100px] py-1 px-2 text-sm'
							>
								MAX
							</button>
						</div>
						<div
							className='grid items-center justify-center gap-3 mb-[1.5rem]'
							style={{ gridTemplateColumns: "1fr auto" }}
						>
							<div className='w-full min-h-[3px] bg-gray-300 rounded-[100px] relative'>
								<div
									className='min-h-[5px] bg-gray-700 rounded-[100px] absolute top-1/2 translate-y-[-50%] left-0'
									style={{
										width: `${
											(Number(bridgeAmount) / Number(RBTBalance)) * 100
										}%`,
									}}
								></div>
							</div>
							<p className='text-sm text-gray-500'>
								Balance: {Number(RBTBalance).toFixed(4)}
							</p>
						</div>
						<div className='flex items-center justify-between gap-2 '>
							<p className='text-gray-500'>Time to destination</p>
							<p>~30 Minutes</p>
						</div>
						<div className='flex items-center justify-between gap-2 my-[0.5rem]'>
							<p className='text-gray-500'>CCIP Transaction Fee (LINK)</p>
							<p>~0.015 LINK</p>
						</div>
						{Number(LinkBalance) > 0.03 ? (
							<button
								onClick={() =>
									handleBridge(
										originalChainId,
										destinationChainId,
										String(bridgeAmount)
									)
								}
								disabled={!isConnected || loading}
								className='bg-gray-800 py-3 px-8 text-center text-white w-full rounded-[10px] bg-gradient-to-tr from-cyan-500 to-teal-400 transition-all hover:scale-105 font-bold'
							>
								{loading ? "BRIDGING..." : "BRIDGE"}
							</button>
						) : (
							<>
								<Link
									href='https://faucets.chain.link/'
									target='_blank'
									className='from-red-500 to-rose-500 bg-gradient-to-tr py-3 px-8 text-center transition-all hover:scale-105 text-white w-full rounded-[10px] block font-bold'
								>
									INSUFFICIENT LINK BALANCE
								</Link>
								<Link
									href='https://faucets.chain.link/'
									target='_blank'
									className='py-3 px-8 text-center text-cyan-500 w-full rounded-[10px] block test-sm font-bold'
								>
									Get LINK faucet here
								</Link>
							</>
						)}
					</div>
					<div className='relative w-full'>
						<div className='absolute inset-0 bg-gradient-to-tr from-cyan-100 to-teal-100 rounded-2xl blur-2xl opacity-70'></div>
						<div className='relative bg-white/80 rounded-xl p-6 shadow-xl h-full'>
							{/* <Image src={Animation} className='w-full' /> */}
						</div>
					</div>
				</motion.div>
			)}
		</>
		/* <select
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
            </button> */
	);
}
