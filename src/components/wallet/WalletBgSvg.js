import React from "react";

const WalletBgSvg = () => {
  return (
    <svg
      preserveAspectRatio="none"
      viewBox="0 0 338 156"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    >
      <defs>
        {/* Green gradient */}
        <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1FA463" />
          <stop offset="100%" stopColor="#0B8B6B" />
        </linearGradient>
      </defs>

      {/* Flat card with rounded corners */}
      <rect
        x="0"
        y="0"
        width="338"
        height="156"
        rx="1"
        ry="1"
        fill="url(#cardGradient)"
      />

      {/* Decorative curved lines (same as image) */}
      <path
        d="M-40 110 C 20 80, 100 150, 180 115 S 320 60, 380 95"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M-50 95 C 10 65, 90 135, 170 100 S 310 45, 370 80"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M-60 80 C 0 50, 80 120, 160 85 S 300 30, 360 65"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
};

export default WalletBgSvg;
