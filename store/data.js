import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
	RBTBalance: "",
	Balance: "",
	InterestRate: "",
	LinkBalance: "",
};

// Create the slice
const datas = createSlice({
	name: "Datas",
	initialState,
	reducers: {
		setRbtBalance(state, action) {
			state.RBTBalance = action.payload;
		},
		setBalance(state, action) {
			state.Balance = action.payload;
		},
		setInterestRate(state, action) {
			state.InterestRate = action.payload;
		},
		setLinkBalance(state, action) {
			state.LinkBalance = action.payload;
		},
	},
});

// Export the reducer
export default datas.reducer;

export const { setRbtBalance, setBalance, setInterestRate, setLinkBalance } =
	datas.actions;
