import React, { useRef } from "react";
import {
  CustomBoxFullWidth,
  CustomTextField,
} from "styled-components/CustomStyles.style";
import {
  Button,
  InputAdornment,
  styled,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import WindowIcon from "@mui/icons-material/Window";
import ViewListIcon from "@mui/icons-material/ViewList";
import RentalCarHighToLow from "./RentalCarHighToLow";
import H1 from "components/typographies/H1";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { t } from "i18next";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";

/* =====================================================
   TOGGLE STYLES
===================================================== */

/* Capsule container */
const ToggleWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "6px",
  borderRadius: "12px",
  background: theme.palette.common.white,
  border: `1px solid ${theme.palette.neutral[200]}`,
}));

/* Icon button */
const ToggleButton = styled(Box)(({ active }) => ({
  width: 40,
  height: 40,
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",

  background:
    active === "true"
      ? "rgba(20,186,189,0.15)"
      : "transparent",

  boxShadow:
    active === "true"
      ? "0 1px 4px rgba(0,0,0,0.12)"
      : "none",

  "& svg": {
    fontSize: 18,
    color:
      active === "true"
        ? "#14BABD"
        : "#6b7280",
  },

  "&:hover": {
    background:
      active === "true"
        ? "rgba(20,186,189,0.22)"
        : "rgba(0,0,0,0.04)",
  },

  transition: "0.18s ease",
}));

/* =====================================================
   COMPONENT
===================================================== */

const RentalFilterMenu = ({
  currentView,
  setCurrentView,
  setSideDrawerOpen,
  setSearchKey,
  setSortBy,
  sortBy,
  totalItems = 0,
}) => {
  const router = useRouter();
  const topRated = router?.query?.top_rated;

  const theme = useTheme();
  const isSmallSize = useMediaQuery(theme.breakpoints.down("sm"));

  const debounceTimeout = useRef(null);

  /* ✅ SEARCH DEBOUNCE */
  const debounce = (callback, delay) => (value) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => callback(value), delay);
  };

  const handleSearch = debounce(setSearchKey, 300);

  const handleChange = (e) => {
    let value = e.target.value;

    // ❌ leading spaces hata do
    value = value.replace(/^\s+/, "");

    handleSearch(value);
  };

  const handleSortBy = (value) => setSortBy(value);

  /* ---- SIDEBAR WIDTH MUST MATCH RentalCarSidebarData ---- */
  const SIDEBAR_WIDTH = 260;       // md/lg sidebar = 260px
  const GRID_GUTTER = 32;          // grid spacing
  const GRID_OFFSET = SIDEBAR_WIDTH + GRID_GUTTER;

  return (
    <>
      <Toaster position="top-center" />

      <CustomBoxFullWidth
        sx={{
          marginLeft: "10px",
          marginBottom: "30px",
          background: theme.palette.background.default,
          borderBottom: `1px solid ${theme.palette.neutral[200]}`,
          py: "18px",
        }}
      >
        {/* ✅ MOBILE SEARCH + FILTER */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            mb: "20px",
          }}
        >
          <Box flex={1}>
            <CustomTextField
              fullWidth
              placeholder={t("Search for items...")}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "primary.main", fontSize: "18px" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Button onClick={() => setSideDrawerOpen(true)} variant="outlined">
            <FilterListIcon />
          </Button>
        </Box>

        {/* ===================================================== */}
        {/* ✅ DESKTOP HEADER — PERFECT CARD ALIGNMENT */}
        {/* ===================================================== */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr auto", md: "200px 1fr auto" }, // mobile: left column (count) and right column (title)
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* LEFT COUNT (on mobile, right on grid) */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography fontWeight={600} fontSize="14px">
              {totalItems ? `${totalItems} vehicles available` : ""}
            </Typography>
          </Box>

          {/* ✅ TITLE — SHIFTED TO MATCH CARDS START */}
          <Box sx={{ width: '100%', ml: { xs: '10px', sm: '5%', md: '10%' } }}>
            <H1
              color="#d72a00"
              textTransform="uppercase"
              letterSpacing="1px"
              textAlign="left"
              fontSize="22px" // fixed font size
              paddingRight="5px"
              text={topRated ? "Top Rated Vehicles" : "All Vehicles"}
            />
          </Box>

          {/* RIGHT COUNT (on mobile, show count on the right) */}
          <Box sx={{ display: { xs: "block", md: "none" }, textAlign: "right" }}>
            <Typography fontWeight={600} fontSize="14px">
              {totalItems ? `${totalItems} vehicles available` : ""}
            </Typography>
          </Box>

          {/* RIGHT CONTROLS */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* GRID/LIST TOGGLE */}
            {/* <ToggleWrapper>
      <ToggleButton
        active={currentView === 0 ? "true" : "false"}
        onClick={() => setCurrentView(0)}
      >
        <WindowIcon />
      </ToggleButton>

      <ToggleButton
        active={currentView === 1 ? "true" : "false"}
        onClick={() => setCurrentView(1)}
      >
        <ViewListIcon />
      </ToggleButton>
    </ToggleWrapper> */}

            {/* SEARCH */}
            <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 260 }}>
              <CustomTextField
                onChange={handleChange}
                placeholder={t("Search vehicles...")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "primary.main", fontSize: "18px" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* SORT */}
            {!isSmallSize && (
              <RentalCarHighToLow handleSortBy={handleSortBy} sortBy={sortBy} />
            )}
          </Box>
        </Box>
      </CustomBoxFullWidth>
    </>
  );
};

export default RentalFilterMenu;
