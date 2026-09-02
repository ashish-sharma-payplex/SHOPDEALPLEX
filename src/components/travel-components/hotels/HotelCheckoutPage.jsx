  // src\components\hotel\HotelCheckoutPage.jsx
  import React, { useState, useEffect } from "react";
  import { useLocation, useNavigate } from "react-router-dom";
  import {
    Box,
    Typography,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    MenuItem,
    Select,
    useMediaQuery,
    useTheme,
    Divider,
    CircularProgress,
  } from "@mui/material";
  import toast, { Toaster } from "react-hot-toast";
  import StarIcon from "@mui/icons-material/Star";
  import StarBorderIcon from "@mui/icons-material/StarBorder";
  import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
  import SquareFootIcon from "@mui/icons-material/SquareFoot";
  import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";
  import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
  import WindowIcon from "@mui/icons-material/Window";
  import CheckIcon from "@mui/icons-material/Check";
  import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
  import ArrowBackIcon from "@mui/icons-material/ArrowBack";
  import { hotelFetch } from "travel-api/hotelApi";
  import useBookingPersist from "components/travel-hooks/useBookingPersist";
  import useTravelAuthGuard from "components/travel-hooks/useTravelAuthGuard";

  const GREEN = "#16a34a";
  const BORDER = "#e5e7eb";
  const LIGHT_BG = "#f4f6f8";
  const CARD_BG = "#ffffff";
  const TEXT_DARK = "#111827";
  const TEXT_MID = "#374151";
  const TEXT_LIGHT = "#6b7280";
  const ERROR_COLOR = "#dc2626";
  const FONT = "'DM Sans', sans-serif";

  const FIELD_HEIGHT = 44;

  const SALUTATION_TO_TITLE = {
    "Mr.": "Mr",
    "Mrs.": "Mrs",
    "Miss.": "Miss",
  };

  // ─── Validation helpers ───────────────────────
  const validateFirstName = (value) => {
    if (!value || !value.trim()) return "First name is required";
    if (/^\s/.test(value)) return "Cannot start with a space";
    if (!/^[a-zA-Z][a-zA-Z\s]*$/.test(value)) return "Only alphabets are allowed";
    return "";
  };

  const validateLastName = (value) => {
    if (!value || !value.trim()) return "Last name is required";
    if (/^\s/.test(value)) return "Cannot start with a space";
    if (!/^[a-zA-Z][a-zA-Z\s]*$/.test(value)) return "Only alphabets are allowed";
    return "";
  };

  const validateEmail = (value) => {
    if (!value || !value.trim()) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value.trim())) return "Enter a valid email address";
    return "";
  };

  const validateMobile = (value) => {
    if (!value || !value.trim()) return "Mobile number is required";
    if (!/^\d{10}$/.test(value.trim()))
      return "Enter a valid 10-digit mobile number";
    return "";
  };

  // ─── Sub-components ───────────────────────────
  const FieldLabel = ({ children }) => (
    <Typography
      sx={{
        fontSize: 12,
        color: TEXT_LIGHT,
        fontWeight: 500,
        mb: 0.6,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {children}
    </Typography>
  );

  const FieldError = ({ message }) =>
    message ? (
      <Typography
        sx={{
          fontSize: 11.5,
          color: ERROR_COLOR,
          mt: 0.5,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>
    ) : null;

  const getInputSx = (hasError) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "#fff",

      "& fieldset": {
        borderColor: hasError ? ERROR_COLOR : "#D9DEE7",
        borderWidth: "1px",
      },

      "&:hover fieldset": {
        borderColor: hasError ? ERROR_COLOR : "#A7B0BE",
      },

      "&.Mui-focused fieldset": {
        borderColor: GREEN,
        borderWidth: "1.5px",
      },
    },

    // ⬇ FIX: was 16px top/bottom padding + fontSize 18, which forced the
    // box taller than the fixed 45px root height and left a big visual
    // gap between the label and the field. Compact padding matches Figma.
    "& .MuiInputBase-input": {
      padding: "10.5px 6px",
      fontSize: 15,
      fontFamily: "Inter, sans-serif",
      color: "#111827",
    },

    "& .MuiInputLabel-root": {
      backgroundColor: "#fff",
      padding: "0 6px",
      fontSize: 13,
      color: "#6B7280",
      fontFamily: "Inter, sans-serif",
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: GREEN,
    },
  });

  const Stars = ({ count = 4 }) =>
    Array.from({ length: 5 }).map((_, i) =>
      i < count ? (
        <StarIcon key={i} sx={{ fontSize: 14, color: "#f5a623" }} />
      ) : (
        <StarBorderIcon key={i} sx={{ fontSize: 14, color: "#d1d5db" }} />
      ),
    );

  const InclusionChip = ({ label }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <CheckIcon sx={{ fontSize: 13, color: GREEN }} />
      <Typography
        sx={{ fontSize: 12.5, color: TEXT_MID, fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </Typography>
    </Box>
  );

  // ─── Single Passenger Form ────────────────────
  const PassengerForm = ({
    passenger,
    onChange,
    errors = {},
    onErrorChange,
    selectBaseSx,
  }) => {
    const isLead = passenger.isLead;
    const isChild = passenger.paxType === 2;

    const handleNameChange = (field, raw) => {
      const updated = { ...passenger, [field]: raw };
      onChange(updated);
      const validator =
        field === "firstName" ? validateFirstName : validateLastName;
      onErrorChange({ ...errors, [field]: validator(raw) });
    };

    const handleEmailChange = (val) => {
      onChange({ ...passenger, email: val });
      onErrorChange({ ...errors, email: validateEmail(val) });
    };

    const handleMobileChange = (raw) => {
      const digits = raw.replace(/\D/g, "").slice(0, 10);
      onChange({ ...passenger, mobile: digits });
      onErrorChange({ ...errors, mobile: validateMobile(digits) });
    };

    return (
      <Box>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {isLead && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "#dcfce7",
                color: GREEN,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                px: 1.5,
                py: 0.4,
                borderRadius: "20px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <CheckIcon sx={{ fontSize: 13, fontFamily: "Inter, sans-serif" }} />{" "}
              Lead Passenger
            </Box>
          )}
          {isChild && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "#fef9c3",
                color: "#ca8a04",
                fontSize: 12,
                fontWeight: 600,
                px: 1.5,
                py: 0.4,
                borderRadius: "20px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              🧒 Child • Age: {passenger.age} yrs
            </Box>
          )}
        </Box>

        <RadioGroup
          row
          value={passenger.salutation}
          onChange={(e) => onChange({ ...passenger, salutation: e.target.value })}
          sx={{ mb: 2, gap: { xs: 0.5, sm: 1.5 } }}
        >
          {["Mr.", "Mrs.", "Miss."].map((s) => (
            <FormControlLabel
              key={s}
              value={s}
              label={s}
              control={
                <Radio
                  size="small"
                  sx={{
                    color: BORDER,
                    "&.Mui-checked": { color: GREEN },
                    p: 0.8,
                  }}
                />
              }
              sx={{
                mr: 0,
                "& .MuiFormControlLabel-label": {
                  fontSize: 14,
                  color: TEXT_MID,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                },
              }}
            />
          ))}
        </RadioGroup>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: { xs: 1.5, sm: 2 },
            mb: { xs: 1.5, sm: 2 },
          }}
        >
          <Box>
            <TextField
              fullWidth
              label="First Name"
              value={passenger.firstName}
              onChange={(e) => handleNameChange("firstName", e.target.value)}
              variant="outlined"
              sx={getInputSx(!!errors.firstName)}
              error={!!errors.firstName}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FieldError message={errors.firstName} />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Last Name"
              value={passenger.lastName}
              onChange={(e) => handleNameChange("lastName", e.target.value)}
              variant="outlined"
              sx={getInputSx(!!errors.lastName)}
              error={!!errors.lastName}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FieldError message={errors.lastName} />
          </Box>
        </Box>

        {isLead && (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: { xs: 1.5, sm: 2 },
                mb: { xs: 1.5, sm: 2 },
              }}
            >
              <Box>
                <TextField
                  fullWidth
                  label="Email id"
                  value={passenger.email ?? ""}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  type="email"
                  variant="outlined"
                  sx={getInputSx(!!errors.email)}
                  error={!!errors.email}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <FieldError message={errors.email} />
              </Box>

              {/* Mobile Number */}
              <Box>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={passenger.mobile ?? ""}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  type="tel"
                  variant="outlined"
                  inputProps={{
                    maxLength: 10,
                    inputMode: "numeric",
                  }}
                  sx={{
                    ...getInputSx(!!errors.mobile),

                    // ⬇ FIX: prefix box shrank from "IN +91" to "+91", so the
                    // reserved left padding is trimmed down too — this closes
                    // the big visual gap that used to sit between the prefix
                    // and the first typed digit.
                    "& .MuiInputBase-input": {
                      padding: "10.5px 14px",
                      paddingLeft: "42px",
                      fontSize: 15,
                      fontFamily: "Inter, sans-serif",
                      color: "#111827",
                    },
                  }}
                  error={!!errors.mobile}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 14,
                          display: "flex",
                          alignItems: "center",
                          color: TEXT_MID,
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        +91
                      </Box>
                    ),
                  }}
                />

                <FieldError message={errors.mobile} />
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: { xs: 1.5, sm: 2 },
                mb: { xs: 1.5, sm: 2 },
              }}
            >
              <Box>
                <TextField
                  fullWidth
                  label="PAN Card (optional)"
                  value={passenger.pan ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...passenger,
                      pan: e.target.value.toUpperCase(),
                    })
                  }
                  variant="outlined"
                  inputProps={{
                    maxLength: 10,
                  }}
                  sx={getInputSx(false)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  select
                  label="Nationality"
                  value="India"
                  variant="outlined"
                  sx={getInputSx(false)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  SelectProps={{
                    IconComponent: KeyboardArrowDownIcon,
                  }}
                >
                  <MenuItem value="India">India</MenuItem>
                </TextField>
              </Box>
            </Box>
          </>
        )}
      </Box>
    );
  };

  // ─── Date helpers ─────────────────────────────
  function fmtDay(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
  }
  function fmtDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  }
  function calcNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 1;
    return Math.max(
      1,
      Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000),
    );
  }

  // ─── Main Component ───────────────────────────
  const HotelCheckoutPage = (props) => {
    useTravelAuthGuard();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // const routeState = location.state ?? {};
    const bookingData = useBookingPersist("hotelCheckoutData", "/hotels");
    const routeState = bookingData ?? {};

    const searchId = routeState.searchId ?? props.searchId ?? null;
    const BookingCode = routeState.BookingCode ?? props.BookingCode ?? "";

    const roomSnapshot = routeState.roomSnapshot ?? null;
    const hotelSnapshot = routeState.hotelSnapshot ?? null;
    const guestsData = routeState.guestsData ?? null;

    const hotelName = hotelSnapshot?.hotelName ?? props.hotelName ?? "Hotel";
    const hotelStars = hotelSnapshot?.hotelStars ?? props.hotelStars ?? 4;
    const hotelImage =
      hotelSnapshot?.hotelImage ??
      props.hotelImage ??
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80";
    const hotelLocation =
      hotelSnapshot?.hotelLocation ?? props.hotelLocation ?? "";
    const checkInTime =
      hotelSnapshot?.checkInTime ?? props.checkInTime ?? "2:00 PM";
    const checkOutTime =
      hotelSnapshot?.checkOutTime ?? props.checkOutTime ?? "12:00 AM";

    const roomName = roomSnapshot?.roomName ?? props.roomName ?? "Room";
    const roomSize = roomSnapshot?.size ?? props.roomSize ?? "";
    const bedType = roomSnapshot?.bedType ?? props.bedType ?? "";
    const sleeps = roomSnapshot?.maxOccupancy ?? props.sleeps ?? 2;
    const viewType = roomSnapshot?.viewType ?? props.viewType ?? "";
    const roomImage =
      roomSnapshot?.images?.[0] ??
      props.roomImage ??
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80";
    const inclusions = roomSnapshot?.inclusions ?? props.inclusions ?? [];

    const baseAmount = roomSnapshot?.price ?? props.baseAmount ?? 0;
    const taxAmount = roomSnapshot?.taxes ?? props.taxAmount ?? 0;
    const convenienceFee = props.convenienceFee ?? 0;
    const currency = props.currency ?? "₹";
    const isRefundable =
      roomSnapshot?.isRefundable ?? props.isRefundable ?? false;
    const cancellationDesc =
      props.cancellationDesc ?? "100% amount will be deducted on cancellations";

    const checkInISO = routeState.checkIn ?? null;
    const checkOutISO = routeState.checkOut ?? null;
    const checkInDay = fmtDay(checkInISO) || props.checkInDay || "";
    const checkInDate = fmtDate(checkInISO) || props.checkInDate || "";
    const checkOutDay = fmtDay(checkOutISO) || props.checkOutDay || "";
    const checkOutDate = fmtDate(checkOutISO) || props.checkOutDate || "";
    const nights = calcNights(checkInISO, checkOutISO);
    const roomQty = props.roomQty ?? routeState.roomQty ?? 1;

    const totalAdults = guestsData?.adults ?? 1;
    const totalChildren = guestsData?.children ?? 0;
    const childAges = guestsData?.childAges ?? [];
    // console.log("🔍 routeState:", routeState);
    // console.log("🔍 guestsData received in checkout:", guestsData);
    // console.log("🔍 totalAdults:", totalAdults, "totalChildren:", totalChildren);
    const initPassengers = () => {
      const list = [];
      for (let i = 0; i < totalAdults; i++) {
        list.push({
          paxType: 1,
          salutation: "Mr.",
          firstName: "",
          lastName: "",
          email: i === 0 ? "" : null,
          mobile: i === 0 ? "" : null,
          pan: i === 0 ? "" : null,
          nationality: "India",
          age: 30,
          isLead: i === 0,
        });
      }
      for (let i = 0; i < totalChildren; i++) {
        list.push({
          paxType: 2,
          salutation: "Mr.",
          firstName: "",
          lastName: "",
          email: null,
          mobile: null,
          pan: null,
          nationality: "India",
          age: childAges[i] ? parseInt(childAges[i]) : 5,
          isLead: false,
        });
      }
      return list;
    };

    const [passengers, setPassengers] = useState(initPassengers);
    const [errors, setErrors] = useState(() => passengers.map(() => ({})));
    const [activeTab, setActiveTab] = useState(0);
    const [prebookLoading, setPrebookLoading] = useState(false);

    // ✅ Jab user is page se kisi aur page pe navigate kare (back button etc.)
    // tab sessionStorage clean ho jaye — lekin sirf tab jab hum khud navigate nahi kar rahe
    // isliye ek ref rakhte hain jo navigate ke waqt true ho jaata hai
    const isNavigatingToPayment = React.useRef(false);

    useEffect(() => {
      return () => {
        // Cleanup: agar payment page pe navigate nahi kiya (yani back gaye ya kuch aur)
        // toh sessionStorage clean karo
        if (!isNavigatingToPayment.current) {
          sessionStorage.removeItem("hotel_prebookId");
        }
      };
    }, []);

    const netAmount = baseAmount + taxAmount + convenienceFee;

    const selectBaseSx = {
      borderRadius: "10px",
      fontFamily: "Inter, sans-serif",
      color: TEXT_DARK,
      bgcolor: "#fafafa",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9ca3af" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: GREEN,
        borderWidth: "1.5px",
      },
      "& .MuiSvgIcon-root": { color: TEXT_LIGHT },
    };

    const updatePassenger = (index, updated) => {
      const next = [...passengers];
      next[index] = updated;
      setPassengers(next);
    };

    const updateErrors = (index, updatedErrs) => {
      const next = [...errors];
      next[index] = updatedErrs;
      setErrors(next);
    };

    const validateAll = () => {
      let allValid = true;
      let firstErrorTab = null;
      const newErrors = passengers.map((p, i) => {
        const errs = {};
        const fnErr = validateFirstName(p.firstName);
        const lnErr = validateLastName(p.lastName);
        if (fnErr) errs.firstName = fnErr;
        if (lnErr) errs.lastName = lnErr;
        if (p.isLead) {
          const emailErr = validateEmail(p.email);
          const mobileErr = validateMobile(p.mobile);
          if (emailErr) errs.email = emailErr;
          if (mobileErr) errs.mobile = mobileErr;
        }
        if (Object.keys(errs).length > 0) {
          allValid = false;
          if (firstErrorTab === null) firstErrorTab = i;
        }
        return errs;
      });
      setErrors(newErrors);
      if (firstErrorTab !== null) setActiveTab(firstErrorTab);
      return allValid;
    };

    const applyBackendErrors = (backendData) => {
      try {
        const passengerErrList =
          backendData?.HotelRoomsDetails?.[0]?.HotelPassenger ?? [];
        if (!passengerErrList.length) return false;
        const FIELD_MAP = {
          Email: "email",
          FirstName: "firstName",
          LastName: "lastName",
          Phoneno: "mobile",
          PAN: "pan",
        };
        let hasAnyErr = false;
        let firstErrTab = null;
        const newErrors = passengers.map((_, i) => {
          const pErr = passengerErrList[i] ?? {};
          const errs = {};
          Object.entries(FIELD_MAP).forEach(([backendKey, frontendKey]) => {
            if (
              pErr[backendKey] &&
              Array.isArray(pErr[backendKey]) &&
              pErr[backendKey].length
            ) {
              errs[frontendKey] = pErr[backendKey][0];
              hasAnyErr = true;
              if (firstErrTab === null) firstErrTab = i;
            }
          });
          return errs;
        });
        if (hasAnyErr) {
          setErrors(newErrors);
          if (firstErrTab !== null) setActiveTab(firstErrTab);
          return true;
        }
      } catch (_) {}
      return false;
    };

    const handlePayNow = async () => {
      if (!validateAll()) {
  toast("Please fill all required fields.", {
          icon: "⚠️",
        });
        return;
      }
      const apiPassengers = passengers.map((p) => {
        const base = {
          Title: SALUTATION_TO_TITLE[p.salutation] ?? "Mr",
          FirstName: p.firstName.trim(),
          LastName: p.lastName.trim(),
          PaxType: p.paxType,
          LeadPassenger: p.isLead,
          Age: p.age,
        };
        if (p.isLead) {
          base.Email = p.email?.trim() ?? "";
          base.Phoneno = p.mobile?.trim() ?? "";
          base.PAN = p.pan?.trim() ?? "";
        }
        return base;
      });
      const body = {
        searchId,
        BookingCode,
        PaymentMode: "Limit",
        HotelRoomsDetails: [{ HotelPassenger: apiPassengers }],
      };
      try {
        setPrebookLoading(true);
        const result = await hotelFetch("/api/hotelv2/prebook/", { body });
        // console.log("🔍 Full prebook result:", JSON.stringify(result));

        // ✅ Business-level status check — HTTP 200 ≠ prebook success.
        // TBO apna Status.Code bhejta hai response ke andar (data.Status.Code).
        // 200 = success, kuch bhi aur (300 "Insufficient Balance" etc) = failure.
        const statusCode = result?.data?.Status?.Code;
        const statusDesc =
          result?.data?.Status?.Description ??
          "Prebook failed. Please try again.";

        if (statusCode !== undefined && statusCode !== 200) {
          toast.error(statusDesc);
          setPrebookLoading(false);
          return; // ⛔ payment page pe navigate mat karo
        }

        const prebookId = result?.data?.prebookId ?? result?.prebookId ?? null;
        // console.log("🔍 Extracted prebookId:", prebookId);

        if (!prebookId) {
          // Status.Code 200 tha lekin prebookId phir bhi nahi mila —
          // response shape unexpected hai, aage mat badho
          toast.error("Could not confirm booking. Please try again.");
          setPrebookLoading(false);
          return;
        }

        // ✅ sessionStorage me save karo taaki payment page pe refresh hone pe bhi mile
        sessionStorage.setItem("hotel_prebookId", prebookId);

        // ✅ Flag set karo ki hum intentionally payment page pe ja rahe hain
        // isliye cleanup useEffect sessionStorage ko delete nahi karega
        isNavigatingToPayment.current = true;

        navigate("/hotels/payment", {
          state: {
            prebookData: result,
            prebookId,
            roomSnapshot,
            hotelSnapshot,
            searchId,
            BookingCode,
            checkInDay,
            checkInDate,
            checkOutDay,
            checkOutDate,
            nights,
            roomQty,
            baseAmount,
            taxAmount,
            convenienceFee,
            currency,
            isRefundable,
            cancellationDesc,
            passengers,
            leadEmail: passengers[0]?.email ?? "",
          },
        });
      } catch (err) {
        const backendData = err?.response?.data ?? err?.data ?? null;
        const handled = backendData ? applyBackendErrors(backendData) : false;
        if (!handled) {
          toast.error(err.message ?? "Prebook failed. Please try again.");
        } else {
          toast.error("Please fix the errors highlighted below.");
        }
      } finally {
        setPrebookLoading(false);
      }
    };

    // ─── Hotel Info Card ──────────────────────────
    const HotelInfoCard = () => (
      <Box
        sx={{
          bgcolor: CARD_BG,
          borderRadius: "16px",
          p: { xs: 2, sm: 2.5 },
          border: `1px solid ${BORDER}`,
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 72,
              height: 65,
              borderRadius: "10px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={hotelImage}
              alt={hotelName}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200&q=80";
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.4 }}
            >
              <Stars count={hotelStars} />
              <Typography
                sx={{
                  fontSize: 12,
                  color: TEXT_LIGHT,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Hotel
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: TEXT_DARK,
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.25,
                mb: 0.3,
              }}
            >
              {hotelName}
            </Typography>
            {hotelLocation && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: TEXT_LIGHT,
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.4,
                }}
              >
                {hotelLocation}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ bgcolor: "#f9fafb", borderRadius: "10px", p: 1.5, mb: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "max-content auto max-content",
              justifyContent: "left",
              alignItems: "center",
              columnGap: 2.5,
            }}
          >
            {/* <Box sx={{ flex: 1 }}> */}
            <Box sx={{ minWidth: 0 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}
              >
                <CalendarMonthIcon sx={{ fontSize: 13, color: TEXT_LIGHT }} />
                <Typography
                  sx={{
                    fontSize: 11,
                    color: TEXT_LIGHT,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Check-in
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: TEXT_DARK,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {checkInDay}
                {checkInDay && checkInDate ? ", " : ""}
                {checkInDate}
              </Typography>
              {checkInTime && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: TEXT_LIGHT,
                    fontFamily: "Inter, sans-serif",
                    mt: 0.2,
                  }}
                >
                  {checkInTime}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                bgcolor: "#dcfce7",
                color: GREEN,
                borderRadius: "20px",
                fontWeight: 700,
                fontSize: 11,
                fontFamily: "Inter, sans-serif",
                whiteSpace: "nowrap",
                px: 1,
                py: 0.3,
              }}
            >
              {nights}N
            </Box>
            <Box
              sx={{
                minWidth: 0,
                textAlign: "right",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.3,
                  justifyContent: "flex-end",
                }}
              >
                <CalendarMonthIcon sx={{ fontSize: 13, color: TEXT_LIGHT }} />
                <Typography
                  sx={{
                    fontSize: 11,
                    color: TEXT_LIGHT,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Check-out
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: TEXT_DARK,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {checkOutDay}
                {checkOutDay && checkOutDate ? ", " : ""}
                {checkOutDate}
              </Typography>
              {checkOutTime && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: TEXT_LIGHT,
                    fontFamily: "Inter, sans-serif",
                    mt: 0.2,
                  }}
                >
                  {checkOutTime}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5, borderColor: BORDER }} />
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: TEXT_DARK,
            mb: 1.2,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Room Details
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Box
            sx={{
              width: 60,
              height: 55,
              borderRadius: "8px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={roomImage}
              alt={roomName}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80";
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: TEXT_DARK,
                mb: 0.8,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {roomQty} x {roomName}
            </Typography>
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", mb: 0.8 }}
            >
              {roomSize && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <SquareFootIcon sx={{ fontSize: 13, color: TEXT_LIGHT }} />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: TEXT_MID,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {roomSize}
                  </Typography>
                </Box>
              )}
              {bedType && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <KingBedOutlinedIcon sx={{ fontSize: 13, color: TEXT_LIGHT }} />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: TEXT_MID,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {bedType}
                  </Typography>
                </Box>
              )}
              {sleeps && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <PeopleAltOutlinedIcon
                    sx={{ fontSize: 13, color: TEXT_LIGHT }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: TEXT_MID,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Sleeps {sleeps}
                  </Typography>
                </Box>
              )}
              {viewType && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <WindowIcon sx={{ fontSize: 13, color: TEXT_LIGHT }} />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: TEXT_MID,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {viewType}
                  </Typography>
                </Box>
              )}
            </Box>
            {inclusions.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                {inclusions.map((inc, i) => (
                  <InclusionChip key={i} label={inc} />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );

    return (
      <Box
        sx={{
          minHeight: "100vh",
          fontFamily: "Inter, sans-serif",
          px: { xs: 1.5, sm: 3, md: 4, lg: 6 },
          py: { xs: 2, sm: 3, md: 4 },
          mt: { xs: 2, sm: 3, md: "50px" },
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ⬇ FIX: replaced MUI Snackbar/Alert entirely with react-hot-toast.
            top offset keeps it clear of the navbar. Error toasts get a
            thin red border, plain toasts (validation warning) keep the
            default light style — no heavy filled background, compact size. */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "Inter, sans-serif",
              fontSize: 12.5,
              fontWeight: 500,
              color: TEXT_DARK,
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              minWidth: "auto",
              maxWidth: 260,
              padding: "8px 12px",
              marginTop: "24px",
            },
            error: {
              style: {
                border: `1.5px solid ${ERROR_COLOR}`,
              },
              iconTheme: {
                primary: ERROR_COLOR,
                secondary: "#fff",
              },
            },
          }}
        />

        <Box sx={{ maxWidth: 1160, mx: "auto", mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              color: TEXT_MID,
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: 14,
              fontWeight: 600,
              pl: 0,
              "&:hover": { bgcolor: "transparent", color: TEXT_DARK },
            }}
          >
            Back
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2.5, md: 3 },
            maxWidth: 1160,
            mx: "auto",
            alignItems: "flex-start",
          }}
        >
          {/* ══ LEFT — Passenger Form ══ */}
          <Box sx={{ flex: "0 1 60%", minWidth: 0 }}>
            <Box
              sx={{
                bgcolor: CARD_BG,
                borderRadius: "16px",
                p: { xs: 2, sm: 2.5, md: 3 },
                border: `1px solid ${BORDER}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 16, sm: 18 },
                  fontWeight: 800,
                  fontFamily: "Inter, sans-serif",
                  color: TEXT_DARK,
                  mb: 2,
                }}
              >
                Enter Passenger Details
              </Typography>

              {/* ⬇ FIX: the tab pills row (Lead Guest / Adult 2 / Child 1
                  with count badges) has been removed entirely. Only the
                  green "✓ Lead Passenger" / "🧒 Child" badge that already
                  lives inside PassengerForm is shown now. Switching between
                  guests happens purely via the Previous / Next / Continue
                  buttons below the form. */}

              {passengers.map((p, i) => (
                <Box key={i} sx={{ display: activeTab === i ? "block" : "none" }}>
                  <PassengerForm
                    passenger={p}
                    onChange={(updated) => updatePassenger(i, updated)}
                    errors={errors[i] ?? {}}
                    onErrorChange={(updatedErrs) => updateErrors(i, updatedErrs)}
                    selectBaseSx={selectBaseSx}
                  />
                </Box>
              ))}

              {/* ⬇ FIX: earlier "Continue →" (handlePayNow) was always
                  visible next to Previous/Next, regardless of which tab was
                  active. Now:
                  - Previous shows only when activeTab > 0 (never on the
                    lead guest's tab).
                  - On every tab EXCEPT the last one, the primary action is
                    "Next →" which just advances the tab.
                  - "Continue →" (which actually calls handlePayNow) only
                    appears once the user reaches the LAST guest's tab —
                    i.e. only after everyone has been stepped through. */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2.5,
                  pt: 2,
                  borderTop: `1px solid ${BORDER}`,
                }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  {passengers.length > 1 && activeTab > 0 && (
                    <Button
                      onClick={() => setActiveTab((t) => t - 1)}
                      variant="outlined"
                      sx={{
                        borderColor: BORDER,
                        color: TEXT_MID,
                        fontFamily: "Inter, sans-serif",
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: "10px",
                        px: 3.5,
                        py: 1.2,
                        "&:hover": {
                          borderColor: GREEN,
                          color: GREEN,
                          bgcolor: "#f0fdf4",
                        },
                      }}
                    >
                      ← Previous
                    </Button>
                  )}
                </Box>

                {activeTab === passengers.length - 1 ? (
                  <Button
                    onClick={handlePayNow}
                    disabled={prebookLoading}
                    sx={{
                      bgcolor: GREEN,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      textTransform: "none",
                      borderRadius: "10px",
                      px: 3.5,
                      py: 1.2,
                      fontFamily: "Inter, sans-serif",
                      boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                      "&:hover": { bgcolor: "#15803d" },
                      "&.Mui-disabled": { bgcolor: "#86efac", color: "#fff" },
                    }}
                  >
                    {prebookLoading ? (
                      <CircularProgress size={20} sx={{ color: "#fff" }} />
                    ) : (
                      "Continue →"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setActiveTab((t) => t + 1)}
                    variant="contained"
                    disableElevation
                    sx={{
                      bgcolor: GREEN,
                      color: "#fff",
                      fontFamily: "Inter, sans-serif",
                      textTransform: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: "10px",
                      px: 3.5,
                      py: 1.2,
                      "&:hover": { bgcolor: "#15803d" },
                    }}
                  >
                    Next →
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* ══ RIGHT — Hotel Info (desktop sticky) ══ */}
          {!isMobile && (
            <Box
              sx={{
                flex: "0 1 40%",
                minWidth: 0,
                position: "sticky",
                top: 24,
                alignSelf: "flex-start",
              }}
            >
              <HotelInfoCard />
            </Box>
          )}

          {isMobile && (
            <Box sx={{ width: "100%" }}>
              <HotelInfoCard />
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  export default HotelCheckoutPage;