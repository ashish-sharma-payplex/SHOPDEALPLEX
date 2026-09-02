
// src/api-manage/hooks/react-query/utility/useGetBbpsIntentStatus.js

import { useMutation } from "react-query";
import MainApi from "api-manage/MainApi";

const getIntentStatus = async ({ order_id }) => {
  const response = await MainApi.post("/api/v1/bbps/bill/intent-status", {
    order_id,
  });
  return response?.data || null;
};

export default function useGetBbpsIntentStatus() {
  return useMutation(getIntentStatus);
}