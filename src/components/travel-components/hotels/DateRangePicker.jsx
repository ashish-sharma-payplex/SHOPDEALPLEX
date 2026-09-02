import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, IconButton, Paper } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const GREEN = "#16a34a";
const GREEN_LIGHT = "#dcfce7";
const GREEN_RANGE = "#bbf7d0";

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}
function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isInRange(day, start, end) {
  if (!start || !end || !day) return false;
  const s = start < end ? start : end;
  const e = start < end ? end : start;
  return day > s && day < e;
}

function MonthGrid({
  year,
  month,
  startDate,
  endDate,
  hoverDate,
  onDayClick,
  onDayHover,
  today,
  onPrev,
  onNext,
  showPrev,
  calendarSide,
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <Box sx={{ minWidth: { xs: "100%", md: 260 } }}>
      {/* ✅ Month header with arrows inline */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <IconButton
          onClick={onPrev}
          disabled={!showPrev}
          size="small"
          sx={{
            width: 28,
            height: 28,
            color: showPrev ? "#6b7280" : "#d1d5db",
            "&:hover": showPrev ? { bgcolor: "#f9fafb", color: "#111" } : {},
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Typography
          sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}
        >
          {MONTH_NAMES[month]} {year}
        </Typography>

        <IconButton
          onClick={onNext}
          size="small"
          sx={{
            width: 28,
            height: 28,
            color: "#6b7280",
            "&:hover": { bgcolor: "#f9fafb", color: "#111" },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Day labels */}
      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.5 }}
      >
        {DAY_LABELS.map((d) => (
          <Typography
            key={d}
            sx={{
              textAlign: "center",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#9ca3af",
              py: 0.5,
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Day cells */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {cells.map((date, idx) => {
          if (!date) return <Box key={`empty-${idx}`} />;

          const isStart = isSameDay(date, startDate);
          const isEnd = isSameDay(date, endDate);
          const isToday = isSameDay(date, today);
          const inRange = isInRange(date, startDate, endDate);

          const isRangeStart =
            isStart && endDate && !isSameDay(startDate, endDate);
          const isRangeEnd =
            isEnd && startDate && !isSameDay(startDate, endDate);
          const inHoverRange =
            startDate &&
            !endDate &&
            hoverDate &&
            isInRange(date, startDate, hoverDate);
          const isHoverEnd =
            !endDate &&
            isSameDay(date, hoverDate) &&
            startDate &&
            !isSameDay(startDate, hoverDate);
          const isHoverStart =
            isStart &&
            !endDate &&
            hoverDate &&
            !isSameDay(startDate, hoverDate);

          let cellBg = "transparent";
          if (inRange) cellBg = GREEN_RANGE;
          if (isRangeStart)
            cellBg = `linear-gradient(to right, transparent 50%, ${GREEN_RANGE} 50%)`;
          if (isRangeEnd)
            cellBg = `linear-gradient(to left, transparent 50%, ${GREEN_RANGE} 50%)`;
          if (!endDate && inHoverRange) cellBg = GREEN_LIGHT;
          if (isHoverStart)
            cellBg = `linear-gradient(to right, transparent 50%, ${GREEN_LIGHT} 50%)`;
          if (isHoverEnd)
            cellBg = `linear-gradient(to left, transparent 50%, ${GREEN_LIGHT} 50%)`;

          const isPast = date < today && !isToday;

          return (
            <Box
              key={date.toISOString()}
              sx={{
                background: cellBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                onClick={() => !isPast && onDayClick(date, calendarSide)}
                onMouseEnter={() => !isPast && onDayHover(date)}
                onMouseLeave={() => onDayHover(null)}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isPast ? "default" : "pointer",
                  bgcolor: isStart || isEnd ? GREEN : "transparent",
                  my: 0.3,
                  transition: "background 0.12s, transform 0.1s",
                  "&:hover": !isPast
                    ? {
                        bgcolor: isStart || isEnd ? GREEN : "#f0fdf4",
                        transform: "scale(1.08)",
                      }
                    : {},
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: isStart || isEnd || isToday ? 700 : 400,
                    color:
                      isStart || isEnd
                        ? "#fff"
                        : isPast
                        ? "#d1d5db"
                        : isToday
                        ? GREEN
                        : "#111827",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  {date.getDate()}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function DateRangePicker({
  anchorEl,
  open,
  onClose,
  startDate,
  endDate,
  onChange,
  activeField,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [checkInMonth, setCheckInMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [checkOutMonth, setCheckOutMonth] = useState(() => {
    let m = today.getMonth() + 1;
    let y = today.getFullYear();
    if (m > 11) {
      m = 0;
      y++;
    }
    return { year: y, month: m };
  });

  const [hoverDate, setHoverDate] = useState(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // ✅ Auto-select today & tomorrow only if no date selected yet
  useEffect(() => {
    if (open && !startDate && !endDate) {
      onChange(today, tomorrow);
    }
  }, [open]);

  // ✅ Position + reset months
  useEffect(() => {
    if (open && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      setPos({ top: rect.bottom + scrollY + 8, left: rect.left + scrollX });

      setCheckInMonth({ year: today.getFullYear(), month: today.getMonth() });
      const nm = today.getMonth() + 1 > 11 ? 0 : today.getMonth() + 1;
      const ny =
        today.getMonth() + 1 > 11
          ? today.getFullYear() + 1
          : today.getFullYear();
      setCheckOutMonth({ year: ny, month: nm });
    }
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) return;

    const handleScroll = () => {
      onClose();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open, onClose]);

  // ✅ Outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      const popup = document.getElementById("drp-popup");
      if (
        anchorEl &&
        !anchorEl.contains(e.target) &&
        popup &&
        !popup.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose, anchorEl]);

  // ✅ Check In navigation — prev only if not at current month
  const checkInCanGoPrev =
    checkInMonth.year > today.getFullYear() ||
    (checkInMonth.year === today.getFullYear() &&
      checkInMonth.month > today.getMonth());

  const goCheckInPrev = () => {
    if (!checkInCanGoPrev) return;
    setCheckInMonth((prev) => {
      let m = prev.month - 1;
      let y = prev.year;
      if (m < 0) {
        m = 11;
        y--;
      }
      // Don't go before current month
      if (
        y < today.getFullYear() ||
        (y === today.getFullYear() && m < today.getMonth())
      ) {
        return { year: today.getFullYear(), month: today.getMonth() };
      }
      return { year: y, month: m };
    });
  };

  const goCheckInNext = () => {
    setCheckInMonth((prev) => {
      let m = prev.month + 1;
      let y = prev.year;
      if (m > 11) {
        m = 0;
        y++;
      }
      return { year: y, month: m };
    });
  };

  // ✅ Check Out navigation — prev only if not at current month
  const checkOutCanGoPrev =
    checkOutMonth.year > today.getFullYear() ||
    (checkOutMonth.year === today.getFullYear() &&
      checkOutMonth.month > today.getMonth());

  const goCheckOutPrev = () => {
    if (!checkOutCanGoPrev) return;
    setCheckOutMonth((prev) => {
      let m = prev.month - 1;
      let y = prev.year;
      if (m < 0) {
        m = 11;
        y--;
      }
      if (
        y < today.getFullYear() ||
        (y === today.getFullYear() && m < today.getMonth())
      ) {
        return { year: today.getFullYear(), month: today.getMonth() };
      }
      return { year: y, month: m };
    });
  };

  const goCheckOutNext = () => {
    setCheckOutMonth((prev) => {
      let m = prev.month + 1;
      let y = prev.year;
      if (m > 11) {
        m = 0;
        y++;
      }
      return { year: y, month: m };
    });
  };

  const handleDayClick = useCallback(
    (date, calendarSide) => {
      if (calendarSide === "checkin") {
        // Selecting Check-in
        if (!endDate || date >= endDate) {
          // Reset checkout to next day
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);

          onChange(date, nextDay);
        } else {
          onChange(date, endDate);
        }
      } else {
        // Selecting Check-out
        if (!startDate) {
          return;
        }

        // Don't allow checkout before checkin
        if (date <= startDate) {
          return;
        }

        onChange(startDate, date);
      }

      onClose();
    },
    [startDate, endDate, onChange, onClose],
  );
  if (!open) return null;

  return (
    <Paper
      id="drp-popup"
      elevation={0}
      sx={{
        position: "absolute",
        top: pos.top,
        left: { xs: 8, md: pos.left },
        right: { xs: 8, md: "auto" },
        zIndex: 9999,
        borderRadius: "16px",
        p: { xs: "20px 12px", md: "24px 28px" },
        boxShadow: "0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1px solid #f3f4f6",
        bgcolor: "#ffffff",
        width: { xs: "calc(100vw - 16px)", md: "auto" },
        minWidth: { md: 580 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 3, md: 4 },
        }}
      >
        {/* ✅ Check In Calendar */}
        <Box>
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              color: "#9ca3af",
              letterSpacing: "0.8px",
              mb: 1,
              textAlign: "center",
            }}
          >
            CHECK IN
          </Typography>
          <MonthGrid
            year={checkInMonth.year}
            month={checkInMonth.month}
            startDate={startDate}
            endDate={endDate}
            hoverDate={hoverDate}
            onDayClick={handleDayClick}
            onDayHover={setHoverDate}
            today={today}
            showPrev={checkInCanGoPrev}
            onPrev={goCheckInPrev}
            onNext={goCheckInNext}
            calendarSide="checkin"
          />
        </Box>

        {/* Divider */}
        <Box
          sx={{
            width: { md: "1px" },
            height: { xs: "1px", md: "auto" },
            bgcolor: "#e5e7eb",
            alignSelf: "stretch",
            mx: { md: 1 },
          }}
        />

        {/* ✅ Check Out Calendar */}
        <Box>
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#9ca3af",
              letterSpacing: "0.8px",
              mb: 1,
              textAlign: "center",
            }}
          >
            CHECK OUT
          </Typography>
          <MonthGrid
            year={checkOutMonth.year}
            month={checkOutMonth.month}
            startDate={startDate}
            endDate={endDate}
            hoverDate={hoverDate}
            onDayClick={handleDayClick}
            onDayHover={setHoverDate}
            today={today}
            showPrev={checkOutCanGoPrev}
            onPrev={goCheckOutPrev}
            onNext={goCheckOutNext}
            calendarSide="checkout"
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography sx={{ fontSize: "0.78rem", color: "#9ca3af" }}>
          {!startDate
            ? "Select check-in date"
            : !endDate
            ? "Now select check-out date"
            : `${startDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })} → ${endDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}`}
        </Typography>
      </Box>
    </Paper>
  );
}
