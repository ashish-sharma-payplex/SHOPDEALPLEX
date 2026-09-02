import useGetSearch from "./useGetSearch";
import useUniversalSearch from "./useUniversalSearch";

export default function useCombinedSearch(pageParams) {
  const { searchValue, offset = 0, page_limit = 20 } = pageParams;

  // Fetch full details for items and stores using module-specific search
  const itemsQuery = useGetSearch({
    currentTab: "items",
    searchValue,
    offset,
    page_limit,
  });

  const storesQuery = useGetSearch({
    currentTab: "stores",
    searchValue,
    offset,
    page_limit,
  });

  // Fetch universal search for suggestions (quick global data)
  const universalQuery = useUniversalSearch({
    searchValue,
    offset,
  });

  // Merge logic: Prioritize full details from itemsQuery/storesQuery, fallback to universal if empty
  const allItems = itemsQuery.data?.pages?.flatMap(page => page?.items || []) || [];
  const allStores = storesQuery.data?.pages?.flatMap(page => page?.stores || []) || [];
  const universalItems = universalQuery.data?.pages?.flatMap(page => page?.items || []) || [];
  const universalStores = universalQuery.data?.pages?.flatMap(page => page?.stores || []) || [];

  const mergedItems = allItems.length > 0 ? allItems : universalItems;
  const mergedStores = allStores.length > 0 ? allStores : universalStores;

  // Refetch all when searchValue changes
  const refetchAll = () => {
    itemsQuery.refetch();
    storesQuery.refetch();
    universalQuery.refetch();
  };

  return {
    itemsQuery,
    storesQuery,
    universalQuery,
    allItems: mergedItems,
    allStores: mergedStores,
    refetch: refetchAll,
    isLoading: itemsQuery.isLoading || storesQuery.isLoading || universalQuery.isLoading,
    isError: itemsQuery.isError || storesQuery.isError || universalQuery.isError,
  };
}
