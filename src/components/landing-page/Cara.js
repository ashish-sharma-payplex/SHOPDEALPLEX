import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useRef, useReducer } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CustomContainer from "../container";
// Local images
import Banner from "./imgs/bn1.jpg";
import Banner2 from "./imgs/bn2.jpg";
import Banner3 from "./imgs/bn3.jpg";  

const Cara = () => {
  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // Image array
  const carouselImages = [Banner.src, Banner2.src, Banner3.src];

  // useRef to store the current slide index
  const currentSlideRef = useRef(0);

  // useReducer to force re-render when changing slides
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const goToNextSlide = () => {
    currentSlideRef.current = (currentSlideRef.current + 1) % carouselImages.length;
    forceUpdate();
  };

  const goToPreviousSlide = () => {
    currentSlideRef.current = currentSlideRef.current === 0 ? carouselImages.length - 1 : currentSlideRef.current - 1;
    forceUpdate();
  };

  // Auto-slide effect using setInterval
  useEffect(() => {
    const autoplayInterval = setInterval(goToNextSlide, 5000); // Change slide every 5 seconds
    return () => clearInterval(autoplayInterval);
  }, []);

  return (
    <CustomContainer>
      <Box
        sx={{
          width: "100%",
          height: "20vh",  // Ensuring 30% viewport height
          position: "relative",
          overflow: "hidden",
          borderRadius: "10px",
          marginTop:"10px",
          marginBottom:"10px",
        }}
      >
        {/* Carousel Slider */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${carouselImages[currentSlideRef.current]})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            transition: "opacity 1s ease-in-out",
          }}
        />

        {/* Navigation buttons */}
        <IconButton
          sx={{
            position: "absolute",
            top: "50%",
            left: "10px",
            transform: "translateY(-50%)",
            zIndex: 10,
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            "&:hover": { background: "rgba(0,0,0,0.7)" }
          }}
          onClick={goToPreviousSlide}
        >
          <ArrowBackIosIcon />
        </IconButton>

        <IconButton
          sx={{
            position: "absolute",
            top: "50%",
            right: "10px",
            transform: "translateY(-50%)",
            zIndex: 10,
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            "&:hover": { background: "rgba(0,0,0,0.7)" }
          }}
          onClick={goToNextSlide}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    </CustomContainer>
  );
};

export default Cara;
