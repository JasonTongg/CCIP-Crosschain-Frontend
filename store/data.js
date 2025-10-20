import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
	RBTBalance: "",
	Balance: "",
	InterestRate: "",
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
			state.InterestRate = action.InterestRate;
		},
	},
});

// Export the reducer
export default datas.reducer;

export const { setRbtBalance, setBalance, setInterestRate } = datas.actions;
