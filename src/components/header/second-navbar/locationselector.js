import React, { useRef, useState, useEffect } from "react";
import { Stack, Typography } from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import { useTranslation } from "react-i18next";
import AddressReselectPopover from "components/header/top-navbar/address-reselect/AddressReselectPopover";
import { CustomStackForLoaction } from "components/header/NavBar.style";

const LocationSelector = ({ color = "black", iconColor = "#279d44", onChange }) => {
  const { t } = useTranslation();
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const locationButtonRef = useRef(null);

  useEffect(() => {
    const loadLocation = () => {
      const storedLocation = localStorage.getItem("location");
      setCurrentLocation(storedLocation);
    };
    loadLocation();
    window.addEventListener("locationUpdated", loadLocation);
    return () => {
      window.removeEventListener("locationUpdated", loadLocation);
    };
  }, []);

  const handleAddressClick = () => setAddressModalOpen(true);
  const handleAddressModalClose = () => {
    setAddressModalOpen(false);
    const updatedLocation = localStorage.getItem("location");
    setCurrentLocation(updatedLocation);
  };


  const handleAddressChange = (newAddress) => {
    if (newAddress) {
      // Update localStorage and state for current location
      localStorage.setItem("location", newAddress.address);
      localStorage.setItem("currentLatLng", JSON.stringify({ lat: newAddress.lat, lng: newAddress.lng }));
      if (newAddress.zone_ids?.length) {
        localStorage.setItem("zoneid", JSON.stringify(newAddress.zone_ids));
      }
      setCurrentLocation(newAddress.address); // Update state immediately
      handleAddressModalClose();
      onChange?.(newAddress); // optional callback
    }
  };
 
  // New callback function to close the popover when location is selected
  const onLocationSelected = () => {
    handleAddressModalClose(); // Close the AddressReselectPopover
  };

  return (
    <>
      <CustomStackForLoaction
        ref={locationButtonRef}
        direction="row"
        sx={{
          alignItems: "center",
          cursor: "pointer",
          "&:hover": { opacity: 0.8 },
        }}
        onClick={handleAddressClick}
      >
        <RoomIcon sx={{ fontSize: 20, color: iconColor, mr: 1 }} />
        <Typography fontSize="14px" color={color} noWrap>
          {currentLocation ? currentLocation : t("Select location")}
        </Typography>
      </CustomStackForLoaction>

      <AddressReselectPopover
        anchorEl={locationButtonRef.current}
        onClose={handleAddressModalClose}
        open={addressModalOpen}
        t={t}
        address={currentLocation}
        setAddress={handleAddressChange}
        token={localStorage.getItem("token")}
          onLocationSelected={onLocationSelected}
        currentLatLngForMar={currentLocation ? JSON.parse(localStorage.getItem("currentLatLng") || "{}") : undefined}
      />
    </>
  );
};

export default LocationSelector;
