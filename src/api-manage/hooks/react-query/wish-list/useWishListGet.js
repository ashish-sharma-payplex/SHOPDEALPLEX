import { useQuery } from "react-query";
import { get_wish_list_api } from "../../../ApiRoutes";
import MainApi from "../../../MainApi";

export const WishList = async () => {
  const { data } = await MainApi.get(`${get_wish_list_api}`);
  // console.log("took wishlist from api");
  
  // console.log("WishList API response:", data); // 👈 check what data you get
  
  return data;
};
export const useWishListGet = (onSuccessHandler) => {
  return useQuery("wishlist", () => WishList(), {
    enabled: false,
    retry: false,
    onSuccess: onSuccessHandler,
  });
};
