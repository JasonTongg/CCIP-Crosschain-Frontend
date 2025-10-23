import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
	return (
		<header className='w-full flex items-center bg-gradient-to-b from-gray-50 to-white'>
			<div className='container mx-auto px-0 sm:px-6 lg:px-12 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
				<motion.div
					initial={{ opacity: 0, x: -24 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className='space-y-6'
				>
					<div className='inline-flex items-center gap-3 bg-gradient-to-r from-teal-100 to-cyan-50 py-1.5 px-3 rounded-full text-sm font-medium text-teal-800 w-max'>
						<svg
							className='w-4 h-4'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M12 2L19 8.5V17.5L12 22L5 17.5V8.5L12 2Z'
								stroke='currentColor'
								strokeWidth='1.25'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
						CCIP • Rebase • Cross‑Chain
					</div>

					<h1 className='text-2xl sm:text-4xl font-extrabold leading-tight text-gray-900'>
						A New Era of Cross-Chain Rebase Tokens
					</h1>

					<p className='text-base sm:text-lg text-gray-600 max-w-xl'>
						CCIP-RebaseToken-CrossChain is an experimental system that merges
						elastic supply logic with Chainlink CCIP cross-chain messaging. It
						showcases how tokens can adjust supply and stay synchronized across
						multiple blockchains — securely and verifiably.
					</p>

					<div className='flex flex-wrap gap-3 items-center'>
						<a
							href='https://github.com/JasonTongg/CCIP-RebaseToken-CrossChain'
							target='_blank'
							rel='noreferrer'
							className='inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-5 rounded-2xl shadow-lg transition'
						>
							View on GitHub
							<svg
								className='w-4 h-4'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M10 14L21 3'
									stroke='currentColor'
									strokeWidth='1.5'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
								<path
									d='M21 3H14V10'
									stroke='currentColor'
									strokeWidth='1.5'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</a>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.12 }}
					className='relative'
				>
					<motion.div
						className='absolute -right-12 top-0 w-56 h-56 rounded-3xl opacity-70 blur-2xl bg-gradient-to-tr from-cyan-200 to-teal-200'
						animate={{ rotate: [0, 6, 0] }}
						transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
						aria-hidden
					/>

					<div className='relative bg-gradient-to-b from-white to-gray-50 border border-gray-100 rounded-2xl p-6 shadow-2xl'>
						<div className='flex items-center justify-between mb-4'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-white font-bold'>
									RB
								</div>
								<div>
									<div className='text-lg font-semibold'>RebaseToken</div>
									<div className=' text-gray-400'>v0.1 • CCIP-enabled</div>
								</div>
							</div>
						</div>

						<div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 text-center text-sm'>
							<div className='bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg p-2'>
								<span className='font-semibold text-gray-800 text-[16px]'>
									Ethereum
								</span>
								<div className='text-gray-400 text-sm'>Sepolia</div>
							</div>
							<div className='bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg p-2'>
								<span className='font-semibold text-gray-800 text-[16px]'>
									Optimism
								</span>
								<div className='text-gray-400 text-sm'>Sepolia</div>
							</div>
							<div className='bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg p-2'>
								<span className='font-semibold text-gray-800 text-[16px]'>
									Arbitrum
								</span>
								<div className='text-gray-400 text-sm'>Sepolia</div>
							</div>
							<div className='bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg p-2'>
								<span className='font-semibold text-gray-800 text-[16px]'>
									Unichain
								</span>
								<div className='text-gray-400 text-sm'>Sepolia</div>
							</div>
							<div className='bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg p-2'>
								<span className='font-semibold text-gray-800 text-[16px]'>
									Base
								</span>
								<div className='text-gray-400 text-sm'>Sepolia</div>
							</div>
							<div className='bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg p-2'>
								<span className='font-semibold text-gray-800 text-[16px]'>
									Soneium
								</span>
								<div className='text-gray-400 text-sm'>Minato</div>
							</div>
						</div>

						<div className='mt-5 text-gray-400 text-center'>
							Connected through Chainlink CCIP
						</div>
					</div>

					<div className='mt-4 text-gray-400'>
						Seamless value transfer across chains — powered by CCIP
					</div>

					<div className='mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm'>
						<div className='bg-white p-3 rounded-lg shadow-sm border border-gray-50'>
							<div className='font-semibold  text-[16px]'>Rebase Engine</div>
							<div className='text-gray-500  text-[16px]'>
								Automatic elastic supply logic
							</div>
						</div>
						<div className='bg-white p-3 rounded-lg shadow-sm border border-gray-50'>
							<div className='font-semibold text-[16px]'>CCIP Integration</div>
							<div className='text-gray-500 text-[16px]'>
								Native cross‑chain messaging & token transfers
							</div>
						</div>
						<div className='bg-white p-3 rounded-lg shadow-sm border border-gray-50'>
							<div className='font-semibold text-[16px]'>Dev Tooling</div>
							<div className='text-gray-500 text-[16px]'>
								Foundry tests, scripts & deployment helpers
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</header>
	);
}
