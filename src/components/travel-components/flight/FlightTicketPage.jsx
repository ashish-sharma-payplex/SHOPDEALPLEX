// src/components/flights/FlightTicketPage.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  FileDownload as Download,
  Share as Share2,
  Home,
  FlightTakeoff,
  FlightLand,
  EventSeat,
  Restaurant,
  Luggage,
  Receipt,
  ExpandMore,
  ContentCopy,
  Person,
  ConfirmationNumber,
  Info,
  Phone,
  CheckCircle,
  CalendarToday,
  SwapHoriz,
  Language,
  ArrowForward,
} from "@mui/icons-material";

/* ─────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────── */
// (colours now live in src/styles/flight.module.css → light + dark values)
const NAVY = "var(--fl-navy)"; // filled navy surfaces (tabs, primary button)
const NAVY_TEXT = "var(--fl-navy-text)"; // navy used as text / outline colour
const BLUE_ACCENT = "var(--fl-blue-accent)";
const BLUE_LIGHT_BG = "var(--fl-blue-accent-bg)";
const GREEN = "var(--fl-brand-text)"; // green text / icons
const GREEN_BG = "var(--fl-brand)"; // green filled background
const GREEN_LIGHT_BG = "var(--fl-success-bg)";
const GREEN_BORDER = "var(--fl-success-border)";
const BORDER = "var(--fl-border)";

/* ─────────────────────────────────────────────────────────────────────────
   AIRLINE LOGOS
───────────────────────────────────────────────────────────────────────── */
const AIRLINE_LOGO_MAP = {
  indigo: "/navbaricons/indigo.png",
  "6e": "/navbaricons/indigo.png",
  spicejet: "/navbaricons/spicejet.svg",
  sg: "/navbaricons/spicejet.png",
  "air india": "/navbaricons/airindia.png",
  ai: "/navbaricons/airindia.png",
  "air india express": "/navbaricons/airindiaexpress.png",
  ix: "/navbaricons/airindia.png",
  "air asia": "/navbaricons/airasia.png",
  i5: "/navbaricons/airasia.png",
  "fly dubai": "/navbaricons/flydubai.png",
  flydubai: "/navbaricons/flydubai.png",
  fz: "/navbaricons/flydubai.png",
  "go air": "/navbaricons/goair.png",
  goair: "/navbaricons/goair.png",
  g8: "/navbaricons/goair.png",
  "akasa air": "/navbaricons/akasaa.png",
};

const getAirlineLogo = (name, code) => {
  const n = (name || "").toLowerCase().trim();
  const c = (code || "").toLowerCase().trim();
  return AIRLINE_LOGO_MAP[n] || AIRLINE_LOGO_MAP[c] || null;
};

/* ─────────────────────────────────────────────────────────────────────────
   LOOKUP MAPS
───────────────────────────────────────────────────────────────────────── */
const PAX_TYPE_LABEL = { 1: "Adult", 2: "Child", 3: "Infant" };
const GENDER_LABEL = { 1: "Male", 2: "Female" };

/* ─────────────────────────────────────────────────────────────────────────
   FORMAT HELPERS
───────────────────────────────────────────────────────────────────────── */
const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateOnly = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDuration = (mins) => {
  if (!mins && mins !== 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

const formatMoney = (amount, currency = "INR") => {
  if (amount === undefined || amount === null) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  }
};

// Fare rule text me <br/> tags aate hain — safely line-breaks me todte hain
const splitFareRuleLines = (text) => {
  if (!text) return [];
  return text
    .split(/<br\s*\/?>/gi)
    .map((line) => line.trim())
    .filter(Boolean);
};

/* ─────────────────────────────────────────────────────────────────────────
   TICKET DATA RESOLVER — combined single-ticket (intl RT) aur normal
   TripIndicator-match dono cases handle karta hai
───────────────────────────────────────────────────────────────────────── */
function getTicketData(ticket, expectedTripIndicator) {
  if (!ticket) return null;
  const ticketsArr = ticket?.tickets;
  const ticketObj = Array.isArray(ticketsArr)
    ? expectedTripIndicator == null
      ? ticketsArr[0]
      : ticketsArr.find(
          (t) => t?.FlightItinerary?.TripIndicator === expectedTripIndicator,
        ) || ticketsArr[0]
    : ticket;

  const itinerary = ticketObj?.FlightItinerary;
  const fare = itinerary?.Fare;
  const segments = itinerary?.Segments || [];
  const passengers = itinerary?.Passenger || [];
  const invoice = itinerary?.Invoice?.[0];
  const fareRules = itinerary?.FareRules || [];
  const leadPax = passengers?.[0];
  const currency = fare?.Currency || "INR";
  const originCode = segments?.[0]?.Origin?.Airport?.AirportCode;
  const destCode =
    segments?.[segments.length - 1]?.Destination?.Airport?.AirportCode;
  const fullLeadName = `${leadPax?.Title || ""} ${leadPax?.FirstName || ""} ${
    leadPax?.LastName || ""
  }`.trim();

  return {
    ticketObj,
    itinerary,
    fare,
    segments,
    passengers,
    invoice,
    fareRules,
    leadPax,
    currency,
    originCode,
    destCode,
    fullLeadName,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   SMALL REUSABLE PIECES
───────────────────────────────────────────────────────────────────────── */
function CopyableValue({ value, label }) {
  const [copied, setCopied] = useState(false);
  if (!value) return "—";
  const handleCopy = () => {
    navigator.clipboard?.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
      <span>{value}</span>
      <Tooltip title={copied ? "Copied!" : `Copy ${label}`}>
        <IconButton size="small" onClick={handleCopy} sx={{ p: 0.3 }}>
          <ContentCopy sx={{ fontSize: 13, color: "var(--fl-text-faint)" }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// Left-column section card — icon badge + title header
function SectionCard({ icon, title, action, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 2.6 },
        mb: 2,
        bgcolor: "var(--fl-surface)",
        border: `1px solid ${BORDER}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: BLUE_LIGHT_BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: BLUE_ACCENT,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 800,
              color: "var(--fl-text-strong)",
            }}
          >
            {title}
          </Typography>
        </Box>
        {action}
      </Box>
      {children}
    </Paper>
  );
}

// Right-sidebar card — plain title, no icon badge
function SidebarCard({ title, icon, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        p: 2.2,
        bgcolor: "var(--fl-surface)",
        border: `1px solid ${BORDER}`,
      }}
    >
      <Typography
        sx={{
          fontSize: 13.5,
          fontWeight: 800,
          color: "var(--fl-text-strong)",
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 0.8,
        }}
      >
        <Box sx={{ color: BLUE_ACCENT, display: "flex", fontSize: 17 }}>
          {icon}
        </Box>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function SidebarRow({ label, value, bold, color }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.6,
        gap: 1,
      }}
    >
      <Typography sx={{ fontSize: 12.5, color: "var(--fl-text-muted)" }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: bold ? 14.5 : 13,
          fontWeight: bold ? 800 : 700,
          color: color || "var(--fl-text-strong)",
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// Top strip item (Booking ID / Date / Booked By / Trip Type)
function StripItem({ icon, label, value }) {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 0.4, minWidth: 0 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
        <Box sx={{ color: BLUE_ACCENT, display: "flex", fontSize: 15 }}>
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: 11,
            color: "var(--fl-text-faint)",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: 13.5,
          fontWeight: 700,
          color: "var(--fl-text-strong)",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// Bottom info mini card (Airline Contact / Booking Source / Web Check-in / Flight Status)
function InfoMiniCard({ icon, label, value, valueColor, subtext, chip }) {
  return (
    <Box
      sx={{
        border: `1px solid ${BORDER}`,
        borderRadius: 2.5,
        p: 1.6,
        display: "flex",
        flexDirection: "column",
        gap: 0.7,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.6,
          color: "var(--fl-text-faint)",
        }}
      >
        <Box sx={{ display: "flex", fontSize: 15 }}>{icon}</Box>
        <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{label}</Typography>
      </Box>
      {chip || (
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: valueColor || "var(--fl-text-strong)",
            wordBreak: "break-word",
          }}
        >
          {value || "—"}
        </Typography>
      )}
      {subtext && (
        <Typography
          sx={{
            fontSize: 10.5,
            color: "var(--fl-text-faint)",
            lineHeight: 1.4,
          }}
        >
          {subtext}
        </Typography>
      )}
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SEGMENT TIMELINE
───────────────────────────────────────────────────────────────────────── */
function SegmentBlock({ segment, isLast }) {
  const origin = segment?.Origin;
  const destination = segment?.Destination;
  const airline = segment?.Airline;
  const logo = getAirlineLogo(airline?.AirlineName, airline?.AirlineCode);

  return (
    <Box
      sx={{
        mb: isLast ? 0 : 3,
        pb: isLast ? 0 : 3,
        borderBottom: isLast ? "none" : `1px solid ${BORDER}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {logo ? (
            <Box
              component="img"
              src={logo}
              alt={airline?.AirlineName || "Airline"}
              sx={{
                width: 22,
                height: 22,
                objectFit: "contain",
                flexShrink: 0,
                bgcolor: "var(--fl-logo-bg)",
                borderRadius: 0.5,
              }}
            />
          ) : (
            <FlightTakeoff
              sx={{ fontSize: 18, color: "var(--fl-text-faint)" }}
            />
          )}
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--fl-text-strong)",
            }}
          >
            {airline?.AirlineName || "Airline"}
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              color: "var(--fl-text-muted)",
              fontWeight: 600,
            }}
          >
            {airline?.AirlineCode} {airline?.FlightNumber}
          </Typography>
          <Chip
            size="small"
            label={segment?.StopOver ? "With Layover" : "Non-stop"}
            sx={{
              fontSize: 11,
              height: 22,
              background: "var(--fl-surface-muted)",
              fontWeight: 600,
            }}
          />
        </Box>
        {segment?.FlightStatus && (
          <Chip
            size="small"
            icon={<CheckCircle sx={{ fontSize: 14 }} />}
            label={segment.FlightStatus}
            sx={{
              fontSize: 11,
              height: 22,
              background: "var(--fl-success-bg-strong)",
              color: "var(--fl-brand-strong-text)",
              fontWeight: 700,
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
          gap: 2,
          alignItems: "center",
        }}
      >
        {/* Origin */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <FlightTakeoff sx={{ color: GREEN, fontSize: 20, mt: 0.3 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
              {origin?.Airport?.AirportCode}
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                color: "var(--fl-text-body)",
                fontWeight: 600,
              }}
            >
              {origin?.Airport?.CityName}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "var(--fl-text-faint)" }}>
              {origin?.Airport?.AirportName}
              {origin?.Airport?.Terminal
                ? ` · Terminal ${origin.Airport.Terminal}`
                : ""}
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                color: "var(--fl-text-strong)",
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {formatDateTime(origin?.DepTime)}
            </Typography>
          </Box>
        </Box>

        {/* Duration middle */}
        <Box
          sx={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{ fontSize: 11, color: "var(--fl-text-faint)", mb: 0.5 }}
          >
            {formatDuration(segment?.Duration)}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              minWidth: 70,
            }}
          >
            <Box
              sx={{
                flex: 1,
                height: 1,
                background: "var(--fl-surface-strong)",
              }}
            />
            <FlightTakeoff sx={{ fontSize: 14, color: GREEN, mx: 0.5 }} />
            <Box
              sx={{
                flex: 1,
                height: 1,
                background: "var(--fl-surface-strong)",
              }}
            />
          </Box>
        </Box>

        {/* Destination */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: { xs: "flex-start", sm: "flex-end" },
          }}
        >
          <Box sx={{ minWidth: 0, textAlign: { xs: "left", sm: "right" } }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
              {destination?.Airport?.AirportCode}
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                color: "var(--fl-text-body)",
                fontWeight: 600,
              }}
            >
              {destination?.Airport?.CityName}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "var(--fl-text-faint)" }}>
              {destination?.Airport?.AirportName}
              {destination?.Airport?.Terminal
                ? ` · Terminal ${destination.Airport.Terminal}`
                : ""}
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                color: "var(--fl-text-strong)",
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {formatDateTime(destination?.ArrTime)}
            </Typography>
          </Box>
          <FlightLand sx={{ color: GREEN, fontSize: 20, mt: 0.3 }} />
        </Box>
      </Box>
    </Box>
  );
}

function FlightDetailsSection({ segments }) {
  const hasTripIndicator = segments.some(
    (s) => s?.TripIndicator === 1 || s?.TripIndicator === 2,
  );

  if (!hasTripIndicator) {
    return segments.map((seg, idx) => (
      <SegmentBlock
        key={idx}
        segment={seg}
        isLast={idx === segments.length - 1}
      />
    ));
  }

  const onwardSegs = segments.filter((s) => s?.TripIndicator === 1);
  const returnSegs = segments.filter((s) => s?.TripIndicator === 2);
  const otherSegs = segments.filter(
    (s) => s?.TripIndicator !== 1 && s?.TripIndicator !== 2,
  );

  const groups = [
    { label: "Onward Flight", segs: onwardSegs },
    { label: "Return Flight", segs: returnSegs },
    ...(otherSegs.length > 0 ? [{ label: null, segs: otherSegs }] : []),
  ].filter((g) => g.segs.length > 0);

  return groups.map((group, gi) => (
    <Box key={gi} sx={{ mb: gi < groups.length - 1 ? 3 : 0 }}>
      {group.label && (
        <Chip
          size="small"
          label={group.label}
          sx={{
            mb: 1.5,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            background:
              group.label === "Onward Flight"
                ? "var(--fl-info-bg)"
                : "var(--fl-purple-bg)",
            color:
              group.label === "Onward Flight"
                ? "var(--fl-info-text)"
                : "var(--fl-purple-text)",
          }}
        />
      )}
      {group.segs.map((seg, idx) => (
        <SegmentBlock
          key={idx}
          segment={seg}
          isLast={idx === group.segs.length - 1}
        />
      ))}
      {gi < groups.length - 1 && <Divider sx={{ mt: 3 }} />}
    </Box>
  ));
}

/* ─────────────────────────────────────────────────────────────────────────
   PASSENGER & SEAT DETAILS
───────────────────────────────────────────────────────────────────────── */
function PassengerIdentityBox({ passenger }) {
  const paxTypeLabel = PAX_TYPE_LABEL[passenger?.PaxType] || "Traveller";
  const genderLabel = GENDER_LABEL[passenger?.Gender];
  const fullName = `${passenger?.Title || ""} ${passenger?.FirstName || ""} ${
    passenger?.LastName || ""
  }`.trim();
  const seatCode = passenger?.SeatDynamic?.[0]?.Code;

  return (
    <Box sx={{ width: { xs: "100%", md: 200 }, flexShrink: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: BLUE_LIGHT_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Person sx={{ fontSize: 20, color: BLUE_ACCENT }} />
        </Box>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--fl-text-strong)",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {fullName || "—"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mb: 1.2 }}>
        <Chip
          size="small"
          label={paxTypeLabel}
          sx={{ fontSize: 10.5, height: 20 }}
        />
        {genderLabel && (
          <Chip
            size="small"
            variant="outlined"
            label={genderLabel}
            sx={{ fontSize: 10.5, height: 20 }}
          />
        )}
        {seatCode && (
          <Chip
            size="small"
            variant="outlined"
            label={`Seat ${seatCode}`}
            sx={{ fontSize: 10.5, height: 20 }}
          />
        )}
      </Box>
      <Typography sx={{ fontSize: 10.5, color: "var(--fl-text-faint)" }}>
        Ticket Number
      </Typography>
      <Typography
        sx={{
          fontSize: 12.5,
          fontWeight: 700,
          fontFamily: "monospace",
          color: GREEN,
        }}
      >
        {passenger?.Ticket?.TicketNumber || "—"}
      </Typography>
    </Box>
  );
}

function PassengerServiceTable({ passenger, segments }) {
  const headers = [
    "Route",
    "Checked Baggage",
    "Cabin Baggage",
    "Meal",
    "Extra Baggage",
  ];
  return (
    <Box sx={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
      <Box
        component="table"
        sx={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}
      >
        <Box component="thead">
          <Box component="tr">
            {headers.map((h) => (
              <Box
                component="th"
                key={h}
                sx={{
                  textAlign: "left",
                  fontSize: 11,
                  color: "var(--fl-text-faint)",
                  fontWeight: 700,
                  pb: 1,
                  borderBottom: `1px solid ${BORDER}`,
                  whiteSpace: "nowrap",
                  pr: 2.5,
                }}
              >
                {h}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {segments.map((segment, idx) => {
            const originCode = segment?.Origin?.Airport?.AirportCode;
            const destCode = segment?.Destination?.Airport?.AirportCode;
            const checkedBaggage = passenger?.SegmentDetails?.find(
              (sd) => sd.FlightInfoIndex === segment?.FlightInfoIndex,
            )?.CheckedInBaggage;
            const additionalInfo = passenger?.SegmentAdditionalInfo?.[idx];
            const meal = passenger?.MealDynamic?.find(
              (m) => m.Origin === originCode && m.Destination === destCode,
            );
            const extraBaggage = passenger?.Baggage?.find(
              (b) => b.Origin === originCode && b.Destination === destCode,
            );

            return (
              <Box component="tr" key={idx}>
                <Box
                  component="td"
                  sx={{
                    py: 1,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "var(--fl-text-strong)",
                    whiteSpace: "nowrap",
                    pr: 2.5,
                  }}
                >
                  {originCode} → {destCode}
                </Box>
                <Box
                  component="td"
                  sx={{
                    py: 1,
                    fontSize: 12.5,
                    color: "var(--fl-text-body)",
                    whiteSpace: "nowrap",
                    pr: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Luggage
                      sx={{ fontSize: 14, color: "var(--fl-text-faint)" }}
                    />
                    {checkedBaggage?.Value
                      ? `${checkedBaggage.Value} ${checkedBaggage.Unit || "KG"}`
                      : "—"}
                  </Box>
                </Box>
                <Box
                  component="td"
                  sx={{
                    py: 1,
                    fontSize: 12.5,
                    color: "var(--fl-text-body)",
                    whiteSpace: "nowrap",
                    pr: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Luggage
                      sx={{ fontSize: 14, color: "var(--fl-text-faint)" }}
                    />
                    {additionalInfo?.CabinBaggage || "—"}
                  </Box>
                </Box>
                <Box
                  component="td"
                  sx={{
                    py: 1,
                    fontSize: 12.5,
                    color: "var(--fl-text-body)",
                    whiteSpace: "nowrap",
                    pr: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Restaurant
                      sx={{ fontSize: 14, color: "var(--fl-text-faint)" }}
                    />
                    {meal?.AirlineDescription || meal?.Code || "—"}
                  </Box>
                </Box>
                <Box
                  component="td"
                  sx={{
                    py: 1,
                    fontSize: 12.5,
                    color: "var(--fl-text-body)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {extraBaggage?.Price > 0 ? (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Luggage
                        sx={{ fontSize: 14, color: "var(--fl-text-faint)" }}
                      />
                      {extraBaggage.Weight}KG · +
                      {formatMoney(extraBaggage.Price)}
                    </Box>
                  ) : (
                    "—"
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

function PassengerSeatCard({ passengers, segments }) {
  return (
    <SectionCard
      icon={<Person sx={{ fontSize: 17 }} />}
      title="Passenger & Seat Details"
      action={
        <Typography
          sx={{ fontSize: 12, color: "var(--fl-text-muted)", fontWeight: 600 }}
        >
          {passengers.length} Passenger{passengers.length > 1 ? "s" : ""}
        </Typography>
      }
    >
      {passengers.map((p, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: idx < passengers.length - 1 ? 3 : 0,
            pb: idx < passengers.length - 1 ? 3 : 0,
            borderBottom:
              idx < passengers.length - 1 ? `1px solid ${BORDER}` : "none",
          }}
        >
          <PassengerIdentityBox passenger={p} />
          <PassengerServiceTable passenger={p} segments={segments} />
        </Box>
      ))}
      <Typography
        sx={{
          fontSize: 11.5,
          color: "var(--fl-text-muted)",
          mt: 2,
          display: "flex",
          alignItems: "center",
          gap: 0.6,
        }}
      >
        <Info sx={{ fontSize: 14, color: "var(--fl-text-faint)" }} /> Seat, Meal
        &amp; Baggage services are per passenger, per sector.
      </Typography>
    </SectionCard>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   AIRLINE REMARK
───────────────────────────────────────────────────────────────────────── */
function AirlineRemarkBlock({ remark }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: 2.5, p: 1.6 }}>
      <Typography
        sx={{
          fontSize: 11,
          color: "var(--fl-text-faint)",
          mb: 0.6,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Info sx={{ fontSize: 14 }} /> Airline Remark
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: "var(--fl-text-muted)",
          lineHeight: 1.6,
          display: expanded ? "block" : "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {remark}
      </Typography>
      <Button
        size="small"
        onClick={() => setExpanded((v) => !v)}
        sx={{
          textTransform: "none",
          fontSize: 12,
          p: 0,
          mt: 0.4,
          color: GREEN,
          fontWeight: 700,
        }}
      >
        {expanded ? "Show Less" : "Show More"}
      </Button>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SIDEBAR — FARE RULES
───────────────────────────────────────────────────────────────────────── */
function FareRulesSidebar({ fareRules }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [showAll, setShowAll] = useState(false);
  if (!fareRules || fareRules.length === 0) return null;

  return (
    <SidebarCard title="Fare Rules" icon={<Info sx={{ fontSize: 17 }} />}>
      {fareRules.map((rule, idx) => {
        const open = showAll || expandedIdx === idx;
        const lines = splitFareRuleLines(rule?.FareRuleDetail);
        return (
          <Box key={idx} sx={{ mb: idx < fareRules.length - 1 ? 0.5 : 0 }}>
            <Box
              onClick={() => setExpandedIdx(open && !showAll ? null : idx)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                py: 0.9,
                borderBottom: `1px solid ${BORDER}`,
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "var(--fl-text-strong)",
                }}
              >
                {rule?.Origin} → {rule?.Destination}{" "}
                <Box
                  component="span"
                  sx={{ color: "var(--fl-text-faint)", fontWeight: 500 }}
                >
                  ({rule?.Airline} · {rule?.FareBasisCode})
                </Box>
              </Typography>
              <ExpandMore
                sx={{
                  fontSize: 18,
                  color: "var(--fl-text-faint)",
                  transform: open ? "rotate(180deg)" : "none",
                  transition: "0.2s",
                  flexShrink: 0,
                }}
              />
            </Box>
            {open && lines.length > 0 && (
              <Box sx={{ py: 1 }}>
                {lines.map((l, i) => (
                  <Typography
                    key={i}
                    sx={{
                      fontSize: 11.5,
                      color: "var(--fl-text-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {l}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
      <Button
        size="small"
        onClick={() => setShowAll((v) => !v)}
        endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
        sx={{
          textTransform: "none",
          fontSize: 12,
          mt: 1,
          p: 0,
          color: BLUE_ACCENT,
          fontWeight: 700,
        }}
      >
        {showAll ? "Collapse fare rules" : "View full fare rules"}
      </Button>
    </SidebarCard>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────── */
export default function FlightTicketPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { onwardTicket, returnTicket, isSingleCombinedTicket, searchMeta } =
    location.state || {};

  const isRoundTrip = !!returnTicket;
  const [activeLeg, setActiveLeg] = useState("onward");

  if (!onwardTicket) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--fl-page)",
        }}
      >
        <Typography>Ticket data not found. Redirecting...</Typography>
      </Box>
    );
  }

  const onwardData = getTicketData(
    onwardTicket,
    isSingleCombinedTicket ? null : 1,
  );
  const returnData = isRoundTrip ? getTicketData(returnTicket, 2) : null;
  const data = activeLeg === "onward" ? onwardData : returnData;

  const {
    ticketObj,
    itinerary,
    fare,
    segments,
    passengers,
    invoice,
    fareRules,
    leadPax,
    currency,
    fullLeadName,
  } = data;

  const bookingStatusLabel =
    ticketObj?.TicketStatus === 1
      ? "CONFIRMED"
      : ticketObj?.TicketStatus || "CONFIRMED";
  const bookingSourceHost =
    typeof window !== "undefined"
      ? window.location.hostname
      : searchMeta?.source || "Website";

  const handleDownloadTicket = () => {
    // console.log("Download ticket", activeLeg);
  };
  const handleShareTicket = () => {
    // console.log("Share ticket", activeLeg);
  };

  return (
    <Box
      sx={{
        background: "var(--fl-page)",
        minHeight: "100vh",
        py: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          px: { xs: 1.5, sm: 2 },
          mt: { xs: 8, sm: "120px" },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
            gap: { xs: 2, lg: 3 },
            alignItems: "start",
          }}
        >
          {/* ══════════════ LEFT COLUMN ══════════════ */}
          <Box sx={{ minWidth: 0 }}>
            {/* Success header */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                p: { xs: 2, sm: 2.6 },
                mb: 2,
                background: GREEN_LIGHT_BG,
                border: `1px solid ${GREEN_BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: GREEN,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: 17, sm: 19 },
                      fontWeight: 800,
                      color: GREEN,
                    }}
                  >
                    {isRoundTrip
                      ? "Both Tickets Confirmed!"
                      : "Booking Confirmed!"}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12.5, color: "var(--fl-text-muted)" }}
                  >
                    {isRoundTrip
                      ? "Your onward and return flights have been successfully booked"
                      : "Your flight has been successfully booked"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "var(--fl-text-faint)",
                    fontWeight: 600,
                  }}
                >
                  Booking Status
                </Typography>
                <Chip
                  size="small"
                  icon={<CheckCircle sx={{ fontSize: 14 }} />}
                  label={bookingStatusLabel}
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    background: "var(--fl-success-bg-strong)",
                    color: "var(--fl-brand-strong-text)",
                    mt: 0.3,
                  }}
                />
              </Box>
            </Paper>

            {/* Summary strip */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                p: { xs: 2, sm: 2.6 },
                mb: 2,
                bgcolor: "var(--fl-surface)",
                border: `1px solid ${BORDER}`,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                  gap: 2,
                }}
              >
                <StripItem
                  icon={<ConfirmationNumber sx={{ fontSize: 15 }} />}
                  label="Booking ID (PNR)"
                  value={<CopyableValue value={ticketObj?.PNR} label="PNR" />}
                />
                <StripItem
                  icon={<CalendarToday sx={{ fontSize: 15 }} />}
                  label="Booking Date"
                  value={formatDateTime(leadPax?.Ticket?.IssueDate)}
                />
                <StripItem
                  icon={<Person sx={{ fontSize: 15 }} />}
                  label="Booked By"
                  value={fullLeadName || "—"}
                />
                <StripItem
                  icon={<SwapHoriz sx={{ fontSize: 15 }} />}
                  label="Trip Type"
                  value={isRoundTrip ? "Round Trip" : "One Way"}
                />
              </Box>
            </Paper>

            {/* Onward / Return switcher */}
            {isRoundTrip && (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: 0.6,
                  mb: 2,
                  display: "flex",
                  gap: 0.6,
                  background: "var(--fl-surface-muted)",
                }}
              >
                {[
                  {
                    key: "onward",
                    label: "Onward",
                    route: `${onwardData?.originCode || ""} → ${
                      onwardData?.destCode || ""
                    }`,
                    icon: <FlightTakeoff sx={{ fontSize: 16 }} />,
                  },
                  {
                    key: "return",
                    label: "Return",
                    route: `${returnData?.originCode || ""} → ${
                      returnData?.destCode || ""
                    }`,
                    icon: <FlightLand sx={{ fontSize: 16 }} />,
                  },
                ].map((tab) => (
                  <Box
                    key={tab.key}
                    onClick={() => setActiveLeg(tab.key)}
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      padding: "10px 12px",
                      borderRadius: 2.5,
                      cursor: "pointer",
                      background: activeLeg === tab.key ? NAVY : "transparent",
                      color:
                        activeLeg === tab.key ? "#fff" : "var(--fl-text-muted)",
                      transition: "all 0.15s",
                    }}
                  >
                    {tab.icon}
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 13.5,
                          lineHeight: 1.2,
                        }}
                      >
                        {tab.label}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 11, opacity: 0.85, fontWeight: 500 }}
                      >
                        {tab.route}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            )}

            {/* Flight Details */}
            <SectionCard
              icon={<FlightTakeoff sx={{ fontSize: 17 }} />}
              title="Flight Details"
            >
              <FlightDetailsSection segments={segments} />
            </SectionCard>

            {/* Passenger & Seat Details */}
            <PassengerSeatCard passengers={passengers} segments={segments} />

            {/* Contact / status grid */}
            <SectionCard
              icon={<Info sx={{ fontSize: 17 }} />}
              title="Additional Information"
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <InfoMiniCard
                  icon={<Phone sx={{ fontSize: 15 }} />}
                  label="Airline Contact"
                  value={
                    itinerary?.AirlineTollFreeNo ||
                    segments?.[0]?.Airline?.AirlineName
                  }
                  subtext={
                    itinerary?.AirlineTollFreeNo
                      ? segments?.[0]?.Airline?.AirlineName
                      : undefined
                  }
                />
                <InfoMiniCard
                  icon={<Language sx={{ fontSize: 15 }} />}
                  label="Booking Source"
                  value={bookingSourceHost}
                />
                <InfoMiniCard
                  icon={<CheckCircle sx={{ fontSize: 15 }} />}
                  label="Web Check-in"
                  value={
                    itinerary?.IsWebCheckInAllowed
                      ? "Available"
                      : "Not Available"
                  }
                  valueColor={
                    itinerary?.IsWebCheckInAllowed
                      ? GREEN
                      : "var(--fl-text-strong)"
                  }
                  subtext={
                    itinerary?.IsWebCheckInAllowed
                      ? "Check-in opens 48 hrs before departure"
                      : undefined
                  }
                />
                <InfoMiniCard
                  icon={<CheckCircle sx={{ fontSize: 15 }} />}
                  label="Flight Status"
                  value={segments?.[0]?.FlightStatus || "On Time"}
                  valueColor={GREEN}
                  subtext={`Last updated: ${formatDateTime(
                    leadPax?.Ticket?.IssueDate,
                  )}`}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                {itinerary?.AirlineRemark && (
                  <AirlineRemarkBlock remark={itinerary.AirlineRemark} />
                )}
                {leadPax?.BarcodeDetails?.Barcode?.[0]?.Content && (
                  <Box
                    sx={{
                      border: `1px solid ${BORDER}`,
                      borderRadius: 2.5,
                      p: 1.6,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "var(--fl-text-faint)",
                        mb: 0.6,
                        fontWeight: 700,
                      }}
                    >
                      Boarding Pass Reference
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        fontFamily: "monospace",
                        color: "var(--fl-text-body)",
                        wordBreak: "break-all",
                      }}
                    >
                      {leadPax.BarcodeDetails.Barcode[0].Content}
                    </Typography>
                  </Box>
                )}
              </Box>
            </SectionCard>
          </Box>

          {/* ══════════════ RIGHT SIDEBAR ══════════════ */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              position: { lg: "sticky" },
              top: { lg: 20 },
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={handleDownloadTicket}
              startIcon={<Download sx={{ fontSize: 18 }} />}
              sx={{
                background: NAVY,
                "&:hover": { background: "var(--fl-navy-hover)" },
                textTransform: "none",
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 2.5,
                py: 1.2,
              }}
            >
              Download Ticket
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleShareTicket}
              startIcon={<Share2 sx={{ fontSize: 18 }} />}
              sx={{
                borderColor: NAVY_TEXT,
                color: NAVY_TEXT,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 2.5,
                py: 1.2,
                "&:hover": { background: BLUE_LIGHT_BG, borderColor: NAVY },
              }}
            >
              Share Ticket
            </Button>

            <SidebarCard
              title="Booking Summary"
              icon={<ConfirmationNumber sx={{ fontSize: 17 }} />}
            >
              <SidebarRow label="Booking ID (PNR)" value={ticketObj?.PNR} />
              <SidebarRow
                label="Booking Date"
                value={formatDateTime(leadPax?.Ticket?.IssueDate)}
              />
              <SidebarRow label="Booked By" value={fullLeadName} />
              <SidebarRow
                label="Trip Type"
                value={isRoundTrip ? "Round Trip" : "One Way"}
              />
              <SidebarRow
                label="Passengers"
                value={`${passengers.length} ${
                  passengers.length > 1 ? "Passengers" : "Adult"
                }`}
              />
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{ fontSize: 12.5, color: "var(--fl-text-muted)" }}
                >
                  Booking Status
                </Typography>
                <Chip
                  size="small"
                  label={bookingStatusLabel}
                  sx={{
                    fontWeight: 700,
                    fontSize: 11.5,
                    background: "var(--fl-success-bg-strong)",
                    color: "var(--fl-brand-strong-text)",
                  }}
                />
              </Box>
            </SidebarCard>

            <SidebarCard
              title="Fare Summary"
              icon={<Receipt sx={{ fontSize: 17 }} />}
            >
              <SidebarRow label="Currency" value={currency} />
              <SidebarRow
                label="Base Fare"
                value={formatMoney(fare?.BaseFare, currency)}
              />
              <SidebarRow
                label="Taxes & Fees"
                value={formatMoney(fare?.Tax, currency)}
              />
              {fare?.Discount > 0 && (
                <SidebarRow
                  label="Discount"
                  value={`- ${formatMoney(fare.Discount, currency)}`}
                  color="var(--fl-danger-text)"
                />
              )}
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                  Total Fare
                </Typography>
                <Typography
                  sx={{ fontSize: 17, fontWeight: 800, color: GREEN }}
                >
                  {formatMoney(fare?.PublishedFare, currency)}
                </Typography>
              </Box>
            </SidebarCard>

            <SidebarCard
              title="Invoice Details"
              icon={<Receipt sx={{ fontSize: 17 }} />}
            >
              <SidebarRow
                label="Invoice No."
                value={invoice?.InvoiceNo || "—"}
              />
              <SidebarRow
                label="Invoice Date"
                value={formatDateOnly(
                  invoice?.InvoiceCreatedOn || leadPax?.Ticket?.IssueDate,
                )}
              />
              <SidebarRow label="GST No." value={leadPax?.GSTNumber || "—"} />
              <SidebarRow label="PAN" value={leadPax?.PAN || "—"} />
              <SidebarRow
                label="Billing To"
                value={leadPax?.GSTCompanyName || fullLeadName}
              />
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                  Total Payable
                </Typography>
                <Typography
                  sx={{ fontSize: 17, fontWeight: 800, color: GREEN }}
                >
                  {formatMoney(
                    invoice?.InvoiceAmount || fare?.PublishedFare,
                    currency,
                  )}
                </Typography>
              </Box>
            </SidebarCard>

            <FareRulesSidebar fareRules={fareRules} />

            {isRoundTrip && (
              <Button
                fullWidth
                variant="outlined"
                onClick={() =>
                  setActiveLeg(activeLeg === "onward" ? "return" : "onward")
                }
                sx={{
                  borderColor: NAVY_TEXT,
                  color: NAVY_TEXT,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 13.5,
                  borderRadius: 2.5,
                  py: 1,
                  "&:hover": { background: BLUE_LIGHT_BG },
                }}
              >
                View {activeLeg === "onward" ? "Return" : "Onward"} Ticket →
              </Button>
            )}

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/flights", { replace: true })}
              startIcon={<Home sx={{ fontSize: 18 }} />}
              sx={{
                borderColor: BORDER,
                color: "var(--fl-text-body)",
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13.5,
                borderRadius: 2.5,
                py: 1,
                "&:hover": { background: "var(--fl-surface-subtle)" },
              }}
            >
              Back to Flights
            </Button>
          </Box>
        </Box>

        {/* Full-width confirmation notice */}
        <Box
          sx={{
            mt: 3,
            padding: 2,
            background: "var(--fl-warn-bg)",
            border: "1px solid var(--fl-warn-border)",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{ fontSize: 12, color: "var(--fl-warn-text)", lineHeight: 1.6 }}
          >
            Please carry a valid photo ID proof and reach the airport on time. A
            confirmation email has been sent to your registered email address.
            Have a safe and pleasant journey!
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
