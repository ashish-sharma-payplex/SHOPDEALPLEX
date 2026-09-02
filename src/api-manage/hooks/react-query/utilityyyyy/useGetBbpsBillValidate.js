// src/api-manage/hooks/react-query/utility/useGetBbpsBillValidate.js

import { useMutation } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";

const bbps_bill_validate_api = "/api/v1/bbps/bill/validate";

const validateBbpsBill = async ({ billerId, customerParams }) => {
  const response = await MainApi.post(bbps_bill_validate_api, {
    billerId,
    customerParms: customerParams.map((p) => ({
      name: p.name,
      value: p.value,
    })),
  });
  return response?.data || null;
};

export default function useGetBbpsBillValidate() {
  return useMutation(validateBbpsBill, {
    onError: onSingleErrorResponse,
  });
}
