import cookie from "js-cookie";
import { getGuestId, getToken } from "helper-functions/getToken";
import { updateDestinationLocations } from "components/home/module-wise-components/rental/components/utils/bookingHepler";
export const formattedDate = (userDate) => userDate
  .toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
  .replace(/(\d+)\/(\d+)\/(\d+),\s(\d+:\d+\s[AP]M)/, "$3-$1-$2 $4");

export const bookingConfirm = ({
  id,
  locations,
  searchKey1,
  searchKey2,
  tripType,
  durationValue,
  dateValue,
  data,
  confirmMutate,
  dispatch,
  setCartList,
  toast,
  handleClose,
  onErrorResponse,
  onSuccessRedirect, // new optional callback
}) => {
  // 2025-01-22 03:48:00 PM
  const userDate = new Date(dateValue);

  const cartObject = {
    vehicle_id: id,
    quantity: 1,
    pickup_location: { ...locations?.pickup, location_name: searchKey1 },
    destination_location: {
      ...locations?.destination,
      location_name: searchKey2,
    },
    rental_type: tripType,
    estimated_hours: durationValue,
    pickup_time: formattedDate(userDate),
    destination_time: Math.floor(
      data?.rows?.[0]?.elements[0]?.duration?.value / 60
    ),

    distance: data?.rows?.[0]?.elements[0]?.distance?.value / 1000,
    guest_id: getToken() ? null : getGuestId(),
  };

  confirmMutate(cartObject, {
  onSuccess: (res) => {
    if (res) {
      dispatch(setCartList(res));

      // 🔥 YEH LINE ADD KARO (VERY IMPORTANT)
      window.dispatchEvent(new Event("REFRESH_RENTAL_CART"));

      updateDestinationLocations({
        latitude: res.user_data?.destination_location?.lat,
        longitude: res.user_data?.destination_location?.lng,
        location_name: searchKey2,
      });

      cookie.set("cart-list", res?.carts?.length);
      toast.success("The vehicle successfully added to your cart.");
      handleClose?.();
    }
  },
  onError: onErrorResponse,
});
};

