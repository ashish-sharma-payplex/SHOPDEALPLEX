// src/utils/cartStorage.js

export const getCartFromLocalStorage = (userId) => {
  if (!userId) return [];

  try {
    const data = localStorage.getItem(`cart_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    // console.error("❌ Error loading cart from localStorage:", error);
    return [];
  }
};

export const saveCartToLocalStorage = (userId, cartItems) => {
  if (!userId) return;

  try {
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
  } catch (error) {
    // console.error("❌ Error saving cart to localStorage:", error);
  }
};

export const clearCartFromLocalStorage = (userId) => {
  if (!userId) return;

  try {
    localStorage.removeItem(`cart_${userId}`);
  } catch (error) {
    // console.error("❌ Error clearing cart from localStorage:", error);
  }
};
