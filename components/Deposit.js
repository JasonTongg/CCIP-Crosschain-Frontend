"use client";
import React, { useState, useEffect } from "react";
import {
	useWalletClient,
	useAccount,
	usePublicClient,
	useSwitchChain,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import {
	sepolia,
	optimismSepolia,
	baseSepolia,
	arbitrumSepolia,
	unichainSepolia,
	soneiumMinato,
} from "wagmi/chains";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { toast } from "react-toastify";
import Eth from "../public/assets/eth.png";
import Base from "../public/assets/base.png";
import Arb from "../public/assets/arb.png";
import Op from "../public/assets/op.png";
import Soneium from "../public/assets/soneium.png";
import Uni from "../public/assets/uni.png";
import Image from "next/image";
import { useDispatch } from "react-redux";
import {
	setRbtBalance,
	setBalance,
	setInterestRate,
	setLinkBalance,
} from "../store/data";

const vaultAbi = [
	{
		type: "function",
		name: "deposit",
		stateMutability: "payable",
		inputs: [],
		outputs: [],
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_amount",
				type: "uint256",
			},
		],
		name: "redeem",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
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
	const dispatch = useDispatch();
	const { data: walletClient } = useWalletClient();
	const publicClient = usePublicClient();
	const { isConnected, address, chainId } = useAccount();

	const [amount, setAmount] = useState("");
	const [redeemAmount, setRedeemAmount] = useState("");

	const [selectChain, setSelectChain] = useState(arbitrumSepolia.id);
	const { switchChainAsync, switchChain } = useSwitchChain();

	const [userBalance, setUserBalance] = useState("0");
	const [userLinkBalance, setUserLinkBalance] = useState("0");
	const [userTestnetBalance, setUserTestnetBalance] = useState("0");
	const [userInterestRate, setUserInterestRate] = useState("0");

	const [value, setValue] = useState("deposit");

	const [depositProgress, setDepositProgress] = useState("DEPOSIT");
	const [withdrawProgress, setWithdrawProgress] = useState("WITHDRAW");

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

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

	function getLinkTokenAddress(selectChainId) {
		switch (Number(selectChainId)) {
			case sepolia.id:
				return process.env.NEXT_PUBLIC_SEPOLIA_LINK_ADDRESS;
			case optimismSepolia.id:
				return process.env.NEXT_PUBLIC_OP_LINK_ADDRESS;
			case arbitrumSepolia.id:
				return process.env.NEXT_PUBLIC_ARBITRUM_LINK_ADDRESS;
			case baseSepolia.id:
				return process.env.NEXT_PUBLIC_BASE_LINK_ADDRESS;
			case unichainSepolia.id:
				return process.env.NEXT_PUBLIC_UNI_LINK_ADDRESS;
			case soneiumMinato.id:
				return process.env.NEXT_PUBLIC_SONEIUM_LINK_ADDRESS;
		}
	}

	async function getUserBalance() {
		try {
			if (!publicClient || !address || !selectChain)
				throw new Error("Missing inputs");

			const tokenAddress = getRebaseTokenAddress(selectChain);
			if (!tokenAddress)
				throw new Error("Token address not found for this chain");

			const balance = await publicClient.readContract({
				address: tokenAddress,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [address],
			});

			console.log("💰 User balance:", balance);
			console.log("💰 Formatted balance:", formatEther(balance));

			setUserBalance(formatEther(balance));
			dispatch(setRbtBalance(formatEther(balance)));
		} catch (err) {
			console.error("❌ Error fetching user balance:", err);
			return "0";
		}
	}

	async function getUserLinkBalance() {
		try {
			if (!publicClient || !address || !selectChain)
				throw new Error("Missing inputs");

			const tokenAddress = getLinkTokenAddress(selectChain);
			if (!tokenAddress)
				throw new Error("Token address not found for this chain");

			const balance = await publicClient.readContract({
				address: tokenAddress,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [address],
			});

			console.log("💰 User Link balance:", balance);
			console.log("💰 Formatted Link balance:", formatEther(balance));

			setUserLinkBalance(formatEther(balance));
			dispatch(setLinkBalance(formatEther(balance)));
		} catch (err) {
			console.error("❌ Error fetching user balance:", err);
			return "0";
		}
	}

	async function getUserInterestRate() {
		try {
			const tokenAddress = getRebaseTokenAddress(selectChain);
			if (!tokenAddress)
				throw new Error("Token address not found for this chain");

			const interestRate = await publicClient.readContract({
				address: tokenAddress,
				abi: erc20Abi,
				functionName: "getUserInterestRate",
				args: [address],
			});

			console.log("💰 User InterestRate:", interestRate);
			console.log("💰 Formatted InterestRate:", formatEther(interestRate));

			setUserInterestRate(formatEther(interestRate));
			dispatch(setInterestRate(formatEther(interestRate)));
		} catch (err) {
			console.error("❌ Error fetching user balance:", err);
			return "0";
		}
	}

	async function handleDeposit() {
		if (!walletClient || !isConnected) {
			toast.error("⚠️ Please connect your wallet first.");
			return;
		}

		if (amount <= 0) {
			toast.error("⚠️ Amount must be larger then 0");
			return;
		}

		try {
			// Step 1: Simulate transaction
			setDepositProgress("DEPOSITING");
			toast.info("🔍 Simulating deposit transaction...");

			const simulation = await publicClient.simulateContract({
				address: getVaultAddress(selectChain),
				abi: vaultAbi,
				functionName: "deposit",
				account: walletClient.account,
				value: parseEther(amount),
			});

			console.log("🧪 Simulation result:", simulation);
			toast.success("Simulation successful. Executing transaction...");

			// Step 2: Execute transaction
			const txHash = await walletClient.writeContract(simulation.request);
			console.log("🚀 Transaction sent:", txHash);
			toast.info("⏳ Waiting for confirmation...");

			// Step 3: Wait for confirmation
			const receipt = await publicClient.waitForTransactionReceipt({
				hash: txHash,
			});
			console.log("🎉 Deposit confirmed:", receipt);
			toast.success("Deposit successful!");
			setDepositProgress("DEPOSIT");

			handleChainChange();
			setAmount("");
		} catch (err) {
			console.error("❌ Deposit failed:", err);
			toast.error("Deposit failed. Check console for details.");
			setDepositProgress("DEPOSIT");
		}
	}

	async function handleWithdraw() {
		if (!walletClient || !isConnected) {
			toast.error("⚠️ Please connect your wallet first.");
			return;
		}

		if (redeemAmount <= 0) {
			toast.error("⚠️ Amount must be larger then 0");
			return;
		}

		try {
			// Step 1: Prepare amount (use max if empty)
			setWithdrawProgress("WITHDRAWING");
			const withdrawAmount =
				redeemAmount && redeemAmount !== ""
					? parseEther(redeemAmount)
					: BigInt(
							"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
					  ); // type(uint256).max

			// Step 2: Simulate transaction
			toast.info("🔍 Simulating withdraw transaction...");

			const simulation = await publicClient.simulateContract({
				address: getVaultAddress(selectChain),
				abi: vaultAbi,
				functionName: "redeem",
				account: walletClient.account,
				args: [withdrawAmount],
			});

			console.log("🧪 Simulation result:", simulation);
			toast.success("Simulation successful. Executing transaction...");

			// Step 3: Execute transaction
			const txHash = await walletClient.writeContract(simulation.request);
			console.log("🚀 Transaction sent:", txHash);
			toast.info("⏳ Waiting for confirmation...");

			// Step 4: Wait for confirmation
			const receipt = await publicClient.waitForTransactionReceipt({
				hash: txHash,
			});
			console.log("🎉 Withdraw confirmed:", receipt);
			toast.success("Withdraw successful!");

			handleChainChange();
			setWithdrawProgress("WITHDRAW");
			setRedeemAmount("");
		} catch (err) {
			console.error("❌ Withdraw failed:", err);
			toast.error("❌ Withdraw failed. Check console for details.");
			setWithdrawProgress("WITHDRAW");
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
			decimal: ratePerDay, // e.g. 0.00432
			percent: ratePerDay * 100, // e.g. 0.432%
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
			await getSepoliaBalance();
			await getUserLinkBalance();
		} catch (err) {
			console.error("❌ Error switching chain or fetching data:", err);
		}
	}

	async function getSepoliaBalance() {
		try {
			if (!publicClient || !address)
				throw new Error("Missing wallet or client");

			const balance = await publicClient.getBalance({
				address,
			});

			console.log("💰 Sepolia Balance:", formatEther(balance));
			setUserTestnetBalance(formatEther(balance));
			dispatch(setBalance(formatEther(balance)));
		} catch (err) {
			console.error("❌ Error fetching Sepolia balance:", err);
		}
	}

	useEffect(() => {
		if (isConnected && selectChain) handleChainChange();
	}, [selectChain, isConnected]);

	useEffect(() => {
		setSelectChain(chainId);
	}, [chainId]);

	return (
		<>
			<div className='flex items-center justify-evenly gap-4 flex-wrap [&>*]:min-w-[150px] mb-[2rem] border-[2px] border-gray-400 p-4 rounded-[10px]'>
				<div className='flex flex-col items-center justify-center gap-2 '>
					<p className='text-2xl'>{Number(userLinkBalance).toFixed(4)}</p>
					<p className='text-gray-500'>LINK</p>
				</div>
				<div className='flex flex-col items-center justify-center gap-2 '>
					<p className='text-2xl'>{Number(userBalance).toFixed(4)}</p>
					<p className='text-gray-500'>RBT</p>
				</div>
				<div className='flex flex-col items-center justify-center gap-2 '>
					<p className='text-2xl'>{Number(userTestnetBalance).toFixed(4)}</p>
					<p className='text-gray-500'>ETH</p>
				</div>
				<div className='flex flex-col items-center justify-center gap-2 '>
					<p className='text-2xl'>
						{getDailyInterestRate(userInterestRate).percent}%
					</p>
					<p className='text-gray-500'>Per Day</p>
				</div>
			</div>
			<div
				className='grid  w-full gap-3'
				id='deposit'
				style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
			>
				<div className='w-full p-4 flex flex-col gap-2'>
					<h2 className='text-xl '>Earn more with every deposit</h2>
					<p>
						<b>Deposit ETH and receive RBT receipt tokens</b>. a rebase token
						that automatically grows as protocol yield accumulates. Your balance
						increases over time with each rebase,{" "}
						<b>no staking or claiming required</b>. Just hold RBT and watch your
						rewards grow.
					</p>
				</div>

				<div className='w-full border-gray-300 border-[1px] rounded-[10px]'>
					<Box sx={{ width: "100%" }}>
						<Tabs
							value={value}
							onChange={handleChange}
							aria-label='tabs example'
							sx={{
								"& .MuiTabs-flexContainer": {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
								},
								"& .MuiTab-root": {
									color: "black",
								},
								"& .Mui-selected": {
									color: "black !important",
								},
								"& .MuiTabs-indicator": {
									backgroundColor: "black",
								},
							}}
						>
							<Tab value='deposit' label='Deposit' />
							<Tab value='withdraw' label='Withdraw' />
						</Tabs>
					</Box>
					{value === "deposit" ? (
						<div className='p-3 flex flex-col items-start w-full justify-center'>
							<p className='text-lg'>Amount</p>
							<div className='flex flex-col items-center justify-center w-full rounded border-gray-300 border-[1px] p-2 gap-3'>
								<div
									className='grid w-full'
									style={{ gridTemplateColumns: "1fr auto" }}
								>
									<input
										type='number'
										placeholder='Enter Amount'
										value={amount}
										onChange={(e) => {
											if (Number(e.target.value) > Number(userTestnetBalance)) {
												setAmount(Number(userTestnetBalance));
											} else {
												setAmount(e.target.value);
											}
										}}
										className='text-xl py-1 px-1 outline-none border-none'
									/>
									<div className='text-xl'>ETH</div>
								</div>
								<div className='flex items-center justify-between w-full [&>*]:text-gray-400 [&>*]:text-sm'>
									<p>{amount ? amount : "0.00"}</p>
									<div className='flex items-center justify-center gap-1'>
										<p>
											Balance: {Number(Number(userTestnetBalance).toFixed(4))}
										</p>
										<button
											onClick={() => {
												setAmount(Number(userTestnetBalance).toFixed(4));
											}}
											className='text-gray-950'
										>
											Max
										</button>
									</div>
								</div>
							</div>
							<div className='w-full my-[1.3rem]'>
								<Box sx={{ minWidth: 120 }}>
									<FormControl fullWidth>
										<Select
											labelId='demo-simple-select-label'
											id='demo-simple-select'
											value={selectChain}
											displayEmpty
											onChange={(e) => {
												setSelectChain(e.target.value);
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
													{getChainName(sepolia.id)}
												</div>
											</MenuItem>
											<MenuItem value={optimismSepolia.id}>
												<div className='flex items-center gap-2'>
													<Image
														src={Op}
														className='w-[30px] h-auto rounded-[8px]'
													/>{" "}
													{getChainName(optimismSepolia.id)}
												</div>
											</MenuItem>
											<MenuItem value={arbitrumSepolia.id}>
												<div className='flex items-center gap-2'>
													<Image
														src={Arb}
														className='w-[30px] h-auto rounded-[8px]'
													/>{" "}
													{getChainName(arbitrumSepolia.id)}
												</div>
											</MenuItem>
											<MenuItem value={baseSepolia.id}>
												<div className='flex items-center gap-2'>
													<Image
														src={Base}
														className='w-[30px] h-auto rounded-[8px]'
													/>{" "}
													{getChainName(baseSepolia.id)}
												</div>
											</MenuItem>
											<MenuItem value={unichainSepolia.id}>
												<div className='flex items-center gap-2'>
													<Image
														src={Uni}
														className='w-[30px] h-auto rounded-[8px]'
													/>{" "}
													{getChainName(unichainSepolia.id)}
												</div>
											</MenuItem>
											<MenuItem value={soneiumMinato.id}>
												<div className='flex items-center gap-2'>
													<Image
														src={Soneium}
														className='w-[30px] h-auto rounded-[8px]'
													/>{" "}
													{getChainName(soneiumMinato.id)}
												</div>
											</MenuItem>
										</Select>
									</FormControl>
								</Box>
							</div>
							<button
								onClick={handleDeposit}
								disabled={!isConnected || !amount}
								className='w-full rounded-[10px] bg-gray-800 text-white py-3 px-8'
							>
								{depositProgress}
							</button>
						</div>
					) : (
						<div className='p-3 flex flex-col items-start w-full justify-center'>
							<p className='text-lg'>Amount</p>
							<div className='flex flex-col items-center justify-center w-full rounded border-gray-300 border-[1px] p-2 gap-3'>
								<div
									className='grid w-full'
									style={{ gridTemplateColumns: "1fr auto" }}
								>
									<input
										type='number'
										placeholder='Enter Amount'
										value={redeemAmount}
										onChange={(e) => {
											if (Number(e.target.value) > Number(userBalance)) {
												setRedeemAmount(Number(userBalance));
											} else {
												setRedeemAmount(e.target.value);
											}
										}}
										className='text-xl py-1 px-1 outline-none border-none'
									/>
									<div className='text-xl'>RBT</div>
								</div>
								<div className='flex items-center justify-between w-full [&>*]:text-gray-400 [&>*]:text-sm'>
									<p>{amount ? amount : "0.00"}</p>
									<div className='flex items-center justify-center gap-1'>
										<p>Balance: {Number(userBalance).toFixed(4)}</p>
										<button
											onClick={() => {
												setAmount(Number(Number(userBalance).toFixed(4)));
											}}
											className='text-gray-950'
										>
											Max
										</button>
									</div>
								</div>
							</div>
							<div className='w-full my-[1.3rem]'>
								<Box sx={{ minWidth: 120 }}>
									<FormControl fullWidth>
										<Select
											labelId='demo-simple-select-label'
											id='demo-simple-select'
											value={selectChain}
											displayEmpty
											onChange={(e) => {
												setSelectChain(e.target.value);
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
													{getChainName(sepolia.id)}
												</div>
											</MenuItem>
											<MenuItem value={optimismSepolia.id}>
												<div className='flex items-center gap-2'>
													<Image
														src={Op}
														className='w-[30px] h-auto rounded-[8px]'
													/>{" "}
													{getChainName(optimismSepolia.id)}
												</div>
											</MenuItem>
											<MenuItem value={arbitrumSepolia.id}>
												<div className='flex items-center gap-2'>
													<Image
														src={Arb}
														className='w-[30px] h-auto rounded-[8px]'
													/>{" "}
													{getChainName(arbitrumSepolia.id)}
												</div>
											</MenuItem>
											<MenuItem value={baseSepolia.id}>
												<div className='flex items-center gap-2'>
													<Image
														src={Base}
														className='w-[30px] h-auto rounded-[8px]'
													/>{" "}
													{getChainName(baseSepolia.id)}
												</div>
											</MenuItem>
											<MenuItem value={unichainSepolia.id}>
												<div className='flex items-center gap-2'>
													<Image
														src={Uni}
														className='w-[30px] h-auto rounded-[8px]'
													/>{" "}
													{getChainName(unichainSepolia.id)}
												</div>
											</MenuItem>
											<MenuItem value={soneiumMinato.id}>
												<div className='flex items-center gap-2'>
													<Image
														src={Soneium}
														className='w-[30px] h-auto rounded-[8px]'
													/>{" "}
													{getChainName(soneiumMinato.id)}
												</div>
											</MenuItem>
										</Select>
									</FormControl>
								</Box>
							</div>
							<button
								onClick={handleWithdraw}
								disabled={!isConnected || !redeemAmount}
								className='w-full rounded-[10px] bg-gray-800 text-white py-3 px-8'
							>
								{withdrawProgress}
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
