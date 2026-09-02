// src/components/HitCounter.js
import React, { useState, useEffect } from "react";

// Use a unique namespace & key for your site
const NAMESPACE = "dealplex-web-app";
const KEY = "total-visits";

export default function HitCounter() {
  const [hits, setHits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionKey = `counted_${NAMESPACE}_${KEY}`;
    const alreadyVisited = sessionStorage.getItem(sessionKey);

    if (!alreadyVisited) {
      // First visit in this tab session: Increment total count
      fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`)
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.value === "number") {
            setHits(data.value);
            sessionStorage.setItem(sessionKey, "true");
          } else {
            fetchCountOnly();
          }
        })
        .catch(() => fetchCountOnly())
        .finally(() => setLoading(false));
    } else {
      // Tab reloaded: Read total count without incrementing
      fetchCountOnly();
    }
  }, []);

  const fetchCountOnly = () => {
    fetch(`https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.value === "number") {
          setHits(data.value);
        }
      })
      .catch((err) => {
        console.error("Counter API Error:", err);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={styles.badge}>
      <span style={styles.label}>TOTAL VISITS</span>
      <span style={styles.count}>
        {loading ? "..." : (hits ?? 0).toLocaleString()}
      </span>
    </div>
  );
}

const styles = {
  badge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: "6px 14px",
    borderRadius: "20px",
    fontFamily: "monospace",
    border: "1px solid #334155",
  },
  label: {
    fontSize: "11px",
    color: "#94a3b8",
    marginRight: "8px",
    letterSpacing: "0.5px",
  },
  count: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#38bdf8",
  },
};