import React, { useState, useRef, useEffect } from "react";

const GREEN = "#16a34a";

const AGE_OPTIONS = [
  { value: "", label: "Select age" },
  { value: "0", label: "Under 1 year" },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} year${i + 1 > 1 ? "s" : ""}`,
  })),
];

function CounterRow({ icon, label, subLabel, value, onInc, onDec, min = 0 }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20, color: "#9ca3af" }}>{icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
            {label}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
            {subLabel}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onDec}
          disabled={value <= min}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: `1.5px solid ${value <= min ? "#e5e7eb" : GREEN}`,
            background: "transparent",
            color: value <= min ? "#d1d5db" : GREEN,
            fontSize: 18,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: value <= min ? "not-allowed" : "pointer",
            padding: 0,
            transition: "all 0.15s",
          }}
        >
          −
        </button>

        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "#111827",
            minWidth: 18,
            textAlign: "center",
          }}
        >
          {value}
        </span>

        <button
          onClick={onInc}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: `1.5px solid ${GREEN}`,
            background: "transparent",
            color: GREEN,
            fontSize: 18,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.15s",
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

function RoomsGuestDropdown({ open, onClose, anchorEl, onDone }) {
  // ✅ Defaults: 1 room, 1 adult, 0 children
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState([]);

  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      setPosition({
        top: rect.bottom + scrollY + 8,
        left: rect.left + scrollX,
      });
    }
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorEl &&
        !anchorEl.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose, anchorEl]);

  const handleChildrenChange = (delta) => {
    const next = Math.max(0, children + delta);
    setChildren(next);
    setChildAges((prev) => {
      if (delta > 0) return [...prev, ""];
      return prev.slice(0, next);
    });
  };

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        background: "#ffffff",
        border: "1px solid #f3f4f6",
        borderRadius: 16,
        boxShadow: "0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
        padding: "8px 20px 16px",
        minWidth: 300,
        width: 320,
      }}
    >
      <CounterRow
        icon={
          <img src="/rooms.svg" alt="Rooms" style={{ width: 24, height: 24 }} />
        }
        label="Rooms"
        subLabel="Minimum 1"
        value={rooms}
        min={1}
        onInc={() => setRooms((r) => r + 1)}
        onDec={() => setRooms((r) => Math.max(1, r - 1))}
      />

      <CounterRow
        icon={
          <img
            src="/adults.svg"
            alt="Adults"
            style={{ width: 24, height: 24 }}
          />
        }
        label="Adults"
        subLabel="13 years & above"
        value={adults}
        min={1}
        onInc={() => setAdults((a) => a + 1)}
        onDec={() => setAdults((a) => Math.max(1, a - 1))}
      />

      <CounterRow
        icon={
          <img
            src="/children.svg"
            alt="Children"
            style={{ width: 24, height: 24 }}
          />
        }
        label="Children"
        subLabel="0-12 years"
        value={children}
        min={0}
        onInc={() => handleChildrenChange(1)}
        onDec={() => handleChildrenChange(-1)}
      />

      {children > 0 && (
        <div style={{ marginTop: 8 }}>
          {Array.from({ length: children }, (_, i) => (
            <div key={i} style={{ marginTop: 12 }}>
              <div
                style={{
                  fontSize: 13,
                  color: "#374151",
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                Select age of child {i + 1}
              </div>
              <div style={{ position: "relative" }}>
                <select
                  value={childAges[i] ?? ""}
                  onChange={(e) => {
                    const updated = [...childAges];
                    updated[i] = e.target.value;
                    setChildAges(updated);
                  }}
                  style={{
                    width: "100%",
                    padding: "9px 36px 9px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 14,
                    color: childAges[i] ? "#111827" : "#9ca3af",
                    background: "#ffffff",
                    appearance: "none",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {AGE_OPTIONS.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.value === ""}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#9ca3af",
                    fontSize: 16,
                  }}
                >
                  ▾
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          const label = `${rooms} Room${rooms > 1 ? "s" : ""}, ${adults} Adult${
            adults > 1 ? "s" : ""
          }${
            children > 0
              ? `, ${children} Child${children > 1 ? "ren" : ""}`
              : ""
          }`;
          onDone?.(label, { rooms, adults, children, childAges });
        }}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "10px",
          background: GREEN,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Done
      </button>
    </div>
  );
}

export default RoomsGuestDropdown;
