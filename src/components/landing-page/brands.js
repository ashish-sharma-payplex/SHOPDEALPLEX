import React from "react";
import { Box, Grid, Button, useMediaQuery, useTheme } from "@mui/material";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import CustomContainer from "../container";
import Gro from "./imgs/Dawat.jpg";
import Phar from "./imgs/Nescafe.jpg";
import Food from "./imgs/Maggi.jpg";
import Par from "./imgs/Tata.jpg";
import Gr from "./imgs/Britania.jpg";
import ECO from "./imgs/06.png";
import Plex from "./imgs/Everest.jpg";


// Sample images and button names
const images = [
  { name: "Grocery", imageSrc: Gro.src },
  { name: "Pharmacy", imageSrc: Phar.src },
  { name: "Parcel", imageSrc: Par.src },
  { name: "Food", imageSrc: Food.src },
  { name: "Rental", imageSrc: Gr.src },
    { name: "flight", imageSrc: Plex.src },


];

const Brands = ({ landingPageData = {}, handleOrderNow = () => {} }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <CustomContainer>
       <CustomStackFullWidth>
      <Box sx={{ marginTop: "0.2rem", width:"100%",background:"rgb(255, 255, 255)" }}>
        <Grid container spacing={3} justifyContent="center">
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "200px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  
                }}
              >
                {/* Image */}
                <img 
                  src={image.imageSrc}
                  alt={image.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: 0,
                    
                  }}
                />

                {/* Button */}
                {/* <Button
                  variant="contained"
                  sx={{
                    position: "absolute",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "10px 20px",
                    fontWeight: "bold",
                    borderRadius: "5px",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                    backgroundColor: "#ffffff",
                    color: "black", // Ensure text is visible
                    "&:hover": { backgroundColor: "#f0f0f0" }, // Light hover effect
                  }}
                  onClick={() => handleOrderNow(image.name)}
                >
                  {image.name}
                </Button> */}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      </CustomStackFullWidth>
    </CustomContainer>
  );
};

export default Brands;

