// src/api-manage/hooks/react-query/utility/useCancelBbpsIntent.js

import { useMutation } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";

const cancelBbpsIntent = async ({ order_id }) => {
  const response = await MainApi.post("/api/v1/bbps/bill/intent-cancel", {
    order_id,
  });
  return response?.data || null;
};

export default function useCancelBbpsIntent() {
  return useMutation(cancelBbpsIntent, {
    onError: onSingleErrorResponse,
  });
}