import React from "react";
import Lottie from "lottie-react";
import { Box } from "@mui/material";
import loaderAnimation from "../../../public/Car_rental_animation.json"; // apna path check kar lena

const LottieLoader = ({ height = 300, fullScreen = false }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: fullScreen ? "100vh" : height,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: fullScreen ? "#fff" : "transparent",
      }}
    >
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        style={{ height: height }}
      />
    </Box>
  );
};

export default LottieLoader;
