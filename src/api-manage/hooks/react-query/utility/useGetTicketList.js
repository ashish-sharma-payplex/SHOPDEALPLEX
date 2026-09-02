import { useQuery } from "react-query";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";
import { getToken } from "helper-functions/getToken";
import MainApi from "api-manage/MainApi";

/* ================= API ================= */

const getTicketList = async () => {
  const token = getToken();

  // console.log("TOKEN:", token);

  const response = await MainApi.get(
    "https://dealplex.in/api/v1/bbps/ticket/list",
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );

  // console.log("FULL RESPONSE:", response.data);

  const tickets =
    response?.data?.data?.tickets ||
    response?.data?.tickets ||
    [];

  // console.log("EXTRACTED TICKETS:", tickets);

  return tickets;
};

/* ================= HOOK ================= */

export default function useGetTicketList() {
  const token = getToken();

  return useQuery(["ticket-list"], getTicketList, {
    enabled: !!token, // 🔥 IMPORTANT FIX
    retry: false,
    staleTime: 0,
    onError: onSingleErrorResponse,
  });
}