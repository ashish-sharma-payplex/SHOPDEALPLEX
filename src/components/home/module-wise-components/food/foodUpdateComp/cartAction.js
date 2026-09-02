import { setBuyNowItemList, setCart } from "../../../../../redux/slices/cart";
import { setSignInModalOpen, setModalFor } from "../../../../../redux/slices/utils";
import { getGuestId } from "../../../../../helper-functions/getToken";

export const buyNow = ({ dispatch, router, productObj }) => {
  dispatch(setBuyNowItemList(productObj));
  router.push("/checkout?page=buy_now");
};

// ------------------------------
// CLEAN ADD OR UPDATE CART
// ------------------------------
export const addOrUpdateCart = ({
  token,
  dispatch,
  modalData,
  selectedAddons,
  selectedOptions,
  totalPrice,
  quantity,
  productUpdate,
  mutate,
  updateMutate,
  onSuccessAdd,
  onSuccessUpdate,
}) => {
  if (!token) {
    dispatch(setSignInModalOpen(true));
    dispatch(setModalFor("sign-in"));
    return;
  }

  // Build basic object to put in redux cart
  const cartObj = {
    ...modalData,
    cartItemId: modalData?.cartItemId || `${modalData.id}-${Date.now()}`,  // ✅ FIXED
    quantity,
    totalPrice,
    guest_id: getGuestId(),
    add_ons_selected: selectedAddons.map((a) => a.name),
    variation: selectedOptions || [],
  };

  dispatch(setCart(cartObj)); // update redux

  if (onSuccessAdd) onSuccessAdd();
};
