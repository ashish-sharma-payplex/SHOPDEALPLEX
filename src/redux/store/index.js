// store.js
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./root-reducer"; // Ensure correct import

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "sixam-mart",
  storage,
  blacklist: ["categoryIds", "cashbackList", "brands", "configData"],
};

// Check if rootReducer is a valid function
// console.log('rootReducer:', rootReducer); // Debugging log

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
