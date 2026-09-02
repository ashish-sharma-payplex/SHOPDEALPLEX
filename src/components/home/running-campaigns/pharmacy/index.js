import { styled, useTheme } from "@mui/material";
import { Box, Grid, useMediaQuery } from "@mui/material";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import CustomImageContainer from "../../../CustomImageContainer";

const ImageWrapper = styled(Box)(({ theme }) => ({
  cursor: "pointer",
  overflow: "hidden",
  height: "100%",
  "& img": {
    transition: "transform .3s ease",
  },
  "&:hover img": {
    transform: "scale(1.04)",
  },
}));

const Pharmacy = ({ runningCampaigns, handleClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /* ============================
      MOBILE VIEW → SWIPER
     ============================ */
  if (isMobile) {
    return (
      <Box sx={{ width: "100%" }}>
        <Swiper spaceBetween={12} slidesPerView={1.2}>
          {runningCampaigns?.map((item, index) => (
            <SwiperSlide key={index}>
              <ImageWrapper onClick={() => handleClick(item)}>
                <CustomImageContainer
                  src={item?.image_full_url}
                  alt={item?.title}
                  height="200px"
                  width="100%"
                  objectfit="cover"
                  borderRadius="8px"
                />
              </ImageWrapper>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    );
  }

  /* ============================
      DESKTOP + TABLET → GRID
     ============================ */
  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={3}>
        {/* LEFT SECTION */}
        <Grid item md={8}>
          <Grid container spacing={3} >
            <Grid item md={7}>
              {runningCampaigns[0] && (
                <ImageWrapper onClick={() => handleClick(runningCampaigns[0])}>
                  <CustomImageContainer
                    src={runningCampaigns[0].image_full_url}
                    alt={runningCampaigns[0].title}
                    height="400px"
                    width="auto"
                    objectfit="cover"
                    borderRadius="8px"
                  />
                </ImageWrapper>
              )}
            </Grid>

            <Grid item md={5}>
              {runningCampaigns[1] && (
                <ImageWrapper onClick={() => handleClick(runningCampaigns[1])}>
                  <CustomImageContainer
                    src={runningCampaigns[1].image_full_url}
                    alt={runningCampaigns[1].title}
                    height="100%"
                    width="100%"
                    objectfit="cover"
                    borderRadius="8px"
                  />
                </ImageWrapper>
              )}
            </Grid>

            <Grid item md={5}>
              {runningCampaigns[2] && (
                <ImageWrapper onClick={() => handleClick(runningCampaigns[2])}>
                  <CustomImageContainer
                    src={runningCampaigns[2].image_full_url}
                    alt={runningCampaigns[2].title}
                    height="100%"
                    width="100%"
                    objectfit="cover"
                    borderRadius="8px"
                  />
                </ImageWrapper>
              )}
            </Grid>

            <Grid item md={7}>
              {runningCampaigns[3] && (
                <ImageWrapper onClick={() => handleClick(runningCampaigns[3])}>
                  <CustomImageContainer
                    src={runningCampaigns[3].image_full_url}
                    alt={runningCampaigns[3].title}
                    height="100%"
                    width="100%"
                    objectfit="cover"
                    borderRadius="8px"
                  />
                </ImageWrapper>
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* RIGHT TALL IMAGE */}
        <Grid item md={4}>
          {runningCampaigns[4] && (
            <ImageWrapper onClick={() => handleClick(runningCampaigns[4])}>
              <CustomImageContainer
                src={runningCampaigns[4].image_full_url}
                alt={runningCampaigns[4].title}
                height="730px"
                width="100%"
                objectfit="cover"
                borderRadius="8px"
              />
            </ImageWrapper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Pharmacy;
