import React, { useEffect, useState } from "react";
import { Button, Popover, Stack, Typography, InputAdornment, TextField, useTheme } from "@mui/material";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import CustomAlert from "../../../alert/CustomAlert";
import DeliveryAddress from "../../../checkout/delivery-address";
import { useGeolocated } from "react-geolocated";
import useGetGeoCode from "../../../../api-manage/hooks/react-query/google-api/useGetGeoCode";
import useGetZoneId from "../../../../api-manage/hooks/react-query/google-api/useGetZone";
import dynamic from "next/dynamic";
import AnimationDots from "../../../spinner/AnimationDots";
import SearchIcon from "@mui/icons-material/Search";
const MapModal = dynamic(() => import("../../../Map/MapModal"));

const AddressReselectPopover = ({
  anchorEl,
  onClose,
  open,
  t,
  address,
  setAddress,
  token,
  currentLatLngForMar,
  onLocationSelected,
  forceSelection = false,
  ...other
}) => {
  const theme = useTheme();
  const [openMapModal, setOpenMapModal] = useState(false);
  const [location, setLocation] = useState(undefined);
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [showCurrentLocation, setShowCurrentLocation] = useState(false);
  const [geoLocationEnable, setGeoLocationEnable] = useState(false);
  const [zoneIdEnabled, setZoneIdEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ NAYA — seedha navigator.geolocation use karo, instant response
  // useGeolocated import hatao completely

  const [isLocating, setIsLocating] = useState(false); // isLoadingGeoCode ki jagah ye bhi use karo

  const handleAgreeLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation supported nahi hai aapke browser mein");
      return;
    }

    setIsLocating(true); // loading start

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });
        setShowCurrentLocation(true);
        setGeoLocationEnable(true);
        setZoneIdEnabled(true);
        setIsLocating(false); // loading band
      },
      (error) => {
        // console.error("Location error:", error);
        setIsLocating(false);
        // error codes: 1=PERMISSION_DENIED, 2=UNAVAILABLE, 3=TIMEOUT
        if (error.code === 1) {
          alert("Location permission denied. Please allow location access.");
        }
      },
      {
        enableHighAccuracy: true,   // ✅ accurate location
        timeout: 8000,              // 8 sec max wait
        maximumAge: 30000,          // 30 sec purana cached location bhi chalega
      }
    );
  };

  const handleSetLocation = async () => {
    if (currentLocation && location) {
      localStorage.setItem("location", currentLocation);
      localStorage.setItem("currentLatLng", JSON.stringify(location));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("locationUpdated"));
      }
      onClose();
      window.location.reload();
    }
  };

  const { data: geoCodeResults, isLoading: isLoadingGeoCode } = useGetGeoCode(location, geoLocationEnable);

  useEffect(() => {
    handleSetLocation();
  }, [currentLocation, location, address?.address]);

  useEffect(() => {
    if (geoCodeResults?.results && showCurrentLocation) {
      setCurrentLocation(geoCodeResults?.results[0]?.formatted_address);
    }
  }, [geoCodeResults, location]);

  const { data: zoneData } = useGetZoneId(location, zoneIdEnabled);

  useEffect(() => {
    if (typeof window !== "undefined" && zoneData) {
      localStorage.setItem("zoneid", zoneData?.zone_id);
    }
  }, [zoneData]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") setOpenMapModal(true);
  };




  const popOverHeightHandler = () => {
    if (typeof window !== "undefined" && window.innerWidth < 600) {
      return token ? "475px" : "260px"; // ✅ mobile pe zyada height
    }
    return token ? "475px" : "150px";  // laptop/tablet same
  };

  return (
    <>
      <Popover
        disableScrollLock={true}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        keepMounted
        onClose={(event, reason) => {
          if (forceSelection && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
          onClose(event, reason);
        }}
        open={open}
        PaperProps={{
          sx: {
            width: { xs: 300, sm: 320, md: 475 },
            p: "1rem",
            backgroundColor: "#fff",
            marginTop: { xs: "8px", sm: "16px", md: "24px" },
            overflow: { xs: "hidden", sm: "auto" },
            minHeight: { xs: "220px", sm: "auto" }, // ✅ yeh add karo
          },
        }}
        transitionDuration={2}
        {...other}
      >
        <Stack justifyContent="center" textAlign="center" spacing={2}>
          <SimpleBar
            className="custom-scrollbar"
            style={{
              // ✅ mobile pe maxHeight auto — content fit ho jaye, no scroll
              maxHeight: popOverHeightHandler(),
              paddingRight: "5px",
              overflow: "hidden",
            }}
          >
            <Stack width="100%">

              {/* Title */}
              <Typography
                fontSize="16px"
                fontWeight={500}
                textAlign={{ xs: "center", sm: "left" }}
                sx={{ mb: 1 }}
              >
                {!token ? (
                  <>
                    <span style={{ color: "#000000" }}>{t("Welcome To ")}</span> {/* 🔥 black color */}
                    <span style={{ color: "#008236" }}>Dealplex</span>
                  </>
                ) : (
                  <span style={{ color: "#000000" }}>{t("Change Location ")}</span>
                )}
              </Typography>

              {/* ✅ Map icon LEFT of text on mobile too — direction: "row" for all */}
              {!token && (
                <Stack
                  direction="row"                          // ✅ row for all screens
                  alignItems="flex-start"
                  justifyContent={{ xs: "center", sm: "flex-start" }}
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <img
                    src="/icons/map.svg"
                    alt="map icon"
                    style={{ width: 20, height: 20, marginTop: "2px", flexShrink: 0 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "13px",
                      lineHeight: { xs: 1.6, sm: 1.5 },   // ✅ mobile pe halki line height
                      color: "#000000",                   // 🔥 black color
                      textAlign: { xs: "center", sm: "left" }, // ✅ mobile me center, desktop waise ka waise
                    }}
                  >
                    {t("To select from saved addresses, you need to sign in.")}
                  </Typography>
                </Stack>
              )}

              {/* Search bar + Button */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent={{ xs: "center", sm: "flex-start" }}
                gap="12px"
                sx={{ mt: 1, mb: { xs: 1, sm: 4 } }}   // ✅ mobile pe mb kam — scroll na ho
              >
                {/* Search — mobile pe full width & pehle */}
                <TextField
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onClick={() => setOpenMapModal(true)}
                  onKeyDown={handleKeyPress}
                  placeholder={t("Search address, city or pincode")}
                  sx={{
                    fontSize: "14px",
                    height: "36px",
                    width: { xs: "100%", sm: "auto" },
                    order: { xs: 1, sm: 2 },
                    "& .MuiInputBase-root": { height: "100%" },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Button — mobile pe full width & niche */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#279d44",
                    color: "#fff",
                    minHeight: "36px",
                    padding: "4px 12px",
                    width: { xs: "100%", sm: "auto" },
                    order: { xs: 2, sm: 1 },
                    "&:hover": { backgroundColor: "#008236" },
                    fontSize: { xs: "14px", sm: "12px", md: "14px" },
                    whiteSpace: "nowrap",
                  }}
                  onClick={handleAgreeLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AnimationDots />
                      <Typography fontSize="12px" color="#fff">
                        Detecting...
                      </Typography>
                    </Stack>
                  ) : (
                    t("Use Current Location")
                  )}
                </Button>
              </Stack>

            </Stack>
          </SimpleBar>
        </Stack>
      </Popover>

      {openMapModal && (
        <MapModal
          open={openMapModal}
          handleClose={() => setOpenMapModal(false)}
          onLocationSelected={onLocationSelected}
        />
      )}
    </>
  );
};

AddressReselectPopover.propTypes = {};

export default AddressReselectPopover;