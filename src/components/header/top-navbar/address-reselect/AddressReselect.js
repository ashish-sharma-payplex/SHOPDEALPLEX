import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RoomIcon from "@mui/icons-material/Room";
import { Grid, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CustomStackFullWidth } from "../../../../styled-components/CustomStyles.style";
import AddressReselectPopover from "./AddressReselectPopover";
import { getModule } from "helper-functions/getLanguage";

  const AddressReselect = ({ location, setOpenDrawer, forceSelection = false }) => {
  const theme = useTheme();
  const router = useRouter();
  const [openPopover, setOpenPopover] = useState(false);
  const [address, setAddress] = useState(null);
  const { t } = useTranslation();
  let token = undefined;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  let currentLatLngForMar;
  if (typeof localStorage.getItem("currentLatLng") !== undefined) {
    currentLatLngForMar = JSON.parse(localStorage.getItem("currentLatLng"));
  }

  useEffect(() => {
    // Always check localStorage for a valid location on mount
    let storedLocation = null;
    if (typeof window !== "undefined") {
      storedLocation = localStorage.getItem("location");
    }
    if (!isValidLocation(storedLocation)) {
      // Force open the modal regardless of previous state
      setOpenPopover(true);
    }
  }, []);

  useEffect(() => {
    if (address) {
      localStorage.setItem("location", address?.address);
      const values = { lat: address?.lat, lng: address?.lng };
      localStorage.setItem("currentLatLng", JSON.stringify(values));
      if (address.zone_ids && address.zone_ids.length > 0) {
        localStorage.setItem("zoneid", JSON.stringify(address.zone_ids));
        toast.success(t(`New ${getModule()?.module_type === "rental" ? "Pickup" : "Delivery"} address selected.`));
        handleClosePopover();
        
        // Close the parent modal if setOpenDrawer is provided (LocationModal)
        if (setOpenDrawer) {
          setOpenDrawer();
        }
      }
    }
  }, [address]);

  const handleClickToLandingPage = () => {
    setOpenPopover(true);
    setOpenDrawer(false);
  };

  const anchorRef = useRef(null);
  const handleClosePopover = () => {
    setOpenPopover(false);
  };

  const isValidLocation = (loc) => {
    if (!loc || typeof loc !== "string") return false;
    return !loc.includes("0,0") && !loc.includes("lat:'0'") && !loc.includes("lan:'0'");
  };

  return (
    <>
      <Grid
        container
        alignItems="center"
        justifyContent="flex-start"
        sx={{
          marginTop:"-7rem",
          color: (theme) => theme.palette.neutral[1000],
          maxWidth: { xs: "300px", sm: "350px" },
          cursor: "pointer",
          "&:hover": {
            cursor: "pointer",
          },
        }}
        ref={anchorRef}
        onClick={handleClickToLandingPage}
        data-testid="location-selector"
      >
        <Grid item xs={11} align="left">
          {/* <CustomStackFullWidth direction="row" alignItems="center" spacing={1}>
            <RoomIcon
              sx={{
                fontSize: { xs: "16px", sm: "20px" },
              }}
              color="primary"
            />
            <Typography
              fontSize={{ xs: "12px", sm: "16px" }}
              align="center"
              color="white"
              sx={{
                overflow: "hidden",
                textOverflow: "clip",
                display: "-webkit-box",
                whiteSpace: "normal",
                width: "100%",
                WebkitLineClamp: "1",
                WebkitBoxOrient: "vertical",
                textAlign: "left",
                transition: "all ease 0.5s",
                wordBreak: "break-word",
                cursor: "pointer",
                "&:hover": {
                  color: "#FF6600",
                  cursor: "pointer",
                },
              }}
            >
              {isValidLocation(location) ? location : t("Please add your location")}
            </Typography>
          </CustomStackFullWidth> */}
        </Grid>
        <Grid item xs={1}>
          {/* <CustomStackFullWidth>
            <KeyboardArrowDownIcon
              sx={{
                fontSize: { xs: "16px", sm: "20px" },
              }}
            />
          </CustomStackFullWidth> */}
        </Grid>
      </Grid>
      <AddressReselectPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
        t={t}
        address={address}
        setAddress={setAddress}
        token={token}
        currentLatLngForMar={currentLatLngForMar}
        forceSelection={forceSelection}
      />
    </>
  );
};

AddressReselect.propTypes = {};

export default AddressReselect;
