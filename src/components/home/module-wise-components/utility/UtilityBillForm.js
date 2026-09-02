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
  Dialog,
  DialogContent,
} from "@mui/material";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import useGetBbpsBillers from "api-manage/hooks/react-query/utility/UseGetBbpsBiller";
import useGetBbpsBillerDetails from "api-manage/hooks/react-query/utility/UseGetBbpsBillersDetails";
import useGetBbpsBillFetch from "api-manage/hooks/react-query/utility/useGetBbpsBillFetch";
import useGetBbpsBillValidate from "api-manage/hooks/react-query/utility/useGetBbpsBillValidate";
import PaymentMethodModal from "./PaymentMethodModal";
import UtilityLayout from "../utility/UtilityLayout";

const serviceImageMap = {
  "education-fees": "/utility/educationfees.svg",
  electricity: "/utility/Electricbill.svg",
  "loan-repayment": "/utility/loanrepayment.svg",
  gas: "/utility/gas-pipe.svg",
  water: "/utility/water.svg",
  "mobile-postpaid": "/utility/mobilepostpaid.svg",
  "housing-society": "/utility/housing.svg",
  "broadband-postpaid": "/utility/broadband.svg",
  insurance: "/utility/insurance.svg",
  "landline-postpaid": "/utility/device-landline-phone.svg",
  fastag: "/utility/fastag.svg",
  "cable-tv": "/utility/Postpaid.svg",
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
const exampleValue = param.example || "";
const shouldUppercase = exampleValue && exampleValue === exampleValue.toUpperCase() && /[A-Z]/.test(exampleValue);
  const isOptional = param.optional === true || param.optional === "true";
  const [touched, setTouched] = useState(false);

  const getInlineError = () => {
    // ✅ Bahar se error prop aaye toh touched ignore karo
    if (!touched && !error) return "";
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
          return param.validationMessage || `Invalid format for ${param.paramName}`;
      } catch (_) {}
    }
    return "";
  };

  const handleChange = (e) => {
  setTouched(true);
  let val = e.target.value;
  if (isNumeric) val = val.replace(/[^0-9]/g, "");
  if (shouldUppercase) val = val.toUpperCase(); // ✅ uppercase force
  if (param.maxLength && val.length > parseInt(param.maxLength))
    val = val.slice(0, parseInt(param.maxLength));
  onChange(param.paramName, val);
};

  // ✅ External error ko priority do, phir inline error
  const inlineError = error || getInlineError();
  const currentLen = (value || "").length;
  const minLen = parseInt(param.minLength || 0);
  const showCounter = !inlineError && currentLen > 0 && currentLen < minLen;

  return (
    <Box
      data-param={param.paramName}
      sx={{ width: { xs: "100%", sm: "360px" }, mb: 2 }}
    >
      <Typography sx={{ fontWeight:600,fontSize: 14, mb: 0.5, color: "#6b7280" }}>
        {/* {param.paramName} */}
        {/* {!isOptional && (
          <Typography
            component="span"
            sx={{ color: "#ef4444", ml: 0.3, fontSize: 12 }}
          >
            *
          </Typography>
        )} */}
      </Typography>
      <TextField
  fullWidth
  size="small"  
  label={
    <span>
      {param.paramName}
      {!isOptional && (
        <span style={{ color: "#ef4444" }}> *</span>
      )}
    </span>
  }
  placeholder={
    exampleValue
      ? `e.g. ${exampleValue}`
      : `Enter ${param.paramName}`
  }
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

    // floating label styling
    "& .MuiInputLabel-root": {
      color: "#6b7280",
      fontSize: "14px",
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: "#1A914B",
    },

    "& .MuiInputLabel-root.Mui-error": {
      color: "#ef4444",
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
          background: "linear-gradient(90deg, transparent, #1A914B40, transparent)",
        },
      }}
    />
  </Box>
);

// ─── Success Popup ────────────────────────────────────────────────────────────
const ValidationSuccessPopup = ({ open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{ sx: { borderRadius: "16px", p: 1, minWidth: 300 } }}
  >
    <DialogContent
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 4,
        px: 3,
      }}
    >
      <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "#1A914B", mb: 2 }} />
      <Typography fontWeight={600} fontSize={18} sx={{ mb: 1 }}>
        Bill Validation Successful
      </Typography>
      <Typography
        sx={{ fontSize: 13, color: "#6b7280", textAlign: "center", mb: 3 }}
      >
        Your bill has been validated successfully.
      </Typography>
      <Button
        onClick={onClose}
        fullWidth
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 500,
          py: 1.2,
          background: "#1A914B",
          color: "#fff",
          "&:hover": { background: "#157a3d" },
        }}
      >
        OK
      </Button>
    </DialogContent>
  </Dialog>
);

// ─── Inner Content ────────────────────────────────────────────────────────────
const UtilityBillFormContent = () => {
  const router = useRouter();

  const slug = router.query?.slug || "";
 const billerIdFromQuery = router.query?.billerId || "";
const billerNameFromQuery = router.query?.billerName ? decodeURIComponent(router.query.billerName) : "";

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
  const [showValidationPopup, setShowValidationPopup] = useState(false);

  const [manualAmount, setManualAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [amountTouched, setAmountTouched] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState({
    amount: "",
    fetchRefId: "",
    amountTags: [],
  });

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
  const fetchRequirement = billerDetails?.biller?.fetchRequirement || "";
  const supportBillValidation = billerDetails?.biller?.supportBillValidation || "";

  const isValidateFlow =
    fetchRequirement === "NOT_SUPPORTED" &&
    (supportBillValidation === "MANDATORY" || supportBillValidation === "OPTIONAL");

  // customerParams mein Amount field already hai?
  const hasAmountInParams = customerParams.some(
    (p) => p.paramName?.toLowerCase() === "amount",
  );

  const { mutateAsync: fetchBill, isLoading: fetchingBill } = useGetBbpsBillFetch();
  const { mutateAsync: validateBill, isLoading: validatingBill } = useGetBbpsBillValidate();

  const isActionLoading = fetchingBill || validatingBill;

 useEffect(() => {
  if (router.isReady) {
    if (billerIdFromQuery) setSelectedBillerId(billerIdFromQuery);
    if (billerNameFromQuery) setSelectedBillerName(billerNameFromQuery);
  }
}, [router.isReady, billerIdFromQuery, billerNameFromQuery]);
//  useEffect(() => {
//   if (!selectedBillerName) {
//     const stored = sessionStorage.getItem("bbps_biller_name");
//     if (stored) setSelectedBillerName(stored);
//   }
// }, [selectedBillerName]);

  useEffect(() => {
    setFieldValues({});
    setFieldErrors({});
    setManualAmount("");
    setAmountError("");
    setAmountTouched(false);
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

useEffect(() => {
  if (!searchQuery) return;
  if (hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }
}, [searchQuery, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFieldChange = (paramName, value) => {
    setFieldValues((prev) => ({ ...prev, [paramName]: value }));
    if (fieldErrors[paramName])
      setFieldErrors((prev) => ({ ...prev, [paramName]: "" }));
  };

  const handleAmountChange = (e) => {
    setAmountTouched(true);
    const val = e.target.value.replace(/[^0-9]/g, "");
    setManualAmount(val);
    if (!val) {
      setAmountError("Amount is required");
    } else if (Number(val) <= 0) {
      setAmountError("Amount must be greater than 0");
    } else {
      setAmountError("");
    }
  };

  // ✅ Saare required empty/short fields ek saath mark karo
  const markAllEmptyFields = () => {
    const errors = {};
    customerParams.forEach((param) => {
      const isOptional = param.optional === true || param.optional === "true";
      if (isOptional) return;
      const val = (fieldValues[param.paramName] || "").trim();
      if (!val) {
        errors[param.paramName] = `${param.paramName} is required`;
      } else if (param.minLength && val.length < parseInt(param.minLength)) {
        errors[param.paramName] = `${val.length}/${param.minLength} — Minimum ${param.minLength} digits required`;
      }
    });
    return errors;
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
        errors[param.paramName] = `${val.length}/${param.minLength} — Minimum ${param.minLength} digits required`;
        return;
      }
      if (val && param.regex) {
        try {
          const regex = new RegExp(param.regex);
          if (!regex.test(val))
            errors[param.paramName] =
              param.validationMessage || `Invalid format for ${param.paramName}`;
        } catch (_) {}
      }
    });
    return errors;
  };

  // ✅ Saare required params fill + minLength poori honi chahiye tab enable
  const isNextEnabled = () => {
    if (!selectedBillerId || detailsLoading || isActionLoading) return false;
    if (customerParams.length === 0) return false;

    for (const param of customerParams) {
      const isOptional = param.optional === true || param.optional === "true";
      if (isOptional) continue;

      const val = (fieldValues[param.paramName] || "").trim();
      if (!val) return false;
      if (param.minLength && val.length < parseInt(param.minLength)) return false;
    }

    // Validate flow mein manual amount check — sirf tab jab params mein Amount nahi hai
    if (isValidateFlow && !hasAmountInParams) {
      if (!manualAmount || Number(manualAmount) <= 0) return false;
    }

    return true;
  };

  const getCustomerParms = () =>
    customerParams.map((param) => ({
      name: param.paramName,
      value: fieldValues[param.paramName] || "",
    }));

  const scrollToFirstError = (errors) => {
    const firstErrorParam = customerParams.find((p) => errors[p.paramName]);
    if (firstErrorParam) {
      const el = document.querySelector(`[data-param="${firstErrorParam.paramName}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleNext = async () => {
    // ✅ Pehle saare empty/short fields ek saath mark karo
    const emptyErrors = markAllEmptyFields();
    if (Object.keys(emptyErrors).length > 0) {
      setFieldErrors(emptyErrors);
      scrollToFirstError(emptyErrors);
      return;
    }

    // Regex/format validation
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      scrollToFirstError(errors);
      return;
    }

    let billData;
    try {
      billData = await fetchBill({
        billerId: selectedBillerId,
        customerParams: getCustomerParms(),
      });
        console.log("🔍 FULL RESPONSE:", JSON.stringify(billData, null, 2));
    } catch (err) {
      // ✅ Network/server error — pehle field ke niche dikhao
      if (customerParams.length > 0) {
        const firstParam = customerParams[0];
        setFieldErrors({ [firstParam.paramName]: "Something went wrong. Please try again." });
        const el = document.querySelector(`[data-param="${firstParam.paramName}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error("Something went wrong. Please try again.", { style: { boxShadow: "none" } });
      }
      return;
    }

    if (!billData) {
      if (customerParams.length > 0) {
        const firstParam = customerParams[0];
        setFieldErrors({ [firstParam.paramName]: "No response from server. Please try again." });
        const el = document.querySelector(`[data-param="${firstParam.paramName}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error("No response from server. Please try again.", { style: { boxShadow: "none" } });
      }
      return;
    }

    // ✅ Actual API shape: billData.bbps.bill (NOT billData.bbps.response)
    const topStatus = billData?.status?.toUpperCase();
    const bbpsBill = billData?.bbps?.bill || {};
    const responseCode = bbpsBill?.responseCode;        // "000" = success
    const responseReason = bbpsBill?.responseReason?.toUpperCase();
    const errorList = bbpsBill?.errorList || [];
    const complianceReason = bbpsBill?.complianceReason || "";

    const isFailure =
      (topStatus && topStatus !== "SUCCESS") ||
      (responseCode && responseCode !== "000") ||
      (responseReason && !["SUCCESS", "SUCCESSFUL"].includes(responseReason)) ||
      errorList.length > 0 ||
      !!complianceReason;

    if (isFailure) {
      // ✅ Error message — priority: complianceReason > errorList > message
      const errorMsg =
        complianceReason ||
        errorList?.[0]?.errorDtl?.trim() ||
        billData?.message ||
        "Bill fetch failed. Please check your details.";

      // ✅ Hamesha pehle field ke niche dikhao
      if (customerParams.length > 0) {
        const firstParam = customerParams[0];
        setFieldErrors({ [firstParam.paramName]: errorMsg });
        const el = document.querySelector(`[data-param="${firstParam.paramName}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error(errorMsg, { style: { boxShadow: "none" } });
      }
      return;
    }

    // ✅ Success — sessionStorage mein save karo aur navigate karo
    sessionStorage.setItem(
      "bbps_bill_data",
      JSON.stringify({
        ...billData,
        billerResponse: bbpsBill?.billerResponse,
        additionalInfo: bbpsBill?.additionalInfo || [],
        billDetails: bbpsBill?.billDetails || [],
        fetchRefId: bbpsBill?.refId || "",
        customerParms: getCustomerParms(),
      }),
    );
    sessionStorage.setItem("bbps_biller_name", selectedBillerName);
    sessionStorage.setItem("bbps_biller_id", selectedBillerId);
    router.push(`/utility/${slug}/details?billerId=${selectedBillerId}`);
  };

  const handlePayNow = async () => {
    // ✅ Pehle saare empty/short fields ek saath mark karo
    const emptyErrors = markAllEmptyFields();

    if (!hasAmountInParams && (!manualAmount || Number(manualAmount) <= 0)) {
      setAmountTouched(true);
      setAmountError("Amount is required");
    }

    if (Object.keys(emptyErrors).length > 0) {
      setFieldErrors(emptyErrors);
      scrollToFirstError(emptyErrors);
      return;
    }

    // Regex/format validation
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      scrollToFirstError(errors);
      return;
    }

    // Amount params se lo ya manual field se
    const finalAmount = hasAmountInParams
      ? fieldValues["Amount"] || fieldValues["amount"] || ""
      : manualAmount;

    let result;
    try {
      result = await validateBill({
        billerId: selectedBillerId,
        customerParams: getCustomerParms(),
      });
    } catch (err) {
      if (customerParams.length > 0) {
        const firstParam = customerParams[0];
        setFieldErrors({ [firstParam.paramName]: "Something went wrong. Please try again." });
        const el = document.querySelector(`[data-param="${firstParam.paramName}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error("Something went wrong. Please try again.", { style: { boxShadow: "none" } });
      }
      return;
    }

    if (!result) {
      if (customerParams.length > 0) {
        const firstParam = customerParams[0];
        setFieldErrors({ [firstParam.paramName]: "No response from server. Please try again." });
        const el = document.querySelector(`[data-param="${firstParam.paramName}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error("No response from server. Please try again.", { style: { boxShadow: "none" } });
      }
      return;
    }

    const bbpsStatus = result?.bbps?.status?.toUpperCase();
    const responseReason = result?.bbps?.response?.responseReason?.toUpperCase();
    const errorList = result?.bbps?.response?.errorList || [];
    const complianceReason = result?.bbps?.response?.complianceReason || "";

    const isFailure =
      bbpsStatus === "FAILURE" ||
      responseReason === "FAILURE" ||
      errorList.length > 0;

    if (isFailure) {
      // ✅ complianceReason ya koi bhi error — pehle field ke niche dikhao
      const errorMsg =
        complianceReason ||
        errorList?.[0]?.errorDtl?.trim() ||
        result?.message ||
        "Bill validation failed. Please check your details.";

      if (customerParams.length > 0) {
        const firstParam = customerParams[0];
        setFieldErrors({ [firstParam.paramName]: errorMsg });
        const el = document.querySelector(`[data-param="${firstParam.paramName}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error(errorMsg, { style: { boxShadow: "none" } });
      }
      return;
    }

    const fetchRefId =
      result?.fetchRefId ||
      result?.bbps?.response?.refId ||
      result?.refId ||
      "";
    const amountTags = result?.amountTags || result?.amount_tags || [];
    setPaymentModalData({ amount: finalAmount, fetchRefId, amountTags });
    setShowPaymentModal(true);
  };

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <ValidationSuccessPopup
        open={showValidationPopup}
        onClose={() => setShowValidationPopup(false)}
      />

      <PaymentMethodModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={paymentModalData.amount}
        billerId={selectedBillerId}
        customerParms={getCustomerParms()}
        service={selectedBillerName}
        service_slug={slug}
        amountTags={paymentModalData.amountTags}
        fetchRefId={paymentModalData.fetchRefId}
      />

      <Box
        sx={{
          width: "100%",
          minHeight: "520px",
          borderRadius: "16px",
          p: { xs: 2, md: 3 },
          border: "1px solid #e5e7eb",
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2.5,
          }}
        >
          <Box>
            <Typography fontWeight={600} fontSize={15}>
              Recharges & Bill Payments
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              Pay utility bills, recharges & government bills securely
            </Typography>
          </Box>
          <Box
            component="img"
            src="/BharatConnect.png"
            sx={{ height: 36, flexShrink: 0 }}
          />
        </Box>

        {/* CATEGORY ROW */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "30%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={serviceIcon}
              sx={{ width: 22, height: 22 }}
            />
          </Box>
          <Typography fontWeight={600} fontSize={14}>
            {serviceName}
          </Typography>
        </Box>

        {/* BILLER SELECTOR */}
        <Box
          ref={dropdownRef}
          sx={{
            position: "relative",
            width: { xs: "100%", sm: "360px" },
            mb: 2.5,
          }}
        >
          <Box
            onClick={() => setDropdownOpen((prev) => !prev)}
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#fff",
              cursor: "pointer",
              "&:hover": { borderColor: "#d1d5db" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src={serviceIcon}
                sx={{ width: 28, height: 28, flexShrink: 0 }}
              />
              <Typography
                fontSize={13}
                color={selectedBillerName ? "#111" : "#9ca3af"}
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedBillerName || "Select a biller"}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: 12,
                color: "#16a34a",
                fontWeight: 600,
                flexShrink: 0,
                ml: 1,
              }}
            >
              {selectedBillerName ? "EDIT" : "SELECT"}
            </Typography>
          </Box>

          {dropdownOpen && (
            <Box
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 10,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                mt: 0.5,
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 1, borderBottom: "1px solid #f3f4f6" }}>
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  placeholder="Search biller..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: 13,
                    },
                  }}
                />
              </Box>
              <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 2,
                        py: 1.2,
                      }}
                    >
                      <Skeleton variant="circular" width={28} height={28} />
                      <Skeleton width={160} height={14} />
                    </Box>
                  ))
                ) : filteredBillers.length === 0 ? (
                  <Typography
                    sx={{ fontSize: 13, color: "#9ca3af", px: 2, py: 2 }}
                  >
                    No billers found
                  </Typography>
                ) : (
                  filteredBillers.map((biller) => (
                    <Box
                      key={biller.billerId}
                      onClick={() => {
                        setSelectedBillerId(biller.billerId);
                        setSelectedBillerName(biller.billerName);
                        setDropdownOpen(false);
                        setSearchQuery("");
                        router.replace(
                          `/utility/${slug}/form?billerId=${biller.billerId}`,
                          undefined,
                          { shallow: true },
                        );
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 2,
                        py: 1.2,
                        cursor: "pointer",
                        background:
                          selectedBillerId === biller.billerId
                            ? "#f0fdf4"
                            : "transparent",
                        "&:hover": { background: "#f9fafb" },
                      }}
                    >
                      <Box
                        component="img"
                        src={serviceIcon}
                        sx={{ width: 24, height: 24, flexShrink: 0 }}
                      />
                      <Typography fontSize={13}>{biller.billerName}</Typography>
                    </Box>
                  ))
                )}
                <Box ref={sentinelRef} sx={{ height: 1 }} />
                {isFetchingNextPage && (
                  <Box sx={{ px: 2, py: 1 }}>
                    <Skeleton width={160} height={14} />
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* DYNAMIC FIELDS */}
        {detailsLoading && selectedBillerId ? (
          <FieldSkeleton />
        ) : (
          customerParams.map((param) => (
            <DynamicField
              key={param.paramName}
              param={param}
              value={fieldValues[param.paramName]}
              onChange={handleFieldChange}
              error={fieldErrors[param.paramName]}
            />
          ))
        )}

        {/* AMOUNT FIELD — sirf validate flow me */}
        {isValidateFlow &&
          !detailsLoading &&
          selectedBillerId &&
          !hasAmountInParams && (
            <Box sx={{ width: { xs: "100%", sm: "360px" }, mb: 2 }}>
              {/* <Typography sx={{ fontSize: 12, mb: 0.5, color: "#6b7280" }}>
                Amount
                <Typography
                  component="span"
                  sx={{ color: "#ef4444", ml: 0.3, fontSize: 12 }}
                >
                  *
                </Typography>
              </Typography> */}
              <TextField
                fullWidth
                size="small"
                placeholder="Enter amount"
                value={manualAmount}
                onChange={handleAmountChange}
                onBlur={() => {
                  setAmountTouched(true);
                  if (!manualAmount) setAmountError("Amount is required");
                }}
                inputProps={{ inputMode: "numeric" }}
                error={amountTouched && !!amountError}
                helperText={
                  amountTouched && amountError ? (
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
                      ⚠ {amountError}
                    </Typography>
                  ) : (
                    ""
                  )
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
                        ₹
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  background: "#fff",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: 14,
                    "& fieldset": {
                      borderColor:
                        amountTouched && amountError ? "#ef4444" : "#e5e7eb",
                    },
                    "&:hover fieldset": {
                      borderColor:
                        amountTouched && amountError ? "#ef4444" : "#1A914B",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor:
                        amountTouched && amountError ? "#ef4444" : "#1A914B",
                    },
                  },
                }}
              />
            </Box>
          )}

        {/* BUTTON */}
        <Box sx={{ mt: 1 }}>
          {isValidateFlow ? (
            <Button
              onClick={handlePayNow}
              disabled={!isNextEnabled()}
              sx={{
                width: { xs: "100%", sm: "200px" },
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                py: 1.3,
                fontSize: 14,
                letterSpacing: 0.5,
                background: isNextEnabled() ? "#1A914B" : "#9ca3af",
                color: "#fff",
                "&:hover": {
                  background: isNextEnabled() ? "#157a3d" : "#9ca3af",
                },
                "&.Mui-disabled": { background: "#9ca3af", color: "#fff" },
                boxShadow: "none",
              }}
            >
              {validatingBill ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "Pay Now"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isNextEnabled()}
              sx={{
                width: { xs: "100%", sm: "200px" },
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                py: 1.3,
                fontSize: 14,
                letterSpacing: 0.5,
                background: isNextEnabled() ? "#1A914B" : "#9ca3af",
                color: "#fff",
                "&:hover": {
                  background: isNextEnabled() ? "#157a3d" : "#9ca3af",
                },
                "&.Mui-disabled": { background: "#9ca3af", color: "#fff" },
                boxShadow: "none",
              }}
            >
              {fetchingBill ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "NEXT"
              )}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
const UtilityBillForm = () => (
  <UtilityLayout activeKey="home" >
    <UtilityBillFormContent />
  </UtilityLayout>
);

export default UtilityBillForm;