import { useMutation } from "react-query";
import { add_wish_list_api } from "../../../ApiRoutes";
import MainApi from "../../../MainApi";

// Function to call API to add to wishlist
const addTOWishList = async (wishListId) => {
  const { data } = await MainApi.post(
    `${add_wish_list_api}?item_id=${wishListId}`
  );
  return data;
};

// Custom hook to manage wishlist mutation
export const useAddToWishlist = () => {
  return useMutation(addTOWishList);  // Use the mutation function directly
};