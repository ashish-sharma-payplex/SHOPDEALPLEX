// src/components/flights/SSRSeatPage.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { useSSR } from "components/travel-hooks/flight/useSSR";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


/* ─────────────────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────────────── */
const MealIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);
const BaggageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="7" width="12" height="14" rx="2" /><path d="M9 7V5a2 2 0 0 1 4 0v2" /><line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);
const IconSeat = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 20v-4a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v4" /><circle cx="12" cy="7" r="3" />
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconFlight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

const BAGGAGE_ICONS = [
  { max: 3, icon: "/navbaricons/3kg.svg" },
  { max: 5, icon: "/navbaricons/5kg.svg" },
  { max: 10, icon: "/navbaricons/10kg.svg" },
  { max: 15, icon: "/navbaricons/15kg.svg" },
  { max: 20, icon: "/navbaricons/20kg.svg" },
  { max: 30, icon: "/navbaricons/30kg.svg" },
];

const getClosestBagIcon = (weight = 0) => {
  const match = BAGGAGE_ICONS.find((item) => weight <= item.max);

  return (
    <img
      src={(match || BAGGAGE_ICONS[BAGGAGE_ICONS.length - 1]).icon}
      alt={`${weight}kg baggage`}
      style={{
        width: 46,
        height: 46,
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  );
};

const getMealEmoji = (code) => {
  const map = { VGAN: "🥗", PTSW: "🥪", LCML: "🥗", JNML: "🧆", FRCK: "🍰", DBVG: "🥦", CPML: "🍱", CJSW: "🥙", AGSW: "🍛" };
  return map[code] || "🍽️";
};

/* ─────────────────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────────────────── */
function Toast({ message, show }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: "#111827", color: "#fff", padding: "12px 20px", borderRadius: 10,
      fontSize: 13.5, fontWeight: 600, boxShadow: "0 6px 20px rgba(0,0,0,0.25)", zIndex: 9999,
      display: "flex", alignItems: "center", gap: 8, maxWidth: "90vw", textAlign: "center",
      animation: "toast-in 0.25s ease",
    }}>
      <span style={{ fontSize: 16 }}>⚠️</span>{message}
      <style>{`@keyframes toast-in{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SEAT MAP HELPERS
───────────────────────────────────────────────────────────────────────── */
const isAvailable = (seat) => seat.AvailablityType === 1;
const isExitRow = (seat) => [4, 6, 10, 12, 16, 18].includes(seat.SeatType);

function groupByRow(seats) {
  const map = {};
  for (const s of seats) {
    if (s.Code === "NoSeat") continue;
    const r = s.RowNo;
    if (!map[r]) map[r] = [];
    map[r].push(s);
  }
  return map;
}
function flattenSeatRows(seatRows) {
  return seatRows.flatMap((r) => r.Seats || []);
}

function seatStyle(seat, state) {
  if (state === "blocked") return { bg: "#E2E6EA", border: "#C8CDD4", text: "#9AA3AE", cursor: "not-allowed" };
  if (state === "selected") return { bg: "#16a34a", border: "#15803d", text: "#fff", cursor: "pointer" };
  if (state === "other") return { bg: "#DBEAFE", border: "#93C5FD", text: "#2563EB", cursor: "not-allowed" };
  const p = seat.Price;
  if (p === 0) return { bg: "#F8FAFC", border: "#CBD5E0", text: "#64748B", cursor: "pointer" };
  if (isExitRow(seat)) return { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", cursor: "pointer" };
  if (p >= 1500) return { bg: "#F3E8FF", border: "#C084FC", text: "#7E22CE", cursor: "pointer" };
  if (p >= 800) return { bg: "#DBEAFE", border: "#60A5FA", text: "#1E40AF", cursor: "pointer" };
  if (p >= 400) return { bg: "#DCFCE7", border: "#4ADE80", text: "#166534", cursor: "pointer" };
  return { bg: "#F8FAFC", border: "#CBD5E0", text: "#64748B", cursor: "pointer" };
}

function SeatCell({ seat, state, onSelect }) {
  const [hov, setHov] = useState(false);
  const s = seatStyle(seat, state);
  const isBlocked = state === "blocked" || state === "other";
  const isSelected = state === "selected";
  const bg = hov && !isBlocked ? (isSelected ? "#15803d" : "#bbf7d0") : s.bg;

  return (
    <div
      title={isBlocked
        ? (seat.AvailablityType === 3 ? "Occupied" : state === "other" ? "Selected by another passenger" : "Unavailable")
        : `${seat.Code}${seat.Price > 0 ? ` · ₹${seat.Price}` : " · Free"}${isExitRow(seat) ? " · Exit Row" : ""}`}
      onClick={() => !isBlocked && onSelect(seat)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 28, borderRadius: "5px 5px 2px 2px", border: `1.5px solid ${s.border}`,
        background: bg, cursor: s.cursor, display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.12s", transform: isSelected ? "scale(1.12)" : "scale(1)", flexShrink: 0,
        position: "relative", boxShadow: isSelected ? "0 2px 8px rgba(22,163,74,0.35)" : "none",
      }}
    >
      {isBlocked && !isSelected ? (
        <div style={{ width: 12, height: 12, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: "100%", height: "1.5px", background: "#9AA3AE", transform: "rotate(45deg)", borderRadius: 1 }} />
          <div style={{ position: "absolute", width: "100%", height: "1.5px", background: "#9AA3AE", transform: "rotate(-45deg)", borderRadius: 1 }} />
        </div>
      ) : isSelected ? (
        <div style={{ color: "#fff" }}><CheckIcon /></div>
      ) : (
        <span style={{ fontSize: "0.52rem", fontWeight: 700, color: s.text, lineHeight: 1, letterSpacing: "-0.2px" }}>
          {isExitRow(seat) ? "EXIT" : seat.Price === 0 ? "FREE" : ""}
        </span>
      )}
    </div>
  );
}

function CabinMap({ seatRows, selections, activePassengerId, onSelect }) {
  const selectedByActive = selections[activePassengerId]?.Code;
  const allSelected = new Set(Object.values(selections).map((s) => s?.Code).filter(Boolean));
  const sortedRowNos = Object.keys(seatRows).map(Number).sort((a, b) => a - b);

  const exitRowSet = useMemo(() => {
    const s = new Set();
    for (const [rNo, seats] of Object.entries(seatRows)) if (seats.some(isExitRow)) s.add(Number(rNo));
    return s;
  }, [seatRows]);

  const SW = 30, GAP = 4, AISLE = 22;
  const LEFT_COLS = ["A", "B", "C"], RIGHT_COLS = ["D", "E", "F"];
  const SIDE_W = SW * 3 + GAP * 2;
  const TOTAL_W = SIDE_W * 2 + AISLE + 28;
  const PLANE_W = TOTAL_W + 32;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
      <img src="/aerofront.png" alt="Aircraft front" style={{ display: "block", width: PLANE_W, height: "auto", marginBottom: -2, objectFit: "contain" }} />
      <div style={{
        border: "1.5px solid #CBD5E0", borderTop: "none", borderBottom: "none", borderRadius: 0,
        background: "linear-gradient(to bottom, #F8FAFC, #F1F5F9)", padding: "8px 16px 28px",
        width: PLANE_W, boxSizing: "border-box", position: "relative",
      }}>
        {["left", "right"].map((side) => (
          <div key={side} style={{
            position: "absolute", [side === "left" ? "left" : "right"]: -16, top: "35%", width: 16, height: 56,
            background: `linear-gradient(to ${side === "left" ? "right" : "left"}, transparent, #CBD5E0)`,
            borderRadius: side === "left" ? "8px 0 0 8px" : "0 8px 8px 0",
          }} />
        ))}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6, paddingLeft: 14 }}>
          {LEFT_COLS.map((c, i) => (
            <div key={c} style={{ width: SW, marginRight: i < 2 ? GAP : 0, textAlign: "center" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#94A3B8", letterSpacing: 1 }}>{c}</span>
            </div>
          ))}
          <div style={{ width: AISLE + 28 }} />
          {RIGHT_COLS.map((c, i) => (
            <div key={c} style={{ width: SW, marginLeft: i > 0 ? GAP : 0, textAlign: "center" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#94A3B8", letterSpacing: 1 }}>{c}</span>
            </div>
          ))}
        </div>
        <div style={{ maxHeight: 420, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#CBD5E0 transparent" }}>
          {sortedRowNos.map((rowNo) => {
            const rowSeats = seatRows[rowNo];
            const isExit = exitRowSet.has(rowNo);
            const byCol = {};
            for (const s of rowSeats) byCol[s.SeatNo] = s;
            const prevRowNo = sortedRowNos[sortedRowNos.indexOf(rowNo) - 1];
            const showExitMarker = isExit && (!prevRowNo || !exitRowSet.has(prevRowNo));

            return (
              <div key={rowNo}>
                {showExitMarker && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "6px 0 4px", padding: "0 2px" }}>
                    <div style={{ flex: 1, height: 1, background: "#FCD34D" }} />
                    <span style={{ fontSize: "0.48rem", fontWeight: 900, color: "#D97706", letterSpacing: 1.5 }}>EXIT ROW</span>
                    <div style={{ flex: 1, height: 1, background: "#FCD34D" }} />
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", marginBottom: GAP }}>
                  {LEFT_COLS.map((col, ci) => {
                    const seat = byCol[col];
                    if (!seat) return <div key={col} style={{ width: SW, marginRight: ci < 2 ? GAP : 0 }} />;
                    const isThisSelected = selectedByActive === seat.Code;
                    const isOtherSelected = !isThisSelected && allSelected.has(seat.Code);
                    const blocked = !isAvailable(seat);
                    const state = blocked ? "blocked" : isThisSelected ? "selected" : isOtherSelected ? "other" : "available";
                    return <div key={col} style={{ marginRight: ci < 2 ? GAP : 0 }}><SeatCell seat={seat} state={state} onSelect={onSelect} /></div>;
                  })}
                  <div style={{ width: AISLE + 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "0.55rem", color: "#94A3B8", fontWeight: 700 }}>{rowNo}</span>
                  </div>
                  {RIGHT_COLS.map((col, ci) => {
                    const seat = byCol[col];
                    if (!seat) return <div key={col} style={{ width: SW, marginLeft: ci > 0 ? GAP : 0 }} />;
                    const isThisSelected = selectedByActive === seat.Code;
                    const isOtherSelected = !isThisSelected && allSelected.has(seat.Code);
                    const blocked = !isAvailable(seat);
                    const state = blocked ? "blocked" : isThisSelected ? "selected" : isOtherSelected ? "other" : "available";
                    return <div key={col} style={{ marginLeft: ci > 0 ? GAP : 0 }}><SeatCell seat={seat} state={state} onSelect={onSelect} /></div>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <img src="/aeroback.png" alt="Aircraft back" style={{ display: "block", width: PLANE_W, height: "auto", marginTop: -2, objectFit: "contain" }} />
    </div>
  );
}

const LEGEND = [
  { bg: "#DCFCE7", border: "#4ADE80", label: "₹300–799" },
  { bg: "#DBEAFE", border: "#60A5FA", label: "₹800–1499" },
  { bg: "#F3E8FF", border: "#C084FC", label: "₹1500+" },
  { bg: "#FEF3C7", border: "#F59E0B", label: "Exit Row" },
  { bg: "#F8FAFC", border: "#CBD5E0", label: "Free" },
  { bg: "#16a34a", border: "#15803d", label: "Selected" },
  { bg: "#E2E6EA", border: "#C8CDD4", label: "Occupied" },
];

const PAX_LABELS = { 1: "Adult", 2: "Child", 3: "Infant" };
const TAX_LABELS = {
  YR: "Fuel Surcharge (YR)",
  YQTax: "Airline Fuel Charge (YQ)",
  OtherTaxes: "Other Taxes & Fees",
  K3: "K3 Charges",
};

// ✅ NEW: Dikhata hai PublishedFare kaise calculate hua — har passenger
// type (Adult/Child/Infant) apne alag bordered box me, labels left
// column me, prices right column me, grid se properly aligned.
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


/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function SSRSeatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    flight, returnFlight, searchMeta, travellers, contact, billing, gst,
    fareQuote, returnFareQuote, traceId, resultIndex, returnResultIndex, isLCC,
  } = location.state || {};

  const isRoundTrip = !!returnFlight;

  // ✅ CHANGE: combined international round-trip flag — BookFlight se
  // `searchMeta.isCombinedRoundTrip` already thread ho raha hai. Isse
  // decide hota hai: (a) SSR sirf EK baar fetch hogi, (b) seat segments
  // ko flight-number se onward/return classify karna padega (kyunki
  // sab kuch ek hi `onwardSSR` response me aata hai), (c) saveSSR me
  // ek hi Journey (ek ResultIndex) bhejni hai.
  const isCombinedRoundTrip = !!searchMeta?.isCombinedRoundTrip;

  const { onwardSSR, returnSSR, loading, error, fetchSSR, saveSSR, saving } = useSSR();

  // ── FIX: track whether fetchSSR has actually been kicked off. Without
  //    this, the auto-skip effect below can run on the very first render
  //    (before `loading` flips to true) and see `ssrPhaseHasContent = false`
  //    simply because the response hasn't arrived yet — causing it to
  //    incorrectly skip straight to payment. ──────────────────────────────
  const [ssrFetchStarted, setSsrFetchStarted] = useState(false);

  // ✅ CHANGE: combined case me poora SSR data (dono legs ke saare segments
  // — jaise BOM-NRT, HND-TOY, TOY-HND, NRT-BOM) ek hi `onwardSSR` response
  // me aata hai, aur har segment ka apna `flight_number` hota hai. Return
  // flight ke Segments se return-leg ke flight numbers ka ek Set banate
  // hain taaki har SSR segment ko uske flight_number se onward/return me
  // sahi classify kar sakein.
  const returnFlightNumbers = useMemo(() => {
    const nums = (returnFlight?.Segments?.[0] || [])
      .map((s) => s?.Airline?.FlightNumber)
      .filter(Boolean);
    return new Set(nums);
  }, [returnFlight]);

  const classifyCombinedLeg = (segFlightNumber) =>
    returnFlightNumbers.has(segFlightNumber) ? "return" : "onward";

  useEffect(() => {
    // console.log("[CHECKPOINT 5] SSRSeatPage resultIndex:", resultIndex);
    if (traceId && resultIndex) {
      setSsrFetchStarted(true);
      fetchSSR({
        traceId,
        onwardResultIndex: resultIndex,
        // ✅ CHANGE: combined round-trip me returnResultIndex FORCE NULL —
        // ek hi ResultIndex se poora data mil jaata hai, doosri API call
        // ki zaroorat hi nahi. isCombinedRoundTrip flag bhi pass kar rahe
        // hain taaki hook ke andar bhi yehi decision confirm ho.
        returnResultIndex: isCombinedRoundTrip
          ? null
          : (returnResultIndex || returnFlight?.ResultIndex || null),
        isCombinedRoundTrip,
      });
    } else {
      // ── Helpful debug signal — if this fires, traceId/resultIndex never
      //    reached this page from BookFlight, so SSR can never load. ──────
      // console.error(
      //   "[SSRSeatPage] Missing traceId/resultIndex — cannot fetch SSR.",
      //   { traceId, resultIndex },
      // );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Required-field flags straight from FareQuote ── */
  const onwardValidators = fareQuote?.Results?.RequiredFieldValidators || {};
  const returnValidators = returnFareQuote?.Results?.RequiredFieldValidators || {};
  const isMealRequired = !!(onwardValidators.IsMealRequired || returnValidators.IsMealRequired);
  const isSeatRequiredFlag = !!(onwardValidators.IsSeatRequired || returnValidators.IsSeatRequired);

  // ── Passport/PAN required flags — same 6-flag OR logic as BookFlight.jsx,
  //    thread karke saveSSR tak bhejte hain taaki Child/Infant guardian
  //    vs khud-ka-document decision form aur save API dono jagah consistent
  //    rahe. ────────────────────────────────────────────────────────────
  const requiresPassport = !!(
    fareQuote?.Results?.IsPassportRequiredAtBook ||
    fareQuote?.Results?.IsPassportRequiredAtTicket ||
    fareQuote?.Results?.IsPassportFullDetailRequiredAtBook ||
    fareQuote?.Results?.IsPassportFullDetailRequiredAtTicket ||
    returnFareQuote?.Results?.IsPassportRequiredAtBook ||
    returnFareQuote?.Results?.IsPassportRequiredAtTicket ||
    returnFareQuote?.Results?.IsPassportFullDetailRequiredAtBook ||
    returnFareQuote?.Results?.IsPassportFullDetailRequiredAtTicket
  );
  const requiresPan = !!(
    fareQuote?.Results?.IsPanRequiredAtBook ||
    fareQuote?.Results?.IsPanRequiredAtTicket ||
    returnFareQuote?.Results?.IsPanRequiredAtBook ||
    returnFareQuote?.Results?.IsPanRequiredAtTicket
  );

  /* ═════════════════════════ PHASE CONTROL ═════════════════════════ */
  // "ssr" -> meals/baggage, "seats" -> seat map
  const [phase, setPhase] = useState("ssr");

  /* ═════════════════════════ MEALS / BAGGAGE (ssr phase) ═════════════════════════ */
  const [activeTab, setActiveTab] = useState("meals");
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0);

  const allTravellers = useMemo(() => {
    const list = [];
    (travellers?.adults || []).forEach((t) => list.push({ ...t, ptype: "Adult" }));
    (travellers?.children || []).forEach((t) => list.push({ ...t, ptype: "Child" }));
    (travellers?.infants || []).forEach((t) => list.push({ ...t, ptype: "Infant" }));
    return list;
  }, [travellers]);

  const [activeTravellerIdx, setActiveTravellerIdx] = useState(0);
  const [selectedMeals, setSelectedMeals] = useState({});
  const [selectedBaggage, setSelectedBaggage] = useState({});

  // ✅ CHANGE: meal/baggage segments bhi combined case me flight-number se
  // classify hote hain (abhi tumhare paas meal/baggage data nahi hai, par
  // structure future-proof rakha hai — same pattern jo seats ke liye use
  // kiya). Non-combined case bilkul purana behavior.
  const mealSegments = useMemo(() => {
    if (isCombinedRoundTrip) {
      return (onwardSSR?.MealsBySegment || []).map((s) => {
        const leg = classifyCombinedLeg(s.flight_number);
        return { ...s, leg, key: `${leg}-${s.segment_key}` };
      });
    }
    const onward = (onwardSSR?.MealsBySegment || []).map((s) => ({ ...s, leg: "onward", key: `onward-${s.segment_key}` }));
    const ret = isRoundTrip ? (returnSSR?.MealsBySegment || []).map((s) => ({ ...s, leg: "return", key: `return-${s.segment_key}` })) : [];
    return [...onward, ...ret];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onwardSSR, returnSSR, isRoundTrip, isCombinedRoundTrip, returnFlightNumbers]);

  const baggageSegments = useMemo(() => {
    if (isCombinedRoundTrip) {
      return (onwardSSR?.BaggageBySegment || []).map((s) => {
        const leg = classifyCombinedLeg(s.flight_number);
        return { ...s, leg, key: `${leg}-${s.segment_key}` };
      });
    }
    const onward = (onwardSSR?.BaggageBySegment || []).map((s) => ({ ...s, leg: "onward", key: `onward-${s.segment_key}` }));
    const ret = isRoundTrip ? (returnSSR?.BaggageBySegment || []).map((s) => ({ ...s, leg: "return", key: `return-${s.segment_key}` })) : [];
    return [...onward, ...ret];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onwardSSR, returnSSR, isRoundTrip, isCombinedRoundTrip, returnFlightNumbers]);

  const currentMealSeg = mealSegments[activeSegmentIdx];
  const currentBagSeg = baggageSegments[activeSegmentIdx] || baggageSegments[0];
  const availableMeals = (currentMealSeg?.meals || []).filter((m) => m.Code !== "NoMeal");
  const availableBaggage = (currentBagSeg?.baggage || []).filter((b) => b.Code !== "NoBaggage");

  // Is there *anything at all* to pick from on the meals/baggage screen?
  const hasAnyMealOptions = mealSegments.some((seg) => (seg.meals || []).some((m) => m.Code !== "NoMeal"));
  const hasAnyBaggageOptions = baggageSegments.some((seg) => (seg.baggage || []).some((b) => b.Code !== "NoBaggage"));
  const ssrPhaseHasContent = hasAnyMealOptions || hasAnyBaggageOptions;

  const mealSelectionApplicable = isMealRequired && hasAnyMealOptions;

  const currentTraveller = allTravellers[activeTravellerIdx];
  const getSelectedMeal = (segKey, travId) => selectedMeals?.[segKey]?.[travId] || null;
  const getSelectedBag = (segKey, travId) => selectedBaggage?.[segKey]?.[travId] || null;

  const handleSelectMeal = (meal) => {
    const seg = currentMealSeg;
    const segKey = seg?.key;
    const travId = currentTraveller?.id;
    setSelectedMeals((prev) => {
      const prevSeg = prev[segKey] || {};
      if (prevSeg[travId]?.Code === meal.Code) {
        if (mealSelectionApplicable) return prev;
        const updated = { ...prevSeg };
        delete updated[travId];
        return { ...prev, [segKey]: updated };
      }
      return {
        ...prev,
        [segKey]: {
          ...prevSeg,
          [travId]: {
            ...meal,
            _segOrigin: seg.origin,
            _segDestination: seg.destination,
            _segAirlineCode: seg.airline_code || "",
            _segFlightNumber: seg.flight_number || "",
            _leg: seg.leg,
          },
        },
      };
    });
  };

  const handleSelectBaggage = (bag) => {
    const seg = currentBagSeg;
    const segKey = seg?.key;
    const travId = currentTraveller?.id;
    setSelectedBaggage((prev) => {
      const prevSeg = prev[segKey] || {};
      if (prevSeg[travId]?.Code === bag.Code) {
        const updated = { ...prevSeg };
        delete updated[travId];
        return { ...prev, [segKey]: updated };
      }
      return {
        ...prev,
        [segKey]: {
          ...prevSeg,
          [travId]: {
            ...bag,
            _segOrigin: seg.origin,
            _segDestination: seg.destination,
            _segAirlineCode: seg.airline_code || "",
            _segFlightNumber: seg.flight_number || "",
            _leg: seg.leg,
          },
        },
      };
    });
  };

  const extraMealTotal = useMemo(() => {
    let total = 0;
    Object.values(selectedMeals).forEach((segMap) => Object.values(segMap).forEach((m) => { total += m.Price || 0; }));
    return total;
  }, [selectedMeals]);

  const extraBaggageTotal = useMemo(() => {
    let total = 0;
    Object.values(selectedBaggage).forEach((segMap) => Object.values(segMap).forEach((b) => { total += b.Price || 0; }));
    return total;
  }, [selectedBaggage]);

  const extraMealTotalByLeg = useMemo(() => {
    const totals = { onward: 0, return: 0 };
    mealSegments.forEach((seg) => {
      const segMap = selectedMeals[seg.key] || {};
      Object.values(segMap).forEach((m) => { totals[seg.leg] += m.Price || 0; });
    });
    return totals;
  }, [selectedMeals, mealSegments]);

  const extraBaggageTotalByLeg = useMemo(() => {
    const totals = { onward: 0, return: 0 };
    baggageSegments.forEach((seg) => {
      const segMap = selectedBaggage[seg.key] || {};
      Object.values(segMap).forEach((b) => { totals[seg.leg] += b.Price || 0; });
    });
    return totals;
  }, [selectedBaggage, baggageSegments]);

  const missingMealSelections = useMemo(() => {
    if (!mealSelectionApplicable) return [];
    const missing = [];
    mealSegments.forEach((seg) => {
      const hasRealMeals = (seg.meals || []).some((m) => m.Code !== "NoMeal");
      if (!hasRealMeals) return;
      allTravellers.forEach((trav) => {
        if (!selectedMeals?.[seg.key]?.[trav.id]) missing.push({ seg, trav });
      });
    });
    return missing;
  }, [mealSelectionApplicable, mealSegments, allTravellers, selectedMeals]);

  const mealSelectionComplete = missingMealSelections.length === 0;

  const jumpToMissingMeal = () => {
    if (missingMealSelections.length === 0) return;
    const { seg, trav } = missingMealSelections[0];
    const segIdx = mealSegments.findIndex((s) => s.key === seg.key);
    const travIdx = allTravellers.findIndex((t) => t.id === trav.id);
    setActiveTab("meals");
    if (segIdx !== -1) setActiveSegmentIdx(segIdx);
    if (travIdx !== -1) setActiveTravellerIdx(travIdx);
  };

  /* ═════════════════════════ SEATS (seats phase) ═════════════════════════ */
  const allPassengers = useMemo(() => {
    const list = [];
    (travellers?.adults || []).forEach((t, i) => list.push({ ...t, ptype: "Adult", idx: i }));
    (travellers?.children || []).forEach((t, i) => list.push({ ...t, ptype: "Child", idx: i }));
    (travellers?.infants || []).forEach((t, i) => list.push({ ...t, ptype: "Infant", idx: i }));
    return list;
  }, [travellers]);

  const [activePassIdx, setActivePassIdx] = useState(0);
  const activePass = allPassengers[activePassIdx];

  // ✅ CHANGE: combined round-trip case me poora seat data (saare segments —
  // BOM-NRT, HND-TOY, TOY-HND, NRT-BOM) ek hi `onwardSSR.SeatsBySegment`
  // response me aata hai. `returnSSR` kabhi populate hi nahi hoga (kyunki
  // doosri API call ki hi nahi jaati), isliye har segment ko uske apne
  // `flight_number` se `classifyCombinedLeg` ke through onward/return me
  // classify karte hain — array order (jo backend se aaya) preserve rehta
  // hai taaki onward → return ka natural sequence dikhe.
  const seatSegments = useMemo(() => {
    const hasRealSeats = (s) =>
      s.seat_rows?.some((r) => r.Seats?.some((seat) => seat.Code !== "NoSeat"));

    if (isCombinedRoundTrip) {
      return (onwardSSR?.SeatsBySegment || [])
        .filter(hasRealSeats)
        .map((s) => {
          const leg = classifyCombinedLeg(s.flight_number);
          return {
            ...s,
            leg,
            key: `${leg}-${s.segment_key}`,
            label: `${s.origin} → ${s.destination}`,
            flightNo: s.flight_number,
          };
        });
    }

    const onward = (onwardSSR?.SeatsBySegment || [])
      .filter(hasRealSeats)
      .map((s) => ({
        ...s,
        leg: "onward",
        key: `onward-${s.segment_key}`,
        label: `${s.origin} → ${s.destination}`,
        flightNo: s.flight_number,
      }));
    const ret = isRoundTrip
      ? (returnSSR?.SeatsBySegment || [])
        .filter(hasRealSeats)
        .map((s) => ({
          ...s,
          leg: "return",
          key: `return-${s.segment_key}`,
          label: `${s.origin} → ${s.destination}`,
          flightNo: s.flight_number,
        }))
      : [];
    return [...onward, ...ret];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onwardSSR, returnSSR, isRoundTrip, isCombinedRoundTrip, returnFlightNumbers]);

  const seatApplicable = seatSegments.length > 0;

  const [activeSeatSegIdx, setActiveSeatSegIdx] = useState(0);
  const activeSeatSeg = seatSegments[activeSeatSegIdx];

  const seatRowsMap = useMemo(() => {
    if (!activeSeatSeg) return {};
    return groupByRow(flattenSeatRows(activeSeatSeg.seat_rows || []));
  }, [activeSeatSeg]);

  const [seatSelections, setSeatSelections] = useState({});
  const activeSeatSegSelections = seatSelections[activeSeatSeg?.key] || {};

  function seatPrice(segKey, seatCode) {
    const seg = seatSegments.find((s) => s.key === segKey);
    if (!seg) return 0;
    const flat = flattenSeatRows(seg.seat_rows || []);
    return flat.find((s) => s.Code === seatCode)?.Price || 0;
  }

  const handleSeatSelect = (seat) => {
    if (!activeSeatSeg || !activePass || !seat) return;
    const segKey = activeSeatSeg.key;
    const seatCode = seat.Code;
    setSeatSelections((prev) => {
      const segData = { ...(prev[segKey] || {}) };
      if (segData[activePass.id]?.Code === seatCode) {
        if (isSeatRequiredFlag) return prev;
        delete segData[activePass.id];
      } else {
        const takenBy = Object.entries(segData).find(([pid, s]) => s?.Code === seatCode && pid !== activePass.id);
        if (takenBy) return prev;
        segData[activePass.id] = {
          ...seat,
          _segOrigin: activeSeatSeg.origin,
          _segDestination: activeSeatSeg.destination,
          _segAirlineCode: seat.AirlineCode || "",
          _segFlightNumber: activeSeatSeg.flightNo || seat.FlightNumber || "",
          _leg: activeSeatSeg.leg,
        };
        if (activePassIdx < allPassengers.length - 1) {
          setTimeout(() => setActivePassIdx((i) => i + 1), 350);
        }
      }
      return { ...prev, [segKey]: segData };
    });
  };

  const seatTotal = useMemo(() => {
    let t = 0;
    Object.entries(seatSelections).forEach(([segKey, passMap]) => {
      Object.values(passMap).forEach((seatObj) => { t += seatPrice(segKey, seatObj?.Code); });
    });
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seatSelections, seatSegments]);

  const missingSeatSelections = useMemo(() => {
    if (!isSeatRequiredFlag) return [];
    const missing = [];
    seatSegments.forEach((seg) => {
      const segMap = seatSelections[seg.key] || {};
      allPassengers.forEach((p) => { if (!segMap[p.id]) missing.push({ seg, pass: p }); });
    });
    return missing;
  }, [isSeatRequiredFlag, seatSegments, allPassengers, seatSelections]);

  const seatSelectionComplete = !isSeatRequiredFlag || !seatApplicable || missingSeatSelections.length === 0;

  const jumpToMissingSeat = () => {
    if (missingSeatSelections.length === 0) return;
    const { seg, pass } = missingSeatSelections[0];
    const segIdx = seatSegments.findIndex((s) => s.key === seg.key);
    const passIdx = allPassengers.findIndex((p) => p.id === pass.id);
    if (segIdx !== -1) setActiveSeatSegIdx(segIdx);
    if (passIdx !== -1) setActivePassIdx(passIdx);
  };

  /* ═════════════════════════ SHARED FARE MATH ═════════════════════════ */
  const totalPassengers = allTravellers.length || 1;
  const onwardPublished = fareQuote?.Results?.Fare?.PublishedFare ?? flight?.Fare?.PublishedFare ?? 0;
  const returnPublished = returnFareQuote?.Results?.Fare?.PublishedFare ?? returnFlight?.Fare?.PublishedFare ?? 0;
  const onwardFareTotal = onwardPublished;
  const returnFareTotal = returnPublished;
  const baseFareTotal = onwardFareTotal + returnFareTotal;

  const onwardSubtotal = onwardFareTotal + extraMealTotalByLeg.onward + extraBaggageTotalByLeg.onward;
  const returnSubtotal = returnFareTotal + extraMealTotalByLeg.return + extraBaggageTotalByLeg.return;
  const grandTotal = baseFareTotal + extraMealTotal + extraBaggageTotal + seatTotal;

  const adultCount = searchMeta?.passengers?.adults ?? 1;
  const childCount = searchMeta?.passengers?.children ?? 0;
  const infantCount = searchMeta?.passengers?.infants ?? 0;

  const travellerLabel = (t, idx) => {
    const name = t.firstName ? `${t.firstName} ${t.lastName}`.trim() : `${t.ptype} ${idx + 1}`;
    return name.length > 12 ? name.slice(0, 12) + "…" : name;
  };

  const getTravellerMealSummary = (trav) => {
    let count = 0, total = 0;
    mealSegments.forEach((seg) => {
      const m = selectedMeals?.[seg.key]?.[trav.id];
      if (m) { count++; total += m.Price; }
    });
    if (count === 0) return mealSelectionApplicable ? "Meal Required" : "Select Meal";
    return `${count} Meal${count > 1 ? "s" : ""} • ₹${total}`;
  };

  const getTravellerBagSummary = (trav) => {
    let weight = 0, total = 0, count = 0;
    baggageSegments.forEach((seg) => {
      const b = selectedBaggage?.[seg.key]?.[trav.id];
      if (b) { weight += b.Weight; total += b.Price; count++; }
    });
    if (count === 0) return "Select Baggage";
    return `${weight}KG • ₹${total}`;
  };

  /* ═════════════════════════ TOAST ═════════════════════════ */
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);
  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2800);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  /* ═════════════════════════ FINAL SAVE + NAVIGATE ═════════════════════════ */
  const finalizeAndGoToPayment = async () => {
    const flightIsLCC = isLCC ?? flight?.IsLCC ?? false;

    const result = await saveSSR({
      traceId,
      onwardResultIndex: resultIndex,
      returnResultIndex: isCombinedRoundTrip
        ? null
        : isRoundTrip
          ? (returnResultIndex || returnFlight?.ResultIndex)
          : null,
      isCombinedRoundTrip,
      allTravellers,
      selectedMeals,
      selectedBaggage,
      seatSelections,
      contact,
      billing,
      gst,
      isMealRequired,
      isSeatRequired: isSeatRequiredFlag,
      requiresPassport,
      requiresPan,
      flightDepartureDate: flight?.Segments?.[0]?.[0]?.Origin?.DepTime || null,
    });

    if (!result.success) {
      showToast("Failed to save your selections. Please try again.");
      return;
    }

    navigate("/flight-payment", {
      state: {
        ...location.state,
        selectedMeals,
        selectedBaggage,
        seatSelections,
        isLCC: flightIsLCC,
        skipBooking: false,
      },
    });
  };

  /* ── ssr phase "Continue" button ── */
  const handleSSRContinue = async () => {
    if (!mealSelectionComplete) {
      showToast("Please select a meal for every traveller before continuing.");
      jumpToMissingMeal();
      return;
    }
    if (seatApplicable) {
      setPhase("seats");
    } else {
      await finalizeAndGoToPayment();
    }
  };

  /* ── ssr phase "Skip" button (only visible when meal not required) ── */
  const handleSSRSkip = () => {
    if (seatApplicable) setPhase("seats");
    else finalizeAndGoToPayment();
  };

  /* ── seats phase "Continue" button ── */
  const handleSeatsContinue = async () => {
    if (!seatSelectionComplete) {
      showToast("Please select a seat for every traveller before continuing.");
      jumpToMissingSeat();
      return;
    }
    await finalizeAndGoToPayment();
  };

  /* ── seats phase "Skip" button (only visible when seat not required) ── */
  const handleSeatsSkip = () => finalizeAndGoToPayment();

  // ── FIX: explicit error state so a failed SSR fetch doesn't silently
  //    look like "nothing to show" — surfaces the real cause with a retry.
  //    NOTE: `swalShownForRef` (useRef) aur uska `useEffect` yahan, is
  //    "if (loading) return ..." se PEHLE hi define kiye jaate hain — kyunki
  //    hooks har render me SAME ORDER + COUNT me chalne chahiye. Pehle yeh
  //    ek early-return ke baad the, isliye jab error-branch return hoti thi
  //    to yeh hooks skip ho jaate the aur agle render me count mismatch se
  //    "Rendered fewer hooks than expected" crash aata tha. ──────────────
  const swalShownForRef = useRef(null); // last error string jiske liye Swal dikha chuke hain

  useEffect(() => {
    if (!loading && error && !onwardSSR) {
      if (swalShownForRef.current === error) return; // isi error ke liye already dikha chuke
      swalShownForRef.current = error;

      Swal.fire({
        icon: "error",
        title: "Failed to Load Options",
        html: `
          <div style="font-size:14px;color:#374151;line-height:1.8;text-align:left">
            <div>
              <span style="color:#6b7280;font-size:12px">Reason</span><br/>
              <strong>${error || "Something went wrong while loading meal, baggage & seat options."}</strong>
            </div>
          </div>
        `,
        confirmButtonColor: "#16a34a",
        confirmButtonText: "Retry",
        showCancelButton: true,
        cancelButtonText: "Back to Flights",
        cancelButtonColor: "#6b7280",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          swalShownForRef.current = null; // reset taaki agla error/retry-fail bhi Swal dikha sake
          fetchSSR({
            traceId,
            onwardResultIndex: resultIndex,
            returnResultIndex: isCombinedRoundTrip
              ? null
              : (returnResultIndex || returnFlight?.ResultIndex || null),
            isCombinedRoundTrip,
          });
        } else {
          navigate("/flights", { replace: true });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, onwardSSR]);

  // ── FIX: SSR fetch fail hone par ab inline red-text screen ki jagah
  //    SweetAlert2 popup dikhta hai — bilkul FlightPaymentPage ke booking-
  //    failure Swal jaisa consistent look. Popup me "Retry" aur "Back to
  //    Flights" dono options hain. `swalShownForRef` guard rakha hai taaki
  //    same error ke liye Swal baar-baar (re-render pe) na khule.
  //    Yeh early-return ab UPAR wale hooks ke BAAD hai — koi hook is line
  //    ke neeche define nahi hota, isliye ab yeh return safe hai. ────────
  if (!loading && error && !onwardSSR) {
    return (
      <div style={{ fontFamily: "Inter,sans-serif", minHeight: "100vh", background: "#f0f4fa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#dc2626" }}>Failed to load meal, baggage &amp; seat options</div>
        <div style={{ fontSize: 13, color: "#6b7280", maxWidth: 380 }}>{error}</div>
        <button
          onClick={() =>
            fetchSSR({
              traceId,
              onwardResultIndex: resultIndex,
              returnResultIndex: isCombinedRoundTrip
                ? null
                : (returnResultIndex || returnFlight?.ResultIndex || null),
              isCombinedRoundTrip,
            })
          }
          style={{
            marginTop: 6, padding: "10px 22px", borderRadius: 10, background: "#16a34a",
            color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "Inter,sans-serif", minHeight: "100vh", background: "#f0f4fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <div style={{ marginTop: 12, color: "#6b7280", fontSize: 14 }}>Loading add-ons...</div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  /* ═════════════════════════ RENDER ═════════════════════════ */
  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", padding: "24px 0 80px" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .ssr-wrap{width:100%;max-width:1200px;margin:0 auto;padding:0 16px; margin-top: 60px;}
        .ssr-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:20px;align-items:start;}
        @media(max-width:1024px){.ssr-grid{grid-template-columns:1fr;}}
        .ssr-grid > * { min-width: 0; }
        .ssr-grid > *:last-child{width:100%;max-width:300px;}
        @media(max-width:860px){.ssr-grid > *:last-child{max-width:none;}}
        .fare-summary-wrapper{position:sticky;top:24px;}
        @media(max-width:1024px){.fare-summary-wrapper{position:static;width:100%;}}
        .ssr-header{display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #f3f4f6;gap:12px;flex-wrap:wrap;}
        @media(max-width:768px){.ssr-header{flex-direction:column;align-items:flex-start;padding:0 16px;}}
        .card{background:#fff;border-radius:14px;box-shadow:0 1px 10px rgba(0,0,0,0.07);overflow:hidden;min-width:0;}
        .card+.card{margin-top:16px;}
        .tab-btn{background:none;border:none;cursor:pointer;padding:13px 0;font-family:inherit;font-size:14px;transition:color 0.15s;white-space:nowrap;}
        .tab-active{border-bottom:2px solid #16a34a;color:#16a34a;font-weight:600;}
        .tab-inactive{border-bottom:2px solid transparent;color:#6b7280;font-weight:400;}
        .seg-tabs{display:flex;gap:8px;padding:12px 20px;border-bottom:1px solid #f3f4f6;overflow-x:auto;scrollbar-width:none;}
        .seg-tabs::-webkit-scrollbar{display:none;}
        .seg-btn{border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;padding:7px 16px;color:#374151;transition:all 0.15s;display:flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0;position:relative;}
        .seg-btn.active{border-color:#16a34a;background:#f0fdf4;color:#16a34a;font-weight:600;}
        .seg-btn.incomplete::after{content:'';position:absolute;top:-3px;right:-3px;width:8px;height:8px;border-radius:50%;background:#dc2626;border:1.5px solid #fff;}
        .seg-leg-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:1px 6px;border-radius:999px;}
        .seg-leg-tag.onward{background:#eff6ff;color:#1d4ed8;}
        .seg-leg-tag.return{background:#fdf4ff;color:#a21caf;}
        .meal-card{border:1.5px solid #e5e7eb;border-radius:10px;padding:14px 16px;cursor:pointer;transition:all 0.15s;display:flex;justify-content:space-between;align-items:center;background:#fff;min-width:0;gap:10px;}
        .meal-card:hover{border-color:#16a34a;background:#f9fffe;}
        .meal-card.selected{border-color:#16a34a;background:#f0fdf4;}
        .bag-card{border:1.5px solid #e5e7eb;border-radius:10px;padding:14px 16px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:12px;background:#fff;min-width:0;}
        .bag-card:hover{border-color:#16a34a;background:#f9fffe;}
        .bag-card.selected{border-color:#16a34a;background:#f0fdf4;}
        .add-btn-sm{border:1.5px solid #16a34a;border-radius:8px;background:#fff;color:#16a34a;font-size:13px;font-weight:600;padding:6px 20px;cursor:pointer;font-family:inherit;transition:background 0.15s;white-space:nowrap;flex-shrink:0;}
        .add-btn-sm:hover{background:#f0fdf4;}
        .add-btn-sm.added{background:#16a34a;color:#fff;border-color:#16a34a;}
        .trav-chip{border:1.5px solid #e5e7eb;border-radius:999px;background:#fff;cursor:pointer;font-family:inherit;padding:8px 14px;text-align:left;transition:all .15s;white-space:nowrap;flex-shrink:0;min-width:max-content;position:relative;}
        .trav-chip.active{border-color:#16a34a;background:#f0fdf4;}
        .trav-chip.incomplete::after{content:'';position:absolute;top:-3px;right:-3px;width:8px;height:8px;border-radius:50%;background:#dc2626;border:1.5px solid #fff;}
        .fare-row{display:flex;justify-content:space-between;align-items:center;padding:10px 20px;font-size:14px;color:#374151;gap:8px;}
        .fare-row > span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .fare-row > span:last-child{flex-shrink:0;white-space:nowrap;}
        .fare-row+.fare-row{border-top:1px solid #f3f4f6;}
        .skip-btn{background:none;border:none;cursor:pointer;color:#16a34a;font-size:13px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;white-space:nowrap;flex-shrink:0;}
        .back-btn{background:none;border:none;cursor:pointer;color:#6b7280;font-size:13px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;white-space:nowrap;flex-shrink:0;}
        .truncate-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
        .clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .continue-btn{width:100%;padding:13px 0;border-radius:10;color:#fff;font-size:15px;font-weight:700;font-family:inherit;border:none;transition:opacity 0.15s;}
        @media(max-width:768px){
          .meals-grid{grid-template-columns:1fr!important;}
          .bag-grid{grid-template-columns:1fr!important;}
          .meal-card,.bag-card{padding:12px;}
          .add-btn-sm{padding:6px 14px;font-size:12px;}
          .fare-row{padding:10px 16px;font-size:13px;}
        }
        @media(max-width:480px){
          .ssr-wrap{padding:0 10px;}
          .card{border-radius:12px;}
          .ssr-header{padding:0 12px;}
          .seg-tabs{padding:12px;}
          .fare-row{padding:10px 12px;}
          .meal-card,.bag-card{padding:10px;}
        }
      `}</style>

      <div className="ssr-wrap">
        {/* breadcrumb */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["Flight", "Travellers", "Meals & Bags", "Seats", "Payment"].map((s, i) => {
            const currentIdx = phase === "ssr" ? 2 : 3;
            return (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i > 0 && <span style={{ color: "#CBD5E0", fontSize: 10 }}>›</span>}
                <span style={{ fontSize: 12.5, fontWeight: i === currentIdx ? 700 : 400, color: i === currentIdx ? "#16a34a" : i < currentIdx ? "#94A3B8" : "#CBD5E0" }}>{s}</span>
              </span>
            );
          })}
        </div>

        <div className="ssr-grid">
          {/* ══════════ LEFT PANEL ══════════ */}
          <div>
            <div className="card">
              {phase === "ssr" ? (
                <>
                  {/* ── SSR HEADER ── */}
                  <div className="ssr-header">
                    <div style={{ display: "flex", gap: 24, minWidth: 0 }}>
                      <button className={`tab-btn ${activeTab === "meals" ? "tab-active" : "tab-inactive"}`} onClick={() => setActiveTab("meals")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MealIcon /> Meals
                        {mealSelectionApplicable && !mealSelectionComplete && <span style={{ color: "#dc2626", fontSize: 11, fontWeight: 700 }}>*</span>}
                      </button>
                      <button className={`tab-btn ${activeTab === "baggage" ? "tab-active" : "tab-inactive"}`} onClick={() => setActiveTab("baggage")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <BaggageIcon /> Baggage
                      </button>
                    </div>
                    {!isMealRequired && (
                      <button className="skip-btn" onClick={handleSSRSkip}>
                        Skip to {seatApplicable ? "Seat Selection" : "Payment"} <ChevronRight />
                      </button>
                    )}
                  </div>

                  {mealSelectionApplicable && (
                    <div style={{ margin: "12px 20px 0", padding: "9px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 12.5, color: "#1e40af", fontWeight: 500 }}>
                      🍽️ This airline requires a meal selection for every traveller before you can continue.
                    </div>
                  )}

                  {/* Segment tabs */}
                  <div className="seg-tabs">
                    {(activeTab === "meals" ? mealSegments : baggageSegments).map((seg, idx) => {
                      const segIncomplete = activeTab === "meals" && mealSelectionApplicable &&
                        allTravellers.some((t) => !selectedMeals?.[seg.key]?.[t.id]) &&
                        (seg.meals || []).some((m) => m.Code !== "NoMeal");
                      return (
                        <button key={seg.key} className={`seg-btn ${activeSegmentIdx === idx ? "active" : ""} ${segIncomplete ? "incomplete" : ""}`} onClick={() => setActiveSegmentIdx(idx)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={activeSegmentIdx === idx ? "#16a34a" : "#9ca3af"} stroke="none">
                            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                          </svg>
                          {isRoundTrip && <span className={`seg-leg-tag ${seg.leg}`}>{seg.leg === "onward" ? "Onward" : "Return"}</span>}
                          {seg.origin} - {seg.destination}
                        </button>
                      );
                    })}
                  </div>

                  {/* MEALS TAB */}
                  {activeTab === "meals" && (
                    <div style={{ padding: "16px 20px" }}>
                      {availableMeals.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "24px 0" }}>No meals available for this segment.</div>
                      ) : (
                        <div className="meals-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          {availableMeals.map((meal) => {
                            const segKey = currentMealSeg?.key;
                            const isSelected = getSelectedMeal(segKey, currentTraveller?.id)?.Code === meal.Code;
                            return (
                              <div key={meal.Code} className={`meal-card ${isSelected ? "selected" : ""}`} onClick={() => handleSelectMeal(meal)}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                                  <span style={{ fontSize: 22, flexShrink: 0 }}>{getMealEmoji(meal.Code)}</span>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div className="clamp-2" style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.3 }} title={meal.AirlineDescription || meal.Code}>
                                      {meal.AirlineDescription || meal.Code}
                                    </div>
                                    <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 700, marginTop: 2 }}>₹{meal.Price}</div>
                                  </div>
                                </div>
                                <button className={`add-btn-sm ${isSelected ? "added" : ""}`} onClick={(e) => { e.stopPropagation(); handleSelectMeal(meal); }}>
                                  {isSelected ? (<span style={{ display: "flex", alignItems: "center", gap: 4 }}><CheckIcon /> Added</span>) : "Add"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* BAGGAGE TAB */}
                  {activeTab === "baggage" && (
                    <div style={{ padding: "16px 20px" }}>
                      {availableBaggage.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "24px 0" }}>No extra baggage available for this segment.</div>
                      ) : (
                        <div className="bag-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          {availableBaggage.map((bag) => {
                            const segKey = currentBagSeg?.key;
                            const isSelected = getSelectedBag(segKey, currentTraveller?.id)?.Code === bag.Code;
                            return (
                              <div key={bag.Code} className={`bag-card ${isSelected ? "selected" : ""}`} onClick={() => handleSelectBaggage(bag)}>
                                <div
                                  style={{
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 52,
                                  }}
                                >
                                  {getClosestBagIcon(bag.Weight)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="truncate-text" style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Additional {bag.Weight} KG</div>
                                  {bag.Text && <div className="clamp-2" style={{ fontSize: 11, color: "#6b7280", marginTop: 2, lineHeight: 1.4 }} title={bag.Text}>{bag.Text}</div>}
                                  <div style={{ fontSize: 14, color: "#16a34a", fontWeight: 700, marginTop: 3 }}>₹{bag.Price.toLocaleString("en-IN")}</div>
                                </div>
                                <button className={`add-btn-sm ${isSelected ? "added" : ""}`} onClick={(e) => { e.stopPropagation(); handleSelectBaggage(bag); }}>
                                  {isSelected ? (<span style={{ display: "flex", alignItems: "center", gap: 4 }}><CheckIcon /> Added</span>) : "Add"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Traveller bottom bar */}
                  <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 20px", background: "#fafafa" }}>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                      {allTravellers.map((trav, idx) => {
                        const travIncomplete = activeTab === "meals" && mealSelectionApplicable && !selectedMeals?.[currentMealSeg?.key]?.[trav.id] && availableMeals.length > 0;
                        return (
                          <button key={trav.id} className={`trav-chip ${activeTravellerIdx === idx ? "active" : ""} ${travIncomplete ? "incomplete" : ""}`} onClick={() => setActiveTravellerIdx(idx)}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: activeTravellerIdx === idx ? "#16a34a" : "#111827" }}>{travellerLabel(trav, idx)}</div>
                            <div style={{ fontSize: 11, color: travIncomplete ? "#dc2626" : "#6b7280", marginTop: 1, fontWeight: travIncomplete ? 600 : 400 }}>
                              {activeTab === "meals" ? getTravellerMealSummary(trav) : getTravellerBagSummary(trav)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* ── SEATS HEADER ── */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #F1F5F9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button className="back-btn" onClick={() => setPhase("ssr")}>
                        <ChevronLeft /> Back
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ color: "#16a34a" }}><IconSeat /></div>
                        <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Choose Your Seats</span>
                        {isSeatRequiredFlag && !seatSelectionComplete && <span style={{ color: "#dc2626", fontSize: 12, fontWeight: 700 }}>*</span>}
                      </div>
                    </div>
                    {!isSeatRequiredFlag && (
                      <button className="skip-btn" onClick={handleSeatsSkip}>Skip to Payment <ChevronRight /></button>
                    )}
                  </div>

                  {isSeatRequiredFlag && (
                    <div style={{ margin: "12px 20px 0", padding: "9px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 12.5, color: "#1e40af", fontWeight: 500 }}>
                      💺 This airline requires a seat selection for every traveller before you can continue.
                    </div>
                  )}

                  {!seatApplicable ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#94A3B8", fontSize: 13.5 }}>
                      Seat map not available for this flight.
                    </div>
                  ) : (
                    <>
                      <div className="seg-tabs">
                        {seatSegments.map((seg, idx) => {
                          const segIncomplete = isSeatRequiredFlag && allPassengers.some((p) => !(seatSelections[seg.key] || {})[p.id]);
                          return (
                            <button key={seg.key} className={`seg-btn ${activeSeatSegIdx === idx ? "active" : ""} ${segIncomplete ? "incomplete" : ""}`} onClick={() => setActiveSeatSegIdx(idx)}>
                              <div style={{ color: activeSeatSegIdx === idx ? "#16a34a" : "#94A3B8" }}><IconFlight /></div>
                              {isRoundTrip && <span className={`seg-leg-tag ${seg.leg}`}>{seg.leg === "onward" ? "Onward" : "Return"}</span>}
                              {seg.label} <span style={{ fontSize: 11, color: "#94A3B8" }}>#{seg.flightNo}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                        <div style={{ width: 200, flexShrink: 0, borderRight: "1px solid #F1F5F9", padding: "18px 16px" }}>
                          <p style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Passengers</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                            {allPassengers.map((p, idx) => {
                              const seatCode = (seatSelections[activeSeatSeg?.key] || {})[p.id]?.Code;
                              const isActive = activePassIdx === idx;
                              return (
                                <div key={p.id} onClick={() => setActivePassIdx(idx)} style={{
                                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 10, cursor: "pointer",
                                  border: `1.5px solid ${isActive ? "#4ADE80" : "#F1F5F9"}`, background: isActive ? "#F0FDF4" : "#FAFAFA", transition: "all 0.15s",
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: isActive ? "#16a34a" : "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: isActive ? "#fff" : "#64748B" }}>
                                      {(p.firstName || p.ptype)?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>{p.firstName ? `${p.firstName} ${p.lastName || ""}`.trim() : `${p.ptype} ${idx + 1}`}</div>
                                      {seatCode ? (
                                        <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>Seat {seatCode}</div>
                                      ) : isSeatRequiredFlag ? (
                                        <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>Seat required</div>
                                      ) : null}
                                    </div>
                                  </div>
                                  {seatCode && <span style={{ fontSize: 11.5, fontWeight: 700, color: "#111827" }}>₹{seatPrice(activeSeatSeg?.key, seatCode).toLocaleString("en-IN")}</span>}
                                </div>
                              );
                            })}
                          </div>
                          <p style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Seat Types</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {LEGEND.map((l) => (
                              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <div style={{ width: 18, height: 16, borderRadius: "4px 4px 2px 2px", background: l.bg, border: `1.5px solid ${l.border}`, flexShrink: 0 }} />
                                <span style={{ fontSize: 11.5, color: "#475569" }}>{l.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "24px 12px", background: "#F8FAFC", overflowX: "auto" }}>
                          {activeSeatSeg && Object.keys(seatRowsMap).length > 0 ? (
                            <CabinMap seatRows={seatRowsMap} selections={activeSeatSegSelections} activePassengerId={activePass?.id} onSelect={handleSeatSelect} />
                          ) : (
                            <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 13, paddingTop: 40 }}>No seat map available for this segment.</div>
                          )}
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid #F1F5F9", padding: "12px 20px", background: "#FAFAFA" }}>
                        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                          {allPassengers.map((p, idx) => {
                            const seatCode = (seatSelections[activeSeatSeg?.key] || {})[p.id]?.Code;
                            const isActive = activePassIdx === idx;
                            const name = p.firstName ? `${p.firstName} ${p.lastName || ""}`.trim() : `${p.ptype} ${idx + 1}`;
                            const incomplete = isSeatRequiredFlag && !seatCode;
                            return (
                              <button key={p.id} className={`trav-chip ${isActive ? "active" : ""} ${incomplete ? "incomplete" : ""}`} onClick={() => setActivePassIdx(idx)}>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: isActive ? "#16a34a" : "#111827" }}>{name.length > 14 ? name.slice(0, 14) + "…" : name}</div>
                                <div style={{ fontSize: 11, color: incomplete ? "#dc2626" : "#6B7280", marginTop: 1, fontWeight: incomplete ? 600 : 400 }}>
                                  {seatCode ? `Seat ${seatCode} · ₹${seatPrice(activeSeatSeg?.key, seatCode)}` : incomplete ? "Seat Required" : "Pick a seat"}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ══════════ RIGHT: FARE SUMMARY ══════════ */}
          <div className="fare-summary-wrapper">
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 12px", borderBottom: "1px solid #f3f4f6", gap: 8 }}>
                <span className="truncate-text" style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Fare Summary</span>
                <span style={{ fontSize: 13, color: "#6b7280", flexShrink: 0 }}>{totalPassengers} Traveller{totalPassengers !== 1 ? "s" : ""}</span>
              </div>

              <div style={{ padding: "8px 0" }}>
                <div className="fare-row">
                  <span style={{ color: "#6b7280" }}>Fare Type</span>
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>{(fareQuote?.Results?.IsRefundable ?? flight?.IsRefundable) ? "Refundable" : "Partial Refundable"}</span>
                </div>

                {/* ✅ CHANGE: combined international round-trip me alag Onward/Return
      split nahi — ek hi combined "Flight Fare" section, jisme dono legs
      ka total (onwardFareTotal, kyunki combined case me returnFareTotal
      0 hota hai) aur dono legs ke meals/baggage jode hue (extraMealTotal /
      extraBaggageTotal) dikhte hain. */}
                <div style={{ padding: "10px 20px 4px", fontSize: 12, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {isRoundTrip && !isCombinedRoundTrip ? "Onward Flight" : "Flight Fare"}
                </div>
                {/* <div className="fare-row"><span>{isRoundTrip && !isCombinedRoundTrip ? "Onward Fare" : "Base Fare"}</span><span style={{ fontWeight: 600 }}>₹{onwardFareTotal.toLocaleString("en-IN")}</span></div> */}
                <FareBreakdownDetail fare={fareQuote?.Results?.Fare} />
                {(isCombinedRoundTrip ? extraMealTotal : extraMealTotalByLeg.onward) > 0 && (
                  <div className="fare-row"><span style={{ color: "#16a34a" }}>Meals Added</span><span style={{ fontWeight: 600, color: "#16a34a" }}>+₹{(isCombinedRoundTrip ? extraMealTotal : extraMealTotalByLeg.onward).toLocaleString("en-IN")}</span></div>
                )}
                {(isCombinedRoundTrip ? extraBaggageTotal : extraBaggageTotalByLeg.onward) > 0 && (
                  <div className="fare-row"><span style={{ color: "#16a34a" }}>Extra Baggage</span><span style={{ fontWeight: 600, color: "#16a34a" }}>+₹{(isCombinedRoundTrip ? extraBaggageTotal : extraBaggageTotalByLeg.onward).toLocaleString("en-IN")}</span></div>
                )}
                <div className="fare-row" style={{ borderTop: "1px solid #e5e7eb" }}>
                  <span style={{ fontWeight: 700, color: "#111827" }}>{isRoundTrip && !isCombinedRoundTrip ? "Onward Subtotal" : "Subtotal"}</span>
                  <span style={{ fontWeight: 700, color: "#111827" }}>
                    ₹{(isCombinedRoundTrip ? onwardFareTotal + extraMealTotal + extraBaggageTotal : onwardSubtotal).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* ✅ CHANGE: "Return Flight" ka alag breakdown block ab sirf normal
      (non-combined) round-trip ke liye — combined international RT me
      return leg ka separate Adult/Child/Infant + Return Subtotal nahi
      dikhega, upar wale combined "Flight Fare" section me hi merge hai. */}
                {isRoundTrip && !isCombinedRoundTrip && (
                  <>
                    <div style={{ padding: "12px 20px 4px", fontSize: 12, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: 0.5, borderTop: "1px dashed #e5e7eb", marginTop: 4 }}>Return Flight</div>
                    <div className="fare-row"><span>Return Fare</span><span style={{ fontWeight: 600 }}>₹{returnFareTotal.toLocaleString("en-IN")}</span></div>
                    <FareBreakdownDetail fare={returnFareQuote?.Results?.Fare} />
                    {extraMealTotalByLeg.return > 0 && <div className="fare-row"><span style={{ color: "#16a34a" }}>Meals Added</span><span style={{ fontWeight: 600, color: "#16a34a" }}>+₹{extraMealTotalByLeg.return.toLocaleString("en-IN")}</span></div>}
                    {extraBaggageTotalByLeg.return > 0 && <div className="fare-row"><span style={{ color: "#16a34a" }}>Extra Baggage</span><span style={{ fontWeight: 600, color: "#16a34a" }}>+₹{extraBaggageTotalByLeg.return.toLocaleString("en-IN")}</span></div>}
                    <div className="fare-row" style={{ borderTop: "1px solid #e5e7eb" }}>
                      <span style={{ fontWeight: 700, color: "#111827" }}>Return Subtotal</span>
                      <span style={{ fontWeight: 700, color: "#111827" }}>₹{returnSubtotal.toLocaleString("en-IN")}</span>
                    </div>
                  </>
                )}

                {seatTotal > 0 && (
                  <div className="fare-row"><span style={{ color: "#16a34a" }}>Seat Charges</span><span style={{ fontWeight: 700, color: "#16a34a" }}>+₹{seatTotal.toLocaleString("en-IN")}</span></div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "#f9fafb", borderTop: "2px solid #e5e7eb", gap: 8 }}>
                <span className="truncate-text" style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Net Amount Payable</span>
                <span style={{ fontWeight: 800, fontSize: 17, color: "#111827", flexShrink: 0, whiteSpace: "nowrap" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>

              <div style={{ padding: "16px 20px" }}>
                {phase === "ssr" ? (
                  <button
                    onClick={handleSSRContinue}
                    disabled={!mealSelectionComplete || saving}
                    className="continue-btn"
                    style={{
                      background: mealSelectionComplete && !saving ? "linear-gradient(135deg,#16a34a,#15803d)" : "#d1d5db",
                      cursor: mealSelectionComplete && !saving ? "pointer" : "not-allowed",
                      boxShadow: mealSelectionComplete && !saving ? "0 2px 12px rgba(22,163,74,0.3)" : "none",
                    }}
                  >
                    {saving ? "Saving..." : mealSelectionComplete ? (seatApplicable ? "Continue to Seat Selection" : "Proceed") : "Select Meal to Continue"}
                  </button>
                ) : (
                  <button
                    onClick={handleSeatsContinue}
                    disabled={!seatSelectionComplete || saving}
                    className="continue-btn"
                    style={{
                      background: seatSelectionComplete && !saving ? "linear-gradient(135deg,#16a34a,#15803d)" : "#d1d5db",
                      cursor: seatSelectionComplete && !saving ? "pointer" : "not-allowed",
                      boxShadow: seatSelectionComplete && !saving ? "0 2px 12px rgba(22,163,74,0.28)" : "none",
                    }}
                  >
                    {saving ? "Saving..." : seatSelectionComplete ? "Continue to Payment" : "Select Seat to Continue"}
                  </button>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Secured &amp; Encrypted Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toastMsg} show={toastVisible} />
    </div>
  );
}