import React, { useEffect, useState } from "react";
import {
  Box, Card, Typography, TextField, Button,
  Grid, InputAdornment, IconButton, CircularProgress,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PickupLocationSelector from "./PickupLocationSelector";
import toast from "react-hot-toast";
import { DROP_RAW_KEY } from "./MainForm";

const labelSx = { fontWeight: 500, mb: 0.5, ml: 0.5, fontSize: "14px" };
const textFieldSx = {
  mb: 1.5,
  "& .MuiInputBase-root": { height: 32 },
  "& .MuiInputBase-input": { padding: "6px 10px", fontSize: "12px" },
};

const readDropRaw = () => {
  try {
    return JSON.parse(localStorage.getItem(DROP_RAW_KEY) || "null") || {};
  } catch {
    return {};
  }
};

const DropForm = ({ onNext, onBack, parcelData }) => {
  const [initRaw] = useState(readDropRaw);

  const [buildingName,  setBuildingName]  = useState(initRaw.buildingName  || "");
  const [houseNo,       setHouseNo]       = useState(initRaw.houseNo       || "");
  const [street,        setStreet]        = useState(initRaw.street        || "");
  const [landmark,      setLandmark]      = useState(initRaw.landmark      || "");
  const [receiverName,  setReceiverName]  = useState(initRaw.receiverName  || "");
  const [receiverPhone, setReceiverPhone] = useState(initRaw.receiverPhone || "");
  const [floor,         setFloor]         = useState(initRaw.floor         || "");
  const [fieldErrors,   setFieldErrors]   = useState({});
  const [locating,      setLocating]      = useState(false);
  const [sameAsSender, setSameAsSender] = useState(() => {
  if (!initRaw.sameAsSender) return false;
  const storedPhone = initRaw.receiverPhone || "";
  try {
    const session = JSON.parse(localStorage.getItem("parcel_booking_session") || "{}");
    const senderPhone = session?.mergedData?.sender_contact_no || "";
    return storedPhone === senderPhone && storedPhone !== "";
  } catch {
    return false;
  }
});
  const [location,      setLocation]      = useState(
    initRaw.location || { lat: "", lng: "", address: "" }
  );
  const [searchText, setSearchText] = useState(initRaw.location?.address || "");

 useEffect(() => {
  try {
    localStorage.setItem(DROP_RAW_KEY, JSON.stringify({
      buildingName, houseNo, street, landmark,
      receiverName, receiverPhone, floor, location,
      sameAsSender,  // ← add karo
    }));
  } catch {}
}, [buildingName, houseNo, street, landmark, receiverName, receiverPhone, floor, location, sameAsSender]);

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

  const handleSameAsSender = (checked) => {
    setSameAsSender(checked);
    if (checked) {
      setReceiverName(parcelData?.sender_name || "");
      setReceiverPhone(parcelData?.sender_contact_no || "");
      clearError("receiver_name");
      clearError("receiver_contact_no");
    } else {
      setReceiverName("");
      setReceiverPhone("");
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
            clearError("drop_location");
          }
          setLocating(false);
        });
      },
      () => setLocating(false)
    );
  };

  const handleConfirm = () => {
  //   console.log("🔍 DEBUG:", {
  //   sameAsSender,
  //   receiverPhone,
  //   senderPhone: parcelData?.sender_contact_no,
  //   match: receiverPhone === parcelData?.sender_contact_no,
  // });
    const errors = {};
    if (!location.address)    errors.drop_location      = "Drop location is required";
    if (!houseNo.trim())      errors.house_no           = "House No. is required";
    if (!buildingName.trim()) errors.building_name      = "Building name is required";
    if (!street.trim())       errors.street_locality    = "Street is required";
    if (!landmark.trim())     errors.landmark           = "Landmark is required";
    if (!receiverName.trim()) errors.receiver_name      = "Receiver name is required";
    if (!receiverPhone.trim()) {
      errors.receiver_contact_no = "Phone is required";
    } else if (receiverPhone.length < 10) {
      errors.receiver_contact_no = "Enter valid 10-digit number";
    }

    if (location.address && parcelData?.pickup_location &&
      location.address === parcelData.pickup_location) {
      errors.drop_location = "Drop location cannot be same as pickup location";
    }

    // if (receiverPhone && parcelData?.sender_contact_no &&
    //   receiverPhone === parcelData.sender_contact_no) {
    //   errors.receiver_contact_no = "Receiver number cannot be same as sender number";
    // }
    if (!sameAsSender && receiverPhone && parcelData?.sender_contact_no &&
  receiverPhone === parcelData.sender_contact_no) {
  errors.receiver_contact_no = "Receiver number cannot be same as sender number";
}

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error(Object.values(errors)[0]);
      return;
    }

    const dropPayload = {
      drop_location:             location.address,
      drop_houseno_buildingname: `${houseNo}, ${buildingName}`,
      drop_floor:                floor,
      drop_street_locality:      street,
      drop_landmark:             landmark,
      receiver_name:             receiverName,
      receiver_contact_no:       receiverPhone,
      drop_latitude:             String(location.lat  || ""),
      drop_longitude:            String(location.lng  || ""),
    };

    const mergedPayload = { ...parcelData, ...dropPayload };
    toast.success("Drop details saved successfully!");
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
                Drop Location&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                fullWidth size="small"
                value={searchText}
                error={!!fieldErrors.drop_location}
                helperText={fieldErrors.drop_location || "Use the map on right to search & select drop location"}
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
              <TextField fullWidth size="small" value={houseNo}
                onChange={(e) => {
                  if (/^[a-zA-Z0-9- ]*$/.test(e.target.value)) {
                    setHouseNo(e.target.value); clearError("house_no");
                  }
                }}
                inputProps={{ maxLength: 10 }}
                error={!!fieldErrors.house_no}
                helperText={fieldErrors.house_no || ""}
                placeholder="Enter house no."
                sx={textFieldSx}
              />

              <Typography sx={labelSx}>
                Building Name&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField fullWidth size="small" value={buildingName}
                onChange={(e) => { setBuildingName(e.target.value); clearError("building_name"); }}
                error={!!fieldErrors.building_name}
                helperText={fieldErrors.building_name || ""}
                placeholder="Enter building name"
                sx={textFieldSx}
              />

              <Typography sx={labelSx}>Floor</Typography>
              <TextField fullWidth size="small" value={floor}
                onChange={(e) => {
                  if (/^[a-zA-Z0-9+\-/#@ ]*$/.test(e.target.value)) setFloor(e.target.value);
                }}
                inputProps={{ maxLength: 10 }}
                placeholder="Enter floor no. (optional)"
                sx={textFieldSx}
              />

              <Typography sx={labelSx}>
                Street / Locality&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField fullWidth size="small" value={street}
                onChange={(e) => { setStreet(e.target.value); clearError("street_locality"); }}
                error={!!fieldErrors.street_locality}
                helperText={fieldErrors.street_locality || ""}
                placeholder="Enter street / locality"
                sx={textFieldSx}
              />

              <Typography sx={labelSx}>
                Landmark&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField fullWidth size="small" value={landmark}
                onChange={(e) => { setLandmark(e.target.value); clearError("landmark"); }}
                error={!!fieldErrors.landmark}
                helperText={fieldErrors.landmark || ""}
                placeholder="Enter nearby landmark"
                sx={textFieldSx}
              />

              <Typography sx={labelSx}>
                Receiver Name&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField fullWidth size="small" value={receiverName}
                onChange={(e) => {
                  if (/^[A-Za-z\s]*$/.test(e.target.value)) {
                    setReceiverName(e.target.value);
                    clearError("receiver_name");
                    if (sameAsSender) setSameAsSender(false);
                  }
                }}
                inputProps={{ maxLength: 50 }}
                error={!!fieldErrors.receiver_name}
                helperText={fieldErrors.receiver_name || ""}
                placeholder="Enter receiver name"
                sx={textFieldSx}
              />

              <Typography sx={labelSx}>
                Receiver Contact Number&nbsp;<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField fullWidth size="small" value={receiverPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setReceiverPhone(val);
                  clearError("receiver_contact_no");
                  if (sameAsSender) setSameAsSender(false);
                }}
                error={!!fieldErrors.receiver_contact_no}
                helperText={fieldErrors.receiver_contact_no || ""}
                placeholder="Enter 10-digit number"
                inputProps={{ inputMode: "numeric", maxLength: 10 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography fontWeight={500} color="text.primary" fontSize="12px">+91</Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{ ...textFieldSx, mb: 2 }}
              />

              {/* ── Same as Sender Checkbox ── */}
              <Box
                onClick={() => handleSameAsSender(!sameAsSender)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: "4px",
                    border: `2px solid ${sameAsSender ? "#1f8f4a" : "#9ca3af"}`,
                    background: sameAsSender ? "#1f8f4a" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                >
                  {sameAsSender && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <polyline
                        points="2,6 5,9 10,3"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Box>
                <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                  Same as sender details?
                </Typography>
                {/* {sameAsSender && parcelData?.sender_name && (
                  <Typography sx={{ fontSize: "12px", color: "#1f8f4a", ml: 1, fontWeight: 600 }}>
                    {parcelData.sender_name}
                  </Typography>
                )} */}
              </Box>

              <Button fullWidth onClick={handleConfirm}
                endIcon={<KeyboardArrowRightIcon />}
                sx={{
                  backgroundColor: "#1f8f4a", color: "#fff",
                  textTransform: "none", fontWeight: 600,
                  fontSize: "16px", borderRadius: "10px", height: "52px", mb: 2,
                  "&:hover": { backgroundColor: "#187a3e" },
                }}>
                Confirm & Continue
              </Button>

              <Typography onClick={onBack}
                sx={{
                  textAlign: "center", cursor: "pointer",
                  fontSize: "14px", color: "#1f8f4a", fontWeight: 500,
                }}>
                Edit Pickup Information ?
              </Typography>
            </Card>
          </Grid>

          {/* RIGHT MAP */}
          <Grid item sx={{ width: "50%" }}>
            <Box sx={{
              width: "100%", height: "100%", minHeight: "500px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Box sx={{
                width: "100%", height: "100%", borderRadius: "16px",
                border: "1px solid #e0e0e0", overflow: "hidden",
                display: "flex", flexDirection: "column", background: "#fff",
              }}>
                <Box sx={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", px: 2, py: 1.5,
                  borderBottom: "1px solid #eee", background: "#fff",
                }}>
                  <Typography fontWeight={600} fontSize="16px">Drop Location</Typography>
                </Box>
                <Box sx={{ flex: 1, overflow: "hidden" }}>
                  <PickupLocationSelector
                    value={location}
                    height="100%"
                    searchText={searchText}
                    setSearchText={(val) => {
                      setSearchText(val);
                      clearError("drop_location");
                    }}
                    label="Drop"
                    onChange={(loc) => {
                      setLocation((prev) => ({ ...prev, ...loc }));
                      clearError("drop_location");
                    }}
                    locating={locating}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>

        </Grid>
      </Card>
    </Box>
  );
};

export default DropForm;