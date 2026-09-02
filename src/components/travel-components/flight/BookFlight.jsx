import { useCountries } from "components/travel-hooks/flight/useCountries";
import { useFareQuote } from "components/travel-hooks/flight/useFareQuote";
import { useFareRule } from "components/travel-hooks/flight/useFareRule";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


// ─── SVG Icons ────────────────────────────────────────────────────────────────
const flightlogo = "/bookflighticon.svg";
const planlogo = "/planeicon.svg";

const ChevronDown = ({ size = 16, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LuggageIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="7" width="12" height="14" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 4 0v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);

const CabinBagIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="13" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

// ─── Static Fallback Fare Rules ───────────────────────────────────────────────
const FARE_RULES_FALLBACK = [
  {
    label: "Time Frame to cancel",
    sublabel: "Before scheduled departure time",
    column: "Airlines Fees\nper passenger",
    rows: [
      { desc: "Cancel Before 24 hours of departure time.", fee: "₹ 3,999" },
      {
        desc: "Cancel within 24 hours & before 4 hours of departure time.",
        fee: "₹ 4,999",
      },
    ],
  },
  {
    label: "Time Frame to reschedule",
    sublabel: "Before scheduled departure time",
    column: "Airlines Fees\nper passenger",
    rows: [
      { desc: "Reschedule before 24 hours of departure time.", fee: "₹ 2,999" },
      {
        desc: "Reschedule within 24 hours & before 4 hours of departure time.",
        fee: "₹ 2,999",
      },
    ],
  },
];


const AIRLINE_LOGO_MAP = {
  indigo: "/navbaricons/indigo.png",
  "6e": "/navbaricons/indigo.png",

  spicejet: "/navbaricons/spicejet.svg",
  sg: "/navbaricons/spicejet.svg",

  "air india": "/navbaricons/airindia.png",
  ai: "/navbaricons/airindia.png",

  "air india express": "/navbaricons/airindiaexpress.png",
  ix: "/navbaricons/airindiaexpress.png",

  "air asia": "/navbaricons/airasia.png",
  i5: "/navbaricons/airasia.png",

  "fly dubai": "/navbaricons/flydubai.png",
  flydubai: "/navbaricons/flydubai.png",
  fz: "/navbaricons/flydubai.png",

  "go air": "/navbaricons/goair.png",
  goair: "/navbaricons/goair.png",
  g8: "/navbaricons/goair.png",
};

const getAirlineLogo = (airline = {}) => {
  const code = (airline.AirlineCode || "").toLowerCase().trim();
  const name = (airline.AirlineName || "").toLowerCase().trim();

  return (
    AIRLINE_LOGO_MAP[code] ||
    AIRLINE_LOGO_MAP[name] ||
    flightlogo
  );
};

// ─── Title options — har passenger type ke liye same 4 options: Mstr, Mr, Ms, Mrs ──
const TITLE_OPTIONS = {
  adults: ["Mstr", "Mr", "Ms", "Mrs"],
  children: ["Mstr", "Mr", "Ms", "Mrs"],
  infants: ["Mstr", "Mr", "Ms", "Mrs"],
};

// ─── Validation helpers ───────────────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const MOBILE_REGEX = /^\d{10}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const noLeadingSpaces = (val) => val.replace(/^\s+/, "");

// ── Age calculator — DOB se AGE nikalta hai. referenceDate na diya jaaye to
//    "aaj ki date" ke against calculate hota hai. ──
const calcAge = (dob, referenceDate) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth)) return null;
  const ref = referenceDate ? new Date(referenceDate) : new Date();
  if (isNaN(ref)) return null;
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;
  return age;
};

const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const getDobLimits = (type) => {
  const today = new Date();
  const maxDate = new Date(today);
  const minDate = new Date(today);

  if (type === "adults") {
    // Adult: age >= 12 hamesha. Calendar me sirf "today - 12yrs" tak
    // (usse recent) ki dates DISABLE — max selectable date = today - 12yrs.
    maxDate.setFullYear(today.getFullYear() - 12);
    minDate.setFullYear(today.getFullYear() - 100); // reasonable far back limit
  } else if (type === "children") {
    // Child: age 2-12 → max = today-2yrs, min = today-12yrs
    maxDate.setFullYear(today.getFullYear() - 2);
    minDate.setFullYear(today.getFullYear() - 12);
  } else if (type === "infants") {
    // Infant: age 0-2 → max = today, min = today-2yrs
    maxDate.setFullYear(today.getFullYear());
    minDate.setFullYear(today.getFullYear() - 2);
  }

  return { min: toISODate(minDate), max: toISODate(maxDate) };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    : "--";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    : "";


const newTraveller = (type) => ({
  id: Date.now() + Math.random(),
  title: type === "adults" ? "Mr" : TITLE_OPTIONS[type]?.[0] || "Mr",
  firstName: "",
  lastName: "",
  dob: "",
  nationality: "IN",
  passportNumber: "",
  passportExpiry: "",
  passportIssueDate: "",
  passportIssueCountry: "",
  passportIssueCountryName: "",
  panNumber: "",
  // ── Sirf "adults" type ke liye maayne rakhta hai, aur wo bhi sirf tab
  //    jab traveller ki age 12-17 ho (minor adult). Default false = khud
  //    ka document. Checkbox tick hone par true hota hai. ──
  minorUsesGuardian: false,
  // Guardian fields — Title, FirstName, LastName + doc-type choice (PAN/Passport)
  guardianTitle: TITLE_OPTIONS.adults[0],
  guardianFirstName: "",
  guardianLastName: "",
  guardianDocType: "pan", // "pan" | "passport"
  guardianPan: "",
  guardianPassportNumber: "",
  guardianPassportExpiry: "",
  // ── "Same as Adult details?" checkbox — true hone par guardian fields
  //    primary adult traveller se copy + lock (readOnly) ho jaate hain. ──
  guardianSameAsAdult: false,
});

const buildInitialTravellers = (passengers) => {
  const adults = passengers?.adults || 1;
  const children = passengers?.children || 0;
  const infants = passengers?.infants || 0;
  return {
    adults: Array.from({ length: adults }, () => newTraveller("adults")),
    children: Array.from({ length: children }, () => newTraveller("children")),
    infants: Array.from({ length: infants }, () => newTraveller("infants")),
  };
};

const labelStyle = {
  position: "absolute",
  top: -9,
  left: 10,
  fontSize: 11,
  color: "#6b7280",
  background: "#fff",
  padding: "0 4px",
  zIndex: 1,
  pointerEvents: "none",
};

const errStyle = {
  fontSize: 11,
  color: "#dc2626",
  marginTop: 4,
  display: "block",
};

// ─── Validation — passport/PAN age-aware; guardian doc-type aware (PAN/Passport) ──
// ── NOTE: Adult (18+) hamesha apne khud ke documents deta hai. Child aur
//    Infant unchanged (Child = own docs, Infant = guardian only). Adult
//    jo 12-17 age ka hai (minor adult) uske liye `data.minorUsesGuardian`
//    flag decide karta hai — true ho to Guardian ki validation chalegi,
//    warna normal apne document ki validation. ──
const validateTraveller = (type, data, opts = {}) => {
  const {
    requiresPassport = false,
    requiresPan = false,
    flightDepartureDate = null,
  } = opts;
  const errs = {};

  const allowedTitles = TITLE_OPTIONS[type] || [];
  if (!data.title || !allowedTitles.includes(data.title)) {
    errs.title = "Please select a valid title";
  }

  if (!data.firstName.trim()) errs.firstName = "First name is required";
  if (!data.lastName.trim()) errs.lastName = "Last name is required";
  if (!data.dob) errs.dob = "Date of birth is required";

  // ── Minor Adult (12-17) doc choice ──
  const age = calcAge(data.dob, flightDepartureDate);
  const isMinorAdult =
    type === "adults" && age !== null && age >= 12 && age <= 17;
  const minorUsesGuardian = isMinorAdult && !!data.minorUsesGuardian;

  // ── Passport required (Book/Ticket/FullDetail — koi bhi) → Child/Infant
  //    apna khud ka Passport denge, Adult jaisa. Guardian bilkul nahi. ──────
  const childInfantOwnDocs =
    (type === "infants" || type === "children") && requiresPassport;

  // ── Guardian sirf tab jab Passport NAHI chahiye lekin PAN chahiye ──
  const needsGuardianOnly =
    (type === "infants" || type === "children") &&
    !requiresPassport &&
    requiresPan;

  const usesGuardian = needsGuardianOnly || minorUsesGuardian;
  const usesOwnDocs =
    (type === "adults" && !minorUsesGuardian) || childInfantOwnDocs;

  if (usesOwnDocs) {
    if (requiresPassport) {
      if (!data.passportNumber || !data.passportNumber.trim()) {
        errs.passportNumber = "Passport number is required";
      }
      if (!data.passportExpiry) {
        errs.passportExpiry = "Passport expiry date is required";
      } else {
        const expiry = new Date(data.passportExpiry);
        const travelDate = flightDepartureDate ? new Date(flightDepartureDate) : new Date();
        const minValidTill = new Date(travelDate);
        minValidTill.setMonth(minValidTill.getMonth() + 6);

        if (expiry <= travelDate) {
          errs.passportExpiry = "Passport must not be expired";
        } else if (expiry < minValidTill) {
          errs.passportExpiry =
            "Passport must be valid for at least 6 months from travel date";
        }
      }

      if (!data.passportIssueDate) {
        errs.passportIssueDate = "Passport issue date is required";
      } else if (
        data.passportExpiry &&
        new Date(data.passportIssueDate) >= new Date(data.passportExpiry)
      ) {
        errs.passportIssueDate = "Issue date must be before expiry date";
      } else if (new Date(data.passportIssueDate) > new Date()) {
        errs.passportIssueDate = "Issue date cannot be in the future";
      }

      if (!data.passportIssueCountry || !data.passportIssueCountry.trim()) {
        errs.passportIssueCountry = "Passport issue country is required";
      }
    }

    if (type === "adults" && requiresPan) {
      if (!data.panNumber || !data.panNumber.trim()) {
        errs.panNumber = "PAN number is required";
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(data.panNumber.trim())) {
        errs.panNumber = "Enter a valid PAN number";
      }
    }
  }

  // ── Guardian validation — Title + FirstName + LastName hamesha mandatory.
  //    Document: guardianDocType decide karta hai PAN chahiye ya Passport
  //    (Number + Expiry). Ye block Infant/Child (jab Passport nahi chahiye
  //    par PAN chahiye) ke liye hamesha PAN, aur Adult (12-17) ke liye tab
  //    chalta hai jab wo Guardian checkbox tick kare. ──
  if (usesGuardian) {
    if (!data.guardianTitle || !TITLE_OPTIONS.adults.includes(data.guardianTitle)) {
      errs.guardianTitle = "Please select a valid title";
    }
    if (!data.guardianFirstName || !data.guardianFirstName.trim())
      errs.guardianFirstName = "Guardian first name is required";
    if (!data.guardianLastName || !data.guardianLastName.trim())
      errs.guardianLastName = "Guardian last name is required";

    // needsGuardianOnly (child/infant) case me hamesha PAN — minorUsesGuardian
    // (adult 12-17) case me purana passport/pan choice as-is rehne diya
    const guardianUsesPassport =
      !needsGuardianOnly && data.guardianDocType === "passport";

    if (guardianUsesPassport) {
      if (!data.guardianPassportNumber || !data.guardianPassportNumber.trim()) {
        errs.guardianPassportNumber = "Guardian passport number is required";
      }
      if (!data.guardianPassportExpiry) {
        errs.guardianPassportExpiry = "Guardian passport expiry is required";
      } else if (new Date(data.guardianPassportExpiry) <= new Date()) {
        errs.guardianPassportExpiry = "Guardian passport must not be expired";
      }
    } else {
      if (!data.guardianPan || !data.guardianPan.trim()) {
        errs.guardianPan = "Guardian PAN number is required";
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(data.guardianPan.trim())) {
        errs.guardianPan = "Enter a valid PAN number";
      }
    }
  }

  return errs;
};

// ─── GST validation ───────────────────────────────────────────────────────────
const validateGst = (data) => {
  const errs = {};

  if (!data.GSTCompanyName || !data.GSTCompanyName.trim())
    errs.GSTCompanyName = "Company name is required";

  if (!data.GSTNumber || !data.GSTNumber.trim()) {
    errs.GSTNumber = "GST number is required";
  } else if (!GSTIN_REGEX.test(data.GSTNumber.trim().toUpperCase())) {
    errs.GSTNumber = "Enter a valid GSTIN";
  }

  if (!data.GSTCompanyAddress || !data.GSTCompanyAddress.trim())
    errs.GSTCompanyAddress = "Company address is required";

  if (
    !data.GSTCompanyContactNumber ||
    !MOBILE_REGEX.test(data.GSTCompanyContactNumber)
  )
    errs.GSTCompanyContactNumber = "Enter a valid 10-digit contact number";

  if (!data.GSTCompanyEmail || !EMAIL_REGEX.test(data.GSTCompanyEmail))
    errs.GSTCompanyEmail = "Enter a valid email address";

  return errs;
};

// ─── GST Toggle ───────────────────────────────────────────────────────────────
function GSTToggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onChange}
      aria-pressed={checked}
      disabled={disabled}
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        flexShrink: 0,
        background: checked ? "#16a34a" : "#d1d5db",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        transition: "background 0.2s",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 20 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

// ─── Passport Issue Country Autocomplete ─────────────────────────────────────
function CountryAutocomplete({ value, displayValue, onSelect, hasError, fieldErr }) {
  const { countries, loading, searchCountries, clearCountries } =
    useCountries();
  const [query, setQuery] = useState(displayValue || "");
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const debounceRef = useState({ current: null })[0];
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(displayValue || "");
  }, [displayValue]);

  const updateCoords = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const handleInput = (val) => {
    setQuery(val);
    onSelect(null, val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchCountries(val);
      updateCoords();
      setOpen(true);
    }, 300);
  };

  const handleFocus = () => {
    updateCoords();
    setOpen(true);
    searchCountries(query);
  };

  const handlePick = (c) => {
    setQuery(c.name);
    setOpen(false);
    clearCountries();
    onSelect(c.code, c.name);
  };

  useEffect(() => {
    if (!open) return;
    const handler = () => updateCoords();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open]);

  return (
    <div style={{ position: "relative" }}>
      <label style={labelStyle}>Passport Issue Country *</label>
      <input
        ref={inputRef}
        className={`input-field${hasError ? " input-err" : ""}`}
        placeholder="Start typing e.g. India"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {fieldErr}

      {open &&
        (loading || countries.length > 0) &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              maxHeight: 220,
              overflowY: "auto",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            {loading && (
              <div style={{ padding: "8px 12px", fontSize: 12, color: "#9ca3af" }}>
                Searching...
              </div>
            )}
            {!loading &&
              countries.map((c) => (
                <div
                  key={c.code + c.name}
                  onMouseDown={() => handlePick(c)}
                  style={{
                    padding: "8px 12px",
                    fontSize: 13,
                    color: "#374151",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#fff")
                  }
                >
                  {c.name}{" "}
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>
                    ({c.code})
                  </span>
                </div>
              ))}
          </div>,
          document.body
        )}
    </div>
  );
}

// ─── Single Traveller Card ────────────────────────────────────────────────────
function TravellerCard({
  type,
  data,
  index,
  total,
  onChange,
  onRemove,
  errors,
  showErrors,
  requiresPassport,
  requiresPan,
  flightDepartureDate,
  primaryAdult,
}) {
  const titles = TITLE_OPTIONS[type] || ["Mstr", "Mr", "Ms", "Mrs"];
  const labelMap = { adults: "Adult", children: "Child", infants: "Infant" };

  const age = calcAge(data.dob, flightDepartureDate);
  const isMinorAdult = type === "adults" && age !== null && age >= 12 && age <= 17;
  const minorUsesGuardian = isMinorAdult && !!data.minorUsesGuardian;
  const docRequired = requiresPassport || requiresPan;
  const dobLimits = getDobLimits(type);

  // ── Passport required (Book/Ticket/FullDetail — koi bhi) → Child/Infant
  //    apna khud ka Passport denge, Adult jaisa. Guardian bilkul nahi. ──────
  const childInfantOwnDocs =
    (type === "infants" || type === "children") && requiresPassport;

  // ── Guardian sirf tab jab Passport NAHI chahiye lekin PAN chahiye,
  //    aur guardian hamesha sirf PAN dega (Passport option nahi dikhega). ──
  const needsGuardianOnly =
    (type === "infants" || type === "children") &&
    !requiresPassport &&
    requiresPan;

  const usesGuardian = needsGuardianOnly || minorUsesGuardian;
  const usesOwnDocs =
    (type === "adults" && !minorUsesGuardian) || childInfantOwnDocs;

  const handleText = (field, val) => {
    onChange({ ...data, [field]: noLeadingSpaces(val) });
  };

  // ── "Same as Adult" — primary adult ka naam + document guardian
  //    fields me copy karke unhe lock (readOnly) kar deta hai jab tak
  //    checkbox uncheck na ho jaaye. ──
  const handleSameAsAdult = (checked) => {
    if (checked && primaryAdult) {
      onChange({
        ...data,
        guardianSameAsAdult: true,
        guardianTitle: primaryAdult.title || data.guardianTitle,
        guardianFirstName: primaryAdult.firstName || "",
        guardianLastName: primaryAdult.lastName || "",
        guardianDocType: (!needsGuardianOnly && requiresPassport) ? "passport" : "pan",
        guardianPan: primaryAdult.panNumber || "",
        guardianPassportNumber: primaryAdult.passportNumber || "",
        guardianPassportExpiry: primaryAdult.passportExpiry || "",
      });
    } else {
      onChange({ ...data, guardianSameAsAdult: false });
    }
  };

  const fieldErr = (field) =>
    showErrors && errors?.[field] ? (
      <span style={errStyle}>⚠ {errors[field]}</span>
    ) : null;

  return (
    <div
      style={{
        border: `1px solid ${showErrors && Object.keys(errors || {}).length > 0 ? "#fca5a5" : "#e5e7eb"}`,
        borderRadius: 12,
        padding: 20,
        marginTop: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 13, color: "#6b7280" }}>
          {labelMap[type]} {index + 1}
          {isMinorAdult && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 11,
                fontWeight: 700,
                color: "#1e40af",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 999,
                padding: "1px 8px",
              }}
            >
              Minor (12–17)
            </span>
          )}
        </span>
        {total > 1 && (
          <button
            onClick={onRemove}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 13,
              padding: "2px 6px",
              borderRadius: 6,
            }}
          >
            <TrashIcon /> Remove
          </button>
        )}
      </div>

      {/* Title radios */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {titles.map((t) => (
            <label
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                fontSize: 14,
                color: "#374151",
              }}
            >
              <input
                type="radio"
                name={`${type}-${data.id}-title`}
                value={t}
                checked={data.title === t}
                onChange={() => onChange({ ...data, title: t })}
                style={{ accentColor: "#16a34a" }}
              />
              {t}
            </label>
          ))}
        </div>
        {fieldErr("title")}
      </div>

      {/* Name fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
        className="two-col"
      >
        <div style={{ position: "relative" }}>
          <label style={labelStyle}>First Name & Middle Name *</label>
          <input
            className={`input-field${showErrors && errors?.firstName ? " input-err" : ""}`}
            placeholder="First Name & Middle Name"
            value={data.firstName}
            onChange={(e) => handleText("firstName", e.target.value)}
          />
          {fieldErr("firstName")}
        </div>
        <div style={{ position: "relative" }}>
          <label style={labelStyle}>Last Name *</label>
          <input
            className={`input-field${showErrors && errors?.lastName ? " input-err" : ""}`}
            placeholder="Last Name"
            value={data.lastName}
            onChange={(e) => handleText("lastName", e.target.value)}
          />
          {fieldErr("lastName")}
        </div>
      </div>

      {/* DOB */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
        className="two-col"
      >
        <div style={{ position: "relative" }}>
          <label style={labelStyle}>Date of Birth *</label>
          <input
            className={`input-field${showErrors && errors?.dob ? " input-err" : ""}`}
            type="date"
            min={dobLimits.min}
            max={dobLimits.max}
            value={data.dob}
            onChange={(e) => onChange({ ...data, dob: e.target.value })}
          />
          {fieldErr("dob")}
        </div>
        <div style={{ position: "relative" }}>
          <label style={labelStyle}>Nationality</label>
          <input
            className="input-field"
            value="India"
            readOnly
            style={{
              // background: "#f9fafb",
              cursor: "default",
              color: "#374151",
            }}
          />
        </div>
      </div>

      {/* Passport fields — sirf tab jab traveller khud document de raha ho */}
      {usesOwnDocs && requiresPassport && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
            className="two-col"
          >
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Passport Number *</label>
              <input
                className={`input-field${showErrors && errors?.passportNumber ? " input-err" : ""}`}
                placeholder="Passport Number"
                value={data.passportNumber}
                onChange={(e) =>
                  handleText("passportNumber", e.target.value.toUpperCase())
                }
              />
              {fieldErr("passportNumber")}
            </div>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Passport Expiry Date *</label>
              <input
                className={`input-field${showErrors && errors?.passportExpiry ? " input-err" : ""}`}
                type="date"
                value={data.passportExpiry}
                onChange={(e) =>
                  onChange({ ...data, passportExpiry: e.target.value })
                }
              />
              {fieldErr("passportExpiry")}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
            className="two-col"
          >
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Passport Issue Date *</label>
              <input
                className={`input-field${showErrors && errors?.passportIssueDate ? " input-err" : ""}`}
                type="date"
                value={data.passportIssueDate}
                onChange={(e) =>
                  onChange({ ...data, passportIssueDate: e.target.value })
                }
              />
              {fieldErr("passportIssueDate")}
            </div>
            <CountryAutocomplete
              value={data.passportIssueCountry}
              displayValue={data.passportIssueCountryName}
              hasError={showErrors && !!errors?.passportIssueCountry}
              fieldErr={fieldErr("passportIssueCountry")}
              onSelect={(code, name) =>
                onChange({
                  ...data,
                  passportIssueCountry: code || "",
                  passportIssueCountryName: name,
                })
              }
            />
          </div>
        </>
      )}

      {/* PAN field — sirf adults, sirf tab jab traveller khud document de raha ho */}
      {type === "adults" && usesOwnDocs && requiresPan && (
        <div
          style={{
            position: "relative",
            maxWidth: "calc(50% - 7px)",
            marginBottom: 14,
          }}
        >
          <label style={labelStyle}>PAN Number *</label>
          <input
            className={`input-field${showErrors && errors?.panNumber ? " input-err" : ""}`}
            placeholder="ABCDE1234F"
            value={data.panNumber}
            onChange={(e) =>
              handleText("panNumber", e.target.value.toUpperCase())
            }
          />
          {fieldErr("panNumber")}
        </div>
      )}

      {/* ── Minor Adult (12-17) doc choice — simple checkbox, passport/PAN
           fields ke turant niche. Tick hote hi minorUsesGuardian = true,
           khud ke document fields hide ho jaate hain aur Guardian block
           dikhta hai. ── */}
      {isMinorAdult && docRequired && (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            cursor: "pointer",
            fontSize: 12.5,
            color: "#4b5563",
            marginBottom: 14,
          }}
        >
          <input
            type="checkbox"
            checked={minorUsesGuardian}
            onChange={(e) =>
              onChange({ ...data, minorUsesGuardian: e.target.checked })
            }
            style={{
              width: 14,
              height: 14,
              accentColor: "#16a34a",
              cursor: "pointer",
              flexShrink: 0,
            }}
          />
          Use Guardian's details?
        </label>
      )}



      {/* ── Guardian Details block — Infant/Child ke liye tab jab Passport
           nahi chahiye lekin PAN chahiye, aur Minor Adult (12-17) ke liye
           tab jab usne checkbox tick kiya ho. ── */}
      {usesGuardian && (
        <div
          style={{
            border: "1px dashed #d1d5db",
            borderRadius: 8,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#374151",
              marginBottom: 10,
            }}
          >
            {needsGuardianOnly ? "Guardian Details (required)" : "Guardian Details"}
          </div>

          {/* ── "Same as Adult details?" — ek click me primary adult ka
               naam + document guardian fields me copy ho jaata hai aur
               fields lock (readOnly) ho jaate hain jab tak uncheck na ho. ── */}
          {primaryAdult && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                fontSize: 12.5,
                color: "#4b5563",
                marginBottom: 14,
              }}
            >
              <input
                type="checkbox"
                checked={!!data.guardianSameAsAdult}
                onChange={(e) => handleSameAsAdult(e.target.checked)}
                style={{
                  width: 14,
                  height: 14,
                  accentColor: "#16a34a",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              Same as Adult details?
            </label>
          )}

          {/* Guardian title */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {TITLE_OPTIONS.adults.map((t) => (
                <label
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: data.guardianSameAsAdult ? "default" : "pointer",
                    fontSize: 14,
                    color: data.guardianSameAsAdult ? "#9ca3af" : "#374151",
                  }}
                >
                  <input
                    type="radio"
                    name={`${data.id}-guardian-title`}
                    checked={data.guardianTitle === t}
                    disabled={!!data.guardianSameAsAdult}
                    onChange={() => onChange({ ...data, guardianTitle: t })}
                    style={{ accentColor: "#16a34a" }}
                  />
                  {t}
                </label>
              ))}
            </div>
            {fieldErr("guardianTitle")}
          </div>

          <div
            className="two-col"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Guardian First Name *</label>
              <input
                className={`input-field${showErrors && errors?.guardianFirstName ? " input-err" : ""}`}
                placeholder="Guardian First Name"
                value={data.guardianFirstName}
                readOnly={!!data.guardianSameAsAdult}
                style={
                  data.guardianSameAsAdult
                    ? { background: "#f9fafb", color: "#374151", cursor: "default" }
                    : undefined
                }
                onChange={(e) =>
                  onChange({
                    ...data,
                    guardianFirstName: noLeadingSpaces(e.target.value),
                  })
                }
              />
              {fieldErr("guardianFirstName")}
            </div>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Guardian Last Name *</label>
              <input
                className={`input-field${showErrors && errors?.guardianLastName ? " input-err" : ""}`}
                placeholder="Guardian Last Name"
                value={data.guardianLastName}
                readOnly={!!data.guardianSameAsAdult}
                style={
                  data.guardianSameAsAdult
                    ? { background: "#f9fafb", color: "#374151", cursor: "default" }
                    : undefined
                }
                onChange={(e) =>
                  onChange({
                    ...data,
                    guardianLastName: noLeadingSpaces(e.target.value),
                  })
                }
              />
              {fieldErr("guardianLastName")}
            </div>
          </div>

          {/* ── Guardian document type — PAN ya Passport. Ye choice sirf
               Minor-Adult (12-17) guardian case me dikhta hai. Child/Infant
               ka guardian (needsGuardianOnly) hamesha PAN-only hota hai,
               isliye is toggle ki zaroorat hi nahi. ── */}
          {!needsGuardianOnly && (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Choose Guardian Document :
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: data.guardianSameAsAdult ? "default" : "pointer",
                    fontSize: 13,
                    color: data.guardianSameAsAdult ? "#9ca3af" : "#374151",
                  }}
                >
                  <input
                    type="radio"
                    name={`${data.id}-guardian-doctype`}
                    checked={data.guardianDocType !== "passport"}
                    disabled={!!data.guardianSameAsAdult}
                    onChange={() => onChange({ ...data, guardianDocType: "pan" })}
                    style={{ accentColor: "#16a34a" }}
                  />
                  PAN Card
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: data.guardianSameAsAdult ? "default" : "pointer",
                    fontSize: 13,
                    color: data.guardianSameAsAdult ? "#9ca3af" : "#374151",
                  }}
                >
                  <input
                    type="radio"
                    name={`${data.id}-guardian-doctype`}
                    checked={data.guardianDocType === "passport"}
                    disabled={!!data.guardianSameAsAdult}
                    onChange={() =>
                      onChange({ ...data, guardianDocType: "passport" })
                    }
                    style={{ accentColor: "#16a34a" }}
                  />
                  Passport
                </label>
              </div>
            </div>
          )}

          {/* Guardian PAN — jab "pan" chuna ho, ya needsGuardianOnly (child/
               infant) case ho (jahan PAN hi ek option hai, doc-type toggle
               dikhta hi nahi) */}
          {(needsGuardianOnly || data.guardianDocType !== "passport") && (
            <div
              style={{
                position: "relative",
                maxWidth: "calc(50% - 7px)",
                marginBottom: 14,
              }}
            >
              <label style={labelStyle}>Guardian PAN Number *</label>
              <input
                className={`input-field${showErrors && errors?.guardianPan ? " input-err" : ""}`}
                placeholder="ABCDE1234F"
                value={data.guardianPan}
                readOnly={!!data.guardianSameAsAdult}
                style={
                  data.guardianSameAsAdult
                    ? { background: "#f9fafb", color: "#374151", cursor: "default" }
                    : undefined
                }
                onChange={(e) =>
                  onChange({
                    ...data,
                    guardianPan: e.target.value.toUpperCase(),
                  })
                }
              />
              {fieldErr("guardianPan")}
            </div>
          )}

          {/* Guardian Passport Number + Expiry — sirf tab jab "passport" chuna
               ho AUR ye needsGuardianOnly case na ho (child/infant guardian
               kabhi passport nahi deta) */}
          {!needsGuardianOnly && data.guardianDocType === "passport" && (
            <div
              className="two-col"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>Guardian Passport Number *</label>
                <input
                  className={`input-field${showErrors && errors?.guardianPassportNumber ? " input-err" : ""}`}
                  placeholder="Guardian Passport Number"
                  value={data.guardianPassportNumber}
                  readOnly={!!data.guardianSameAsAdult}
                  style={
                    data.guardianSameAsAdult
                      ? { background: "#f9fafb", color: "#374151", cursor: "default" }
                      : undefined
                  }
                  onChange={(e) =>
                    onChange({
                      ...data,
                      guardianPassportNumber: e.target.value.toUpperCase(),
                    })
                  }
                />
                {fieldErr("guardianPassportNumber")}
              </div>
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>Guardian Passport Expiry *</label>
                <input
                  className={`input-field${showErrors && errors?.guardianPassportExpiry ? " input-err" : ""}`}
                  type="date"
                  value={data.guardianPassportExpiry}
                  readOnly={!!data.guardianSameAsAdult}
                  style={
                    data.guardianSameAsAdult
                      ? { background: "#f9fafb", color: "#374151", cursor: "default" }
                      : undefined
                  }
                  onChange={(e) =>
                    onChange({
                      ...data,
                      guardianPassportExpiry: e.target.value,
                    })
                  }
                />
                {fieldErr("guardianPassportExpiry")}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Traveller Group Section ──────────────────────────────────────────────────
function TravellerGroup({
  type,
  label,
  ageLabel,
  list,
  onChange,
  onAdd,
  onRemove,
  allErrors,
  showErrors,
  requiresPassport,
  requiresPan,
  flightDepartureDate,
  primaryAdult,
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
            {label}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 6 }}>
            {ageLabel}
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            color: "#6b7280",
            background: "#f3f4f6",
            borderRadius: 999,
            padding: "2px 10px",
            fontWeight: 500,
          }}
        >
          {list.length} Added
        </span>
      </div>

      {list.map((traveller, idx) => (
        <TravellerCard
          key={traveller.id}
          type={type}
          data={traveller}
          index={idx}
          total={list.length}
          onChange={(updated) => onChange(type, traveller.id, updated)}
          onRemove={() => onRemove(type, traveller.id)}
          errors={allErrors?.[traveller.id]}
          showErrors={showErrors}
          requiresPassport={requiresPassport}
          requiresPan={requiresPan}
          flightDepartureDate={flightDepartureDate}
          primaryAdult={primaryAdult}
        />
      ))}
    </div>
  );
}

// ─── Baggage Tab ──────────────────────────────────────────────────────────────
function BaggageTab({ segs }) {
  const hasBaggageData = segs.some((seg) => seg?.Baggage || seg?.CabinBaggage);

  if (segs.length > 0 && !hasBaggageData) {
    return (
      <div
        style={{
          padding: "16px 20px",
          color: "#9ca3af",
          fontSize: 13,
          textAlign: "center",
        }}
      >
        Baggage information not available for this fare.
      </div>
    );
  }

  const displayData =
    segs.length > 0
      ? segs
      : [
        {
          Origin: { Airport: { AirportCode: "BOM" } },
          Destination: { Airport: { AirportCode: "DED" } },
          Baggage: "15 kg",
          CabinBaggage: "7 kg",
        },
        {
          Origin: { Airport: { AirportCode: "DED" } },
          Destination: { Airport: { AirportCode: "DEL" } },
          Baggage: "15 kg",
          CabinBaggage: "7 kg",
        },
      ];

  return (
    <div style={{ padding: "16px 20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {displayData.map((seg, i) => (
          <div key={i}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={getAirlineLogo(seg?.Airline)}
                  alt={seg?.Airline?.AirlineName || "Airline"}
                  style={{ width: 22, height: 22 }}
                  onError={(e) => {
                    console.log("Failed URL:", e.target.src);
                  }}
                />
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                {seg?.Origin?.Airport?.AirportCode} –{" "}
                {seg?.Destination?.Airport?.AirportCode}
              </span>
            </div>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  background: "#f9fafb",
                  padding: "10px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                <span />
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "center",
                  }}
                >
                  <LuggageIcon /> Check-in
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "center",
                  }}
                >
                  <CabinBagIcon /> Cabin
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#374151",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontWeight: 500 }}>Adult</span>
                <span style={{ textAlign: "center", fontWeight: 600 }}>
                  {seg?.Baggage || "15 kg"}
                </span>
                <span style={{ textAlign: "center", fontWeight: 600 }}>
                  {seg?.CabinBaggage || "7 kg"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── renderContentByType ──────────────────────────────────────────────────────
function renderContentByType(item, idx) {
  switch (item.type) {
    case "text":
      return (
        <tr key={idx}>
          <td
            colSpan={2}
            style={{
              fontSize: 13,
              color: "#374151",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {item.content}
          </td>
        </tr>
      );
    case "list":
      return (
        <tr key={idx}>
          <td colSpan={2} style={{ fontSize: 13, color: "#374151" }}>
            {item.title && (
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#111827",
                  marginTop: idx > 0 ? 8 : 0,
                }}
              >
                {item.title}
              </div>
            )}
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {item.items?.map((point, pi) => (
                <li key={pi} style={{ marginBottom: 4 }}>
                  {point}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      );
    case "notes":
      return (
        <tr key={idx}>
          <td colSpan={2}>
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 13,
                color: "#92400e",
                marginTop: idx > 0 ? 8 : 0,
                lineHeight: 1.6,
              }}
            >
              {item.title && (
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  ⚠️ {item.title}
                </div>
              )}
              <div>{item.content || item.text}</div>
            </div>
          </td>
        </tr>
      );
    case "table":
      return (
        <tr key={idx}>
          <td colSpan={2} style={{ padding: 0 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                marginTop: idx > 0 ? 8 : 0,
              }}
            >
              {item.header && (
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    {item.header.map((col, ci) => (
                      <th
                        key={ci}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#111827",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {item.rows?.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    {Array.isArray(row) ? (
                      row.map((cell, ci) => (
                        <td
                          key={ci}
                          style={{ padding: "8px 12px", color: "#374151" }}
                        >
                          {cell}
                        </td>
                      ))
                    ) : (
                      <td style={{ padding: "8px 12px", color: "#374151" }}>
                        {row}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      );
    case "heading":
      return (
        <tr key={idx}>
          <td
            colSpan={2}
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#111827",
              paddingTop: idx > 0 ? 12 : 0,
              paddingBottom: 6,
            }}
          >
            {item.content}
          </td>
        </tr>
      );
    case "divider":
      return (
        <tr key={idx}>
          <td colSpan={2} style={{ padding: "8px 0" }}>
            <div style={{ height: 1, background: "#e5e7eb" }} />
          </td>
        </tr>
      );
    default:
      return (
        <tr key={idx}>
          <td
            colSpan={2}
            style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}
          >
            {item.content || item.text || JSON.stringify(item)}
          </td>
        </tr>
      );
  }
}

// ─── Fare Rule Tab ────────────────────────────────────────────────────────────
function FareRuleTab({ fareRuleData, fareLoading }) {
  if (fareLoading) {
    return (
      <div style={{ padding: "24px 20px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#6b7280",
            fontSize: 13,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Loading fare rules...
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (fareRuleData?.FareRules?.length > 0) {
    return (
      <div style={{ padding: "12px 0" }}>
        {fareRuleData.FareRules.map((rule, ri) => (
          <div
            key={ri}
            style={{
              marginBottom: ri < fareRuleData.FareRules.length - 1 ? 10 : 0,
            }}
          >
            <table className="rule-table">
              <thead>
                <tr>
                  <th style={{ width: "70%" }}>
                    <div>
                      {rule.Origin} → {rule.Destination}
                    </div>
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: 12,
                        color: "#6b7280",
                        marginTop: 2,
                      }}
                    >
                      {rule.Airline}
                    </div>
                  </th>
                  <th>
                    <div style={{ whiteSpace: "pre-line", textAlign: "right" }}>
                      Airlines Fees{"\n"}per passenger
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(rule.FareRuleDetail) ? (
                  rule.FareRuleDetail.map((item, idx) =>
                    renderContentByType(item, idx),
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        whiteSpace: "pre-line",
                        lineHeight: 1.7,
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      {rule.FareRuleDetail}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 0" }}>
      {FARE_RULES_FALLBACK.map((group, gi) => (
        <div
          key={gi}
          style={{ marginBottom: gi < FARE_RULES_FALLBACK.length - 1 ? 10 : 0 }}
        >
          <table className="rule-table">
            <thead>
              <tr>
                <th style={{ width: "60%" }}>
                  <div>{group.label}</div>
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: 12,
                      color: "#6b7280",
                      marginTop: 2,
                    }}
                  >
                    {group.sublabel}
                  </div>
                </th>
                <th>
                  <div style={{ whiteSpace: "pre-line", textAlign: "right" }}>
                    {group.column}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row, ri) => (
                <tr key={ri}>
                  <td>{row.desc}</td>
                  <td>{row.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

const PAX_LABELS = { 1: "Adult", 2: "Child", 3: "Infant" };
const TAX_LABELS = {
  YR: "Fuel Surcharge (YR)",
  YQTax: "Airline Fuel Charge (YQ)",
  OtherTaxes: "Other Taxes & Fees",
  K3: "K3 Charges",
};

// ✅ NEW: Dikhata hai PublishedFare kaise calculate hua — sirf jo
// passenger type actually maujood hai (Adult / Child / Infant) uska
// hi BaseFare + Tax breakup (YR/YQ/OtherTaxes) dikhayega. Har passenger
// type apne alag bordered box me — andar saare labels LEFT column me
// ek ke niche ek, saari prices RIGHT column me ek ke niche ek, ek
// consistent grid ke through properly aligned.
function FareBreakdownDetail({ fare }) {
  if (!fare) return null;
  const breakdown = fare.FareBreakdown || [];
  const ordered = [1, 2, 3]
    .map((pt) => breakdown.find((b) => b.PassengerType === pt))
    .filter(Boolean);

  if (ordered.length === 0) return null;

  const otherCharges = fare.OtherCharges || 0;
  const additionalTxnFee = fare.AdditionalTxnFeePub || 0;
  const discount = fare.Discount || 0;

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    columnGap: 12,
    alignItems: "baseline",
    padding: "4px 0",
  };

  return (
    <div style={{ padding: "6px 20px" }}>
      {ordered.map((b, i) => {
        const label = PAX_LABELS[b.PassengerType] || "Traveller";
        const taxEntries = (b.TaxBreakUp || []).filter((t) => (t.value || 0) > 0);
        return (
          <div
            key={b.PassengerType}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: i < ordered.length - 1 ? 8 : 0,
              background: "#fafafa",
            }}
          >
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "#111827",
                marginBottom: 6,
                paddingBottom: 6,
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {label} × {b.PassengerCount}
            </div>

            <div style={rowStyle}>
              <span style={{ fontSize: 13, color: "#374151" }}>Base Fare</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827", textAlign: "right" }}>
                ₹{Math.round(b.BaseFare).toLocaleString("en-IN")}
              </span>
            </div>

            {/* {taxEntries.length > 0 ? (
              taxEntries.map((t) => (
                <div style={rowStyle} key={t.key}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    {TAX_LABELS[t.key] || t.key}
                  </span>
                  <span style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}>
                    ₹{Math.round(t.value).toLocaleString("en-IN")}
                  </span>
                </div>
              ))
            ) : (
              <div style={rowStyle}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Taxes &amp; Fees</span>
                <span style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}>
                  ₹{Math.round(b.Tax).toLocaleString("en-IN")}
                </span>
              </div>
            )} */}
            <div style={rowStyle}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                Taxes
              </span>

              <span
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  textAlign: "right",
                }}
              >
                ₹{Math.round(b.Tax).toLocaleString("en-IN")}
              </span>
            </div>
            <div
              style={{
                ...rowStyle,
                marginTop: 6,
                paddingTop: 6,
                borderTop: "1px dashed #d1d5db",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                {label} Total
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", textAlign: "right" }}>
                ₹{Math.round(b.BaseFare + b.Tax).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        );
      })}

      {(otherCharges > 0 || additionalTxnFee > 0 || discount > 0) && (
        <div style={{ marginTop: 8 }}>
          {otherCharges > 0 && (
            <div style={rowStyle}>
              <span style={{ fontSize: 13, color: "#374151" }}>Other Charges</span>
              <span style={{ fontSize: 13, color: "#111827", textAlign: "right", fontWeight: 600 }}>
                ₹{Math.round(otherCharges).toLocaleString("en-IN")}
              </span>
            </div>
          )}
          {additionalTxnFee > 0 && (
            <div style={rowStyle}>
              <span style={{ fontSize: 13, color: "#374151" }}>Additional Transaction Fee</span>
              <span style={{ fontSize: 13, color: "#111827", textAlign: "right", fontWeight: 600 }}>
                ₹{Math.round(additionalTxnFee).toLocaleString("en-IN")}
              </span>
            </div>
          )}
          {discount > 0 && (
            <div style={rowStyle}>
              <span style={{ fontSize: 13, color: "#16a34a" }}>Discount</span>
              <span style={{ fontSize: 13, color: "#16a34a", textAlign: "right", fontWeight: 600 }}>
                -₹{Math.round(discount).toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// ─── Flight Card ──────────────────────────────────────────────────────────────
// ✅ CHANGE: naya optional prop `legsData` add kiya gaya hai. Jab yeh diya
// jaata hai (combined international round-trip case), card apne andar
// MULTIPLE legs (Onward + Return) ko ek hi card me, ek ke niche ek, dikhata
// hai — har leg ka apna green banner ("Onward Flight" / "Return Flight")
// hoga taaki visually clear rahe. Jab `legsData` NAHI diya jaata (normal
// oneway / domestic round-trip case), component bilkul PEHLE jaisa hi
// behave karta hai — koi behavior change nahi.
function FlightCard({
  flight,
  legLabel,
  legsData, // 👈 NEW PROP — combined RT ke liye [{ label, segs }, ...]
  expanded,
  onToggle,
  activeTab,
  onTabChange,
  fareRuleData,
  fareLoading,
}) {
  const isCombined = Array.isArray(legsData) && legsData.length > 0;

  // Normal case: purana behavior — ek hi leg, flight.Segments[0] se
  const legs = isCombined
    ? legsData
    : [{ label: legLabel, segs: flight?.Segments?.[0] || [] }];

  const allSegsFlat = legs.flatMap((l) => l.segs || []);
  const firstSeg = legs[0]?.segs?.[0];
  const lastLegSegs = legs[legs.length - 1]?.segs || [];
  const lastSeg = lastLegSegs[lastLegSegs.length - 1];

  // ✅ FIX: combined RT me return leg wapas origin par hi land karta hai,
  // isliye `lastSeg` (return ka last segment) se header banane par
  // "Mumbai to Mumbai" jaisa confusing title dikhta tha. Onward leg ka
  // APNA last segment nikal ke uska Destination header me use karte hain —
  // taaki "Mumbai to Tokyo" jaisa sahi route dikhe.
  const onwardLegSegs = legs[0]?.segs || [];
  const onwardLastSeg = onwardLegSegs[onwardLegSegs.length - 1];
  const displayDestSeg = isCombined ? onwardLastSeg : lastSeg;

  const segs = allSegsFlat;

  return (
    <div className="card">
      {!isCombined && legLabel && (
        <div
          style={{
            padding: "10px 20px",
            fontSize: 12,
            fontWeight: 700,
            color: "#16a34a",
            background: "#f0fdf4",
            borderBottom: "1px solid #f3f4f6",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {legLabel}
        </div>
      )}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "14px 16px",
          cursor: "pointer",
          borderBottom: expanded ? "1px solid #f3f4f6" : "none",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              src={getAirlineLogo(firstSeg?.Airline)}
              alt={firstSeg?.Airline?.AirlineName || "Flight"}
              style={{ width: 30, height: 30 }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>
              {firstSeg?.Origin?.Airport?.CityName || "Origin"} to{" "}
              {displayDestSeg?.Destination?.Airport?.CityName || "Destination"}
              {isCombined && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#1d4ed8",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 999,
                    padding: "2px 8px",
                    verticalAlign: "middle",
                  }}
                >
                  Round Trip
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {formatDate(firstSeg?.Origin?.DepTime)} •{" "}
              {firstSeg?.Airline?.AirlineName || "Airline"} •{" "}
              {Math.floor((lastSeg?.AccumulatedDuration || 135) / 60)}h{" "}
              {(lastSeg?.AccumulatedDuration || 135) % 60}m •{" "}
              {isCombined
                ? `${legs.length} legs`
                : segs.length > 1
                  ? `${segs.length - 1} Stop${segs.length - 1 !== 1 ? "s" : ""}`
                  : "Non-stop"}
            </div>
          </div>
        </div>
        <ChevronDown
          size={20}
          style={{
            color: "#6b7280",
            transition: "transform 0.25s",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </div>

      {expanded && (
        <>
          {legs.map((leg, legIdx) => {
            const legSegs = leg.segs || [];
            return (
              <div key={legIdx}>
                {/* ✅ Combined case me har leg (Onward/Return) ka apna
                    green identifier banner — non-combined case me yeh
                    render hi nahi hota (upar wala single legLabel banner
                    already dikha diya gaya hai) */}
                {isCombined && (
                  <div
                    style={{
                      padding: "8px 20px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#16a34a",
                      background: "#f0fdf4",
                      borderTop: legIdx > 0 ? "1px dashed #bbf7d0" : "none",
                      borderBottom: "1px solid #f3f4f6",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {leg.label} Flight
                  </div>
                )}

                {(legSegs.length > 0 ? legSegs : [null]).map((seg, idx) => (
                  <div key={idx}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "140px 1fr",
                        gap: 0,
                        alignItems: "center",
                        padding: "18px 20px 14px",
                      }}
                      className="seg-grid"
                    >
                      {" "}
                      <div
                        style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={getAirlineLogo(seg?.Airline)}
                            alt={seg?.Airline?.AirlineName || "Flight"}
                            style={{ width: 22, height: 22 }}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#1a56db",
                              lineHeight: 1.4,
                            }}
                          >
                            {seg?.Airline?.AirlineName || "IndiGo"}
                          </div>
                          <div
                            style={{ fontSize: 11, color: "#1a56db", marginTop: 1 }}
                          >
                            {seg?.Airline?.AirlineCode || "6E"}-
                            {seg?.Airline?.FlightNumber || "5032"}
                          </div>
                          <div
                            style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}
                          >
                            {seg?.Craft || ""}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 32,
                          marginRight: 24,
                        }}
                        className="seg-times"
                      >
                        <div style={{ flexShrink: 0 }}>
                          <div
                            style={{
                              fontSize: 22,
                              fontWeight: 800,
                              color: "#111827",
                              lineHeight: 1.1,
                            }}
                          >
                            {formatTime(seg?.Origin?.DepTime)}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#374151",
                              marginTop: 3,
                            }}
                          >
                            {seg?.Origin?.Airport?.CityName} (
                            {seg?.Origin?.Airport?.AirportCode})
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              marginTop: 2,
                              lineHeight: 1.4,
                            }}
                          >
                            {seg?.Origin?.Airport?.AirportName}
                          </div>
                        </div>
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            minWidth: 80,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              color: "#9ca3af",
                              marginBottom: 6,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {Math.floor((seg?.Duration || 135) / 60)}h{" "}
                            {(seg?.Duration || 135) % 60}m
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <div className="timeline-dot" />
                            <div className="timeline-line" />
                            <img
                              src={planlogo}
                              alt=""
                              style={{
                                width: 28,
                                height: 28,
                                flexShrink: 0,
                                margin: "0 6px",
                              }}
                            />
                            <div className="timeline-line" />
                            <div className="timeline-dot" />
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: 22,
                              fontWeight: 800,
                              color: "#111827",
                              lineHeight: 1.1,
                            }}
                          >
                            {formatTime(seg?.Destination?.ArrTime)}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#374151",
                              marginTop: 3,
                            }}
                          >
                            {seg?.Destination?.Airport?.CityName} (
                            {seg?.Destination?.Airport?.AirportCode})
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              marginTop: 2,
                              lineHeight: 1.4,
                            }}
                          >
                            {seg?.Destination?.Airport?.AirportName}
                          </div>
                        </div>
                      </div>
                    </div>
                    {idx < legSegs.length - 1 && (
                      <div style={{ padding: "0 20px" }}>
                        <div className="layover-badge">
                          <span>
                            {seg?.GroundTime
                              ? `${Math.floor(seg.GroundTime / 60)}h ${seg.GroundTime % 60}m Layover at ${seg?.Destination?.Airport?.CityName}`
                              : `Layover at ${seg?.Destination?.Airport?.CityName}`}
                          </span>
                        </div>
                      </div>
                    )}
                    {idx < legSegs.length - 1 && (
                      <div
                        style={{ height: 1, background: "#f3f4f6", margin: "0 20px" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })}

          <div style={{ borderTop: "1px solid #f3f4f6" }}>
            <div
              style={{
                display: "flex",
                gap: 24,
                padding: "0 20px",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              {["fare", "baggage"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "tab-active" : "tab-inactive"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabChange(tab);
                  }}
                >
                  {tab === "fare" ? "Fare Rules" : "Baggage"}
                </button>
              ))}
            </div>
            {activeTab === "fare" && (
              <FareRuleTab
                fareRuleData={fareRuleData}
                fareLoading={fareLoading}
              />
            )}
            {activeTab === "baggage" && <BaggageTab segs={allSegsFlat} />}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookFlight() {
  const location = useLocation();
  const { flight, onwardFlight, returnFlight, searchMeta } =
    location.state || {};
  const navigate = useNavigate();

  const isRoundTrip = !!(onwardFlight && returnFlight);
  const onwardF = isRoundTrip ? onwardFlight : flight;
  const returnF = isRoundTrip ? returnFlight : null;

  // ✅ CHANGE: combined international round-trip flag — FlightsListingPage
  // se `searchMeta.isCombinedRoundTrip` bhej dete hain (RoundTripDetailSidebar
  // ke handleContinue se). Isse pura page (API calls, card rendering, fare
  // summary) apna behavior adjust karta hai bina domestic/oneway ko chhue.
  const isCombinedRoundTrip = !!searchMeta?.isCombinedRoundTrip;

  const adultCount = searchMeta?.passengers?.adults ?? 1;
  const childCount = searchMeta?.passengers?.children ?? 0;
  const infantCount = searchMeta?.passengers?.infants ?? 0;
  const totalPassengers = adultCount + childCount + infantCount;

  const flightDepartureDate =
    onwardF?.Segments?.[0]?.[0]?.Origin?.DepTime || null;

  const {
    onwardFareRule,
    returnFareRule,
    loading: fareLoading,
    fetchFareRule,
  } = useFareRule();
  const {
    onwardFareQuote,
    returnFareQuote,
    loading: fareQuoteLoading,
    error: fareQuoteError,
    errorCode: fareQuoteErrorCode,
    fetchFareQuote,
  } = useFareQuote();

  // useEffect(() => {
  //   console.log(
  //     `%c[BookFlight] PAGE LOADED — Trip Type: ${isRoundTrip ? "ROUNDTRIP" : "ONEWAY"}${isCombinedRoundTrip ? " (COMBINED INTL)" : ""}`,
  //     "color:#16a34a;font-weight:bold;font-size:14px;",
  //   );
  //   console.log("[BookFlight] location.state ->", location.state);
  //   console.log(
  //     "%c[BookFlight] Onward Flight Object ->",
  //     "color:#15803d;font-weight:600;",
  //     onwardF,
  //   );
  //   console.log("[CHECKPOINT 3] onwardF?.ResultIndex:", onwardF?.ResultIndex);
  //   if (isRoundTrip) {
  //     console.log(
  //       "%c[BookFlight] Return Flight Object ->",
  //       "color:#b91c1c;font-weight:600;",
  //       returnF,
  //     );
  //   } else {
  //     console.log(
  //       "%c[BookFlight] No Return Flight (ONEWAY trip)",
  //       "color:#9ca3af;font-style:italic;",
  //     );
  //   }
  // }, []);

  useEffect(() => {
    if (searchMeta?.traceId && onwardF?.ResultIndex) {
      // console.log(
      //   `%c[BookFlight] Trip Type: ${isRoundTrip ? "ROUNDTRIP" : "ONEWAY"}${isCombinedRoundTrip ? " (COMBINED INTL)" : ""}`,
      //   "color:#16a34a;font-weight:bold;font-size:13px;",
      // );

      // ✅ CHANGE: combined international round-trip case me returnResultIndex
      // ko FORCE NULL rakha jaata hai — kyunki ek hi ResultIndex se pura RT
      // ka data (dono legs) mil jaata hai, dusri API call ki zaroorat nahi.
      // isCombinedRoundTrip flag bhi pass kar rahe hain taaki hooks ke
      // andar sahi decision liya ja sake.
      const fareRulePayload = {
        traceId: searchMeta.traceId,
        onwardResultIndex: onwardF.ResultIndex,
        returnResultIndex: isCombinedRoundTrip ? null : (returnF?.ResultIndex || null),
        isCombinedRoundTrip,
      };
      const fareQuotePayload = {
        traceId: searchMeta.traceId,
        onwardResultIndex: onwardF.ResultIndex,
        returnResultIndex: isCombinedRoundTrip ? null : (returnF?.ResultIndex || null),
        isCombinedRoundTrip,
      };

      // console.log(
      //   "%c[API CALL] FareRule Request Payload ->",
      //   "color:#1d4ed8;font-weight:600;",
      //   fareRulePayload,
      // );
      // console.log(
      //   "%c[API CALL] FareQuote Request Payload ->",
      //   "color:#1d4ed8;font-weight:600;",
      //   fareQuotePayload,
      // );

      fetchFareRule(fareRulePayload);
      fetchFareQuote(fareQuotePayload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (onwardFareRule || returnFareRule) {
      // console.log(
      //   `%c[FareRule API Response] Trip Type: ${isRoundTrip ? "ROUNDTRIP" : "ONEWAY"}`,
      //   "color:#16a34a;font-weight:bold;",
      // );
      // console.log(
      //   "%c[FareRule API Response] Onward ->",
      //   "color:#15803d;font-weight:600;",
      //   onwardFareRule,
      // );
      if (isRoundTrip) {
        // console.log(
        //   "%c[FareRule API Response] Return ->",
        //   "color:#b91c1c;font-weight:600;",
        //   returnFareRule,
        // );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onwardFareRule, returnFareRule]);

  useEffect(() => {
    if (onwardFareQuote || returnFareQuote) {
      // console.log(
      //   `%c[FareQuote API Response] Trip Type: ${isRoundTrip ? "ROUNDTRIP" : "ONEWAY"}`,
      //   "color:#16a34a;font-weight:bold;",
      // );
      // console.log(
      //   "%c[FareQuote API Response] Onward ->",
      //   "color:#15803d;font-weight:600;",
      //   onwardFareQuote,
      // );
      if (isRoundTrip) {
        // console.log(
        //   "%c[FareQuote API Response] Return ->",
        //   "color:#b91c1c;font-weight:600;",
        //   returnFareQuote,
        // );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onwardFareQuote, returnFareQuote]);
  // ✅ NEW: FareQuote fail hone par Swal dikhao aur user ko /flights pe
  // wapas bhejo — pehle is failure ka koi UI feedback hi nahi tha, page
  // bas blank/incomplete reh jaata tha (fareQuoteLoading false, par
  // onwardFareQuote bhi hamesha null).
  useEffect(() => {
    if (!fareQuoteError) return;
    Swal.fire({
      icon: "error",
      title: "Fare Quote Failed",
      html: `
      <div style="font-size:14px;color:#374151;line-height:1.8;text-align:left">
        <div style="margin-bottom:6px">
          <span style="color:#6b7280;font-size:12px">Reason</span><br/>
          <strong>${fareQuoteError}</strong>
        </div>
        ${fareQuoteErrorCode
          ? `<div>
            <span style="color:#6b7280;font-size:12px">Error Code</span><br/>
            <strong style="font-family:monospace">${fareQuoteErrorCode}</strong>
          </div>`
          : ""
        }
      </div>
    `,
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Go Back",
      allowOutsideClick: false,
    }).then(() => navigate("/flights", { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fareQuoteError]);
  const fareQuoteResult = onwardFareQuote?.Results || {};
  const returnFareQuoteResult = returnFareQuote?.Results || {};

  const requiresPassportAtBook = !!(
    fareQuoteResult?.IsPassportRequiredAtBook ||
    returnFareQuoteResult?.IsPassportRequiredAtBook
  );
  const requiresPanAtBook = !!(
    fareQuoteResult?.IsPanRequiredAtBook ||
    returnFareQuoteResult?.IsPanRequiredAtBook
  );

  const requiresPassportAtTicket = !!(
    fareQuoteResult?.IsPassportRequiredAtTicket ||
    returnFareQuoteResult?.IsPassportRequiredAtTicket
  );
  const requiresPanAtTicket = !!(
    fareQuoteResult?.IsPanRequiredAtTicket ||
    returnFareQuoteResult?.IsPanRequiredAtTicket
  );

  // ── Passport "Full Detail" flags bhi shaamil — inme se koi bhi true ho to
  //    passport required maana jaayega (Child/Infant apna khud ka document
  //    denge, guardian nahi). ──────────────────────────────────────────────
  const requiresPassportFullDetailAtBook = !!(
    fareQuoteResult?.IsPassportFullDetailRequiredAtBook ||
    returnFareQuoteResult?.IsPassportFullDetailRequiredAtBook
  );
  const requiresPassportFullDetailAtTicket = !!(
    fareQuoteResult?.IsPassportFullDetailRequiredAtTicket ||
    returnFareQuoteResult?.IsPassportFullDetailRequiredAtTicket
  );

  const requiresPassport =
    requiresPassportAtBook ||
    requiresPassportAtTicket ||
    requiresPassportFullDetailAtBook ||
    requiresPassportFullDetailAtTicket;
  const requiresPan = requiresPanAtBook || requiresPanAtTicket;

  const gstAllowed = !!(
    (fareQuoteResult?.GSTAllowed ?? true) &&
    (returnFareQuoteResult?.GSTAllowed ?? true)
  );
  const gstMandatory = !!(
    fareQuoteResult?.IsGSTMandatory || returnFareQuoteResult?.IsGSTMandatory
  );

  const [onwardExpanded, setOnwardExpanded] = useState(false);
  const [returnExpanded, setReturnExpanded] = useState(false);
  const [onwardTab, setOnwardTab] = useState("fare");
  const [returnTab, setReturnTab] = useState("fare");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [travellers, setTravellers] = useState(() =>
    buildInitialTravellers(searchMeta?.passengers),
  );
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (gstMandatory) setGstEnabled(true);
  }, [gstMandatory]);

  const runValidation = (currentTravellers) => {
    const errs = {};
    ["adults", "children", "infants"].forEach((type) => {
      currentTravellers[type].forEach((t) => {
        const fieldErrs = validateTraveller(type, t, {
          requiresPassport,
          requiresPan,
          flightDepartureDate,
        });
        if (Object.keys(fieldErrs).length > 0) errs[t.id] = fieldErrs;
      });
    });
    return errs;
  };

  const handleAdd = (type) => {
    setTravellers((prev) => ({
      ...prev,
      [type]: [...prev[type], newTraveller(type)],
    }));
  };

  const handleChange = (type, id, updated) => {
    setTravellers((prev) => ({
      ...prev,
      [type]: prev[type].map((t) => (t.id === id ? updated : t)),
    }));
    if (showErrors) {
      setValidationErrors((prev) => {
        const newErrs = { ...prev };
        newErrs[id] = validateTraveller(type, updated, {
          requiresPassport,
          requiresPan,
          flightDepartureDate,
        });
        if (Object.keys(newErrs[id]).length === 0) delete newErrs[id];
        return newErrs;
      });
    }
  };

  const handleRemove = (type, id) => {
    setTravellers((prev) => ({
      ...prev,
      [type]: prev[type].filter((t) => t.id !== id),
    }));
    setValidationErrors((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  };

  const [contact, setContact] = useState({
    countryCode: "+91",
    mobile: "",
    email: "",
  });
  const [contactErrors, setContactErrors] = useState({});

  const [billing, setBilling] = useState({
    address: "",
    city: "",
    state: "",
    nationality: "IN",
  });
  const [billingErrors, setBillingErrors] = useState({});

  const [gst, setGst] = useState({
    GSTCompanyName: "",
    GSTNumber: "",
    GSTCompanyAddress: "",
    GSTCompanyContactNumber: "",
    GSTCompanyEmail: "",
  });
  const [gstErrors, setGstErrors] = useState({});

  const handleContactMobile = (val) => {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 10);
    setContact((p) => ({ ...p, mobile: digitsOnly }));
    if (showErrors) {
      if (!digitsOnly)
        setContactErrors((p) => ({
          ...p,
          mobile: "Mobile number is required",
        }));
      else if (!MOBILE_REGEX.test(digitsOnly))
        setContactErrors((p) => ({
          ...p,
          mobile: "Mobile must be exactly 10 digits",
        }));
      else setContactErrors((p) => ({ ...p, mobile: "" }));
    }
  };

  const handleContactEmail = (val) => {
    const cleaned = noLeadingSpaces(val);
    setContact((p) => ({ ...p, email: cleaned }));
    if (showErrors) {
      if (!cleaned)
        setContactErrors((p) => ({ ...p, email: "Email is required" }));
      else if (!EMAIL_REGEX.test(cleaned))
        setContactErrors((p) => ({
          ...p,
          email: "Enter a valid email address",
        }));
      else setContactErrors((p) => ({ ...p, email: "" }));
    }
  };


  const onwardFare = onwardFareQuote?.Results?.Fare;
  const returnFare = returnFareQuote?.Results?.Fare;

  const onwardPublished = onwardFare?.PublishedFare ?? onwardF?.Fare?.PublishedFare ?? 0;
  const returnPublished = returnFare?.PublishedFare ?? returnF?.Fare?.PublishedFare ?? 0;

  const onwardFareTotal = onwardPublished;
  const returnFareTotal = returnPublished;
  const totalFare = onwardFareTotal + returnFareTotal;

  const findBreakdown = (fareResult, paxType) =>
    fareResult?.Results?.FareBreakdown?.find((b) => b.PassengerType === paxType);

  const onwardAdultBreakdown = findBreakdown(onwardFareQuote, 1);
  const onwardChildBreakdown = findBreakdown(onwardFareQuote, 2);
  const onwardInfantBreakdown = findBreakdown(onwardFareQuote, 3);

  const paxTotal = (b) => (b ? (b.BaseFare || 0) + (b.Tax || 0) : 0);

  const isPriceChanged =
    onwardFareQuote?.IsPriceChanged || returnFareQuote?.IsPriceChanged || false;
  const isRefundable =
    onwardFareQuote?.Results?.IsRefundable ?? onwardF?.IsRefundable;

  const handleProceed = () => {
    setShowErrors(true);

    const travErrs = runValidation(travellers);
    setValidationErrors(travErrs);

    const cErrs = {};
    if (!contact.mobile) cErrs.mobile = "Mobile number is required";
    else if (!MOBILE_REGEX.test(contact.mobile))
      cErrs.mobile = "Mobile must be exactly 10 digits";
    if (!contact.email) cErrs.email = "Email is required";
    else if (!EMAIL_REGEX.test(contact.email))
      cErrs.email = "Enter a valid email address";
    setContactErrors(cErrs);

    const bErrs = {};
    if (!billing.address.trim()) bErrs.address = "Address is required";
    if (!billing.city.trim()) bErrs.city = "City is required";
    if (!billing.state.trim()) bErrs.state = "State is required";
    setBillingErrors(bErrs);

    const gErrs = gstEnabled ? validateGst(gst) : {};
    setGstErrors(gErrs);

    const hasErrors =
      Object.keys(travErrs).length > 0 ||
      Object.keys(cErrs).length > 0 ||
      Object.keys(bErrs).length > 0 ||
      Object.keys(gErrs).length > 0;

    if (hasErrors) {
      // console.log(
      //   "%c[BookFlight] Validation FAILED — not proceeding ->",
      //   "color:#dc2626;font-weight:700;",
      //   { travErrs, cErrs, bErrs, gErrs },
      // );
      setTimeout(() => {
        const firstErr = document.querySelector(".input-err");
        if (firstErr)
          firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    const navPayload = {
      flight: onwardF,
      returnFlight: returnF,
      // ✅ CHANGE: isCombinedRoundTrip flag ko searchMeta ke andar hi rakh
      // rahe hain (already present hoga kyuki yeh isi searchMeta se aaya
      // tha), taaki SSR page bhi isi flag se sahi decision le sake aur
      // waha bhi ek hi combined call ho, dono legs ka data ek hi jagah
      // dikhe.
      searchMeta,
      travellers,
      contact,
      billing,
      gst: gstEnabled ? gst : null,
      gstEnabled,
      gstMandatory,
      fareQuote: onwardFareQuote,
      returnFareQuote,
      traceId: searchMeta?.traceId,
      resultIndex: onwardF?.ResultIndex,
      returnResultIndex: isCombinedRoundTrip ? null : (returnF?.ResultIndex || null),
      isCombinedRoundTrip,
      isLCC: onwardF?.IsLCC || false,
      requiresPassportAtTicket,
      requiresPanAtTicket,
    };

    // console.log(
    //   `%c[BookFlight] PROCEED CLICKED — Trip Type: ${isRoundTrip ? "ROUNDTRIP" : "ONEWAY"}${isCombinedRoundTrip ? " (COMBINED INTL)" : ""}`,
    //   "color:#16a34a;font-weight:bold;font-size:14px;",
    // );
    // console.log(
    //   "%c[Navigate -> /ssr] Full Payload ->",
    //   "color:#9333ea;font-weight:700;",
    //   navPayload,
    // );
    // console.log(
    //   "%c[Navigate -> /ssr] Onward Flight ->",
    //   "color:#15803d;font-weight:600;",
    //   onwardF,
    // );
    if (isRoundTrip) {
      // console.log(
      //   "%c[Navigate -> /ssr] Return Flight ->",
      //   "color:#b91c1c;font-weight:600;",
      //   returnF,
      // );
    } else {
      // console.log(
      //   "%c[Navigate -> /ssr] No Return Flight (ONEWAY) ->",
      //   "color:#9ca3af;font-style:italic;",
      //   null,
      // );
    }
    // console.log("[CHECKPOINT 4] navPayload.resultIndex:", navPayload.resultIndex);
    navigate("/ssr", { state: navPayload });
  };

  return (
    <div
      style={{
        fontFamily: "Inter,sans-serif",
        // background: "#f0f4fa",
        minHeight: "100vh",
        padding: "24px 0 64px",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .bk-wrap { max-width: 1200px; margin: 0 auto; margin-top:60px; padding: 0 16px; }
        .bk-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
        @media (max-width: 860px) { .bk-grid { grid-template-columns: 1fr; } }
        .card { background: #fff; border-radius: 14px; box-shadow: 0 1px 10px rgba(0,0,0,0.07); overflow: hidden; }
        .card + .card { margin-top: 16px; }
        .input-field { width: 100%; border: 1px solid #d1d5db; border-radius: 8px; padding: 11px 14px; font-size: 14px; color: #374151; outline: none; font-family: inherit; transition: border-color 0.2s; background: #fff; }
        .input-field:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.08); }
        .input-field::placeholder { color: #9ca3af; }
        .input-err { border-color: #dc2626 !important; background: #fff5f5 !important; }
        .input-err:focus { border-color: #dc2626 !important; box-shadow: 0 0 0 3px rgba(220,38,38,0.08) !important; }
        select.input-field { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='4 6 8 10 12 6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
        .tab-btn { background: none; border: none; cursor: pointer; padding: 13px 0; font-family: inherit; font-size: 14px; transition: color 0.15s; }
        .tab-active { border-bottom: 2px solid #16a34a; color: #16a34a; font-weight: 600; }
        .tab-inactive { border-bottom: 2px solid transparent; color: #6b7280; font-weight: 400; }
        .section-hdr { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; }
        .section-hdr h3 { font-size: 16px; font-weight: 700; color: #111827; }
        .section-hdr p { font-size: 13px; color: #6b7280; margin-top: 2px; }
        .fare-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; font-size: 14px; color: #374151; }
        .fare-row + .fare-row { border-top: 1px solid #f3f4f6; }
        .timeline-dot { width: 8px; height: 8px; border-radius: 50%; border: 2px solid #9ca3af; background: #fff; flex-shrink: 0; }
        .timeline-line { flex: 1; height: 2px; background: #d1d5db; }
        .layover-badge { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
        .layover-badge::before, .layover-badge::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
        .layover-badge span { font-size: 12px; color: #92400e; background: #fef3c7; border: 1px solid #fde68a; border-radius: 999px; padding: 3px 14px; font-weight: 500; white-space: nowrap; }
        .rule-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .rule-table th { text-align: left; font-weight: 700; color: #111827; padding: 12px 16px; background: #f3f4f6; }
        .rule-table th:last-child { text-align: right; }
        .rule-table td { padding: 11px 16px; color: #374151; border-top: 1px solid #f0f0f0; }
        .rule-table td:last-child:not([colspan]) { text-align: right; font-weight: 600; color: #111827; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 580px) { 
  .two-col { grid-template-columns: 1fr !important; }
  .seg-grid { 
    grid-template-columns: 1fr !important; 
    gap: 12px !important; 
    padding: 14px 14px 10px !important;
  }
  .seg-times { 
    gap: 8px !important; 
    margin-right: 0 !important;
    width: 100%;
  }
  .seg-times > div:first-child,
  .seg-times > div:last-child {
    min-width: 0 !important;
    flex: 1 !important;
  }
  .seg-times > div:first-child > div:first-child,
  .seg-times > div:last-child > div:first-child {
    font-size: 17px !important;
  }
  .seg-times > div:nth-child(2) {
    min-width: 60px !important;
  }
  .bk-wrap { padding: 0 10px !important; }
  .card { border-radius: 10px !important; }
  .section-hdr { 
    flex-direction: column !important; 
    align-items: flex-start !important; 
    gap: 6px !important;
  }
  .section-hdr > div:last-child {
    font-size: 11px !important;
  }
  .fare-row { 
    padding: 8px 14px !important; 
    font-size: 13px !important;
  }
  .rule-table th,
  .rule-table td { 
    padding: 8px 10px !important; 
    font-size: 12px !important;
  }
  .layover-badge span {
    font-size: 11px !important;
    white-space: normal !important;
    text-align: center !important;
  }
  .tab-btn {
    font-size: 13px !important;
    padding: 11px 0 !important;
  }
}

@media (max-width: 400px) {
  .seg-times > div:first-child > div:first-child,
  .seg-times > div:last-child > div:first-child {
    font-size: 15px !important;
  }
  .seg-times > div:nth-child(2) {
    min-width: 50px !important;
  }
}

        .doc-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 12.5px;
          color: #1e40af;
          font-weight: 500;
          margin-bottom: 12px;
        }
      `}</style>

      <div className="bk-wrap">
        <div className="bk-grid">
          <div>
            {/* ✅ CHANGE: combined international round-trip case me EK hi
                FlightCard render hota hai jisme `legsData` prop se dono
                legs (Onward + Return) ek ke niche ek dikhte hain — bilkul
                waisa hi jaisa combined API response deta hai (ek hi
                ResultIndex, ek hi Fare). Non-combined case (oneway / normal
                domestic round-trip) bilkul purane jaisa hi rehta hai — do
                alag cards, alag FareRule/FareQuote state. */}
            {isCombinedRoundTrip ? (
              <FlightCard
                legsData={[
                  { label: "Onward", segs: onwardF?.Segments?.[0] || [] },
                  { label: "Return", segs: returnF?.Segments?.[0] || [] },
                ]}
                expanded={onwardExpanded}
                onToggle={() => setOnwardExpanded((v) => !v)}
                activeTab={onwardTab}
                onTabChange={setOnwardTab}
                fareRuleData={onwardFareRule}
                fareLoading={fareLoading}
              />
            ) : (
              <>
                <FlightCard
                  flight={onwardF}
                  legLabel={isRoundTrip ? "Onward Flight" : null}
                  expanded={onwardExpanded}
                  onToggle={() => setOnwardExpanded((v) => !v)}
                  activeTab={onwardTab}
                  onTabChange={setOnwardTab}
                  fareRuleData={onwardFareRule}
                  fareLoading={fareLoading}
                />
                {isRoundTrip && (
                  <FlightCard
                    flight={returnF}
                    legLabel="Return Flight"
                    expanded={returnExpanded}
                    onToggle={() => setReturnExpanded((v) => !v)}
                    activeTab={returnTab}
                    onTabChange={setReturnTab}
                    fareRuleData={returnFareRule}
                    fareLoading={fareLoading}
                  />
                )}
              </>
            )}

            <div className="card">
              <div
                className="section-hdr"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3>Travellers Details</h3>
                  <p style={{ marginTop: 2 }}>
                    {adultCount} Adult{adultCount !== 1 ? "s" : ""}
                    {childCount > 0
                      ? `, ${childCount} Child${childCount !== 1 ? "ren" : ""}`
                      : ""}
                    {infantCount > 0
                      ? `, ${infantCount} Infant${infantCount !== 1 ? "s" : ""}`
                      : ""}
                    {" · "}
                    {searchMeta?.cabinClass || "Economy"}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontFamily: "Inter, sans-serif",
                    color: "#6b7280",
                  }}
                >
                  <UserIcon />
                  <span>Name should match Government ID proof</span>
                </div>
              </div>

              <div style={{ padding: "16px 20px 4px" }}>
                {!fareQuoteLoading && (requiresPassport || requiresPan) && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 8,
                    }}
                  >
                    {requiresPassport && (
                      <div className="doc-badge">
                        🛂 Passport number &amp; expiry required for this flight
                      </div>
                    )}
                    {requiresPan && (
                      <div className="doc-badge">
                        🪪 PAN number required for this booking
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ padding: "4px 20px 8px" }}>
                {travellers.adults.length > 0 && (
                  <TravellerGroup
                    type="adults"
                    label="Adult"
                    ageLabel="(12+ yrs)"
                    list={travellers.adults}
                    onChange={handleChange}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    allErrors={validationErrors}
                    showErrors={showErrors}
                    requiresPassport={requiresPassport}
                    requiresPan={requiresPan}
                    flightDepartureDate={flightDepartureDate}
                  />
                )}
                {travellers.children.length > 0 && (
                  <div
                    style={{ marginTop: travellers.adults.length > 0 ? 16 : 0 }}
                  >
                    <TravellerGroup
                      type="children"
                      label="Child"
                      ageLabel="(2-12 yrs)"
                      list={travellers.children}
                      onChange={handleChange}
                      onAdd={handleAdd}
                      onRemove={handleRemove}
                      allErrors={validationErrors}
                      showErrors={showErrors}
                      requiresPassport={requiresPassport}
                      requiresPan={requiresPan}
                      flightDepartureDate={flightDepartureDate}
                      primaryAdult={travellers.adults[0]}
                    />
                  </div>
                )}
                {travellers.infants.length > 0 && (
                  <div
                    style={{
                      marginTop:
                        travellers.adults.length > 0 ||
                          travellers.children.length > 0
                          ? 16
                          : 0,
                    }}
                  >
                    <TravellerGroup
                      type="infants"
                      label="Infant"
                      ageLabel="(0-2 yrs)"
                      list={travellers.infants}
                      onChange={handleChange}
                      onAdd={handleAdd}
                      onRemove={handleRemove}
                      allErrors={validationErrors}
                      showErrors={showErrors}
                      requiresPassport={requiresPassport}
                      requiresPan={requiresPan}
                      flightDepartureDate={flightDepartureDate}
                      primaryAdult={travellers.adults[0]}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="section-hdr">
                <h3>Contact Information</h3>
                <p>Your ticket &amp; flight details will be shared here</p>
              </div>
              <div style={{ padding: 20 }}>
                <div
                  className="two-col"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <label style={labelStyle}>Mobile Number *</label>
                    <div style={{ display: "flex" }}>
                      <select
                        className="input-field"
                        style={{
                          width: 84,
                          borderRadius: "8px 0 0 8px",
                          borderRight: "none",
                          background: "#f9fafb",
                          paddingRight: 8,
                        }}
                        value={contact.countryCode}
                        onChange={(e) =>
                          setContact((p) => ({
                            ...p,
                            countryCode: e.target.value,
                          }))
                        }
                      >
                        <option>+91</option>
                        <option>+1</option>
                        <option>+44</option>
                        <option>+971</option>
                      </select>
                      <input
                        className={`input-field${showErrors && contactErrors.mobile ? " input-err" : ""}`}
                        style={{ borderRadius: "0 8px 8px 0", flex: 1 }}
                        placeholder="10-digit number"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={contact.mobile}
                        onChange={(e) => handleContactMobile(e.target.value)}
                      />
                    </div>
                    {showErrors && contactErrors.mobile && (
                      <span style={errStyle}>⚠ {contactErrors.mobile}</span>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      className={`input-field${showErrors && contactErrors.email ? " input-err" : ""}`}
                      placeholder="Email Address"
                      type="email"
                      value={contact.email}
                      onChange={(e) => handleContactEmail(e.target.value)}
                    />
                    {showErrors && contactErrors.email && (
                      <span style={errStyle}>⚠ {contactErrors.email}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-hdr">
                <h3>Billing Information</h3>
                <p>Required for booking confirmation</p>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 14, position: "relative" }}>
                  <label style={labelStyle}>Address *</label>
                  <input
                    className={`input-field${showErrors && billingErrors.address ? " input-err" : ""}`}
                    placeholder="Address"
                    value={billing.address}
                    onChange={(e) =>
                      setBilling((p) => ({
                        ...p,
                        address: noLeadingSpaces(e.target.value),
                      }))
                    }
                  />
                  {showErrors && billingErrors.address && (
                    <span style={errStyle}>⚠ {billingErrors.address}</span>
                  )}
                </div>
                <div
                  className="two-col"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <label style={labelStyle}>City *</label>
                    <input
                      className={`input-field${showErrors && billingErrors.city ? " input-err" : ""}`}
                      placeholder="City"
                      value={billing.city}
                      onChange={(e) =>
                        setBilling((p) => ({
                          ...p,
                          city: noLeadingSpaces(e.target.value),
                        }))
                      }
                    />
                    {showErrors && billingErrors.city && (
                      <span style={errStyle}>⚠ {billingErrors.city}</span>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <label style={labelStyle}>State *</label>
                    <input
                      className={`input-field${showErrors && billingErrors.state ? " input-err" : ""}`}
                      placeholder="State"
                      value={billing.state}
                      onChange={(e) =>
                        setBilling((p) => ({
                          ...p,
                          state: noLeadingSpaces(e.target.value),
                        }))
                      }
                    />
                    {showErrors && billingErrors.state && (
                      <span style={errStyle}>⚠ {billingErrors.state}</span>
                    )}
                  </div>
                </div>
                <div
                  style={{ maxWidth: "calc(50% - 7px)", position: "relative" }}
                >
                  <label style={labelStyle}>Nationality</label>
                  <input
                    className="input-field"
                    value="India"
                    readOnly
                    style={{
                      background: "#f9fafb",
                      cursor: "default",
                      color: "#374151",
                    }}
                  />
                </div>
              </div>
            </div>

            {gstAllowed && (
              <div className="card">
                <div className="section-hdr">
                  <h3>GST Details</h3>
                  <p>
                    {gstMandatory
                      ? "GST details are mandatory for this fare"
                      : "Use GST number to avail GST Benefits & additional savings"}
                  </p>
                </div>
                <div style={{ padding: 20 }}>
                  {!gstMandatory && (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <GSTToggle
                        checked={gstEnabled}
                        onChange={() => setGstEnabled((v) => !v)}
                      />
                      <span style={{ fontSize: 14, color: "#374151" }}>
                        I would like to add my GST Number
                      </span>
                    </div>
                  )}

                  {gstMandatory && (
                    <div className="doc-badge">
                      🧾 GST details are required for this booking
                    </div>
                  )}

                  {gstEnabled && (
                    <div style={{ marginTop: gstMandatory ? 0 : 18 }}>
                      <div
                        className="two-col"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 14,
                          marginBottom: 14,
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          <label style={labelStyle}>
                            Company Name {gstMandatory && "*"}
                          </label>
                          <input
                            className={`input-field${showErrors && gstErrors.GSTCompanyName ? " input-err" : ""}`}
                            placeholder="Company Name"
                            value={gst.GSTCompanyName}
                            onChange={(e) =>
                              setGst((p) => ({
                                ...p,
                                GSTCompanyName: noLeadingSpaces(e.target.value),
                              }))
                            }
                          />
                          {showErrors && gstErrors.GSTCompanyName && (
                            <span style={errStyle}>
                              ⚠ {gstErrors.GSTCompanyName}
                            </span>
                          )}
                        </div>
                        <div style={{ position: "relative" }}>
                          <label style={labelStyle}>
                            GST Number {gstMandatory && "*"}
                          </label>
                          <input
                            className={`input-field${showErrors && gstErrors.GSTNumber ? " input-err" : ""}`}
                            placeholder="22AAAAA0000A1Z5"
                            value={gst.GSTNumber}
                            onChange={(e) =>
                              setGst((p) => ({
                                ...p,
                                GSTNumber: noLeadingSpaces(
                                  e.target.value,
                                ).toUpperCase(),
                              }))
                            }
                          />
                          {showErrors && gstErrors.GSTNumber && (
                            <span style={errStyle}>⚠ {gstErrors.GSTNumber}</span>
                          )}
                        </div>
                      </div>

                      <div style={{ marginBottom: 14, position: "relative" }}>
                        <label style={labelStyle}>
                          Company Address {gstMandatory && "*"}
                        </label>
                        <input
                          className={`input-field${showErrors && gstErrors.GSTCompanyAddress ? " input-err" : ""}`}
                          placeholder="Company Address"
                          value={gst.GSTCompanyAddress}
                          onChange={(e) =>
                            setGst((p) => ({
                              ...p,
                              GSTCompanyAddress: noLeadingSpaces(
                                e.target.value,
                              ),
                            }))
                          }
                        />
                        {showErrors && gstErrors.GSTCompanyAddress && (
                          <span style={errStyle}>
                            ⚠ {gstErrors.GSTCompanyAddress}
                          </span>
                        )}
                      </div>

                      <div
                        className="two-col"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 14,
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          <label style={labelStyle}>
                            Company Contact Number {gstMandatory && "*"}
                          </label>
                          <input
                            className={`input-field${showErrors && gstErrors.GSTCompanyContactNumber ? " input-err" : ""}`}
                            placeholder="10-digit number"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={gst.GSTCompanyContactNumber}
                            onChange={(e) =>
                              setGst((p) => ({
                                ...p,
                                GSTCompanyContactNumber: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 10),
                              }))
                            }
                          />
                          {showErrors && gstErrors.GSTCompanyContactNumber && (
                            <span style={errStyle}>
                              ⚠ {gstErrors.GSTCompanyContactNumber}
                            </span>
                          )}
                        </div>
                        <div style={{ position: "relative" }}>
                          <label style={labelStyle}>
                            Company Email {gstMandatory && "*"}
                          </label>
                          <input
                            className={`input-field${showErrors && gstErrors.GSTCompanyEmail ? " input-err" : ""}`}
                            placeholder="Company Email"
                            type="email"
                            value={gst.GSTCompanyEmail}
                            onChange={(e) =>
                              setGst((p) => ({
                                ...p,
                                GSTCompanyEmail: noLeadingSpaces(
                                  e.target.value,
                                ),
                              }))
                            }
                          />
                          {showErrors && gstErrors.GSTCompanyEmail && (
                            <span style={errStyle}>
                              ⚠ {gstErrors.GSTCompanyEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ position: "sticky", top: 12 }}>
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px 12px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}
                >
                  Fare Summary
                </span>
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  {totalPassengers} Traveller{totalPassengers !== 1 ? "s" : ""}
                </span>
              </div>

              {fareQuoteLoading ? (
                <div style={{ padding: "28px 20px", textAlign: "center" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#6b7280",
                      fontSize: 13,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Fetching latest fare...
                  </div>
                </div>
              ) : (
                <div style={{ padding: "8px 0" }}>
                  <div className="fare-row">
                    <span style={{ color: "#6b7280" }}>Fare Type</span>
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>
                      {isRefundable ? "Refundable" : "Partial Refundable"}
                    </span>
                  </div>


                  {/* <div className="fare-row">
                    <span>
                      {isCombinedRoundTrip ? "Base Fare" : isRoundTrip ? "Onward Fare" : "Base Faree"}
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      ₹{onwardFareTotal.toLocaleString("en-IN")}
                    </span>
                  </div> */}
                  <FareBreakdownDetail fare={onwardFareQuote?.Results?.Fare} />
                  <div
                    className="fare-row"
                    style={{ borderTop: "1px solid #e5e7eb" }}
                  >
                    <span style={{ fontWeight: 700, color: "#111827" }}>
                      {isCombinedRoundTrip
                        ? "Subtotal"
                        : isRoundTrip
                          ? "Onward Subtotal"
                          : "Subtotal"}
                    </span>
                    <span style={{ fontWeight: 700, color: "#111827" }}>
                      ₹{onwardFareTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* ✅ CHANGE: "Return Flight" wala alag subtotal block
                      SIRF non-combined round-trip case me dikhta hai —
                      combined case me returnFareTotal already 0 hai
                      (returnF ka Fare handleCombinedBook me zero kiya gaya
                      tha), isliye yeh block dikhane ka koi matlab nahi,
                      dikhane se sirf confusing "₹0" row dikhta. */}
                  {isRoundTrip && !isCombinedRoundTrip && (
                    <>
                      <div
                        style={{
                          padding: "12px 20px 4px",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#16a34a",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          borderTop: "1px dashed #e5e7eb",
                          marginTop: 4,
                        }}
                      >
                        Return Flight
                      </div>
                      <div className="fare-row">
                        <span>Return Fare</span>
                        <span style={{ fontWeight: 600 }}>
                          ₹{returnFareTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <FareBreakdownDetail fare={returnFareQuote?.Results?.Fare} />
                      <div
                        className="fare-row"
                        style={{ borderTop: "1px solid #e5e7eb" }}
                      >
                        <span style={{ fontWeight: 700, color: "#111827" }}>
                          Return Subtotal
                        </span>
                        <span style={{ fontWeight: 700, color: "#111827" }}>
                          ₹{returnFareTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 20px",
                  background: "#f9fafb",
                  borderTop: "2px solid #e5e7eb",
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}
                >
                  Net Amount Payable
                </span>
                <span
                  style={{ fontWeight: 800, fontSize: 17, color: "#111827" }}
                >
                  {fareQuoteLoading
                    ? "—"
                    : `₹${totalFare.toLocaleString("en-IN")}`}
                </span>
              </div>

              <div style={{ padding: "16px 20px" }}>
                <button
                  onClick={handleProceed}
                  disabled={fareQuoteLoading}
                  style={{
                    width: "100%",
                    padding: "13px 0",
                    borderRadius: 10,
                    background: fareQuoteLoading
                      ? "#d1d5db"
                      : "linear-gradient(135deg, #16a34a, #15803d)",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    border: "none",
                    cursor: fareQuoteLoading ? "not-allowed" : "pointer",
                    boxShadow: fareQuoteLoading
                      ? "none"
                      : "0 2px 12px rgba(22,163,74,0.3)",
                    transition: "opacity 0.15s",
                  }}
                  onMouseOver={(e) => {
                    if (!fareQuoteLoading)
                      e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {fareQuoteLoading ? "Loading Fare..." : "Proceed to Payment"}
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginTop: 10,
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    Secured &amp; Encrypted Payment
                  </span>
                </div>
              </div>

              {showErrors &&
                (Object.keys(validationErrors).length > 0 ||
                  Object.keys(contactErrors).length > 0 ||
                  Object.keys(billingErrors).length > 0 ||
                  Object.keys(gstErrors).length > 0) && (
                  <div
                    style={{
                      margin: "0 16px 16px",
                      padding: "10px 14px",
                      background: "#fff5f5",
                      border: "1px solid #fca5a5",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#dc2626",
                      fontWeight: 500,
                    }}
                  >
                    ⚠ Please fill all required fields correctly before
                    proceeding.
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}