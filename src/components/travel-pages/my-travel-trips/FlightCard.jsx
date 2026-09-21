import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  Button,
} from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import flightRouteBg from "../../../../public/mapbgg.png";
import { GREEN } from "components/travel-hooks/my-trips/constants";

const STATUS_COLORS = {
  BOOKED: { bg: "var(--fl-warn-bg)", color: "var(--fl-warn-text)" },
  TICKETED: { bg: "var(--fl-info-bg-strong)", color: "var(--fl-info-text)" },
  CANCELLED: {
    bg: "var(--fl-danger-bg-strong)",
    color: "var(--fl-danger-text)",
  },
  BOOK_FAILED: { bg: "var(--fl-surface-muted)", color: "#f13e3e" },
};

const CANCELLATION_STATUS_COLORS = {
  Completed: {
    bg: "var(--fl-success-bg-strong)",
    color: "var(--fl-brand-strong-text)",
  },
  Rejected: {
    bg: "var(--fl-danger-bg-strong)",
    color: "var(--fl-danger-text)",
  },
  Cancelled: {
    bg: "var(--fl-danger-bg-strong)",
    color: "var(--fl-danger-text)",
  },
};
const DEFAULT_CANCELLATION_COLOR = {
  bg: "var(--fl-warn-bg)",
  color: "var(--fl-warn-text)",
};

// ✅ CANCELLABLE_STATUS use karo, NON_CANCELLABLE_STATUSES hata do
const CANCELLABLE_STATUS = "TICKETED";

const FlightCard = ({
  booking,
  onViewDetails,
  detailsLoading,
  onCancelTicket,
}) => {
  const sc = STATUS_COLORS[booking.status] || STATUS_COLORS.BOOK_FAILED;
  const journeys = booking.journeys || [];

  const hasDetails = journeys.some((j) => j.booking_id);

  const cancellableJourneys = journeys.filter(
    (j) => j.booking_id && !j.cancellation,
  );

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
        bgcolor: "var(--fl-surface)",
        backgroundImage: "none",
        border: "1px solid var(--fl-border)",
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
          opacity: "var(--fl-route-bg-opacity)",
          maskImage:
            "linear-gradient(to right, white 0%, black 25%, black 75%, white 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, white 0%, black 25%, black 75%, white 100%)",
        }}
      />

      <CardContent
        sx={{ position: "relative", p: 2, "&:last-child": { pb: 2 } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                bgcolor: "var(--fl-success-bg-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FlightIcon
                sx={{ fontSize: 18, color: GREEN, transform: "rotate(45deg)" }}
              />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "var(--fl-text-strong)",
                }}
              >
                Order: {booking.order_id?.slice(0, 8)}...
              </Typography>
              <Typography sx={{ fontSize: 11, color: "var(--fl-text-soft)" }}>
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
            bgcolor: "var(--fl-surface-subtle)",
            borderRadius: "10px",
            border: "1px solid var(--fl-border)",
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
                  borderLeft:
                    idx > 0 ? "1px dashed var(--fl-border-strong)" : "none",
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                    gap: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--fl-text-strong)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    PNR {journey.pnr || "—"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: "var(--fl-text-faint)",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {journey.journey_type}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    mb: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--fl-text-strong)",
                    }}
                  >
                    {journey.origin || "—"}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 11, color: "var(--fl-text-soft)" }}
                  >
                    ✈
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--fl-text-strong)",
                    }}
                  >
                    {journey.destination || "—"}
                  </Typography>
                </Box>

                <Typography
                  sx={{ fontSize: 10.5, color: "var(--fl-text-soft)", mb: 0.5 }}
                >
                  #{journey.booking_id ?? "—"}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 700, color: GREEN }}
                  >
                    {journey.fare?.published_fare
                      ? `₹${journey.fare.published_fare.toLocaleString(
                          "en-IN",
                        )}`
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
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "var(--fl-text-strong)",
              mb: 1.2,
            }}
          >
            ₹{Number(booking.payable_amount).toLocaleString("en-IN")}
            <Typography
              component="span"
              sx={{
                fontSize: 11,
                color: "var(--fl-text-soft)",
                fontWeight: 400,
                ml: 0.5,
              }}
            >
              total paid
            </Typography>
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
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
                "&:hover": {
                  bgcolor: "var(--fl-brand-hover)",
                  boxShadow: "none",
                },
              }}
            >
              {detailsLoading ? "Loading..." : "View Details"}
            </Button>
          ) : (
            <Typography
              sx={{
                fontSize: 12.5,
                color: "var(--fl-text-faint)",
                fontStyle: "italic",
              }}
            >
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
                borderColor: "var(--fl-danger-line)",
                color: "var(--fl-danger-text)",
                "&:hover": {
                  borderColor: "var(--fl-danger-line)",
                  bgcolor: "var(--fl-danger-bg)",
                },
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
