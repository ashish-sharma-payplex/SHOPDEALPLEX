import { getToken, getGuestId } from "helper-functions/getToken";

export const getCorrectCart = (state) => {
  const token = getToken();
  const guestId = getGuestId();

  // current selected module
  const moduleType = state?.utilsData?.selectedModule?.module_type;

  /* ---------------- RENTAL MODULE ---------------- */
  if (moduleType === "rental") {
    if (token) {
      return state?.cart?.rentalCartList || [];
    }
    if (guestId) {
      return state?.cart?.guestRentalCartList || [];
    }
    return [];
  }

  /* ---------------- FOOD / OTHER MODULES ---------------- */
  if (token) {
    return state?.cart?.cartList || [];
  }

  if (guestId) {
    return state?.cart?.guestCartList || [];
  }

  return [];
};
