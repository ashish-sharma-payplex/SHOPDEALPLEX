import { useInfiniteQuery } from "react-query";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";
import { getToken } from "helper-functions/getToken";
import { bbps_billers_api } from "api-manage/UtilityApi";
import MainApi from "api-manage/MainApi";

const LIMIT = 10;

const getBbpsBillers = async ({ pageParam = 0, queryKey }) => {
  const [, slug] = queryKey;
  const token = getToken();

  const response = await MainApi.get(bbps_billers_api, {
    params: {
      catval: slug,
      offset: pageParam,
      limit: LIMIT,
    },
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });

  return {
    records: response?.data?.data?.records || [],
    pagination: response?.data?.data?.pagination || {},
    nextOffset: response?.data?.data?.pagination?.next_offset ?? null,
    isLastPage: response?.data?.data?.pagination?.is_last_page ?? true,
  };
};

export default function useGetBbpsBillers(slug) {
  return useInfiniteQuery(
    ["bbps-billers", slug],
    getBbpsBillers,
    {
      enabled: !!slug,
      getNextPageParam: (lastPage) => {
        if (lastPage.isLastPage) return undefined;
        return lastPage.nextOffset;
      },
      retry: false,
      staleTime: 0,    
      cacheTime: 0,    
      onError: onSingleErrorResponse,
    }
  );
}