import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// SAMPLE DATA
const carData = [
  {
    id: 1,
    name: "Honda City",
    type: "Sedan",
    image: "/bmw1.png",
    price: 1400,
    period: "per day",
    features: [
      { icon: "/automatic.png", label: "Automatic" },
      { icon: "/fuel.png", label: "PB 95" },
      { icon: "/ac.png", label: "Air Conditioner" },
    ],
  },
  {
    id: 2,
    name: "Innova Crysta",
    type: "SUV",
    image: "/bmw2.png",
    price: 2000,
    period: "per day",
    features: [
      { icon: "/automatic.png", label: "Manual" },
      { icon: "/fuel.png", label: "PB 95" },
      { icon: "/ac.png", label: "Air Conditioner" },
    ],
  },
  {
    id: 3,
    name: "Tata Altroz",
    type: "Hatchback",
    image: "/bmw3.png",
    price: 900,
    period: "per day",
    features: [
      { icon: "/automatic.png", label: "Automatic" },
      { icon: "/fuel.png", label: "PB 95" },
      { icon: "/ac.png", label: "Air Conditioner" },
    ],
  },
];

// CARD COMPONENT
const CarCard = ({ car }) => {
  return (
    <Card
      onClick={() => (window.location.href = "https://shopdealplex.in/home?module=rental")}
      sx={{
        width: "100%",
        borderRadius: "8px !important",
        paddingBottom: 2,
        backgroundColor: "#F8FBF8",
        cursor: "pointer",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
        transition: "0.2s ease",
        "&:hover": { transform: "translateY(-3px)" },
      }}
    >
      <CardMedia
        component="img"
        image={car.image}
        alt={car.name}
        sx={{
          height: 170,
          objectFit: "contain",
          mt: 1,
          width: { xs: "88%", sm: "100%", md: "92%", lg: "94%" }, // 📌 wider on mobile + desktop
          margin: "0 auto",
        }}
      />


      <CardContent sx={{ textAlign: "left" }}>
        {/* NAME + PRICE */}
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography fontWeight="bold">{car.name}</Typography>

            {/* TYPE directly under name */}
            <Typography
              fontSize="0.85rem"
              color="text.secondary"
              sx={{ mt: 0.3 }}
            >
              {car.type}
            </Typography>
          </Box>

          <Box textAlign="right">
            <Typography
              fontWeight="bold"
              sx={{ color: "#14A44D", fontSize: "1.1rem" }}
            >
              ₹{car.price}
            </Typography>
            <Typography fontSize="0.75rem" color="text.secondary">
              {car.period}
            </Typography>
          </Box>
        </Box>

        {/* FEATURES — equal 3-column grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            mt: 2,
          }}
        >
          {car.features.map((f, index) => (
            <Box
              key={index}
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={f.icon}
                alt={f.label}
                style={{
                  width: "22px",
                  height: "22px",
                  objectFit: "contain",
                }}
              />
              <Typography
                sx={{ fontSize: "0.70rem", mt: 0.5, color: "#555" }}
              >
                {f.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* BUTTON */}
        <Button
          onClick={() => (window.location.href = "https://agent.dealplex.in/")}
          variant="outlined"
          fullWidth
          sx={{
            mt: 2,
            textTransform: "none",
            borderColor: "#14A44D",
            color: "#14A44D",
            fontWeight: 600,
            borderRadius: "8px !important",
            "&:hover": {
              borderColor: "#14A44D",
              backgroundColor: "rgba(20,164,77,0.06)",
            },
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default function CarRentalSection() {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          gap: { xs: 1.5, sm: 0, md: 0 }, // 📌 added spacing ONLY for mobile
        }}
      >

        <Typography
          sx={{
            fontWeight: "bold",
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
            whiteSpace: "nowrap",
          }}
        >
          Easy Car Rentals & Vehicle Hire
        </Typography>

        <Typography
          sx={{
            color: "#1A914b",
            fontWeight: 500,
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => router.push("/home?module=rental")}
        >
          View All →
        </Typography>
      </Box>

      {/* MOBILE + TABLET SLIDER */}
      {isMobileOrTablet ? (
        <Swiper
          spaceBetween={20}
          grabCursor={true}
          loop={true}
          autoplay={{ delay: 2200 }}
          modules={[Autoplay, Navigation]}
          breakpoints={{
            0: { slidesPerView: 1 }, // MOBILE
            600: { slidesPerView: 2 }, // TABLET
          }}
        >
          {carData.map((car) => (
            <SwiperSlide key={car.id}>
              <Box display="flex" justifyContent="center">
                <CarCard car={car} />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        /* DESKTOP — 3 CARDS PER ROW */
        <Grid container spacing={3}>
          {carData.map((car) => (
            <Grid key={car.id} item xs={12} sm={6} md={4}>
              <CarCard car={car} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
