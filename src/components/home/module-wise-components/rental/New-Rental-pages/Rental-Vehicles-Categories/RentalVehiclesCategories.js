// src\components\home\module-wise-components\rental\New-Rental-pages\Rental-Vehicles-Categories\RentalVehiclesCategories.js
import React from "react";
import { Typography, Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Image from "next/image";
import Router, { useRouter } from "next/router";

// API Hook
import { useGetCategoryVehicleLists } from "../../rental-api-manage/hooks/react-query/category/useGetCategoryLists";

// --- SWIPER IMPORTS ---
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Mousewheel } from "swiper/modules";
import "swiper/css";
import styles from "styles/rental.module.css";
import "swiper/css/navigation";

const CARD_WIDTH = 160;
const IMAGE_BOX_HEIGHT = 160;
const CARD_MARGIN = 16;
const AUTOPLAY_INTERVAL = 4000;
const GREEN_COLOR = "#388e3c";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: theme.spacing(3, 0),
    margin: 0,
  },

  headerContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    justifyContent: "space-between", // ⭐ ALWAYS end-to-end (mobile + desktop)
  },

  headerTitle: {
    fontWeight: 500,
    color: "#333",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1rem",
    },
  },

  viewAll: {
    color: GREEN_COLOR,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    "&:hover": { textDecoration: "underline" },
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.8rem",
    },
  },

  swiperWrapper: {
    padding: theme.spacing(2, 0),
    borderRadius: 8,
  },

  slideContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  imageBox: {
    width: CARD_WIDTH,
    height: IMAGE_BOX_HEIGHT,

    [theme.breakpoints.down("sm")]: {
      width: 120,
      height: 120,
    },

    border: "1px solid #e0e0e0",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    margin: "0 auto",
    cursor: "pointer",
    transition: "0.3s",
    "&:hover": { boxShadow: "0px 4px 10px rgba(0,0,0,0.15)" },
  },

  categoryImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "8px",
  },

  categoryName: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#333",
    textAlign: "center",
    marginTop: 6,
    height: 40,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    cursor: "pointer",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.85rem",
    },
  },
}));

const RentalVehiclesCategories = () => {
  const classes = useStyles();
  const router = useRouter();

  const { data, isLoading } = useGetCategoryVehicleLists();
  const categories = data?.vehicles ?? [];

  const handleCategoryClick = (id) => {
    // console.log("Category ID:", id);
    router.push({
      pathname: "/rental/vehicle-search",
      query: { categoryId: id },
    });
  };
  return (
    <Box className={classes.root}>
      {/* Header */}
      {/* Header */}
      <Box
        className={classes.headerContainer}
        sx={{
          px: 2,
        }}
      >
        <Typography
          className={classes.headerTitle}
          variant="h5"
          sx={{
            ml: 1,
            fontSize: {
              xs: "2rem", // ⭐ Bigger on mobile
              sm: "1.8rem", // Tablet
              md: "1.5rem", // Default desktop
            },
            fontWeight: 700,
          }}
        >
          Vehicle Categories
        </Typography>

        <Box
          className={classes.viewAll}
          sx={{ mr: 1 }}
          onClick={() => {
            Router.push({
              pathname: "/rental/vehicle-search",
              query: { all_category: 1 },
            });
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: { xs: "0.9rem", md: "0.9rem" } }}
          >
            View All
          </Typography>

          <ArrowForwardIcon
            sx={{
              fontSize: {
                xs: "1rem", // ⭐ bigger arrow for mobile
                md: "1.2rem",
              },
              ml: 0.5,
              color: "#00C853",
            }}
          />
        </Box>
      </Box>

      {/* Swiper */}
      <Box className={`${classes.swiperWrapper} ${styles.rentalSection}`}>
        <Swiper
          modules={[Autoplay, Navigation, Mousewheel]}
          loop={true}
          autoplay={{ delay: AUTOPLAY_INTERVAL, disableOnInteraction: false }}
          // mousewheel={false}
          grabCursor={true}
          spaceBetween={CARD_MARGIN}
          navigation={false}
          slidesPerView={1}
          breakpoints={{
            0: { slidesPerView: 2, spaceBetween: 8 }, // mobile
            600: { slidesPerView: 4, spaceBetween: 12 }, // ⭐ tablet → 3 cards
            900: { slidesPerView: 4, spaceBetween: 16 }, // laptop
            1200: { slidesPerView: 6, spaceBetween: 24 }, // desktop
          }}
        >
          {/* Loading */}
          {isLoading &&
            [...Array(6)].map((_, index) => (
              <SwiperSlide key={index}>
                <Box className={classes.slideContent}>
                  <Box
                    className={`${classes.imageBox} ${styles.rentalImageWrap}`}
                  >
                    <Box
                      style={{
                        width: "80%",
                        height: "80%",
                        background: "#f0f0f0",
                        borderRadius: 10,
                      }}
                    />
                  </Box>

                  <Box
                    style={{
                      width: "60%",
                      height: 14,
                      background: "#e0e0e0",
                      margin: "10px auto 0",
                      borderRadius: 4,
                    }}
                  />
                </Box>
              </SwiperSlide>
            ))}

          {/* Real API Data */}
          {categories.map((category, index) => (
            <SwiperSlide key={index}>
              <Box
                className={classes.slideContent}
                onClick={() => handleCategoryClick(category.id)}
              >
                <Box
                  className={`${classes.imageBox} ${styles.rentalImageWrap}`}
                >
                  <Image
                    src={
                      typeof category?.image_full_url === "string"
                        ? category.image_full_url
                        : "/notfound.png"
                    }
                    alt={category?.name || "vehicle"}
                    title={category?.name || "vehicle"}
                    width={CARD_WIDTH}
                    height={IMAGE_BOX_HEIGHT}
                    className={classes.categoryImage}
                  />
                </Box>

                <Typography className={classes.categoryName}>
                  {category.name}
                </Typography>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
};

export default RentalVehiclesCategories;
