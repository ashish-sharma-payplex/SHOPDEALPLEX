import React from "react";
import { Box, Typography, Card, useMediaQuery } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay } from "swiper";
import "swiper/css";

SwiperCore.use([Autoplay]);

const items = [
  { label: "Documents", img: "/documents.png" },
  { label: "Gifts", img: "/gifts.png" },
  { label: "Medicines", img: "/medicines.png" },
  { label: "Households", img: "/households.png" },
  { label: "Clothes", img: "/clothes.png" },
  { label: "Electronics", img: "/electronics.png" },
  { label: "Food/Tiffin", img: "/food.png" },
  { label: "Custom Parcel", img: "/custom.png" },
];

const SendAnywhere = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 4, mb: 8, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" align="center" fontFamily={"Inter"}
        fontWeight={500}
        color="#000000" gutterBottom>
        Send Anything, Anywhere in the City
      </Typography>

      <Typography align="center" fontFamily={"Inter"}
        fontWeight={500}
        color="#767676" sx={{ mb: 3, fontSize: 20 }}>
        From small essentials to big packages, we pick up and deliver everything right to your doorstep.
      </Typography>

      {/* Desktop / Laptop */}
      <Box sx={{ display: { xs: "none", md: "flex" } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {items.map((item, index) => (
            <Box key={index} textAlign="center" px={1}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  backgroundColor: "#f8fafc",
                  width: 140,
                  height: 140,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={item.img}
                  alt={item.label}
                  title={item.label}
                  sx={{ maxHeight: "80%", maxWidth: "80%", objectFit: "contain" }}
                />
              </Card>
              <Typography sx={{
                mt: 1,
                fontSize: isMobile ? "14px" : "16px",
                fontFamily: "Inter",
                fontWeight: 500,
                color: "#191919"
              }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Tablet Slider */}
      <Box sx={{ display: { xs: "none", sm: "block", md: "none" } }}>
        <Swiper
          spaceBetween={15}
          loop={true}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          slidesPerView={3}
        >
          {items.map((item, index) => (
            <SwiperSlide key={index}>
              <Box textAlign="center">
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: "#f8fafc",
                    width: "100%",
                    height: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                  }}
                >
                  <Box
                    component="img"
                    src={item.img}
                    alt={item.label}
                    sx={{ maxHeight: "80%", maxWidth: "80%", objectFit: "contain" }}
                  />
                </Card>
                <Typography fontSize={13} fontWeight={500} align="center" sx={{ mt: 1 }}>
                  {item.label}
                </Typography>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Mobile Slider - Images Only */}
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        <Swiper
          spaceBetween={15}
          loop={true}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          slidesPerView={2}
        >
          {items.map((item, index) => (
            <SwiperSlide key={index}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  backgroundColor: "#f8fafc",
                  width: "100%",
                  height: 140,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                }}
              >
                <Box
                  component="img"
                  src={item.img}
                  alt={item.label}
                  sx={{ maxHeight: "80%", maxWidth: "80%", objectFit: "contain" }}
                />
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
};

export default SendAnywhere;
