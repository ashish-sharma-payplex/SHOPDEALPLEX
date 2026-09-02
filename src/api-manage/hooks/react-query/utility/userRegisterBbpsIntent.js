// src/api-manage/hooks/react-query/utility/useRegisterBbpsIntent.js

import { useMutation } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { bbps_bill_register_intent_api } from "api-manage/UtilityApi";


const registerBbpsIntent = async ({ amount }) => {
  const response = await MainApi.post(bbps_bill_register_intent_api, {
    amount: String(amount),
  });
  return response?.data || null;
};

export default function useRegisterBbpsIntent() {
  return useMutation(registerBbpsIntent, {
    onError: onSingleErrorResponse,
  });
}