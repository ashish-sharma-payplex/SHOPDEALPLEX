import React, { useEffect, useState } from "react";
import { Box, Grid, Button, Typography } from "@mui/material";
import Image from "next/image";

// Images
import Food from "../../../public/Homepage images/Food.png";
import Handyman from "../../../public/Homepage images/Handyman.png";
import Parcel from "../../../public/Homepage images/Parcel.png";
import Pharmacy from "../../../public/Homepage images/Pharmacy.png";
import Rental from "../../../public/Homepage images/Rental.png";
import Travel from "../../../public/Homepage images/Travels.png";
import Grocery from "../../../public/Homepage images/Grocery.png";

import { useDispatch, useSelector } from "react-redux";
import { setModalFor, setSignInModalOpen } from "../../redux/slices/utils";
import { hydrateAuth } from "redux/slices/authSlice";

const HeroSection1 = () => {

  const column1Images = [Food, Pharmacy, Parcel, Rental, Travel, Grocery, Handyman];
  const column2Images = [Handyman, Grocery, Travel, Rental, Parcel, Pharmacy, Food];
  const mobileImages = [...column1Images, ...column2Images];
  
  const dispatch = useDispatch();
const { isLoggedIn, hydrated } = useSelector((state) => state.auth);


  useEffect(() => {
  const token = localStorage.getItem("token");
  dispatch(hydrateAuth(token));
}, [dispatch]);
if (!hydrated) return null;



  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: "430px", md: "600px" },
        overflow: "hidden",
        py: { xs: 1, md: 6 },
        px: { xs: 2, md: 1 },
        maxHeight: "620px",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#ffffff"
      }}
    >
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">

        {/* LEFT SECTION */}
        <Grid item xs={12} md={7} sx={{ py: "50px !important" }}>

          {/* TOP SMALL TEXT */}
          <Typography
            sx={{
              fontSize: { xs: "0.9rem", md: "16px" },
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "#FEBC2F",
              ml: { xs: 2, md: 5 },
              mb: 0.3,
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
            }}
          >
            WELCOME TO DEALPLEX
          </Typography>

          {/* MAIN HEADING */}
          <Typography
            sx={{
              fontWeight: 600,
              width: { xs: "95%", md: "80%" },
              fontSize: { xs: "2rem", md: "2.8rem" },
              color: "#0D3C25",
              ml: { xs: 2, md: 5 },
              lineHeight: { xs: 1.4, md: 1.2 },
              fontFamily: "Inter, sans-serif",
            }}
          >
            Dealplex: All Your{" "}
            <span style={{ color: "#FEBC2F", fontFamily: "Inter, sans-serif" }}>
              Local Needs.
            </span>{" "}
            <span style={{ color: "#0D3C25", fontFamily: "Inter, sans-serif" }}>
              One Simple Tap.
            </span>
          </Typography>

          {/* SUBTEXT */}
          <Typography
            variant="subtitle1"
            sx={{
              color: "#555",
              mt: 2,
              fontSize: { xs: "1.1rem", md: "1.4rem" },
              ml: { xs: 2, md: 5 },
              lineHeight: 1.5,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Stop Juggling Apps. Get Everything Local In One Simple Tap
          </Typography>

          {/* BUTTON */}
        {!isLoggedIn && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 4 }}>
             <Button
  onClick={() => {
    dispatch(setSignInModalOpen(true)); // Open the modal
    dispatch(setModalFor("sign-up"));  // Set the modal type to "sign-up"
  }}
  variant="contained"
  sx={{
    backgroundColor: "#279d44",
    color: "#fff",
    fontSize: { xs: "1rem", md: "1.2rem" },
    fontWeight: 600,
    px: { xs: 3, md: 4 },
    py: { xs: 1, md: 1.2 },
    borderRadius: "8px",
    "&:hover": { backgroundColor: "#218838" },
    ml: { xs: 2, md: 5 },
    fontFamily: "Inter, sans-serif",
  }}
>
  <Typography color="#fff">Register Now</Typography>
</Button>
            </Box>
          )}


          {/* BOTTOM DESCRIPTION */}
          <Typography
            sx={{
              ml: { xs: 2, md: 5 },
              mt: { xs: 3, md: 3 },
              color: "#777",
              fontSize: { xs: "0.8rem", md: "0.81rem" },
              lineHeight: 1.6,
              width: { xs: "95%", md: "80%" },
              fontStyle: "italic",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Grocery, Food, Travel, Pharmacy, Rentals, Parcels, and Handyman Services
            all in your pocket.
          </Typography>
        </Grid>

        {/* IMAGE COLUMNS */}
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {/* COLUMN 1 */}
          <Box
            sx={{
              width: "260px",
              height: "500px",
              overflow: "hidden",
              maskImage:
                "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
            }}
          >
            <Box sx={{ animation: "scrollDownUp 20s linear infinite alternate" }}>
              {column1Images.map((img, i) => (
                <Box
                  key={i}
                  sx={{
                    width: "100%",
                    height: "250px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    my: 1,
                  }}
                >
                  <Image
                    src={img}
                    alt={`img-${i}`}
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* COLUMN 2 */}
          <Box
            sx={{
              width: "260px",
              height: "500px",
              overflow: "hidden",
              maskImage:
                "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
              marginRight: "-12%",
            }}
          >
            <Box sx={{ animation: "scrollUpDown 20s linear infinite alternate" }}>
              {column2Images.map((img, i) => (
                <Box
                  key={i}
                  sx={{
                    width: "100%",
                    height: "250px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    my: 1,
                  }}
                >
                  <Image
                    src={img}
                    alt={`img-${i}`}
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* ANIMATIONS */}
      <style>
        {`
          @keyframes scrollDownUp {
            0% { transform: translateY(-50%); }
            50% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes scrollUpDown {
            0% { transform: translateY(0); }
            50% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
          }
          @keyframes mobileScroll {
            0% { transform: translateX(0); }
            50% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
        `}
      </style>
    </Box>
  );
};

export default HeroSection1;
