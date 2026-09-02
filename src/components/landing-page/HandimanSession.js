import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Grid,
  Card, CardContent, CardMedia, Rating,
  useTheme, useMediaQuery, createTheme, ThemeProvider, CssBaseline
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const customTheme = createTheme({
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
  palette: {
    success: { main: '#4CAF50' },
  },
});

const HomeServiceContent = () => {

  const [serviceData, setServiceData] = useState([]);

  // --------------------------
  // 📌 FETCH API DATA
  // --------------------------
  useEffect(() => {
    fetch("https://agent.dealplex.in/api/user-list?user_type=handyman&per_page=10&page=2")
      .then(res => res.json())
      .then(json => {

        const transformed = json.data?.map(item => ({
          id: item.id,
          title: item.designation ?? item.display_name ?? "Unknown",
          description: item.description ?? "No description available",
          image: item.profile_image || "/default.webp",
          rating: item.handyman_rating || 4.5,
          price: item.total_services_booked > 0 ? 450 : 400,
        })) || [];

        setServiceData(transformed);
      })
      .catch(err => console.log("API Error:", err));
  }, []);

  // --------------------------

  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isTabletOnly = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const redirect = () => {
    window.location.href = "https://agent.dealplex.in/";
  };

  const truncateWords = (text, count) => {
    const words = text.trim().split(" ");
    return words.length <= count ? text : words.slice(0, count).join(" ");
  };

  const renderServiceCard = (service) => {

    // 👉 Mobile should show only 4 words + "..."
    const description =
      isMobile
        ? truncateWords(service.description, 4) + "..."
        : isTabletOnly
        ? truncateWords(service.description, 5)
        : truncateWords(service.description, 4);

    return (
      <Card
        onClick={redirect}
        sx={{
          width: { xs: "95%", sm: "92%", md: 240, lg: 230, xl: 230 },
          maxWidth: 260,
          borderRadius: 3,
          cursor: "pointer",
          boxShadow: "none !important",      // ⭐ No shadows
          border: "1px solid #8E98A826",     // ⭐ soft visible border
          overflow: "hidden",
          pb: 0
        }}
      >

        {/* IMAGE */}
        <Box sx={{ p: 1.5, pb: 0, lineHeight: 0 }}>
          <CardMedia
            component="img"
            image={service.image}
            alt={service.title}
            sx={{
              width: "100%",
              height: 160,
              objectFit: "cover",

              // ⭐ Only top rounded
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          />
        </Box>

        {/* CONTENT */}
        <CardContent
          sx={{
            px: 1.3,
            pt: 1,
            pb: 0,
            "&:last-child": { pb: 0 },
          }}
        >
          {/* TITLE */}
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.95rem",
              mb: 0.4,
              color: "#1A1A1A",
            }}
          >
            {service.title}
          </Typography>

          {/* DESCRIPTION */}
          <Typography
            sx={{
              fontSize: "0.78rem",
              lineHeight: 1.25,
              color: "#6f6f6f",
              mb: 0.6,
            }}
          >
            {description}
          </Typography>

          {/* RATING */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Rating value={service.rating} readOnly precision={0.5} size="small" />
            <Typography sx={{ ml: 0.5, fontSize: "0.75rem", color: "#6f6f6f" }}>
              ({service.rating})
            </Typography>
          </Box>

          {/* PRICE */}
          {/* <Typography
            sx={{
              color: "#1A914B",
              fontWeight: 600,
              fontSize: "0.9rem",
              mt: 0.2,
              mb: 1,            
              lineHeight: 1,
            }}
          >
            Starts at ₹{service.price}
          </Typography> */}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: {sm:2,md:4} }}>

      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "nowrap"
        }}
      >
        <Typography
          sx={{
            
            whiteSpace: "nowrap",
              fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1rem", md: "1.6rem" },
          }}
        >
          Handyman Home Service
        </Typography>

        <Typography
          sx={{
            color: "#1A914b",
            fontWeight: 500,
          fontSize: { xs: "0.9rem", sm: "0.9rem", md: "1.1rem" },
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          onClick={() => window.location.href = "https://agent.dealplex.in/"}
        >
          View All
          <ArrowForwardIcon sx={{fontSize: { xs: "0.8rem", sm: "0.8rem", md: "0.95rem" }, }} />
        </Typography>
      </Box>

      {/* MOBILE SLIDER */}
      {isMobileOrTablet ? (
        <Box sx={{ width: "100%", mt: 2 }}>
          <Swiper
            grabCursor={true}
            spaceBetween={14}
            loop={true}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            modules={[Navigation, Autoplay]}
            breakpoints={{
              0: { slidesPerView: 1 },
              600: { slidesPerView: 2 },
            }}
          >
            {serviceData.map((service) => (
              <SwiperSlide key={service.id}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  {renderServiceCard(service)}
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      ) : (

        /* DESKTOP GRID */
        <Grid container spacing={3} justifyContent="center">
          {serviceData.map((service) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={2.4}
              key={service.id}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              {renderServiceCard(service)}
            </Grid>
          ))}
        </Grid>
      )}

    </Container>
  );
};

const HomeServiceSection = () => (
  <ThemeProvider theme={customTheme}>
    <CssBaseline />
    <HomeServiceContent />
  </ThemeProvider>
);

export default HomeServiceSection;
