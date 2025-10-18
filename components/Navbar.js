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
    <nav className="flex top-0 w-full z-[99] p-4 items-center justify-between gap-4 padding-section fixed max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <div className="items-center justify-center gap-5 md:flex hidden">
        <Link href="#deposit">Deposit</Link>
        <Link href="#bridge">Bridge</Link>
      </div>
      <ConnectButton></ConnectButton>
      <GiHamburgerMenu
        className="text-3xl md:hidden block cursor-pointer"
        onClick={handleClick}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <div className="bg-black text-white">
          <Link href="#deposit" onClick={handleClose}>
            <MenuItem>Deposit</MenuItem>
          </Link>
          <Link href="#bridge" onClick={handleClose}>
            <MenuItem>Bridge</MenuItem>
          </Link>
        </div>
      </Menu>
    </nav>
  );
}
