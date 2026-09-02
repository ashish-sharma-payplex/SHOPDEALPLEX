import { Grid, Box } from "@mui/material";
import React, { useEffect, useMemo, useRef } from "react";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import RentalFilter from "./RentalFilter";
import { Stack } from "@mui/system";
import { useInView } from "react-intersection-observer";
import EmptySearchResults from "components/EmptySearchResults";
import VehicleCard from "../../New-Rental-pages/Top-rating-Vehicles/VehiclesCard";
import VehicleCardSkeleton from "./VehicleCardSkeleton";

/*
  SIDEBAR_WIDTH — left filter ki fixed width
  Yeh value RentalFilter Box ki width se match karni chahiye
*/
const SIDEBAR_WIDTH = 260;

/*
  SKELETON_COUNT — pehli load pe kitne skeleton cards dikhaane hain
  Real cards ke grid jaisi hi row/col structure rahegi
*/
const SKELETON_COUNT = 9;

const RentalCarSidebarData = ({
  data,
  minMax,
  setMinMax,
  setSelectedCategoryIds,
  setSelectedBrandIds,
  setSelectedSeats,
  setAirCondition,
  setNoAirCondition,
  isFetching,
  setInViewport,
  currentView,
  from,
  rentalPriceFilterRange,
}) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    setInViewport(inView);
  }, [inView, setInViewport]);

  const vehicles = useMemo(() => {
    if (!data) return [];
    if (data?.pages) return data.pages.flatMap((page) => page?.vehicles || []);
    if (Array.isArray(data?.vehicles)) return data.vehicles;
    return [];
  }, [data]);

  // ✅ Purane vehicles yaad rakho — filter lagane pe bhi layout nahi dabega
  const prevVehiclesRef = useRef([]);
  if (vehicles.length > 0) prevVehiclesRef.current = vehicles;
  const prevVehicles = prevVehiclesRef.current;

  const isFirstLoad     = isFetching && prevVehicles.length === 0;
  const isRefetching    = isFetching && prevVehicles.length > 0;
  const displayVehicles = vehicles.length > 0 ? vehicles : prevVehicles;
  const isEmpty         = !isFetching && vehicles.length === 0 && prevVehicles.length === 0;

  // Grid breakpoints — skeleton aur real cards dono ke liye same
  const gridItemProps = {
    xs: 12,
    sm: 6,
    md: currentView === 0 ? 6 : 12,
    lg: currentView === 0 ? 4 : 12,
  };

  return (
    <CustomBoxFullWidth>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "24px",
        }}
      >

        {/* ============================================================
            LEFT SIDEBAR — FIXED 260px
            width + minWidth + flexShrink:0 = kuch bhi ho, yeh nahi dabega
            ============================================================ */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: `${SIDEBAR_WIDTH}px`,
            minWidth: `${SIDEBAR_WIDTH}px`,
            flexShrink: 0,
          }}
        >
          <RentalFilter
            minMax={minMax}
            setMinMax={setMinMax}
            setSelectedCategoryIds={setSelectedCategoryIds}
            setSelectedBrandIds={setSelectedBrandIds}
            setSelectedSeats={setSelectedSeats}
            setNoAirCondition={setNoAirCondition}
            setAirCondition={setAirCondition}
            rentalPriceFilterRange={rentalPriceFilterRange}
          />
        </Box>

        {/* ============================================================
            RIGHT CONTENT — flex:1
            minWidth:0 zaroori hai flex child ke liye overflow rokne ke liye
            ============================================================ */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack sx={{ paddingBottom: "40px", px: 1 }}>
            <Grid container spacing={3}>

              {/* --------------------------------------------------
                  CASE 1 — PEHLI BAAR LOAD
                  Skeleton cards dikhao — real card jaisi FIXED height
                  Grid structure same rakhne se left sidebar nahi dabega
                  -------------------------------------------------- */}
              {isFirstLoad &&
                Array.from(new Array(SKELETON_COUNT)).map((_, i) => (
                  <Grid item {...gridItemProps} key={`sk-${i}`}>
                    {/* ✅ Wrapper se skeleton exact real card jaisi height leta hai */}
                    <VehicleCardSkeleton />
                  </Grid>
                ))
              }

              {/* --------------------------------------------------
                  CASE 2 — FILTER REFETCH (purana data dimmed)
                  CASE 3 — NORMAL DISPLAY
                  Dono mein same cards, sirf opacity badlti hai
                  Layout kabhi nahi dabega
                  -------------------------------------------------- */}
              {!isFirstLoad && displayVehicles.map((vehicle) => (
                <Grid key={vehicle.id} item {...gridItemProps}>
                  <Box
                    sx={{
                      opacity: isRefetching ? 0.4 : 1,
                      transition: "opacity 0.25s ease",
                      pointerEvents: isRefetching ? "none" : "auto",
                    }}
                  >
                    <VehicleCard data={vehicle} from={from} />
                  </Box>
                </Grid>
              ))}

          
              {isEmpty && (
                <Grid item xs={12}>
                  <EmptySearchResults isRental text="Rental Car Not Found!" />
                </Grid>
              )}

            </Grid> 
          </Stack>

          {/* Infinite scroll trigger */}
          <Stack alignItems="center" ref={ref} />
        </Box>

      </Box>
    </CustomBoxFullWidth>
  );
};

export default RentalCarSidebarData;