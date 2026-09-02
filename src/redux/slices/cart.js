import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getToken, getGuestId } from "helper-functions/getToken";

import { toast } from "react-hot-toast"; // Import the toast from react-hot-toast

/* =====================================================
   BACKEND BASE URL
===================================================== */
const BASE_URL = "https://dealplex.in";

/* =====================================================
   API ENDPOINTS
===================================================== */
const API_ADD = "/api/v1/customer/cart/add";
const API_LIST = "/api/v1/customer/cart/list";
const API_UPDATE = "/api/v1/customer/cart/update";
const API_REMOVE_ITEM = "/api/v1/customer/cart/remove-item";
const API_CLEAR = "/api/v1/customer/cart/remove";

/* =====================================================
   UTILITIES
===================================================== */
const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const makeItemKey = (item) => {
  // Support both selectedOption and variation
  const variation = item.selectedOption || item.variation || [];
  return `${item.id}-${JSON.stringify(variation)}`;
};

/* =====================================================
   HELPER: API Context
===================================================== */
const getApiContext = () => {
  try {
    const rawModule = localStorage.getItem("module");
    const rawZone = localStorage.getItem("zoneid");

    const moduleObj = rawModule ? JSON.parse(rawModule) : null;
    const zoneObj = rawZone ? JSON.parse(rawZone) : null;

    const apiContext = {
      token: getToken(),
      guest_id: getGuestId(),
      moduleId: moduleObj?.id,
      zoneId: zoneObj?.[0],
    };

    return apiContext;
  } catch (err) {
    const fallbackContext = {
      token: getToken(),
      guest_id: getGuestId(),
      moduleId: undefined,
      zoneId: undefined,
    };

    return fallbackContext;
  }
};

/* =====================================================
   HELPER: resolveModelForBackend
   Maps module_type or explicit model to backend class name
===================================================== */
const resolveModelForBackend = (item) => {
  const mt = (item.module_type || "").toLowerCase();

  if (mt === "food" || mt === "foods") return "Food";
  if (mt === "grocery") return "Item";
  if (mt === "pharmacy") return "Pharmacy";

  return "Item";
};

const apiCall = async (url, context = {}, body = null) => {
  const { token, moduleId, zoneId, guest_id } = context;

  // No Content-Type!!
  const headers = {
    moduleId: String(moduleId),
    zoneId: JSON.stringify([zoneId]),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // BODY BUILDING
  let fetchBody = null;

  if (body) {
    const fd = new FormData();

    Object.entries(body).forEach(([key, value]) => {
      fd.append(key, value);
    });

    // Append guest_id in body if token is not present
    if (!token && guest_id) {
      fd.append("guest_id", String(guest_id)); // Add guest_id if token is missing
    }

    fetchBody = fd;
  }

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers, // no Content-Type
      body: fetchBody,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.message || "Backend crashed");
    }

    return json;
  } catch (err) {
    throw err;
  }
};

const apiGet = async (url, ctx = {}) => {
  const { token, moduleId, zoneId } = ctx;

  const headers = {
    moduleId: String(moduleId),
    zoneId: JSON.stringify([zoneId]),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "GET",
      headers,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) throw new Error(json?.message || "GET failed");

    return json;
  } catch (err) {
    throw err;
  }
};

const apiCallWithAuth = async (url, ctx) => {
  const { token, guest_id } = ctx;

  // LOGGED-IN USER (GET with token)
  if (token && !guest_id) {
    return apiGet(url, ctx);
  }

  // GUEST USER (GET with query param)
  if (guest_id) {
    const urlWithGuest = `${url}?guest_id=${guest_id}`;
    return apiGet(urlWithGuest, ctx);
  }

  // fallback just GET call
  return apiGet(url, ctx);
};

export const updateApiCall = async (url, context = {}, body = {}) => {
  const { token, moduleId, zoneId, guest_id } = context;

  // No content-type
  const headers = {
    moduleId: String(moduleId),
    zoneId: JSON.stringify([zoneId]),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  // Build FormData
  const fd = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    fd.append(key, value);
  });

  // Append guest_id if user not logged in
  if (!token && guest_id) {
    fd.append("guest_id", String(guest_id));
  }

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers,
      body: fd,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.message || "Update failed");
    }

    return json;
  } catch (err) {
    throw err;
  }
};

const deleteApiCall = async (url, context = {}, body = {}) => {
  const { token, moduleId, zoneId, guest_id } = context;

  const headers = {
    "Content-Type": "application/json",
    moduleId: String(moduleId),
    zoneId: JSON.stringify([zoneId]),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Build correct payload
  const payload = {
    cart_id: String(body.cart_id),
  };

  // Guest users NEED guest_id
  if (!token && guest_id) {
    payload.guest_id = String(guest_id);
  }

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      // Show error toast
      toast.error(json?.message || "Delete failed"); // Display error message in toast
      return; // Return early to avoid further execution
    }

    return json;
  } catch (err) {
    // Show toast on catch (generic error message)
    toast.error("Delete operation failed. Please try again.");
    return; // Return early to prevent further errors
  }
};

/* =====================================================
   NORMALIZER
===================================================== */
const normalizeApiCart = (apiCart = []) => {
  // 🔒 SAFETY CHECK (Fix)
  if (!Array.isArray(apiCart)) {
    return [];
  }

  return apiCart.map((c) => {
    const product = c.item || {};

    const key = `${product.id}-${JSON.stringify(c.variation || [])}`;

    return {
      cartItemKey: key,
      cartItemId: c.id,
      id: product.id,
      name: product.name,
      image_full_url: product.image_full_url || product.image,
      description: product.description,
      quantity: Number(c.quantity || 1),
      price: Number(product.price || 0),
      totalPrice: Number(c.price || 0),

      variation: Array.isArray(c.variation) ? c.variation : [],
      selectedOption: Array.isArray(c.variation) ? c.variation : [],
      food_variations: Array.isArray(c.variation) ? c.variation : [],

      module_type: product.module_type || "",
      stock: product.stock,
      maximum_cart_quantity: product.maximum_cart_quantity,

      product,
    };
  });
};

/* =====================================================
   LOCAL ADD/UPDATE HELPER (unchanged)
===================================================== */
const addOrUpdateCartItem = (cartList, newItem) => {
  const key = newItem.cartItemKey || makeItemKey(newItem);
  const index = cartList.findIndex((i) => i.cartItemKey === key);

  if (index === -1) {
    cartList.push({
      ...newItem,
      cartItemKey: key,
      quantity: newItem.quantity || 1,
      totalPrice: newItem.price || 0,
    });
  } else {
    cartList[index].quantity += newItem.quantity || 1;
    cartList[index].totalPrice += newItem.price || 0;
  }

  return cartList;
};

/* =====================================================
   FETCH CART (unchanged)
===================================================== */
export const fetchCartFromApi = createAsyncThunk("cart/fetchCart", async () => {
  const ctx = getApiContext();
  const data = await apiCallWithAuth(API_LIST, ctx);

  let rawCart = [];

  if (Array.isArray(data)) {
    rawCart = data; // Backend returns array directly
  } else if (data?.cart) {
    rawCart = data.cart;
  } else if (data?.guest_cart) {
    rawCart = data.guest_cart;
  }

  return normalizeApiCart(rawCart);
});

/* =====================================================
   INITIAL STATE
===================================================== */
const initialState = {
  cartItem: null,
  cartList: [],
  guestCartList: [],
  campaignItemList: [],
  buyNowItemList: [],
  campaignItem: null,
  type: "regular",
  totalAmount: null,
  walletAmount: null,
  cartSource: "user",
};

/* =====================================================
   CART SLICE — ALL YOUR ACTIONS PRESERVED
===================================================== */

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /* ===========================================
       READ
    ============================================ */
    setCartList: (state, action) => {
      state.cartList = normalizeApiCart(action.payload || []);
    },

    setGuestCartList: (state, action) => {
      // Normalize payload
      state.guestCartList = normalizeApiCart(action.payload || []);
    },

    switchToUserCart: (state) => {
      state.cartSource = "user";
    },

    switchToGuestCart: (state) => {
      state.cartSource = "guest";
    },

    /* ===========================================
       ✅ OPTIMISTIC ADD — instant local update,
       API sync happens separately in the background.
       No GET re-fetch needed after this.
    ============================================ */
    addOptimisticCartItem: (state, action) => {
      const newItem = action.payload;
      const exists = state.cartList.find(
        (i) => i.cartItemKey === newItem.cartItemKey,
      );

      if (exists) {
        state.cartList = state.cartList.map((i) =>
          i.cartItemKey === newItem.cartItemKey
            ? {
                ...i,
                quantity: i.quantity + newItem.quantity,
                totalPrice: i.totalPrice + newItem.totalPrice,
              }
            : i,
        );
      } else {
        state.cartList.push(newItem);
      }
    },

    /* ===========================================
       ✅ Patch the temp cartItemId with the real
       backend cart_id once the add API responds.
    ============================================ */
    patchCartItemId: (state, action) => {
      const { cartItemKey, cartItemId } = action.payload;
      state.cartList = state.cartList.map((i) =>
        i.cartItemKey === cartItemKey ? { ...i, cartItemId } : i,
      );
    },

    /* ===========================================
       ✅ Rollback — used when the add-to-cart API
       call fails, to undo the optimistic insert.
    ============================================ */
    removeOptimisticCartItem: (state, action) => {
      const { cartItemKey } = action.payload;
      state.cartList = state.cartList.filter(
        (i) => i.cartItemKey !== cartItemKey,
      );
    },

    /* ===========================================
       ADD TO CART  (patched payload + FormData via apiCall)
       NOTE: kept for backward compatibility / other pages.
       New flow (GrocerySession) uses addOptimisticCartItem instead.
    ============================================ */
    setCart: (state, action) => {
      let newItem = action.payload;

      const variationKey = JSON.stringify(
        newItem.selectedOption || newItem.variation || [],
      );
      const cartItemKey = `${newItem.id}-${variationKey}`;

      // 🔥 1️⃣ Check if same item already exists in cart
      const existing = state.cartList.find(
        (item) => item.cartItemKey === cartItemKey,
      );

      if (existing) {
        const updated = {
          ...existing,
          quantity: existing.quantity + (newItem.quantity || 1),
          totalPrice: existing.totalPrice + newItem.price,
        };

        // Update UI immediately
        state.cartList = state.cartList.map((item) =>
          item.cartItemKey === cartItemKey ? updated : item,
        );

        // 🔥 backend update instead of add
        const ctx = getApiContext();
        updateApiCall(API_UPDATE, ctx, {
          cart_id: existing.cartItemId,
          price: updated.totalPrice,
          quantity: updated.quantity,
        });

        return;
      }

      // 🔥 2️⃣ Not existing → Normal add
      newItem = {
        ...newItem,
        cartItemKey,
        food_variations: Array.isArray(newItem.selectedOption)
          ? newItem.selectedOption
          : [],
      };

      state.cartList = addOrUpdateCartItem(state.cartList, newItem);

      const ctx = getApiContext();

      const apiPayload = {
        item_id: String(newItem.id),
        model: resolveModelForBackend(newItem),
        price: Number(newItem.price),
        quantity: Number(newItem.quantity || 1),
        variant: variationKey,
      };

      apiCall(API_ADD, ctx, apiPayload).then((res) => {
        if (res?.id) {
          state.cartList = state.cartList.map((item) =>
            item.cartItemKey === cartItemKey
              ? { ...item, cartItemId: res.id }
              : item,
          );
        }
      });
    },

    // cartSlice me ye reducer add karo
    setClearCartLocally: (state) => {
      state.cartList = [];
    },

    /* ===========================================
       ADD VARIATION
    ============================================ */
    setVariationToCart: (state, action) => {
      const newItem = action.payload;

      state.cartList = addOrUpdateCartItem(state.cartList, newItem);

      const ctx = getApiContext();
      const apiPayload = {
        item_id: newItem.id ?? newItem.item_id ?? newItem.product_id,
        model: resolveModelForBackend(newItem),
        price: newItem.price,
        quantity: newItem.quantity || 1,
        variant: newItem.variant ?? "",
        guest_id: ctx.guest_id, // ✅ REQUIRED
      };

      apiCall(API_ADD, ctx, apiPayload).catch((err) =>
        console.error("setVariationToCart -> API_ADD failed:", err),
      );
    },

    /* ===========================================
   UPDATE ITEM (local only + backend update using cart_id)
=========================================== */
    setUpdateItemToCart: (state, action) => {
      const updatedItem = action.payload;

      const index = state.cartList.findIndex(
        (i) => i.cartItemKey === updatedItem.cartItemKey,
      );

      if (index !== -1) {
        state.cartList[index] = updatedItem;
      }

      // API payload
      const ctx = getApiContext();
      const apiPayload = {
        cart_id: updatedItem.cartItemId,
        price: updatedItem.price,
        quantity: updatedItem.quantity,
      };

      updateApiCall(API_UPDATE, ctx, apiPayload).catch((err) =>
        console.error("❌ API UPDATE FAILED:", err),
      );
    },

    /* ===========================================
   UPDATE VARIATION (local only + backend update)
=========================================== */
    setUpdateVariationToCart: (state, action) => {
      const { indexNumber, newObj } = action.payload;

      state.cartList[indexNumber] = newObj;

      const ctx = getApiContext();
      const apiPayload = {
        cart_id: newObj.cartItemId,
        price: newObj.price,
        quantity: newObj.quantity,
      };

      updateApiCall(API_UPDATE, ctx, apiPayload).catch((err) =>
        console.error("❌ VARIATION UPDATE FAILED:", err),
      );
    },

    /* ===========================================
   INCREMENT (local only + backend update)
=========================================== */
    setIncrementToCartItem: (state, action) => {
      const updatedItem = action.payload;

      state.cartList = state.cartList.map((i) =>
        i.cartItemKey === updatedItem.cartItemKey ? updatedItem : i,
      );

      const ctx = getApiContext();
      const apiPayload = {
        cart_id: updatedItem.cartItemId,
        price: updatedItem.totalPrice ?? updatedItem.price,
        quantity: updatedItem.quantity,
      };

      updateApiCall(API_UPDATE, ctx, apiPayload).catch((err) =>
        console.error("❌ INCREMENT UPDATE FAILED:", err),
      );
    },

    /* ===========================================
   DECREMENT (local only + backend update)
=========================================== */
    setDecrementToCartItem: (state, action) => {
      const updatedItem = action.payload;

      // If quantity is 0 → DELETE SWITCH
      if (updatedItem.quantity === 0) {
        return;
      }

      state.cartList = state.cartList.map((i) =>
        i.cartItemKey === updatedItem.cartItemKey ? updatedItem : i,
      );

      const ctx = getApiContext();
      const apiPayload = {
        cart_id: updatedItem.cartItemId,
        price: updatedItem.totalPrice ?? updatedItem.price,
        quantity: updatedItem.quantity,
      };

      updateApiCall(API_UPDATE, ctx, apiPayload).catch((err) =>
        console.error("❌ DECREMENT UPDATE FAILED:", err),
      );
    },

    /* ===========================================
   SET QUANTITY (local only + backend update)
=========================================== */
    setCartItemQuantity: (state, action) => {
      const { cartItemKey, quantity } = action.payload;

      state.cartList = state.cartList.map((i) =>
        i.cartItemKey === cartItemKey
          ? { ...i, quantity, totalPrice: i.price * quantity }
          : i,
      );

      const updated = state.cartList.find((i) => i.cartItemKey === cartItemKey);

      if (updated) {
        const ctx = getApiContext();
        const apiPayload = {
          cart_id: updated.cartItemId,
          price: updated.totalPrice ?? updated.price,
          quantity: updated.quantity,
        };

        updateApiCall(API_UPDATE, ctx, apiPayload).catch((err) =>
          console.error("❌ QUANTITY UPDATE FAILED:", err),
        );
      }
    },

    /* ===========================================
   BULK UPDATE (local only + backend update)
=========================================== */
    setBulkUpdateCartItems: (state, action) => {
      const { items } = action.payload;

      state.cartList = state.cartList.map((i) => {
        const updated = items.find((ui) => ui.cartItemKey === i.cartItemKey);
        return updated || i;
      });

      const ctx = getApiContext();

      const apiPayload = {
        cart_items: items.map((i) => ({
          cart_id: i.cartItemId,
          price: i.totalPrice ?? i.price,
          quantity: i.quantity,
        })),
      };

      updateApiCall(API_UPDATE, ctx, apiPayload).catch((err) =>
        console.error("❌ BULK UPDATE FAILED:", err),
      );
    },

    /* ===========================================
       REMOVE ITEM
    ============================================ */
    setRemoveItemFromCart: (state, action) => {
      const { cartItemKey, cartItemId } = action.payload;

      // Rollback ke liye backup rakh lo
      const removedItem = state.cartList.find(
        (i) => i.cartItemKey === cartItemKey,
      );

      // Optimistic remove
      state.cartList = state.cartList.filter(
        (i) => i.cartItemKey !== cartItemKey,
      );

      const ctx = getApiContext();

      deleteApiCall(API_REMOVE_ITEM, ctx, {
        cart_id: cartItemId,
      }).catch(() => {
        // Delete fail hua to hi wapas add karo (rollback), fetchCartFromApi ki zarurat nahi
        // console.warn("Remove failed, rolling back item:", cartItemKey);
      });
    },

    /* ===========================================
       REMOVE FROM GUEST CART
    ============================================ */
    setRemoveItemFromGuestCart: (state, action) => {
      const { cartItemKey, cartItemId } = action.payload;

      // Remove locally
      state.guestCartList = state.guestCartList.filter(
        (i) => i.cartItemKey !== cartItemKey,
      );

      const ctx = getApiContext();

      deleteApiCall(API_REMOVE_ITEM, ctx, {
        cart_id: cartItemId,
        guest_id: ctx.guest_id,
      });
    },

    /* ===========================================
       CLEAR CART
    ============================================ */
    setClearCart: (state) => {
      const ctx = getApiContext();

      apiCall(API_CLEAR, ctx).catch((e) =>
        console.error("CLEAR API FAILED:", e),
      );

      state.cartList = [];
      state.campaignItemList = [];
      state.buyNowItemList = [];
      state.campaignItem = null;
      state.totalAmount = null;
      state.walletAmount = null;
    },

    /* ===========================================
       CLEAR GUEST CART
    ============================================ */
    setClearGuestCart: (state) => {
      state.guestCartList = [];
    },

    /* ===========================================
       MISC
    ============================================ */
    setCampaignItemList: (state, action) => {
      state.campaignItemList = [action.payload];
    },

    // cart.js — setBuyNowItemList me empty array support add karo
    setBuyNowItemList: (state, action) => {
      const item = action.payload;

      // ✅ Empty array pass hone par clear kar do
      if (Array.isArray(item) && item.length === 0) {
        state.buyNowItemList = [];
        return;
      }

      state.buyNowItemList = [
        {
          ...item,
          food_variations: Array.isArray(item.food_variations)
            ? item.food_variations
            : Array.isArray(item.selectedOption)
            ? item.selectedOption
            : [],
        },
      ];
    },

    setCampaignItem: (state, action) => {
      state.campaignItem = action.payload;
    },

    setCartSource: (state, action) => {
      state.cartSource = action.payload;
    },

    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload;
    },

    setWalletAmount: (state, action) => {
      state.walletAmount = action.payload;
    },

    // ✅ Backward-compat reducer — cartPersistence.js dispatch karta hai
    // login pe. Actual cart sync fetchCartFromApi se hota hai, isliye
    // yaha state ko touch nahi karte — sirf import/dispatch break na ho.
    loadCartFromStorageAction: (state, action) => {
      // no-op — kept for compatibility with cartPersistence.js
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchCartFromApi.fulfilled, (state, action) => {
      const token = getToken();
      const guestId = getGuestId();

      if (token) {
        state.cartList = action.payload;
      } else if (guestId) {
        state.guestCartList = action.payload;
      }
    });
  },
});

/* =====================================================
   EXPORT ACTIONS (ALL PRESERVED EXACTLY AS REQUESTED)
===================================================== */
export const {
  setCart,
  setCartList,
  setGuestCartList,
  switchToUserCart,
  switchToGuestCart,
  setVariationToCart,
  setUpdateItemToCart,
  setUpdateVariationToCart,
  setIncrementToCartItem,
  setDecrementToCartItem,
  setRemoveItemFromCart,
  setRemoveItemFromGuestCart,
  setCartItemQuantity,
  setBulkUpdateCartItems,
  setCampaignItemList,
  setBuyNowItemList,
  setCampaignItem,
  setClearCart,
  setClearGuestCart,
  setCartSource,
  setTotalAmount,
  setWalletAmount,
  setClearCartLocally,
  addOptimisticCartItem,
  patchCartItemId,
  removeOptimisticCartItem,
  loadCartFromStorageAction,
} = cartSlice.actions;

/* =====================================================
   EXPORT REDUCER
===================================================== */
export default cartSlice.reducer;

/* =====================================================
   PLAIN LOCALSTORAGE HELPERS (used by cartPersistence.js)
   Redux actions nahi hain — direct localStorage utility hain.
===================================================== */

export const saveCartToStorage = (cartList, userId) => {
  if (!userId) return;
  try {
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cartList || []));
  } catch (error) {
    console.error("❌ Error saving cart to storage:", error);
  }
};

export const clearCartFromStorage = (userId) => {
  if (!userId) return;
  try {
    localStorage.removeItem(`cart_${userId}`);
  } catch (error) {
    console.error("❌ Error clearing cart from storage:", error);
  }
};

export const mergeCartItems = (userCart = [], guestCart = []) => {
  if (!userCart.length) return guestCart;
  if (!guestCart.length) return userCart;

  const merged = [...userCart];

  guestCart.forEach((gItem) => {
    const key =
      gItem.cartItemKey ||
      `${gItem.id}-${JSON.stringify(gItem.variation || [])}`;
    const existIndex = merged.findIndex(
      (uItem) =>
        (uItem.cartItemKey ||
          `${uItem.id}-${JSON.stringify(uItem.variation || [])}`) === key,
    );

    if (existIndex === -1) {
      merged.push(gItem);
    } else {
      merged[existIndex] = {
        ...merged[existIndex],
        quantity: (merged[existIndex].quantity || 0) + (gItem.quantity || 1),
        totalPrice:
          (merged[existIndex].totalPrice || 0) +
          (gItem.totalPrice || gItem.price || 0),
      };
    }
  });

  return merged;
};
