import React, { useEffect, useRef, useState } from "react";
import {
  Box, Card, Typography, TextField, Button,
  Grid, InputAdornment, IconButton, CircularProgress,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PickupLocationSelector from "./PickupLocationSelector";
import toast from "react-hot-toast";
import { PICKUP_RAW_KEY } from "./MainForm";

const labelSx = { fontWeight: 500, mb: 0.5, ml: 0.5, fontSize: "14px" };
const textFieldSx = {
  mb: 1.5,
  "& .MuiInputBase-root": { height: 32 },
  "& .MuiInputBase-input": { padding: "6px 10px", fontSize: "12px" },
};

const readPickupRaw = () => {
  try {
    return JSON.parse(localStorage.getItem(PICKUP_RAW_KEY) || "null") || {};
  } catch {
    return {};
  }
};

const PickUpForm = ({ onNext, parcelData }) => {
  const [initRaw] = useState(readPickupRaw);

  const [buildingName, setBuildingName] = useState(initRaw.buildingName || "");
  const [houseNo,      setHouseNo]      = useState(initRaw.houseNo      || "");
  const [street,       setStreet]       = useState(initRaw.street       || "");
  const [landmark,     setLandmark]     = useState(initRaw.landmark     || "");
  const [senderName,   setSenderName]   = useState(initRaw.senderName   || "");
  const [senderPhone,  setSenderPhone]  = useState(initRaw.senderPhone  || "");
  const [floor,        setFloor]        = useState(initRaw.floor        || "");
  const [fieldErrors,  setFieldErrors]  = useState({});
  const [locating,     setLocating]     = useState(false);
  const [location,     setLocation]     = useState(
    initRaw.location || { lat: "", lng: "", address: "" }
  );
  const [searchText, setSearchText] = useState(initRaw.location?.address || "");

  // Refs for auto-scroll on error
  const fieldRefs = {
    pickup_location:  useRef(null),
    house_no:         useRef(null),
    building_name:    useRef(null),
    street_locality:  useRef(null),
    landmark:         useRef(null),
    sender_name:      useRef(null),
    sender_contact_no: useRef(null),
  };

  useEffect(() => {
    try {
      localStorage.setItem(PICKUP_RAW_KEY, JSON.stringify({
        buildingName, houseNo, street, landmark,
        senderName, senderPhone, floor, location,
      }));
    } catch {}
  }, [buildingName, houseNo, street, landmark, senderName, senderPhone, floor, location]);

  useEffect(() => {
    if (location?.address) setSearchText(location.address);
  }, [location.address]);

  const clearError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  const getCurrentLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            setLocation({ lat, lng, address: results[0].formatted_address });
            setSearchText(results[0].formatted_address);
            clearError("pickup_location");
          }
          setLocating(false);
        });
      },
      () => setLocating(false)
    );
  };

  const handleConfirm = () => {
    const errors = {};
    if (!location.address)    errors.pickup_location   = "Pickup location is required";
    if (!houseNo.trim())      errors.house_no          = "House No. is required";
    if (!buildingName.trim()) errors.building_name     = "Building name is required";
    if (!street.trim())       errors.street_locality   = "Street is required";
    if (!landmark.trim())     errors.landmark          = "Landmark is required";
    if (!senderName.trim())   errors.sender_name       = "Sender name is required";
    if (!senderPhone.trim()) {
      errors.sender_contact_no = "Phone is required";
    } else if (senderPhone.length < 10) {
      errors.sender_contact_no = "Enter valid 10-digit number";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill all required fields");

      // Auto-scroll to first error field
      const fieldOrder = [
        "pickup_location",
        "house_no",
        "building_name",
        "street_locality",
        "landmark",
        "sender_name",
        "sender_contact_no",
      ];
      const firstErrorKey = fieldOrder.find((key) => errors[key]);
      if (firstErrorKey && fieldRefs[firstErrorKey]?.current) {
        fieldRefs[firstErrorKey].current.scrollIntoView({ behavior: "smooth", block: "center" });
        // Focus the input inside
        const input = fieldRefs[firstErrorKey].current.querySelector("input");
        if (input) input.focus();
      }
      return;
    }

    const pickupPayload = {
      pickup_location:             location.address,
      pickup_houseno_buildingname: `${houseNo}, ${buildingName}`,
      pickup_floor:                floor,
      pickup_street_locality:      street,
      pickup_landmark:             landmark,
      sender_name:                 senderName,
      sender_contact_no:           senderPhone,
      pickup_latitude:             String(location.lat),
      pickup_longitude:            String(location.lng),
    };

    const mergedPayload = { ...parcelData, ...pickupPayload };
    toast.success("Pickup details saved successfully!");
    setTimeout(() => { onNext(mergedPayload); }, 800);
  };

  return (
    <Box sx={{
      fontFamily: "Inter", width: "100%", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center", p: 2,
    }}>
      <Card elevation={0} sx={{
        p: 2, mb: 2, borderRadius: 3,
        boxShadow: "none", border: "none", width: "100%", maxWidth: 1100,
      }}>
        <Grid container spacing={4} alignItems="stretch" wrap="nowrap">

          {/* LEFT FORM */}
          <Grid item sx={{ width: "50%" }}>
            <Card variant="outlined" sx={{ p: 3, borderRadius: "16px !important", height: "100%" }}>

              <Typography sx={labelSx}>
                Pickup Location&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>

              <Box ref={fieldRefs.pickup_location}>
                <TextField
                  fullWidth size="small"
                  value={searchText}
                  error={!!fieldErrors.pickup_location}
                  helperText={fieldErrors.pickup_location || "Use the map on right to search & select pickup location"}
                  inputProps={{ readOnly: true }}
                  sx={{
                    ...textFieldSx,
                    "& .MuiInputBase-input": {
                      padding: "6px 10px",
                      fontSize: "12px",
                      cursor: "default",
                      caretColor: "transparent",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={getCurrentLocation} disabled={locating}>
                          {locating
                            ? <CircularProgress size={16} sx={{ color: "#1f8f4a" }} />
                            : <MyLocationIcon fontSize="small" />
                          }
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {locating && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, ml: 0.5 }}>
                  <CircularProgress size={12} sx={{ color: "#1f8f4a" }} />
                  <Typography sx={{ fontSize: "12px", color: "#1f8f4a", fontFamily: "Inter" }}>
                    Fetching your location...
                  </Typography>
                </Box>
              )}

              <Typography sx={labelSx}>
                House No.&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>
              <Box ref={fieldRefs.house_no}>
                <TextField fullWidth size="small" value={houseNo}
                  onChange={(e) => {
                    if (/^[a-zA-Z0-9- ]*$/.test(e.target.value)) {
                      setHouseNo(e.target.value); clearError("house_no");
                    }
                  }}
                  inputProps={{ maxLength: 7 }}
                  error={!!fieldErrors.house_no}
                  helperText={fieldErrors.house_no || ""}
                  placeholder="Enter house no."
                  sx={textFieldSx}
                />
              </Box>

              <Typography sx={labelSx}>
                Building Name&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>
              <Box ref={fieldRefs.building_name}>
                <TextField fullWidth size="small" value={buildingName}
                  onChange={(e) => {
                    // Only alphabets, numbers and spaces allowed
                    if (/^[a-zA-Z0-9 ]*$/.test(e.target.value)) {
                      setBuildingName(e.target.value);
                      clearError("building_name");
                    }
                  }}
                  error={!!fieldErrors.building_name}
                  helperText={fieldErrors.building_name || "Only letters and numbers allowed"}
                  placeholder="Enter building name"
                  sx={textFieldSx}
                />
              </Box>

              <Typography sx={labelSx}>Floor</Typography>
              <TextField fullWidth size="small" value={floor}
                onChange={(e) => {
                  if (/^[a-zA-Z0-9+\-/#@]*$/.test(e.target.value)) setFloor(e.target.value);
                }}
                inputProps={{ maxLength: 3 }}
                placeholder="Enter floor no. (optional)"
                sx={textFieldSx}
              />

              <Typography sx={labelSx}>
                Street / Locality&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>
              <Box ref={fieldRefs.street_locality}>
                <TextField fullWidth size="small" value={street}
                  onChange={(e) => { setStreet(e.target.value); clearError("street_locality"); }}
                  error={!!fieldErrors.street_locality}
                  helperText={fieldErrors.street_locality || ""}
                  placeholder="Enter street / locality"
                  sx={textFieldSx}
                />
              </Box>

              <Typography sx={labelSx}>
                Landmark&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>
              <Box ref={fieldRefs.landmark}>
                <TextField fullWidth size="small" value={landmark}
                  onChange={(e) => { setLandmark(e.target.value); clearError("landmark"); }}
                  error={!!fieldErrors.landmark}
                  helperText={fieldErrors.landmark || ""}
                  placeholder="Enter nearby landmark"
                  sx={textFieldSx}
                />
              </Box>

              <Typography sx={labelSx}>
                Sender Name&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>
              <Box ref={fieldRefs.sender_name}>
                <TextField fullWidth size="small" value={senderName}
                  onChange={(e) => {
                    if (/^[A-Za-z\s]*$/.test(e.target.value)) {
                      setSenderName(e.target.value); clearError("sender_name");
                    }
                  }}
                  inputProps={{ maxLength: 50 }}
                  error={!!fieldErrors.sender_name}
                  helperText={fieldErrors.sender_name || ""}
                  placeholder="Enter sender name"
                  sx={textFieldSx}
                />
              </Box>

              <Typography sx={labelSx}>
                Sender Contact Number&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>
              <Box ref={fieldRefs.sender_contact_no}>
                <TextField fullWidth size="small" value={senderPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    if (val.startsWith("0")) return;
                    setSenderPhone(val);
                    clearError("sender_contact_no");
                  }}
                  error={!!fieldErrors.sender_contact_no}
                  helperText={fieldErrors.sender_contact_no || ""}
                  placeholder="Enter 10-digit number"
                  inputProps={{ inputMode: "numeric", maxLength: 10 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography fontWeight={500} color="text.primary" fontSize="12px">+91</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ ...textFieldSx, mb: 3 }}
                />
              </Box>

              <Button fullWidth onClick={handleConfirm}
                endIcon={<KeyboardArrowRightIcon />}
                sx={{
                  backgroundColor: "#1f8f4a", color: "#fff",
                  textTransform: "none", fontWeight: 600,
                  fontSize: "16px", borderRadius: "10px", height: "52px",
                  "&:hover": { backgroundColor: "#187a3e" },
                }}>
                Confirm & Continue
              </Button>
            </Card>
          </Grid>

          {/* RIGHT MAP */}
          <Grid item sx={{ width: "50%" }}>
            <Box sx={{
              width: "100%", height: "100%", borderRadius: "16px",
              border: "1px solid #e0e0e0", overflow: "hidden",
              display: "flex", flexDirection: "column", background: "#fff",
            }}>
              <Box sx={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", px: 2, py: 1.5,
                borderBottom: "1px solid #eee",
              }}>
                <Typography fontWeight={600} fontSize="16px">Pickup Location</Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <PickupLocationSelector
                  value={location}
                  height="100%"
                  searchText={searchText}
                  setSearchText={(val) => {
                    setSearchText(val);
                    clearError("pickup_location");
                  }}
                  onChange={(loc) => {
                    setLocation((prev) => ({ ...prev, ...loc }));
                    clearError("pickup_location");
                  }}
                  locating={locating}
                />
              </Box>
            </Box>
          </Grid>

        </Grid>
      </Card>
    </Box>
  );
};

export default PickUpForm;