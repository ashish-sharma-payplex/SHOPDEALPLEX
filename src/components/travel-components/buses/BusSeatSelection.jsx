// src\components\buses\BusSeatSelection.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useBusSeatLayout } from "components/travel-hooks/bus/useBusSeatLayout";
import { useBusBoardingPoints } from "components/travel-hooks/bus/useBusBoardingPoints";

const GREEN = "#16a34a";
const GREEN_LIGHT = "#f0fdf4";
const GREEN_BORDER = "#bbf7d0";

const GLOBAL_CSS = `
  .bss-layout {
    display: flex;
    align-items: flex-start;
    background: #ffffff;
    max-width: 1300px;
    margin: 10px auto;
  }
  .bss-left {
    width: 252px;
    flex-shrink: 0;
    padding: 20px 0 20px 20px;
  }
  .bss-right {
    flex: 1;
    min-width: 0;
    padding: 20px 20px 20px 16px;
  }
  .bss-mobile-backdrop {
    display: none;
    position: fixed; inset: 0; z-index: 998;
    background: rgba(0,0,0,0.45);
    animation: bssBackdropIn 0.22s ease;
  }
  .bss-mobile-sheet {
    display: none;
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 999;
    background: #fff;
    border-radius: 20px 20px 0 0;
    max-height: 88vh;
    overflow-y: auto;
    padding: 0 0 24px 0;
    animation: bssSheetUp 0.3s cubic-bezier(0.34,1.2,0.64,1);
    scrollbar-width: thin;
    scrollbar-color: #d1d5db transparent;
  }
  .bss-mobile-sheet::-webkit-scrollbar { width: 4px; }
  .bss-mobile-sheet::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
  @keyframes bssSheetUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes bssBackdropIn { from { opacity: 0 } to { opacity: 1 } }
  .bss-filter-fab {
    display: none;
    position: fixed;
    bottom: 20px; left: 50%; transform: translateX(-50%);
    z-index: 900;
    background: ${GREEN};
    color: #fff;
    border: none;
    border-radius: 50px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(22,163,74,0.4);
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  @media (max-width: 768px) {
    .bss-layout {
      flex-direction: column;
    }
    .bss-left { display: none; }
    .bss-right {
      padding: 12px 12px 100px 12px;
    }
    .bss-mobile-backdrop { display: block; }
    .bss-mobile-sheet { display: block; }
    .bss-filter-fab { display: flex !important; }
  }
`;

function injectGlobalStyles() {
  if (
    typeof document !== "undefined" &&
    !document.getElementById("bss-global")
  ) {
    const tag = document.createElement("style");
    tag.id = "bss-global";
    tag.innerHTML = GLOBAL_CSS;
    document.head.appendChild(tag);
  }
}

const SEATER_ICONS = {
  available: "/availableseat.svg",
  female: "/availableforfemale.svg",
  male: "/availableformale.svg",
  booked: "/bookedseat.svg",
  selected: "/selectedseat.svg",
};

const SEATER_TOP_ICONS = {
  available: "/availableseattop.png",
  booked: "/bookedseattop.png",
  female: "/ladiesseattop.png",
  male: "/gentsseattop.png",
  selected: "/Selectedseattop.png",
};

const SLEEPER_ICONS = {
  available: "/availablesleeperseat.svg",
  female: "/sleeperfemaleseat.svg",
  male: "/sleepermaleseat.svg",
  booked: "/bookedsleeperseat.svg",
  bookedByMale: "/bookedbymalesleeper.svg",
  bookedByFemale: "/bookedbyfemalesleeper.svg",
  selected: "/bookedsleeperseat.svg",
};

function isSleeperType(seatType) {
  return seatType === 2 || seatType === 3 || seatType === 4 || seatType === 5;
}

function getSeatIconSrc(status, isSleeper) {
  if (isSleeper) {
    switch (status) {
      case "selected":
        return SLEEPER_ICONS.selected;
      case "booked":
        return SLEEPER_ICONS.booked;
      case "bookedByMale":
        return SLEEPER_ICONS.bookedByMale;
      case "bookedByFemale":
        return SLEEPER_ICONS.bookedByFemale;
      case "female":
        return SLEEPER_ICONS.female;
      case "male":
        return SLEEPER_ICONS.male;
      default:
        return SLEEPER_ICONS.available;
    }
  }
  switch (status) {
    case "selected":
      return SEATER_ICONS.selected;
    case "booked":
      return SEATER_ICONS.booked;
    case "female":
      return SEATER_ICONS.female;
    case "male":
      return SEATER_ICONS.male;
    default:
      return SEATER_ICONS.available;
  }
}

function getSeatStatus(seat, selectedSeatNames) {
  if (selectedSeatNames.includes(seat.SeatName)) return "selected";
  if (!seat.SeatStatus) {
    if (isSleeperType(seat.SeatType)) {
      if (seat.IsMalesSeat) return "bookedByMale";
      if (seat.IsLadiesSeat) return "bookedByFemale";
    }
    return "booked";
  }
  if (seat.IsLadiesSeat) return "female";
  if (seat.IsMalesSeat) return "male";
  return "available";
}

const DriverCell = () => (
  <div
    style={{
      width: 52,
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      flexShrink: 0,
    }}
  >
    <img
      src="/steering.svg"
      alt="driver"
      width={36}
      height={36}
      draggable={false}
      style={{ display: "block", userSelect: "none" }}
    />
  </div>
);

const SeatIcon = ({ status, label, onClick, seat, size }) => {
  const isSleeper = isSleeperType(seat?.SeatType);
  const SEAT_W = size ?? 28;
  const SEAT_H = size ?? 28;

  const SLP_OUTER_W = 50;
  const SLP_OUTER_H = 26;
  const SLP_SVG_W = 26;
  const SLP_SVG_H = 50;

  const outerW = isSleeper ? SLP_OUTER_W : SEAT_W;
  const outerH = isSleeper ? SLP_OUTER_H : SEAT_H;
  const clickable = ["available", "selected", "female", "male"].includes(
    status,
  );
  const iconSrc = getSeatIconSrc(status, isSleeper);

  return (
    <div
      onClick={clickable ? onClick : undefined}
      title={label}
      style={{
        width: outerW,
        height: outerH,
        flexShrink: 0,
        cursor: clickable ? "pointer" : "not-allowed",
        position: "relative",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => {
        if (clickable) e.currentTarget.style.opacity = "0.75";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      {isSleeper ? (
        <img
          src={iconSrc}
          alt={status}
          draggable={false}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: SLP_SVG_W,
            height: SLP_SVG_H,
            transform: "translate(-50%, -50%) rotate(270deg)",
            transformOrigin: "center center",
            display: "block",
            userSelect: "none",
          }}
        />
      ) : (
        <img
          src={iconSrc}
          alt={status}
          width={SEAT_W}
          height={SEAT_H}
          draggable={false}
          style={{ display: "block", userSelect: "none" }}
        />
      )}
    </div>
  );
};

const LegendItem = ({ status, label, isSleeper = false }) => {
  const outerW = isSleeper ? 44 : 26;
  const outerH = isSleeper ? 22 : 26;
  const svgW = isSleeper ? 22 : 26;
  const svgH = isSleeper ? 44 : 26;
  // Only legend changes
  const iconSrc = isSleeper
    ? getSeatIconSrc(status, true)
    : SEATER_TOP_ICONS[status];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          width: outerW,
          height: outerH,
          position: "relative",
          flexShrink: 0,
        }}
      >
        {isSleeper ? (
          <img
            src={iconSrc}
            alt={status}
            draggable={false}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: svgW,
              height: svgH,
              transform: "translate(-50%, -50%) rotate(90deg)",
              transformOrigin: "center center",
              display: "block",
              userSelect: "none",
            }}
          />
        ) : (
          <img
            src={iconSrc}
            alt={status}
            width={svgW}
            height={svgH}
            draggable={false}
            style={{ display: "block" }}
          />
        )}
      </div>
      <span
        style={{
          fontSize: 10,
          color: "#6b7280",
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: 48,
        }}
      >
        {label}
      </span>
    </div>
  );
};

const RealSeatMap = ({ seats, selectedSeatNames, onSeatToggle }) => {
  if (!seats?.length)
    return (
      <div style={{ color: "#9ca3af", fontSize: 13, padding: 16 }}>
        No seat data available.
      </div>
    );

  const upperRows = seats.filter((row) => row.some((s) => s.IsUpper));
  const lowerRows = seats.filter((row) => row.some((s) => !s.IsUpper));

  const renderSection = (rows, label) => {
    if (!rows.length) return null;
    const sortedRows = [...rows].sort(
      (a, b) => parseInt(a[0].RowNo) - parseInt(b[0].RowNo),
    );
    const sectionHasSleeper = sortedRows.some((row) =>
      row.some((s) => isSleeperType(s.SeatType)),
    );

    const allCols = new Set();
    sortedRows.forEach((row) =>
      row.forEach((seat) => allCols.add(parseInt(seat.ColumnNo))),
    );
    const sortedCols = [...allCols].sort((a, b) => a - b);

    const aisleAfterCol = new Set();
    if (!sectionHasSleeper) {
      sortedCols.forEach((col, idx) => {
        if (idx > 0 && col - sortedCols[idx - 1] > 2)
          aisleAfterCol.add(sortedCols[idx - 1]);
      });
    }
    const rowsWithGaps = [];
    sortedRows.forEach((row, idx) => {
      if (idx > 0) {
        const prevRowNo = parseInt(sortedRows[idx - 1][0].RowNo);
        const curRowNo = parseInt(row[0].RowNo);
        if (curRowNo - prevRowNo > 1)
          rowsWithGaps.push({ isAisle: true, key: `aisle-${idx}` });
      }
      rowsWithGaps.push({ isAisle: false, row });
    });
    let firstRowRendered = false;
    return (
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6b7280",
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          {label}
        </div>
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "16px 14px",
            background: "#fafafa",
            overflowX: "auto",
            display: "inline-block",
            minWidth: "100%",
          }}
        >
          {rowsWithGaps.map((item, i) => {
            if (item.isAisle)
              return <div key={item.key} style={{ height: 16 }} />;
            const seatByCol = {};
            item.row.forEach((s) => {
              seatByCol[parseInt(s.ColumnNo)] = s;
            });
            const isFirstRow = !firstRowRendered;
            if (!firstRowRendered) firstRowRendered = true;
            const rowHasSleeper = item.row.some((s) =>
              isSleeperType(s.SeatType),
            );

            const rowGap = rowHasSleeper ? 9 : 12;
            const rowHeight = rowHasSleeper ? 26 : 28;
            const rowMb = rowHasSleeper ? 11 : 11;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: rowGap,
                  marginBottom: rowMb,
                  minHeight: rowHeight,
                }}
              >
                {isFirstRow && label === "Lower deck" ? (
                  <DriverCell />
                ) : (
                  <div style={{ width: 52, flexShrink: 0 }} />
                )}
                {sortedCols.map((col, colIdx) => {
                  const seat = seatByCol[col];
                  return (
                    <React.Fragment key={col}>
                      {colIdx > 0 &&
                        aisleAfterCol.has(sortedCols[colIdx - 1]) && (
                          <div
                            style={{
                              width: rowHasSleeper ? 14 : 26,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      {seat ? (
                        <SeatIcon
                          status={getSeatStatus(seat, selectedSeatNames)}
                          label={seat.SeatName}
                          seat={seat}
                          onClick={
                            [
                              "available",
                              "selected",
                              "female",
                              "male",
                            ].includes(getSeatStatus(seat, selectedSeatNames))
                              ? () => onSeatToggle(seat.SeatName, seat)
                              : undefined
                          }
                        />
                      ) : (
                        <div
                          style={{
                            width: rowHasSleeper ? 0 : 28,
                            height: rowHasSleeper ? 0 : 28,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderSection(upperRows, "Upper deck")}
      {renderSection(lowerRows, "Lower deck")}
    </div>
  );
};

const shimmerBase = {
  background: "linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)",
  backgroundSize: "600px 100%",
  animation: "bssShin 1.4s infinite linear",
  borderRadius: 6,
  flexShrink: 0,
};

const SeatMapSkeleton = () => (
  <>
    <style>{`@keyframes bssShin{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
    {["Upper Berth", "Lower Berth"].map((label) => (
      <div key={label} style={{ marginBottom: 20 }}>
        <div
          style={{ ...shimmerBase, width: 90, height: 10, marginBottom: 12 }}
        />
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "18px 12px",
            background: "#fafafa",
            display: "block",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                {/* Real steering icon — only lower deck, first row, left side */}
                {i === 0 && label === "Lower Berth" ? (
                  <DriverCell />
                ) : (
                  <div style={{ width: 52, flexShrink: 0 }} />
                )}

                {/* Left group of seats */}
                <div style={{ display: "flex", gap: 10, flex: 1 }}>
                  {Array.from({ length: 3 }).map((__, j) => (
                    <div
                      key={j}
                      style={{
                        ...shimmerBase,
                        flex: 1,
                        maxWidth: 40,
                        height: 32,
                      }}
                    />
                  ))}
                </div>

                {/* Aisle gap */}
                <div style={{ width: 26, flexShrink: 0 }} />

                {/* Right group of seats */}
                <div style={{ display: "flex", gap: 10, flex: 1 }}>
                  {Array.from({ length: 3 }).map((__, j) => (
                    <div
                      key={j}
                      style={{
                        ...shimmerBase,
                        flex: 1,
                        maxWidth: 40,
                        height: 32,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </>
);

const BoardingPointsSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <style>{`@keyframes bssShin{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
    <div style={{ ...shimmerBase, width: 110, height: 12, marginBottom: 4 }} />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} style={{ ...shimmerBase, height: 54, borderRadius: 8 }} />
    ))}
  </div>
);

const BoardingDroppingFlow = ({
  boardingPoints,
  droppingPoints,
  selectedBoardingPoint,
  selectedDroppingPoint,
  onSelectBoarding,
  onSelectDropping,
}) => {
  const [step, setStep] = useState("boarding");
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState("in");
  const [pointSearch, setPointSearch] = useState("");
  const bothSelected = selectedBoardingPoint && selectedDroppingPoint;

  const goTo = (target) => {
    setPointSearch("");
    setSlideDir("out");
    setAnimating(true);
    setTimeout(() => {
      setStep(target);
      setSlideDir("in");
      setTimeout(() => setAnimating(false), 320);
    }, 260);
  };

  const filterPoints = (points) =>
    !pointSearch
      ? points
      : (points || []).filter(
        (pt) =>
          (pt.name || "").toLowerCase().includes(pointSearch.toLowerCase()) ||
          (pt.subLabel || "")
            .toLowerCase()
            .includes(pointSearch.toLowerCase()),
      );

  const PointSearchBar = ({ placeholder }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "8px 10px",
        background: "#fff",
        marginBottom: 10,
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={pointSearch}
        onChange={(e) => setPointSearch(e.target.value)}
        style={{
          border: "none",
          outline: "none",
          fontSize: 13,
          fontFamily: "Inter, sans-serif",
          color: "#111",
          width: "100%",
          background: "transparent",
        }}
      />
      {pointSearch && (
        <span
          onClick={() => setPointSearch("")}
          style={{
            cursor: "pointer",
            color: "#9ca3af",
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </span>
      )}
    </div>
  );

  const animStyle = !animating
    ? {
      opacity: 1,
      transform: "translateX(0)",
      transition: "opacity 0.28s ease, transform 0.28s ease",
    }
    : slideDir === "out"
      ? {
        opacity: 0,
        transform:
          step === "boarding" ? "translateX(-20px)" : "translateX(20px)",
        transition: "opacity 0.26s ease, transform 0.26s ease",
      }
      : {
        opacity: 0,
        transform:
          step === "dropping" ? "translateX(20px)" : "translateX(-20px)",
        transition: "none",
      };

  const PointList = ({ points, selected, onSelect }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {points?.length > 0 ? (
        points.map((pt, i) => {
          const isSel = selected?.name === pt.name;
          return (
            <div
              key={i}
              onClick={() => onSelect(pt)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                background: isSel ? GREEN_LIGHT : "#fff",
                border: isSel ? `1px solid ${GREEN}` : "1px solid #f3f4f6",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: `2px solid ${isSel ? GREEN : "#d1d5db"}`,
                    background: isSel ? GREEN : "transparent",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSel && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#fff",
                      }}
                    />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                    {pt.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    {pt.subLabel}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  flexShrink: 0,
                }}
              >
                {pt.time}
              </span>
            </div>
          );
        })
      ) : (
        <div
          style={{
            fontSize: 13,
            color: "#9ca3af",
            textAlign: "center",
            padding: "12px 0",
          }}
        >
          No points available
        </div>
      )}
    </div>
  );

  if (bothSelected) {
    const CR = ({ point, onChangeClick }) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
            {point.name}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
            {point.subLabel}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>
            {point.time}
          </div>
        </div>
        <button
          onClick={onChangeClick}
          style={{
            background: "#fff",
            border: `1.5px solid ${GREEN}`,
            borderRadius: 8,
            padding: "6px 18px",
            fontSize: 13,
            fontWeight: 600,
            color: GREEN,
            cursor: "pointer",
          }}
        >
          Change
        </button>
      </div>
    );
    return (
      <div style={{ width: "100%" }}>
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <CR
            point={selectedBoardingPoint}
            onChangeClick={() => {
              onSelectBoarding(null);
              onSelectDropping(null);
              setStep("boarding");
            }}
          />
          <div style={{ height: 1, background: "#f3f4f6", margin: "0 16px" }} />
          <CR
            point={selectedDroppingPoint}
            onChangeClick={() => {
              onSelectDropping(null);
              setStep("dropping");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <div style={animStyle}>
        {step === "boarding" ? (
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#111",
                marginBottom: 10,
              }}
            >
              Boarding Point
            </div>
            <PointSearchBar placeholder="Search boarding point..." />
            <PointList
              points={filterPoints(boardingPoints)}
              selected={selectedBoardingPoint}
              onSelect={(pt) => {
                onSelectBoarding(pt);
                goTo("dropping");
              }}
            />
          </div>
        ) : (
          <div>
            <button
              onClick={() => goTo("boarding")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 0 10px 0",
                color: GREEN,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={GREEN}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Change boarding point
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: GREEN_LIGHT,
                border: `1px solid ${GREEN_BORDER}`,
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 14,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={GREEN}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#166534",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  Boarding from
                </div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#14532d" }}
                >
                  {selectedBoardingPoint?.name} · {selectedBoardingPoint?.time}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#111",
                marginBottom: 10,
              }}
            >
              Dropping Point
            </div>
            <PointSearchBar placeholder="Search dropping point..." />
            <PointList
              points={filterPoints(droppingPoints)}
              selected={selectedDroppingPoint}
              onSelect={onSelectDropping}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ───────────────────────── Footer Accordion Panels (NEW) ───────────────────────── */

const InfoAccordionIcon = ({ open, color = "#9ca3af" }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    style={{
      transition: "transform 0.2s",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      flexShrink: 0,
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const BoardingDroppingInfoPanel = ({ boardingPoints, droppingPoints }) => (
  <div
    style={{ display: "flex", gap: 20, padding: "16px 18px", flexWrap: "wrap" }}
  >
    <div style={{ flex: 1, minWidth: 220 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#6b7280",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Boarding Points
      </div>
      {boardingPoints?.length ? (
        boardingPoints.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              padding: "8px 0",
              borderBottom:
                i !== boardingPoints.length - 1 ? "1px dashed #eee" : "none",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                {p.name}
              </div>
              <div style={{ fontSize: 11.5, color: "#9ca3af" }}>
                {p.subLabel}
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                whiteSpace: "nowrap",
              }}
            >
              {p.time}
            </div>
          </div>
        ))
      ) : (
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          No boarding points found.
        </div>
      )}
    </div>
    <div style={{ width: 1, background: "#f0f0f0", alignSelf: "stretch" }} />
    <div style={{ flex: 1, minWidth: 220 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#6b7280",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Dropping Points
      </div>
      {droppingPoints?.length ? (
        droppingPoints.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              padding: "8px 0",
              borderBottom:
                i !== droppingPoints.length - 1 ? "1px dashed #eee" : "none",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                {p.name}
              </div>
              <div style={{ fontSize: 11.5, color: "#9ca3af" }}>
                {p.subLabel}
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                whiteSpace: "nowrap",
              }}
            >
              {p.time}
            </div>
          </div>
        ))
      ) : (
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          No dropping points found.
        </div>
      )}
    </div>
  </div>
);

const CancellationPolicyPanel = ({ policies }) => (
  <div style={{ padding: "16px 18px" }}>
    {policies?.length ? (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {policies.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom:
                i !== policies.length - 1 ? "1px dashed #eee" : "none",
            }}
          >
            <div style={{ fontSize: 13, color: "#374151" }}>
              {p.policyString}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: GREEN,
                whiteSpace: "nowrap",
              }}
            >
              {p.charge != null ? `${p.charge}% Deduction` : "—"}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div style={{ fontSize: 12, color: "#9ca3af" }}>
        Cancellation policy not available for this bus.
      </div>
    )}
  </div>
);

/* ─── Facility Icons (SVG, no emojis) ─── */
const FacilityIcon = ({ type, color = "#166534" }) => {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (type) {
    case "liveTracking":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <path d="M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2" opacity="0.5" />
        </svg>
      );
    case "mTicket":
      return (
        <svg {...common}>
          <rect x="6" y="2" width="12" height="20" rx="2" />
          <line x1="10" y1="18" x2="14" y2="18" />
        </svg>
      );
    case "idProofRequired":
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <circle cx="8.5" cy="12" r="2" />
          <path d="M5.5 16.5c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5" />
          <line x1="14" y1="9.5" x2="18.5" y2="9.5" />
          <line x1="14" y1="13" x2="18.5" y2="13" />
        </svg>
      );
    case "partialCancellation":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12.5l2.3 2.3 4.7-5" />
        </svg>
      );
    default:
      return null;
  }
};

const FACILITY_META = {
  liveTracking: { label: "Live Tracking" },
  mTicket: { label: "M-Ticket Accepted" },
  idProofRequired: { label: "ID Proof Required" },
  partialCancellation: { label: "Partial Cancellation Allowed" },
};

const BusFacilitiesPanel = ({ facilities }) => {
  const active = Object.entries(facilities || {}).filter(([, v]) => v);
  return (
    <div
      style={{
        padding: "16px 18px",
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      {active.length ? (
        active.map(([key]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: GREEN_LIGHT,
              border: `1px solid ${GREEN_BORDER}`,
              borderRadius: 8,
              padding: "7px 12px",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#166534",
            }}
          >
            <FacilityIcon type={key} color="#166534" />
            {FACILITY_META[key]?.label}
          </div>
        ))
      ) : (
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          No additional info available.
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────── */

const BusCardExpanded = ({ bus, from, to }) => {
  const [expanded, setExpanded] = useState(false);
  const [activePrice, setActivePrice] = useState("All");
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState(null);
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState(null);
  const [selectedSeatNames, setSelectedSeatNames] = useState([]);
  const [selectedSeatObjects, setSelectedSeatObjects] = useState([]);
  const [apiSeats, setApiSeats] = useState(null);
  const [seatLayoutLoaded, setSeatLayoutLoaded] = useState(false);
  const [apiBoardingPoints, setApiBoardingPoints] = useState([]);
  const [apiDroppingPoints, setApiDroppingPoints] = useState([]);
  const [fetchStarted, setFetchStarted] = useState(false);
  const [openInfoPanel, setOpenInfoPanel] = useState(null); // 'boarding' | 'cancellation' | 'facilities' | null

  const seatMapRef = useRef(null);
  const [seatMapHeight, setSeatMapHeight] = useState(null);

  useEffect(() => {
    if (!seatMapRef.current) return;
    const observer = new ResizeObserver(() => {
      setSeatMapHeight(seatMapRef.current?.offsetHeight ?? null);
    });
    observer.observe(seatMapRef.current);
    return () => observer.disconnect();
  }, [seatLayoutLoaded]);

  const { fetchSeatLayout, loading: seatLoading } = useBusSeatLayout();
  const { fetchBoardingPoints } = useBusBoardingPoints();
  const navigate = useNavigate();

  const handleToggleExpand = async () => {
    const opening = !expanded;
    setExpanded(opening);
    if (opening && !seatLayoutLoaded) {
      setFetchStarted(true);
      const traceId = bus.traceId ?? bus.trace_id ?? bus.traceID;
      const resultIndex =
        bus.resultIndex ?? bus.result_index ?? bus.resultindex;
      if (!traceId || resultIndex == null) {
        setSeatLayoutLoaded(true);
        return;
      }
      try {
        const [seatRes, bpRes] = await Promise.all([
          fetchSeatLayout({ traceId, resultIndex }),
          fetchBoardingPoints({ traceId, resultIndex }),
        ]);
        if (!seatRes?.success) {
          const msg =
            seatRes?.error?.message ||
            "Something went wrong. Please try again.";
          setExpanded(false);
          setSeatLayoutLoaded(false);
          setFetchStarted(false);
          Swal.fire({
            icon: "warning",
            title: "Session Expired",
            html: `<p style="color:#c2410c;font-size:14px;margin:0 0 8px 0;">${msg}</p><p style="color:#9ca3af;font-size:13px;margin:0;">Please go back and search again.</p>`,
            confirmButtonText: "Go Back & Search",
            confirmButtonColor: GREEN,
            showCancelButton: false,
          });
          return;
        }
        if (seatRes?.data?.seats) setApiSeats(seatRes.data.seats);
        setSeatLayoutLoaded(true);
        if (bpRes?.success && bpRes?.data) {
          const mapPoint = (p) => ({
            id: p.id,
            name: p.name,
            subLabel: p.location || p.landmark || p.address || "",
            time: p.time
              ? new Date(p.time).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
              : "",
            contact: p.contact || "",
          });
          setApiBoardingPoints(
            (bpRes.data.boarding_points || []).map(mapPoint),
          );
          setApiDroppingPoints(
            (bpRes.data.dropping_points || []).map(mapPoint),
          );
        }
      } catch {
        setExpanded(false);
        setSeatLayoutLoaded(false);
        setFetchStarted(false);
        Swal.fire({
          icon: "warning",
          title: "Session Expired",
          html: `<p style="color:#c2410c;font-size:14px;margin:0 0 8px 0;">Something went wrong.</p><p style="color:#9ca3af;font-size:13px;margin:0;">Please go back and search again.</p>`,
          confirmButtonText: "Go Back & Search",
          confirmButtonColor: GREEN,
        });
      }
    }
  };

  const handleSeatToggle = (seatName, seatObj) => {
    setSelectedSeatNames((prev) => {
      const isSel = prev.includes(seatName);
      setSelectedSeatObjects((objs) =>
        isSel
          ? objs.filter((o) => o.SeatName !== seatName)
          : objs.some((o) => o.SeatName === seatName)
            ? objs
            : [...objs, seatObj],
      );
      return isSel ? prev.filter((n) => n !== seatName) : [...prev, seatName];
    });
  };

  const totalFare = selectedSeatObjects.reduce(
    (s, x) => s + (x.SeatFare || 0),
    0,
  );
  const priceTiers = apiSeats
    ? [...new Set(apiSeats.flat().map((s) => s.SeatFare))].sort((a, b) => a - b)
    : bus.priceTiers || [];
  const filteredSeats = apiSeats
    ? activePrice === "All"
      ? apiSeats
      : apiSeats.map((row) =>
        row.filter((s) => s.SeatFare === Number(activePrice)),
      )
    : null;
  const canContinue =
    selectedSeatNames.length > 0 &&
    selectedBoardingPoint &&
    selectedDroppingPoint;
  const busHasSleeper =
    filteredSeats?.some((row) => row.some((s) => isSleeperType(s.SeatType))) ??
    false;

  const legendItems = [
    { status: "available", label: "Available Seat" },
    { status: "booked", label: "Already Booked" },
    { status: "female", label: "Available for Female" },
    { status: "male", label: "Available for Male" },
    { status: "selected", label: "Selected Seat" },
  ];

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)")
      }
    >
      {/* Card Header — matches shared reference exactly */}
      <div
        style={{ padding: "16px 18px 14px", fontFamily: "Inter, sans-serif" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          {/* Left: operator + times */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#111",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {bus.operatorName}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {bus.busType}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginTop: 14,
                gap: 24,
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: "#111",
                    lineHeight: 1,
                  }}
                >
                  {bus.departureTime}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    marginTop: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {bus.departureDate}
                  {from ? `, ${from}` : ""}
                </div>
              </div>

              <div
                style={{
                  alignSelf: "flex-start",
                  marginTop: 1,
                  background: "#f3f4f6",
                  color: "#6b7280",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "3px 10px",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                }}
              >
                {bus.duration}
              </div>

              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: "#111",
                    lineHeight: 1,
                  }}
                >
                  {bus.arrivalTime}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    marginTop: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {bus.arrivalDate}
                  {to ? `, ${to}` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Right: price, select-seats button, seat count — stacked */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
              minWidth: 108,
            }}
          >
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>from </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
                ₹{bus.price?.toLocaleString("en-IN")}
              </span>
            </div>
            <button
              onClick={handleToggleExpand}
              disabled={seatLoading && !seatLayoutLoaded}
              style={{
                background: expanded ? "#374151" : GREEN,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 16px",
                fontWeight: 600,
                fontSize: 13,
                cursor: seatLoading ? "wait" : "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.15s",
              }}
            >
              {seatLoading && !seatLayoutLoaded
                ? "Loading..."
                : expanded
                  ? "Hide seats"
                  : "Select seats"}
            </button>
            <div
              style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}
            >
              {bus.seatsAvailable} Seats Available
            </div>
          </div>
        </div>

        {/* Dashed divider */}
        <div
          style={{ borderTop: "1px dashed #e5e7eb", margin: "14px 0 12px" }}
        />

        {/* Inline info links — replaces the old separate footer strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            flexWrap: "wrap",
          }}
        >
          <div
            onClick={() =>
              setOpenInfoPanel((p) => (p === "boarding" ? null : "boarding"))
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: openInfoPanel === "boarding" ? GREEN : "#374151",
                fontWeight: 500,
              }}
            >
              Boarding & Dropping Points
            </span>
            <InfoAccordionIcon
              open={openInfoPanel === "boarding"}
              color={openInfoPanel === "boarding" ? GREEN : "#9ca3af"}
            />
          </div>

          <div
            onClick={() =>
              setOpenInfoPanel((p) =>
                p === "cancellation" ? null : "cancellation",
              )
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: openInfoPanel === "cancellation" ? GREEN : "#374151",
                fontWeight: 500,
              }}
            >
              Cancellations Policy
            </span>
            <InfoAccordionIcon
              open={openInfoPanel === "cancellation"}
              color={openInfoPanel === "cancellation" ? GREEN : "#9ca3af"}
            />
          </div>

          <div
            onClick={() =>
              setOpenInfoPanel((p) =>
                p === "facilities" ? null : "facilities",
              )
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: openInfoPanel === "facilities" ? GREEN : "#374151",
                fontWeight: 500,
              }}
            >
              Amenities
            </span>
            <InfoAccordionIcon
              open={openInfoPanel === "facilities"}
              color={openInfoPanel === "facilities" ? GREEN : "#9ca3af"}
            />
          </div>
        </div>

        {openInfoPanel === "boarding" && (
          <div
            style={{
              marginTop: 12,
              border: "1px solid #f3f4f6",
              borderRadius: 8,
              background: "#fafafa",
            }}
          >
            <BoardingDroppingInfoPanel
              boardingPoints={bus.boardingPoints}
              droppingPoints={bus.droppingPoints}
            />
          </div>
        )}
        {openInfoPanel === "cancellation" && (
          <div
            style={{
              marginTop: 12,
              border: "1px solid #f3f4f6",
              borderRadius: 8,
              background: "#fafafa",
            }}
          >
            <CancellationPolicyPanel policies={bus.cancellationPolicies} />
          </div>
        )}
        {openInfoPanel === "facilities" && (
          <div
            style={{
              marginTop: 12,
              border: "1px solid #f3f4f6",
              borderRadius: 8,
              background: "#fafafa",
            }}
          >
            <BusFacilitiesPanel facilities={bus.busFacilities} />
          </div>
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #f3f4f6",
            padding: "14px 16px",
            background: "#fdfdfd",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                {bus.seatsAvailable} seat{bus.seatsAvailable !== 1 ? "s" : ""}{" "}
                available
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>
                Tap to select/deselect
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {legendItems.map(({ status, label }) => (
                <LegendItem
                  key={status}
                  status={status}
                  label={label}
                  isSleeper={busHasSleeper}
                />
              ))}
            </div>
          </div>

          {priceTiers.length > 0 && seatLayoutLoaded && (
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              {["All", ...priceTiers].map((tier) => (
                <div
                  key={tier}
                  onClick={() => setActivePrice(tier)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                    userSelect: "none",
                    border:
                      activePrice === tier
                        ? `1.5px solid ${GREEN}`
                        : "1.5px solid #e5e7eb",
                    background: activePrice === tier ? GREEN : "#fff",
                    color: activePrice === tier ? "#fff" : "#374151",
                    fontSize: 13,
                    fontWeight: 500,
                    transition: "all 0.15s",
                  }}
                >
                  {tier === "All" ? "All" : `₹${tier}`}
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div
              ref={seatMapRef}
              style={{ flex: "0 0 60%", minWidth: 280, overflowX: "auto" }}
            >
              {fetchStarted && !seatLayoutLoaded ? (
                <SeatMapSkeleton />
              ) : seatLayoutLoaded && filteredSeats ? (
                <RealSeatMap
                  seats={filteredSeats}
                  selectedSeatNames={selectedSeatNames}
                  onSeatToggle={handleSeatToggle}
                />
              ) : seatLayoutLoaded ? (
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: 13,
                    padding: "24px 16px",
                  }}
                >
                  Could not load seat layout.
                </div>
              ) : null}
            </div>

            <div
              style={{
                width: 1,
                background: "#f0f0f0",
                flexShrink: 0,
                alignSelf: "stretch",
                minHeight: 20,
              }}
            />

            <div
              style={{
                flex: "1 1 200px",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                height: seatMapHeight ? seatMapHeight : "auto",
                maxHeight: seatMapHeight ? seatMapHeight : "none",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#d1d5db transparent",
              }}
            >
              <div style={{ flex: 1 }}>
                {fetchStarted && !seatLayoutLoaded ? (
                  <BoardingPointsSkeleton />
                ) : (
                  <BoardingDroppingFlow
                    boardingPoints={apiBoardingPoints}
                    droppingPoints={apiDroppingPoints}
                    selectedBoardingPoint={selectedBoardingPoint}
                    selectedDroppingPoint={selectedDroppingPoint}
                    onSelectBoarding={setSelectedBoardingPoint}
                    onSelectDropping={setSelectedDroppingPoint}
                  />
                )}
              </div>
              {!seatLoading && seatLayoutLoaded && (
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 14,
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        Seat Selected:
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#111",
                          wordBreak: "break-all",
                        }}
                      >
                        {selectedSeatNames.length > 0
                          ? selectedSeatNames.join(", ")
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        Base Fare:
                      </div>
                      <div
                        style={{ fontSize: 13, fontWeight: 600, color: "#111" }}
                      >
                        {totalFare > 0
                          ? `₹${totalFare.toLocaleString("en-IN")}`
                          : "—"}
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={!canContinue}
                    onClick={() => {
                      const uObjs = selectedSeatObjects.filter(
                        (s, i, a) =>
                          a.findIndex((x) => x.SeatName === s.SeatName) === i,
                      );
                      navigate("/buses/passenger-details", {
                        state: {
                          bus,
                          selectedSeatObjects: uObjs,
                          selectedSeatNames: [...new Set(selectedSeatNames)],
                          selectedBoardingPoint,
                          selectedDroppingPoint,
                        },
                      });
                    }}
                    style={{
                      background: canContinue ? GREEN : "#e5e7eb",
                      color: canContinue ? "#fff" : "#9ca3af",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 0",
                      width: "100%",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: canContinue ? "pointer" : "not-allowed",
                      transition: "background 0.2s",
                    }}
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterContent = ({ filters, setFilters, buses, priceRange }) => {
  const operatorList = useMemo(
    () => [...new Set(buses.map((b) => b.operatorName).filter(Boolean))].sort(),
    [buses],
  );
  const boardingPointList = useMemo(
    () =>
      [
        ...new Set(
          buses.flatMap((b) =>
            (b.boardingPoints || []).map((p) => p.name).filter(Boolean),
          ),
        ),
      ].sort(),
    [buses],
  );
  const droppingPointList = useMemo(
    () =>
      [
        ...new Set(
          buses.flatMap((b) =>
            (b.droppingPoints || []).map((p) => p.name).filter(Boolean),
          ),
        ),
      ].sort(),
    [buses],
  );

  const [operatorSearch, setOperatorSearch] = useState("");
  const [showAllOps, setShowAllOps] = useState(false);
  const [boardingSearch, setBoardingSearch] = useState("");
  const [showAllBoarding, setShowAllBoarding] = useState(false);
  const [droppingSearch, setDroppingSearch] = useState("");
  const [showAllDropping, setShowAllDropping] = useState(false);

  const filteredOps = operatorList.filter((op) =>
    op.toLowerCase().includes(operatorSearch.toLowerCase()),
  );
  const visibleOps = showAllOps ? filteredOps : filteredOps.slice(0, 5);

  const filteredBoardingPoints = boardingPointList.filter((pt) =>
    pt.toLowerCase().includes(boardingSearch.toLowerCase()),
  );
  const visibleBoardingPoints = showAllBoarding
    ? filteredBoardingPoints
    : filteredBoardingPoints.slice(0, 5);

  const filteredDroppingPoints = droppingPointList.filter((pt) =>
    pt.toLowerCase().includes(droppingSearch.toLowerCase()),
  );
  const visibleDroppingPoints = showAllDropping
    ? filteredDroppingPoints
    : filteredDroppingPoints.slice(0, 5);

  const toggle = (cat, key) =>
    setFilters((f) => ({ ...f, [cat]: { ...f[cat], [key]: !f[cat][key] } }));
  const toggleOp = (op) =>
    setFilters((f) => ({
      ...f,
      operators: f.operators.includes(op)
        ? f.operators.filter((x) => x !== op)
        : [...f.operators, op],
    }));
  const toggleBoardingPoint = (pt) =>
    setFilters((f) => ({
      ...f,
      boardingPoints: f.boardingPoints.includes(pt)
        ? f.boardingPoints.filter((x) => x !== pt)
        : [...f.boardingPoints, pt],
    }));
  const toggleDroppingPoint = (pt) =>
    setFilters((f) => ({
      ...f,
      droppingPoints: f.droppingPoints.includes(pt)
        ? f.droppingPoints.filter((x) => x !== pt)
        : [...f.droppingPoints, pt],
    }));
  const clearAll = () =>
    setFilters({
      depSlots: { slot1: false, slot2: false, slot3: false, slot4: false },
      busTypes: { ac: false, nonAc: false, seater: false, sleeper: false },
      operators: [],
      boardingPoints: [],
      droppingPoints: [],
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minSeats: 0,
      search: "",
    });

  const hasActive =
    Object.values(filters.depSlots).some(Boolean) ||
    Object.values(filters.busTypes).some(Boolean) ||
    filters.operators.length > 0 ||
    filters.boardingPoints.length > 0 ||
    filters.droppingPoints.length > 0 ||
    filters.minSeats > 0 ||
    filters.search !== "" ||
    filters.minPrice > priceRange.min ||
    filters.maxPrice < priceRange.max;

  const timeSlots = [
    { key: "slot1", label: "12AM – 6AM", icon: "/morning.svg" },
    { key: "slot2", label: "6AM – 12PM", icon: "/afternoon.svg" },
    { key: "slot3", label: "12PM – 6PM", icon: "/evening.svg" },
    { key: "slot4", label: "6PM – 12AM", icon: "/night.svg " },
  ];

  const busTypeButtons = [
    { key: "ac", label: "AC", img: "/ac.svg" },
    { key: "nonAc", label: "Non AC", img: "/non_ac.svg" },
    { key: "seater", label: "Seater", img: "/seater.svg" },
    { key: "sleeper", label: "Sleeper", img: "/sleeper.svg" },
  ];

  const Divider = () => (
    <div style={{ height: 1, background: "#f3f4f6", margin: "14px 0" }} />
  );
  const SectionTitle = ({ children }) => (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        fontFamily: "Inter, sans-serif",
        color: "#111",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );

  return (
    <div style={{ padding: "0 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
          Filters
        </span>
        {hasActive && (
          <span
            onClick={clearAll}
            style={{
              color: GREEN,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              background: GREEN_LIGHT,
              border: `1px solid ${GREEN_BORDER}`,
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            Clear all
          </span>
        )}
      </div>

      <SectionTitle>Search Bus</SectionTitle>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "7px 10px",
          background: "#fff",
          marginBottom: 14,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by bus or operator name..."
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
          style={{
            border: "none",
            outline: "none",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
            color: "#111",
            width: "100%",
            background: "transparent",
          }}
        />
        {filters.search && (
          <span
            onClick={() => setFilters((f) => ({ ...f, search: "" }))}
            style={{
              cursor: "pointer",
              color: "#9ca3af",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ×
          </span>
        )}
      </div>

      <Divider />

      <SectionTitle>Price Range</SectionTitle>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
            color: "#6b7280",
            fontWeight: 600,
          }}
        >
          ₹{filters.minPrice}
        </span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
            color: "#6b7280",
            fontWeight: 600,
          }}
        >
          ₹{filters.maxPrice}
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 20,
          display: "flex",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 4,
            background: "#e5e7eb",
            fontFamily: "Inter, sans-serif",
            borderRadius: 2,
          }}
        />
        {(() => {
          const range = priceRange.max - priceRange.min || 1;
          const leftPct = Math.min(
            100,
            Math.max(0, ((filters.minPrice - priceRange.min) / range) * 100)
          );
          const rightPct = Math.min(
            100,
            Math.max(0, 100 - ((filters.maxPrice - priceRange.min) / range) * 100)
          );
          return (
            <div
              style={{
                position: "absolute",
                left: `${leftPct}%`,
                right: `${rightPct}%`,
                height: 4,
                background: GREEN,
                borderRadius: 2,
              }}
            />
          );
        })()}
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          value={filters.minPrice}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < filters.maxPrice)
              setFilters((f) => ({ ...f, minPrice: v }));
          }}
          style={{
            position: "absolute",
            width: "100%",
            opacity: 0,
            cursor: "pointer",
            height: 20,
            zIndex: 2,
          }}
        />
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          value={filters.maxPrice}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > filters.minPrice)
              setFilters((f) => ({ ...f, maxPrice: v }));
          }}
          style={{
            position: "absolute",
            width: "100%",
            opacity: 0,
            cursor: "pointer",
            height: 20,
            zIndex: 2,
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["minPrice", "maxPrice"].map((key) => (
          <div key={key} style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 10,
                fontFamily: "Inter, sans-serif",
                color: "#9ca3af",
                marginBottom: 3,
              }}
            >
              {key === "minPrice" ? "Min" : "Max"}
            </div>
            <input
              type="number"
              value={filters[key]}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (
                  key === "minPrice" &&
                  v >= priceRange.min &&
                  v < filters.maxPrice
                )
                  setFilters((f) => ({ ...f, minPrice: v }));
                if (
                  key === "maxPrice" &&
                  v <= priceRange.max &&
                  v > filters.minPrice
                )
                  setFilters((f) => ({ ...f, maxPrice: v }));
              }}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "4px 6px",
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
                color: "#111",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>

      <Divider />

      <SectionTitle>Departure Time</SectionTitle>
      {timeSlots.map((slot) => (
        <label
          key={slot.key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 0",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={filters.depSlots[slot.key]}
            onChange={() => toggle("depSlots", slot.key)}
            style={{ accentColor: GREEN, width: 14, height: 14, flexShrink: 0 }}
          />
          <img
            src={slot.icon}
            alt={slot.label}
            style={{ width: 18, height: 18, flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, color: "#374151" }}>{slot.label}</span>
        </label>
      ))}

      <Divider />

      <SectionTitle>Bus Type</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {busTypeButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => toggle("busTypes", btn.key)}
            style={{
              width: 88,
              height: 56,
              border: filters.busTypes[btn.key]
                ? `1.5px solid ${GREEN}`
                : "1px solid #E3E8EE",
              borderRadius: 8,
              paddingTop: 8,
              paddingRight: 16,
              paddingLeft: 16,
              paddingBottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              cursor: "pointer",
              background: filters.busTypes[btn.key] ? GREEN_LIGHT : "#fff",
              transition: "all 0.15s",
              opacity: 1,
            }}
          >
            <img
              src={btn.img}
              alt={btn.label}
              style={{ width: 20, height: 20 }}
            />
            <span
              style={{
                fontSize: 11,
                color: filters.busTypes[btn.key] ? GREEN : "#374151",
                fontWeight: filters.busTypes[btn.key] ? 700 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {btn.label}
            </span>
          </button>
        ))}
      </div>

      <Divider />

      <SectionTitle>Boarding Point</SectionTitle>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "7px 10px",
          marginBottom: 8,
          background: "#fff",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search Boarding Point"
          value={boardingSearch}
          onChange={(e) => setBoardingSearch(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
            color: "#111",
            width: "100%",
            background: "transparent",
          }}
        />
      </div>
      {visibleBoardingPoints.length > 0 ? (
        visibleBoardingPoints.map((pt) => (
          <label
            key={pt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 0",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={filters.boardingPoints.includes(pt)}
              onChange={() => toggleBoardingPoint(pt)}
              style={{
                accentColor: GREEN,
                width: 13,
                height: 13,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "#374151",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pt}
            </span>
          </label>
        ))
      ) : (
        <div style={{ fontSize: 12, color: "#9ca3af", padding: "2px 0 4px" }}>
          No boarding points found
        </div>
      )}
      {filteredBoardingPoints.length > 5 && (
        <span
          onClick={() => setShowAllBoarding((v) => !v)}
          style={{
            color: GREEN,
            fontSize: 12,
            cursor: "pointer",
            marginTop: 6,
            marginBottom: 8,
            display: "block",
            fontWeight: 600,
          }}
        >
          {showAllBoarding
            ? "− Show less"
            : `+ Show all boarding points (${filteredBoardingPoints.length})`}
        </span>
      )}

      <Divider />

      <SectionTitle>Dropping Point</SectionTitle>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "7px 10px",
          marginBottom: 8,
          background: "#fff",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search Dropping Point"
          value={droppingSearch}
          onChange={(e) => setDroppingSearch(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
            color: "#111",
            width: "100%",
            background: "transparent",
          }}
        />
      </div>
      {visibleDroppingPoints.length > 0 ? (
        visibleDroppingPoints.map((pt) => (
          <label
            key={pt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 0",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={filters.droppingPoints.includes(pt)}
              onChange={() => toggleDroppingPoint(pt)}
              style={{
                accentColor: GREEN,
                width: 13,
                height: 13,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "#374151",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pt}
            </span>
          </label>
        ))
      ) : (
        <div style={{ fontSize: 12, color: "#9ca3af", padding: "2px 0 4px" }}>
          No dropping points found
        </div>
      )}
      {filteredDroppingPoints.length > 5 && (
        <span
          onClick={() => setShowAllDropping((v) => !v)}
          style={{
            color: GREEN,
            fontSize: 12,
            cursor: "pointer",
            marginTop: 6,
            marginBottom: 8,
            display: "block",
            fontWeight: 600,
          }}
        >
          {showAllDropping
            ? "− Show less"
            : `+ Show all dropping points (${filteredDroppingPoints.length})`}
        </span>
      )}

      <Divider />

      <SectionTitle>Min Seats Available</SectionTitle>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 14,
          fontFamily: "Inter",
        }}
      >
        {[0, 5, 10, 20].map((n) => (
          <button
            key={n}
            onClick={() => setFilters((f) => ({ ...f, minSeats: n }))}
            style={{
              flex: 1,
              padding: "5px 0",
              borderRadius: 6,
              border:
                filters.minSeats === n
                  ? `1.5px solid ${GREEN}`
                  : "1px solid #e5e7eb",
              background: filters.minSeats === n ? GREEN_LIGHT : "#fff",
              color: filters.minSeats === n ? GREEN : "#6b7280",
              fontSize: 12,
              fontWeight: filters.minSeats === n ? 700 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {n === 0 ? "Any" : `${n}+`}
          </button>
        ))}
      </div>

      {operatorList.length > 0 && (
        <>
          <Divider />
          <SectionTitle>Operator</SectionTitle>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "7px 10px",
              marginBottom: 8,
              background: "#fff",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search operator..."
              value={operatorSearch}
              onChange={(e) => setOperatorSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
                color: "#111",
                width: "100%",
                background: "transparent",
              }}
            />
          </div>
          {visibleOps.map((op) => (
            <label
              key={op}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 0",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={filters.operators.includes(op)}
                onChange={() => toggleOp(op)}
                style={{
                  accentColor: GREEN,
                  width: 13,
                  height: 13,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: "#374151",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {op}
              </span>
            </label>
          ))}
          {filteredOps.length > 5 && (
            <span
              onClick={() => setShowAllOps((v) => !v)}
              style={{
                color: GREEN,
                fontSize: 12,
                cursor: "pointer",
                marginTop: 6,
                display: "block",
                fontWeight: 600,
              }}
            >
              {showAllOps
                ? "− Show less"
                : `+ Show all (${filteredOps.length})`}
            </span>
          )}
        </>
      )}
    </div>
  );
};

function getDepartureHour(bus) {
  const [h] = (bus.departureTime || "").split(":").map(Number);
  return isNaN(h) ? 0 : h;
}

function busMatchesType(bus, filters) {
  const bt = (bus.busType || "").toLowerCase();
  const { ac, nonAc, seater, sleeper } = filters.busTypes;
  if (!ac && !nonAc && !seater && !sleeper) return true;
  const isAC = bt.includes("a/c") || (bt.includes("ac") && !bt.includes("non"));
  const isNonAC = bt.includes("non");
  const isSleeper = bt.includes("sleeper");
  const isSeater = bt.includes("seater") || bt.includes("semi");
  if (ac && isAC) return true;
  if (nonAc && isNonAC) return true;
  if (sleeper && isSleeper) return true;
  if (seater && isSeater) return true;
  return false;
}

const BusSeatSelection = ({ buses = [], from = "", to = "" }) => {
  injectGlobalStyles();

  const priceRange = useMemo(() => {
    if (!buses.length) return { min: 0, max: 5000 };
    const prices = buses.map((b) => b.price || 0);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [buses]);

  const [filters, setFilters] = useState({
    depSlots: { slot1: false, slot2: false, slot3: false, slot4: false },
    busTypes: { ac: false, nonAc: false, seater: false, sleeper: false },
    operators: [],
    boardingPoints: [],
    droppingPoints: [],
    minPrice: 0,
    maxPrice: 99999,
    minSeats: 0,
    search: "",
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setFilters((f) => ({
      ...f,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    }));
  }, [priceRange.min, priceRange.max]);

  useEffect(() => {
    document.body.style.overflow = mobileFilterOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilterOpen]);

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchesOperator = (bus.operatorName || "")
          .toLowerCase()
          .includes(term);
        const matchesBusType = (bus.busType || "").toLowerCase().includes(term);
        if (!matchesOperator && !matchesBusType) return false;
      }
      if (bus.price < filters.minPrice || bus.price > filters.maxPrice)
        return false;
      if (!busMatchesType(bus, filters)) return false;
      if (filters.minSeats > 0 && (bus.seatsAvailable || 0) < filters.minSeats)
        return false;
      if (Object.values(filters.depSlots).some(Boolean)) {
        const h = getDepartureHour(bus);
        const { slot1, slot2, slot3, slot4 } = filters.depSlots;
        if (
          !(
            (slot1 && h < 6) ||
            (slot2 && h >= 6 && h < 12) ||
            (slot3 && h >= 12 && h < 18) ||
            (slot4 && h >= 18)
          )
        )
          return false;
      }
      if (
        filters.operators.length > 0 &&
        !filters.operators.includes(bus.operatorName)
      )
        return false;
      if (
        filters.boardingPoints.length > 0 &&
        !(bus.boardingPoints || []).some((p) =>
          filters.boardingPoints.includes(p.name),
        )
      )
        return false;
      if (
        filters.droppingPoints.length > 0 &&
        !(bus.droppingPoints || []).some((p) =>
          filters.droppingPoints.includes(p.name),
        )
      )
        return false;
      return true;
    });
  }, [buses, filters]);

  const activeFilterCount = [
    Object.values(filters.depSlots).some(Boolean),
    Object.values(filters.busTypes).some(Boolean),
    filters.operators.length > 0,
    filters.boardingPoints.length > 0,
    filters.droppingPoints.length > 0,
    filters.minSeats > 0,
    filters.search !== "",
    filters.minPrice > priceRange.min || filters.maxPrice < priceRange.max,
  ].filter(Boolean).length;

  return (
    <>
      <div className="bss-layout">
        <div className="bss-left">
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              paddingTop: 16,
              paddingBottom: 16,
            }}
          >
            <FilterContent
              filters={filters}
              setFilters={setFilters}
              buses={buses}
              priceRange={priceRange}
            />
          </div>
        </div>

        <div className="bss-right">
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
              {from && to ? `${from} → ${to}` : "Available Buses"}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {filteredBuses.length} of {buses.length} buses
              {filteredBuses.length !== buses.length && (
                <span style={{ marginLeft: 6, color: GREEN, fontWeight: 600 }}>
                  (filtered)
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredBuses.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "64px 0",
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div
                  style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}
                >
                  No buses match your filters
                </div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>
                  Try adjusting or clearing your filters
                </div>
              </div>
            ) : (
              filteredBuses.map((bus, i) => (
                <BusCardExpanded
                  key={bus.id ?? i}
                  bus={bus}
                  from={from}
                  to={to}
                />
              ))
            )}
          </div>

          {filteredBuses.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px 0",
                gap: 12,
              }}
            >
              <div style={{ height: 1, width: 50, background: "#e5e7eb" }} />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                All buses loaded
              </span>
              <div style={{ height: 1, width: 50, background: "#e5e7eb" }} />
            </div>
          )}
        </div>
      </div>

      <button
        className="bss-filter-fab"
        onClick={() => setMobileFilterOpen(true)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span
            style={{
              background: "#fff",
              color: GREEN,
              borderRadius: "50%",
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              marginLeft: 2,
            }}
          >
            {activeFilterCount}
          </span>
        )}
      </button>

      {mobileFilterOpen && (
        <>
          <div
            className="bss-mobile-backdrop"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="bss-mobile-sheet">
            <div
              style={{
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 10,
                borderBottom: "1px solid #f3f4f6",
                padding: "12px 20px 12px",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: "#e5e7eb",
                  borderRadius: 2,
                  margin: "0 auto 12px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
                  Filters
                </span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {activeFilterCount > 0 && (
                    <span
                      onClick={() =>
                        setFilters({
                          depSlots: {
                            slot1: false,
                            slot2: false,
                            slot3: false,
                            slot4: false,
                          },
                          busTypes: {
                            ac: false,
                            nonAc: false,
                            seater: false,
                            sleeper: false,
                          },
                          operators: [],
                          boardingPoints: [],
                          droppingPoints: [],
                          minPrice: priceRange.min,
                          maxPrice: priceRange.max,
                          minSeats: 0,
                          search: "",
                        })
                      }
                      style={{
                        color: GREEN,
                        fontSize: 13,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Clear all
                    </span>
                  )}
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    style={{
                      background: "#f3f4f6",
                      border: "none",
                      borderRadius: 8,
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div style={{ padding: "16px 4px 0" }}>
              <FilterContent
                filters={filters}
                setFilters={setFilters}
                buses={buses}
                priceRange={priceRange}
              />
            </div>
            <div
              style={{
                position: "sticky",
                bottom: 0,
                background: "#fff",
                padding: "12px 20px",
                borderTop: "1px solid #f3f4f6",
              }}
            >
              <button
                onClick={() => setMobileFilterOpen(false)}
                style={{
                  width: "100%",
                  background: GREEN,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  height: 48,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Show {filteredBuses.length} buses
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BusSeatSelection;
