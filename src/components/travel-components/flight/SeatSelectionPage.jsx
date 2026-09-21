// src/components/flights/SeatSelectionPage.jsx
import { useSSR } from "components/travel-hooks/flight/useSSR";
import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────────────────────
   TINY ICON COMPONENTS
───────────────────────────────────────────────────────────────────────────── */
const IconSeat = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 20v-4a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v4" />
    <circle cx="12" cy="7" r="3" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconChevron = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconFlight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────────
   TOAST (no external lib)
───────────────────────────────────────────────────────────────────────────── */
function Toast({ message, show }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--fl-toast-bg)",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 10,
        fontSize: 13.5,
        fontWeight: 600,
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        maxWidth: "90vw",
        textAlign: "center",
        animation: "toast-in 0.25s ease",
      }}
    >
      <span style={{ fontSize: 16 }}>⚠️</span>
      {message}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
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

const COL_ORDER = ["A", "B", "C", "D", "E", "F"];

/* ─────────────────────────────────────────────────────────────────────────────
   SEAT COLOUR LOGIC
───────────────────────────────────────────────────────────────────────────── */
function seatStyle(seat, state) {
  if (state === "blocked")
    return {
      bg: "var(--fl-surface-muted)",
      border: "var(--fl-border-strong)",
      text: "var(--fl-text-faint)",
      cursor: "not-allowed",
    };
  if (state === "selected")
    return {
      bg: "var(--fl-brand)",
      border: "var(--fl-brand-strong-line)",
      text: "#fff",
      cursor: "pointer",
    };
  if (state === "other")
    return {
      bg: "var(--fl-info-bg-strong)",
      border: "var(--fl-info-border)",
      text: "var(--fl-info-text)",
      cursor: "not-allowed",
    };

  const p = seat.Price;
  if (p === 0)
    return {
      bg: "var(--fl-surface-subtle)",
      border: "var(--fl-border-strong)",
      text: "var(--fl-text-muted)",
      cursor: "pointer",
    };
  if (isExitRow(seat))
    return {
      bg: "var(--fl-warn-bg)",
      border: "#F59E0B",
      text: "var(--fl-warn-text)",
      cursor: "pointer",
    };
  if (p >= 1500)
    return {
      bg: "var(--fl-purple-bg)",
      border: "var(--fl-purple-border)",
      text: "var(--fl-purple-text)",
      cursor: "pointer",
    };
  if (p >= 800)
    return {
      bg: "var(--fl-info-bg-strong)",
      border: "var(--fl-info-border)",
      text: "var(--fl-info-text)",
      cursor: "pointer",
    };
  if (p >= 400)
    return {
      bg: "var(--fl-success-bg-strong)",
      border: "var(--fl-success-border)",
      text: "var(--fl-brand-strong-text)",
      cursor: "pointer",
    };
  return {
    bg: "var(--fl-surface-subtle)",
    border: "var(--fl-border-strong)",
    text: "var(--fl-text-muted)",
    cursor: "pointer",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   SINGLE SEAT CELL
───────────────────────────────────────────────────────────────────────────── */
function SeatCell({ seat, state, onSelect }) {
  const [hov, setHov] = useState(false);
  const s = seatStyle(seat, state);
  const isBlocked = state === "blocked" || state === "other";
  const isSelected = state === "selected";

  const bg =
    hov && !isBlocked
      ? isSelected
        ? "var(--fl-brand-hover)"
        : "var(--fl-success-bg-strong)"
      : s.bg;

  return (
    <div
      title={
        isBlocked
          ? seat.AvailablityType === 3
            ? "Occupied"
            : state === "other"
            ? "Selected by another passenger"
            : "Unavailable"
          : `${seat.Code}${seat.Price > 0 ? ` · ₹${seat.Price}` : " · Free"}${
              isExitRow(seat) ? " · Exit Row" : ""
            }`
      }
      onClick={() => !isBlocked && onSelect(seat)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30,
        height: 28,
        borderRadius: "5px 5px 2px 2px",
        border: `1.5px solid ${s.border}`,
        background: bg,
        cursor: s.cursor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.12s",
        transform: isSelected ? "scale(1.12)" : "scale(1)",
        flexShrink: 0,
        position: "relative",
        boxShadow: isSelected ? "0 2px 8px rgba(22,163,74,0.35)" : "none",
      }}
    >
      {isBlocked && !isSelected ? (
        <div
          style={{
            width: 12,
            height: 12,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "1.5px",
              background: "#9AA3AE",
              transform: "rotate(45deg)",
              borderRadius: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "1.5px",
              background: "#9AA3AE",
              transform: "rotate(-45deg)",
              borderRadius: 1,
            }}
          />
        </div>
      ) : isSelected ? (
        <div style={{ color: "#fff" }}>
          <IconCheck />
        </div>
      ) : (
        <span
          style={{
            fontSize: "0.52rem",
            fontWeight: 700,
            color: s.text,
            lineHeight: 1,
            letterSpacing: "-0.2px",
          }}
        >
          {isExitRow(seat) ? "EXIT" : seat.Price === 0 ? "FREE" : ""}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CABIN MAP
───────────────────────────────────────────────────────────────────────────── */
function CabinMap({
  seatRows,
  selections,
  activePassengerId,
  allPassengerIds,
  onSelect,
}) {
  // ── selections: { [passengerId]: seatObj | undefined } — poora object, sirf code nahi ──
  const selectedByActive = selections[activePassengerId]?.Code;
  const allSelected = new Set(
    Object.values(selections)
      .map((s) => s?.Code)
      .filter(Boolean),
  );

  const sortedRowNos = Object.keys(seatRows)
    .map(Number)
    .sort((a, b) => a - b);

  const exitRowSet = useMemo(() => {
    const s = new Set();
    for (const [rNo, seats] of Object.entries(seatRows)) {
      if (seats.some(isExitRow)) s.add(Number(rNo));
    }
    return s;
  }, [seatRows]);

  const SW = 30,
    GAP = 4,
    AISLE = 22;
  const LEFT_COLS = ["A", "B", "C"],
    RIGHT_COLS = ["D", "E", "F"];
  const SIDE_W = SW * 3 + GAP * 2;
  const TOTAL_W = SIDE_W * 2 + AISLE + 28;
  const PLANE_W = TOTAL_W + 32;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      <img
        src="/aerofront.png"
        alt="Aircraft front"
        style={{
          display: "block",
          width: PLANE_W,
          height: "auto",
          marginBottom: -2,
          objectFit: "contain",
        }}
      />

      <div
        style={{
          border: "1.5px solid var(--fl-border-strong)",
          borderTop: "none",
          borderBottom: "none",
          borderRadius: 0,
          background:
            "linear-gradient(to bottom, var(--fl-surface-subtle), var(--fl-surface-muted))",
          padding: "8px 16px 28px",
          width: PLANE_W,
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {["left", "right"].map((side) => (
          <div
            key={side}
            style={{
              position: "absolute",
              [side === "left" ? "left" : "right"]: -16,
              top: "35%",
              width: 16,
              height: 56,
              background: `linear-gradient(to ${
                side === "left" ? "right" : "left"
              }, transparent, var(--fl-border-strong))`,
              borderRadius: side === "left" ? "8px 0 0 8px" : "0 8px 8px 0",
            }}
          />
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 6,
            paddingLeft: 14,
          }}
        >
          {LEFT_COLS.map((c, i) => (
            <div
              key={c}
              style={{
                width: SW,
                marginRight: i < 2 ? GAP : 0,
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  color: "var(--fl-text-faint)",
                  letterSpacing: 1,
                }}
              >
                {c}
              </span>
            </div>
          ))}
          <div style={{ width: AISLE + 28 }} />
          {RIGHT_COLS.map((c, i) => (
            <div
              key={c}
              style={{
                width: SW,
                marginLeft: i > 0 ? GAP : 0,
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  color: "var(--fl-text-faint)",
                  letterSpacing: 1,
                }}
              >
                {c}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            maxHeight: 420,
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "var(--fl-border-strong) transparent",
          }}
        >
          {sortedRowNos.map((rowNo) => {
            const rowSeats = seatRows[rowNo];
            const isExit = exitRowSet.has(rowNo);
            const byCol = {};
            for (const s of rowSeats) byCol[s.SeatNo] = s;
            const prevRowNo = sortedRowNos[sortedRowNos.indexOf(rowNo) - 1];
            const showExitMarker =
              isExit && (!prevRowNo || !exitRowSet.has(prevRowNo));

            return (
              <div key={rowNo}>
                {showExitMarker && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      margin: "6px 0 4px",
                      padding: "0 2px",
                    }}
                  >
                    <div
                      style={{ flex: 1, height: 1, background: "#FCD34D" }}
                    />
                    <span
                      style={{
                        fontSize: "0.48rem",
                        fontWeight: 900,
                        color: "var(--fl-warn-text)",
                        letterSpacing: 1.5,
                      }}
                    >
                      EXIT ROW
                    </span>
                    <div
                      style={{ flex: 1, height: 1, background: "#FCD34D" }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: GAP,
                  }}
                >
                  {LEFT_COLS.map((col, ci) => {
                    const seat = byCol[col];
                    if (!seat)
                      return (
                        <div
                          key={col}
                          style={{ width: SW, marginRight: ci < 2 ? GAP : 0 }}
                        />
                      );
                    const seatCode = seat.Code;
                    const isThisSelected = selectedByActive === seatCode;
                    const isOtherSelected =
                      !isThisSelected && allSelected.has(seatCode);
                    const blocked = !isAvailable(seat);
                    const state = blocked
                      ? "blocked"
                      : isThisSelected
                      ? "selected"
                      : isOtherSelected
                      ? "other"
                      : "available";
                    return (
                      <div key={col} style={{ marginRight: ci < 2 ? GAP : 0 }}>
                        <SeatCell
                          seat={seat}
                          state={state}
                          onSelect={(s) => onSelect(s)}
                        />
                      </div>
                    );
                  })}

                  <div
                    style={{
                      width: AISLE + 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.55rem",
                        color: "var(--fl-text-faint)",
                        fontWeight: 700,
                      }}
                    >
                      {rowNo}
                    </span>
                  </div>

                  {RIGHT_COLS.map((col, ci) => {
                    const seat = byCol[col];
                    if (!seat)
                      return (
                        <div
                          key={col}
                          style={{ width: SW, marginLeft: ci > 0 ? GAP : 0 }}
                        />
                      );
                    const seatCode = seat.Code;
                    const isThisSelected = selectedByActive === seatCode;
                    const isOtherSelected =
                      !isThisSelected && allSelected.has(seatCode);
                    const blocked = !isAvailable(seat);
                    const state = blocked
                      ? "blocked"
                      : isThisSelected
                      ? "selected"
                      : isOtherSelected
                      ? "other"
                      : "available";
                    return (
                      <div key={col} style={{ marginLeft: ci > 0 ? GAP : 0 }}>
                        <SeatCell
                          seat={seat}
                          state={state}
                          onSelect={(s) => onSelect(s)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <img
        src="/aeroback.png"
        alt="Aircraft back"
        style={{
          display: "block",
          width: PLANE_W,
          height: "auto",
          marginTop: -2,
          objectFit: "contain",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LEGEND
───────────────────────────────────────────────────────────────────────────── */
const LEGEND = [
  {
    bg: "var(--fl-success-bg-strong)",
    border: "var(--fl-success-border)",
    label: "₹300–799",
  },
  {
    bg: "var(--fl-info-bg-strong)",
    border: "var(--fl-info-border)",
    label: "₹800–1499",
  },
  {
    bg: "var(--fl-purple-bg)",
    border: "var(--fl-purple-border)",
    label: "₹1500+",
  },
  { bg: "var(--fl-warn-bg)", border: "#F59E0B", label: "Exit Row" },
  {
    bg: "var(--fl-surface-subtle)",
    border: "var(--fl-border-strong)",
    label: "Free",
  },
  {
    bg: "var(--fl-brand)",
    border: "var(--fl-brand-strong-line)",
    label: "Selected",
    textColor: "var(--fl-surface)",
  },
  {
    bg: "var(--fl-surface-muted)",
    border: "var(--fl-border-strong)",
    label: "Occupied",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function SeatSelectionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    flight,
    returnFlight,
    searchMeta,
    travellers,
    contact,
    billing,
    gst,
    fareQuote,
    returnFareQuote,
    traceId,
    resultIndex,
    returnResultIndex,
    selectedMeals,
    selectedBaggage,
    isLCC,
    isSeatRequired, // SSRPage se pass kiya gaya flag (RequiredFieldValidators.IsSeatRequired)
  } = location.state || {};

  const isRoundTrip = !!returnFlight;

  const { onwardSSR, returnSSR, loading, error, fetchSSR, saveSSR, saving } =
    useSSR();

  useEffect(() => {
    if (traceId && resultIndex) {
      fetchSSR({
        traceId,
        onwardResultIndex: resultIndex,
        returnResultIndex:
          returnResultIndex || returnFlight?.ResultIndex || null,
      });
    }
  }, []);

  // ── Seat required flag — SSRPage se aaya hua flag ko primary source maano,
  //    fallback me fareQuote/returnFareQuote se khud nikal lo (direct landing
  //    ya refresh ke case me bhi kaam kare). Onward ya Return me se koi bhi
  //    true ho to overall mandatory. ──────────────────────────────────────
  const onwardValidators = fareQuote?.Results?.RequiredFieldValidators || {};
  const returnValidators =
    returnFareQuote?.Results?.RequiredFieldValidators || {};
  const isSeatRequiredFlag = !!(
    isSeatRequired ||
    onwardValidators.IsSeatRequired ||
    returnValidators.IsSeatRequired
  );

  // ── Meal required flag — dobara nikalo taaki final saveSSR call me sahi
  //    value bhej sakein (SSRPage me pehli save call ke waqt jo flag use
  //    hua tha wahi consistency yahan bhi maintain honi chahiye). ────────
  const isMealRequiredFlag = !!(
    onwardValidators.IsMealRequired || returnValidators.IsMealRequired
  );

  /* ── Passengers ── */
  const allPassengers = useMemo(() => {
    const list = [];
    (travellers?.adults || []).forEach((t, i) =>
      list.push({ ...t, ptype: "Adult", idx: i }),
    );
    (travellers?.children || []).forEach((t, i) =>
      list.push({ ...t, ptype: "Child", idx: i }),
    );
    return list;
  }, [travellers]);

  const [activePassIdx, setActivePassIdx] = useState(0);
  const activePass = allPassengers[activePassIdx];

  /* ── Segments ── */
  const segments = useMemo(() => {
    const onward = (onwardSSR?.SeatsBySegment || [])
      .filter((s) =>
        s.seat_rows?.some((r) =>
          r.Seats?.some((seat) => seat.Code !== "NoSeat"),
        ),
      )
      .map((s) => ({
        ...s,
        leg: "onward",
        key: `onward-${s.segment_key}`,
        label: `${s.origin} → ${s.destination}`,
        flightNo: s.flight_number,
      }));
    const ret = isRoundTrip
      ? (returnSSR?.SeatsBySegment || [])
          .filter((s) =>
            s.seat_rows?.some((r) =>
              r.Seats?.some((seat) => seat.Code !== "NoSeat"),
            ),
          )
          .map((s) => ({
            ...s,
            leg: "return",
            key: `return-${s.segment_key}`,
            label: `${s.origin} → ${s.destination}`,
            flightNo: s.flight_number,
          }))
      : [];
    return [...onward, ...ret];
  }, [onwardSSR, returnSSR, isRoundTrip]);

  const [activeSegIdx, setActiveSegIdx] = useState(0);
  const activeSeg = segments[activeSegIdx];

  /* ── Seat Rows for active segment ── */
  const seatRowsMap = useMemo(() => {
    if (!activeSeg) return {};
    const flat = flattenSeatRows(activeSeg.seat_rows || []);
    return groupByRow(flat);
  }, [activeSeg]);

  /* ── Selections — { [segKey]: { [passengerId]: seatObjWithSegMeta } } ── */
  const [selections, setSelections] = useState({});
  const activeSegSelections = selections[activeSeg?.key] || {};
  const activePassSeatCode = activeSegSelections[activePass?.id]?.Code || null;

  function seatPrice(segKey, seatCode) {
    const seg = segments.find((s) => s.key === segKey);
    if (!seg) return 0;
    const flat = flattenSeatRows(seg.seat_rows || []);
    const s = flat.find((s) => s.Code === seatCode);
    return s?.Price || 0;
  }

  // ── seat: poora seat object jo SSR se aaya (AirlineCode, Origin, Destination,
  //    AvailablityType, SeatType, Compartment, Deck, Price, sab kuch). Hum
  //    isi object ko (segment meta ke saath) store karte hain — taaki baad me
  //    ticket payload banate waqt sahi values mil sakein, sirf Code nahi. ────
  const handleSeatSelect = (seat) => {
    if (!activeSeg || !activePass || !seat) return;
    const segKey = activeSeg.key;
    const seatCode = seat.Code;

    setSelections((prev) => {
      const segData = { ...(prev[segKey] || {}) };
      if (segData[activePass.id]?.Code === seatCode) {
        // Seat required hai toh deselect mat hone do — sirf dusri seat
        // chunna allowed hai.
        if (isSeatRequiredFlag) return prev;
        delete segData[activePass.id];
      } else {
        const takenBy = Object.entries(segData).find(
          ([pid, s]) => s?.Code === seatCode && pid !== activePass.id,
        );
        if (takenBy) return prev;

        segData[activePass.id] = {
          ...seat,
          _segOrigin: activeSeg.origin,
          _segDestination: activeSeg.destination,
          _segAirlineCode: seat.AirlineCode || "",
          _segFlightNumber: activeSeg.flightNo || seat.FlightNumber || "",
          _leg: activeSeg.leg,
        };

        if (activePassIdx < allPassengers.length - 1) {
          setTimeout(() => setActivePassIdx((i) => i + 1), 350);
        }
      }
      return { ...prev, [segKey]: segData };
    });
  };

  /* ── Fare calculation ──
     NOTE: Tax values (onwardTax / returnTax) intentionally NOT read/used
     anywhere below — "Taxes & Fees" is removed from display AND from every
     calculation (subtotal + grand total) as requested. */
  const extraMealTotal = useMemo(() => {
    let t = 0;
    Object.values(selectedMeals || {}).forEach((m) =>
      Object.values(m).forEach((meal) => {
        t += meal.Price || 0;
      }),
    );
    return t;
  }, [selectedMeals]);

  const extraBagTotal = useMemo(() => {
    let t = 0;
    Object.values(selectedBaggage || {}).forEach((m) =>
      Object.values(m).forEach((b) => {
        t += b.Price || 0;
      }),
    );
    return t;
  }, [selectedBaggage]);

  const seatTotal = useMemo(() => {
    let t = 0;
    Object.entries(selections).forEach(([segKey, passMap]) => {
      Object.entries(passMap).forEach(([, seatObj]) => {
        t += seatPrice(segKey, seatObj?.Code);
      });
    });
    return t;
  }, [selections, segments]);

  const adultCount =
    searchMeta?.passengers?.adults ?? travellers?.adults?.length ?? 1;
  const childCount =
    searchMeta?.passengers?.children ?? travellers?.children?.length ?? 0;
  const infantCount =
    searchMeta?.passengers?.infants ?? travellers?.infants?.length ?? 0;
  const totalPax = adultCount + childCount + infantCount;

  const onwardPublished =
    fareQuote?.Results?.Fare?.PublishedFare ?? flight?.Fare?.PublishedFare ?? 0;
  const returnPublished =
    returnFareQuote?.Results?.Fare?.PublishedFare ??
    returnFlight?.Fare?.PublishedFare ??
    0;

  const onwardBaseFare =
    fareQuote?.Results?.Fare?.BaseFare ?? flight?.Fare?.BaseFare ?? 0;

  const onwardTax = fareQuote?.Results?.Fare?.Tax ?? flight?.Fare?.Tax ?? 0;

  const returnBaseFare =
    returnFareQuote?.Results?.Fare?.BaseFare ??
    returnFlight?.Fare?.BaseFare ??
    0;

  const returnTax =
    returnFareQuote?.Results?.Fare?.Tax ?? returnFlight?.Fare?.Tax ?? 0;

  const onwardFare = onwardPublished * totalPax;
  const returnFare = returnPublished * totalPax;
  const grandTotal =
    onwardFare + returnFare + extraMealTotal + extraBagTotal + seatTotal;

  const totalSeatsSelected = Object.values(selections).reduce(
    (acc, seg) => acc + Object.keys(seg).length,
    0,
  );
  const maxSeats = segments.length * allPassengers.length;
  const progress = maxSeats > 0 ? (totalSeatsSelected / maxSeats) * 100 : 0;

  // ── Seat completeness check: har passenger × har segment ke liye seat
  //    selected hona chahiye jab isSeatRequiredFlag true ho. Agar kisi
  //    segment me NoSeat ke siva koi seat hi available nahi hai (rare
  //    case), us segment ko require mat karo — warna user permanently
  //    block ho jayega. ─────────────────────────────────────────────────
  const missingSeatSelections = useMemo(() => {
    if (!isSeatRequiredFlag) return [];
    const missing = [];
    segments.forEach((seg) => {
      const segMap = selections[seg.key] || {};
      allPassengers.forEach((p) => {
        if (!segMap[p.id]) missing.push({ seg, pass: p });
      });
    });
    return missing;
  }, [isSeatRequiredFlag, segments, allPassengers, selections]);

  const seatSelectionComplete =
    !isSeatRequiredFlag ||
    segments.length === 0 ||
    missingSeatSelections.length === 0;

  // ── Toast ──
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2800);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const jumpToMissingSeat = () => {
    if (missingSeatSelections.length === 0) return;
    const { seg, pass } = missingSeatSelections[0];
    const segIdx = segments.findIndex((s) => s.key === seg.key);
    const passIdx = allPassengers.findIndex((p) => p.id === pass.id);
    if (segIdx !== -1) setActiveSegIdx(segIdx);
    if (passIdx !== -1) setActivePassIdx(passIdx);
  };

  // ── handleContinue ──────────────────────────────────────────────────
  // Yahan DOOSRI (final) SSR SAVE call hoti hai — ab Meal + Baggage +
  // Seat, teeno ek saath (complete/updated payload) jaate hain. Save API:
  // /api/flightv2/ssr/save
  const handleContinue = async () => {
    if (!seatSelectionComplete) {
      showToast("Please select a seat for every traveller before continuing.");
      jumpToMissingSeat();
      return;
    }

    const flightIsLCC = isLCC ?? location.state?.flight?.IsLCC ?? false;

    // src/components/flights/SeatSelectionPage.jsx — inside handleContinue

    const result = await saveSSR({
      traceId,
      onwardResultIndex: resultIndex,
      returnResultIndex: isRoundTrip
        ? returnResultIndex || returnFlight?.ResultIndex
        : null,
      allTravellers: allPassengers,
      selectedMeals,
      selectedBaggage,
      seatSelections: selections,
      contact, // ← ADD THIS
      billing, // ← ADD THIS
      isMealRequired: isMealRequiredFlag,
      isSeatRequired: isSeatRequiredFlag,
      // ← ADD THIS too, so guardian/age logic stays correct on this second save
      flightDepartureDate: flight?.Segments?.[0]?.[0]?.Origin?.DepTime || null,
    });

    if (!result.success) {
      showToast("Failed to save your selections. Please try again.");
      return;
    }

    const nextState = {
      ...location.state,
      seatSelections: selections,
      isLCC: flightIsLCC,
      skipBooking: false, // normal flow
    };

    navigate("/flight-payment", { state: nextState });
  };

  /* ── Loading / Error ── */
  if (loading)
    return (
      <div style={styles.center}>
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--fl-brand-text)"
          strokeWidth="2.5"
          style={{ animation: "spin 0.9s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <p
          style={{ marginTop: 14, color: "var(--fl-text-muted)", fontSize: 14 }}
        >
          Loading seat map…
        </p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  // ── Agar seat data nahi hai ───────────────────────────────────────────────
  // Seat data hi nahi hai toh seat-required validation enforce karna sambhav
  // nahi hai (koi UI hi nahi hai select karne ke liye), is liye yahan
  // continue allow karna padega chahe IsSeatRequired true ho — backend/payment
  // stage par yeh case handle hoga. Yeh sirf data-na-hone ka fallback hai.
  if (error || segments.length === 0)
    return (
      <div style={styles.center}>
        <div
          style={{
            background: "var(--fl-surface)",
            borderRadius: 16,
            padding: "32px 40px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            textAlign: "center",
            maxWidth: 400,
            width: "100%",
            margin: "0 16px",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>💺</div>
          <p
            style={{
              color: "var(--fl-text-body)",
              fontWeight: 600,
              fontFamily: "Inter,sans-serif",
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            Seat map not available
          </p>
          <p
            style={{
              color: "var(--fl-text-faint)",
              fontSize: 13,
              fontFamily: "Inter,sans-serif",
              marginBottom: 24,
            }}
          >
            Seat selection is not available for this flight. You can proceed to
            payment.
          </p>
          <button
            style={styles.continueBtn}
            onClick={() => {
              const flightIsLCC =
                isLCC ?? location.state?.flight?.IsLCC ?? false;
              navigate("/flight-payment", {
                state: {
                  ...location.state,
                  seatSelections: {},
                  isLCC: flightIsLCC,
                  skipBooking: false, // normal flow — payment page apna kaam karega
                },
              });
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "Inter,sans-serif",
              }}
            >
              Continue to Payment
            </p>
          </button>

          {/* ← Yahi naya button hai — seedha flights pe */}
          <button
            style={{
              ...styles.continueBtn,
              marginTop: 10,
              background: "none",
              color: "var(--fl-text-muted)",
              border: "1.5px solid var(--fl-border)",
              boxShadow: "none",
            }}
            onClick={() => navigate("/flights", { replace: true })}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "Inter,sans-serif",
              }}
            >
              Back to Home
            </p>
          </button>
        </div>
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "Inter,sans-serif",
        background: "var(--fl-page-slate)",
        minHeight: "100vh",
        padding: "24px 0 80px",
      }}
    >
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .ss-grid{display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start;max-width:1200px;margin:0 auto;padding:0 16px;}
        .ss-grid>*{min-width:0;}
        @media(max-width:860px){.ss-grid{grid-template-columns:1fr;}}
        .card{background:var(--fl-surface);border-radius:14px;box-shadow:0 1px 12px rgba(0,0,0,0.07);overflow:hidden;}
        .seg-tab{border:1.5px solid var(--fl-border);border-radius:10px;background:var(--fl-surface);cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;padding:8px 16px;color:var(--fl-text-body);transition:all 0.15s;display:flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0;position:relative;}
        .seg-tab.active{border-color:var(--fl-brand-line);background:var(--fl-success-bg);color:var(--fl-brand-text);font-weight:700;}
        .seg-tab.incomplete::after{
          content:'';
          position:absolute;
          top:-3px;
          right:-3px;
          width:8px;
          height:8px;
          border-radius:50%;
          background:#dc2626;
          border:1.5px solid var(--fl-surface);
        }
        .pax-chip{border:1.5px solid var(--fl-border);border-radius:999px;background:var(--fl-surface);cursor:pointer;font-family:inherit;padding:7px 16px;text-align:left;transition:all 0.15s;white-space:nowrap;flex-shrink:0;position:relative;}
        .pax-chip.active{border-color:var(--fl-brand-line);background:var(--fl-success-bg);}
        .pax-chip.incomplete::after{
          content:'';
          position:absolute;
          top:-3px;
          right:-3px;
          width:8px;
          height:8px;
          border-radius:50%;
          background:#dc2626;
          border:1.5px solid var(--fl-surface);
        }
        .fare-row{display:flex;justify-content:space-between;align-items:center;padding:9px 20px;font-size:13.5px;color:var(--fl-text-body);gap:8px;border-top:1px solid var(--fl-border-soft);}
        .fare-row>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .fare-row>span:last-child{flex-shrink:0;white-space:nowrap;}
      `}</style>

      {/* ── breadcrumb ── */}
      <div
        style={{
          background: "var(--fl-surface)",
          borderBottom: "1px solid var(--fl-border)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {["Flight", "Travellers", "Meals & Bags", "Seats", "Payment"].map(
          (s, i) => (
            <span
              key={s}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              {i > 0 && (
                <span
                  style={{ color: "var(--fl-text-disabled)", fontSize: 10 }}
                >
                  ›
                </span>
              )}
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: i === 3 ? 700 : 400,
                  color:
                    i === 3
                      ? "var(--fl-brand-text)"
                      : i < 3
                      ? "var(--fl-text-faint)"
                      : "var(--fl-text-disabled)",
                }}
              >
                {s}
              </span>
            </span>
          ),
        )}
      </div>

      <div className="ss-grid">
        {/* ════════════ LEFT PANEL ════════════ */}
        <div>
          <div className="card">
            {/* header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid var(--fl-border-soft)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ color: "var(--fl-brand-text)" }}>
                  <IconSeat />
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--fl-text-strong)",
                  }}
                >
                  Choose Your Seats
                </span>
                {isSeatRequiredFlag && !seatSelectionComplete && (
                  <span
                    style={{
                      color: "var(--fl-danger-text)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    *
                  </span>
                )}
              </div>
              {/* Skip button — seat required hone par poori tarah hide */}
              {!isSeatRequiredFlag && (
                <button
                  onClick={handleContinue}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--fl-brand-text)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  Skip <IconChevron />
                </button>
              )}
            </div>

            {isSeatRequiredFlag && (
              <div
                style={{
                  margin: "12px 20px 0",
                  padding: "9px 14px",
                  background: "var(--fl-info-bg)",
                  border: "1px solid var(--fl-info-border)",
                  borderRadius: 8,
                  fontSize: 12.5,
                  color: "var(--fl-info-text)",
                  fontWeight: 500,
                }}
              >
                💺 This airline requires a seat selection for every traveller
                before you can continue.
              </div>
            )}

            {/* segment tabs */}
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "12px 20px",
                borderBottom: "1px solid var(--fl-border-soft)",
                overflowX: "auto",
              }}
            >
              {segments.map((seg, idx) => {
                const segIncomplete =
                  isSeatRequiredFlag &&
                  allPassengers.some((p) => !(selections[seg.key] || {})[p.id]);
                return (
                  <button
                    key={seg.key}
                    className={`seg-tab ${
                      activeSegIdx === idx ? "active" : ""
                    } ${segIncomplete ? "incomplete" : ""}`}
                    onClick={() => setActiveSegIdx(idx)}
                  >
                    <div
                      style={{
                        color:
                          activeSegIdx === idx
                            ? "var(--fl-brand-text)"
                            : "var(--fl-text-faint)",
                      }}
                    >
                      <IconFlight />
                    </div>
                    {isRoundTrip && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          padding: "1px 5px",
                          borderRadius: 999,
                          background:
                            seg.leg === "onward"
                              ? "var(--fl-info-bg)"
                              : "var(--fl-purple-bg)",
                          color:
                            seg.leg === "onward"
                              ? "var(--fl-info-text)"
                              : "var(--fl-purple-text)",
                        }}
                      >
                        {seg.leg === "onward" ? "Onward" : "Return"}
                      </span>
                    )}
                    {seg.label}{" "}
                    <span
                      style={{ fontSize: 11, color: "var(--fl-text-faint)" }}
                    >
                      #{seg.flightNo}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* main body */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {/* ── LEFT INFO SIDEBAR ── */}
              <div
                style={{
                  width: 200,
                  flexShrink: 0,
                  borderRight: "1px solid var(--fl-border-soft)",
                  padding: "18px 16px",
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "var(--fl-text-faint)",
                    letterSpacing: 1,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Passengers
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    marginBottom: 18,
                  }}
                >
                  {allPassengers.map((p, idx) => {
                    const seatCode = (selections[activeSeg?.key] || {})[p.id]
                      ?.Code;
                    const isActive = activePassIdx === idx;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setActivePassIdx(idx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: 10,
                          cursor: "pointer",
                          border: `1.5px solid ${
                            isActive
                              ? "var(--fl-success-border)"
                              : "var(--fl-border-soft)"
                          }`,
                          background: isActive
                            ? "var(--fl-success-bg)"
                            : "var(--fl-surface-subtle)",
                          transition: "all 0.15s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              background: isActive
                                ? "var(--fl-brand)"
                                : "var(--fl-surface-muted)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 700,
                              color: isActive ? "#fff" : "var(--fl-text-muted)",
                            }}
                          >
                            {(p.firstName || p.ptype)?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: "var(--fl-text-strong)",
                              }}
                            >
                              {p.firstName
                                ? `${p.firstName} ${p.lastName || ""}`.trim()
                                : `${p.ptype} ${idx + 1}`}
                            </div>
                            {seatCode ? (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--fl-brand-text)",
                                  fontWeight: 700,
                                }}
                              >
                                Seat {seatCode}
                              </div>
                            ) : isSeatRequiredFlag ? (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--fl-danger-text)",
                                  fontWeight: 600,
                                }}
                              >
                                Seat required
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {seatCode && (
                          <span
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: "var(--fl-text-strong)",
                            }}
                          >
                            ₹
                            {seatPrice(activeSeg?.key, seatCode).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "var(--fl-text-faint)",
                    letterSpacing: 1,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Seat Types
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 5 }}
                >
                  {LEGEND.map((l) => (
                    <div
                      key={l.label}
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 16,
                          borderRadius: "4px 4px 2px 2px",
                          background: l.bg,
                          border: `1.5px solid ${l.border}`,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{ fontSize: 11.5, color: "var(--fl-text-body)" }}
                      >
                        {l.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SEAT MAP ── */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  padding: "24px 12px",
                  background: "var(--fl-surface-subtle)",
                  overflowX: "auto",
                }}
              >
                {activeSeg && Object.keys(seatRowsMap).length > 0 ? (
                  <CabinMap
                    seatRows={seatRowsMap}
                    selections={activeSegSelections}
                    activePassengerId={activePass?.id}
                    allPassengerIds={allPassengers.map((p) => p.id)}
                    onSelect={handleSeatSelect}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--fl-text-faint)",
                      fontSize: 13,
                      paddingTop: 40,
                    }}
                  >
                    No seat map available for this segment.
                  </div>
                )}
              </div>
            </div>

            {/* ── PASSENGER CHIPS BOTTOM BAR ── */}
            <div
              style={{
                borderTop: "1px solid var(--fl-border-soft)",
                padding: "12px 20px",
                background: "var(--fl-surface-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 2,
                }}
              >
                {allPassengers.map((p, idx) => {
                  const seatCode = (selections[activeSeg?.key] || {})[p.id]
                    ?.Code;
                  const isActive = activePassIdx === idx;
                  const name = p.firstName
                    ? `${p.firstName} ${p.lastName || ""}`.trim()
                    : `${p.ptype} ${idx + 1}`;
                  const incomplete = isSeatRequiredFlag && !seatCode;
                  return (
                    <button
                      key={p.id}
                      className={`pax-chip ${isActive ? "active" : ""} ${
                        incomplete ? "incomplete" : ""
                      }`}
                      onClick={() => setActivePassIdx(idx)}
                    >
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: isActive
                            ? "var(--fl-brand-text)"
                            : "var(--fl-text-strong)",
                        }}
                      >
                        {name.length > 14 ? name.slice(0, 14) + "…" : name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: incomplete
                            ? "var(--fl-danger-text)"
                            : "var(--fl-text-muted)",
                          marginTop: 1,
                          fontWeight: incomplete ? 600 : 400,
                        }}
                      >
                        {seatCode
                          ? `Seat ${seatCode} · ₹${seatPrice(
                              activeSeg?.key,
                              seatCode,
                            )}`
                          : incomplete
                          ? "Seat Required"
                          : "Pick a seat"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════ RIGHT: FARE SUMMARY ════════════ */}
        <div style={{ position: "sticky", top: 24 }}>
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px 12px",
                borderBottom: "1px solid var(--fl-border-soft)",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--fl-text-strong)",
                }}
              >
                Fare Summary
              </span>
              <span style={{ fontSize: 12.5, color: "var(--fl-text-muted)" }}>
                {totalPax} Traveller{totalPax !== 1 ? "s" : ""}
              </span>
            </div>

            <div style={{ padding: "6px 0" }}>
              <div className="fare-row" style={{ borderTop: "none" }}>
                <span style={{ color: "var(--fl-text-muted)" }}>Fare Type</span>
                <span
                  style={{ color: "var(--fl-brand-text)", fontWeight: 600 }}
                >
                  {fareQuote?.Results?.IsRefundable ?? flight?.IsRefundable
                    ? "Refundable"
                    : "Partial Refundable"}
                </span>
              </div>

              <div
                style={{
                  padding: "10px 20px 4px",
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: "var(--fl-brand-text)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {isRoundTrip ? "Onward Flight" : "Flight Fare"}
              </div>
              <div className="fare-row">
                <span>Base Fare</span>
                <span style={{ fontWeight: 600 }}>
                  ₹
                  {(
                    (fareQuote?.Results?.Fare?.BaseFare ?? 0) * totalPax
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="fare-row">
                <span>Taxes</span>
                <span style={{ fontWeight: 600 }}>
                  ₹
                  {(
                    (fareQuote?.Results?.Fare?.Tax ?? 0) * totalPax
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              {isRoundTrip && (
                <>
                  <div
                    style={{
                      padding: "10px 20px 4px",
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: "var(--fl-purple-text)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      borderTop: "1px dashed var(--fl-border)",
                      marginTop: 4,
                    }}
                  >
                    Return Flight
                  </div>
                  <div className="fare-row">
                    <span>Base Fare</span>
                    <span style={{ fontWeight: 600 }}>
                      ₹
                      {(
                        (returnFareQuote?.Results?.Fare?.BaseFare ?? 0) *
                        totalPax
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="fare-row">
                    <span>Taxes</span>
                    <span style={{ fontWeight: 600 }}>
                      ₹
                      {(
                        (returnFareQuote?.Results?.Fare?.Tax ?? 0) * totalPax
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </>
              )}

              {extraMealTotal > 0 && (
                <div className="fare-row">
                  <span style={{ color: "var(--fl-brand-text)" }}>Meals</span>
                  <span
                    style={{ fontWeight: 600, color: "var(--fl-brand-text)" }}
                  >
                    +₹{extraMealTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {extraBagTotal > 0 && (
                <div className="fare-row">
                  <span style={{ color: "var(--fl-brand-text)" }}>
                    Extra Baggage
                  </span>
                  <span
                    style={{ fontWeight: 600, color: "var(--fl-brand-text)" }}
                  >
                    +₹{extraBagTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {seatTotal > 0 && (
                <div className="fare-row">
                  <span style={{ color: "var(--fl-brand-text)" }}>
                    Seat Charges
                  </span>
                  <span
                    style={{ fontWeight: 700, color: "var(--fl-brand-text)" }}
                  >
                    +₹{seatTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            {/* total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                background: "var(--fl-surface-subtle)",
                borderTop: "2px solid var(--fl-border)",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14.5,
                  color: "var(--fl-text-strong)",
                }}
              >
                Net Amount Payable
              </span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 17,
                  color: "var(--fl-text-strong)",
                  flexShrink: 0,
                }}
              >
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>

            {/* progress */}
            <div style={{ padding: "14px 20px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--fl-text-muted)" }}>
                  Seats selected
                </span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  {totalSeatsSelected} / {maxSeats}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "var(--fl-surface-muted)",
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    background: "var(--fl-brand)",
                    width: `${progress}%`,
                    transition: "width 0.35s ease",
                  }}
                />
              </div>
            </div>

            <div style={{ padding: "0 20px 20px" }}>
              <button
                onClick={handleContinue}
                disabled={!seatSelectionComplete || saving}
                style={{
                  ...styles.continueBtn,
                  background:
                    seatSelectionComplete && !saving
                      ? "linear-gradient(135deg,var(--fl-brand),var(--fl-brand-hover))"
                      : "var(--fl-surface-strong)",
                  cursor:
                    seatSelectionComplete && !saving
                      ? "pointer"
                      : "not-allowed",
                  boxShadow:
                    seatSelectionComplete && !saving
                      ? "0 2px 12px rgba(22,163,74,0.28)"
                      : "none",
                }}
              >
                {saving
                  ? "Saving..."
                  : seatSelectionComplete
                  ? "Continue to Payment"
                  : "Select Seat to Continue"}
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  marginTop: 10,
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--fl-text-faint)"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span style={{ fontSize: 11.5, color: "var(--fl-text-faint)" }}>
                  Secured &amp; Encrypted Payment
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toastMsg} show={toastVisible} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED STYLES
───────────────────────────────────────────────────────────────────────────── */
const styles = {
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "16px",
  },
  continueBtn: {
    width: "100%",
    padding: "13px 0",
    borderRadius: 10,
    background: "linear-gradient(135deg,var(--fl-brand),var(--fl-brand-hover))",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    minHeight: 48,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 12px rgba(22,163,74,0.28)",
    transition: "opacity 0.15s",
  },
};
