import MainApi from "../../../MainApi";
import {
  universal_search_box,
  suggestedProducts_api,
} from "../../../ApiRoutes";
import { useQuery } from "react-query";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";

const getData = async ({ key, moduleType }) => {
  if (key !== "") {
    let url = `${universal_search_box}?name=${key}`;
    if (moduleType) {
      url += `&module_type=${moduleType}`;
    }
    // Override headers to remove moduleId for global search
    const headers = { ...MainApi.defaults.headers.common };
    delete headers.moduleId;
    const { data } = await MainApi.get(url, { headers });
    return data;
  }
};

export default function useGetItemOrStore({ key, moduleType }) {
  return useQuery(
    ["item-and-store-suggestions", key, moduleType],
    () => getData({ key, moduleType }),
    {
      enabled: false,
      onError: onSingleErrorResponse,
    }
  );
}
