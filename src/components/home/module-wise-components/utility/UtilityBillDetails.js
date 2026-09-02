import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Skeleton,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { useRouter } from "next/router";
import useGetBbpsBillers from "api-manage/hooks/react-query/utility/UseGetBbpsBiller";
import useGetBbpsBillerDetails from "api-manage/hooks/react-query/utility/UseGetBbpsBillersDetails";
import UtilityLayout from "../utility/UtilityLayout";
import PaymentMethodModal from "./PaymentMethodModal";

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

const getMaxLimitFromModes = (billerPymtModes = []) => {
  if (!billerPymtModes.length) return null;
  const maxVals = billerPymtModes
    .map((m) => parseInt(m.maxLimit || "0"))
    .filter((v) => !isNaN(v) && v > 0);
  if (!maxVals.length) return null;
  return Math.max(...maxVals);
};

const UtilityBillDetailsContent = () => {
  const router = useRouter();
  const slug = router.query?.slug || "";
  const billerIdFromQuery = router.query?.billerId || "";

  const serviceIcon = serviceImageMap[slug] || "/utility/recharge.svg";
  const serviceName = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  const [billData, setBillData] = useState(null);
  const [billerNameFromSession, setBillerNameFromSession] = useState("");
  const [storedBillerId, setStoredBillerId] = useState("");
  const [storedCustomerParms, setStoredCustomerParms] = useState([]);
  const [isAmountEditing, setIsAmountEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState("");
  const [amountEditError, setAmountEditError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState({
    amount: "",
    fetchRefId: "",
    amountTags: [],
  });

  // ─── Session Storage se data load karo ──────────────────────────────────
  useEffect(() => {
    if (router.isReady) {
      try {
        const stored = sessionStorage.getItem("bbps_bill_data");
        const storedName = sessionStorage.getItem("bbps_biller_name");
        const storedId = sessionStorage.getItem("bbps_biller_id");
        if (stored) {
          const parsed = JSON.parse(stored);
          setBillData(parsed);
          setStoredCustomerParms(parsed?.customerParms || []);
        }
        if (storedName) setBillerNameFromSession(storedName);
        if (storedId) setStoredBillerId(storedId);
      } catch (_) { }
    }
  }, [router.isReady]);

  // ─── Biller Details — paymentAmountExactness aur maxLimit ke liye ───────
  const activeBillerId = billerIdFromQuery || storedBillerId;
  const { data: billerDetails } = useGetBbpsBillerDetails(activeBillerId);
  const biller = billerDetails?.biller || billerDetails || null;
  const canEditAmount = biller?.paymentAmountExactness === "Exact and above";
  const maxLimit = getMaxLimitFromModes(biller?.billerPymtModes || []);
  const minLimit = 1;

  // ─── Amount Edit ─────────────────────────────────────────────────────────
  const validateEditedAmount = (val) => {
    const num = Number(val);
    if (!val) return "Amount is required";
    if (isNaN(num) || num < minLimit) return `Minimum amount is ₹${minLimit}`;
    if (maxLimit && num > maxLimit)
      return `Maximum amount is ₹${maxLimit.toLocaleString("en-IN")}`;
    return "";
  };

  const handleAmountEditChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setEditedAmount(val);
    setAmountEditError(validateEditedAmount(val));
  };

  const handleAmountSave = () => {
    const err = validateEditedAmount(editedAmount);
    if (err) {
      setAmountEditError(err);
      return;
    }
    setIsAmountEditing(false);
    setAmountEditError("");
  };

  // ─── Payment ─────────────────────────────────────────────────────────────
  const handleMakePayment = () => {
    if (!billData) return;
    const amount = editedAmount || billData?.billerResponse?.amount || "";
    const fetchRefId = billData?.fetchRefId || "";
    const amountTags = billData?.amountTags || [];
    setPaymentModalData({ amount, fetchRefId, amountTags });
    setShowPaymentModal(true);
  };

  // ─── Shorthand ───────────────────────────────────────────────────────────
  const billerResponse = billData?.billerResponse || null;
  const additionalInfo = billData?.additionalInfo || [];
  const billDetails = billData?.billDetails || [];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 2,
      }}
    >
      <PaymentMethodModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={paymentModalData.amount}
        billerId={activeBillerId}
        customerParms={storedCustomerParms}
        service={billerNameFromSession}
        service_slug={slug}
        amountTags={paymentModalData.amountTags}
        fetchRefId={paymentModalData.fetchRefId}
      />

      {/* LEFT CARD */}
      <Box sx={{ border: "1px solid #e5e7eb", borderRadius: "12px", p: 2 }}>
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
              {billerNameFromSession || "Select Biller"}
            </Typography>
          </Box>
          <Typography
            onClick={() => router.back()}
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

        {/* Customer Name */}
        {billerResponse?.customerName && (
          <Typography sx={{ fontSize: 13, color: "#111", mb: 1.5 }}>
            <Typography component="span" sx={{ fontWeight: 500, fontSize: 13 }}>
              Customer Name :{" "}
            </Typography>
            {billerResponse.customerName}
          </Typography>
        )}

        {/* Bill Details */}
        {billDetails.map((detail, i) => (
          <Typography key={i} sx={{ fontSize: 13, color: "#111", mb: 1.5 }}>
            <Typography component="span" sx={{ fontWeight: 500, fontSize: 13 }}>
              {detail.name} :{" "}
            </Typography>
            {detail.value?.toUpperCase()}
          </Typography>
        ))}

        {/* Bill Number */}
        {billerResponse?.billNumber && (
          <Typography sx={{ fontSize: 13, color: "#111", mb: 1.5 }}>
            <Typography component="span" sx={{ fontWeight: 500, fontSize: 13 }}>
              Bill Number :{" "}
            </Typography>
            {billerResponse.billNumber}
          </Typography>
        )}

        <Button
          fullWidth
          onClick={handleMakePayment}
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
          <Box sx={{ flex: 1, mr: 1 }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              Bill Amount
            </Typography>

            {isAmountEditing ? (
              <TextField
                autoFocus
                size="small"
                value={editedAmount}
                onChange={handleAmountEditChange}
                error={!!amountEditError}
                helperText={
                  amountEditError
                    ? `⚠ ${amountEditError}`
                    : maxLimit
                      ? `Min ₹${minLimit} — Max ₹${maxLimit.toLocaleString("en-IN")}`
                      : ""
                }
                FormHelperTextProps={{
                  sx: {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: 11,
                    marginLeft: 0,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <span
                        style={{
                          fontSize: 16,
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        ₹
                      </span>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mt: 0.5,
                  width: "160px",

                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: 15,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",

                    "& fieldset": {
                      borderColor: amountEditError ? "#ef4444" : "#1A914B",
                    },
                    "&:hover fieldset": {
                      borderColor: amountEditError ? "#ef4444" : "#1A914B",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: amountEditError ? "#ef4444" : "#1A914B",
                    },
                  },

                  "& .MuiInputBase-input": {
                    paddingTop: "10px",
                    paddingBottom: "10px",
                  },
                }}
              />
            ) : (
              <Typography fontSize={18} fontWeight={600}>
                {billerResponse?.amount ? (
                  `₹${editedAmount || billerResponse.amount}`
                ) : (
                  <Skeleton width={80} height={28} />
                )}
              </Typography>
            )}
          </Box>

          {/* EDIT / SAVE button */}
          {canEditAmount &&
            (isAmountEditing ? (
              <Button
                size="small"
                onClick={handleAmountSave}
                sx={{
                  fontSize: 12,
                  color: "#fff",
                  fontWeight: 600,
                  background: "#1A914B",
                  borderRadius: "8px",
                  px: 1.5,
                  minWidth: "unset",
                  alignSelf: "flex-start",
                  mt: 0.5,
                  "&:hover": { background: "#157a3d" },
                }}
              >
                SAVE
              </Button>
            ) : (
              <Typography
                onClick={() => {
                  if (billData) {
                    setEditedAmount(
                      editedAmount || billerResponse?.amount || "",
                    );
                    setAmountEditError("");
                    setIsAmountEditing(true);
                  }
                }}
                sx={{
                  fontSize: 12,
                  color: "#16a34a",
                  fontWeight: 600,
                  cursor: billData ? "pointer" : "default",
                  alignSelf: "flex-start",
                }}
              >
                EDIT
              </Typography>
            ))}
        </Box>

        {/* Additional Info Grid */}
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
            : additionalInfo.map((field, i) => (
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
  );
};

const UtilityBillDetails = () => (
  <UtilityLayout activeKey="home">
    <UtilityBillDetailsContent />
  </UtilityLayout>
);

export default UtilityBillDetails;
