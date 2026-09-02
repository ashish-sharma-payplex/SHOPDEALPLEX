"use client";

import { Box, Grid, Typography, Card, useMediaQuery, useTheme } from "@mui/material";
import Image from "next/image";
import AppsIcon from "@mui/icons-material/Apps";
import ShieldIcon from "@mui/icons-material/Shield";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import demo1 from "../../../public/deal images/demo1.png";
import demo2 from "../../../public/deal images/demo2.png";
import demo3 from "../../../public/deal images/demo3.png";
import demo4 from "../../../public/deal images/demo4.png";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.css';

export default function WhyChooseUs() {

  
const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const sliderImages = [
    { src: demo1 },
    { src: demo2 },
    { src: demo3 },
    { src: demo4 },
  ];

  const features = [
    {
      icon: <AppsIcon sx={{ color: "#1A914b", fontSize: 32 }} />,
      title: "All Service, One App",
      desc: "Groceries, parcels, travel, food, and home services all unified in a single app. Stop juggling services.",
    },
    {
      icon: <ShieldIcon sx={{ color: "#1A914b", fontSize: 32 }} />,
      title: "Verified Professional",
      desc: "Every provider is thoroughly vetted and reviewed, ensuring high quality and reliable service every time.",
    },
    {
      icon: <CheckCircleIcon sx={{ color: "#1A914b", fontSize: 32 }} />,
      title: "Transparent Pricing",
      desc: "See clear, competitive prices before you book. No hidden fees, no surprises.",
    },
    {
      icon: <SupportAgentIcon sx={{ color: "#1A914b", fontSize: 32 }} />,
      title: "Dedicated Support",
      desc: "Enjoy an intuitive interface and dedicated 24/7 support across all service categories.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === sliderImages.length - 1 ? 0 : prev + 1
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        py: { xs: 3, md: 0 },
        pt: { xs: 3, md: 4 },
        px: { xs: 2, md: 8 },
        textAlign: "center",
        backgroundColor: "#fff",
        width: "100%",  // Set width to 100% to make it responsive
      }}
    >
      <Typography fontWeight={500} sx={{ fontSize: { xs: '18px', sm: '30px', md: '24px' }, color: "#000000", fontFamily: "Inter, sans-serif", }}>
        Why Choose Us
      </Typography>

      <Typography
        width={" sm: '100%', md: '80%'"}
        margin={"auto"}
        fontFamily="Inter, sans-serif"
        fontWeight={500}
        color="text.secondary"
        mb={{ xs: 3, md: 6 }}
        sx={{
          fontSize: isMobile ? "14px" : "16px",
          lineHeight: { xs: 2, sm: 1.5, md: 1.6 },
          pb: "10px"
        }}
      >
        Dealplex unites all your local needs in one app from repairs to food delivery.
        Trusted experts, fast service, and transparent pricing.
      </Typography>
      
      <Grid container spacing={4} alignItems="center">
        {/* LEFT IMAGE SECTION */}
        <Grid item xs={12} md={6}>
          {/* MOBILE SLIDER */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              overflow: "hidden",
              width: "100%",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Swiper
              spaceBetween={10} // Space between slides
              slidesPerView={1} // Ensure 1 image is shown at a time
              loop={true} // Loop slides
              autoplay={{ delay: 2500 }} // Automatic slide change
            >
              {sliderImages.map((img, index) => (
                <SwiperSlide key={index}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      width: "100%",
                      height: 180,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Image
                      src={img.src}
                      alt={`slide-${index}`}
                      width={600}
                      height={400}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>

          {/* DESKTOP GRID */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
              <Card sx={{ borderRadius: "12px", overflow: "hidden", height: 220 }}>
                <Image
                  src={demo1}
                  alt="big image 1"
                  width={500}
                  height={300}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Card>

              <Card sx={{ borderRadius: "12px", overflow: "hidden", height: 140 }}>
                <Image
                  src={demo2}
                  alt="small image 1"
                  width={500}
                  height={200}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Card>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
              <Card sx={{ borderRadius: "12px", overflow: "hidden", height: 140 }}>
                <Image
                  src={demo3}
                  alt="small image 2"
                  width={500}
                  height={200}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Card>

              <Card sx={{ borderRadius: "12px", overflow: "hidden", height: 220 }}>
                <Image
                  src={demo4}
                  alt="big image 2"
                  width={500}
                  height={300}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Card>
            </Box>
          </Box>
        </Grid>

        {/* RIGHT FEATURES */}
        <Grid item xs={12} md={6} textAlign="left">
          <Grid container spacing={4}>
            {features.map((item, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Box
                  display="flex"
                  flexDirection={{ xs: "row", md: "column" }}
                  gap={2}
                  alignItems={{ xs: "flex-start", md: "flex-start" }}
                >
                  <Box sx={{ mt: { xs: "3px", md: 0 } }}>{item.icon}</Box>

                  <Box>
                    <Typography
                      fontFamily="Inter, sans-serif"
                      fontWeight="600"
                      variant="h6"
                      sx={{ textAlign: "left", color: "#000000", fontSize: { xs: '18px', sm: '22px', md: '22px' } }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      fontFamily="Inter, sans-serif"
                      fontWeight="400"
                      color="#767676"
                      sx={{ lineHeight: 1.8, textAlign: "left", fontSize: { xs: '12px', sm: '12px', md: '14px' } }}
                    >
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}