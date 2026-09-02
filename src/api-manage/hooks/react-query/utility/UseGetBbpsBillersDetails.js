import { useQuery } from "react-query";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import MainApi from "api-manage/MainApi";

const getBbpsBillerDetails = async (billerId) => {
  const response = await MainApi.get(
    `/api/v1/bbps/billers/details?billerId=${billerId}`,
  );
  return response?.data?.data || response?.data || null;
};

export default function useGetBbpsBillerDetails(billerId) {
  return useQuery(
    ["bbps-biller-details", billerId],
    () => getBbpsBillerDetails(billerId),
    {
      enabled: !!billerId,
      retry: false,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      onError: onSingleErrorResponse,
    },
  );
}