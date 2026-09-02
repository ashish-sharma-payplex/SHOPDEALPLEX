import React, { useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import { t } from "i18next";
import AllowLocationDialog from "./AllowLocationDialog";
import { IconButton } from "@mui/material";
import toast from "react-hot-toast";

const UseCurrentLocation = ({
  isLoadingCurrentLocation,
  setLoadingCurrentLocation,
  setLocationEnabled,
  setLocation,
  zoneId,
  refetchCurrentLocation,
  setRerenderMap,
  isGeolocationEnabled,
  coords,
  fromMapModal
}) => {
  const [openLocation, setOpenLocation] = useState(false);
  const handleCloseLocation = () => {
    setOpenLocation(false);
  };

  // Function to validate if location is in a valid zone
  const validateLocationInZone = async (coords) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config/get-zone-id?lat=${coords.lat}&lng=${coords.lng}`,
        {
          headers: {
            "X-software-id": "33571750",
            "origin": process.env.NEXT_CLIENT_HOST_URL,
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data && data.zone_id;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return (
    <>
      <IconButton
        sx={{
          borderRadius: "50%",
          color: (theme) => theme.palette.primary.main,
          // backgroundColor: "background.paper",
          boxShadow: "0px 4.48276px 11.2069px rgba(0, 0, 0, 0.1)",
          width: { xs: "28px", md: "35px" },
          height: { xs: "28px", md: "35px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={async (e) => {
          e.preventDefault();
          if (coords) {
            setLoadingCurrentLocation(true);
            
            // Validate that the current location is in a valid zone
            const zoneValidation = await validateLocationInZone({
              lat: coords?.latitude,
              lng: coords?.longitude,
            });
            
            if (zoneValidation) {
              setLocationEnabled(true);
              setLocation({
                lat: coords?.latitude,
                lng: coords?.longitude,
              });
              
              if(!fromMapModal){
                localStorage.setItem("zoneid", zoneValidation);
              }
              
              await refetchCurrentLocation();
              setRerenderMap((prevState) => !prevState);
              toast.success(t("Location set successfully"));
            } else {
              // Location is not in a valid zone
              toast.error(t("Your current location is not in our service area. Please select a location within our service zone."));
            }
            
            setLoadingCurrentLocation(false);
          } else {
            setOpenLocation(true);
          }
        }}
      >
        <GpsFixedIcon sx={{ fontSize: { xs: "18px", md: "24px",backgroundColor:"#ffffff" } }} />
      </IconButton>
      {openLocation && (
        <AllowLocationDialog
          handleCloseLocation={handleCloseLocation}
          openLocation={openLocation}
          isGeolocationEnabled={isGeolocationEnabled}
        />
      )}
    </>
  );
};

export default UseCurrentLocation;

