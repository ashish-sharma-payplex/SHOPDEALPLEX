import { useCitySearch } from "components/travel-hooks/hotels/useCitySearch";
import React, { useEffect, useRef, useState } from "react";

function LocationDropdown({ open, onClose, anchorEl, onSelect }) {
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const { query, setQuery, cities, loading } = useCitySearch();
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
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorEl &&
        !anchorEl.contains(e.target)
      )
        onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorEl]);

  // Position dropdown
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

  // Focus input
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorEl &&
        !anchorEl.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose, anchorEl]);

  // 👇 ADD THIS NEW useEffect HERE
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => {
      onClose();
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        width: 320,
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #f0f0f0",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        overflow: "hidden",
      }}
    >
      {/* Search Input */}
      <div style={{ padding: "14px 14px 10px" }}>
        <div style={{ position: "relative" }}>
          <svg
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city or hotel"
            value={query}
            // ✅ FIX — search bar pehle sirf spaces bhi accept kar leta tha
            // (query=" ", "  " etc. set ho jaata tha), jisse "Searching..."
            // / "No location found" jaisi behavior khali input par bhi
            // trigger hoti thi. Ab leading spaces ko hi type nahi hone
            // dete — isliye field kabhi bhi "sirf spaces" se compose nahi
            // ho sakta, jabki genuine city naam ke beech ke space (jaise
            // "New Delhi") bilkul normally type ho sakte hain.
            onChange={(e) => setQuery(e.target.value.replace(/^\s+/, ""))}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              outline: "none",
              fontSize: 14,
              color: "#111827",
              boxSizing: "border-box",
              background: "#fafafa",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>
      </div>

      {/* Near Me Row */}
      {/* <div
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", cursor: "pointer",
          borderBottom: "1px solid #f3f4f6",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          border: "1.5px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>Near me</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Properties near your current location</div>
        </div>
      </div> */}

      {/* Section Label */}
      <div
        style={{
          padding: "12px 16px 6px",
          fontSize: 13,
          fontWeight: 700,
          color: "#374151",
        }}
      >
        {query ? "Search Results" : "Popular Destinations"}
      </div>

      {/* Dynamic City List */}
      <div style={{ paddingBottom: 8, maxHeight: 280, overflowY: "auto" }}>
        {loading ? (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 14,
            }}
          >
            Searching...
          </div>
        ) : cities.length > 0 ? (
          cities.map((city, idx) => (
            <React.Fragment key={city.code}>
              <div
                onClick={() => {
                  onSelect(city);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "13px 16px",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span
                  style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}
                >
                  {city.name}
                </span>
              </div>
              {idx < cities.length - 1 && (
                <div
                  style={{ height: 1, background: "#f3f4f6", margin: "0 16px" }}
                />
              )}
            </React.Fragment>
          ))
        ) : (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 14,
            }}
          >
            No location found
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationDropdown;
