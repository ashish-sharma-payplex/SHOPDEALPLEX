import MainApi from "../../../MainApi";
import { cart_item_delete } from "../../../ApiRoutes";
import { useMutation } from "react-query";

const deleteItem = async ({ cart_id, guestId }) => {
  // Guest user
  if (guestId) {
    const { data } = await MainApi.delete(
      `${cart_item_delete}?guest_id=${guestId}&cart_id=${cart_id}`
    );
    return data;
  }

  // Logged-in user
  const { data } = await MainApi.delete(`${cart_item_delete}?cart_id=${cart_id}`);
  return data;
};

export default function useDeleteCartItem() {
  return useMutation(deleteItem, {
    onSuccess: (res) => console.log("Delete successful:", res),
    onError: (err) => console.error("Delete error:", err),
  });
}
