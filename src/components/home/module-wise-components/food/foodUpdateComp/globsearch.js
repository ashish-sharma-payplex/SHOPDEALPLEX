// src\components\home\module-wise-components\food\foodUpdateComp\globsearch.js

import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, InputAdornment, Typography, useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";
import useDirectGlobalSearch from "../../../../../api-manage/hooks/react-query/search/useDirectGlobalSearch";
import { removeSpecialCharacters } from "utils/CustomFunctions";
import { getAmountWithSign } from "helper-functions/CardHelpers";

const GlobalSearchBox = () => {
  const router = useRouter();
  const searchRef = useRef(null);

  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [openSearchSuggestions, setOpenSearchSuggestions] = useState(false);

  const { data } = useDirectGlobalSearch(debouncedSearchValue);

  /* ------------------------------
     Debounce Search
  ------------------------------ */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue]);

  /* ------------------------------
     Show/Hide Dropdown
  ------------------------------ */
  useEffect(() => {
    if (debouncedSearchValue.trim()) setOpenSearchSuggestions(true);
  }, [debouncedSearchValue]);

  useEffect(() => {
    if (!searchValue.trim()) setOpenSearchSuggestions(false);
  }, [searchValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setOpenSearchSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ------------------------------
     Actions
  ------------------------------ */
  const handleSearchRedirect = (term) => {
    const cleaned = term.trim();
    if (!cleaned) return;

    // 🔎 DEBUG LOG — isse console me confirm karo ki click yaha tak pahunch raha hai ya nahi.
    // Agar yeh line console me print NAHI hoti, toh issue click reach hone ka hai
    // (overlay/z-index/backdrop blocking) — router ka nahi.
    // console.log("🔎 handleSearchRedirect called with:", cleaned);

    router.push(`/search?search=${encodeURIComponent(cleaned)}`);
    setOpenSearchSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearchRedirect(searchValue);
  };

  const handleSuggestionClick = (name) => {
    setSearchValue(name);
    handleSearchRedirect(name);
  };

  /* ------------------------------
     Filtering Logic
  ------------------------------ */
  const filterSuggestions = (data, searchTerm) => {
    const cleaned = searchTerm.trim().toLowerCase();
    if (!cleaned) return { items: [], stores: [] };

    const exact = data.items.filter((i) => i.name.toLowerCase() === cleaned);
    const prefix = data.items.filter(
      (i) =>
        i.name.toLowerCase().startsWith(cleaned) &&
        i.name.toLowerCase() !== cleaned
    );
    const contains = data.items.filter(
      (i) =>
        i.name.toLowerCase().includes(cleaned) &&
        !i.name.toLowerCase().startsWith(cleaned)
    );

    const exactStores = data.stores.filter((s) => s.name.toLowerCase() === cleaned);
    const prefixStores = data.stores.filter(
      (s) =>
        s.name.toLowerCase().startsWith(cleaned) &&
        s.name.toLowerCase() !== cleaned
    );
    const containsStores = data.stores.filter(
      (s) =>
        s.name.toLowerCase().includes(cleaned) &&
        !s.name.toLowerCase().startsWith(cleaned)
    );

    return {
      items: [...exact, ...prefix, ...contains],
      stores: [...exactStores, ...prefixStores, ...containsStores],
    };
  };

  const filteredData = data ? filterSuggestions(data, debouncedSearchValue) : { items: [], stores: [] };

  /* ------------------------------
     Styles Adjusted for Mobile
  ------------------------------ */

  const inputHeight = isMobile ? "36px" : "48px";
  const imageSize = isMobile ? 32 : 40;
  const fontSize = isMobile ? "13px" : "15px";
  const suggestionPadding = isMobile ? "8px" : "10px";
  const dropdownMaxHeight = isMobile ? "260px" : "400px";

  return (
    <Box sx={{ position: "relative", width: "100%", zIndex: 1201 }} ref={searchRef}>
      {/* SEARCH INPUT */}
      <TextField
        variant="outlined"
        placeholder={isMobile ? "Search..." : "Search Products & Restaurants..."}
        value={searchValue}
        onChange={(e) => setSearchValue(removeSpecialCharacters(e.target.value))}
        onKeyDown={handleKeyDown}
        fullWidth
        InputProps={{
          sx: {
            height: inputHeight,
            fontSize,
            backgroundColor: "var(--bg-card)",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--food-border-input)" },
          },
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: isMobile ? 18 : 22 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* SUGGESTIONS */}
      {openSearchSuggestions && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            bgcolor: "var(--bg-card)",
            color: "var(--text-strong)",
            boxShadow: 3,
            // 🔧 FIX: bahut zyada high z-index taaki koi bhi page content (banner/carousel/
            // header ka koi aur hissa) isse upar na aa sake aur click intercept na kare.
            zIndex: 99999,
            pointerEvents: "auto",
            maxHeight: dropdownMaxHeight,
            overflowY: "auto",
            borderRadius: "8px",
            mt: 1,
          }}
        >
          {filteredData.items.length === 0 && filteredData.stores.length === 0 ? (
            <Box sx={{ padding: suggestionPadding, textAlign: "center", fontSize, color: "var(--text-strong)" }}>
              No results found
            </Box>
          ) : (
            <>
              {/* PRODUCTS */}
              {filteredData.items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    padding: suggestionPadding,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderBottom: "1px solid var(--food-border-light)",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "var(--food-bg-hover)" },
                  }}
                  // 🔧 FIX: onMouseDown use kiya + preventDefault, taaki TextField ka blur
                  // ya document ka "mousedown" outside-click listener, click complete hone
                  // se PEHLE dropdown ko unmount/remove na kar de. onMouseDown, onClick se
                  // pehle fire hota hai isliye race condition khatam ho jaati hai.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSuggestionClick(item.name);
                  }}
                >
                  <img
                    src={item.image_full_url}
                    alt={item.name}
                    style={{
                      width: imageSize,
                      height: imageSize,
                      borderRadius: "5px",
                      objectFit: "cover",
                      pointerEvents: "none", // img khud click ko na roke
                    }}
                  />
                  <Box sx={{ flex: 1, pointerEvents: "none" }}>
                    <Typography sx={{ fontSize, fontWeight: 500 }}>{item.name}</Typography>
                    <Typography sx={{ fontSize: "11px", color: "var(--text-strong)" }}>{item.store_name}</Typography>
                  </Box>
                  <Typography sx={{ fontSize, fontWeight: 600, color: "var(--text-strong)", pointerEvents: "none" }}>
                    {getAmountWithSign(item.price)}
                  </Typography>
                </Box>
              ))}

              {/* STORES */}
              {filteredData.stores.map((store, idx) => (
                <Box
                  key={idx}
                  sx={{
                    padding: suggestionPadding,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderBottom: "1px solid var(--food-border-light)",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "var(--food-bg-hover)" },
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSuggestionClick(store.name);
                  }}
                >
                  <img
                    src={store.logo_full_url}
                    alt={store.name}
                    style={{
                      width: imageSize,
                      height: imageSize,
                      borderRadius: "5px",
                      objectFit: "cover",
                      pointerEvents: "none",
                    }}
                  />
                  <Box sx={{ flex: 1, pointerEvents: "none" }}>
                    <Typography sx={{ fontSize, fontWeight: 500 }}>{store.name}</Typography>
                    <Typography sx={{ fontSize: "11px", color: "var(--text-strong)" }}>Store</Typography>
                  </Box>
                </Box>
              ))}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default GlobalSearchBox;