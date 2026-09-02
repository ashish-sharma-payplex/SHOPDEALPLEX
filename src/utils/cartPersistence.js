import {
  loadCartFromStorage as loadCartFromStorageActionOnly,
  clearCartFromStorage,
  loadCartFromStorageAction,
  saveCartToStorage,
  mergeCartItems
} from '../redux/slices/cart';
import { getCartFromLocalStorage } from "./cartStorage";

// 👇 re-export so Redux slice can use it
export { getCartFromLocalStorage };


/**
 * Utility functions for cart persistence
 */

/**
 * Load cart from localStorage for a specific user
 * @param {string} userId - The user ID
 * @param {Function} dispatch - Redux dispatch function
 */

// ✅ REAL utility function (localStorage se cart read karega)
const loadCartFromStorage = (userId) => {
  if (!userId) return [];

  try {
    const data = localStorage.getItem(`cart_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    // console.error("❌ Error loading cart from localStorage:", error);
    return [];
  }
};

export const loadUserCart = (userId, dispatch) => {
  if (userId) {
    const savedCart = loadCartFromStorage(userId);
    // console.log("Cart is here : loadusercard ; ",savedCart);
    dispatch(loadCartFromStorageAction({ userId }));
    return savedCart;
  }
  return [];
};

/**
 * Clear cart from localStorage for a specific user
 * @param {string} userId - The user ID
 */
export const clearUserCart = (userId) => {
  if (userId) {
    clearCartFromStorage(userId);
  }
};

/**
 * Save cart to localStorage for a specific user
 * @param {Array} cartList - The cart items
 * @param {string} userId - The user ID
 */
export const saveUserCart = (cartList, userId) => {
  if (userId && cartList) {
    saveCartToStorage(cartList, userId);
  }
};

/**
 * Get cart summary for a specific user
 * @param {string} userId - The user ID
 * @returns {Object} Cart summary with item count and total value
 */
export const getCartSummary = (userId) => {
  if (!userId) return { itemCount: 0, totalValue: 0 };

  const cartData = loadCartFromStorage(userId);
  if (!cartData || cartData.length === 0) {
    return { itemCount: 0, totalValue: 0 };
  }

  const itemCount = cartData.reduce((total, item) => total + (item.quantity || 1), 0);
  const totalValue = cartData.reduce((total, item) => total + (item.totalPrice || item.price || 0), 0);

  return { itemCount, totalValue };
};

/**
 * Check if user has items in cart
 * @param {string} userId - The user ID
 * @returns {boolean} True if user has items in cart
 */
export const hasCartItems = (userId) => {
  if (!userId) return false;
  const cartData = loadCartFromStorage(userId);
  return cartData && cartData.length > 0;
};

/**
 * Handle guest cart when user logs in - NO AUTOMATIC MERGING
 * @param {string} userId - The user ID
 * @param {Array} guestCart - Guest cart items
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Object} Cart handling result with options for user choice
 */
export const handleGuestCartOnLogin = (userId, guestCart, dispatch) => {
  if (!userId) return { action: 'none', guestCart: [], userCart: [] };

  const userCart = loadCartFromStorage(userId);

  // If user has no existing cart, save guest cart as user cart
  if (!userCart || userCart.length === 0) {
    saveCartToStorage(guestCart, userId);
    dispatch(loadCartFromStorageAction({ userId }));
    return {
      action: 'replaced',
      guestCart: guestCart,
      userCart: guestCart,
      message: 'Guest cart saved as user cart'
    };
  }

  // If user has existing cart, return options without merging
  return {
    action: 'prompt_user',
    guestCart: guestCart,
    userCart: userCart,
    message: 'Choose how to handle your guest cart',
    options: [
      { value: 'merge', label: 'Merge with existing cart' },
      { value: 'replace', label: 'Replace existing cart' },
      { value: 'separate', label: 'Keep separate (use existing cart)' }
    ]
  };
};

/**
 * Apply user's cart choice after login
 * @param {string} userId - The user ID
 * @param {string} choice - User's choice: 'merge', 'replace', or 'separate'
 * @param {Array} guestCart - Guest cart items
 * @param {Function} dispatch - Redux dispatch function
 */
export const applyCartChoice = (userId, choice, guestCart, dispatch) => {
  if (!userId || !choice) return;

  const userCart = loadCartFromStorage(userId);

  switch (choice) {
    case 'merge':
      // Merge guest cart with user cart
      const mergedCart = mergeCartItems(userCart, guestCart);
      saveCartToStorage(mergedCart, userId);
      dispatch(loadCartFromStorageAction({ userId }));
      return { action: 'merged', cart: mergedCart };

    case 'replace':
      // Replace user cart with guest cart
      saveCartToStorage(guestCart, userId);
      dispatch(loadCartFromStorageAction({ userId }));
      return { action: 'replaced', cart: guestCart };

    case 'separate':
    default:
      // Keep user cart as is, ignore guest cart
      dispatch(loadCartFromStorageAction({ userId }));
      return { action: 'kept_separate', cart: userCart };
  }
};



/**
 * Utility functions for UI preferences persistence
 */

/**
 * Save remember me preference to localStorage
 * @param {boolean} rememberMe - Whether remember me is checked
 */
export const saveRememberMePreference = (rememberMe) => {
  try {
    localStorage.setItem('rememberMe', JSON.stringify(rememberMe));
  } catch (error) {
    // console.error('Error saving remember me preference:', error);
  }
};

/**
 * Load remember me preference from localStorage
 * @returns {boolean} Remember me preference (default: false)
 */
export const loadRememberMePreference = () => {
  try {
    const savedPreference = localStorage.getItem('rememberMe');
    if (savedPreference !== null) {
      return JSON.parse(savedPreference);
    }
  } catch (error) {
    // console.error('Error loading remember me preference:', error);
  }
  return false;
};

/**
 * Clear remember me preference from localStorage
 */
export const clearRememberMePreference = () => {
  try {
    localStorage.removeItem('rememberMe');
  } catch (error) {
    // console.error('Error clearing remember me preference:', error);
  }
};

/**
 * Utility functions for user details persistence
 */

/**
 * Save user details to localStorage
 * @param {string} emailOrPhone - The user's email or phone
 * @param {string} password - The user's password
 */
export const saveUserDetails = (emailOrPhone, password) => {
  try {
    const userDetails = { emailOrPhone, password };
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
  } catch (error) {
    // console.error('Error saving user details:', error);
  }
};

/**
 * Load user details from localStorage
 * @returns {Object|null} User details object or null if not found
 */
export const loadUserDetails = () => {
  try {
    const savedDetails = localStorage.getItem('userDetails');
    if (savedDetails !== null) {
      return JSON.parse(savedDetails);
    }
  } catch (error) {
    // console.error('Error loading user details:', error);
  }
  return null;
};

/**
 * Clear user details from localStorage
 */
export const clearUserDetails = () => {
  try {
    localStorage.removeItem('userDetails');
  } catch (error) {
    // console.error('Error clearing user details:', error);
  }
};


export const mergeGuestCartWithUserCart = (userCart = [], guestCart = []) => {
  if (!userCart.length) return guestCart;
  if (!guestCart.length) return userCart;

  const merged = [...userCart];

  const generateItemKey = (item) => {
    const baseKey = `${item.id}`;
    const variationKey = item.food_variations
      ? JSON.stringify(item.food_variations)
      : "";
    const optionKey = item.selectedOption
      ? JSON.stringify(item.selectedOption)
      : "";

    return `${baseKey}-${variationKey}-${optionKey}`;
  };

  guestCart.forEach((gItem) => {
    const key = generateItemKey(gItem);

    const existIndex = merged.findIndex(
      (uItem) => generateItemKey(uItem) === key
    );

    if (existIndex === -1) {
      merged.push(gItem);
    } else {
      merged[existIndex] = {
        ...merged[existIndex],
        quantity:
          (merged[existIndex].quantity || 0) + (gItem.quantity || 1),
        totalPrice:
          (merged[existIndex].totalPrice || 0) +
          (gItem.totalPrice || gItem.price || 0),
      };
    }
  });

  return merged;
};
