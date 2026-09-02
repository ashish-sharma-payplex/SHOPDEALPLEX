import React, { useEffect } from "react";
import { Grid, Skeleton, styled, Box } from "@mui/material";
import CustomImageContainer from "../CustomImageContainer";
import useGetOtherBanners from "../../api-manage/hooks/react-query/useGetOtherBanners";

// Styled component from Grocery (applied strictly)
const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  borderRadius: "8px",
  height: "390px",
  width: "400px",
  overflow: "hidden",
  [theme.breakpoints.up("md")]: {
    height: "190px",
  },
  "&:hover img": {
    transform: "scale(1.5)",
  },
}));

export const Shimmer = () => (
  <>
    {[...Array(4)].map((_, index) => (
      <Grid item xs={4} sm={4} md={2.4} key={index} align="center">
        <ImageContainer>
          <Skeleton variant="rectangular" height="100%" width="150%" />
        </ImageContainer>
      </Grid>
    ))}
  </>
);

const ParcelOnTime = () => {
  const { data, refetch, isLoading } = useGetOtherBanners();

  useEffect(() => {
    refetch();
  }, []);

  const banners = data?.banners || [];

  return (
    <Grid container spacing={2}>
      {isLoading ? (
        <Shimmer />
      ) : (
        banners.map((item, index) => (
          <Grid
            item
            xs={4}
            sm={3}
            md={2.4}
            lg={4}
            key={index}
            align="center"
            sx={{ cursor: "pointer", marginBottom:"20px" }}
          >
            <ImageContainer>
              <CustomImageContainer
                src={item?.value_full_url}
                alt={`Banner ${index}`}
                height="100%"
                width="100%"
                objectfit="fit-content"
              />
            </ImageContainer>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default ParcelOnTime;
