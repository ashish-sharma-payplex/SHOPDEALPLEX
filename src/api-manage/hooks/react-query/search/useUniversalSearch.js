import MainApi from "../../../MainApi";
import { useInfiniteQuery } from "react-query";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";
import { universal_search_box } from "../../../ApiRoutes";

const getUniversalSearch = async (pageParams) => {
  const {
    searchValue,
    offset,
    pageParam,
  } = pageParams;
  const url = `${universal_search_box}?name=${searchValue}&offset=${
    pageParam ? pageParam : offset
  }&limit=20`;
  const headers = { ...MainApi.defaults.headers.common };
  delete headers.moduleId;
  const { data } = await MainApi.get(url, { headers });
  return data;
};

export default function useUniversalSearch(pageParams) {
  return useInfiniteQuery(
    ["universal-search", pageParams?.searchValue],
    ({ pageParam = 0 }) => getUniversalSearch({ ...pageParams, pageParam }),
    {
      getNextPageParam: (lastPage, allPages) => {
        const totalLoaded = lastPage?.items?.length + lastPage?.stores?.length || 0;
        const nextOffset = allPages.reduce((acc, page) => acc + 20, 0);
        return totalLoaded === 20 ? nextOffset : undefined;
      },
      retry: 3,
      enabled: false,
      onError: onSingleErrorResponse,
      cacheTime: 0,
    }
  );
}
