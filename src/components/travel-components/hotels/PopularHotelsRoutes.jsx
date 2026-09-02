import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import toast from "react-hot-toast";
import { ENDPOINTS, hotelFetch } from "travel-api/hotelApi";
import { useHotelSearch } from "components/travel-hooks/hotels/useHotelSearch";

// ─── IMAGE MAP ────────────────────────────────────────────────────────
const IMAGE_MAP = {
  "new delhi": "/newdelhi.svg",
  mumbai: "/mumbai.svg",
  panaji: "/panjigoa.svg",
  manali: "/manali.svg",
  shimla: "/shimla.svg",
  agra: "/agra.svg",
  tirupati: "/tirupati.svg",
  varanasi: "/varanasi.svg",
  katra: "/katra.svg",
  ahmedabad: "/ahmedabad.svg",
  pune: "/pune.svg",
  ayodhya: "/ayodhya.svg",
  amritsar: "/amritsar.svg",
  jaipur: "/jaipur.svg",
  ooty: "/ooty.svg",
};

// ✅ UPDATED — sessionStorage ki jagah localStorage + TTL (7 din).
// Isse ye heavy fetch sirf pehli baar hoga; uske baad kabhi bhi tab
// khologe (naye tab me bhi), cache turant milega — session-bound nahi
// rahega. Agar kabhi IMAGE_MAP list change karo (naya shehar add/remove
// karo), toh CACHE_VERSION badha dena — purana stale cache
// automatically invalidate ho jayega.
const CACHE_VERSION = "v2";
const CACHE_KEY = `popular_destinations_cache_${CACHE_VERSION}`;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 din

function DestinationSkeleton({ cols }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: { xs: "16px 12px", sm: "20px 16px", md: "24px 20px" },
      }}
    >
      {Array.from({ length: cols * 2 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            background: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
            position: "relative",
          }}
        >
          {/* IMAGE SKELETON */}
          <Box
            sx={{
              ...shimmerSx,
              height: { xs: 140, sm: 155, md: 165 },
              width: "100%",
              borderRadius: 0,
            }}
          />

          {/* CONTENT */}
          <Box sx={{ p: "12px 14px 14px" }}>
            {/* TITLE */}
            <Box
              sx={{
                ...shimmerSx,
                height: 16,
                width: "70%",
                mb: 1.2,
                borderRadius: "6px",
              }}
            />

            {/* BOTTOM ROW */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{
                  ...shimmerSx,
                  height: 12,
                  width: "40%",
                  borderRadius: "6px",
                }}
              />

              <Box
                sx={{
                  ...shimmerSx,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                }}
              />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

const shimmerSx = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "600px 100%",
  animation: "shimmer 1.5s infinite linear",
  borderRadius: "6px",
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "-600px 0" },
    "100%": { backgroundPosition: "600px 0" },
  },
};

const IMAGE_CITY_NAMES = Object.keys(IMAGE_MAP);

// ─── Helpers ──────────────────────────────────────────────────────────
function getCityKey(city) {
  return (city.name || "").split(",")[0].trim().toLowerCase();
}

function getDisplayName(city) {
  return (city.name || "").replace(/,\s+/, ", ").trim();
}

function getProperties(city) {
  return city.properties || city.propertyCount || 0;
}

// ✅ UPDATED — localStorage se safe read + TTL expiry check
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed?.data ||
      !Array.isArray(parsed.data) ||
      parsed.data.length === 0
    ) {
      return null;
    }
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

// ✅ UPDATED — localStorage me safe write, savedAt timestamp ke saath
function writeCache(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, savedAt: Date.now() }),
    );
  } catch {
    // storage full ya blocked ho sakta hai (private mode) — ignore karo,
    // isse app crash nahi hona chahiye
  }
}

// aaj aur kal ki Date objects
function getDefaultDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return { checkIn: today, checkOut: tomorrow };
}

// default guests — 1 room, 1 adult, 0 children (same as RoomsGuestDropdown defaults)
const DEFAULT_GUESTS_DATA = { rooms: 1, adults: 1, children: 0, childAges: [] };
const DEFAULT_GUESTS_LABEL = "1 Room, 1 Adult";

// ─── DestinationCard ──────────────────────────────────────────────────
function DestinationCard({ destination, onClick, isSearching }) {
  const [hovered, setHovered] = React.useState(false);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const imgRef = React.useRef(null);

  // SVG ya cached images ke liye — onLoad fire na ho tab bhi handle karo
  React.useEffect(() => {
    if (imgRef.current?.complete) {
      setImgLoaded(true);
    }
  }, []);

  return (
    <Box
      onClick={!isSearching ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        cursor: isSearching ? "wait" : "pointer",
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.11)"
          : "0 2px 10px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.22s",
        position: "relative",
      }}
    >
      {isSearching && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(255,255,255,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            borderRadius: "16px",
          }}
        >
          <CircularProgress size={28} sx={{ color: "#111827" }} />
        </Box>
      )}

      <Box
        sx={{
          overflow: "hidden",
          height: { xs: 140, sm: 155, md: 165 },
          position: "relative",
        }}
      >
        {/* Shimmer — image ke neeche, absolute */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, #ececec 25%, #e0e0e0 50%, #ececec 75%)",
            backgroundSize: "600px 100%",
            animation: "shimmer 1.5s infinite linear",
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "-600px 0" },
              "100%": { backgroundPosition: "600px 0" },
            },
            // image load hone ke baad shimmer hatao
            opacity: imgLoaded ? 0 : 1,
            transition: "opacity 0.3s ease",
            zIndex: 0,
          }}
        />

        {/* Image — shimmer ke upar */}
        <Box
          ref={imgRef}
          component="img"
          src={destination.image}
          alt={destination.name}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)} // error pe bhi shimmer hatao
          sx={{
            position: "absolute", // 👈 yeh zaroori hai
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.3s ease, transform 0.32s ease", // 👈 ek hi transition
            zIndex: 1,
          }}
        />
      </Box>

      <Box sx={{ p: "12px 14px 14px" }}>
        <Typography
          sx={{
            fontSize: { xs: "0.88rem", md: "0.95rem" },
            fontWeight: 700,
            color: "#111827",
            mb: 0.8,
            lineHeight: 1.3,
          }}
        >
          {destination.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: "0.78rem", color: "#6b7280" }}>
            {destination.properties > 0
              ? `${destination.properties.toLocaleString()} Properties`
              : "Properties available"}
          </Typography>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1.5px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: hovered ? "#111827" : "#fff",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <ArrowForwardIcon
              sx={{
                fontSize: 14,
                color: hovered ? "#fff" : "#374151",
                transition: "color 0.2s",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── PromoCard ────────────────────────────────────────────────────────
function PromoCard() {
  const [hovered, setHovered] = React.useState(false);

  return (
    <>
      {/* <Box
      sx={{
        borderRadius: "12px",
        border: "1.5px solid #e5e7eb",
        background: "#fff",
        p: { xs: 2, md: 2.5 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        minHeight: { xs: 160, md: 180 },
        boxSizing: "border-box",
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: "1.05rem", md: "1.15rem" },
          fontWeight: 800,
          color: "#111827",
          lineHeight: 1.3,
          mb: 2,
        }}
      >
        Crafting Your Perfect Travel Experience
      </Typography>
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          background: hovered ? "#374151" : "#111827",
          color: "#fff",
          borderRadius: "8px",
          px: 2,
          py: 1,
          cursor: "pointer",
          transition: "background 0.2s",
          width: "fit-content",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "0.72rem", color: "#9ca3af", lineHeight: 1 }}>
            Browse
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, lineHeight: 1.3 }}>
            All destinations
          </Typography>
        </Box>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ArrowForwardIcon sx={{ fontSize: 14, color: "#111827" }} />
        </Box>
      </Box>
    </Box> */}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function PopularHotelRoutes() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const cols = isMobile ? 2 : isTablet ? 3 : 4;
  const navigate = useNavigate();

  const { search: searchHotels } = useHotelSearch();

  // ✅ agar cache mein pehle se data mil jaaye, toh usi se initial
  // state seed karo. Isse cached case me listLoading kabhi "true" hoga
  // hi nahi — turant destinations dikhengi, skeleton flash bhi nahi hoga.
  const initialCache = React.useMemo(() => readCache(), []);

  const [destinations, setDestinations] = React.useState(initialCache ?? []);
  const [listLoading, setListLoading] = React.useState(!initialCache);
  const [listError, setListError] = React.useState(null);

  // Kaunse card ka search chal raha hai — us card pe spinner dikhega
  const [searchingCode, setSearchingCode] = React.useState(null);

  // ── Cities fetch ───────────────────────────────────────────────────
  React.useEffect(() => {
    // ✅ agar cache se already destinations mil chuki hain (initialCache),
    // toh dobara API hi mat maaro.
    if (initialCache) {
      return;
    }

    let cancelled = false;

    // ✅ UPDATED — pehle sequential while-loop (page 1 → 2 → 3 ...) tha
    // jisme har page ka wait karke agla maanga jaata tha — 5-6 round
    // trips lagte the. Ab: pehla page maango, uske meta se total pages
    // nikaalo, aur baaki saare pages PARALLEL (Promise.all) me maango.
    // Isse total time ≈ 2 round-trips (1 sequential + 1 parallel batch)
    // ho jaata hai, N round-trips ki jagah.
    async function fetchAllMatchingCities() {
      setListLoading(true);
      setListError(null);
      const found = [];

      const processPage = (data) => {
        (data?.data ?? []).forEach((city) => {
          const key = getCityKey(city);
          const image = IMAGE_MAP[key];
          if (image && !found.find((d) => d.code === city.code)) {
            found.push({
              code: city.code,
              name: getDisplayName(city),
              image,
              properties: getProperties(city),
            });
          }
        });
      };

      try {
        // Step 1 — pehla page (bada page_size — round trips kam karne
        // ke liye)
        const firstPage = await hotelFetch(ENDPOINTS.CITIES, {
          method: "POST",
          params: { page: 1, page_size: 100 },
          body: { CountryCode: "IN" },
        });

        if (cancelled) return;

        processPage(firstPage);

        const totalPages =
          firstPage?.meta?.total_pages ??
          (firstPage?.meta?.total
            ? Math.ceil(firstPage.meta.total / 100)
            : firstPage?.meta?.has_next
              ? 2
              : 1);

        // Step 2 — agar pehle page me hi saari target cities mil gayi,
        // ruk jao. Warna baaki pages ek saath (parallel) maango.
        if (found.length < IMAGE_CITY_NAMES.length && totalPages > 1) {
          const maxPagesToFetch = Math.min(totalPages, 8); // safety cap
          const remainingPages = [];
          for (let p = 2; p <= maxPagesToFetch; p++) remainingPages.push(p);

          const results = await Promise.all(
            remainingPages.map((p) =>
              hotelFetch(ENDPOINTS.CITIES, {
                method: "POST",
                params: { page: p, page_size: 100 },
                body: { CountryCode: "IN" },
              }).catch(() => null),
            ),
          );

          if (cancelled) return;
          results.forEach((data) => data && processPage(data));
        }

        if (!cancelled) {
          setDestinations(found);
          // ✅ result cache kar do taaki agli baar (localStorage — 7 din
          // tak, naye tab me bhi) ye poora fetch dobara na ho.
          writeCache(found);
        }
      } catch (err) {
        if (!cancelled) setListError(err.message);
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }

    fetchAllMatchingCities();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Card click: search karo, phir results pe navigate karo ─────────
  // Exact same flow jaise HotelsPage ka handleSearch karta hai
  const handleCityClick = async (dest) => {
    if (searchingCode) return; // dusra search block karo

    const { checkIn, checkOut } = getDefaultDates();
    const cityShortName = dest.name.split(",")[0];

    setSearchingCode(dest.code);
    const loadingToast = toast.loading(
      `Searching hotels in ${cityShortName}...`,
      { icon: "🔍" },
    );

    try {
      const data = await searchHotels(dest.code);
      toast.dismiss(loadingToast);

      const hotels = data?.data ?? data?.hotels ?? data?.results ?? [];
      const total = data?.meta?.total ?? hotels.length ?? 0;

      if (total > 0) {
        toast.success(`🏨 ${total} hotels found in ${cityShortName}!`, {
          duration: 3000,
          style: { fontWeight: 600 },
        });
      } else {
        toast("No hotels found for this location.", { icon: "😔" });
      }

      // HotelsPage ke handleSearch ke same navigate — HotelListing same state expect karta hai
      navigate("/hotels/results", {
        state: {
          hotels,
          cityName: dest.name,
          cityCode: dest.code,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests: DEFAULT_GUESTS_LABEL,
          guestsData: DEFAULT_GUESTS_DATA,
          total,
        },
      });
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSearchingCode(null);
    }
  };

  const showPromoInGrid = !isMobile;

  return (
    // ✅ horizontal padding yahan se hata di gayi hai; parent
    // (HotelsPage) is component ko search-card jaisa hi maxWidth(1200) +
    // matching horizontal padding wrapper me render karta hai, taaki
    // dono section ka left/right edge properly align ho. Sirf vertical
    // spacing yahin rakha hai kyunki wo is section ki apni internal
    // spacing hai.
    <Box sx={{ p: { xs: "20px 0", md: "6px 0" } }}>
      <Typography
        sx={{
          fontSize: { xs: "1.3rem", md: "1.6rem" },
          fontWeight: 600,
          color: "#111827",
          mb: 0.5,
        }}
      >
        Popular Destinations
      </Typography>
      <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", mb: 3 }}>
        Favorite destinations based on customer reviews
      </Typography>

      {listLoading && <DestinationSkeleton cols={cols} />}
      {!listLoading && destinations.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: { xs: "16px 12px", sm: "20px 16px", md: "24px 20px" },
          }}
        >
          {destinations.map((dest) => (
            <DestinationCard
              key={dest.code}
              destination={dest}
              isSearching={searchingCode === dest.code}
              onClick={() => handleCityClick(dest)}
            />
          ))}

          {showPromoInGrid && <PromoCard />}
        </Box>
      )}

      {!listLoading && isMobile && (
        <Box sx={{ mt: 2 }}>
          <PromoCard />
        </Box>
      )}
    </Box>
  );
}