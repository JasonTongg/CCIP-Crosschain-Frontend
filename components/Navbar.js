import Link from "next/link";
import Image from "next/image";
import React from "react";
import Logo from "../public/assets/Logo.webp";
import { GiHamburgerMenu } from "react-icons/gi";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	return (
		<nav className='fixed top-0 left-0 w-full z-[99] bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm'>
			<div className='max-w-screen-2xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3'>
				{/* Left Section — Links */}
				<div className='items-center gap-6 text-gray-800 font-medium md:flex hidden'>
					<Link
						href='#deposit'
						className='hover:text-cyan-600 transition-colors'
					>
						Deposit
					</Link>
					<Link
						href='#bridge'
						className='hover:text-cyan-600 transition-colors'
					>
						Bridge
					</Link>
				</div>

				{/* Right Section — Wallet Button */}
				<div className='flex items-center gap-3'>
					<ConnectButton />
				</div>

				{/* Mobile Menu Icon */}
				<GiHamburgerMenu
					className='text-3xl text-cyan-500 md:hidden block cursor-pointer'
					onClick={handleClick}
				/>
			</div>

			{/* Mobile Dropdown */}
			<Menu
				id='basic-menu'
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
				}}
			>
				<div className='bg-white hover:text-cyan-600 transition-colors text-black'>
					<Link href='#deposit' onClick={handleClose}>
						<MenuItem>Deposit</MenuItem>
					</Link>
					<Link href='#bridge' onClick={handleClose}>
						<MenuItem>Bridge</MenuItem>
					</Link>
				</div>
			</Menu>
		</nav>
	);
}
