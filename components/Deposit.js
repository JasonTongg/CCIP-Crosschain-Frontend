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
import LinkIcon from "../public/assets/link.png";
import Eth2 from "../public/assets/eth2.png";
import { motion } from "framer-motion";

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

			setUserBalance(formatEther(balance));
			dispatch(setRbtBalance(formatEther(balance)));
		} catch (err) {
			toast.error("❌ Error fetching RBT balance");
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

			setUserLinkBalance(formatEther(balance));
			dispatch(setLinkBalance(formatEther(balance)));
		} catch (err) {
			toast.error("❌ Error fetching LINK balance");
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

			setUserInterestRate(formatEther(interestRate));
			dispatch(setInterestRate(formatEther(interestRate)));
		} catch (err) {
			toast.error("❌ Error fetching user interest rate");
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
			setDepositProgress("DEPOSITING");
			toast.info("🔍 Simulating deposit transaction...");

			const simulation = await publicClient.simulateContract({
				address: getVaultAddress(selectChain),
				abi: vaultAbi,
				functionName: "deposit",
				account: walletClient.account,
				value: parseEther(amount),
			});

			console.log(simulation);

			toast.success("Simulation successful. Executing transaction...");

			const txHash = await walletClient.writeContract(simulation.request);
			toast.info("⏳ Waiting for confirmation...");

			const receipt = await publicClient.waitForTransactionReceipt({
				hash: txHash,
			});
			toast.success("Deposit successful!");
			setDepositProgress("DEPOSIT");

			handleChainChange();
			setAmount("");
		} catch (err) {
			toast.error("Deposit failed.");
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
			setWithdrawProgress("WITHDRAWING");
			const withdrawAmount =
				redeemAmount && redeemAmount !== ""
					? parseEther(redeemAmount)
					: BigInt(
							"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
					  );

			toast.info("🔍 Simulating withdraw transaction...");

			const simulation = await publicClient.simulateContract({
				address: getVaultAddress(selectChain),
				abi: vaultAbi,
				functionName: "redeem",
				account: walletClient.account,
				args: [withdrawAmount],
			});

			toast.success("Simulation successful. Executing transaction...");

			const txHash = await walletClient.writeContract(simulation.request);
			toast.info("⏳ Waiting for confirmation...");

			const receipt = await publicClient.waitForTransactionReceipt({
				hash: txHash,
			});
			toast.success("Withdraw successful!");

			handleChainChange();
			setWithdrawProgress("WITHDRAW");
			setRedeemAmount("");
		} catch (err) {
			toast.error("❌ Withdraw failed.");
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
				return "Soneium Minato";
			default:
				return "Unknown Chain";
		}
	}

	function getDailyInterestRate(ratePerSecond) {
		const secondsPerDay = 86400;
		const ratePerDay = ratePerSecond * secondsPerDay;

		return {
			decimal: ratePerDay,
			percent: ratePerDay * 100,
			formatted: `${(ratePerDay * 100).toFixed(6)}% per day`,
		};
	}

	async function handleChainChange() {
		try {
			const switched = await switchChainAsync({ chainId: Number(selectChain) });

			const { createPublicClient, http } = await import("viem");

			const newPublicClient = createPublicClient({
				chain: switched,
				transport: http(),
			});

			Object.assign(publicClient, newPublicClient);

			await getUserBalance();
			await getUserInterestRate();
			await getSepoliaBalance();
			await getUserLinkBalance();
		} catch (err) {
			toast.error("❌ Error switching chain");
		}
	}

	async function getSepoliaBalance() {
		try {
			if (!publicClient || !address)
				throw new Error("Missing wallet or client");

			const balance = await publicClient.getBalance({
				address,
			});
			setUserTestnetBalance(formatEther(balance));
			dispatch(setBalance(formatEther(balance)));
		} catch (err) {
			toast.error("❌ Error fetching Sepolia balance");
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
			<motion.div
				initial={{ transform: "translateX(100px)", opacity: 0 }}
				whileInView={{ transform: "translateX(0px)", opacity: 1 }}
				exit={{ transform: "translateX(100px)", opacity: 0 }}
				transition={{ duration: 0.5 }}
				className='relative w-full max-w-[700px] mx-auto mb-6'
			>
				<div className='absolute inset-0 bg-gradient-to-r from-cyan-200 to-teal-200 rounded-2xl blur-2xl opacity-60'></div>
				<div className='relative rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200 p-5 flex items-center justify-evenly gap-6 flex-wrap'>
					{[
						{
							label: "LINK Balance",
							value: Number(userLinkBalance).toFixed(4),
							icon: <Image src={LinkIcon} className='w-[30px] h-auto'></Image>,
						},
						{
							label: "RBT Tokens",
							value: Number(userBalance).toFixed(4),
							icon: "💎",
						},
						{
							label: "ETH Balance",
							value: Number(userTestnetBalance).toFixed(4),
							icon: <Image src={Eth2} className='w-[30px] h-auto'></Image>,
						},
						{
							label: "Interest Rate",
							value: `${getDailyInterestRate(userInterestRate).percent}%`,
							icon: "📈",
						},
					].map((item) => (
						<div
							key={item.label}
							className='flex flex-col items-center text-center'
						>
							<span className='text-3xl mb-1'>{item.icon}</span>
							<p className='text-2xl font-semibold text-gray-900'>
								{item.value}
							</p>
							<p className='text-gray-500 text-sm tracking-wide'>
								{item.label}
							</p>
						</div>
					))}
				</div>
			</motion.div>

			<motion.div
				initial={{ transform: "translateX(-100px)", opacity: 0 }}
				whileInView={{ transform: "translateX(0px)", opacity: 1 }}
				exit={{ transform: "translateX(-100px)", opacity: 0 }}
				transition={{ duration: 0.5 }}
				className='grid  w-full gap-3'
				id='deposit'
				style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
			>
				<div className='w-full p-6 flex flex-col gap-3 text-gray-800 rounded-xl shadow-sm'>
					<h2 className='text-2xl font-semibold tracking-tight'>
						Earn more with every deposit
					</h2>
					<p className='leading-relaxed text-gray-600'>
						<span className='font-semibold text-gray-800'>
							Deposit ETH and receive RBT receipt tokens
						</span>
						, a rebase token that automatically grows as protocol yield
						accumulates. Your balance increases over time with each rebase —{" "}
						<span className='font-semibold text-gray-800'>
							no staking or claiming required
						</span>
						. Just hold RBT and watch your rewards grow effortlessly.
					</p>
				</div>

				<div className='relative w-full max-w-[400px] mx-auto'>
					<div className='absolute bottom-0 -right-12 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-[15px] blur-2xl opacity-70 animate-pulse w-[200px] h-[200px]'></div>
					<div className='w-full border-gray-300 border-[1px] rounded-[10px] backdrop-blur-lg shadow-lg bg-white/80'>
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
												if (
													Number(e.target.value) > Number(userTestnetBalance)
												) {
													setAmount(Number(userTestnetBalance));
												} else {
													setAmount(e.target.value);
												}
											}}
											className='text-xl py-1 px-1 outline-none border-none bg-transparent'
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
													setAmount(
														(Number(userTestnetBalance) * 0.999).toFixed(6)
													);
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
									className='w-full rounded-[10px] font-bold bg-gradient-to-tr from-cyan-500 to-teal-400 hover:scale-105 transition-all text-white py-3 px-8'
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
										<p>{redeemAmount ? redeemAmount : "0.00"}</p>
										<div className='flex items-center justify-center gap-1'>
											<p>Balance: {Number(userBalance).toFixed(4)}</p>
											<button
												onClick={() => {
													setRedeemAmount(
														(Number(userBalance) * 0.999).toFixed(6)
													);
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
									className='w-full rounded-[10px] font-bold bg-gradient-to-tr from-cyan-500 to-teal-400 hover:scale-105 transition-all text-white py-3 px-8'
								>
									{withdrawProgress}
								</button>
							</div>
						)}
					</div>
				</div>
			</motion.div>
		</>
	);
}
