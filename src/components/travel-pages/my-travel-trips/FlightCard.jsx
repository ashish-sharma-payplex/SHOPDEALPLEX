import React from "react";
import { Box, Card, CardContent, Divider, Typography, Button } from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import flightRouteBg from "../../../../public/mapbgg.png";
import { GREEN } from "components/travel-hooks/my-trips/constants";

const STATUS_COLORS = {
  BOOKED: { bg: "#fef3c7", color: "#b45309" },
  TICKETED: { bg: "#dbeafe", color: "#0369a1" },
  CANCELLED: { bg: "#fee2e2", color: "#dc2626" },
  BOOK_FAILED: { bg: "#f3f4f6", color: "#f13e3e" },
};

const CANCELLATION_STATUS_COLORS = {
  Completed: { bg: "#dcfce7", color: "#15803d" },
  Rejected: { bg: "#fee2e2", color: "#dc2626" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626" },
};
const DEFAULT_CANCELLATION_COLOR = { bg: "#fef3c7", color: "#b45309" };

// ✅ CANCELLABLE_STATUS use karo, NON_CANCELLABLE_STATUSES hata do
const CANCELLABLE_STATUS = "TICKETED";

const FlightCard = ({ booking, onViewDetails, detailsLoading, onCancelTicket }) => {
  const sc = STATUS_COLORS[booking.status] || STATUS_COLORS.BOOK_FAILED;
  const journeys = booking.journeys || [];

  const hasDetails = journeys.some((j) => j.booking_id);

const cancellableJourneys = journeys.filter((j) => j.booking_id && !j.cancellation);

// ✅ ab sirf TICKETED order pe hi button dikhega
const canCancel =
  cancellableJourneys.length > 0 && booking.status === CANCELLABLE_STATUS;

  return (
    <Card
      key={booking.order_id}
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        borderLeft: `4px solid ${GREEN}`,
        borderRadius: "14px",
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.09)" },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `url(${flightRouteBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.18,
          maskImage:
            "linear-gradient(to right, white 0%, black 25%, black 75%, white 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, white 0%, black 25%, black 75%, white 100%)",
        }}
      />

      <CardContent sx={{ position: "relative", p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                bgcolor: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FlightIcon sx={{ fontSize: 18, color: GREEN, transform: "rotate(45deg)" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a" }}>
                Order: {booking.order_id?.slice(0, 8)}...
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#888" }}>
                {booking.created_at
                  ? new Date(booking.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 0.4,
              borderRadius: "20px",
              fontSize: 11,
              fontWeight: 700,
              bgcolor: sc.bg,
              color: sc.color,
              whiteSpace: "nowrap",
            }}
          >
            {booking.status}
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${journeys.length}, 1fr)`,
            gap: 0,
            bgcolor: "#fafafa",
            borderRadius: "10px",
            border: "1px solid #eee",
            overflow: "hidden",
            mb: 1.5,
          }}
        >
          {journeys.map((journey, idx) => {
            const cancelColor =
              CANCELLATION_STATUS_COLORS[journey.cancellation?.status_name] ||
              DEFAULT_CANCELLATION_COLOR;

            return (
              <Box
                key={`${journey.journey_type}-${journey.booking_id ?? idx}`}
                sx={{
                  p: 1.5,
                  borderLeft: idx > 0 ? "1px dashed #ddd" : "none",
                  minWidth: 0,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5, gap: 0.5 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    PNR {journey.pnr || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, flexShrink: 0 }}>
                    {journey.journey_type}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
                    {journey.origin || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#aaa" }}>✈</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
                    {journey.destination || "—"}
                  </Typography>
                </Box>

                <Typography sx={{ fontSize: 10.5, color: "#aaa", mb: 0.5 }}>
                  #{journey.booking_id ?? "—"}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: GREEN }}>
                    {journey.fare?.published_fare
                      ? `₹${journey.fare.published_fare.toLocaleString("en-IN")}`
                      : "Fare N/A"}
                  </Typography>

                  {/* ✅ NAYA: agar is journey pe cancellation request already hai
                      to uska status_name chip dikhao (Cancel button ki jagah,
                      wo neeche global button se automatically exclude ho jayegi) */}
                  {journey.cancellation && (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: "10px",
                        fontSize: 10,
                        fontWeight: 700,
                        bgcolor: cancelColor.bg,
                        color: cancelColor.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {journey.cancellation.status_name}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {booking.payable_amount && (
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a", mb: 1.2 }}>
            ₹{Number(booking.payable_amount).toLocaleString("en-IN")}
            <Typography component="span" sx={{ fontSize: 11, color: "#888", fontWeight: 400, ml: 0.5 }}>
              total paid
            </Typography>
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          {hasDetails ? (
            <Button
              variant="contained"
              size="small"
              onClick={() => onViewDetails(booking)}
              disabled={detailsLoading}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: 12.5,
                borderRadius: "8px",
                px: 2,
                py: 0.6,
                bgcolor: GREEN,
                boxShadow: "none",
                "&:hover": { bgcolor: "#15803d", boxShadow: "none" },
              }}
            >
              {detailsLoading ? "Loading..." : "View Details"}
            </Button>
          ) : (
            <Typography sx={{ fontSize: 12.5, color: "#9ca3af", fontStyle: "italic" }}>
              No booking details available
            </Typography>
          )}

          {canCancel && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => onCancelTicket(booking)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: 12.5,
                borderRadius: "8px",
                px: 2,
                py: 0.6,
                borderColor: "#dc2626",
                color: "#dc2626",
                "&:hover": { borderColor: "#dc2626", bgcolor: "#fef2f2" },
              }}
            >
              Cancel Ticket
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FlightCard;