import { useQuery } from "react-query";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import MainApi from "api-manage/MainApi";
import { getToken } from "helper-functions/getToken";

const getBbpsTicketList = async () => {
  const response = await MainApi.get(
    "https://dealplex.in/api/v1/bbps/ticket/list"
  );

  // console.log("FULL RESPONSE:", response.data);

  const tickets =
    response?.data?.data?.tickets ||
    response?.data?.tickets ||
    [];

  // console.log("EXTRACTED TICKETS:", tickets);

  return response?.data || null;
};

export default function useGetBbpsTicketList() {
  const token = getToken();

  return useQuery(["bbps-ticket-list"], getBbpsTicketList, {
    enabled: !!token,
    retry: false,
    staleTime: 0,
    onError: onSingleErrorResponse,
  });
}