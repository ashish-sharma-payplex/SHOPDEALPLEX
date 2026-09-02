import MainApi from "../../../MainApi";
import { useInfiniteQuery } from "react-query";

import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";

const getSearch = async (pageParams) => {
  const {
    currentTab: search_type,
    searchValue,
    offset,
    page_limit,
    pageParam,
  } = pageParams;
  const limit = page_limit || 100;
  const url = `/api/v1/${search_type}/search?name=${searchValue}&offset=${
    pageParam !== undefined ? pageParam : offset
  }&limit=${limit}`;
  const headers = { ...MainApi.defaults.headers.common };
  delete headers.moduleId;
  const { data } = await MainApi.get(url, { headers });
  return data;
};

export default function useGetSearch(pageParams) {
  return useInfiniteQuery(
    ["search-products", pageParams?.currentTab],
    ({ pageParam = 0 }) => getSearch({ ...pageParams, pageParam }),
    {
      getNextPageParam: (lastPage, allPages) => {
        const pageLimit = pageParams.page_limit || 100;
        const length = pageParams.currentTab === "stores" ? lastPage?.stores?.length || 0 : lastPage?.items?.length || 0;
        if (length < pageLimit) return undefined;
        return allPages.length * pageLimit;
      },
      getPreviousPageParam: (firstPage, allPages) => firstPage.prevCursor,
      retry: 3,
      enabled: false,
      onError: onSingleErrorResponse,
      cacheTime: "0",
    }
  );
}
