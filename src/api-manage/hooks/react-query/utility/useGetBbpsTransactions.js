// src/api-manage/hooks/react-query/utility/useGetBbpsTransactions.js
import { useQuery } from "react-query";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";
import { getToken } from "helper-functions/getToken";
import MainApi from "api-manage/MainApi";

/* ================= API ================= */

const getBbpsTransactions = async ({ page, per_page }) => {
  const token = getToken();

  const response = await MainApi.get("/api/v1/bbps/bill/transactions", {
    params: { page, per_page },
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });

  return response?.data || {};
};

/* ================= HOOK ================= */

export default function useGetBbpsTransactions({ page = 1, per_page = 10 } = {}) {
  const token = getToken();

  return useQuery(
    ["bbps-transactions", page, per_page],
    () => getBbpsTransactions({ page, per_page }),
    {
      enabled: !!token,        // 👈 token hai tabhi fetch karo
      retry: false,
      staleTime: 0,
      keepPreviousData: true,
      onError: onSingleErrorResponse,
    }
  );
}