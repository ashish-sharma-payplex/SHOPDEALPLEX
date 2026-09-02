import { Box, useMediaQuery, useTheme, Typography } from "@mui/material";
import { useEffect, useRef, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { CustomBoxFullWidth, CustomStackFullWidth } from "styled-components/CustomStyles.style";
import CustomContainer from "../../container";
import { CustomCarouselWrapper } from "styled-components/CustomStyles.style";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import CustomImageContainer from "../../CustomImageContainer";
import Ban from "../imgs/parcelban.png";
import Ban2 from "../imgs/medicine.jpg";
import Ban3 from "../imgs/foodban.jpg";
import Ban4 from "../imgs/Foodban.png";
import Ban5 from "../imgs/rentalban.png";
import Ban6 from "../imgs/travelbanner.jpg";
import Ban7 from "../imgs/handymanBanner.jpg";


const DynamicModuleSelection = dynamic(() => import("./module-selection/ModuleSelectionRaw"));

const staticBanners = [
  { id: 1, image_full_url: Ban4.src },
  { id: 2, image_full_url: Ban2.src },
  { id: 3, image_full_url: Ban3.src },
  { id: 4, image_full_url: Ban.src },
  { id: 5, image_full_url: Ban5.src },
  { id: 6, image_full_url: Ban6.src },
  { id: 7, image_full_url: Ban7.src },



  
];

const HeroSection = () => {
  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();

  const bannersData = staticBanners;
  const currentSlideRef = useRef(0);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const goToNextSlide = () => {
    currentSlideRef.current = (currentSlideRef.current + 1) % bannersData.length;
    forceUpdate();
  };

  useEffect(() => {
    const autoplayInterval = setInterval(goToNextSlide, 10000);
    return () => clearInterval(autoplayInterval);
  }, []);

  return (
    <CustomContainer>
      <CustomBoxFullWidth
        component={motion.div}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        sx={{
          marginTop: "70px",
          position: "relative",
          width: "100%",
          height:"100%",

        }}
      >
        {/* Title and Subtitle Section */}
        <Box
          sx={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            zIndex: 100, // Ensure the title is on top of the banner
            color: "black",
          }}
        >
          {/* <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
            {t("Everything You Need, Delivered")}
          </Typography>
          <Typography variant="h5" color="grey">
            {t("From groceries and food to rentals, pharmacy, and travel, we bring convenience to your doorstep.")}
          </Typography> */}
        </Box>

        <Box sx={{ width: "100%", position: "relative"}}>
          <CustomCarouselWrapper
            component={motion.div}
            key={bannersData[currentSlideRef.current]?.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 1 }}

          >
            <CustomImageContainer
              src={bannersData[currentSlideRef.current]?.image_full_url}
              alt={`Banner ${currentSlideRef.current}`}
              height="100%"
              width="100%"
              objectfit="cover"
            />
          </CustomCarouselWrapper>
        </Box>
      </CustomBoxFullWidth>

      {isXSmall && (
        <CustomStackFullWidth
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          mt="10px"
        >
          <DynamicModuleSelection isSmall />
        </CustomStackFullWidth>
      )}
    </CustomContainer>
  );
};

export default HeroSection;
