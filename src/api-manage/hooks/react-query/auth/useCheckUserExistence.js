import { useMutation } from "react-query";
import MainApi from "../../../MainApi";
import { signIn_api } from "../../../ApiRoutes";

const checkUserExistence = async (userData) => {
  // Using the signIn_api endpoint to check user existence by attempting login with only email_or_phone
  // The backend should respond with user existence info or error accordingly
  const { data } = await MainApi.post(`${signIn_api}`, userData);
  return data;
};

export const useCheckUserExistence = (handleError) => {
  return useMutation("check-user-existence", checkUserExistence, {
    onError: handleError,
  });
};
