// src/api-manage/hooks/react-query/utility/useCreateBbpsTicket.js

import { useMutation } from "react-query";
import MainApi from "api-manage/MainApi";

const bbps_ticket_create_api = "/api/v1/bbps/ticket/create";

const createBbpsTicket = async ({ txnReferenceId, disposition, description }) => {
  const response = await MainApi.post(bbps_ticket_create_api, {
    txnReferenceId,
    disposition,
    description,
  });
  return response?.data || null;
};

export default function useCreateBbpsTicket() {
  return useMutation(createBbpsTicket); // ✅ onError hata diya — component mein handle karenge
}