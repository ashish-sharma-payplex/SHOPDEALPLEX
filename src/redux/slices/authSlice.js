import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  isLoggedIn: false,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthToken: (state, action) => {
      state.token = action.payload;
      state.isLoggedIn = true;
      state.hydrated = true;
    },
    clearAuthToken: (state) => {
      state.token = null;
      state.isLoggedIn = false;
      state.hydrated = true;
    },
    hydrateAuth: (state, action) => {
      state.token = action.payload;
      state.isLoggedIn = !!action.payload;
      state.hydrated = true;
    },
  },
});

export const { setAuthToken, clearAuthToken, hydrateAuth } =
  authSlice.actions;
export default authSlice.reducer;
