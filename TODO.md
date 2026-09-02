# TODO: Fix Products Not Showing on Search Page

## Steps to Complete
- [x] Update `src/api-manage/hooks/react-query/search/useGetSearch.js`:
  - Change `pageParam` default to `0` for correct offset on first fetch.
  - Use `pageParams.page_limit` in URL instead of hardcoded `100`.
  - Fix `getNextPageParam` logic: Check `currentTab === "stores"` for stores length, use full-page check for "has more", return cumulative offset.
- [x] Create `src/api-manage/hooks/react-query/items/useGetItemDetails.js` for fetching full item details.
- [x] Update `src/components/cards/ProductCard.js` to fetch full details for list-view and use in modal.
- [x] Implement `quickViewHandleClick` to open modal with full details.
- [x] Update `pages/search/index.js` to use `useCombinedSearch` and remove debug logs.
- [x] Clean up debug logs.
    