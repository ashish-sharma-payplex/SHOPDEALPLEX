import { RentalModuleWrap } from "components/home/module-wise-components/rental/components/Rental.style";
import DownloadSection from "components/home/module-wise-components/rental/components/home/DownloadSection";
import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import CustomContainer from "components/container";
import RentalBanner from "components/home/module-wise-components/rental/components/global/RentalBanner";
import TopRatedVehicles from "components/home/module-wise-components/rental/components/home/TopRatedVehicles";
import VehicleCategories from "components/home/module-wise-components/rental/components/home/VehicleCategories";
import CouponsCarousel from "components/home/module-wise-components/rental/components/home/CouponsCarousel";
import { getToken } from "helper-functions/getToken";
import { useRouter } from "next/router";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import RentalVehiclesCategories from "./New-Rental-pages/Rental-Vehicles-Categories/RentalVehiclesCategories";
import RentARideSteps from "./New-Rental-pages/rent-ride-steps/RentARideSteps";
import TopRatingVehicles from "./New-Rental-pages/Top-rating-Vehicles/TopRatingVehicles";
import ComingSoonPage from "../commingSoon";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import styles from "styles/rental.module.css";

const Rental = ({ configData, landingPageData }) => {
  const router = useRouter();
  const page = router.query.page;

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalImages, setTotalImages] = useState(0);

  /* ================= IMAGE LOADING ================= */
  useEffect(() => {
    const images = document.querySelectorAll("img");
    const total = images.length;

    if (total === 0) {
      setImagesLoaded(true);
      return;
    }

    setTotalImages(total);
    let loaded = 0;

    const onLoad = () => {
      loaded++;
      setLoadedCount(loaded);
      if (loaded === total) setImagesLoaded(true);
    };

    images.forEach((img) => {
      if (img.complete) onLoad();
      else {
        img.addEventListener("load", onLoad);
        img.addEventListener("error", onLoad);
      }
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", onLoad);
        img.removeEventListener("error", onLoad);
      });
    };
  }, []);

  /* ================= SCROLL RESET ================= */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page]);

  /* ================= LOADER ================= */
  if (!imagesLoaded) {
    return (
      <Box
        className={styles.rentalPage}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "350px",
          width: "100%",
          borderRadius: "8px",
          my: 3,
        }}
      >
        <CircularProgress size={56} sx={{ mb: 2 }} />
        <Typography variant="h6" color="primary">
          Loading Rental Items...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalImages
            ? `${Math.round((loadedCount / totalImages) * 100)}% Complete`
            : "Preparing your rental experience..."}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <CustomStackFullWidth
        className={styles.rentalPage}
        sx={{
          width: "100%",
          padding: "24px 0",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          <RentalModuleWrap sx={{ width: "100%", overflowX: "hidden" }}>
            <CustomContainer>
              <RentalVehiclesCategories />
              <RentARideSteps />
              <TopRatingVehicles />
              {getToken() && <CouponsCarousel />}
            </CustomContainer>
          </RentalModuleWrap>
        </Box>
        {/* <ComingSoonPage/> */}
      </CustomStackFullWidth>
    </>
  );
};

export default Rental;
