import MainApi from "../../../MainApi";
import { useQuery } from "react-query";
import { all_cart_list } from "../../../ApiRoutes";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";
import { getToken, getGuestId } from "helper-functions/getToken";

export default function useGetAllCartList(cartListSuccessHandler) {

  const fetchCart = async () => {
    const token = getToken();
    const guest_id = getGuestId();

    const moduleObj = JSON.parse(localStorage.getItem("module"));
    const zoneObj   = JSON.parse(localStorage.getItem("zoneid"));

    const headers = {
      moduleId: String(moduleObj?.id),
      zoneId: JSON.stringify([zoneObj?.[0]]),
    };

    if (token) headers.Authorization = `Bearer ${token}`;
    else headers.guest_id = guest_id;

    // console.log("📤 CART FETCH HEADERS:", headers);

    const { data } = await MainApi.get(all_cart_list, { headers });

    // console.log("📥 CART FETCH RESPONSE:", data);

    return data;
  };

  return useQuery("cart-item", fetchCart, {
    enabled: false,               // manually triggered
    onSuccess: cartListSuccessHandler,
    onError: onSingleErrorResponse,
    retry: 1,
  });
}
