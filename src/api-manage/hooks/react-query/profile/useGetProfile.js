import MainApi from "../../../MainApi";
import { useQuery } from "react-query";
import { profile_info } from "../../../ApiRoutes";
import {
  onErrorResponse,
  onSingleErrorResponse,
} from "../../../api-error-response/ErrorResponses";

const getUserProfile = async () => {
  const { data } = await MainApi.get(profile_info, {
    headers: {
      "X-localization": "en",
    },
  });

  // console.log("hey i am here find me", data);
  return data;
};

export default function useGetProfile(userOnSuccessHandler) {
  return useQuery("user-profile", getUserProfile, {
    enabled: false,
    staleTime: 0,
    onSuccess: userOnSuccessHandler,
    onError: onErrorResponse,
  });
}
