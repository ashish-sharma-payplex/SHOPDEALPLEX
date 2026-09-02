import { useMutation } from "react-query";
import { signIn_api } from "../../../ApiRoutes";
import MainApi from "../../../MainApi";

const userLogin = async (loginData) => {
  const { data } = await MainApi.post(`${signIn_api}`, loginData);
  return data;
};

export const useLogin = () => {
  return useMutation("login", userLogin);
};
