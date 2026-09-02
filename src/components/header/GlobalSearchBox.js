import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, InputAdornment, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";
import useDirectGlobalSearch from "../../api-manage/hooks/react-query/search/useDirectGlobalSearch";
import { removeSpecialCharacters } from "utils/CustomFunctions";
import { getAmountWithSign } from "helper-functions/CardHelpers";

const GlobalSearchBox = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [openSearchSuggestions, setOpenSearchSuggestions] = useState(false);
  const searchRef = useRef(null);

  const { data } = useDirectGlobalSearch(debouncedSearchValue);

  // Immediate hide suggestions if search is empty
  useEffect(() => {
    if (!searchValue.trim()) {
      setOpenSearchSuggestions(false);
    }
  }, [searchValue]);

  // Debounce search value for API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Show suggestions when debounced value is set and not empty
  useEffect(() => {
    if (debouncedSearchValue.trim()) {
      setOpenSearchSuggestions(true);
    }
  }, [debouncedSearchValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setOpenSearchSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Redirect to search results page
  const handleSearchRedirect = (term) => {
    const cleaned = term.trim();
    if (!cleaned) return;

    router.push({
      pathname: "/search",
      query: {
        search: cleaned,
      },
    });

    setOpenSearchSuggestions(false);
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchRedirect(searchValue);
    }
  };

  // Handle click on suggestion (item or store)
  const handleSuggestionClick = (name) => {
    setSearchValue(name);
    handleSearchRedirect(name);
    setOpenSearchSuggestions(false);
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }} ref={searchRef}>
      <TextField
        variant="outlined"
        placeholder="Search all products and stores..."
        value={searchValue}
        onChange={(e) =>
          setSearchValue(removeSpecialCharacters(e.target.value))
        }
        onKeyDown={handleKeyDown}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        fullWidth
      />

      {/* Suggestions Dropdown */}
      {openSearchSuggestions && data && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            bgcolor: "white",
            boxShadow: 2,
            zIndex: 2,
            maxHeight: "400px",
            overflowY: "auto",
            borderRadius: "8px",
            mt: 1,
            color: "#000000",
          }}
        >
          {data.items.length > 0 || data.stores.length > 0 ? (
            <>
              {data.items.map((item, index) => (
                <Box
                  key={`item-${index}`}
                  sx={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    ":hover": { backgroundColor: "#f5f5f5" },
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                  onClick={() => handleSuggestionClick(item.name)}
                >
                  <img
                    src={item.image_full_url}
                    alt={item.name}
                    style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="500">
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.store_name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="600" color="primary">
                    {getAmountWithSign(item.price)}
                  </Typography>
                </Box>
              ))}
              {data.stores.map((store, index) => (
                <Box
                  key={`store-${index}`}
                  sx={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    ":hover": { backgroundColor: "#f5f5f5" },
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                  onClick={() => handleSuggestionClick(store.name)}
                >
                  <img
                    src={store.logo_full_url}
                    alt={store.name}
                    style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="500">
                      {store.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Store
                    </Typography>
                  </Box>
                </Box>
              ))}
            </>
          ) : (
            <Box
              sx={{
                padding: "10px",
                textAlign: "center",
                color: "#777",
              }}
            >
              No results found
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default GlobalSearchBox;
