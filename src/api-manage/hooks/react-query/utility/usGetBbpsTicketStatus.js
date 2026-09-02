// src/api-manage/hooks/react-query/utility/useGetBbpsTicketStatus.js

import { useMutation } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";

const bbps_ticket_status_api = "/api/v1/bbps/ticket/status";

const getTicketStatus = async ({ ticketId }) => {
  const response = await MainApi.post(bbps_ticket_status_api, { ticketId });
  return response?.data || null;
};

export default function useGetBbpsTicketStatus() {
  return useMutation(getTicketStatus, {
    onError: onSingleErrorResponse,
  });
}