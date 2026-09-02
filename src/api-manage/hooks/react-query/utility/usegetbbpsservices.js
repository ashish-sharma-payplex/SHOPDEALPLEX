  // src/api-manage/hooks/react-query/bbps/useGetBbpsServices.js
  import { useQuery } from "react-query";
  import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";
  import { getToken } from "helper-functions/getToken";
  import { bbps_services_api } from "api-manage/UtilityApi";
  import MainApi from "api-manage/MainApi";

  /* ================= API ================= */

 const getBbpsServices = async () => {
  const token = getToken();

  const response = await MainApi.get(bbps_services_api, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });

  return response?.data?.data?.services || [];
};

  /* ================= HOOK ================= */

  // hasToken bahar se pass hota hai — jab bhi tokenStatus true ho,
  // react-query fresh call karega
  export default function useGetBbpsServices(hasToken = false) {
    return useQuery(["bbps-services", hasToken], getBbpsServices, {
      enabled: hasToken,         // token aane ke baad hi fetch karo
      retry: false,
      staleTime: 0,              // hamesha fresh fetch
      onError: onSingleErrorResponse,
    });
  }