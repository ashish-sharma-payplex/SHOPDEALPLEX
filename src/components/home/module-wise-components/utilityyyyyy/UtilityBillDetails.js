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
    if (val && param.minLength && val.length < parseInt(param.minLength))
      return `${val.length}/${param.minLength} — Minimum ${param.minLength} digits required`;
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
    if (param.maxLength && val.length > parseInt(param.maxLength))
      val = val.slice(0, parseInt(param.maxLength));
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
            "& fieldset": { borderColor: inlineError ? "#ef4444" : "#e5e7eb" },
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

// ─── Field Skeleton ───────────────────────────────────────────────────────────
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
const UtilityBillDetails = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const router = useRouter();

  const slug = router.query?.slug || "";
  const billerIdFromQuery = router.query?.billerId || "";

  const serviceIcon = serviceImageMap[slug] || "/utility/recharge.svg";
  const serviceName = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  // ✅ sessionStorage se bill data
  const [billData, setBillData] = useState(null);
  const [billerNameFromSession, setBillerNameFromSession] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBillerId, setSelectedBillerId] = useState("");
  const [selectedBillerName, setSelectedBillerName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fieldValues, setFieldValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const dropdownRef = useRef(null);
  const sentinelRef = useRef(null);

  // ✅ sessionStorage read — sirf client side pe
  useEffect(() => {
    if (router.isReady) {
      try {
        const stored = sessionStorage.getItem("bbps_bill_data");
        const storedName = sessionStorage.getItem("bbps_biller_name");
        if (stored) setBillData(JSON.parse(stored));
        if (storedName) setBillerNameFromSession(storedName);
      } catch (_) {}
    }
  }, [router.isReady]);

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
    if (router.isReady && billerIdFromQuery)
      setSelectedBillerId(billerIdFromQuery);
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFieldChange = (paramName, value) => {
    setFieldValues((prev) => ({ ...prev, [paramName]: value }));
    if (fieldErrors[paramName])
      setFieldErrors((prev) => ({ ...prev, [paramName]: "" }));
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
          if (!regex.test(val))
            errors[param.paramName] =
              param.validationMessage ||
              `Invalid format for ${param.paramName}`;
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
  };

  // ✅ Bill amount — API se
  const billAmount =
    billData?.amount || billData?.billAmount || billData?.totalAmount || null;

  // ✅ Additional info fields — jo bhi API return kare
  const additionalFields = (() => {
    if (!billData) return [];
    const skip = new Set(["amount", "billAmount", "totalAmount"]);
    // additionalInfo array form mein
    if (Array.isArray(billData.additionalInfo)) return billData.additionalInfo;
    // flat object form mein — sab keys dikhao except amount
    return Object.entries(billData)
      .filter(([k]) => !skip.has(k) && typeof billData[k] !== "object")
      .map(([k, v]) => ({ name: k, value: String(v) }));
  })();

  // ─── JSX ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2, gap: 2 }}>
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

      {/* RIGHT CONTENT */}
      {/* MAIN GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        {/* LEFT CARD */}
        <Box sx={{ border: "1px solid #e5e7eb", borderRadius: "12px", p: 2 }}>
          {/* Biller Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                component="img"
                src={serviceIcon}
                sx={{ width: 32, height: 32 }}
              />
              <Typography fontWeight={500} fontSize={14}>
                {billerNameFromSession || selectedBillerName || "Select Biller"}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: 12,
                color: "#16a34a",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              EDIT
            </Typography>
          </Box>

          <Box sx={{ borderTop: "1px dashed #e5e7eb", my: 1.5 }} />

          {/* ✅ customerName from billerResponse */}
          {billData?.billerResponse?.customerName && (
            <Typography sx={{ fontSize: 13, color: "#111", mb: 1.5 }}>
              <Typography
                component="span"
                sx={{ fontWeight: 500, fontSize: 13 }}
              >
                Customer Name :{" "}
              </Typography>
              {billData.billerResponse.customerName}
            </Typography>
          )}

          {/* ✅ Vehicle Number (billDetails[0]) */}
          {billData?.billDetails?.[0]?.value && (
            <Typography sx={{ fontSize: 13, color: "#111", mb: 1.5 }}>
              <Typography
                component="span"
                sx={{ fontWeight: 500, fontSize: 13 }}
              >
                {billData.billDetails[0].name} :{" "}
              </Typography>
              {billData.billDetails[0].value.toUpperCase()}
            </Typography>
          )}

          {/* Make Payment */}
          <Button
            fullWidth
            disabled={!billData}
            sx={{
              mt: 1,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              py: 1.2,
              background: billData ? "#1A914B" : "#9ca3af",
              color: "#fff !important",
              "&:hover": { background: billData ? "#157a3d" : "#9ca3af" },
              "&.Mui-disabled": {
                background: "#9ca3af",
                color: "#fff !important",
              },
            }}
          >
            Make Payment
          </Button>
        </Box>

        {/* RIGHT CARD */}
        <Box sx={{ border: "1px solid #e5e7eb", borderRadius: "12px", p: 2 }}>
          {/* Bill Amount */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                Bill Amount
              </Typography>
              <Typography fontSize={18} fontWeight={600}>
                {billData?.billerResponse?.amount ? (
                  `₹${billData.billerResponse.amount}`
                ) : (
                  <Skeleton width={80} height={28} />
                )}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: 12,
                color: "#16a34a",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              EDIT
            </Typography>
          </Box>

          {/* ✅ additionalInfo grid — exact API keys */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              rowGap: 2,
              columnGap: 2,
            }}
          >
            {!billData
              ? [1, 2, 3, 4, 5, 6].map((i) => (
                  <Box key={i}>
                    <Skeleton width={80} height={12} sx={{ mb: 0.5 }} />
                    <Skeleton width={100} height={16} />
                  </Box>
                ))
              : (billData?.additionalInfo || []).map((field, i) => (
                  <Box key={i}>
                    <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                      {field.name}
                    </Typography>
                    <Typography fontSize={14} fontWeight={500}>
                      {field.value}
                    </Typography>
                  </Box>
                ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UtilityBillDetails;
