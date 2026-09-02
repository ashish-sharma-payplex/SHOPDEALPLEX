import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  Skeleton,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/router";
import SearchIcon from "@mui/icons-material/Search";
import useGetBbpsBillers from "api-manage/hooks/react-query/utility/UseGetBbpsBiller";
import useGetBbpsBillerDetails from "api-manage/hooks/react-query/utility/UseGetBbpsBillersDetails";

const serviceImageMap = {
  "education-fees": "/utility/educationfees.svg",
  electricity: "/utility/ElectricBill.svg",
  "loan-repayment": "/utility/loanrepayment.svg",
  gas: "/utility/gas-pipe.svg",
  water: "/utility/water.svg",
  "mobile-postpaid": "/utility/postpaid.svg",
  "housing-society": "/utility/housing.svg",
  "broadband-postpaid": "/utility/broadband.svg",
  insurance: "/utility/insurance.svg",
  "landline-postpaid": "/utility/device-landline-phone.svg",
  fastag: "/utility/fastag.svg",
  "cable-tv": "/utility/postpaid.svg",
  "municipal-taxes": "/utility/muncipal.svg",
  "life-insurance": "/utility/lifeinsurance.svg",
  dth: "/utility/DTHrecharge.svg",
  "credit-card": "/utility/cards.svg",
  "hospital-and-pathology": "/utility/pathology.svg",
  "municipal-services": "/utility/muncipal.svg",
  "lpg-gas": "/utility/LPG.svg",
  "clubs-and-associations": "/utility/club&association.svg",
  subscription: "/utility/subcription.svg",
  "health-insurance": "/utility/healthinsurance.svg",
  "mobile-prepaid": "/utility/recharge.svg",
  "recurring-deposit": "/utility/recharge.svg",
  hospital: "/utility/hospital.svg",
  rental: "/utility/rental.svg",
  b2b: "/utility/b2b.svg",
  "metro-recharge": "/utility/train-front.svg",
  "ncmc-recharge": "/utility/recharge.svg",
  donation: "/utility/donation.svg",
  "national-pension-system": "/utility/recharge.svg",
  "prepaid-meter": "/utility/prepaid.svg",
  "agent-collection": "/utility/agentcollection.svg",
  echallan: "/utility/eChallan.svg",
  "ev-recharge": "/utility/EVrecharge.svg",
};

// ─── Dynamic Field ────────────────────────────────────────────────────────────
const DynamicField = ({ param, value, onChange, error }) => {
  const isNumeric = param.dataType === "NUMERIC";
  const isOptional = param.optional === true || param.optional === "true";
  const [touched, setTouched] = useState(false);

  const getInlineError = () => {
    if (!touched) return "";
    const val = value || "";
    if (!isOptional && !val) return `${param.paramName} is required`;
    if (val && param.minLength && val.length < parseInt(param.minLength)) {
      return `${val.length}/${param.minLength} — Minimum ${param.minLength} digits required`;
    }
    if (
      val &&
      param.maxLength &&
      val.length === parseInt(param.maxLength) &&
      param.regex
    ) {
      try {
        const regex = new RegExp(param.regex);
        if (!regex.test(val))
          return (
            param.validationMessage || `Invalid format for ${param.paramName}`
          );
      } catch (_) {}
    }
    return "";
  };

  const handleChange = (e) => {
    setTouched(true);
    let val = e.target.value;
    if (isNumeric) val = val.replace(/[^0-9]/g, "");
    if (param.maxLength && val.length > parseInt(param.maxLength)) {
      val = val.slice(0, parseInt(param.maxLength));
    }
    onChange(param.paramName, val);
  };

  const inlineError = error || getInlineError();
  const currentLen = (value || "").length;
  const minLen = parseInt(param.minLength || 0);
  const showCounter = !inlineError && currentLen > 0 && currentLen < minLen;

  return (
    <Box
      data-param={param.paramName}
      sx={{ width: { xs: "100%", sm: "360px" }, mb: 2 }}
    >
      <Typography sx={{ fontSize: 12, mb: 0.5, color: "#6b7280" }}>
        {param.paramName}
        {!isOptional && (
          <Typography
            component="span"
            sx={{ color: "#ef4444", ml: 0.3, fontSize: 12 }}
          >
            *
          </Typography>
        )}
      </Typography>
      <TextField
        fullWidth
        size="small"
        placeholder={`Enter ${param.paramName}`}
        value={value || ""}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        inputProps={{ inputMode: isNumeric ? "numeric" : "text" }}
        error={!!inlineError}
        helperText={
          inlineError ? (
            <Typography
              component="span"
              sx={{
                fontSize: 11,
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: 0.3,
              }}
            >
              ⚠ {inlineError}
            </Typography>
          ) : showCounter ? (
            <Typography
              component="span"
              sx={{ fontSize: 11, color: "#9ca3af" }}
            >
              {currentLen}/{minLen} digits
            </Typography>
          ) : (
            ""
          )
        }
        sx={{
          background: "#fff",
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            fontSize: 14,
            "& fieldset": {
              borderColor: inlineError ? "#ef4444" : "#e5e7eb",
            },
            "&:hover fieldset": {
              borderColor: inlineError ? "#ef4444" : "#1A914B",
            },
            "&.Mui-focused fieldset": {
              borderColor: inlineError ? "#ef4444" : "#1A914B",
            },
          },
        }}
      />
    </Box>
  );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const FieldSkeleton = () => (
  <Box sx={{ width: { xs: "100%", sm: "360px" }, mb: 2 }}>
    <Skeleton
      variant="rounded"
      width={110}
      height={12}
      sx={{ mb: 0.8, borderRadius: "4px" }}
    />
    <Skeleton
      variant="rounded"
      animation="wave"
      height={40}
      sx={{
        borderRadius: "8px",
        width: "100%",
        maxWidth: 360,
        bgcolor: "#e8f5e9",
        "&::after": {
          background:
            "linear-gradient(90deg, transparent, #1A914B40, transparent)",
        },
      }}
    />
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PayUsingQR = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");
  const router = useRouter();

  const slug = router.query?.slug || "";
  const billerIdFromQuery = router.query?.billerId || "";

  const serviceIcon = serviceImageMap[slug] || "/utility/recharge.svg";
  const serviceName = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBillerId, setSelectedBillerId] = useState("");
  const [selectedBillerName, setSelectedBillerName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fieldValues, setFieldValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const dropdownRef = useRef(null);
  const sentinelRef = useRef(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetBbpsBillers(slug);

  const allBillers = data?.pages?.flatMap((p) => p.records) || [];
  const filteredBillers = allBillers.filter((b) =>
    b.billerName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const { data: billerDetails, isLoading: detailsLoading } =
    useGetBbpsBillerDetails(selectedBillerId);

  const customerParams = billerDetails?.biller?.customerParams || [];

  useEffect(() => {
    if (router.isReady && billerIdFromQuery) {
      setSelectedBillerId(billerIdFromQuery);
    }
  }, [router.isReady, billerIdFromQuery]);

  useEffect(() => {
    if (billerIdFromQuery && allBillers.length > 0) {
      const found = allBillers.find((b) => b.billerId === billerIdFromQuery);
      if (found) setSelectedBillerName(found.billerName);
    }
  }, [allBillers, billerIdFromQuery]);

  useEffect(() => {
    setFieldValues({});
    setFieldErrors({});
  }, [selectedBillerId]);

  const handleIntersect = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage)
        fetchNextPage();
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFieldChange = (paramName, value) => {
    setFieldValues((prev) => ({ ...prev, [paramName]: value }));
    if (fieldErrors[paramName]) {
      setFieldErrors((prev) => ({ ...prev, [paramName]: "" }));
    }
  };

  const validateFields = () => {
    const errors = {};
    customerParams.forEach((param) => {
      const val = fieldValues[param.paramName] || "";
      const isOptional = param.optional === true || param.optional === "true";
      if (!isOptional && !val) {
        errors[param.paramName] = `${param.paramName} is required`;
        return;
      }
      if (val && param.minLength && val.length < parseInt(param.minLength)) {
        errors[
          param.paramName
        ] = `${val.length}/${param.minLength} — Minimum ${param.minLength} digits required`;
        return;
      }
      if (val && param.regex) {
        try {
          const regex = new RegExp(param.regex);
          if (!regex.test(val)) {
            errors[param.paramName] =
              param.validationMessage ||
              `Invalid format for ${param.paramName}`;
          }
        } catch (_) {}
      }
    });
    return errors;
  };

  const isNextEnabled = () => {
    if (!selectedBillerId || detailsLoading) return false;
    for (const param of customerParams) {
      if (param.optional === false || param.optional === "false") {
        const val = fieldValues[param.paramName] || "";
        if (!val || val.length < parseInt(param.minLength || 1)) return false;
      }
    }
    return customerParams.length > 0;
  };

  const handleNext = () => {
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorParam = customerParams.find((p) => errors[p.paramName]);
      if (firstErrorParam) {
        const el = document.querySelector(
          `[data-param="${firstErrorParam.paramName}"]`,
        );
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    // console.log("Submitting:", {
    //   billerId: selectedBillerId,
    //   fields: fieldValues,
    // });
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        mb: 2,
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      {/* LEFT SIDEBAR */}
      {!isMobile && (
        <Box
          sx={{
            width: 240,
            p: 2,
            border: "1px solid #E3E8EE",
            borderRadius: "8px",
            height: "fit-content",
            minHeight: 420,
            alignSelf: "flex-start",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              background: "#fff",
              borderRadius: "12px",
              p: 1,
              minHeight: "100%",
            }}
          >
            {[
              { name: "Home", icon: "/utility/home.svg" },
              { name: "Help & Support", icon: "/utility/helpsupport.svg" },
              { name: "My Transactions", icon: "/utility/mytransactions.svg" },
            ].map((item, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.2,
                  borderRadius: "8px",
                  mb: 1,
                  background: i === 0 ? "#eeeeee" : "transparent",
                  cursor: "pointer",
                  transition: "0.2s",
                  "&:hover": { background: "#f3f3f3" },
                }}
              >
                <Box
                  component="img"
                  src={item.icon}
                  alt={item.name}
                  sx={{ width: 22, height: 22, objectFit: "contain" }}
                />
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    color: "#292D32",
                    fontWeight: i === 0 ? 500 : 400,
                  }}
                >
                  {item.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* RIGHT SIDE — middle + right column */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          width: "100%",
          alignItems: "flex-start",
        }}
      >
        {/* ── MIDDLE: QR CARD ── */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            p: 2.5,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography fontWeight={600} fontSize={15}>
              Pay using Qr code
            </Typography>
            <Typography
              sx={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}
            >
              ⏱ 04:58
            </Typography>
          </Box>

          {/* QR Image */}
          <Box sx={{ textAlign: "center" }}>
            <Box
              component="img"
              src="/qr-demo.png"
              sx={{
                width: 160,
                height: 160,
                mx: "auto",
                mb: 1.5,
                display: "block",
              }}
            />

            <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 1.5 }}>
              Pay securely with any UPI app
            </Typography>

            {/* UPI Apps */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mb: 1,
              }}
            >
              {["gpay", "phonepe", "paytm", "bhim"].map((app) => (
                <Box
                  key={app}
                  component="img"
                  src={`/upi/${app}.png`}
                  sx={{ height: 20, objectFit: "contain" }}
                />
              ))}
            </Box>
          </Box>

          {/* How it works */}
          <Box sx={{ mt: 3, textAlign: "left" }}>
            <Typography fontWeight={600} fontSize={14} mb={1.5}>
              How it works
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                gap: 2,
              }}
            >
              {[
                {
                  step: "1",
                  title: "Open UPI App",
                  desc: "Go to your preferred UPI app and click on ScanQR Button",
                },
                {
                  step: "2",
                  title: "Scan QR code",
                  desc: "Scan the generated QR code given on this screen to make payment",
                },
                {
                  step: "3",
                  title: "Enter UPI PIN",
                  desc: "Complete the payment by select the bank and entering UPI PIN",
                },
              ].map((item, i) => (
                <Box key={i}>
                  {/* ✅ MOBILE */}
                  <Box sx={{ display: { xs: "block", sm: "none" } }}>
                    <Box
                      sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                    >
                      {/* Circle */}
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "1px solid #c7d2fe",
                          color: "#4f46e5",
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          mt: "2px",
                        }}
                      >
                        {item.step}
                      </Box>

                      {/* Text */}
                      <Box>
                        <Typography fontSize={13} fontWeight={500}>
                          {item.title}
                        </Typography>

                        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* ✅ DESKTOP / TABLET (UNCHANGED) */}
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        border: "1px solid #c7d2fe",
                        color: "#4f46e5",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 0.8,
                      }}
                    >
                      {item.step}
                    </Box>

                    <Typography fontSize={13} fontWeight={500}>
                      {item.title}
                    </Typography>

                    <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── RIGHT COLUMN: Bill Summary + Coupon + Payment Summary ── */}
        <Box
          sx={{
            width: { xs: "100%", md: "280px" },
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* BILL SUMMARY */}
          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              p: 2,
            }}
          >
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              Total Amount
            </Typography>
            <Typography fontSize={18} fontWeight={600} mb={1}>
              ₹ 500
            </Typography>

            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              Biller Name
            </Typography>
            <Typography fontSize={14} mb={1}>
              Maharashtra State Electricty Board
            </Typography>

            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              Consumer Number
            </Typography>
            <Typography fontSize={14}>183271729038</Typography>
          </Box>

          {/* COUPON */}
          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              p: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="img"
                src="/utility/coupon.svg"
                alt="coupon"
                sx={{ width: 18, height: 18, objectFit: "contain" }}
              />
              <Typography fontSize={14}>Apply Coupon</Typography>
            </Box>
            <Typography sx={{ color: "#9ca3af" }}>{"›"}</Typography>
          </Box>

          {/* PAYMENT SUMMARY */}
          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              p: 2,
            }}
          >
            <Typography fontWeight={600} fontSize={14} mb={1.5}>
              Payment Summary
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography fontSize={13}>Base Amount</Typography>
              <Typography fontSize={13}>₹ 500</Typography>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography fontSize={13}>Coupon Discount</Typography>
              <Typography fontSize={13}>₹ 15</Typography>
            </Box>

            <Box sx={{ borderTop: "1px dashed #e5e7eb", my: 1 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography fontWeight={600}>Payable Amount</Typography>
              <Typography fontWeight={600}>₹ 485</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PayUsingQR;
