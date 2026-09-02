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
  sm: 760,
  md: 1000,
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
      {/* ===== HERO BANNER (full-bleed bg, breaks out of parent's 1280px container) ===== */}

      <Box
        sx={{
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          width: "100vw",
          backgroundImage: 'url("/parcelbannerbg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          pt: { xs: 3, md: 6 },
          pb: { xs: 0, md: 9 },
        }}
      >
        <Box sx={{ maxWidth: MAX_WIDTH, mx: "auto", px: 2 }}>
          <Grid
            container
            alignItems="center"
            spacing={6}
            textAlign={{ xs: "center", md: "left" }}
          >
            <Grid item xs={12} md={6}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: { xs: "1.3rem", sm: "1.8rem", md: "2.6rem" },
                  color: "#0B3D20",
                  mb: 4,
                  lineHeight: 1.25,
                }}
              >
                Deliver Anything,
                <br />
                Anywhere in your city
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              textAlign="center"
              sx={{
                transform: { md: "translateX(20px)" },
                pb: { xs: 8, md: 0 },
              }}
            >
              <Box
                component="img"
                src="/parcelbannerimg.png"
                alt="Parcel Delivery"
                title="Parcel Delivery"
                sx={{
                  height: { xs: 220, sm: 280, md: 370 },
                  width: "auto",
                  maxWidth: "100%",
                  objectFit: "contain",
                  mx: "auto",
                  display: "block",
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* ===== CATEGORIES CARD ===== */}
      <Box sx={{ position: "relative", top: { xs: 0, md: -130 }, px: 2 }}>
        <Paper
          elevation={4}
          sx={{
            maxWidth: MAX_WIDTH,
            mx: "auto",
            borderRadius: "30px !important",
            p: { xs: 2, md: 3 },
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
                      title={item.name}
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