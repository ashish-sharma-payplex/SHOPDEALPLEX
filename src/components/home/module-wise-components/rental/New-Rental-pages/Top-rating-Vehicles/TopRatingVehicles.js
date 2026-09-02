"use client";

import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Link,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useRouter } from "next/router";
import VehicleCard from "./VehiclesCard";

/* ✅ Swiper */
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

/* ✅ API */
import { useGetTopRatedVehicleLists } from
  "../../rental-api-manage/hooks/top-rated/useGetTopRatedVehicleLists";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

/* ✅ NEW - Wishlist auto-sync ke liye */
import { useDispatch } from "react-redux";
import { setWishListVehicles } from "redux/slices/wishList";
import { useGetWishList } from "../../rental-api-manage/hooks/react-query/wishlist/useGetWishlist";

const TopRatingVehicles = () => {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch(); // ✅ NEW

  /* ✅ Detect mobile */
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    data: topRatedVehicles,
    isLoading,
    isError,
  } = useGetTopRatedVehicleLists();

  // ✅ NEW - Component mount hone pe wishlist fetch karo aur Redux mein set karo
  const { data: wishlistData } = useGetWishList();

useEffect(() => {
  if (wishlistData) {
    const vehicles = wishlistData?.data?.vehicles || wishlistData?.vehicles || [];
    dispatch(setWishListVehicles(vehicles));
  }
}, [wishlistData]);

  const vehicles = topRatedVehicles?.vehicles || [];

  const handleViewAllClick = () => {
    router.push({
      pathname: "/rental/vehicle-search",
      query: { top_rated: 1 },
    });
  };

  return (
    <Box sx={{ width: "100%", py: 6 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          px: { xs: 2, sm: 3, md: 3 },
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#3c4043" }}>
          Top Rated Vehicles
        </Typography>

        <Link
          component="button"
          onClick={handleViewAllClick}
          underline="none"
          sx={{
            color: "#4caf50",
            fontWeight: 500,
            background: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          View All
          <ArrowForwardIcon sx={{ fontSize: { xs: "1.1rem", sm: "1.2rem" } }} />
        </Link>
      </Box>

      {/* ERROR */}
      {isError && (
        <Alert severity="error">
          Failed to load top rated vehicles. Please try again.
        </Alert>
      )}

      {/* EMPTY */}
      {!isLoading && vehicles.length === 0 && !isError && (
        <Alert severity="info">
          No top rated vehicles found.
        </Alert>
      )}

      {/* MOBILE VIEW - AUTOSLIDING SWIPER */}
      {isMobile && (
        <Swiper
          modules={[Autoplay]}
          spaceBetween={12}
          slidesPerView={1}
          autoplay={{
            delay: 2800,
            disableOnInteraction: false,
          }}
          loop
        >
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <SwiperSlide key={`skeleton-mobile-${i}`}>
                <VehicleCard loading />
              </SwiperSlide>
            ))}

          {!isLoading &&
            vehicles.map((vehicle) => (
              <SwiperSlide key={vehicle.id}>
                <VehicleCard data={vehicle} vehicle={vehicle} />
              </SwiperSlide>
            ))}
        </Swiper>
      )}

      {/* DESKTOP VIEW - NORMAL GRID */}
      {!isMobile && (
        <Grid container spacing={3} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={`skeleton-desktop-${i}`}>
                <VehicleCard loading />
              </Grid>
            ))}

          {!isLoading &&
            vehicles.map((vehicle) => (
              <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                <VehicleCard data={vehicle} vehicle={vehicle} />
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
  );
};

export default TopRatingVehicles;