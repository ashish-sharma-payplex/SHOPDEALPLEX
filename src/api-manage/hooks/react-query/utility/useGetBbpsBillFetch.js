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
  return response?.data || null; // ✅ yeh theek hai — poora object aata hai
};

export default function useGetBbpsBillFetch() {
  return useMutation(fetchBbpsBill, {
    onError: onSingleErrorResponse,
  });
}
