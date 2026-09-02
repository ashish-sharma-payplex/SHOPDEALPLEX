import MainApi from "../../../MainApi";
import { item_add_to_cart } from "../../../ApiRoutes";
import { useMutation } from "react-query";

// Function to handle adding data to cart with fallback to guest_id if token is missing
const addData = async (postData, context) => {
  const { token, guest_id } = context;
  
  let bodyData = postData;

  // console.log("----------------------tingu---");
  // console.log(bodyData.module_id);
  // console.log(context);
  // console.log(bodyData);
  // console.log("-------------------------");

  const defaultModule = { id: bodyData.module_id, module_type: bodyData.module_type };
  localStorage.setItem("module", JSON.stringify(defaultModule));

  // If no token is available, append guest_id in the body data
  if (!token && guest_id) {
    bodyData = { ...postData, guest_id: String(guest_id) };
  }

  // Execute the API call with MainApi
  const { data } = await MainApi.post(item_add_to_cart, bodyData);
  return data;
};

export default function useAddCartItem() {
  return useMutation("add-to-cart", (postData) => addData(postData, {user_id : postData.guest_id }));
}
