import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { setCartList } from "redux/slices/cart";
import { getGuestId, getToken } from "helper-functions/getToken";
import cookie from "js-cookie";
import { formattedDate } from "../global/search/searchHepler";

export const updateCart = (
  cartItem,
  userData,
  dispatch,
  setCartList,
  updateQuantity,
  updateMutate
) => {
  // सुनिश्चित करें कि आप API को 'cart_id' और 'quantity' सही ढंग से भेज रहे हैं
  const itemObject = {
    // FIX: cart_id के लिए cartItem?.id का उपयोग करें
    cart_id: cartItem?.id, // <--- 🏆 यह बदलाव है
    quantity: updateQuantity,
    pickup_location: userData?.pickup_location,
    destination_location: userData?.destination_location,
    pickup_time: formattedDate(userData?.pickup_time),
    rental_type: userData?.rental_type,
    estimated_hours: userData?.estimated_hours,
    guest_id: getToken() ? null : getGuestId(),
  };
  
  // DEBUG: कंसोल में payload जांचें
  // console.log("Update Cart Payload:", itemObject);

  updateMutate(itemObject, {
    onSuccess: (res) => {
      dispatch(setCartList(res));
    },
    onError: onErrorResponse,
  });
};

export const removeItemFromCart = (cartItem, mutate, dispatch, setCartList) => {
  // FIX: removeItemFromCart में भी cartItem?.id का उपयोग करें (यदि API cart_id एक्सपेक्ट करता है)
  // यदि API सीधे ID को URL/Query Param में एक्सपेक्ट करता है:
  const cartIdToDelete = cartItem?.id || cartItem?.itemId; 
  
  mutate(cartIdToDelete, { // यहाँ cartIdToDelete का उपयोग करें
    onSuccess: (res) => {
      dispatch(setCartList(res));
      if (res?.carts?.length === 0) {
        cookie.remove("cart-list");
      }
    },
    onError: onErrorResponse,
  });
};