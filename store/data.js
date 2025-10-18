import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  address: "0x0000000000000000000000000000000000000000",
};

// Create the slice
const datas = createSlice({
  name: "Datas",
  initialState,
  reducers: {
    setAddress(state, action) {
      state.address = action.payload;
    }
  },
});

// Export the reducer
export default datas.reducer;
