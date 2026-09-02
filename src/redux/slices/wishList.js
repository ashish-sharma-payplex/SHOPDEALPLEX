import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  wishLists: {
    item: [],
    store: [],
    vehicles: [],
    providers: [],
  },
};

export const wishListSlice = createSlice({
  name: "wishLists",
  initialState,
  reducers: {
    setWishList: (state, action) => {
  // console.log("go go go setWishList payload:", action.payload);

  state.wishLists = {
    item: action.payload?.item || [],
    store: action.payload?.store || [],
    vehicles: action.payload?.vehicles || [],
    providers: action.payload?.providers || [],
  };

  // console.log("go go go updated state:", state.wishLists);
},

    // ✅ NEW - Wishlist vehicles bulk set karne ke liye
   setWishListVehicles: (state, action) => {
  if (!state.wishLists) {
    state.wishLists = {
      item: [],
      store: [],
      vehicles: [],
      providers: [],
    };
  }

  state.wishLists.vehicles = action.payload || [];
},

    // ✅ NEW - Wishlist providers bulk set karne ke liye (vehicles jaisa hi)
    setWishListProviders: (state, action) => {
      if (!state.wishLists) {
        state.wishLists = {
          item: [],
          store: [],
          vehicles: [],
          providers: [],
        };
      }

      state.wishLists.providers = action.payload || [];
    },

    addWishList: (state, action) => {
      // console.log("go go go addWishList payload:", action.payload);
      state.wishLists.item.push(action.payload);
      // console.log("go go go updated items:", state.wishLists.item);
    },

    addWishListVehicle: (state, action) => {
      // console.log("go go go addWishListVehicle payload:", action.payload);
      state.wishLists.vehicles.push(action.payload);
      // console.log("go go go updated vehicles:", state.wishLists.vehicles);
    },

    addWishListStore: (state, action) => {
      // console.log("go go go addWishListStore payload:", action.payload);
      state.wishLists.store.push(action.payload);
      // console.log("go go go updated providers (store reducer):", state.wishLists.store);
    },

    addWishListProvider: (state, action) => {
      // console.log("go go go addWishListProvider payload:", action.payload);
      state.wishLists.providers.push(action.payload);
      // console.log("go go go updated providers:", state.wishLists.providers);
    },

    removeWishListItem: (state = initialState, action) => {
      // console.log("go go go removeWishListItem id:", action.payload);

      let tempWishList = state.wishLists.item?.filter(
        (item) => item.id !== action.payload
      );

      // console.log("go go go filtered items:", tempWishList);

      return {
        wishLists: {
          ...state.wishLists,
          item: [...tempWishList],
        },
      };
    },

    removeWishListVehicle: (state = initialState, action) => {
      // console.log("go go go removeWishListVehicle id:", action.payload);

      let tempWishList = state.wishLists.vehicles?.filter(
        (item) => item.id !== action.payload
      );

      // console.log("go go go filtered vehicles:", tempWishList);

      return {
        wishLists: {
          ...state.wishLists,
          vehicles: [...tempWishList],
        },
      };
    },

    removeWishListStore: (state = initialState, action) => {
      // console.log("go go go removeWishListStore id:", action.payload);

      let tempWishList = state.wishLists.store?.filter(
        (item) => item.id !== action.payload
      );

      // console.log("go go go filtered stores:", tempWishList);

      return {
        wishLists: {
          ...state.wishLists,
          store: [...tempWishList],
        },
      };
    },

    removeWishListProvider: (state = initialState, action) => {
      // console.log("go go go removeWishListProvider id:", action.payload);

      let tempWishList = state.wishLists.providers?.filter(
        (item) => item.id !== action.payload
      );

      // console.log("go go go filtered providers:", tempWishList);

      return {
        wishLists: {
          ...state.wishLists,
          providers: [...tempWishList],
        },
      };
    },

    clearWishList: (state = initialState, action) => {
      // console.log("go go go clearWishList payload:", action.payload);

      state.wishLists.item = action.payload;
      state.wishLists.store = action.payload;
      state.wishLists.providers = action.payload;
      state.wishLists.vehicles = action.payload;

      // console.log("go go go state cleared:", state.wishLists);
    },
  },
});

export const {
  setWishList,
  setWishListVehicles,
  setWishListProviders, 
  removeWishListItem,
  addWishList,
  addWishListVehicle,
  removeWishListStore,
  removeWishListVehicle,
  removeWishListProvider,
  addWishListProvider,
  addWishListStore,
  clearWishList,
} = wishListSlice.actions;

export default wishListSlice.reducer;