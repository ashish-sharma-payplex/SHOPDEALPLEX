import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Paper, Stack, Skeleton, useMediaQuery } from "@mui/material";
import { useDispatch } from "react-redux";
import { useTheme } from "@emotion/react";
import { useRouter } from "next/router";
import { setParcelCategories } from "redux/slices/parcelCategoryData";
import { textWithEllipsis } from "styled-components/TextWithEllipsis";
import { PrimaryToolTip } from "components/cards/QuickView";
import useGetParcelCategory from "api-manage/hooks/react-query/percel/usePercelCategory";
import { Swiper, SwiperSlide } from "swiper/react";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";
import "swiper/css";
import MainForm from "./MainForm";

const MAX_WIDTH = {
  xs: "30%",
  sm: 720,
  md: 960,
  lg: 1200,
};

const HeroSection = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const classes = textWithEllipsis();

  const { data = [], refetch, isLoading } = useGetParcelCategory();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    refetch();
  }, []);

  const handleCardClick = (item) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const profileInfo = JSON.parse(
      localStorage.getItem("profileInfo") || "null",
    );

    const userId = profileInfo?.id || profileInfo?.user_id;

    // console.log("👤 User ID:", userId);

    // ❌ Not logged in
    if (!token) {
      // console.warn("⛔ User not logged in");

      import("react-hot-toast").then(({ default: toast }) => {
        toast.error("Please login to continue");
      });

      setTimeout(() => {
        dispatch(setModalFor("sign-in"));
        dispatch(setSignInModalOpen(true));
      }, 800);

      return;
    }

    // ✅ Final payload (same pattern as slice)
    const finalPayload = {
      ...item,
      user_id: userId, // 👈 same naming rakho jo backend expect karta hai
    };

    // console.log("🚀 Final Payload:", finalPayload);

    dispatch(setParcelCategories(finalPayload));

    router.push("/parcel-delivery");
  };
  return (
    <Box position="relative">
      {/* ===== HERO BANNER (UNCHANGED FOR LAPTOP & TABLET) ===== */}
      <Box
        sx={{
          background: "linear-gradient(to bottom, #FFF4C2, #FFFFFF)",
          pt: { xs: 3, md: 2 },
          pb: { xs: 0, md: 15 },
        }}
      >
        <Box sx={{ maxWidth: MAX_WIDTH, mx: "auto", px: 3 }}>
          <Grid
            container
            alignItems="center"
            spacing={6}
            textAlign={{ xs: "center", md: "left" }}
          >
            <Grid item xs={12} md={7}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: { xs: "1.5rem", md: "2.5rem" },
                  color: "#0B3D20",
                  mb: 2.5,
                  lineHeight: 1.2, 
                }}
              >
                Deliver Parcels Instantly
                <br />
                Book Now.
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  maxWidth: { xs: "100%", md: 600 },
                  mx: { xs: "auto", md: 0 },
                  fontSize: { xs: "0.95rem", md: "1.3rem" },
                  lineHeight: 1.5,
                  color: "#191919"
                }}
              >
                India's most reliable on-demand parcel service. Book in seconds,
                track live, and deliver within minutes.
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              md={5}
              textAlign="center"
              sx={{ transform: { md: "translateX(40px)" } }}
            >
              <Box
                component="img"
                src="/delivery man 1.png"
                alt="Delivery"
                sx={{
                  maxWidth: { xs: 220, sm: 260, md: 340 },
                  width: "100%",
                  mx: "auto",
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* ===== CATEGORIES CARD ===== */}
      <Box sx={{ position: "relative", top: { xs: 0, md: -140 }, px: 2 }}>
        <Paper
          elevation={4}
          sx={{
            maxWidth: MAX_WIDTH,
            mx: "auto",
            borderRadius: "30px !important",
            p: { xs: 2, md: 3 },
            border
          }}
        >
          <Stack
            direction="column"
            alignItems={{ xs: "center", md: "flex-start" }}
            mb={3}
            spacing={1}
            textAlign={{ xs: "center", md: "left" }}
          >
            <Typography
              fontFamily="Inter"
              fontWeight={600}
              color="#191919"
              sx={{ fontSize: { xs: "0.9rem", md: "1.2rem" } }}
            >
              Send a Package
            </Typography>
            <Typography
              fontFamily={"Inter"}
              fontWeight={500}
              color="#191919"
              sx={{ fontSize: { xs: "0.8rem", md: "1rem" } }}
            >
              Select a category to get instant pricing
            </Typography>
          </Stack>

          {/* ===== CATEGORY SLIDER ===== */}
          {!isLoading ? (
            <Swiper
              slidesPerView={3} // ✅ mobile: 3 visible
              slidesPerGroup={1} // ✅ one-by-one slide
              spaceBetween={16}
              breakpoints={{
                600: { slidesPerView: 4 },
                900: { slidesPerView: 6 },
                1200: { slidesPerView: 8 },
              }}
            >
              {data.map((item, index) => (
                <SwiperSlide
                  key={index}
                  style={{ display: "flex", justifyContent: "center" }} // ✅ IMPORTANT
                >
                  <Stack
                    alignItems="center"
                    spacing={1}
                    sx={{
                      width: "auto", // ✅ THIS FIXES THE ISSUE
                      color: "#2E7D32",
                      cursor: "pointer",
                      "&:hover img": { transform: "scale(1.1)" },
                      "&:hover .nameText": {
                        color: "#FF6600",
                        letterSpacing: "0.02em",
                      },
                    }}
                    onClick={() => handleCardClick(item)}
                  >
                    <Box
                      component="img"
                      src={item.image_full_url}
                      alt={item.name}
                      sx={{
                        width: { xs: 42, sm: 50, md: 60 },
                        height: { xs: 42, sm: 50, md: 60 },
                        objectFit: "cover",
                      }}
                    />
                    <PrimaryToolTip text={item.name} placement="bottom">
                      <Typography
                        variant="caption"
                        textAlign="center"
                        className={`nameText ${classes.multiLineEllipsis}`}
                        sx={{
                          fontSize: isMobile ? "14px" : "16px",
                          fontFamily: "Inter",
                          color: "#191919"
                        }}
                      >
                        {item.name}
                      </Typography>
                    </PrimaryToolTip>
                  </Stack>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Grid container spacing={3} justifyContent="center">
              {Array.from(new Array(6)).map((_, idx) => (
                <Grid item xs={4} sm={3} md={1.5} key={idx}>
                  <Stack alignItems="center" spacing={1}>
                    <Skeleton variant="circular" width={50} height={50} />
                    <Skeleton variant="rectangular" width={50} height={16} />
                  </Stack>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default HeroSection;
