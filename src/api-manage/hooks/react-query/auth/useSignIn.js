import { useMutation, useQueryClient } from "react-query";
import { signIn_api } from "../../../ApiRoutes";
import MainApi from "../../../MainApi";

const userSignIn = async (signInData) => {
  // console.log("-------------------------------------------")
  // console.log("-------------------------------------------")
  // console.log("-------------------------------------------")
  // console.log("-------------------------------------------")
  // console.log("-------------------------------------------")
  // console.log(signInData)
  // console.log("-------------------------------------------")
  // console.log("-------------------------------------------")
  // console.log("-------------------------------------------")
  // console.log("-------------------------------------------")
  // console.log("-------------------------------------------")
  const { data } = await MainApi.post(`${signIn_api}`, signInData);
  return data;
};

export const useSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation(userSignIn, {
    onSuccess: () => {
      queryClient.invalidateQueries("user-profile");
    },
  });
};
