import { useQuery } from "react-query";
import MainApi from "../../../MainApi";
import { universal_search_box } from "../../../ApiRoutes";

const fetchGlobalData = async (key) => {
  if (key !== "") {
    const url = `${universal_search_box}?name=${key}`;
    const headers = { ...MainApi.defaults.headers.common };
    delete headers.moduleId;
    const { data } = await MainApi.get(url, { headers });
    return data;
  }
  return null;
};

export default function useDirectGlobalSearch(key) {
  const { data, isLoading, refetch } = useQuery(
    ['directGlobalSearch', key],
    () => fetchGlobalData(key),
    {
      enabled: Boolean(key?.trim()),
    }
  );

  return { data: data ?? null, loading: isLoading, refetch };
}
