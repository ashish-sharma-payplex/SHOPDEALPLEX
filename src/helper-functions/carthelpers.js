// helper-functions/cartHelpers.js

import { toast } from "react-hot-toast";
import { setIncrementToCartItem, setDecrementToCartItem, setRemoveItemFromCart, fetchCartFromApi } from "redux/slices/cart";

// Handle adding item to the cart
export const handleAddToCart = (item, addingProductId, addCartMutation, dispatch, setAddingProductId, toast) => {
  setAddingProductId(item.id);

  const userId = getUserIdentifier();

  const payload = getItemDataForAddToCart(item, 1, item.price, userId);

  addCartMutation.mutate(payload, {
    onSuccess: (res) => {
      setAddingProductId(null);
      dispatch(fetchCartFromApi());
      toast.success(`${item.name} added to cart`);
    },
    onError: () => {
      setAddingProductId(null);
      toast.error("Failed to add to cart");
    },
  });
};

// Handle incrementing item in the cart
export const handleIncrement = (cartItem, dispatch) => {
  const userId = getUserIdentifier();
  const newQty = cartItem.quantity + 1;

  const payload = {
    ...cartItem,
    quantity: newQty,
    userId,
  };

  dispatch(setIncrementToCartItem(payload));
      dispatch(fetchCartFromApi());
};

// Handle decrementing item in the cart
export const handleDecrement = (cartItem, dispatch) => {
  const userId = getUserIdentifier();
  const newQty = cartItem.quantity - 1;

  if (newQty === 0) {
    const payload = {
      cartItemKey: cartItem.cartItemKey,
      cartItemId: cartItem.cartItemId,
      userId,
    };

    dispatch(setRemoveItemFromCart(payload));
    dispatch(fetchCartFromApi());
    toast.success(`${cartItem.name} removed from cart`);
    return;
  }

  const payload = {
    ...cartItem,
    quantity: newQty,
    userId,
  };

  dispatch(setDecrementToCartItem(payload));
      dispatch(fetchCartFromApi());
};
