import MainApi from "../../../MainApi";
import { suggested_items_stores } from "../../../ApiRoutes";
import { useQuery } from "react-query";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";

const getGlobalData = async (key) => {
  if (key !== "") {
    const url = `${suggested_items_stores}?name=${key}`;
    // Override headers to remove moduleId for global search
    const headers = { ...MainApi.defaults.headers.common };
    delete headers.moduleId;
    const { data } = await MainApi.get(url, { headers });
    return data;
  }
};

export default function useGetGlobalSearch(key) {
  return useQuery(
    ["global-search-suggestions", key],
    () => getGlobalData(key),
    {
      enabled: false,
      cacheTime: 0,
      staleTime: 0,
      onError: onSingleErrorResponse,
    }
  );
}
