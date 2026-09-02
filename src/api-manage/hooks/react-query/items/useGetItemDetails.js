import MainApi from "../../../MainApi";
import { useQuery } from "react-query";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";

const getItemDetails = async (itemId, moduleId) => {
  const url = `/api/v1/items/details/${itemId}`;
  const headers = { ...MainApi.defaults.headers.common };
  delete headers.moduleId; // Always delete for global search context
  if (moduleId) {
    headers.moduleId = moduleId;
  }
  const { data } = await MainApi.get(url, { headers });
  return data;
};

export { getItemDetails };

export default function useGetItemDetails({ itemId, moduleId, enabled = true }) {
  return useQuery(
    ["item-details", itemId, moduleId],
    () => getItemDetails(itemId, moduleId),
    {
      enabled: enabled && !!itemId,
      retry: 3,
      onError: onSingleErrorResponse,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}
