import React, { useEffect, useState, useMemo } from "react";
import {
  CustomBoxFullWidth,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import RentalFilterMenu from "../rentalfilter/RentalFilterMenu";
import RentalCarSidebarData from "../rentalfilter/RentalCarSidebarData";
import { Box, IconButton, useScrollTrigger } from "@mui/material";
import CustomSideDrawer from "components/side-drawer/CustomSideDrawer";
import RentalFilter from "./RentalFilter";
import CloseIcon from "@mui/icons-material/Close";
import useGetRentalSearch from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/search/useGetRentalSearch";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useRef } from "react";

export const fTime = (selectedDate) => {
  const userDate = new Date(selectedDate);
  return userDate
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/(\d+)\/(\d+)\/(\d+),\s(\d+:\d+\s[AP]M)/, "$3-$1-$2 $4");
};

const RentalCarFilterSection = ({ isSticky, api_endpoint,categoryId, allCategory  }) => {
  const router = useRouter();
  const scrolling = useScrollTrigger();

  const topRated = router?.query?.top_rated;
  const all_category = allCategory;
  const id = router.query?.id;
  const from = router.query?.from;

  const [offset, setOffset] = useState(1);
  const [limit, setLimit] = useState(12);
  const [minMax, setMinMax] = useState([0, 0]);
  const [rentalPriceFilterRange, setRentalPriceFilterRange] = useState([
    null,
    null,
  ]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [airCondition, setAirCondition] = useState(false);
  const [noAirCondition, setNoAirCondition] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentView, setCurrentView] = useState(0);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [inViewport, setInViewport] = useState(false);

  // ✅ FIX — Local state so filter lagane par all_category override na ho
  const [activeAllCategory, setActiveAllCategory] = useState(
    all_category === "1" ? "1" : null
  );

  const rentalSearch = useSelector(
    (state) => state?.rentalSearch?.rentalSearch,
  );

  const { rentalCategories } = useSelector(
    (state) => state?.rentalCategoriesLists,
  );

  const scrollRef = useRef(null);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategoryIds([categoryId]);
    }
  }, [categoryId]);

  // ✅ FIX — rentalCategories bhi dependency mein daali
  useEffect(() => {
  if (all_category === "1" && rentalCategories?.length > 0) {
    const ids = rentalCategories.map((item) => item?.id);
    setSelectedCategoryIds(ids);
    setActiveAllCategory("1");
  }
}, [all_category, rentalCategories]);

  const closeHandler = () => {
    setSideDrawerOpen(false);
  };

  // ✅ FIX — 6 Wrapper functions — filter lagate hi activeAllCategory null ho jaaye
  const handleSetMinMax = (val) => {
    setActiveAllCategory(null);
    setMinMax(val);
  };

  const handleSetSelectedCategoryIds = (ids) => {
    setActiveAllCategory(null);
    setSelectedCategoryIds(ids);
  };

  const handleSetSelectedBrandIds = (ids) => {
    setActiveAllCategory(null);
    setSelectedBrandIds(ids);
  };

  const handleSetSelectedSeats = (seats) => {
    setActiveAllCategory(null);
    setSelectedSeats(seats);
  };

  const handleSetAirCondition = (val) => {
    setActiveAllCategory(null);
    setAirCondition(val);
  };

  const handleSetNoAirCondition = (val) => {
    setActiveAllCategory(null);
    setNoAirCondition(val);
  };

  const { selectedDate, tripType, duration } = rentalSearch || {};

  const pickup_location =
    typeof window !== "undefined"
      ? window.localStorage.getItem("currentLatLng")
      : false;

  const handleAPiCallOnSuccess = (res) => {
    if (
      res?.pages?.[0]?.min_price &&
      res?.pages?.[0]?.max_price &&
      minMax[0] === 0 &&
      minMax[1] === 0
    ) {
      setRentalPriceFilterRange([
        res.pages[0].min_price,
        res.pages[0].max_price,
      ]);
    }
  };

  const min_price = minMax[0];
  const max_price = minMax[1];

  const { data, hasNextPage, fetchNextPage, isFetching } = useGetRentalSearch(
    {
      name: searchKey,
      date:
        router.pathname === "/rental/vehicle-search" &&
        topRated !== "1" &&
        !categoryId &&
        all_category !== "1"
          ? fTime(selectedDate)
          : null,
      tripType:
        api_endpoint === "/api/v1/rental/vehicle/get-provider-vehicles"
          ? "provider_wise"
          : tripType,
      duration,
      min_price,
      max_price,
      offset,
      limit,
      api_endpoint,
      provider_id: id,
      category_ids: selectedCategoryIds,
      brand_ids: selectedBrandIds,
      seating_capacity: selectedSeats,
      air_condition: airCondition ? 1 : 0,
      no_air_condition: noAirCondition ? 1 : 0,
      sort_by: sortBy,
      top_rated: topRated,
      pickup_location,
      all_category: activeAllCategory, // ✅ FIX — router.query ki jagah local state
    },
    handleAPiCallOnSuccess,
  );

  useEffect(() => {
    if (api_endpoint === "/api/v1/rental/vehicle/get-provider-vehicles" && id) {
      setRentalPriceFilterRange([
        data?.pages?.[0]?.min_price,
        data?.pages?.[0]?.max_price,
      ]);
    }
  }, [api_endpoint, id]);

  useEffect(() => {
    if (inViewport && hasNextPage) {
      fetchNextPage();
    }
  }, [inViewport]);

  useEffect(() => {
    setOffset(1);
  }, [
    min_price,
    max_price,
    selectedCategoryIds,
    selectedBrandIds,
    selectedSeats,
    airCondition,
    noAirCondition,
    searchKey,
    sortBy,
    selectedDate,
    tripType,
    offset,
    limit,
    topRated,
    api_endpoint,
    id,
    pickup_location,
  ]);

  useEffect(() => {
    if (categoryId && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 800);
    }
  }, [categoryId]);

  const normalizedData = useMemo(() => {
    if (!data) return null;

    if (data?.pages) return data;

    if (data?.vehicles) {
      return {
        pages: [
          {
            ...data,
            vehicles: data.vehicles,
          },
        ],
      };
    }

    return null;
  }, [data]);

  const totalItems = normalizedData?.pages
    ? normalizedData.pages.reduce(
        (sum, p) => sum + (p?.vehicles?.length || 0),
        0,
      )
    : 0;

  return (
    <Box>
      <CustomBoxFullWidth
        sx={{
          mt: "30px",
          mb: "50px",
          width: "100%",
        }}
      >
        {/* Sticky Rental Filter Menu */}
        <Box
          sx={{
            position: { md: "sticky" },
            transition: "all 0.4s ease",
            top: {
              xs: "50px",
              sm: isSticky ? "140px" : "64px",
              md: isSticky ? (scrolling ? "140px" : "170px") : "64px",
            },
            height: "fit-content",
            zIndex: 1099,
          }}
        >
          <RentalFilterMenu
            sideDrawerOpen={sideDrawerOpen}
            setSideDrawerOpen={setSideDrawerOpen}
            currentView={currentView}
            setCurrentView={setCurrentView}
            setSearchKey={setSearchKey}
            setSortBy={setSortBy}
            sortBy={sortBy}
            totalItems={totalItems}
          />
        </Box>

        <Box sx={{ flex: 1 }} ref={scrollRef}>
          <RentalCarSidebarData
            minMax={minMax}
            setMinMax={handleSetMinMax}                           // ✅ wrapper
            setSelectedCategoryIds={handleSetSelectedCategoryIds} // ✅ wrapper
            setSelectedBrandIds={handleSetSelectedBrandIds}       // ✅ wrapper
            setSelectedSeats={handleSetSelectedSeats}             // ✅ wrapper
            setAirCondition={handleSetAirCondition}               // ✅ wrapper
            setNoAirCondition={handleSetNoAirCondition}           // ✅ wrapper
            data={normalizedData}
            isFetching={isFetching}
            setInViewport={setInViewport}
            currentView={currentView}
            from={from}
            rentalPriceFilterRange={rentalPriceFilterRange}
          />
        </Box>
      </CustomBoxFullWidth>

      <CustomSideDrawer
        anchor="right"
        open={sideDrawerOpen}
        onClose={closeHandler}
        variant="temporary"
        maxWidth="303px"
        width="100%"
        height="100vh"
      >
        <CustomStackFullWidth sx={{ px: 2, mt: 2 }}>
          <IconButton
            onClick={closeHandler}
            sx={{ position: "absolute", top: 0, right: 0 }}
          >
            <CloseIcon sx={{ fontSize: "16px" }} />
          </IconButton>

          <RentalFilter
            minMax={minMax}
            setMinMax={handleSetMinMax}                           // ✅ wrapper
            setSelectedCategoryIds={handleSetSelectedCategoryIds} // ✅ wrapper
            setSelectedBrandIds={handleSetSelectedBrandIds}       // ✅ wrapper
            setSelectedSeats={handleSetSelectedSeats}             // ✅ wrapper
            setNoAirCondition={handleSetNoAirCondition}           // ✅ wrapper
            setAirCondition={handleSetAirCondition}               // ✅ wrapper
            rentalPriceFilterRange={rentalPriceFilterRange}
          />
        </CustomStackFullWidth>
      </CustomSideDrawer>
    </Box>
  );
};

export default RentalCarFilterSection;