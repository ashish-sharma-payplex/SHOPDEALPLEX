"use client";
import { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Grid,
  Paper,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlightIcon from "@mui/icons-material/Flight";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import HotelIcon from "@mui/icons-material/Hotel";

import styles from "../../../src/styles/Grocery.module.css"; 

import flight from "../../../public/deal images/flightNew.png";
import bus from "../../../public/deal images/bus.png";
import hotel from "../../../public/deal images/hotel.png";

export default function TravelsWithUs() {
  const [tab, setTab] = useState("flights");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const handleChange = (_, newValue) => setTab(newValue);

  const data = {
    flights: {
      title: "Book Flights",
      subtitle:
        "Compare 500+ airlines and get the best deals with instant confirmation.",
      features: [
        "Flexible booking & cancellation",
        "Best price guarantee",
        "24/7 customer support",
      ],
      button: "Book Flights Now",
      img: flight.src,
      link: "#",
    },
    buses: {
      title: "Book Comfortable Bus Tickets",
      subtitle:
        "Travel safely with verified operators across thousands of routes.",
      features: [
        "AC & Non-AC bus options available",
        "Live GPS tracking for all buses",
        "Hassle-free cancellation policy",
      ],
      button: "Book Bus Now",
      img: bus.src,
      link: "#",
    },
    hotels: {
      title: "Book Premium Hotels & Stays",
      subtitle:
        "Explore 50,000+ properties worldwide from luxury to budget-friendly.",
      features: [
        "Pay at hotel option for flexibility",
        "Real verified reviews from guests",
        "Instant confirmation on all bookings",
      ],
      button: "Book Hotel Now",
      img: hotel.src,
      link: "#",
    },
  };

  const { title, subtitle, features, button, img, bgGradient, link } = data[tab];

  return (
    // ✅ groceryThemeVars class add ki — sirf variables provide karti hai, koi visual change nahi
    <Box className={styles.groceryThemeVars} sx={{ bgcolor: "var(--bg-page)", py: { md: 1 } }}>

      <Container maxWidth="lg" sx={{ py: { md: 3 }, px: { xs: 2, sm: 3, md: 6 } }}>

        {/* Header */}
        <Typography sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: isMobile ? "18px" : "24px",
          paddingBottom: isMobile ? "14px" : "0px",
          paddingTop: isMobile ? "20px" : "0px",
          color: "var(--text-strong)", // ✅ #000000 -> theme var
          whiteSpace: "nowrap",
        }}>
          Travels With Us
        </Typography>

        <Typography sx={{ display: "none" }}></Typography>

        {/* ================= TABS — UNCHANGED, as requested ================= */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 4, sm: 5, md: 6 } }}>
          <Box
            sx={{
              backgroundColor: "#FFF9E6",
              padding: { xs: "6px 10px", sm: "7px 12px", md: "8px 14px" },
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Tabs
              value={tab}
              onChange={handleChange}
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{
                minHeight: "38px !important",
                height: "38px",
                "& .MuiTabs-flexContainer": {
                  height: "100%",
                  alignItems: "center",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                  minWidth: { xs: 70, sm: 85, md: 100 },
                  minHeight: "34px !important",
                  height: "34px",
                  padding: { xs: "4px 10px", sm: "4px 11px", md: "5px 14px" },
                  fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                  color: "#2F3A3A",
                  lineHeight: 1.2,
                  display: "flex",
                  alignItems: "center",
                  "& svg": {
                    fontSize: { xs: "14px", sm: "16px", md: "17px" },
                    marginRight: "6px",
                  },
                },
                "& .Mui-selected": {
                  backgroundColor: "#ffffff",
                  color: "#2F3A3A !important",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  minHeight: "34px !important",
                  height: "34px",
                  padding: { xs: "4px 10px", sm: "4px 11px", md: "5px 14px" },
                },
              }}
            >
              <Tab icon={<FlightIcon />} iconPosition="start" label="Flights" value="flights" />
              <Tab icon={<DirectionsBusIcon />} iconPosition="start" label="Buses" value="buses" />
              <Tab icon={<HotelIcon />} iconPosition="start" label="Hotels" value="hotels" />
            </Tabs>
          </Box>
        </Box>
        {/* ================= /TABS ================= */}

        {/* Main Content */}
        <Grid
          container
          spacing={isMobile ? 4 : 6}
          alignItems="center"
          justifyContent="center"
        >
          {/* Left Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                borderRadius: "36px",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: bgGradient || "var(--bg-card)", // ✅ dark mode me card bg
                p: { xs: 2, sm: 3, md: 0 },
              }}
            >
              <Box
                component="img"
                src={img}
                alt={title}
                title={title}
                sx={{
                  width: "100%",
                  height: "auto",
                  maxHeight: { xs: 200, md: 350 },
                  objectFit: "contain",
                  borderRadius: "28px",
                }}
              />
            </Box>
          </Grid>

          {/* Right Text */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h5"
              fontWeight={700}
              fontFamily="Inter, sans-serif"
              sx={{
                mb: 1.5,
                fontSize: { xs: "1.3rem", md: "1.4rem" },
                color: "var(--text-primary)", // ✅ #1A1A1A -> theme var
              }}
            >
              {title}
            </Typography>

            <Typography
              fontFamily="Inter, sans-serif"
              fontWeight={400}
              sx={{
                mb: 2,
                maxWidth: "90%",
                fontSize: { xs: "0.9rem", md: "1rem" },
                color: "var(--text-secondary)", // ✅ #808080 -> theme var
              }}
            >
              {subtitle}
            </Typography>

            <List sx={{ mb: 2 }}>
              {features.map((item, i) => (
                <ListItem key={i} disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: "var(--brand-green)" }} />
                  </ListItemIcon>

                  <ListItemText
                    primary={item}
                    fontFamily="Inter, sans-serif"
                    fontWeight={400}
                    primaryTypographyProps={{
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      color: "var(--text-primary)", // ✅ #1a1a1a -> theme var
                    }}
                  />
                </ListItem>
              ))}
            </List>

            <Button
              variant="contained"
              color="success"
              size="large"
              fontFamily="Inter, sans-serif"
              fontWeight={400}
              onClick={() => (window.location.href = link)}
              sx={{
                borderRadius: "8px",
                px: { xs: 3, md: 5 },
                py: 1.2,
                fontWeight: 600,
                fontSize: { xs: "0.9rem", md: "1rem" },
                textTransform: "none",
                backgroundColor: "var(--brand-green)", // fixed color, theme se match
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "var(--brand-green-hover)",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                },
              }}
            >
              {button}
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}