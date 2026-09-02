import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BusPaymentQRModal from "./BusPaymentQRModal";
import { useBusBlock } from "components/travel-hooks/bus/useBusBlock";
import { useBusSeatLayout } from "components/travel-hooks/bus/useBusSeatLayout";
import { useBusPayment } from "components/travel-hooks/bus/useBusPayment";
import { useBusBook } from "components/travel-hooks/bus/useBusBook";

const STYLES = `
.pdf-page {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 20px;
    padding: 24px;
    max-width: 1300px;
    margin: 0 auto;
    // background: #f9fafb;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-sizing: border-box;
    align-items: flex-start;
    margin-top: 60px; 

  }
  .pdf-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:20px; margin-bottom:16px; }
  .pdf-card:last-child { margin-bottom:0; }
  .pdf-fields-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .pdf-fields-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .pdf-billing-top { display:grid; grid-template-columns:1fr 140px; gap:12px; margin-bottom:12px; }
  .pdf-summary { position:sticky; top:24px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:20px; }
  @media (max-width:860px) {
    .pdf-page { grid-template-columns:1fr; padding:16px; }
    .pdf-summary { position:static; order:999; }
  }
  @media (max-width:520px) {
    .pdf-page { padding:12px; gap:12px; }
    .pdf-fields-3 { grid-template-columns:1fr 1fr; }
    .pdf-fields-2 { grid-template-columns:1fr; }
    .pdf-billing-top { grid-template-columns:1fr; }
    .pdf-card { padding:14px; }
    .pdf-summary { padding:14px; }
  }
`;

const injectStyles = () => {
  if (
    typeof document !== "undefined" &&
    !document.getElementById("pdf-styles")
  ) {
    const tag = document.createElement("style");
    tag.id = "pdf-styles";
    tag.innerHTML = STYLES;
    document.head.appendChild(tag);
  }
};

const GREEN = "#16a34a";
const GREEN_LIGHT = "#f0fdf4";
const GREEN_BORDER = "#bbf7d0";
const ERROR_COLOR = "#ef4444";
const ERROR_LIGHT = "#fef2f2";

// Sleeper SeatType codes — mirrors the mapping used on the seat-selection
// screen (BusSeatSelection.jsx) so "deck" only applies to sleeper buses.
const isSleeperSeat = (seat) =>
  [2, 3, 4, 5].includes(seat?.SeatType) || seat?.SeatType === "Sleeper";

const DeckBadge = ({ isUpper }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 11,
      fontWeight: 700,
      color: isUpper ? "#7c3aed" : "#0f766e",
      background: isUpper ? "#f5f3ff" : "#f0fdfa",
      border: `1px solid ${isUpper ? "#ddd6fe" : "#99f6e4"}`,
      borderRadius: 5,
      padding: "2px 7px",
      letterSpacing: 0.2,
    }}
  >
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      {isUpper ? (
        <polyline points="18 15 12 9 6 15" />
      ) : (
        <polyline points="6 9 12 15 18 9" />
      )}
    </svg>
    {isUpper ? "Upper Deck" : "Lower Deck"}
  </span>
);

const sanitizeTextOnly = (val) => {
  if (val.startsWith(" ")) return val.trimStart();
  val = val.replace(/[0-9]/g, "");
  val = val.replace(/[^a-zA-Z\s\-']/g, "");
  return val;
};
const sanitizeDigitsOnly = (val) => val.replace(/\D/g, "");
const sanitizeEmail = (val) => {
  if (val.startsWith(" ")) val = val.trimStart();
  val = val.replace(/[^a-z0-9@._-]/g, "");
  return val;
};
const validateName = (val) => {
  if (!val.trim()) return "Name is required";
  if (val.trim().length < 2) return "Name must be at least 2 characters";
  if (/[0-9]/.test(val)) return "Name cannot contain digits";
  if (/[^a-zA-Z\s\-']/.test(val))
    return "Name cannot contain special characters";
  return "";
};
const validateAge = (val) => {
  if (val === "" || val === undefined || val === null) return "Age is required";
  if (/^\s+$/.test(val)) return "Age cannot be blank spaces";
  if (/\s/.test(val)) return "Age cannot contain spaces";
  if (!/^[0-9]+$/.test(val))
    return "Age must contain digits only (no letters or symbols)";
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 1 || n > 99) return "Enter a valid age (1–99)";
  return "";
};
const validatePhone = (val) => {
  if (!val) return "Phone number is required";

  const phoneRegex = /^(?!([0-9])\1{9}$)[6-9][0-9]{9}$/;

  if (!phoneRegex.test(val)) {
    return "Enter a valid Indian mobile number";
  }

  return "";
};
const validateEmail = (val) => {
  if (!val.trim()) return "Email is required";
  if (/[A-Z]/.test(val)) return "Email must be in lowercase only";
  if (/[^a-z0-9@._-]/.test(val))
    return "Only lowercase letters, digits, @, ., _ and - are allowed";
  const emailRegex =
    /^[a-z0-9]+([._-][a-z0-9]+)*@[a-z0-9]+([.-][a-z0-9]+)*\.[a-z]{2,}$/;
  if (!emailRegex.test(val)) return "Enter a valid email address";
  return "";
};
const validatePin = (val) => {
  if (!val) return "";
  if (val.length !== 6) return "Pincode must be exactly 6 digits";
  if (/^0+$/.test(val)) return "Enter a valid pincode";
  return "";
};
const validateTextField = (label, val) => {
  if (!val.trim()) return "";
  if (/[0-9]/.test(val)) return `${label} cannot contain digits`;
  if (/[^a-zA-Z\s\-']/.test(val))
    return `${label} cannot contain special characters`;
  return "";
};

// ─── Sub-components (unchanged from original) ────────────────────────────────

const FocusInput = ({ style, error, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        width: "100%",
        height: 38,
        border: error
          ? `1.5px solid ${ERROR_COLOR}`
          : focused
            ? `1.5px solid ${GREEN}`
            : "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "0 12px",
        fontSize: 13,
        color: "#111",
        background: error ? ERROR_LIGHT : "#fff",
        outline: "none",
        boxSizing: "border-box",
        boxShadow: focused
          ? error
            ? "0 0 0 3px #fee2e2"
            : `0 0 0 3px ${GREEN_LIGHT}`
          : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};

const FocusSelect = ({ style, children, error, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        {...props}
        style={{
          width: "100%",
          height: 38,
          border: error
            ? `1.5px solid ${ERROR_COLOR}`
            : focused
              ? `1.5px solid ${GREEN}`
              : "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "0 32px 0 12px",
          fontSize: 13,
          color: "#111",
          background: error ? ERROR_LIGHT : "#fff",
          outline: "none",
          boxSizing: "border-box",
          appearance: "none",
          cursor: "pointer",
          boxShadow: focused
            ? error
              ? "0 0 0 3px #fee2e2"
              : `0 0 0 3px ${GREEN_LIGHT}`
            : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          ...style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children}
      </select>
      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <path
          d="M1 1L6 7L11 1"
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

const Field = ({ label, required, error, children }) => (
  <div>
    <label
      style={{
        display: "block",
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 5,
        fontWeight: 500,
      }}
    >
      {label}
      {required && <span style={{ color: ERROR_COLOR, marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && (
      <div
        style={{
          fontSize: 11,
          color: ERROR_COLOR,
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke={ERROR_COLOR}
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {error}
      </div>
    )}
  </div>
);

const PassengerBlock = ({ index, seat, isLead, form, errors, onChange }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      paddingBottom: 16,
      marginBottom: 16,
      borderBottom: "1px solid #f3f4f6",
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "#f3f4f6",
        border: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 2,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="7" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" strokeLinecap="round" />
      </svg>
    </div>
    <div style={{ flex: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 2,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            color: "#111",
          }}
        >
          Passenger {index}
        </div>
        {isLead && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: GREEN,
              background: GREEN_LIGHT,
              border: `1px solid ${GREEN_BORDER}`,
              borderRadius: 4,
              padding: "1px 8px",
              letterSpacing: 0.3,
            }}
          >
            LEAD
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
            color: "#6b7280",
            fontWeight: 600,
          }}
        >
          Seat {seat?.SeatName}
          {isSleeperSeat(seat) && (
            <span style={{ color: seat?.IsUpper ? "#7c3aed" : "#0f766e" }}>
              {" "}({seat?.IsUpper ? "Upper" : "Lower"})
            </span>
          )}
        </span>
      </div>
      <div className="pdf-fields-3">
        <Field label="Full Name" required error={errors?.name}>
          <FocusInput
            type="text"
            placeholder="Enter Name"
            value={form.name}
            error={errors?.name}
            onChange={(e) => onChange("name", sanitizeTextOnly(e.target.value))}
          />
        </Field>
        <Field label="Age" required error={errors?.age}>
          <FocusInput
            type="text"
            inputMode="numeric"
            maxLength={3}
            placeholder="Enter age"
            value={form.age}
            error={errors?.age}
            onChange={(e) => onChange("age", e.target.value.slice(0, 3))}
          />
        </Field>
        <Field label="Gender" required error={errors?.gender}>
          <FocusSelect
            value={form.gender}
            error={errors?.gender}
            onChange={(e) => onChange("gender", e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            {/* <option value="other">Other</option> */}
          </FocusSelect>
        </Field>
      </div>
    </div>
  </div>
);

const LocationPinIcon = ({ color = GREEN }) => (
  <div
    style={{
      width: 22,
      height: 22,
      borderRadius: "50%",
      background: GREEN_LIGHT,
      border: `1px solid ${GREEN_BORDER}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  </div>
);

const Stop = ({ time, date, place }) => (
  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
    <div style={{ minWidth: 44, textAlign: "right", flexShrink: 0 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#111",
          lineHeight: 1.2,
        }}
      >
        {time}
      </div>
      <div
        style={{
          fontSize: 11,
          fontFamily: "Inter, sans-serif",
          color: "#9ca3af",
          marginTop: 2,
        }}
      >
        {date}
      </div>
    </div>
    <div
      style={{ paddingTop: 0, flexShrink: 0, background: "#fff", zIndex: 1 }}
    >
      <LocationPinIcon />
    </div>
    <div
      style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, paddingTop: 3 }}
    >
      {place}
    </div>
  </div>
);

const SummaryPanel = ({
  bus,
  selectedSeatObjects,
  selectedBoardingPoint,
  selectedDroppingPoint,
  onPay,
  paying,
}) => {
  const totalFare = selectedSeatObjects.reduce(
    (s, seat) => s + (seat.SeatFare || 0),
    0,
  );
  return (
    <div className="pdf-summary">
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
          color: "#111",
        }}
      >
        {bus.operatorName}
      </div>
      <div
        style={{
          fontSize: 12,
          fontFamily: "Inter, sans-serif",
          color: "#9ca3af",
          marginTop: 3,
          marginBottom: 16,
        }}
      >
        {bus.busType}
      </div>
      <div style={{ height: 1, background: "#f3f4f6", marginBottom: 14 }} />
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 65,
            top: 14,
            width: 1.5,
            height: "calc(50% + 6px)",
            background: "#e5e7eb",
          }}
        />
        <Stop
          time={bus.departureTime}
          date={bus.departureDate}
          place={`${bus.from} · ${selectedBoardingPoint?.name}`}
        />
        <div
          style={{ fontSize: 11, color: "#9ca3af", padding: "6px 0 6px 76px" }}
        >
          {bus.duration}
        </div>
        <Stop
          time={bus.arrivalTime}
          date={bus.arrivalDate}
          place={`${bus.to} · ${selectedDroppingPoint?.name}`}
        />
      </div>
      <div style={{ height: 1, background: "#f3f4f6", margin: "14px 0" }} />
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "Inter, sans-serif",
          color: "#111",
          marginBottom: 4,
        }}
      >
        Seats
      </div>
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}
      >
        {selectedSeatObjects.map((seat) => (
          <span
            key={seat.SeatName}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: GREEN_LIGHT,
              border: `1px solid ${GREEN_BORDER}`,
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 600,
              color: "#166534",
            }}
          >
            {seat.SeatName}
            {isSleeperSeat(seat) && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: seat.IsUpper ? "#7c3aed" : "#0f766e",
                }}
              >
                · {seat.IsUpper ? "Upper" : "Lower"}
              </span>
            )}
          </span>
        ))}
      </div>
      <div style={{ height: 1, background: "#f3f4f6", margin: "14px 0" }} />
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
          color: "#111",
          marginBottom: 10,
        }}
      >
        Fare details
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 7,
        }}
      >
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          Base Fare ({selectedSeatObjects.length} seat
          {selectedSeatObjects.length > 1 ? "s" : ""})
        </span>
        <span style={{ fontSize: 13, color: "#374151" }}>
          ₹{totalFare.toLocaleString("en-IN")}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #f3f4f6",
          paddingTop: 10,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            color: "#111",
          }}
        >
          Total Amount
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            color: "#111",
          }}
        >
          ₹{totalFare.toLocaleString("en-IN")}
        </span>
      </div>
      <button
        onClick={onPay}
        disabled={paying}
        style={{
          display: "block",
          width: "100%",
          background: paying ? "#9ca3af" : GREEN,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          height: 44,
          fontSize: 14,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          cursor: paying ? "not-allowed" : "pointer",
          transition: "background 0.15s",
        }}
      >
        {paying
          ? "Processing..."
          : `Continue to pay ₹${totalFare.toLocaleString("en-IN")}`}
      </button>
    </div>
  );
};

// ─── Main Form ────────────────────────────────────────────────────────────────
const PassengerDetailsForm = ({
  bus = {},
  selectedSeatObjects = [],
  selectedSeatNames = [],
  selectedBoardingPoint = null,
  selectedDroppingPoint = null,
}) => {
  injectStyles();
  const navigate = useNavigate();
  const { blockSeat, loading: paying } = useBusBlock();
  const { fetchSeatLayout } = useBusSeatLayout();
  const { initiatePayment, startPolling, stopPolling } = useBusPayment();
  const { bookTicket } = useBusBook();

  // ── Form state ──
  const [passengers, setPassengers] = useState(
    selectedSeatObjects.map(() => ({ name: "", age: "", gender: "" })),
  );
  const [contact, setContact] = useState({
    countryCode: "+91",
    phone: "",
    email: "",
  });
  const [billing, setBilling] = useState({
    address: "",
    pin: "",
    state: "",
    city: "",
  });
  const [passengerErrors, setPassengerErrors] = useState(
    selectedSeatObjects.map(() => ({ name: "", age: "", gender: "" })),
  );
  const [contactErrors, setContactErrors] = useState({ phone: "", email: "" });
  const [billingErrors, setBillingErrors] = useState({
    pin: "",
    state: "",
    city: "",
  });

  // ── QR Modal state ──
  const [qrVisible, setQrVisible] = useState(false);
  const [paymentData, setPaymentData] = useState(null); // data from /payment/initiate/
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [retrying, setRetrying] = useState(false);
  const [failedData, setFailedData] = useState(null);

  // Stash traceId + resultIndex for retry
  const [blockMeta, setBlockMeta] = useState({
    traceId: null,
    resultIndex: null,
  });

  // ── Helper: navigate to ticket page carrying a failure payload ──
  const goToTicketPageWithFailure = useCallback(
    (message, extra = {}) => {
      navigate("/buses/ticket", {
        state: {
          bookingResponse: {
            success: false,
            message,
            ...extra,
          },
          bus,
          contact,
          billing,
          passengers,
          selectedSeatObjects,
          selectedBoardingPoint,
          selectedDroppingPoint,
        },
      });
    },
    [
      navigate,
      bus,
      contact,
      billing,
      passengers,
      selectedSeatObjects,
      selectedBoardingPoint,
      selectedDroppingPoint,
    ],
  );

  // ── Field update handlers ──
  const updatePassenger = (idx, key, val) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [key]: val } : p)),
    );
    let err = "";
    if (key === "name") err = validateName(val);
    if (key === "age") err = validateAge(val);
    if (key === "gender") err = val ? "" : "Please select gender";
    setPassengerErrors((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [key]: err } : e)),
    );
  };
  const updateContact = (key, val) => {
    setContact((f) => ({ ...f, [key]: val }));
    let err = "";
    if (key === "phone") err = validatePhone(val);
    if (key === "email") err = validateEmail(val);
    setContactErrors((f) => ({ ...f, [key]: err }));
  };
  const updateBilling = (key, val) => {
    setBilling((f) => ({ ...f, [key]: val }));
    let err = "";
    if (key === "pin") err = validatePin(val);
    if (key === "state") err = validateTextField("State", val);
    if (key === "city") err = validateTextField("City", val);
    setBillingErrors((f) => ({ ...f, [key]: err }));
  };

  const runAllValidations = () => {
    let valid = true;
    const newPaxErrors = passengers.map((p) => {
      const nameErr = validateName(p.name);
      const ageErr = validateAge(p.age);
      const genderErr = p.gender ? "" : "Please select gender";
      if (nameErr || ageErr || genderErr) valid = false;
      return { name: nameErr, age: ageErr, gender: genderErr };
    });
    setPassengerErrors(newPaxErrors);
    const phoneErr = validatePhone(contact.phone);
    const emailErr = validateEmail(contact.email);
    if (phoneErr || emailErr) valid = false;
    setContactErrors({ phone: phoneErr, email: emailErr });
    const pinErr = validatePin(billing.pin);
    const stateErr = validateTextField("State", billing.state);
    const cityErr = validateTextField("City", billing.city);
    if (pinErr || stateErr || cityErr) valid = false;
    setBillingErrors({ pin: pinErr, state: stateErr, city: cityErr });
    return valid;
  };

  // ── Launch QR + polling ──
  const launchPaymentQR = useCallback(
    async (traceId, resultIndex) => {
      setRetrying(true);
      setPaymentStatus("PENDING");
      try {
        const res = await initiatePayment({ traceId, resultIndex });
        // console.log("💳 PAYMENT INITIATE:", JSON.stringify(res, null, 2));
        if (res?.success && res?.data) {
          setPaymentData(res.data);
          setRetrying(false);
          setQrVisible(true);

          startPolling({
            traceId,
            resultIndex,
            intervalMs: 3000,
            onStatus: (statusData) => {
              setPaymentStatus(statusData?.status ?? "PENDING");
            },
            onSuccess: async (statusData) => {
              setPaymentStatus("SUCCESS");
              try {
                const bookRes = await bookTicket(traceId, resultIndex);
                // console.log("🎫 BOOK RESPONSE:", JSON.stringify(bookRes, null, 2));

                setTimeout(() => {
                  setQrVisible(false);
                  navigate("/buses/ticket", {
                    state: {
                      bookingResponse: bookRes,
                      bus,
                      contact,
                      billing,
                      passengers,
                      selectedSeatObjects,
                      selectedBoardingPoint,
                      selectedDroppingPoint,
                    },
                  });
                }, 1200);
              } catch (err) {
                // console.error("Book API error:", err);
                setQrVisible(false);
                const msg =
                  err?.message ||
                  "Payment was successful but booking confirmation failed. Please contact support.";
                Swal.fire({
                  icon: "error",
                  title: "Booking Failed",
                  text: msg,
                  confirmButtonColor: GREEN,
                }).then(() => {
                  goToTicketPageWithFailure(msg);
                });
              }
            },
            onExpired: () => {
              setPaymentStatus("EXPIRED");
            },
            onFailed: (statusData) => {
              setPaymentStatus("FAILED");
              stopPolling();
              setQrVisible(false);

              const msg =
                statusData?.message || "Payment could not be processed.";

              Swal.fire({
                icon: "error",
                title: "Payment Failed",
                html: `
                  <div style="font-size:14px;color:#374151;line-height:1.8;text-align:left">
                    <div style="margin-bottom:6px">
                      <span style="color:#6b7280;font-size:12px">Reason</span><br/>
                      <strong>${msg}</strong>
                    </div>
                    <div style="margin-bottom:6px">
                      <span style="color:#6b7280;font-size:12px">Order ID</span><br/>
                      <strong style="font-family:monospace">${statusData?.orderId || "-"
                  }</strong>
                    </div>
                    <div>
                      <span style="color:#6b7280;font-size:12px">Amount</span><br/>
                      <strong>₹${Number(statusData?.amount || 0).toLocaleString(
                    "en-IN",
                    { minimumFractionDigits: 2 },
                  )}</strong>
                    </div>
                  </div>
                `,
                confirmButtonColor: "#ef4444",
                confirmButtonText: "OK",
                timer: 10000,
                timerProgressBar: true,
                allowOutsideClick: false,
              }).then(() => {
                goToTicketPageWithFailure(msg, {
                  orderId: statusData?.orderId,
                  amount: statusData?.amount,
                });
              });
            },
          });
        } else {
          setRetrying(false);
          setQrVisible(false);
          Swal.fire({
            icon: "error",
            title: "Payment Init Failed",
            text:
              res?.error?.message ||
              res?.message ||
              "Could not initiate payment.",
            confirmButtonColor: GREEN,
          });
        }
      } catch (err) {
        setRetrying(false);
        setQrVisible(false);
        // console.error("Payment initiate error:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Could not initiate payment. Please try again.",
          confirmButtonColor: GREEN,
        });
      }
    },
    [
      initiatePayment,
      startPolling,
      stopPolling,
      navigate,
      bus,
      contact,
      billing,
      selectedBoardingPoint,
      selectedDroppingPoint,
      selectedSeatObjects,
      passengers,
      bookTicket,
      goToTicketPageWithFailure,
    ],
  );

  // ── Retry handler ──
  const handleRetry = useCallback(() => {
    const { traceId, resultIndex } = blockMeta;
    if (!traceId) return;
    stopPolling();
    launchPaymentQR(traceId, resultIndex);
  }, [launchPaymentQR, stopPolling, blockMeta]);

  // ── Close modal ──
  const handleCloseQR = useCallback(() => {
    stopPolling();
    setQrVisible(false);
    setPaymentData(null);
    setPaymentStatus("PENDING");
  }, [stopPolling]);

  // ── Main pay handler ──
  const handlePay = async () => {
    if (!runAllValidations()) {
      // Field-level errors are already shown below each invalid field
      // (see <Field error=... />), so no separate popup is needed here.
      // Just scroll the user up to the first error so they can see it.
      const firstErrorCard = document.querySelector(".pdf-card");
      firstErrorCard?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Refresh seat layout
    try {
      const seatRes = await fetchSeatLayout({
        traceId: bus.traceId ?? bus.trace_id,
        resultIndex: bus.resultIndex ?? bus.result_index,
      });
      if (seatRes?.success === false) {
        Swal.fire({
          icon: "error",
          title: "Session Expired",
          text:
            seatRes?.error?.message || "Session expired. Please search again.",
          confirmButtonColor: GREEN,
        });
        return;
      }
    } catch (e) {
      // console.log("⚠️ Seat refresh failed, trying block anyway:", e);
    }

    const passengerPayload = selectedSeatObjects.map((seat, idx) => {
      const p = passengers[idx];
      const nameParts = p.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || nameParts[0];
      const genderNum = p.gender === "male" ? 1 : p.gender === "female" ? 2 : 3;
      return {
        LeadPassenger: idx === 0,
        PassengerId: idx,
        Title: p.gender === "female" ? "Mrs." : "Mr.",
        FirstName: firstName,
        LastName: lastName,
        Email: contact.email,
        Phoneno: contact.phone,
        Gender: genderNum,
        Age: parseInt(p.age),
        Address: billing.address || "N/A",
        Seat: { ...seat, Price: { ...seat.Price } },
      };
    });

    const traceId = bus.traceId ?? bus.trace_id;
    const resultIndex = bus.resultIndex ?? bus.result_index;

    const payload = {
      TraceId: traceId,
      ResultIndex: String(resultIndex),
      BoardingPointId: String(selectedBoardingPoint?.id ?? "1"),
      DroppingPointId: String(selectedDroppingPoint?.id ?? "1"),
      Passenger: passengerPayload,
    };

    // console.log("🚌 BLOCK PAYLOAD:", JSON.stringify(payload, null, 2));

    try {
      const res = await blockSeat(payload);
      // console.log("✅ BLOCK RESPONSE:", JSON.stringify(res, null, 2));

      if (res?.success) {
        setBlockMeta({ traceId, resultIndex });

        await Swal.fire({
          icon: "success",
          title: "Seat Booked Successfully! 🎉",
          html: `
            <div style="font-size:14px;color:#374151;line-height:1.6">
              Your seat has been reserved.<br/>
              <strong>Redirecting to payment QR in <span id="swal-countdown">5</span>s...</strong>
            </div>
          `,
          confirmButtonColor: GREEN,
          confirmButtonText: "Pay Now",
          timer: 5000,
          timerProgressBar: true,
          allowOutsideClick: false,
          didOpen: () => {
            let count = 5;
            const el = document.getElementById("swal-countdown");
            const interval = setInterval(() => {
              count -= 1;
              if (el) el.textContent = count;
              if (count <= 0) clearInterval(interval);
            }, 1000);
          },
        });

        navigate("/buses/payment", {
          state: {
            traceId,
            resultIndex,
            bus,
            contact,
            billing,
            passengers,
            selectedSeatObjects,
            selectedBoardingPoint,
            selectedDroppingPoint,
          },
        });
      } else {
        // console.log("❌ BLOCK FAILED:", res?.error);
        Swal.fire({
          icon: "error",
          title: "Booking Failed",
          fontFamily: "Inter, sans-serif",
          text:
            res?.error?.message ||
            res?.message ||
            "Something went wrong. Please try again.",
          confirmButtonColor: GREEN,
        });
      }
    } catch (err) {
      // console.log("💥 BLOCK ERROR:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        fontFamily: "Inter, sans-serif",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: GREEN,
      });
    }
  };

  return (
    <>
      <div className="pdf-page">
        <div>
          {/* Passenger Details */}
          <div className="pdf-card">
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                color: "#111",
                marginBottom: 16,
              }}
            >
              Passenger Details
            </div>
            {selectedSeatObjects.map((seat, idx) => (
              <PassengerBlock
                key={seat.SeatName}
                index={idx + 1}
                seat={seat}
                isLead={selectedSeatObjects.length === 1 || idx === 0}
                form={passengers[idx]}
                errors={passengerErrors[idx]}
                onChange={(key, val) => updatePassenger(idx, key, val)}
              />
            ))}
          </div>

          {/* Contact Details */}
          <div className="pdf-card">
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                color: "#111",
                marginBottom: 4,
              }}
            >
              Contact Details
            </div>
            <div
              style={{
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                color: "#9ca3af",
                marginBottom: 14,
              }}
            >
              Ticket details will be sent to
            </div>
            <div className="pdf-fields-2">
              <Field label="Phone Number" required error={contactErrors.phone}>
                <div style={{ display: "flex", gap: 6 }}>
                  <FocusSelect
                    value={contact.countryCode}
                    onChange={(e) =>
                      setContact((f) => ({ ...f, countryCode: e.target.value }))
                    }
                    style={{ width: 72, flexShrink: 0 }}
                  >
                    <option>+91</option>
                    <option>+1</option>
                    <option>+44</option>
                    <option>+61</option>
                    <option>+971</option>
                  </FocusSelect>
                  <FocusInput
                    type="tel"
                    placeholder="Enter mobile number"
                    value={contact.phone}
                    error={contactErrors.phone}
                    maxLength={10}
                    onChange={(e) =>
                      updateContact("phone", sanitizeDigitsOnly(e.target.value))
                    }
                    style={{ flex: 1, width: "auto" }}
                  />
                </div>
              </Field>
              <Field label="Email Address" required error={contactErrors.email}>
                <FocusInput
                  type="email"
                  placeholder="Enter email"
                  value={contact.email}
                  error={contactErrors.email}
                  onChange={(e) =>
                    updateContact("email", sanitizeEmail(e.target.value))
                  }
                />
              </Field>
            </div>
          </div>

          {/* Billing Details */}
          <div className="pdf-card">
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                color: "#111",
                marginBottom: 16,
              }}
            >
              Billing Details
            </div>
            <div className="pdf-billing-top">
              <Field label="Address">
                <FocusInput
                  type="text"
                  placeholder="Enter Address"
                  value={billing.address}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val.startsWith(" ")) val = val.trimStart();
                    setBilling((f) => ({ ...f, address: val }));
                  }}
                />
              </Field>
              <Field label="Pin Code" error={billingErrors.pin}>
                <FocusInput
                  type="text"
                  placeholder="Enter Pincode"
                  value={billing.pin}
                  error={billingErrors.pin}
                  maxLength={6}
                  onChange={(e) =>
                    updateBilling("pin", sanitizeDigitsOnly(e.target.value))
                  }
                />
              </Field>
            </div>
            <div className="pdf-fields-2">
              <Field label="State" error={billingErrors.state}>
                <FocusInput
                  type="text"
                  placeholder="Enter State"
                  value={billing.state}
                  error={billingErrors.state}
                  onChange={(e) =>
                    updateBilling("state", sanitizeTextOnly(e.target.value))
                  }
                />
              </Field>
              <Field label="City" error={billingErrors.city}>
                <FocusInput
                  type="text"
                  placeholder="Enter City"
                  value={billing.city}
                  error={billingErrors.city}
                  onChange={(e) =>
                    updateBilling("city", sanitizeTextOnly(e.target.value))
                  }
                />
              </Field>
            </div>
          </div>
        </div>

        <SummaryPanel
          bus={bus}
          selectedSeatObjects={selectedSeatObjects}
          selectedBoardingPoint={selectedBoardingPoint}
          selectedDroppingPoint={selectedDroppingPoint}
          onPay={handlePay}
          paying={paying}
        />
      </div>

      {/* QR Payment Modal */}
      {/* <BusPaymentQRModal
        visible={qrVisible}
        onClose={handleCloseQR}
        paymentData={paymentData}
        onRetry={handleRetry}
        onSuccess={() => { }}
        onFailed={() => navigate("/")}
        retrying={retrying}
        paymentStatus={paymentStatus}
        traceId={blockMeta.traceId}
        resultIndex={blockMeta.resultIndex}
      /> */}
    </>
  );
};

export default PassengerDetailsForm;
