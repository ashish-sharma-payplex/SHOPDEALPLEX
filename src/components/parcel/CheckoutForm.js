import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  Divider,
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import styles from "styles/Parcel.module.css";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FlipIcon from "@mui/icons-material/Flip";
import useBookParcel from "api-manage/hooks/react-query/percel/useBookParcel";
import useVehicleRecommendations from "api-manage/hooks/react-query/percel/useVehicleRecommendations";
import toast, { Toaster } from "react-hot-toast";

// ─── Shared styles ─────────────────────────────────────────────────────────
const bodyTextSx = { fontSize: "13px", fontFamily: "Inter", color: "#374151" };

const IMAGE_BASE_URL = "https://dealplex.in/storage/";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${IMAGE_BASE_URL}${path}`;
};

const PAYMENT_MODES = [
  { label: "Cash", value: "COD", emoji: "💵" },
  { label: "Online", value: "Online", emoji: "💳" },
];

// ─── Vehicle Image with Toggle ──────────────────────────────────────────────
const VehicleImageToggle = ({ vehicle, size = "large" }) => {
  const [showDimensional, setShowDimensional] = useState(false);

  const imgSize =
    size === "large" ? { width: 110, height: 100 } : { width: 70, height: 60 };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (vehicle.dimentional_image) {
      setShowDimensional((prev) => !prev);
    }
  };

  const currentSrc = showDimensional
    ? getImageUrl(vehicle.dimentional_image)
    : getImageUrl(vehicle.display_image);

  return (
    <Box
      sx={{
        position: "relative",
        cursor: vehicle.dimentional_image ? "zoom-in" : "default",
        flexShrink: 0,
      }}
      onClick={handleToggle}
    >
      <Box
        component="img"
        src={currentSrc}
        alt={vehicle.vehicle_name}
        sx={{
          ...imgSize,
          objectFit: "contain",
          display: "block",
          transition: "opacity 0.2s ease",
        }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
      {/* {vehicle.dimentional_image && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            background: "rgba(0,0,0,0.45)",
            color: "#fff",
            fontSize: "8px",
            fontFamily: "Inter",
            px: 0.6,
            py: 0.25,
            borderRadius: "3px",
            lineHeight: 1.4,
          }}
        >
          {showDimensional ? "← back" : "dims"}
        </Box>
      )} */}
    </Box>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const CheckoutForm = ({
  parcelData,
  onEditParcel,
  onEditPickup,
  onEditDrop,
  onBookingSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_MODES[0]);
  const [isChecked, setIsChecked] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePaymentOpen = (e) => setAnchorEl(e.currentTarget);
  const handlePaymentClose = () => setAnchorEl(null);
  const handlePaymentSelect = (mode) => {
    setSelectedPayment(mode);
    handlePaymentClose();
  };

  const { data: vehicleData, isLoading: vehicleLoading } =
    useVehicleRecommendations(parcelData);
  const recommendedVehicle = vehicleData?.data?.recommended_vehicle || null;
  const otherVehicles = vehicleData?.data?.remaining_vehicles || [];

  React.useEffect(() => {
    if (recommendedVehicle?.vehicle_id && selectedVehicleId === null) {
      setSelectedVehicleId(recommendedVehicle.vehicle_id);
    }
  }, [recommendedVehicle]);

  const allVehicles = recommendedVehicle
    ? [recommendedVehicle, ...otherVehicles]
    : otherVehicles;
  const selectedVehicle =
    allVehicles.find((v) => v.vehicle_id === selectedVehicleId) ||
    recommendedVehicle;
  const totalCost = selectedVehicle?.estimated_fare || 0;
  const lodingTime = selectedVehicle?.loding_unloding_time || "30";

  const { mutate: bookParcelApi, isLoading: bookingLoading } = useBookParcel();

  const buildFinalPayload = () => ({
    ...parcelData,
    vehicle_id: selectedVehicle?.vehicle_id || 1,
    total_cost: selectedVehicle?.estimated_fare || 0,
    fare_breakdown: {
      base_fare: selectedVehicle?.estimated_fare || 0,
      distance_fare: 0,
      tax: 0,
    },
    payment_mode: selectedPayment.value.toLowerCase(),
    loding_unloading_time: lodingTime,
    terms_condition: "Yes",
  });

  const handleConfirmBooking = () => {
    if (!isChecked) {
      toast.error("Please accept Terms & Conditions");
      return;
    }
    bookParcelApi(buildFinalPayload(), {
      onSuccess: (data) => onBookingSuccess(data),
    });
  };

  // ─── Reusable: Expanded (Recommended-style) Card ─────────────────────────
  const renderExpandedCard = (vehicle, isRecommended = false) => {
    const isSelected = selectedVehicleId === vehicle.vehicle_id;
    return (
      <Card
        key={vehicle.vehicle_id}
        onClick={() => setSelectedVehicleId(vehicle.vehicle_id)}
        className={isDark ? styles.innerCardDark : undefined}
        sx={{
          cursor: "pointer",
          // border: isSelected ? "2px solid #16a34a" : "1px solid #e5e7eb",
          // boxShadow: isSelected ? "0 0 0 3px rgba(22,163,74,0.09)" : "none",
          boxShadow: "none",
          transition: "all 0.2s ease",
          p: 2,
          borderRadius: "16px !important",
          mb: isRecommended ? 3 : 1.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          background: isDark
            ? isSelected
              ? "linear-gradient(90deg, rgba(52,164,44,0.16) 0%, rgba(52,164,44,0.10) 60%, #1f2937 100%)"
              : undefined
            : isSelected
            ? "linear-gradient(90deg, #f0fdf4 0%, #f0fdf4 60%, #ffffff 100%)"
            : "#fff",
        }}
      >
        {/* {isRecommended && (
          <Box
            sx={{
              alignSelf: "flex-start",
              fontSize: "11px",
              fontWeight: 500,
              color: "#15803d",
              background: "#dcfce7",
              borderRadius: "6px",
              px: 1,
              py: 0.4,
              fontFamily: "Inter",
            }}
          >
            ⭐ Recommended
          </Box>
        )} */}
        <VehicleImageToggle vehicle={vehicle} size="large" />
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "14px",
            color: isDark ? "#e8eaec" : "#1f2937",
            fontFamily: "Inter",
          }}
        >
          {vehicle.vehicle_name}
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          sx={{ px: 0.5 }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              color: isDark ? "#a0aec0" : "#6b7280",
              fontFamily: "Inter",
            }}
          >
            {vehicle.vehicle_weight_capacity}
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "16px",
              color: isDark ? "#3bb77e" : "#374151",
              fontFamily: "Inter",
            }}
          >
            ₹{vehicle.estimated_fare}
          </Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          gap={0.5}
          alignSelf="flex-start"
        >
          <AccessTimeIcon
            sx={{ fontSize: 13, color: isDark ? "#a0aec0" : "#6b7280" }}
          />
          <Typography
            sx={{
              fontSize: "12px",
              color: isDark ? "#a0aec0" : "#6b7280",
              fontFamily: "Inter",
            }}
          >
            {vehicle.loding_unloding_time} min loading time
          </Typography>
        </Box>
      </Card>
    );
  };

  // ─── Reusable: Compact (row-style) Card ──────────────────────────────────
  const renderCompactCard = (vehicle) => {
    const isSelected = selectedVehicleId === vehicle.vehicle_id;
    return (
      <Card
        key={vehicle.vehicle_id}
        onClick={() => setSelectedVehicleId(vehicle.vehicle_id)}
        className={isDark ? styles.innerCardDark : undefined}
        sx={{
          cursor: "pointer",
          // border: isSelected ? "2px solid #16a34a" : "1px solid #e5e7eb",
          boxShadow: isSelected ? "0 0 0 3px rgba(22,163,74,0.09)" : "none",
          transition: "all 0.2s ease",
          p: 1.5,
          borderRadius: "12px !important",
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // background: isSelected ? "#f0fdf4" : "#fff",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <VehicleImageToggle vehicle={vehicle} size="small" />
          <Box>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: "13px",
                fontFamily: "Inter",
                color: isDark ? "#e8eaec" : undefined,
              }}
            >
              {vehicle.vehicle_name}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: isDark ? "#a0aec0" : "#6b7280",
                fontFamily: "Inter",
              }}
            >
              {vehicle.vehicle_weight_capacity}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5} mt={0.3}>
              <AccessTimeIcon
                sx={{ fontSize: 12, color: isDark ? "#8b95a5" : "#9ca3af" }}
              />
              <Typography
                sx={{
                  fontSize: "11px",
                  color: isDark ? "#8b95a5" : "#9ca3af",
                  fontFamily: "Inter",
                }}
              >
                {vehicle.loding_unloding_time} min
              </Typography>
            </Box>
          </Box>
        </Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "14px",
            fontFamily: "Inter",
            color: isDark ? "#3bb77e" : undefined,
          }}
        >
          ₹{vehicle.estimated_fare}
        </Typography>
      </Card>
    );
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Box
        className={isDark ? styles.pageDark : undefined}
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Card
          elevation={0}
          className={isDark ? styles.cardDark : undefined}
          sx={{
            p: 2,
            borderRadius: 3,
            boxShadow: "none",
            border: "none",
            width: "100%",
            maxWidth: 1100,
          }}
        >
          <Grid container spacing={4} wrap="nowrap">
            {/* ═══ LEFT ═══ */}
            <Grid item sx={{ width: "62%" }}>
              <Card
                variant="outlined"
                className={
                  isDark
                    ? `${styles.innerCardDark} ${styles.inputsDark}`
                    : undefined
                }
                sx={{ p: 3, borderRadius: "16px !important" }}
              >
                {/* Parcel Info */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "18px",
                      fontFamily: "Inter",
                      color: "#0f0f0f",
                    }}
                  >
                    Parcel Information
                  </Typography>
                  <Typography
                    onClick={onEditParcel}
                    sx={{
                      color: "#1f8f4a",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500,
                      fontFamily: "Inter",
                    }}
                  >
                    Change
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  flexWrap="wrap"
                  mb={1.5}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#132235",
                      fontFamily: "Inter",
                    }}
                  >
                    {parcelData?.category_name || "Parcel"}
                  </Typography>
                  {parcelData?.fragile_items === "Yes" && (
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "#9ca3af",
                        fontWeight: 500,
                        fontFamily: "Inter",
                      }}
                    >
                      (Fragile)
                    </Typography>
                  )}
                </Box>

                {/* Loading time banner */}
                <Box
                  sx={{
                    fontFamily: "Inter",
                    mt: 1,
                    px: 2,
                    py: 1.3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderRadius: "4px",
                    background:
                      "linear-gradient(to right, #d8f5e5, rgba(216,245,229,0))",
                  }}
                >
                  <AccessTimeIcon
                    sx={{ fontSize: 18, color: "#1f8f4a", flexShrink: 0 }}
                  />
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "#1a1a1a",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                      fontFamily: "Inter",
                    }}
                  >
                    Free <strong>{lodingTime} min</strong> of loading-unloading
                    time included.
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Address Details */}
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "18px",
                    fontFamily: "Inter",
                    color: "#0f0f0f",
                    mb: 2,
                  }}
                >
                  Address Details
                </Typography>
                <Box position="relative">
                  <Box
                    sx={{
                      position: "absolute",
                      left: "6px",
                      top: "18px",
                      height: "110px",
                      borderLeft: "2px dashed #e0e0e0",
                    }}
                  />
                  {/* Pickup */}
                  <Box display="flex" gap={2} mb={3}>
                    <Box sx={{ position: "relative", width: 20 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: "#1f8f4a",
                          borderRadius: "50%",
                          position: "absolute",
                          top: "6px",
                          left: 0,
                          boxShadow: "0 0 0 4px #e6f4ea",
                        }}
                      />
                    </Box>
                    <Box flex={1}>
                      <Typography
                        sx={{
                          color: "#1f8f4a",
                          fontSize: "12px",
                          fontWeight: 500,
                          mb: 0.3,
                          fontFamily: "Inter",
                        }}
                      >
                        Pickup
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "13px",
                            fontFamily: "Inter",
                          }}
                        >
                          {parcelData?.sender_name} •{" "}
                          {parcelData?.sender_contact_no}
                        </Typography>
                        <Typography
                          onClick={onEditPickup}
                          sx={{
                            color: "#1f8f4a",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 500,
                            fontFamily: "Inter",
                          }}
                        >
                          Edit
                        </Typography>
                      </Box>
                      <Typography sx={{ ...bodyTextSx, mt: 0.3 }}>
                        {parcelData?.pickup_houseno_buildingname},{" "}
                        {parcelData?.pickup_street_locality}
                      </Typography>
                      <Typography sx={bodyTextSx}>
                        {parcelData?.pickup_location}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Drop */}
                  <Box display="flex" gap={2}>
                    <Box sx={{ position: "relative", width: 20 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: "#e53935",
                          borderRadius: "50%",
                          position: "absolute",
                          top: "6px",
                          left: 0,
                          boxShadow: "0 0 0 4px #fdecea",
                        }}
                      />
                    </Box>
                    <Box flex={1}>
                      <Typography
                        sx={{
                          color: "#e53935",
                          fontSize: "12px",
                          fontWeight: 500,
                          mb: 0.3,
                          fontFamily: "Inter",
                        }}
                      >
                        Drop off
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "13px",
                            fontFamily: "Inter",
                          }}
                        >
                          {parcelData?.receiver_name} •{" "}
                          {parcelData?.receiver_contact_no}
                        </Typography>
                        <Typography
                          onClick={onEditDrop}
                          sx={{
                            color: "#1f8f4a",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 500,
                            fontFamily: "Inter",
                          }}
                        >
                          Edit
                        </Typography>
                      </Box>
                      <Typography sx={{ ...bodyTextSx, mt: 0.3 }}>
                        {parcelData?.drop_houseno_buildingname},{" "}
                        {parcelData?.drop_street_locality}
                      </Typography>
                      <Typography sx={bodyTextSx}>
                        {parcelData?.drop_location}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Fare Breakdown */}
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "18px",
                    fontFamily: "Inter",
                    color: isDark ? "#e8eaec" : "#0f0f0f",
                  }}
                >
                  Fare Breakdown
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography
                    sx={{
                      ...bodyTextSx,
                      color: isDark ? "#a0aec0" : bodyTextSx.color,
                    }}
                  >
                    Estimated Fare
                  </Typography>
                  <Typography
                    sx={{
                      ...bodyTextSx,
                      color: isDark ? "#a0aec0" : bodyTextSx.color,
                    }}
                  >
                    ₹{selectedVehicle?.estimated_fare || 0}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "14px",
                      fontFamily: "Inter",
                      color: isDark ? "#e8eaec" : undefined,
                    }}
                  >
                    Amount to Pay
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "14px",
                      fontFamily: "Inter",
                      color: isDark ? "#3bb77e" : undefined,
                    }}
                  >
                    ₹{totalCost}
                  </Typography>
                </Box>

                {/* T&C */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                      sx={{
                        color: isDark ? "#4b5563" : "#d1d5db",
                        "&.Mui-checked": { color: "#1f8f4a" },
                        borderRadius: "4px",
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontFamily: "Inter",
                        color: isDark ? "#a0aec0" : "#374151",
                      }}
                    >
                      I agree to the{" "}
                      <span
                        style={{
                          color: "#1f8f4a",
                          textDecoration: "underline",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Terms &amp; Conditions
                      </span>
                    </Typography>
                  }
                  sx={{ mb: 0, alignItems: "center" }}
                />

                {/* Payment Method */}
                <Box
                  className={isDark ? styles.sectionBoxDark : undefined}
                  sx={{
                    mt: 2,
                    px: 2,
                    py: 1.5,
                    borderRadius: "12px",
                    border: isDark ? undefined : "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: isDark ? undefined : "#fff",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "10px",
                        backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                      }}
                    >
                      {selectedPayment.emoji}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "13px",
                          fontFamily: "Inter",
                          color: "#111827",
                        }}
                      >
                        Payment Method
                      </Typography>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={0.3}
                        onClick={handlePaymentOpen}
                        sx={{ cursor: "pointer" }}
                      >
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#6b7280",
                            fontFamily: "Inter",
                          }}
                        >
                          {selectedPayment.label}
                        </Typography>
                        <KeyboardArrowDownIcon
                          sx={{ fontSize: 16, color: "#6b7280" }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "18px",
                      fontFamily: "Inter",
                      color: "#111827",
                    }}
                  >
                    ₹{totalCost}
                  </Typography>
                </Box>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handlePaymentClose}
                  PaperProps={{
                    sx: {
                      borderRadius: "10px",
                      minWidth: 160,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {PAYMENT_MODES.map((mode) => (
                    <MenuItem
                      key={mode.value}
                      onClick={() => handlePaymentSelect(mode)}
                      selected={selectedPayment.value === mode.value}
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "13px",
                        gap: 1.5,
                        "&.Mui-selected": {
                          backgroundColor: "#f0fdf4",
                          color: "#1f8f4a",
                        },
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>{mode.emoji}</span>
                      {mode.label}
                    </MenuItem>
                  ))}
                </Menu>

                <Button
                  fullWidth
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  endIcon={<KeyboardArrowRightIcon />}
                  sx={{
                    mt: 3,
                    backgroundColor: "#1f8f4a",
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "16px",
                    borderRadius: "10px",
                    height: "52px",
                    "&:hover": { backgroundColor: "#187a3e" },
                    fontFamily: "Inter",
                  }}
                >
                  {bookingLoading ? "Processing..." : "Confirm Booking"}
                </Button>
              </Card>
            </Grid>

            {/* ═══ RIGHT — Vehicle Selection ═══ */}
            <Grid item sx={{ width: "45%", fontFamily: "Inter" }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "18px",
                  fontFamily: "Inter",
                  color: "#0f0f0f",
                  mb: 2,
                }}
              >
                Recommended Vehicle
              </Typography>

              {vehicleLoading ? (
                <Typography sx={bodyTextSx}>Loading vehicles...</Typography>
              ) : (
                <>
                  {/* Recommended Vehicle */}
                  {recommendedVehicle && (
                    <>
                      {/* If recommended IS selected → show expanded; else show compact */}
                      {selectedVehicleId === recommendedVehicle.vehicle_id
                        ? renderExpandedCard(recommendedVehicle, true)
                        : renderCompactCard(recommendedVehicle)}
                    </>
                  )}

                  {/* Other Vehicles */}
                  {otherVehicles.length > 0 && (
                    <>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "18px",
                          fontFamily: "Inter",
                          color: "#0f0f0f",
                          mb: 2,
                        }}
                      >
                        Others
                      </Typography>
                      {otherVehicles.map((vehicle) =>
                        selectedVehicleId === vehicle.vehicle_id
                          ? renderExpandedCard(vehicle, false)
                          : renderCompactCard(vehicle),
                      )}
                    </>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </Card>
      </Box>
    </>
  );
};

export default CheckoutForm;
