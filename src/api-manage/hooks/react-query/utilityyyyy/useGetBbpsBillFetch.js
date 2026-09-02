// src/api-manage/hooks/react-query/utility/useGetBbpsBillFetch.js

import { useMutation } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";

const bbps_bill_fetch_api = "/api/v1/bbps/bill/fetch";

const fetchBbpsBill = async ({ billerId, customerParams }) => {
  const response = await MainApi.post(bbps_bill_fetch_api, {
    billerId,
    customerParms: customerParams.map((p) => ({
      name: p.name,
      value: p.value,
    })),
  });
  return response?.data?.bbps?.response || null;
};

// ✅ named function — default export sahi ho
export default function useGetBbpsBillFetch() {
  return useMutation(fetchBbpsBill, {
    onError: onSingleErrorResponse,
  });
}
