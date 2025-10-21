import React from "react";
import Bridge from "@/components/Bridge";
import Hero from "@/components/Hero";
import Deposit from "@/components/Deposit";
import { ToastContainer } from "react-toastify";

export default function index() {
	return (
		<div className=' w-full flex flex-col items-center justify-center max-w-[1024px] mx-auto px-4 gap-4'>
			<ToastContainer />
			<Hero />
			<Deposit />
			<Bridge />
		</div>
	);
}
