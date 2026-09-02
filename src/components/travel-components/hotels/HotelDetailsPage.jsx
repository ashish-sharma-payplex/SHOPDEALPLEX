import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  Modal,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/IosShare";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import WifiIcon from "@mui/icons-material/Wifi";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SmokeFreeIcon from "@mui/icons-material/SmokeFree";
import ElevatorIcon from "@mui/icons-material/Elevator";
import DryCleaningIcon from "@mui/icons-material/DryCleaning";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import LuggageIcon from "@mui/icons-material/Luggage";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";
import FreeBreakfastOutlinedIcon from "@mui/icons-material/FreeBreakfastOutlined";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import GridViewIcon from "@mui/icons-material/GridView";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NoRoomsAvailable from "./NoRoomsAvailabel";
import useTravelAuthGuard from "components/travel-hooks/useTravelAuthGuard";
import toast from "react-hot-toast";

const GREEN = "#16a34a";

// ─── Shimmer keyframe ─────────────────────────
const SHIMMER_STYLE = `
  @keyframes shimmer {
    0% { background-position: -700px 0; }
    100% { background-position: 700px 0; }
  }
  `;
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = SHIMMER_STYLE;
  if (!document.head.querySelector("[data-shimmer]")) {
    styleEl.setAttribute("data-shimmer", "1");
    document.head.appendChild(styleEl);
  }
}

const Shimmer = ({
  width = "100%",
  height = 16,
  borderRadius = 8,
  sx = {},
}) => (
  <Box
    sx={{
      width,
      height,
      borderRadius: `${borderRadius}px`,
      background:
        "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "700px 100%",
      animation: "shimmer 1.4s infinite linear",
      flexShrink: 0,
      ...sx,
    }}
  />
);

const HeaderSkeleton = () => (
  <Box
    sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, pt: { xs: 2, md: 3 }, pb: 1.5 }}
  >
    <Box sx={{ display: "flex", gap: 0.5, mb: 1.5 }}>
      {[...Array(5)].map((_, i) => (
        <Shimmer key={i} width={15} height={15} borderRadius={3} />
      ))}
      <Shimmer width={40} height={15} borderRadius={3} sx={{ ml: 1 }} />
    </Box>
    <Shimmer width="55%" height={32} borderRadius={8} sx={{ mb: 1 }} />
    <Shimmer width="35%" height={20} borderRadius={6} sx={{ mb: 0.8 }} />
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 1 }}>
      <Shimmer width={16} height={16} borderRadius={8} />
      <Shimmer width="45%" height={14} borderRadius={5} />
    </Box>
    <Shimmer
      width={80}
      height={14}
      borderRadius={5}
      sx={{ mt: 0.8, ml: "22px" }}
    />
  </Box>
);

const PhotoGridSkeleton = () => (
  <Box
    sx={{
      px: { xs: 2, sm: 3, md: 4, lg: 6 },
      pb: 3,
      display: "flex",
      gap: 2,
      height: 380,
      mt: 2,
    }}
  >
    <Box sx={{ flex: 1.3, borderRadius: "14px", overflow: "hidden" }}>
      <Shimmer width="100%" height="100%" borderRadius={14} />
    </Box>
    <Box
      sx={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 2,
      }}
    >
      {[...Array(4)].map((_, i) => (
        <Shimmer key={i} width="100%" height="100%" borderRadius={12} />
      ))}
    </Box>
  </Box>
);

const AboutSkeleton = () => (
  <Box
    sx={{
      px: { xs: 2, sm: 3, md: 4, lg: 6 },
      pt: 2.5,
      pb: 3,
      borderTop: "1px solid #f3f4f6",
    }}
  >
    <Shimmer width={60} height={20} borderRadius={6} sx={{ mb: 2.5 }} />
    <Box sx={{ display: "flex", gap: 1, mb: 2.5 }}>
      {[100, 130, 90, 110].map((w, i) => (
        <Shimmer key={i} width={w} height={32} borderRadius={20} />
      ))}
    </Box>
    <Shimmer width="100%" height={14} borderRadius={5} sx={{ mb: 1 }} />
    <Shimmer width="92%" height={14} borderRadius={5} sx={{ mb: 1 }} />
    <Shimmer width="85%" height={14} borderRadius={5} sx={{ mb: 1 }} />
    <Shimmer width="60%" height={14} borderRadius={5} sx={{ mb: 2.5 }} />
    <Box sx={{ height: "1px", bgcolor: "#f3f4f6", mb: 2.5 }} />
    <Shimmer width={140} height={16} borderRadius={5} sx={{ mb: 1.5 }} />
    <Box
      sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}
    >
      {[...Array(6)].map((_, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Shimmer width={20} height={20} borderRadius={5} />
          <Shimmer
            width={`${60 + (i % 3) * 20}%`}
            height={14}
            borderRadius={5}
          />
        </Box>
      ))}
    </Box>
  </Box>
);

const RoomsSkeleton = () => (
  <Box
    sx={{
      px: { xs: 2, sm: 3, md: 4, lg: 6 },
      pt: 3,
      pb: 3,
      borderTop: "1px solid #f3f4f6",
    }}
  >
    <Shimmer width={160} height={20} borderRadius={6} sx={{ mb: 2 }} />
    {[...Array(3)].map((_, idx) => (
      <Box
        key={idx}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          mb: 2,
          p: { xs: 2, sm: 2, md: 2.5 },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Shimmer width="40%" height={18} borderRadius={6} />
            <Shimmer width={80} height={20} borderRadius={4} />
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px 16px",
              mb: 1.5,
            }}
          >
            {[...Array(4)].map((_, i) => (
              <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
              >
                <Shimmer width={16} height={16} borderRadius={4} />
                <Shimmer
                  width={`${50 + i * 10}%`}
                  height={13}
                  borderRadius={4}
                />
              </Box>
            ))}
          </Box>
          <Shimmer width={70} height={12} borderRadius={4} sx={{ mb: 0.8 }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Shimmer width={15} height={15} borderRadius={3} />
                <Shimmer width={80 + i * 20} height={12} borderRadius={4} />
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 1,
            minWidth: 170,
            pl: 2,
            borderLeft: "1px solid #f3f4f6",
          }}
        >
          <Shimmer width={50} height={20} borderRadius={6} />
          <Shimmer width={90} height={14} borderRadius={4} />
          <Shimmer width={110} height={28} borderRadius={6} />
          <Shimmer width={80} height={14} borderRadius={4} />
          <Shimmer width={120} height={36} borderRadius={8} />
        </Box>
      </Box>
    ))}
  </Box>
);

const FACILITY_ICON_MAP = {
  "free wifi": <WifiIcon sx={{ fontSize: 20, color: "#374151" }} />,
  "free wireless internet": (
    <WifiIcon sx={{ fontSize: 20, color: "#374151" }} />
  ),
  wifi: <WifiIcon sx={{ fontSize: 20, color: "#374151" }} />,
  "free valet parking": (
    <DirectionsCarIcon sx={{ fontSize: 20, color: "#374151" }} />
  ),
  parking: <DirectionsCarIcon sx={{ fontSize: 20, color: "#374151" }} />,
  "meeting rooms": <MeetingRoomIcon sx={{ fontSize: 20, color: "#374151" }} />,
  "smoke-free property": (
    <SmokeFreeIcon sx={{ fontSize: 20, color: "#374151" }} />
  ),
  elevator: <ElevatorIcon sx={{ fontSize: 20, color: "#374151" }} />,
  "dry cleaning/laundry service": (
    <DryCleaningIcon sx={{ fontSize: 20, color: "#374151" }} />
  ),
  "laundry facilities": (
    <DryCleaningIcon sx={{ fontSize: 20, color: "#374151" }} />
  ),
  "free newspapers in lobby": (
    <NewspaperIcon sx={{ fontSize: 20, color: "#374151" }} />
  ),
  "luggage storage": <LuggageIcon sx={{ fontSize: 20, color: "#374151" }} />,
  "24-hour front desk": (
    <SupportAgentIcon sx={{ fontSize: 20, color: "#374151" }} />
  ),
  breakfast: (
    <FreeBreakfastOutlinedIcon sx={{ fontSize: 20, color: "#374151" }} />
  ),
  lunch: <FreeBreakfastOutlinedIcon sx={{ fontSize: 20, color: "#374151" }} />,
  dinner: <FreeBreakfastOutlinedIcon sx={{ fontSize: 20, color: "#374151" }} />,
};

function getFacilityIcon(label) {
  const key = label?.toLowerCase?.() ?? "";
  for (const [k, icon] of Object.entries(FACILITY_ICON_MAP)) {
    if (key.includes(k)) return icon;
  }
  return <AcUnitIcon sx={{ fontSize: 20, color: "#374151" }} />;
}

// ─── Room card helpers — meal type, promotions, cancellation ──
function formatMealType(type) {
  if (!type) return null;
  const known = {
    Room_Only: "Room Only",
    BreakFast: "Breakfast",
    BreakFast_Lunch: "Breakfast & Lunch",
    Half_Board: "Half Board",
    Full_Board: "Full Board",
  };
  if (known[type]) return known[type];
  return type.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
}

function parseTBODate(str) {
  // "09-08-2026 00:00:00" → "9 Aug 2026"
  if (!str) return null;
  const [datePart] = str.split(" ");
  const [dd, mm, yyyy] = (datePart || "").split("-").map(Number);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCancellationSummary(policies) {
  const policy = policies?.[0];
  if (!policy) return null;
  const date = parseTBODate(policy.FromDate);
  if (policy.ChargeType === "Percentage" && policy.CancellationCharge >= 100) {
    return date ? `Free cancellation until ${date}` : "Non-refundable";
  }
  if (policy.ChargeType === "Fixed") {
    return date
      ? `₹${Number(policy.CancellationCharge).toLocaleString(
          "en-IN",
        )} charge if cancelled after ${date}`
      : null;
  }
  if (policy.ChargeType === "Percentage") {
    return date
      ? `${policy.CancellationCharge}% charge if cancelled after ${date}`
      : null;
  }
  return null;
}

const RoomCarousel = ({ images = [] }) => {
  const [idx, setIdx] = useState(0);
  if (!images.length)
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ color: "#9ca3af", fontSize: 13 }}>
          No image
        </Typography>
      </Box>
    );
  const prev = (e) => {
    e.stopPropagation();
    setIdx((i) => (i - 1 + images.length) % images.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % images.length);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <Box
        component="img"
        src={images[idx]}
        alt="room"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        onError={(e) => {
          e.target.src =
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80";
        }}
      />
      {images.length > 1 && (
        <>
          <IconButton
            onClick={prev}
            size="small"
            sx={{
              position: "absolute",
              left: 6,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.85)",
              p: 0.4,
              "&:hover": { bgcolor: "#fff" },
              boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 18, color: "#222" }} />
          </IconButton>
          <IconButton
            onClick={next}
            size="small"
            sx={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.85)",
              p: 0.4,
              "&:hover": { bgcolor: "#fff" },
              boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 18, color: "#222" }} />
          </IconButton>
          <Box
            sx={{
              position: "absolute",
              bottom: 7,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 0.6,
            }}
          >
            {images.map((_, i) => (
              <Box
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
                sx={{
                  width: i === idx ? 16 : 6,
                  height: 6,
                  borderRadius: "3px",
                  bgcolor: i === idx ? "#fff" : "rgba(255,255,255,0.55)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

// ─── Room Card — updated with navigate + meal/promo/cancellation ───────
const RoomCard = ({
  room,
  searchId,
  hotelDetail,
  guestsData,
  searchParams = {},
}) => {
  const navigate = useNavigate();

  const name = room?.Name?.[0] ?? room?.RoomName ?? "Room";
  const price = room?.TotalFare ?? room?.Price ?? 0;
  const taxes = room?.TotalTax ?? room?.TaxAndServiceFee ?? 0;
  const isRefundable = room?.IsRefundable ?? null;
  const originalPrice = room?.PublishedFare ?? room?.OriginalPrice ?? null;
  const discount =
    originalPrice && price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;
  const BookingCode = room?.BookingCode ?? room?.RoomCode ?? "";
  // console.log("FULL ROOM DATA:", room);

  const inclusionRaw = room?.Inclusion ?? room?.Inclusions ?? "";
  const inclusions =
    typeof inclusionRaw === "string"
      ? inclusionRaw
          .split(",")
          .map((s) => s.replace(/&amp;/g, "&").trim())
          .filter(Boolean)
      : Array.isArray(inclusionRaw)
      ? inclusionRaw.map((item) =>
          typeof item === "string" ? item : item?.Name ?? "",
        )
      : [];

  // API response mein aa rahe extra useful fields, jo
  // pehle display nahi ho rahe the
  const mealType = formatMealType(room?.MealType);
  const promotions = Array.isArray(room?.RoomPromotion)
    ? room.RoomPromotion
    : room?.RoomPromotion
    ? [room.RoomPromotion]
    : [];
  const cancellationSummary = getCancellationSummary(room?.CancelPolicies);

  const bedType = room?.BedType ?? null;
  const maxOccupancy = room?.MaxOccupancy ?? null;
  const size = room?.RoomSize ?? null;
  const viewType = room?.RoomView ?? null;
  const images = room?.RoomImages ?? room?.Images ?? [];

  // ── Extract hotel-level details for checkout page ──
  const detail =
    hotelDetail?.data?.HotelDetails?.[0] ??
    hotelDetail?.HotelDetails?.[0] ??
    {};
  const hotelName = detail?.HotelName ?? "";
  const hotelStars = detail?.HotelRating ?? 4;
  const hotelImage = detail?.Images?.[0] ?? "";
  const hotelLocation = detail?.Address ?? "";
  const checkInTime = detail?.CheckInTime ?? "";
  const checkOutTime = detail?.CheckOutTime ?? "";

  const handleReserve = () => {
    navigate("/hotels/checkout", {
      state: {
        // Prebook identifiers
        searchId,
        BookingCode,
        guestsData,
        checkIn: searchParams.checkIn ?? null,
        checkOut: searchParams.checkOut ?? null,

        roomSnapshot: {
          roomName: name,
          price,
          taxes,
          isRefundable,
          mealType,
          bedType,
          maxOccupancy,
          size,
          viewType,
          inclusions,
          images,
        },

        // Hotel snapshot for display on checkout page
        hotelSnapshot: {
          hotelName,
          hotelStars,
          hotelImage,
          hotelLocation,
          checkInTime,
          checkOutTime,
        },
      },
    });
  };

  return (
    <Box
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        bgcolor: "#fff",
        mb: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 2, md: 2.5 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 1.5, md: 0 },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mb: 1.2,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: 15, sm: 16 },
                fontWeight: 700,
                color: "#111827",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {name}
            </Typography>
            {isRefundable !== null && (
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  color: isRefundable ? GREEN : "#f59e0b",
                  bgcolor: isRefundable ? "#dcfce7" : "#fef3c7",
                  px: 1,
                  py: 0.2,
                  borderRadius: "4px",
                }}
              >
                {isRefundable ? "Refundable" : "Non-refundable"}
              </Typography>
            )}
            {/* meal type pill (Room Only / Breakfast / etc) */}
            {mealType && (
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  color: "#374151",
                  bgcolor: "#f3f4f6",
                  px: 1,
                  py: 0.2,
                  borderRadius: "4px",
                }}
              >
                {mealType}
              </Typography>
            )}
          </Box>

          {/* room promotion (RoomPromotion array se) */}
          {promotions.length > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                mb: 1,
              }}
            >
              <LocalOfferIcon sx={{ fontSize: 15, color: "#d97706" }} />
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#d97706",
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {promotions[0]}
              </Typography>
            </Box>
          )}

          {(size || bedType || viewType || maxOccupancy) && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: { xs: "6px 12px", sm: "8px 16px" },
                mb: 1.5,
              }}
            >
              {size && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <SquareFootIcon sx={{ fontSize: 16, color: "#555" }} />
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#374151",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {size}
                  </Typography>
                </Box>
              )}
              {bedType && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <KingBedOutlinedIcon sx={{ fontSize: 16, color: "#555" }} />
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#374151",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {bedType}
                  </Typography>
                </Box>
              )}
              {viewType && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <VisibilityIcon sx={{ fontSize: 16, color: "#555" }} />
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#374151",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {viewType}
                  </Typography>
                </Box>
              )}
              {maxOccupancy && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <PeopleAltOutlinedIcon sx={{ fontSize: 16, color: "#555" }} />
                  <Typography sx={{ fontSize: 13, color: "#374151" }}>
                    Sleeps {maxOccupancy}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {inclusions.length > 0 && (
            <>
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: "#6b7280",
                  fontWeight: 500,
                  fontFamily: "Inter, sans-serif",
                  mb: 0.8,
                }}
              >
                Overview
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: "6px 10px", sm: "6px 14px" },
                  mb: cancellationSummary ? 1 : 0,
                }}
              >
                {inclusions.slice(0, 6).map((item, i) => (
                  <Box
                    key={i}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    {getFacilityIcon(item)}
                    <Typography
                      sx={{
                        fontSize: { xs: 12, sm: 12.5 },
                        color: "#555",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}

          {/* cancellation policy ka ek-line summary */}
          {cancellationSummary && (
            <Typography
              sx={{
                fontSize: 11.5,
                color: "#6b7280",
                fontFamily: "Inter, sans-serif",
                mt: 0.5,
              }}
            >
              {cancellationSummary}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", md: "column" },
            alignItems: { xs: "center", md: "flex-end" },
            justifyContent: { xs: "space-between", md: "center" },
            gap: { xs: 1, md: 1.2 },
            minWidth: { md: 170 },
            pl: { md: 2 },
            borderLeft: { md: "1px solid #f3f4f6" },
            mt: { xs: 1, md: 0 },
          }}
        >
          <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
            {discount !== null && discount > 0 && (
              <Box
                sx={{
                  display: "inline-block",
                  bgcolor: "#dcfce7",
                  color: GREEN,
                  fontSize: 11.5,
                  fontWeight: 700,
                  px: 1,
                  py: 0.3,
                  borderRadius: "6px",
                  mb: 0.5,
                }}
              >
                {discount}% off
              </Box>
            )}
            {originalPrice && originalPrice > price && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#9ca3af",
                  textDecoration: "line-through",
                }}
              >
                ₹{Number(originalPrice).toLocaleString("en-IN")}
              </Typography>
            )}
            <Typography
              sx={{
                fontSize: { xs: 17, sm: 18 },
                fontWeight: 800,
                color: "#111827",
                fontFamily: "Inter, sans-serif",
              }}
            >
              ₹{Number(price).toLocaleString("en-IN")}
            </Typography>
            {taxes > 0 && (
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#6b7280",
                  lineHeight: 1.4,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                +₹{Number(taxes).toLocaleString("en-IN")} taxes & fees
                <br />
                for 1 room
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.8,
              alignItems: "flex-end",
            }}
          >
            {/* <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                cursor: "pointer",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: GREEN,
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                View Details
              </Typography>
              <ChevronRightIcon sx={{ fontSize: 16, color: GREEN }} />
            </Box> */}
            {/* Reserve now → navigate to checkout */}
            <Button
              variant="contained"
              onClick={handleReserve}
              sx={{
                bgcolor: GREEN,
                color: "#fff",
                fontSize: { xs: 12.5, sm: 13 },
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                textTransform: "none",
                borderRadius: "8px",
                px: { xs: 2, sm: 2.5 },
                py: 0.9,
                boxShadow: "none",
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "#15803d", boxShadow: "none" },
              }}
            >
              Reserve Now
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Select Your Rooms Section — pass searchId + hotelDetail ─
const SelectRoomsSection = ({
  roomsData,
  loading,
  searchId,
  hotelDetail,
  guestsData,
  searchParams = {},
}) => {
  const rooms =
    roomsData?.data?.tboResponse?.HotelResult?.[0]?.Rooms ??
    roomsData?.data?.HotelRooms ??
    roomsData?.data?.Rooms ??
    roomsData?.HotelRooms ??
    roomsData?.Rooms ??
    roomsData?.data?.HotelResult?.[0]?.Rooms ??
    [];

  if (!loading && rooms.length === 0) return <NoRoomsAvailable />;
  if (loading) return <RoomsSkeleton />;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        pt: 3,
        pb: 3,
        fontFamily: "Inter, sans-serif",
        borderTop: "1px solid #f3f4f6",
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: "1.05rem", md: "1.15rem" },
          fontWeight: 800,
          fontFamily: "Inter, sans-serif",
          color: "#111827",
          mb: 2,
        }}
      >
        Select your rooms
      </Typography>
      {rooms.map((room, i) => (
        <RoomCard
          key={room?.BookingCode ?? room?.RoomId ?? room?.RoomCode ?? i}
          room={room}
          searchId={searchId}
          hotelDetail={hotelDetail}
          guestsData={guestsData}
          searchParams={searchParams}
        />
      ))}
    </Box>
  );
};

// ─── Map Section ──────────────────────────────
const MapSection = ({ hotelDetail }) => {
  const detail =
    hotelDetail?.data?.HotelDetails?.[0] ??
    hotelDetail?.HotelDetails?.[0] ??
    {};
  const mapStr = detail?.Map ?? "";
  const name = detail?.HotelName ?? "";
  const attractions = detail?.Attractions ?? {};
  const attractionList = Object.values(attractions).filter(Boolean);
  const [lat, lng] = mapStr ? mapStr.split("|").map(Number) : [null, null];
  const hasMap = !!(lat && lng);

  if (!hasMap && attractionList.length === 0) return null;

  const embedUrl = hasMap
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    : null;
  const mapsUrl = hasMap ? `https://www.google.com/maps?q=${lat},${lng}` : null;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        pt: 3,
        pb: 4,
        borderTop: "1px solid #f3f4f6",
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: "1.05rem", md: "1.15rem" },
          fontWeight: 800,
          fontFamily: "Inter, sans-serif",
          color: "#111827",
          mb: 0.5,
        }}
      >
        Location
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {hasMap && (
          <Box
            sx={{
              flex: { md: 7 },
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              height: { xs: 240, sm: 320, md: 430 },
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              flexShrink: 0,
            }}
          >
            <Box
              component="iframe"
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of ${name}`}
            />
            <Box
              component="a"
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 34,
                height: 34,
                bgcolor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                textDecoration: "none",
                "&:hover": { bgcolor: "#f9fafb" },
                transition: "background 0.15s",
                zIndex: 10,
              }}
            >
              <OpenInFullIcon sx={{ fontSize: 16, color: "#374151" }} />
            </Box>
          </Box>
        )}
        {attractionList.length > 0 && (
          <Box
            sx={{
              flex: hasMap ? { md: 3 } : 1,
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #f3f4f6" }}>
              <Typography
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 800,
                  fontFamily: "Inter, sans-serif",
                  color: "#111827",
                }}
              >
                Explore the Area
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                maxHeight: { xs: 280, md: hasMap ? 374 : "none" },
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#e5e7eb",
                  borderRadius: "4px",
                },
              }}
            >
              {attractionList.map((place, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2.5,
                    py: 1.5,
                    borderBottom:
                      i < attractionList.length - 1
                        ? "1px solid #f3f4f6"
                        : "none",
                    "&:hover": { bgcolor: "#f9fafb" },
                    transition: "background 0.15s",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: 12.5, sm: 13 },
                      fontFamily: "Inter, sans-serif",
                      color: "#374151",
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      pr: 1,
                    }}
                  >
                    {place}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ─── Policies Section ─────────────────────────
const PoliciesSection = ({ hotelDetail }) => {
  const detail =
    hotelDetail?.data?.HotelDetails?.[0] ??
    hotelDetail?.HotelDetails?.[0] ??
    {};
  const checkIn = detail?.CheckInTime ?? null;
  const checkOut = detail?.CheckOutTime ?? null;
  const optional = detail?.HotelFees?.Optional ?? [];
  const mandatory = detail?.HotelFees?.Mandatory ?? [];

  const policyRows = [
    {
      icon: (
        <LoginIcon sx={{ fontSize: 20, color: "#374151", flexShrink: 0 }} />
      ),
      label: "Check-in",
      value: checkIn,
      sub: "You'll need to let the property know in advance what time you'll arrive.",
      show: !!checkIn,
    },
    {
      icon: (
        <LogoutIcon sx={{ fontSize: 20, color: "#374151", flexShrink: 0 }} />
      ),
      label: "Check-out",
      value: checkOut,
      show: !!checkOut,
    },
  ].filter((r) => r.show);

  const hasFees = optional.length > 0 || mandatory.length > 0;
  if (policyRows.length === 0 && !hasFees) return null;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        pt: 3,
        pb: 5,
        borderTop: "1px solid #f3f4f6",
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: "1.05rem", md: "1.15rem" },
          fontWeight: 800,
          fontFamily: "Inter, sans-serif",
          color: "#111827",
          mb: 2,
        }}
      >
        Policies
      </Typography>

      {policyRows.length > 0 && (
        <Box
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
            mb: hasFees ? 3 : 0,
          }}
        >
          {policyRows.map((row, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                borderBottom:
                  i < policyRows.length - 1 ? "1px solid #e5e7eb" : "none",
                px: { xs: 2, sm: 2.5 },
                py: { xs: 1.8, sm: 2.2 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: { sm: "36%", md: "30%" },
                  flexShrink: 0,
                  mb: { xs: 0.6, sm: 0 },
                }}
              >
                {row.icon}
                <Typography
                  sx={{
                    fontSize: { xs: 13.5, sm: 14 },
                    fontWeight: 700,
                    color: "#111827",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {row.label}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 13, sm: 13.5 },
                    color: "#374151",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.7,
                  }}
                >
                  {row.value}
                </Typography>
                {row.sub && (
                  <Typography
                    sx={{
                      fontSize: { xs: 11.5, sm: 12 },
                      color: "#6b7280",
                      mt: 0.5,
                      lineHeight: 1.6,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {row.sub}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {optional.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <ReceiptLongIcon sx={{ fontSize: 18, color: "#374151" }} />
            <Typography
              sx={{
                fontSize: { xs: 14, sm: 15 },
                fontWeight: 700,
                color: "#111827",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Optional charges
            </Typography>
          </Box>
          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {optional.map((fee, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { sm: "center" },
                  justifyContent: "space-between",
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 1.5, sm: 1.8 },
                  borderBottom:
                    i < optional.length - 1 ? "1px solid #e5e7eb" : "none",
                  gap: { xs: 0.4, sm: 1 },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: 13, sm: 13.5 },
                      fontWeight: 600,
                      color: "#111827",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {fee.FeesType}
                  </Typography>
                  {fee.ChargeType && (
                    <Typography
                      sx={{
                        fontSize: { xs: 11.5, sm: 12 },
                        color: "#6b7280",
                        mt: 0.3,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {fee.ChargeType}
                    </Typography>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: 13, sm: 13.5 },
                    fontWeight: 700,
                    color: "#374151",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {fee.Currency} {Number(fee.FeesValue).toLocaleString("en-IN")}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {mandatory.length > 0 && (
        <Box sx={{ mt: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <ReceiptLongIcon sx={{ fontSize: 18, color: "#374151" }} />
            <Typography
              sx={{
                fontSize: { xs: 14, sm: 15 },
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Mandatory charges
            </Typography>
          </Box>
          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {mandatory.map((fee, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { sm: "center" },
                  justifyContent: "space-between",
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 1.5, sm: 1.8 },
                  borderBottom:
                    i < mandatory.length - 1 ? "1px solid #e5e7eb" : "none",
                  gap: { xs: 0.4, sm: 1 },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: 13, sm: 13.5 },
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {fee.FeesType}
                  </Typography>
                  {fee.ChargeType && (
                    <Typography
                      sx={{
                        fontSize: { xs: 11.5, sm: 12 },
                        color: "#6b7280",
                        mt: 0.3,
                      }}
                    >
                      {fee.ChargeType}
                    </Typography>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: 13, sm: 13.5 },
                    fontWeight: 700,
                    color: "#374151",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {fee.Currency} {Number(fee.FeesValue).toLocaleString("en-IN")}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ─── Lightbox (single image, centered, with prev/next arrows) ──
const ImageLightbox = ({
  open,
  onClose,
  images = [],
  index = 0,
  setIndex,
  hotelName = "",
}) => {
  const placeholderImg =
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80";
  if (!open) return null;

  const goPrev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  };
  const goNext = (e) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % images.length);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ zIndex: 1500 }}
      slotProps={{ backdrop: { sx: { bgcolor: "rgba(0,0,0,0.95)" } } }}
    >
      <Box
        onClick={onClose}
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          outline: "none",
        }}
      >
        {/* Top bar */}
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1.5, sm: 2 },
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 13, sm: 14 },
              color: "rgba(255,255,255,0.8)",
              fontWeight: 600,
            }}
          >
            {hotelName ? `${hotelName} — ` : ""}
            {index + 1} / {images.length}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              color: "#fff",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              borderRadius: "10px",
              p: 0.8,
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Center image with side arrows */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            px: { xs: 1, sm: 4, md: 8 },
            minHeight: 0,
          }}
        >
          {images.length > 1 && (
            <IconButton
              onClick={goPrev}
              sx={{
                position: "absolute",
                left: { xs: 6, sm: 16, md: 28 },
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                p: { xs: 1, sm: 1.4 },
                zIndex: 2,
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />
            </IconButton>
          )}

          <Box
            component="img"
            onClick={(e) => e.stopPropagation()}
            src={images[index]}
            alt={`Hotel photo ${index + 1}`}
            sx={{
              maxWidth: "100%",
              maxHeight: { xs: "70vh", sm: "80vh" },
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: "10px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}
            onError={(e) => {
              e.target.src = placeholderImg;
            }}
          />

          {images.length > 1 && (
            <IconButton
              onClick={goNext}
              sx={{
                position: "absolute",
                right: { xs: 6, sm: 16, md: 28 },
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                p: { xs: 1, sm: 1.4 },
                zIndex: 2,
              }}
            >
              <ChevronRightIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />
            </IconButton>
          )}
        </Box>

        {/* Thumbnail dots strip */}
        {images.length > 1 && (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 0.8,
              pb: { xs: 2, sm: 3 },
              pt: 1,
              flexShrink: 0,
            }}
          >
            {images.map((_, i) => (
              <Box
                key={i}
                onClick={() => setIndex(i)}
                sx={{
                  width: i === index ? 20 : 7,
                  height: 7,
                  borderRadius: "4px",
                  bgcolor: i === index ? "#fff" : "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Modal>
  );
};

// ─── Image Gallery Modal ──────────────────────
const ImageGalleryModal = ({ open, onClose, images = [], hotelName = "" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const placeholderImg =
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80";
  const [lightboxIndex, setLightboxIndex] = useState(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ zIndex: 1400 }}
      slotProps={{ backdrop: { sx: { bgcolor: "rgba(0,0,0,0.92)" } } }}
    >
      <>
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            outline: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1.5, sm: 2 },
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              bgcolor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <GridViewIcon sx={{ color: "#fff", fontSize: 20 }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: 14, sm: 16 },
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {hotelName || "Hotel"} — All Photos
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                    mt: 0.2,
                  }}
                >
                  {images.length} photos
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                borderRadius: "10px",
                p: 0.8,
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: { xs: 1.5, sm: 3, md: 5 },
              py: { xs: 2, sm: 3 },
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(255,255,255,0.2)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr",
                  sm: "1fr 1fr 1fr",
                  md: "1fr 1fr 1fr 1fr",
                  lg: "1fr 1fr 1fr 1fr 1fr",
                },
                gap: { xs: 1, sm: 1.5, md: 2 },
              }}
            >
              {images.map((src, i) => (
                <Box
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  sx={{
                    borderRadius: { xs: "8px", sm: "10px", md: "12px" },
                    overflow: "hidden",
                    aspectRatio: "4/3",
                    position: "relative",
                    cursor: "pointer",
                    "&:hover .img-overlay": { opacity: 1 },
                    "&:hover img": { transform: "scale(1.06)" },
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt={`Hotel photo ${i + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.35s ease",
                    }}
                    onError={(e) => {
                      e.target.src = placeholderImg;
                    }}
                  />
                  <Box
                    className="img-overlay"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.3)",
                      display: "flex",
                      alignItems: "flex-end",
                      p: 1,
                      opacity: 0,
                      transition: "opacity 0.2s",
                      borderRadius: "inherit",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 600,
                      }}
                    >
                      {i + 1} / {images.length}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{ height: { xs: 24, sm: 32 } }} />
          </Box>
        </Box>

        {/* Lightbox opens on top when an image in the grid is clicked */}
        {lightboxIndex !== null && (
          <ImageLightbox
            open={lightboxIndex !== null}
            onClose={() => setLightboxIndex(null)}
            images={images}
            index={lightboxIndex}
            setIndex={setLightboxIndex}
            hotelName={hotelName}
          />
        )}
      </>
    </Modal>
  );
};

// ─── Photo Grid ───────────────────────────────
const PhotoGrid = ({ images = [], totalCount = 0, hotelName = "" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [galleryOpen, setGalleryOpen] = useState(false);

  if (totalCount === 0) return null;

  const extra = totalCount > 5 ? totalCount - 5 : 0;
  const imgs = images.slice(0, 5);
  const placeholderImg =
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80";

  if (isMobile)
    return (
      <Box sx={{ px: 2, pb: 2 }}>
        <ImageGalleryModal
          open={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          images={images}
          hotelName={hotelName}
        />
        <Box
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            mb: 1.5,
            height: 220,
          }}
        >
          <Box
            component="img"
            src={imgs[0]}
            alt="hotel"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              e.target.src = placeholderImg;
            }}
          />
        </Box>
        {imgs.length > 1 && (
          <Box sx={{ display: "flex", gap: 1 }}>
            {imgs.slice(1, 3).map((src, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  borderRadius: "10px",
                  overflow: "hidden",
                  height: 110,
                  position: "relative",
                }}
              >
                <Box
                  component="img"
                  src={src}
                  alt=""
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.target.src = placeholderImg;
                  }}
                />
                {i === 1 && extra > 0 && (
                  <Box
                    onClick={() => setGalleryOpen(true)}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.58)" },
                      transition: "background 0.2s",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <CameraAltOutlinedIcon
                        sx={{ color: "#fff", fontSize: 18 }}
                      />
                      <Typography
                        sx={{ color: "#fff", fontWeight: 700, fontSize: 15 }}
                      >
                        {extra}+
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );

  if (isTablet)
    return (
      <Box sx={{ px: 3, pb: 2, display: "flex", gap: 1.5, height: 300 }}>
        <ImageGalleryModal
          open={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          images={images}
          hotelName={hotelName}
        />
        <Box sx={{ flex: 1.4, borderRadius: "12px", overflow: "hidden" }}>
          <Box
            component="img"
            src={imgs[0]}
            alt="hotel"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              e.target.src = placeholderImg;
            }}
          />
        </Box>
        {imgs.length > 1 && (
          <Box
            sx={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: 1.5,
            }}
          >
            {imgs.slice(1, 5).map((src, i) => (
              <Box
                key={i}
                sx={{
                  borderRadius: "10px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Box
                  component="img"
                  src={src}
                  alt=""
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.target.src = placeholderImg;
                  }}
                />
                {i === 3 && extra > 0 && (
                  <Box
                    onClick={() => setGalleryOpen(true)}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.58)" },
                      transition: "background 0.2s",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <CameraAltOutlinedIcon
                        sx={{ color: "#fff", fontSize: 18 }}
                      />
                      <Typography
                        sx={{ color: "#fff", fontWeight: 700, fontSize: 16 }}
                      >
                        {extra}+
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );

  return (
    <Box
      sx={{ px: { md: 4, lg: 6 }, pb: 3, display: "flex", gap: 2, height: 380 }}
    >
      <ImageGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={images}
        hotelName={hotelName}
      />
      <Box sx={{ flex: 1.3, borderRadius: "14px", overflow: "hidden" }}>
        <Box
          component="img"
          src={imgs[0]}
          alt="hotel"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.4s",
            "&:hover": { transform: "scale(1.03)" },
          }}
          onError={(e) => {
            e.target.src = placeholderImg;
          }}
        />
      </Box>
      {imgs.length > 1 && (
        <Box
          sx={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 2,
          }}
        >
          {imgs.slice(1, 5).map((src, i) => (
            <Box
              key={i}
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={src}
                alt=""
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.35s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
                onError={(e) => {
                  e.target.src = placeholderImg;
                }}
              />
              {i === 3 && extra > 0 && (
                <Box
                  onClick={() => setGalleryOpen(true)}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0,0,0,0.42)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.58)" },
                    transition: "background 0.2s",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <CameraAltOutlinedIcon
                      sx={{ color: "#fff", fontSize: 20 }}
                    />
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 18,
                        letterSpacing: 0.5,
                      }}
                    >
                      {extra}+
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ─── About Section ────────────────────────────
const AboutSection = ({ hotelDetail, loading }) => {
  const [activeAboutTab, setActiveAboutTab] = useState(0);
  const [showAllFacilities, setShowAllFacilities] = useState(false);

  const detail =
    hotelDetail?.data?.HotelDetails?.[0] ??
    hotelDetail?.HotelDetails?.[0] ??
    hotelDetail?.data ??
    {};
  const descriptions = detail?.Description ?? [];
  const facilities = detail?.HotelFacilities ?? [];
  const allDescriptions = descriptions.filter((d) => d?.title && d?.content);
  const activeContent = allDescriptions[activeAboutTab]?.content ?? "";
  const activeType = allDescriptions[activeAboutTab]?.type ?? "text";
  const visibleFacilities = showAllFacilities
    ? facilities
    : facilities.slice(0, 6);

  if (!loading && allDescriptions.length === 0 && facilities.length === 0)
    return null;
  if (loading) return <AboutSkeleton />;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        pt: 2.5,
        pb: 3,
        borderTop: "1px solid #f3f4f6",
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: "1.05rem", md: "1.15rem" },
          fontWeight: 800,
          fontFamily: "Inter, sans-serif",
          color: "#111827",
          mb: 2,
        }}
      >
        About
      </Typography>

      {allDescriptions.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
          {allDescriptions.map((desc, i) => {
            const isNote = desc.type === "note";
            const isActive = activeAboutTab === i;
            return (
              <Box
                key={desc.title}
                onClick={() => setActiveAboutTab(i)}
                sx={{
                  px: { xs: 1.4, sm: 1.8 },
                  py: 0.6,
                  borderRadius: "20px",
                  fontSize: { xs: 12, sm: 13 },
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                  border: "1.5px solid",
                  borderColor: isActive ? "#E3E8EE" : "#e5e7eb",

                  // Active background
                  background: isActive
                    ? "linear-gradient(270deg, #FFFFFF 0%, #C6FFE0 100%)"
                    : "#fff",

                  // Hover background
                  "&:hover": {
                    background:
                      "linear-gradient(270deg, #FFFFFF 0%, #C6FFE0 100%)",
                    borderColor: "#E3E8EE",
                  },

                  color: isActive ? "#292D32" : "#292D32",
                  fontWeight: isActive ? 600 : 500,
                  userSelect: "none",
                  transition: "all 0.25s ease",
                }}
              >
                {desc.title}
              </Box>
            );
          })}
        </Box>
      )}

      {activeContent ? (
        <Box
          sx={{
            mb: 2.5,
            ...(activeType === "note" && {
              bgcolor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              px: 1.8,
              py: 1.4,
            }),
          }}
        >
          {activeType === "note" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                mb: 0.6,
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 15, color: "#d97706" }} />
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#d97706",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Note
              </Typography>
            </Box>
          )}
          <Typography
            sx={{
              fontSize: { xs: 13, sm: 13.5 },
              color: activeType === "note" ? "#92400e" : "#374151",
              lineHeight: 1.75,
              whiteSpace: "pre-line",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {activeContent}
          </Typography>
        </Box>
      ) : null}

      {facilities.length > 0 && (
        <>
          <Box sx={{ height: "1px", bgcolor: "#f3f4f6", mb: 2.5 }} />
          <Typography
            sx={{
              fontSize: { xs: 14, sm: 15 },
              fontWeight: 700,
              color: "#111827",
              mb: 1.5,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Popular Facilities
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr" },
              rowGap: 0,
              columnGap: { xs: 1, sm: 2 },
            }}
          >
            {visibleFacilities.map((fac, i) => {
              const label =
                typeof fac === "string"
                  ? fac
                  : fac?.FacilityName ?? fac?.name ?? "";
              return (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    py: { xs: 1, sm: 1.2 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getFacilityIcon(label)}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: 13, sm: 13.5 },
                      color: "#374151",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <Box
            onClick={() => setShowAllFacilities((v) => !v)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              mt: 1,
              cursor: "pointer",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: 13, sm: 13.5 },
                color: GREEN,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {showAllFacilities ? "Show Less" : "View More"}
            </Typography>
            <ExpandMoreIcon
              sx={{
                fontSize: 18,
                color: GREEN,
                transform: showAllFacilities ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

// ─── Hotel Detail Header ───────────────────────
const HotelDetailHeader = ({
  hotelDetail,
  roomsData,
  detailLoading,
  roomsLoading,
  searchId,
  guestsData,
  searchParams = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const detail =
    hotelDetail?.data?.HotelDetails?.[0] ??
    hotelDetail?.HotelDetails?.[0] ??
    {};
  const name = detail?.HotelName ?? "Hotel Details";
  const stars = detail?.HotelRating ?? 3;
  const address = detail?.Address ?? "";
  const images = detail?.Images ?? (detail?.Image ? [detail.Image] : []);

  // ─── View on map: derive a real Google Maps URL ───
  const mapStr = detail?.Map ?? "";
  const [mapLat, mapLng] = mapStr
    ? mapStr.split("|").map((v) => Number(v))
    : [null, null];
  const hasMapCoords = !!(mapLat && mapLng);
  const mapsUrl = hasMapCoords
    ? `https://www.google.com/maps?q=${mapLat},${mapLng}`
    : address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address,
      )}`
    : null;

  const handleViewOnMap = () => {
    if (!mapsUrl) {
      toast.error("Location not available for this hotel.");
      return;
    }
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  // ─── Share: native share on supported devices, clipboard fallback ───
  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: name,
      text: `Check out ${name} on Dealplex Travel`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } else {
        toast.error("Sharing not supported on this browser.");
      }
    } catch (err) {
      // AbortError fires when user cancels the native share sheet — not an error
      if (err?.name !== "AbortError") {
        toast.error("Unable to share right now.");
      }
    }
  };

  const renderStars = (count) => {
    const n = typeof count === "number" ? count : parseInt(count) || 3;
    return Array.from({ length: 5 }).map((_, i) =>
      i < n ? (
        <StarIcon key={i} sx={{ fontSize: 15, color: "#f5a623" }} />
      ) : (
        <StarBorderIcon key={i} sx={{ fontSize: 15, color: "#d1d5db" }} />
      ),
    );
  };

  return (
    <Box
    sx={{
      width: "100%",
      maxWidth: "1300px",
      mx: "auto",
      bgcolor: "#fff",
      overflow: "hidden",
    }}
  >
      {detailLoading ? (
        <HeaderSkeleton />
      ) : (
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4, lg: 6 },
            pt: { xs: 2, md: 3 },
            pb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            {renderStars(stars)}
            <Typography
              sx={{
                fontSize: 13,
                color: "#9ca3af",
                ml: 0.5,
                fontFamily: "Inter, sans-serif",
              }}
            >
              •
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "#555",
                ml: 0.5,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Hotel
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.75rem" },
                fontWeight: 800,
                fontFamily: "Inter, sans-serif",
                color: "#111827",
                lineHeight: 1.25,
                letterSpacing: "-0.3px",
              }}
            >
              {name}
            </Typography>
            {!isMobile && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexShrink: 0,
                  mt: 0.5,
                }}
              >
                {/* <Button startIcon={<FavoriteIcon sx={{ fontSize: "17px !important" }} />} sx={{ color: "#111", fontWeight: 600, fontSize: 13, textTransform: "none", borderRadius: "8px", px: 1.5, py: 0.7, border: "1.5px solid #e5e7eb", "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" } }}>Save</Button> */}
                <Button
                  onClick={handleShare}
                  startIcon={<ShareIcon sx={{ fontSize: "17px !important" }} />}
                  sx={{
                    color: "#111",
                    fontWeight: 600,
                    fontSize: 13,
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 1.5,
                    py: 0.7,
                    border: "1.5px solid #e5e7eb",
                    "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" },
                  }}
                >
                  Share
                </Button>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mt: 1,
            }}
          >
            <Box>
              {address && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOnIcon
                    sx={{ fontSize: 17, color: GREEN, flexShrink: 0 }}
                  />
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontFamily: "Inter, sans-serif",
                      color: "#374151",
                    }}
                  >
                    {address}
                  </Typography>
                </Box>
              )}
              <Typography
                onClick={handleViewOnMap}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleViewOnMap();
                }}
                sx={{
                  fontSize: 13,
                  color: GREEN,
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  mt: 0.4,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                  ml: address ? "22px" : 0,
                }}
              >
                View on map
              </Typography>
            </Box>
            {isMobile && (
              <Box sx={{ display: "flex", gap: 0.8, flexShrink: 0 }}>
                <IconButton
                  size="small"
                  sx={{
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "8px",
                    p: 0.8,
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 17, color: "#111" }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleShare}
                  sx={{
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "8px",
                    p: 0.8,
                  }}
                >
                  <ShareIcon sx={{ fontSize: 17, color: "#111" }} />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {detailLoading ? (
        <PhotoGridSkeleton />
      ) : (
        images.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <PhotoGrid
              images={images}
              totalCount={images.length}
              hotelName={name}
            />
          </Box>
        )
      )}

      <AboutSection hotelDetail={hotelDetail} loading={detailLoading} />

      {/* Pass searchId + hotelDetail down to rooms */}
      <SelectRoomsSection
        roomsData={roomsData}
        loading={roomsLoading}
        searchId={searchId}
        hotelDetail={hotelDetail}
        guestsData={guestsData}
        searchParams={searchParams}
      />

      {!detailLoading && hotelDetail && (
        <MapSection hotelDetail={hotelDetail} />
      )}
      {!detailLoading && hotelDetail && (
        <PoliciesSection hotelDetail={hotelDetail} />
      )}
    </Box>
  );
};

// ─── Main Export ───────────────────────────────
/**
 * @param {object}  props
 * @param {object}  props.hotelDetail
 * @param {object}  props.roomsData
 * @param {boolean} props.detailLoading
 * @param {boolean} props.roomsLoading
 * @param {number|string} props.searchId   ← pass this from your wrapper/page
 */
const HotelDetailsPage = ({
  hotelDetail = null,
  roomsData = null,
  detailLoading = false,
  roomsLoading = false,
  searchId = null,
  guestsData = null,
  searchParams = {},
}) => {
  useTravelAuthGuard();
  return (
    <HotelDetailHeader
      hotelDetail={hotelDetail}
      roomsData={roomsData}
      detailLoading={detailLoading}
      roomsLoading={roomsLoading}
      searchId={searchId}
      guestsData={guestsData}
      searchParams={searchParams}
    />
  );
};

export default HotelDetailsPage;