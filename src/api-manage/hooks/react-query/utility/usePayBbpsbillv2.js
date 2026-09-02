// src/api-manage/hooks/react-query/utility/usePayBbpsBillV2.js

import { useMutation } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";

const bbps_bill_payv2_api = "/api/v1/bbps/bill/payv2";

const payBbpsBillV2 = async ({
  payment_method,
  upi_order_id,
  billerId,
  customerParms,
  service,
  service_slug,
  amount,
  amountTags,
  fetchRefId,
}) => {
  const response = await MainApi.post(bbps_bill_payv2_api, {
    payment_method,
    ...(payment_method === "upi" && upi_order_id ? { upi_order_id } : {}),
    billerId,
    customerParms,
    service,
    service_slug,
    amount,
    amountTags: amountTags || [],
    fetchRefId: fetchRefId || "",
  });
  return response?.data || null;
};

export default function usePayBbpsBillV2() {
  return useMutation(payBbpsBillV2, {
    onError: onSingleErrorResponse,
  });
}