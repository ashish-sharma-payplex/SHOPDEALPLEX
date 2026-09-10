"use client";

import React from "react";
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

/* ✅ Swiper */
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useDispatch } from "react-redux";
import VehicleCard from "components/home/module-wise-components/rental/New-Rental-pages/Top-rating-Vehicles/VehiclesCard";
import { useGetTopRatedVehicleLists } from "components/home/module-wise-components/rental/rental-api-manage/hooks/top-rated/useGetTopRatedVehicleLists";
import { setWishListVehicles } from "redux/slices/wishList";
import { useGetWishList } from "api-manage/hooks/react-query/rental-wishlist/useGetWishlist";
import { Toaster } from "react-hot-toast";

const CarRental = () => {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    data: topRatedVehicles,
    isLoading,
    isError,
  } = useGetTopRatedVehicleLists();

  useGetWishList((data) => {
    const vehicles = data?.data?.vehicles || data?.vehicles || [];
    dispatch(setWishListVehicles(vehicles));
  });

  const vehicles = topRatedVehicles?.vehicles || [];

  const handleViewAllClick = () => {
    router.push({
      pathname: "/rental/vehicle-search",
      query: { top_rated: 1 },
    });
  };

  // ✅ Skeleton + real slides dono ke liye ek common slides array
  const skeletonCount = isMobile ? 5 : 6;
  const slidesToRender = isLoading
    ? Array.from({ length: skeletonCount }).map((_, i) => ({
      id: `skeleton-${i}`,
      isSkeleton: true,
    }))
    : vehicles.map((v) => ({ id: v.id, isSkeleton: false, vehicle: v }));

  return (

    <>

      <Toaster position="top-center" toastOptions={{
        style: {
          boxShadow: "none",
          WebkitBoxShadow: "none",
          MozBoxShadow: "none",
        },
      }} />
      <Box sx={{ width: "100%", py: 1, px: { xs: 2, sm: "55px", md: "64px", lg: "63px" }, }}>
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,


          }}
        >
          <Typography sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: isMobile ? "18px" : "24px",
            color: (theme) => theme.palette.text.primary,
            whiteSpace: "nowrap",
          }}>
            Car Rentals & Vehicles
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
            <ArrowForwardIcon sx={{ fontSize: { xs: "1.1rem", sm: "1rem" } }} />
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
          <Alert severity="info">No top rated vehicles found.</Alert>
        )}

        {/* ✅ UNIFIED SWIPER - Mobile: 1 card | Desktop: 3 cards */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 0 }, py: 1 }}>
          <Swiper
            modules={[Autoplay]}
            spaceBetween={16}
            slidesPerView={isMobile ? 1 : 3}
            grabCursor={true}        // ✅ Drag cursor (hand icon)
            loop={slidesToRender.length > (isMobile ? 1 : 3)} // loop tabhi jab enough slides hon
            autoplay={{
              delay: 2800,
              disableOnInteraction: false,
              pauseOnMouseEnter: true, // ✅ Hover pe pause — better UX
            }}
          >
            {slidesToRender.map((item) => (
              <SwiperSlide key={item.id}>
                {item.isSkeleton ? (
                  <VehicleCard loading />
                ) : (
                  <VehicleCard data={item.vehicle} vehicle={item.vehicle} />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Box>

    </>
  );
};

export default CarRental;