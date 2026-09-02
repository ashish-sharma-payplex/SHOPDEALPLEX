import React from "react";
import { SearchLocationTextField } from "../landing-page/hero-section/HeroSection.style";
import { IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import CloseIcon from "@mui/icons-material/Close";
import AnimationDots from "../spinner/AnimationDots";

const CustomMapSearch = ({
  // search props (commented out for now)
  // showCurrentLocation,
  // predictions,
  // handleChange,
  // HandleChangeForSearch,
  // frommap,
  // fromparcel,
  // toReceiver,
  currentLocation,
  handleAgreeLocation,
  handleCloseLocation,
  testLocation,
  isLoading,
  isRefetching,
  isLanding = false,
  locationError,
  setLocationTouched,
}) => {
  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      {/* 🔵 SEARCH / AUTOCOMPLETE (COMMENTED OUT) */}
      {/*
      {!showCurrentLocation ? (
        <Autocomplete
          fullWidth
          options={predictions}
          getOptionLabel={(option) => option.description}
          onChange={(event, value) => handleChange(event, value)}
          value={currentLocationValue}
          clearOnBlur={false}
          loading={frommap === "true" ? placesIsLoading : null}
          loadingText={
            frommap === "true" ? t("Search suggestions are loading...") : ""
          }
          PaperComponent={(props) => (
            <Paper sx={{ borderRadius: "0 0 4px 4px" }} {...props} />
          )}
          renderInput={(params) => (
            <SearchLocationTextField
              noleftborder={noleftborder}
              frommap={frommap}
              fromparcel={fromparcel}
              id="outlined-basic"
              {...params}
              placeholder={t("Search location here...")}
              isLanding
              isXSmall
              error={locationError}
              onChange={(event) => HandleChangeForSearch(event)}
              onBlur={() => setLocationTouched && setLocationTouched(true)}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  // icon logic here
                ),
              }}
              required
            />
          )}
        />
      ) : (
      */}
      
      {/* 🔵 CURRENT LOCATION INPUT */}
      <SearchLocationTextField
        size="small"
        variant="outlined"
        placeholder="Your Current selected location is....."
        sx={{
    borderTop: "none", 
    borderLeft: "none", 
    borderRight: "none", 
    borderBottom: "1px solid #D9E1EC"
  }}
        value={testLocation ? testLocation : currentLocation}
        onChange={() => {}} // optional if typing not needed
        onBlur={() => setLocationTouched && setLocationTouched(true)}
        required
        isLanding
        isXSmall
        error={locationError}
        InputProps={{
          readOnly:true,
          endAdornment: (
            <Stack mr={isLanding ? "50px" : "0"}>
              {isLoading || isRefetching ? (
                <AnimationDots />
              ) : (
                <IconButton
                  sx={{
                    padding: "5px",
                    marginRight: isXSmall ? "0px" : "0px",
                  }}
                  onClick={() => handleCloseLocation()}
                >
                  {/* <CloseIcon
                    sx={{
                      cursor: "pointer",
                      fontSize: isXSmall ? "16px" : "24px",
                    }}
                  /> */}
                </IconButton>
              )}
            </Stack>
          ),
        }}
      />

      {/* 🔵 USE CURRENT LOCATION BUTTON */}
      <Stack
        onClick={() => handleAgreeLocation()}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap="10px"
        sx={{
          cursor: "pointer",
          color: theme.palette.primary.main,
          mt: 1,
          p: 1,
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: theme.palette.primary.light,
          },
        }}
      >
        <GpsFixedIcon />
        <Typography fontWeight={600}>Use Current Location</Typography>
      </Stack>
    </>
  );
};

export default CustomMapSearch;