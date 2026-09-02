import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useGetItemOrStore from "api-manage/hooks/react-query/search/useGetItemOrStore";
import { removeSpecialCharacters } from "utils/CustomFunctions";

/**
 * Custom Hook: useManageSearch
 * Handles search logic, suggestions, focus events, and routing.
 *
 * @param {Object} options
 * @param {string} options.searchQuery - Initial search value (if any)
 * @param {Object} options.query - Current query object from URL
 * @param {number} options.currentTab - Determines search type ('category' or 'all')
 */
const useManageSearch = ({ searchQuery, query, currentTab }) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(searchQuery || "");
  const [openSearchSuggestions, setOpenSearchSuggestions] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [onSearchdiv, setOnSearchdiv] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [d_type, setD_type] = useState(currentTab === 0 ? "category" : "all");
  const searchRef = useRef(null);

  // 🔁 Update data type when tab changes
  useEffect(() => {
    setD_type(currentTab === 0 ? "category" : "all");
  }, [currentTab]);

  // 🔁 Reset search when query prop changes
  useEffect(() => {
    if (searchQuery === undefined) {
      setSearchValue("");
    }
  }, [searchQuery]);

  // 🔍 Handle "Enter" or manual search trigger
  const handleKeyPress = (value, remove) => {
    if (value !== "") {
      setOpenSearchSuggestions(false);

      // Save recent searches in localStorage
      let recentSearches = JSON.parse(localStorage.getItem("searchedValues")) || [];
      if (value && !recentSearches.includes(value)) {
        recentSearches.push(value);
        localStorage.setItem("searchedValues", JSON.stringify(recentSearches));
      }

      router.push({
        pathname: "/search",
        query: { searchValue: value },
      });
    } else {
      if (remove === "true" && searchQuery) {
        const newQuery = {
          ...query,
          search: value,
          data_type: d_type,
        };

        router.replace(
          {
            pathname: router.pathname,
            query: newQuery,
          },
          undefined,
          { shallow: true }
        );
      } else {
        setSearchValue("");
      }
    }
  };

  // 🛍️ Handle clicking on a suggested item
  const handleSearchItemClick = (item) => {
    setSearchValue(item.name);
    setOpenSearchSuggestions(false);
    router.push({
      pathname: "/product/[id]",
      query: { id: item.id, module_id: item.module_id },
    });
  };

  // 🏪 Handle clicking on a suggested store
  const handleSearchStoreClick = (store) => {
    setSearchValue(store.name);
    setOpenSearchSuggestions(false);
    router.push({
      pathname: "/store/[id]",
      query: {
        id: store.id || "",
        module_id: store.module_id || "",
      },
      as: `/store/${store.id}`,
    });
  };

  // 🔄 Fetch suggestions (debounced)
  const {
    data: itemOrStoreSuggestionData,
    refetch: refetchItemOrStoreSuggestion,
    isRefetching: isRefetchingItemOrStoreSuggestion,
  } = useGetItemOrStore({
    key: removeSpecialCharacters(searchValue),
    moduleType: d_type,
  });

  useEffect(() => {
    if (!searchValue) return;
    const debounceTimeout = setTimeout(() => {
      refetchItemOrStoreSuggestion();
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchValue]);

  // 📊 Open suggestions when data is available
  useEffect(() => {
    if (
      itemOrStoreSuggestionData?.items?.length > 0 ||
      itemOrStoreSuggestionData?.stores?.length > 0
    ) {
      setOpenSearchSuggestions(true);
    } else {
      setOpenSearchSuggestions(false);
    }
  }, [itemOrStoreSuggestionData]);

  // 👀 Focus handling
  const handleOnFocus = () => {
    setIsEmpty(searchValue === "");
    setOpenSearchSuggestions(true);
    localStorage.setItem("bg", true);
  };

  // ❌ Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setOpenSearchSuggestions(false);
        setIsEmpty(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  return {
    // State
    searchValue,
    setSearchValue,
    openSearchSuggestions,
    setOpenSearchSuggestions,
    selectedValue,
    setSelectedValue,
    onSearchdiv,
    setOnSearchdiv,
    isEmpty,
    setIsEmpty,
    d_type,

    // Actions
    handleKeyPress,
    handleSearchItemClick,
    handleSearchStoreClick,
    handleOnFocus,

    // API data
    itemOrStoreSuggestionData,
    isRefetchingItemOrStoreSuggestion,

    // Ref
    searchRef,
  };
};

export default useManageSearch;
