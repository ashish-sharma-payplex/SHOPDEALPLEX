import React, { useEffect, useRef, useState } from "react";
import RentalFilterLayout from "../global/RentalFilterLayout";
import TopBanner from "components/home/top-banner";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import TaxiSearchPanel from "../global/search/TaxiSearchPanel";
import { alpha, Box } from "@mui/system";
import { useTheme } from "@emotion/react";
import { search_api } from "components/home/module-wise-components/rental/rental-api-manage/ApiRoutes";
import { Typography, useMediaQuery, useScrollTrigger } from "@mui/material";
import useScrollToTop from "api-manage/hooks/custom-hooks/useScrollToTop";
import { t } from "i18next";
import { useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";

const VehicleSearchPage = () => {
  useScrollToTop();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const scrolling = useScrollTrigger();
  const searchPanelRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const { configData } = useSelector((state) => state.configData);

  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (searchPanelRef.current) {
        const topOffset = searchPanelRef.current.getBoundingClientRect().top;
        setIsSticky(window.scrollY > topOffset);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/rental-categories"); // Replace with actual API
        const data = await res.json();
        setCategories(data.vehicles || []);
      } catch (err) {
        // console.error(err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (id) => {
    router.push(`/rental/vehicle-search?categoryId=${id}`);
  };

  const getBannerTexts = t("");
  const getBannerSubTexts = t("");

  return (
    <Box>
        <Toaster position="top-center" />
      <RentalFilterLayout
        api_endpoint={search_api}
        isSticky={isSticky}
        topContent={
          <CustomStackFullWidth
            sx={{
              position: "relative",
              width: "100vw",                    // ⭐ force full screen width
              ml: "calc(-50vw + 50%)",           // ⭐ center the full-width block
              mr: "calc(-50vw + 50%)",
              backgroundColor: "#ffffff"
            }}
          >


            <TopBanner />
            <CustomStackFullWidth
              alignItems="center"
              justifyContent="center"
              sx={{
                position: "absolute",
                top: { xs: -4, sm: 50 },
                left: 0,
                right: 0,
              }}
            >
              <CustomStackFullWidth
                alignItems="center"
                justifyContent="center"
                spacing={isSmall ? 1 : 3}
                p={isSmall ? "25px" : "20px"}
                mt={{ xs: 0, sm: 2 }}
              />
            </CustomStackFullWidth>

            <Box
              ref={searchPanelRef}
              sx={{
                mt: isSticky ? { xs: "0", sm: "60px" } : "0px",
                position: isSticky ? { xs: "fixed" } : "relative",
                top: isSticky
                  ? {
                    xs: "70px",
                    sm: "20px",
                    md: scrolling ? "43px" : "74px",
                  }
                  : "auto",
                pt: isSticky && { xs: "25px", md: "0px" },
                zIndex: isSticky ? 1100 : "auto",
                width: "100%",
                transition: "all 0.4s ease",
                backgroundColor: isSticky
                  ? {
                    xs: theme.palette.background.paper,
                    sm: "transparent",
                  }
                  : "transparent",
                boxShadow: isSticky
                  ? {
                    xs: `0px 10px 20px 0px ${alpha(
                      theme.palette.neutral[1000],
                      0.2
                    )}`,
                    sm: `none`,
                  }
                  : "transparent",
              }}
            >
              <TaxiSearchPanel isSticky={isSticky} showSearch={false} />
            </Box>
          </CustomStackFullWidth>
        }
      />

      {/* --- Vehicle Categories Slider --- */}
      <Box sx={{ width: "100%", maxWidth: "100vw", mt: 4 }}> {/* ✅ Full width parent */}
        {/* <Typography
          variant={isSmall ? "h6" : "h5"}
          sx={{ fontWeight: "bold", mb: 2, px: 2 }}
        >
          Vehicle Categories
        </Typography> */}

        <Box sx={{ px: 2, overflow: "hidden" }}>
          <Swiper
            slidesPerView={isSmall ? 2 : 6}
            spaceBetween={10}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            modules={[Autoplay]}
          >
            {loadingCategories
              ? Array.from({ length: 6 }).map((_, i) => (
                <SwiperSlide key={i}>
                  <Box
                    sx={{
                      width: "100px",
                      height: "100px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "8px",
                      mx: "auto",
                    }}
                  />
                </SwiperSlide>
              ))
              : categories.map((cat) => (
                <SwiperSlide key={cat.id}>
                  <Box
                    onClick={() => handleCategoryClick(cat.id)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{
                        width: isSmall ? 80 : 100,
                        height: isSmall ? 80 : 100,
                        borderRadius: "50%",
                        overflow: "hidden",
                        mb: 1,
                      }}
                    >
                      <img
                        src={cat.image_full_url}
                        alt={cat.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                      }}
                    >
                      {cat.name}
                    </Typography>
                  </Box>
                </SwiperSlide>
              ))}
          </Swiper>
        </Box>
      </Box>
    </Box>
  );
};

export default VehicleSearchPage;
