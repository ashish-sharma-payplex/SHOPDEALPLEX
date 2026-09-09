import React from "react";
import RentalFilterWrapper from "./RentalFilterWrapper";
import RentalPriceRange from "./RentalPriceRange";
import RentalCategories from "./RentalCategories";
import RentalBrands from "./RentalBrands";
import RentalSeats from "./RentalSeats";
import RentalCooling from "./RentalCooling";
import { FILTER_TITLES } from "./constants";
import { Box, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { useGetBrandLists } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/brands/useGetBrandLists";

const RentalFilter = ({
  minMax,
  setMinMax,
  setSelectedCategoryIds,
  selectedCategoryIds,
  setSelectedBrandIds,
  setSelectedSeats,
  setAirCondition,
  setNoAirCondition,
  rentalPriceFilterRange,
}) => {
  const { rentalCategories } = useSelector(
    (state) => state?.rentalCategoriesLists,
  );

  const { data: brands } = useGetBrandLists();
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "10px",
        px: 2,
        py: 2,

        /* Desktop scroll only */
        maxHeight: { xs: "none", md: "870px" },
        overflowY: { xs: "visible", md: "auto" },
        overflowX: "hidden",

        /* Smooth scrollbar */
        "&::-webkit-scrollbar": {
          width: "5px",
          mx: 2,
        },
        "&::-webkit-scrollbar-thumb": {
          background: theme.palette.mode === "dark" ? "#4b5563" : "#c1c1c1",
          borderRadius: "10px",
        },
      }}
    >
      <RentalFilterWrapper
        title={FILTER_TITLES.PRICE_RANGE}
        content={
          <RentalPriceRange
            minMax={minMax}
            setMinMax={setMinMax}
            rentalPriceFilterRange={rentalPriceFilterRange}
          />
        }
      />

      {rentalCategories?.length > 0 && (
        <RentalFilterWrapper
          title={FILTER_TITLES.CATEGORIES}
          content={
            <RentalCategories
              setSelectedCategoryIds={setSelectedCategoryIds}
              selectedCategoryIds={selectedCategoryIds}
            />
          }
        />
      )}

      {brands?.brands?.length > 0 && (
        <RentalFilterWrapper
          title={FILTER_TITLES.BRANDS}
          content={
            <RentalBrands
              brands={brands}
              setSelectedBrandIds={setSelectedBrandIds}
            />
          }
        />
      )}

      <RentalFilterWrapper
        title={FILTER_TITLES.SEATS}
        content={<RentalSeats setSelectedSeats={setSelectedSeats} />}
      />

      <RentalFilterWrapper
        title={FILTER_TITLES.COOLING}
        content={
          <RentalCooling
            setNoAirCondition={setNoAirCondition}
            setAirCondition={setAirCondition}
          />
        }
      />
    </Box>
  );
};

export default RentalFilter;
