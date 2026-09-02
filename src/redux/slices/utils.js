import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedModule: null,
  orderType: 0,
  currentTab: "",
  orderDetailsModalOpen: false,
  orderInformation: {},
  welcomeModal: false,
  signInModalOpen: false,
  modalFor: "sign-in",
};
export const utilsSlice = createSlice({
  name: "utils-data",
  initialState,
  reducers: {
    setSelectedModule: (state, action) => {
      state.selectedModule = action.payload;
    },
    setOrderType: (state, action) => {
      state.orderType = action.payload;
    },
    setCurrentTab: (state, action) => {
      state.currentTab = action.payload;
    },
    setOrderDetailsModalOpen: (state, action) => {
      state.orderDetailsModalOpen = action.payload;
    },
    setOrderInformation: (state, action) => {
      state.orderInformation = action.payload;
    },
    setWelcomeModal: (state, action) => {
      state.welcomeModal = action.payload;
    },
    setSignInModalOpen: (state, action) => {
      state.signInModalOpen = action.payload;
    },
    setModalFor: (state, action) => {
      state.modalFor = action.payload;
    },
  },
});

export const {
  setSelectedModule,
  setOrderType,
  setCurrentTab,
  setOrderDetailsModalOpen,
  setOrderInformation,
  setWelcomeModal,
  setSignInModalOpen,
  setModalFor,
} = utilsSlice.actions;

export default utilsSlice.reducer;
