// components/Map/InlineMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { t } from "i18next";

/**
 * InlineMap
 * Props:
 *  - center: { lat, lng } optional (if not provided, tries geolocation)
 *  - height: px height number
 *  - onSelect: function({ lat, lng, address })
 *
 * Note: requires Google Maps JS API loaded on page (window.google.maps)
 */
const InlineMap = ({ center, height = 240, onSelect }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    const init = async (ctr) => {
      if (!mounted) return;
      if (!window.google || !window.google.maps) {
        setStatusMsg(t("Google Maps is not loaded"));
        return;
      }

      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: ctr,
        zoom: 15,
        disableDefaultUI: true,
      });
      mapRef.current = map;

      // marker
      markerRef.current = new window.google.maps.Marker({
        map,
      });

      // click listener
      map.addListener("click", async (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        markerRef.current.setPosition({ lat, lng });

        // try reverse geocode
        let address = "";
        try {
          const geocoder = new window.google.maps.Geocoder();
          const results = await new Promise((resolve, reject) => {
            geocoder.geocode({ location: { lat, lng } }, (res, status) => {
              if (status === "OK") resolve(res);
              else reject(status);
            });
          });
          if (results && results.length) address = results[0].formatted_address;
        } catch (err) {
          // fallback
        }

        onSelect?.({ lat, lng, address });
      });

      // place an initial marker if center given
      markerRef.current.setPosition(ctr);
    };

    (async () => {
      if (center && center.lat && center.lng) {
        await init(center);
      } else {
        // try browser geolocation
        if (navigator.geolocation) {
          setStatusMsg(t("Locating..."));
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!mounted) return;
              const ctr = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setStatusMsg("");
              init(ctr);
            },
            () => {
              setStatusMsg(t("Unable to fetch location"));
              // fallback default center (0,0)
              init({ lat: 0, lng: 0 });
            },
            { timeout: 7000 }
          );
        } else {
          setStatusMsg(t("Geolocation not available"));
          init({ lat: 0, lng: 0 });
        }
      }
    })();

    return () => {
      mounted = false;
      if (mapRef.current) {
        // no explicit destroy required for google maps
        mapRef.current = null;
      }
    };
  }, [center, onSelect]);

  return (
    <Box sx={{ width: "100%", height: `${height}px`, position: "relative" }}>
      {statusMsg && (
        <Typography variant="caption" sx={{ position: "absolute", zIndex: 2, top: 8, left: 8 }}>
          {statusMsg}
        </Typography>
      )}
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%", borderRadius: 6, overflow: "hidden" }}
      />
    </Box>
  );
};

export default InlineMap;
