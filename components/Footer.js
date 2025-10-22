import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

export default function Navbar() {
	return (
		<div className='w-full text-base flex items-center justify-center text-center py-[1rem] px-[2rem]'>
			<motion.div
				initial={{ transform: "translateX(-100px)", opacity: 0 }}
				whileInView={{ transform: "translateX(0px)", opacity: 1 }}
				exit={{ transform: "translateX(-100px)", opacity: 0 }}
				transition={{ duration: 0.5 }}
				className='max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-2'
			>
				<p>
					Make with <span className='text-cyan-500'>&hearts;</span> by{" "}
					<Link
						href='https://www.linkedin.com/in/jason-tong-42600319a/'
						target='_blank'
						className='font-bold text-cyan-500'
					>
						Jason
					</Link>
				</p>
				<div className='flex items-center justify-center gap-2'>
					<Link
						href='https://www.linkedin.com/in/jason-tong-42600319a/'
						target='_blank'
					>
						<FaLinkedin className='text-xl' />
					</Link>
					<Link
						href='https://github.com/JasonTongg/CCIP-RebaseToken-CrossChain'
						target='_blank'
					>
						<FaGithub className='text-xl' />
					</Link>
				</div>
			</motion.div>
		</div>
	);
}
