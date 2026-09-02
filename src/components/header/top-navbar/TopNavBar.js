import { Box, NoSsr, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useState, useRef } from "react";
import { CustomStackForLoaction } from "../NavBar.style";
import ThemeSwitches from "./ThemeSwitches";
import CustomLanguage from "./language/CustomLanguage";
import { useSelector } from "react-redux";
import CallToAdmin from "../../CallToAdmin";
import CustomContainer from "../../container";
import LogoSide from "../../logo/LogoSide";
import AddressReselectPopover from "../top-navbar/address-reselect/AddressReselectPopover";
import DrawerMenu from "./drawer-menu/DrawerMenu";
import RoomIcon from "@mui/icons-material/Room";
import { useTranslation } from "react-i18next";

const TopNavBar = () => {
  const { configData, countryCode, language } = useSelector(
    (state) => state.configData
  );
  const { t } = useTranslation();
  let zoneId = undefined;

  const [openDrawer, setOpenDrawer] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const theme = useTheme();
  let location = undefined;
  if (typeof window !== "undefined") {
    const storedLocation = localStorage.getItem("location");
    try {
      location = JSON.parse(storedLocation);
    } catch (err) {
      location = storedLocation || null;
    }
    // console.log("LocalStorage location value:", location);
  }

  const [address, setAddress] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const locationButtonRef = useRef(null);
  let token = undefined;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  // Update location state when localStorage changes
  React.useEffect(() => {
    const updateLocation = () => {
      if (typeof window !== "undefined") {
        const storedLocation = localStorage.getItem("location");
        try {
          const parsedLocation = JSON.parse(storedLocation);
          setCurrentLocation(parsedLocation);
        } catch (err) {
          setCurrentLocation(storedLocation || null);
        }
      }
    };

    // Initial load
    updateLocation();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "location") {
        updateLocation();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event listener for same-tab updates
    const handleLocationUpdate = () => {
      updateLocation();
    };

    window.addEventListener("locationUpdated", handleLocationUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("locationUpdated", handleLocationUpdate);
    };
  }, []);

  const isValidLocation = (loc) => {
    if (!loc || typeof loc !== "string") return false;
    return !loc.includes("0,0") && !loc.includes("lat:'0'") && !loc.includes("lan:'0'") && !loc.includes('{"lat":0,"lng":0}');
  };

  if (typeof window !== "undefined") {
    location = localStorage.getItem("location");
    token = localStorage.getItem("token");
    zoneId = JSON.parse(localStorage.getItem("zoneid"));
  }

  const handleAddressClick = () => {
    setAddressModalOpen(true);
  };

  const handleAddressModalClose = () => {
    setAddressModalOpen(false);
  };

  const isSmall = useMediaQuery("(max-width:1200px)");

  return (
    <NoSsr>
      <Box
        sx={{
          width: "100%",
          backgroundColor:"#279d44",
          padding:"0px 0px 8px 10px",
          borderRadius: "0px !important", 
          "& .MuiPaper-root": { borderRadius: "0px !important" } ,// Explicitly remove border-radius
        // Set navbar background to black
          color: "white", // Set text to white
          borderBottom: `1px solid ${theme.palette.divider}`, // Optional border for separation
        }}
      >
       
            <Box
              sx={{
                display: "block",
                width: "100%"
              }}
            >
              <Stack
                pt=".4rem"
                width="100%"
                height="30px"
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                {/* Address Popover */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <CustomStackForLoaction
                    ref={locationButtonRef}
                    direction="row"
                    sx={{
                      width: "auto",
                      maxWidth: "300px",
                      alignItems: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.8
                      }
                    }}
                    onClick={handleAddressClick}
                  >
                    <RoomIcon
                      sx={{
                        fontSize: { xs: "16px", sm: "20px" },
                        color: "white",
                        mr: 1
                      }}
                    />
                    <Typography
                      fontSize={{ xs: "12px", sm: "14px" }}
                      align="center"
                      color="white"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "200px"
                      }}
                    >
                      {currentLocation && isValidLocation(currentLocation)
                        ? currentLocation
                        : t("Select your location")
                      }
                    </Typography>
                  </CustomStackForLoaction>
                </Stack>

                {/* Right side controls */}
                <Stack direction="row" spacing={2} justifyContent="end" alignItems="center">
                  <CallToAdmin configData={configData} />
                </Stack>
              </Stack>

              {/* Address Popover */}
              <AddressReselectPopover
                anchorEl={locationButtonRef.current}
                onClose={handleAddressModalClose}
                open={addressModalOpen}
                t={t}
                address={location}
                setAddress={(newAddress) => {
                  if (newAddress) {
                    localStorage.setItem("location", newAddress.address);
                    const values = { lat: newAddress.lat, lng: newAddress.lng };
                    localStorage.setItem("currentLatLng", JSON.stringify(values));
                    if (newAddress.zone_ids && newAddress.zone_ids.length > 0) {
                      localStorage.setItem("zoneid", JSON.stringify(newAddress.zone_ids));
                    }
                    handleAddressModalClose();
                    // Redirect to home page instead of opening module selection modal
                    window.location.href = "/";
                  }
                }}
                token={token}
                currentLatLngForMar={location ? JSON.parse(localStorage.getItem("currentLatLng") || '{}') : undefined}
              />
            </Box>

      </Box>
    </NoSsr>
    
  );
};

export default TopNavBar;
