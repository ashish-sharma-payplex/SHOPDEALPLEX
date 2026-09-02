import React from "react";
import { Box, Typography, Card } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

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

const loopedItems = [...items, ...items, ...items];

const SendAnywhere = () => {
  return (
    <Box
      sx={{
        maxWidth: "1280px",
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
        mb: { xs: 4, md: 8 },
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Title */}
      <Typography
        align="center"
        fontFamily="Inter"
        fontWeight={600}
        color="#000000"
        gutterBottom
        sx={{
          fontSize: { xs: "18px", sm: "24px", md: "32px" },
          lineHeight: { xs: 1.3, md: 1.4 },
        }}
      >
        Send Anything, Anywhere in the City
      </Typography>

      {/* Subtitle */}
      <Typography
        fontFamily="Inter"
        fontWeight={500}
        color="#767676"
        sx={{
          mb: 3,
          fontSize: { xs: "12px", sm: "16px", md: "20px" },
          lineHeight: 1.6,
          textAlign: "center",
          display: "block",
          width: "100%",
          px: { xs: 2, md: 6 },
          boxSizing: "border-box",
        }}
      >
        From small essentials to big packages, we pick up and deliver
        everything right to your doorstep.
      </Typography>

      {/* Swiper */}
      <Box sx={{ width: { xs: "25%", sm: "100%", md: "100%" }, boxSizing: "border-box" }}>
        <Swiper
          modules={[Autoplay]}
          loop={true}
          autoplay={{ delay: 1000, disableOnInteraction: false }}
          speed={800}
          grabCursor={true}
          breakpoints={{
            0: { slidesPerView: 3, spaceBetween: 8 },
            600: { slidesPerView: 4, spaceBetween: 12 },
            900: { slidesPerView: 8, spaceBetween: 16 },
          }}
          style={{ width: "100%" }}
        >
          {loopedItems.map((item, index) => (
            <SwiperSlide key={index}>
              <Box textAlign="center" sx={{ py: 1, width: "100%", boxSizing: "border-box" }}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: "#f8fafc",
                    width: { xs: 75, sm: 100, md: 110 },
                    height: { xs: 75, sm: 100, md: 110 },
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
                    sx={{ maxHeight: "75%", maxWidth: "75%", objectFit: "contain" }}
                  />
                </Card>
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: { xs: "10px", sm: "13px", md: "13px" },
                    fontFamily: "Inter",
                    fontWeight: 500,
                    color: "#191919",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
};

export default SendAnywhere;