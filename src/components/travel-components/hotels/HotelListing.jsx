import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Slider,
  Checkbox,
  TextField,
  CircularProgress,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ENDPOINTS, hotelFetch } from "travel-api/hotelApi";

// ─── Leaflet icon fix ─────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const GREEN = "#16a34a";
const MAX_CITY_RADIUS_KM = 75;

const STAR_ROWS = [
  { key: "5", label: "5-star", count: 5 },
  { key: "4", label: "4-star", count: 4 },
  { key: "3", label: "3-star", count: 3 },
  { key: "2", label: "2-star", count: 2 },
  { key: "1", label: "1-star", count: 1 },
  { key: "0", label: "No rating", count: 0 },
];

const DEFAULT_FILTERS = {
  placeType: "Any type",
  priceRange: [2000, 25000],
  roomSizes: { small: false, medium: true, large: false },
  starRatings: { 5: true, 4: true, 3: true, 2: false, 1: false, 0: false },
};

const RATING_MAP = {
  FiveStar: 5,
  FourStar: 4,
  ThreeStar: 3,
  TwoStar: 2,
  OneStar: 1,
};

const deriveRatingRange = (starRatings) => {
  const checked = Object.entries(starRatings)
    .filter(([, v]) => v)
    .map(([k]) => Number(k));
  if (checked.length === 0) return { min_rating: 1 };
  const min = Math.min(...checked);
  const max = Math.max(...checked);
  return {
    min_rating: min,
    ...(max < 5 && { max_rating: max }),
  };
};

const hotelDotIcon = L.divIcon({
  className: "",
  html: `
    <div style="display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#dc2626">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

const myLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(37,99,235,0.25);animation:myloc-pulse 1.8s ease-out infinite;"></div>
      <div style="width:12px;height:12px;border-radius:50%;background:#2563eb;border:2.5px solid #fff;box-shadow:0 1px 6px rgba(37,99,235,0.6);position:relative;z-index:1;"></div>
    </div>
    <style>
      @keyframes myloc-pulse { 0%{transform:scale(0.5);opacity:1} 100%{transform:scale(2);opacity:0} }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Map helpers ──────────────────────────────
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], 11);
  }, [center?.lat, center?.lng]);
  return null;
}

function FlyToLocation({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15, { duration: 1.2 });
  }, [target?.ts]);
  return null;
}

function FitBoundsToHotels({ hotels }) {
  const map = useMap();
  useEffect(() => {
    if (!hotels || hotels.length === 0) return;
    const points = hotels
      .map((h) => {
        const lat = parseFloat(h?._raw?.Latitude ?? h?.Latitude ?? h?.latitude);
        const lng = parseFloat(
          h?._raw?.Longitude ?? h?.Longitude ?? h?.longitude,
        );
        return isNaN(lat) || isNaN(lng) ? null : [lat, lng];
      })
      .filter(Boolean);
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 14,
      animate: true,
      duration: 1,
    });
  }, [hotels]);
  return null;
}

function DraggableMarker({ position, setPosition }) {
  const markerRef = useRef(null);
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return (
    <Marker
      draggable
      position={position}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const m = markerRef.current;
          if (m) {
            const latlng = m.getLatLng();
            setPosition({ lat: latlng.lat, lng: latlng.lng });
          }
        },
      }}
    />
  );
}

// ─── Skeleton Card ────────────────────────────
const shimmerBg = {
  background:
    "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
  backgroundSize: "600px 100%",
  animation: "skeleton-shimmer 1.5s ease-in-out infinite", // ✅ CHANGED — pulse (blink) se shimmer (smooth sliding) pe switch kiya
};

const SkeletonCard = () => (
  <Box
    sx={{
      display: "flex",
      width: "100%",
      bgcolor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      p: "18px 22px",
      flexDirection: "column",
      gap: "12px",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Box
        sx={{
          width: 60,
          height: 14,
          borderRadius: 6,
          ...shimmerBg, // ✅ CHANGED
        }}
      />
      <Box
        sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#d1d5db" }}
      />
      <Box
        sx={{
          width: 40,
          height: 14,
          borderRadius: 6,
          ...shimmerBg, // ✅ CHANGED
        }}
      />
      <Box
        sx={{
          ml: "auto",
          width: 90,
          height: 32,
          borderRadius: "8px",
          ...shimmerBg, // ✅ CHANGED
        }}
      />
    </Box>
    <Box
      sx={{
        width: "55%",
        height: 20,
        borderRadius: 6,
        ...shimmerBg, // ✅ CHANGED
      }}
    />
    <Box
      sx={{
        width: "40%",
        height: 14,
        borderRadius: 6,
        ...shimmerBg, // ✅ CHANGED
      }}
    />
    <Box sx={{ display: "flex", gap: "14px" }}>
      {[80, 100, 70].map((w, i) => (
        <Box
          key={i}
          sx={{
            width: w,
            height: 13,
            borderRadius: 6,
            ...shimmerBg, // ✅ CHANGED
          }}
        />
      ))}
    </Box>
    {/* ✅ CHANGED — "pulse" (opacity blink) keyframes hataye, "skeleton-shimmer" (gradient slide) add kiye */}
    <style>{`
      @keyframes skeleton-shimmer {
        0% { background-position: -600px 0; }
        100% { background-position: 600px 0; }
      }
    `}</style>
  </Box>
);

// ─── Hotel Card — React.memo so unchanged cards don't re-render ───
// ─── Hotel Card — React.memo so unchanged cards don't re-render ───
const HotelCard = React.memo(({ hotel, guestsData, searchParams = {} }) => {
  const navigate = useNavigate();
  const hotelCode =
    hotel?.HotelCode ??
    hotel?.hotelCode ??
    hotel?.id ??
    hotel?.hotelId ??
    hotel?.code ??
    "";

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        bgcolor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.2s",
        alignItems: "center", // ✅ NEW — pura row (content + button) vertically center align hoga
        "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.12)" },
      }}
    >
      {/* ── LEFT — Rating, Name, Address, Amenities, Price ── */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          px: { xs: 2, md: "22px" },
          py: "14px", // ✅ card height kam karne ke liye
          display: "flex",
          flexDirection: "column",
          gap: "6px", // ✅ CHANGED — was "10px", tighter spacing
        }}
      >
        {/* ⭐ Rating badge */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              px: "10px",
              py: "3px",
              width: "fit-content",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                color: "#222",
              }}
            >
              {hotel.stars ?? hotel.HotelRating ?? ""}
            </Typography>
            {(hotel.stars || hotel.HotelRating) && (
              <StarIcon sx={{ fontSize: 15, color: "#f5a623" }} />
            )}
            <Typography
              sx={{
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                color: "#aaa",
              }}
            >
              •
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                color: "#666",
              }}
            >
              {hotel.type ?? hotel.HotelType ?? "Hotel"}
            </Typography>
          </Box>
        </Box>

        <Typography
          sx={{
            fontSize: { xs: 17, md: 21 },
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            color: "#111",
            lineHeight: 1.3,
          }}
        >
          {hotel.name ?? hotel.hotelName ?? hotel.HotelName ?? "Hotel"}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            color: "#777",
          }}
        >
          {hotel.location ?? hotel.address ?? hotel.Address ?? ""}
          {hotel.area && <> &nbsp;|&nbsp; {hotel.area}</>}
        </Typography>

        {(hotel.amenities ?? hotel.Amenities ?? []).length > 0 && (
          <Box
            sx={{ display: "flex", flexWrap: "wrap", gap: "12px", mt: "2px" }}
          >
            {(hotel.amenities ?? hotel.Amenities ?? []).map((amenity) => (
              <Box
                key={amenity}
                sx={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <CheckIcon sx={{ fontSize: 14, color: GREEN }} />
                <Typography
                  sx={{
                    fontSize: 13,
                    fontFamily: "Inter, sans-serif",
                    color: "#374151",
                  }}
                >
                  {amenity}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {(hotel.price ?? 0) > 0 && (
          <Box sx={{ mt: "2px" }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              {(hotel.originalPrice ?? 0) > hotel.price && (
                <Typography
                  sx={{
                    fontSize: 13,
                    fontFamily: "Inter, sans-serif",
                    color: "#9ca3af",
                    textDecoration: "line-through",
                  }}
                >
                  ₹{Number(hotel.originalPrice).toLocaleString("en-IN")}
                </Typography>
              )}
              <Typography
                sx={{
                  fontSize: 19,
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                  color: "#111",
                }}
              >
                ₹{Number(hotel.price).toLocaleString("en-IN")}
              </Typography>
            </Box>
            {(hotel.taxes ?? 0) > 0 && (
              <Typography
                sx={{
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif",
                  color: "#9ca3af",
                }}
              >
                +{Number(hotel.taxes).toLocaleString("en-IN")} taxes &amp; fees
              </Typography>
            )}
            <Typography
              sx={{
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
                color: "#9ca3af",
              }}
            >
              per night
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── RIGHT — Book Now, poore card ki height ke against vertically centered ── */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, md: "22px" },
        }}
      >
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            if (!hotelCode) return;
            navigate(`/hotels/details/${hotelCode}`, {
              state: { hotel, searchParams, guestsData },
            });
          }}
          sx={{
            flexShrink: 0,
            bgcolor: GREEN,
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.8rem",
            fontFamily: "Inter, sans-serif",
            textTransform: "none",
            borderRadius: "8px",
            px: 2.5,
            py: 0.9,
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#15803d" },
          }}
        >
          Book Now
        </Button>
      </Box>
    </Box>
  );
});

// ─── Star Rating Row ──────────────────────────
const StarRatingRow = React.memo(({ starCount, label, checked, onChange }) => (
  <Box
    onClick={onChange}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      cursor: "pointer",
      py: "5px",
      px: "4px",
      borderRadius: "8px",
      transition: "background 0.15s",
      "&:hover": { bgcolor: "#f9fafb" },
    }}
  >
    <Checkbox
      checked={checked}
      size="small"
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      sx={{
        p: 0,
        color: "#d1d5db",
        "&.Mui-checked": { color: GREEN },
        "& .MuiSvgIcon-root": { fontSize: 20 },
      }}
    />
    <Box sx={{ display: "flex", alignItems: "center", gap: "1px" }}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= starCount ? (
          <StarIcon key={i} sx={{ fontSize: 17, color: "#f5a623" }} />
        ) : (
          <StarBorderIcon key={i} sx={{ fontSize: 17, color: "#d1d5db" }} />
        ),
      )}
    </Box>
    <Typography
      sx={{
        fontSize: 13,
        fontFamily: "Inter, sans-serif",
        color: "#374151",
        lineHeight: 1,
      }}
    >
      {label}
    </Typography>
  </Box>
));

// ─── Filter Panel ─────────────────────────────
const FilterPanel = React.memo(
  ({ filters, setFilters, cityCode, onGeoSearch, cityCenter, hotels = [] }) => {
    const [ratingOpen, setRatingOpen] = useState(true);
    const [geoOpen, setGeoOpen] = useState(true);
    const [mapFullscreen, setMapFullscreen] = useState(false);
    const [boundsError, setBoundsError] = useState(false);
    const [geoSearching, setGeoSearching] = useState(false);
    const [locating, setLocating] = useState(false);
    const [myLocation, setMyLocation] = useState(null);

    const mapInstanceRef = useRef(null);
    const defaultPos = cityCenter ?? { lat: 18.9667, lng: 72.8333 };
    const [markerPos, setMarkerPos] = useState(defaultPos);
    const [radiusKm, setRadiusKm] = useState(5);

    useEffect(() => {
      if (cityCenter)
        setMarkerPos({ lat: cityCenter.lat, lng: cityCenter.lng });
    }, [cityCenter?.lat, cityCenter?.lng]);

    const validateAndSetPosition = useCallback(
      (pos) => {
        if (cityCenter) {
          const dist = getDistanceKm(
            cityCenter.lat,
            cityCenter.lng,
            pos.lat,
            pos.lng,
          );
          if (dist > MAX_CITY_RADIUS_KM) {
            setBoundsError(true);
            setTimeout(() => setBoundsError(false), 3500);
            return;
          }
        }
        setBoundsError(false);
        setMarkerPos(pos);
      },
      [cityCenter],
    );

    const handleUseMyLocation = useCallback(() => {
      if (!navigator.geolocation) return;
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            ts: Date.now(),
          };
          setMarkerPos({ lat: newPos.lat, lng: newPos.lng });
          setBoundsError(false);
          setMyLocation(newPos);
          setLocating(false);
        },
        () => {
          setLocating(false);
        },
        { timeout: 10000 },
      );
    }, []);

    const handleGeoSearch = useCallback(async () => {
      if (!cityCode) return;
      setGeoSearching(true);
      try {
        const ratingRange = deriveRatingRange(filters.starRatings);
        const payload = {
          CityCode: cityCode,
          IsDetailedResponse: true,
          geo: {
            lat: parseFloat(markerPos.lat.toFixed(6)),
            lng: parseFloat(markerPos.lng.toFixed(6)),
            ...(radiusKm !== "" && { radius_km: Number(radiusKm) }),
          },
          ...ratingRange,
        };
        const data = await hotelFetch(ENDPOINTS.HOTEL_CODES, { body: payload });
        onGeoSearch(data);
      } catch (err) {
        // console.error("Geo search failed", err);
      } finally {
        setGeoSearching(false);
      }
    }, [cityCode, filters.starRatings, markerPos, radiusKm, onGeoSearch]);

    const toggleFullscreen = useCallback((e) => {
      e.stopPropagation();
      setMapFullscreen((prev) => {
        const next = !prev;
        setTimeout(() => {
          mapInstanceRef.current?.invalidateSize();
        }, 320);
        return next;
      });
    }, []);

    const closeFullscreen = useCallback(() => {
      setMapFullscreen(false);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 320);
    }, []);

    const toggleStarRating = useCallback(
      (key) => {
        setFilters((f) => ({
          ...f,
          starRatings: { ...f.starRatings, [key]: !f.starRatings[key] },
        }));
      },
      [setFilters],
    );

    const mapHeight = mapFullscreen ? "60vh" : 200;

    return (
      <>
        {mapFullscreen && (
          <Box
            onClick={closeFullscreen}
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.55)",
              zIndex: 1200,
            }}
          />
        )}

        <Box
          sx={{
            width: "100%",
            bgcolor: "#fff",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            ...(mapFullscreen && {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(620px, 92vw)",
              maxHeight: "92vh",
              overflowY: "auto",
              zIndex: 1300,
              borderRadius: "20px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
            }),
          }}
        >
          {/* ── Search by Area ── */}
          <Box sx={{ position: "relative" }}>
            <Box
              onClick={() => setGeoOpen((o) => !o)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2.5,
                pt: 2,
                pb: geoOpen ? 1 : 2,
                cursor: "pointer",
              }}
            >
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  color: "#111",
                }}
              >
                Search by Area
              </Typography>
              {geoOpen ? (
                <ExpandLessIcon sx={{ color: "#555", fontSize: 20 }} />
              ) : (
                <ExpandMoreIcon sx={{ color: "#555", fontSize: 20 }} />
              )}
            </Box>

            {geoOpen && (
              <Box sx={{ px: 2.5, pb: 2 }}>
                {boundsError && (
                  <Box
                    sx={{
                      mb: 1.5,
                      px: 2,
                      py: 1,
                      bgcolor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#dc2626",
                        fontWeight: 500,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      ⚠️ Ye location city boundary ke bahar hai (
                      {MAX_CITY_RADIUS_KM}km se zyada). Kripya city ke andar
                      select karein.
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    height: mapHeight,
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                    mb: 1.5,
                    transition: "height 0.3s ease",
                    position: "relative",
                    "& .leaflet-container": {
                      height: "100%",
                      width: "100%",
                      borderRadius: "10px",
                    },
                    "& .leaflet-control-attribution": { display: "none" },
                  }}
                >
                  <MapContainer
                    key={`map-${defaultPos.lat}-${defaultPos.lng}`}
                    center={[markerPos.lat, markerPos.lng]}
                    zoom={11}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                    ref={mapInstanceRef}
                  >
                    <TileLayer
                      attribution=""
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap center={cityCenter} />
                    <FitBoundsToHotels hotels={hotels} />
                    <FlyToLocation target={myLocation} />
                    <DraggableMarker
                      position={markerPos}
                      setPosition={validateAndSetPosition}
                    />

                    {myLocation && (
                      <Marker
                        position={[myLocation.lat, myLocation.lng]}
                        icon={myLocationIcon}
                      >
                        <Popup>
                          <strong
                            style={{
                              fontSize: 12,
                              display: "block",
                              marginBottom: 2,
                              color: "#1d4ed8",
                            }}
                          >
                            Your Location
                          </strong>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#555",
                              fontFamily: "monospace",
                            }}
                          >
                            {myLocation.lat.toFixed(5)},{" "}
                            {myLocation.lng.toFixed(5)}
                          </span>
                        </Popup>
                      </Marker>
                    )}

                    {hotels.map((hotel) => {
                      const lat = parseFloat(
                        hotel?._raw?.Latitude ??
                        hotel?.Latitude ??
                        hotel?.latitude,
                      );
                      const lng = parseFloat(
                        hotel?._raw?.Longitude ??
                        hotel?.Longitude ??
                        hotel?.longitude,
                      );
                      if (isNaN(lat) || isNaN(lng)) return null;
                      return (
                        <Marker
                          key={
                            hotel.id ??
                            hotel._raw?.HotelCode ??
                            hotel?.HotelCode ??
                            `${lat}-${lng}`
                          }
                          position={[lat, lng]}
                          icon={hotelDotIcon}
                        >
                          <Popup>
                            <strong
                              style={{
                                fontSize: 12,
                                display: "block",
                                marginBottom: 2,
                                fontFamily: "Inter, sans-serif",
                              }}
                            >
                              {hotel.name ??
                                hotel._raw?.HotelName ??
                                hotel?.HotelName ??
                                "Hotel"}
                            </strong>
                            {hotel.stars && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#555",
                                  fontFamily: "Inter, sans-serif",
                                }}
                              >
                                {"⭐".repeat(hotel.stars)}
                              </span>
                            )}
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>

                  {locating && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 900,
                        borderRadius: "10px",
                        bgcolor: "rgba(255,255,255,0.72)",
                        backdropFilter: "blur(2px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: 48,
                          height: 48,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            bgcolor: "rgba(37,99,235,0.15)",
                            animation: "maplocring 1.4s ease-out infinite",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "rgba(37,99,235,0.2)",
                            animation: "maplocring 1.4s ease-out infinite 0.3s",
                          }}
                        />
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            bgcolor: "#2563eb",
                            border: "3px solid #fff",
                            boxShadow: "0 2px 8px rgba(37,99,235,0.5)",
                            zIndex: 1,
                          }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#1d4ed8",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        Fetching your location...
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                          alignItems: "center",
                        }}
                      >
                        {[80, 60, 40].map((w, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: w,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: "#bfdbfe",
                              animation: `maplocpulse ${1.2 + i * 0.2
                                }s ease-in-out infinite`,
                            }}
                          />
                        ))}
                      </Box>
                      <style>{`
                      @keyframes maplocring { 0%{transform:scale(0.6);opacity:1} 100%{transform:scale(1.8);opacity:0} }
                      @keyframes maplocpulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
                    `}</style>
                    </Box>
                  )}

                  <Box
                    onClick={toggleFullscreen}
                    title={mapFullscreen ? "Exit fullscreen" : "Fullscreen map"}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 1000,
                      bgcolor: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      p: "4px 8px",
                      cursor: "pointer",
                      boxShadow: "0 1px 5px rgba(0,0,0,0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      "&:hover": { bgcolor: "#f0fdf4", borderColor: GREEN },
                      transition: "all 0.15s",
                    }}
                  >
                    {mapFullscreen ? (
                      <FullscreenExitIcon
                        sx={{ fontSize: 16, color: "#374151" }}
                      />
                    ) : (
                      <FullscreenIcon sx={{ fontSize: 16, color: "#374151" }} />
                    )}
                    <Typography
                      sx={{ fontSize: 11, color: "#374151", fontWeight: 500 }}
                    >
                      {mapFullscreen ? "Exit" : "Expand"}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <TextField
                    label="Radius (km)"
                    type="number"
                    size="small"
                    value={radiusKm}
                    placeholder="Optional"
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") {
                        setRadiusKm("");
                        return;
                      }
                      setRadiusKm(Math.max(1, Math.min(100, Number(v))));
                    }}
                    slotProps={{ htmlInput: { min: 1, max: 100 } }}
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: 13,
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: GREEN,
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: GREEN },
                    }}
                  />
                  <Button
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    variant="outlined"
                    sx={{
                      minWidth: 0,
                      px: 1.5,
                      py: 1,
                      borderColor: locating ? GREEN : "#d1d5db",
                      borderRadius: "8px",
                      color: locating ? GREEN : "#555",
                      bgcolor: locating ? "#f0fdf4" : "transparent",
                      "&:hover": {
                        borderColor: GREEN,
                        color: GREEN,
                        bgcolor: "#f0fdf4",
                      },
                      "&:disabled": { borderColor: GREEN, bgcolor: "#f0fdf4" },
                      transition: "all 0.2s",
                    }}
                    title="Use my location"
                  >
                    {locating ? (
                      <CircularProgress size={16} sx={{ color: GREEN }} />
                    ) : (
                      <MyLocationIcon sx={{ fontSize: 18 }} />
                    )}
                  </Button>
                </Box>

                <Button
                  fullWidth
                  onClick={handleGeoSearch}
                  disabled={geoSearching}
                  sx={{
                    bgcolor: GREEN,
                    color: "#fff",
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.82rem",
                    textTransform: "none",
                    borderRadius: "8px",
                    py: 1,
                    "&:hover": { bgcolor: "#15803d" },
                    "&:disabled": { bgcolor: "#d1d5db", color: "#fff" },
                  }}
                >
                  {geoSearching ? (
                    <>
                      <CircularProgress
                        size={14}
                        sx={{ color: "#fff", mr: 1 }}
                      />
                      Searching...
                    </>
                  ) : (
                    "Search in this area"
                  )}
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ height: "1px", bgcolor: "#f3f4f6" }} />

          <Box
            sx={{
              px: 2.5,
              pt: 2,
              pb: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                color: "#111",
              }}
            >
              Filter by:
            </Typography>
            <Typography
              onClick={() => setFilters(DEFAULT_FILTERS)}
              sx={{
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
                color: "#111",
                cursor: "pointer",
                textDecoration: "underline",
                "&:hover": { color: GREEN },
              }}
            >
              Clear
            </Typography>
          </Box>

          <Box sx={{ px: 2.5, pb: 2.5 }}>
            <Box sx={{ height: "1px", bgcolor: "#f3f4f6", mb: 2 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                mb: 1,
              }}
              onClick={() => setRatingOpen((o) => !o)}
            >
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  color: "#111",
                }}
              >
                Star Rating
              </Typography>
              {ratingOpen ? (
                <ExpandLessIcon sx={{ color: "#555", fontSize: 20 }} />
              ) : (
                <ExpandMoreIcon sx={{ color: "#555", fontSize: 20 }} />
              )}
            </Box>

            {ratingOpen && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  mb: 2,
                  mx: "-4px",
                }}
              >
                {STAR_ROWS.map(({ key, label, count }) => (
                  <StarRatingRow
                    key={key}
                    starCount={count}
                    label={label}
                    checked={!!filters.starRatings[key]}
                    onChange={() => toggleStarRating(key)}
                  />
                ))}
              </Box>
            )}

            <Box sx={{ height: "1px", bgcolor: "#f3f4f6", mb: 2 }} />
            <Box sx={{ height: "1px", bgcolor: "#f3f4f6", my: 2 }} />
          </Box>
        </Box>
      </>
    );
  },
);

// ─── Main HotelListing ────────────────────────
const HotelListing = ({
  hotels = [],
  cityName = "",
  checkIn,
  checkOut,
  guests = "",
  cityCode = "",
  cityLat = null,
  cityLng = null,
  loadMore,
  loadingMore = false,
  hasMore = false,
  guestsData,
  // ✅ NEW: parent (HotelsResultsPage) ye prop pass karega — value badalti hai
  // sirf jab EK NAYA SEARCH ho (Modify Search / naya city etc.), load-more ke
  // time same hi rehti hai. Isse hum reliably "naya search vs load-more"
  // differentiate kar sakte hain.
  resetKey,
}) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [geoHotels, setGeoHotels] = useState(null);
  const [geoActive, setGeoActive] = useState(false);
  const sentinelRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ─── FIX: Stable hotels reference ─────────────────────────────────────────
  // Pehle hum sirf hotels.length compare karke decide karte the ki ref
  // update karni hai ya nahi (load-more pe blink rokne ke liye). Lekin BUG
  // ye tha — agar Modify Search ke baad naye results ki length PURANI
  // length ke BARABAR ho jaati (jaise dono baar 20 hotels), to na `>`
  // condition match hoti na `<` — matlab hotelsRef kabhi update hi nahi
  // hota tha, aur UI hamesha purana cached data hi dikhata rehta tha.
  // Yehi wo bug tha jiski wajah se "HotelListing/Results page se Modify
  // Search" karne pe naya result nahi dikh raha tha, purana hi dikh raha
  // tha.
  //
  // FIX: ab resetKey badalte hi (naya search hua hai) hum FORCE se naye
  // hotels ko ref mein daal dete hain — length ki koi parwah kiye bina.
  // Load-more ke time resetKey same rehta hai, to purana length-based
  // "blink-proofing" logic wahi ke wahi kaam karta rehta hai.
  // ──────────────────────────────────────────────────────────────────────────
  const hotelsRef = useRef(hotels);
  const prevLengthRef = useRef(hotels.length);
  const prevResetKeyRef = useRef(resetKey);

  useEffect(() => {
    // ✅ Naya search aaya hai (resetKey badla) — hard reset, length ignore karo
    if (resetKey !== prevResetKeyRef.current) {
      hotelsRef.current = hotels;
      prevLengthRef.current = hotels.length;
      prevResetKeyRef.current = resetKey;
      return;
    }

    // Naye hotels aaye hain (load more) — ref update karo
    if (hotels.length > prevLengthRef.current) {
      hotelsRef.current = hotels;
      prevLengthRef.current = hotels.length;
    }
    // Length ghati (edge case) — uss case mein bhi update karo.
    else if (hotels.length < prevLengthRef.current) {
      hotelsRef.current = hotels;
      prevLengthRef.current = hotels.length;
    }
    // Same length, same resetKey — kuch nahi karna, yahi blink rokta hai.
  }, [hotels, resetKey]);

  // ✅ Naye search pe purane filters/geo-search/search-box bhi reset ho
  // jayein, taaki purani city ke geo-filter naye city pe carry-forward na hon.
  useEffect(() => {
    setGeoActive(false);
    setGeoHotels(null);
    setSearchTerm("");
  }, [resetKey]);

  const cityCenter = useMemo(
    () => (cityLat && cityLng ? { lat: cityLat, lng: cityLng } : null),
    [cityLat, cityLng],
  );

  useEffect(() => {
    if (!loadMore || !hasMore || geoActive || searchTerm.trim()) return; // ✅ CHANGED
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) loadMore();
      },
      { threshold: 0.1, rootMargin: "0px 0px 100px 0px" },
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loadMore, hasMore, loadingMore, geoActive, searchTerm]);

  const searchParams = useMemo(
    () => ({
      checkIn: checkIn instanceof Date ? checkIn.toISOString() : checkIn,
      checkOut: checkOut instanceof Date ? checkOut.toISOString() : checkOut,
      guests,
      cityName,
      cityCode,
    }),
    [checkIn, checkOut, guests, cityName, cityCode],
  );

  const handleGeoSearch = useCallback((data) => {
    const results = Array.isArray(data)
      ? data
      : data?.data ?? data?.hotels ?? data?.results ?? [];
    setGeoHotels(results);
    setGeoActive(true);
  }, []);

  const clearGeoFilter = useCallback(() => {
    setGeoActive(false);
    setGeoHotels(null);
  }, []);

  // ─── displayedHotels ───────────────────────────────────────────────────
  // ✅ FIX: resetKey ko bhi dependency mein daala hai. Pehle sirf
  // hotels.length pe depend karta tha — agar length same rehti (jaisa
  // Modify Search ke edge case mein hota hai), to ye memo bhi recompute
  // nahi hota tha aur purana hi displayedHotels use hota rehta.
  // ──────────────────────────────────────────────────────────────────────────
  const displayedHotels = useMemo(() => {
    const baseHotels =
      geoActive && geoHotels !== null ? geoHotels : hotelsRef.current;
    const searchValue = searchTerm.trim().toLowerCase();

    return baseHotels.filter((hotel) => {
      // ⭐ Rating filter
      const rawRating = hotel.stars ?? hotel.HotelRating ?? 0;
      const hotelRating =
        typeof rawRating === "string"
          ? RATING_MAP[rawRating] ?? 0
          : Number(rawRating);
      if (!filters.starRatings[hotelRating]) return false;

      // 🔍 Search filter
      if (searchValue) {
        const name = (
          hotel.name ??
          hotel.hotelName ??
          hotel.HotelName ??
          ""
        ).toLowerCase();
        const address = (hotel.address ?? hotel.Address ?? "").toLowerCase();
        const location = (hotel.location ?? "").toLowerCase();
        const area = (hotel.area ?? "").toLowerCase();
        if (
          !name.includes(searchValue) &&
          !address.includes(searchValue) &&
          !location.includes(searchValue) &&
          !area.includes(searchValue)
        )
          return false;
      }

      return true;
    });
  }, [
    hotels.length,
    resetKey,
    geoHotels,
    geoActive,
    filters.starRatings,
    searchTerm,
  ]);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
        maxWidth: 1300,
        mx: "auto",
        display: "flex",
        gap: 3,
        alignItems: "flex-start",
      }}
    >
      {/* LEFT — Filter Panel */}
      <Box
        sx={{
          width: { xs: "100%", md: "300px" },
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          position: "sticky",
          top: 0,
        }}
      >
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          cityCode={cityCode}
          cityCenter={cityCenter}
          onGeoSearch={handleGeoSearch}
          hotels={displayedHotels}
        />
      </Box>

      {/* RIGHT — Hotel Cards */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: 16, md: 20 },
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                color: "#111",
              }}
            >
              {cityName
                ? `Hotels in ${cityName.split(",")[0]}`
                : "Available Hotels"}
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                color: "#6b7280",
                mt: 0.3,
              }}
            >
              {displayedHotels.length} properties found
              {geoActive && (
                <Box
                  component="span"
                  onClick={clearGeoFilter}
                  sx={{
                    ml: 1.5,
                    fontSize: 12,
                    fontFamily: "Inter, sans-serif",
                    color: GREEN,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Clear area filter
                </Box>
              )}
            </Typography>
          </Box>

          <Box
            sx={{
              minWidth: 220,
              maxWidth: 320,
              flex: 1,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <TextField
              fullWidth
              placeholder="Search hotels, area, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                bgcolor: "#fff",
                "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              }}
            />
          </Box>
        </Box>

        {displayedHotels.length === 0 && !loadingMore && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "#fff",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography sx={{ fontSize: 40, mb: 2 }}>🏨</Typography>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                color: "#374151",
              }}
            >
              No hotels found
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                color: "#9ca3af",
                mt: 1,
              }}
            >
              {searchTerm
                ? `"${searchTerm}" se koi hotel nahi mila`
                : "Try a different location or date range"}
            </Typography>
          </Box>
        )}

        {displayedHotels.map((hotel) => (
          <HotelCard
            key={hotel.HotelCode ?? hotel.id ?? hotel.hotelId}
            hotel={hotel}
            searchParams={searchParams}
            guestsData={guestsData}
          />
        ))}

        {/* Skeleton sirf infinite scroll ke liye — filter/search pe kabhi nahi */}
        {loadingMore && !geoActive && !searchTerm.trim() && (  
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {hasMore && !geoActive && !searchTerm.trim() && (       
          <Box ref={sentinelRef} sx={{ height: 40 }} />
        )}
        {!hasMore && displayedHotels.length > 0 && !loadingMore && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 2,
              gap: 1.5,
            }}
          >
            <Box sx={{ height: "1px", width: 60, bgcolor: "#e5e7eb" }} />
            <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
              All hotels loaded
            </Typography>
            <Box sx={{ height: "1px", width: 60, bgcolor: "#e5e7eb" }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HotelListing;
