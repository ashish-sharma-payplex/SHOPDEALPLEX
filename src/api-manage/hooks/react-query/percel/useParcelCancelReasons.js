import MainApi from "../../../MainApi";
import { useQuery } from "react-query";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";
import { parcel_cancel_reasons_api } from "api-manage/ParcelApi";

/* ================= API ================= */

const getCancelReasons = async () => {
  const response = await MainApi.get(parcel_cancel_reasons_api, {
    headers: {
      moduleId: 4,
      localizationKey: "en",
    },
  });

  return response?.data?.reasons || [];
};

/* ================= HOOK ================= */

export default function useParcelCancelReasons(enabled = false) {
  return useQuery("parcel-cancel-reasons", getCancelReasons, {
    enabled, // 🔥 only call when needed
    retry: false,
    onError: onSingleErrorResponse,
  });
}