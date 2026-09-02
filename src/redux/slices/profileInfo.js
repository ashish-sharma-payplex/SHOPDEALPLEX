import { createSlice } from "@reduxjs/toolkit";
import {
  getCartFromLocalStorage,
  mergeGuestCartWithUserCart,
} from "../../utils/cartPersistence";

const initialState = {
  profileInfo: (() => {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem("profileInfo");
      if (!item || item === "undefined") return null;
      return JSON.parse(item);
    } catch (e) {
      // console.error("Error parsing profileInfo from localStorage", e);
      return null;
    }
  })(),
  couponInfo: null,
  couponType: null,
  cartItems: [],
};

export const profileInfoSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // =========================
    // SET USER (LOGIN / PROFILE)
    // =========================
    setUser: (state, action) => {
      // console.log("🟢 setUser CALLED");
      // console.log("👉 FULL USER PAYLOAD:", action.payload);
      // console.log("👉 USER ID (id):", action.payload?.id);
      // console.log("👉 USER ID (user_id):", action.payload?.user_id);

      state.profileInfo = action.payload;

      // save profile info
      localStorage.setItem("profileInfo", JSON.stringify(action.payload));

      // normalize user id
      const userId = action.payload?.id || action.payload?.user_id;

      if (userId) {
        // console.log("✅ FINAL USER ID USED:", userId);

        // store user id separately (optional but useful)
        localStorage.setItem("user_id", userId);

        // load user cart
        const savedCart = getCartFromLocalStorage(userId);

        // console.log("🛒 SAVED CART:", savedCart);

        state.cartItems = savedCart || [];
      } else {
        // console.warn("❌ USER ID NOT FOUND IN PAYLOAD");
      }
    },

    // =========================
    // LOGOUT USER
    // =========================
    setLogoutUser: (state) => {
      const userId = state.profileInfo?.id || state.profileInfo?.user_id;

      // console.log("🔴 LOGOUT USER ID:", userId);

      // save cart before logout
      if (userId) {
        localStorage.setItem(`cart_${userId}`, JSON.stringify(state.cartItems));
      }

      // clear redux state
      state.profileInfo = null;
      state.cartItems = [];

      // clear storage
      localStorage.removeItem("profileInfo");
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");

      if (userId) {
        localStorage.removeItem(`cart_${userId}`);
      }
    },

    // =========================
    // COUPON
    // =========================
    setCouponInfo: (state, action) => {
      state.couponInfo = action.payload;
    },

    setCouponType: (state, action) => {
      state.couponType = action.payload;
    },

    // =========================
    // MERGE GUEST CART
    // =========================
    mergeGuestCart: (state) => {
      const guestCartKey = "guest_cart";
      const guestCartData = sessionStorage.getItem(guestCartKey);

      const userId = state.profileInfo?.id || state.profileInfo?.user_id;

      if (guestCartData && userId) {
        try {
          const guestCart = JSON.parse(guestCartData);

          if (guestCart?.length) {
            const mergedCart = mergeGuestCartWithUserCart(
              state.cartItems,
              guestCart,
            );

            state.cartItems = mergedCart;

            localStorage.setItem(`cart_${userId}`, JSON.stringify(mergedCart));

            sessionStorage.removeItem(guestCartKey);

            // console.log("🟡 GUEST CART MERGED FOR USER:", userId);
          }
        } catch (err) {
          // console.error("❌ ERROR MERGING GUEST CART:", err);
        }
      }
    },

    // =========================
    // SET CART ITEMS
    // =========================
    setCartItems: (state, action) => {
      state.cartItems = action.payload;

      const userId = state.profileInfo?.id || state.profileInfo?.user_id;

      if (userId) {
        localStorage.setItem(`cart_${userId}`, JSON.stringify(state.cartItems));
      }
    },
  },
});

// EXPORT ACTIONS
export const {
  setUser,
  setLogoutUser,
  setCouponInfo,
  setCouponType,
  mergeGuestCart,
  setCartItems,
} = profileInfoSlice.actions;

// EXPORT REDUCER
export default profileInfoSlice.reducer;
