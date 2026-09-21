// pages\my-travel-trips\HotelBookingDetailsDialog.jsx
import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ScheduleIcon from "@mui/icons-material/Schedule";
import HotelIcon from "@mui/icons-material/Hotel";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BedroomParentIcon from "@mui/icons-material/BedroomParent";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PolicyIcon from "@mui/icons-material/Policy";
import { GREEN } from "components/travel-hooks/my-trips/constants";

/* ─────────────────────────────────────────────────────────────────
   API response shape: data.GetBookingDetailResult
   { HotelBookingStatus, ConfirmationNo, BookingRefNo, BookingId,
     HotelName, StarRating, AddressLine1, City, CheckInDate,
     CheckOutDate, NoOfRooms, InvoiceNo, InvoiceAmount, NetAmount,
     NetTax, BookingDate, LastCancellationDate,
     Rooms: [{ RoomTypeName, AdultCount, ChildCount, HotelPassenger:[...],
               PriceBreakUp: { RoomRate, RoomTax, ... }, Inclusion,
               CancellationPolicy, Amenities: [] }] }
   Optional-chaining + fallback "—" everywhere taaki missing field
   pe UI crash na ho.
   ───────────────────────────────────────────────────────────── */

const money = (v) =>
  v === undefined || v === null || v === ""
    ? "—"
    : `₹${Number(v).toLocaleString("en-IN")}`;

const formatDate = (iso, opts) =>
  iso
    ? new Date(iso).toLocaleDateString(
        "en-IN",
        opts || { day: "2-digit", month: "short", year: "numeric" },
      )
    : "—";

const nightsBetween = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "—";
  const diff = new Date(checkOut) - new Date(checkIn);
  const nights = Math.round(diff / (1000 * 60 * 60 * 24));
  return nights > 0 ? `${nights} Night${nights > 1 ? "s" : ""}` : "—";
};

const STATUS_STYLES = {
  CONFIRMED: {
    bg: "var(--mb-success-bg-strong)",
    text: "var(--mb-brand-strong-text)",
    icon: CheckCircleIcon,
    subtitle: "Booking Confirmed",
  },
  PENDING: {
    bg: "var(--mb-warn-bg)",
    text: "var(--mb-warn-deep-text)",
    icon: ScheduleIcon,
    subtitle: "Awaiting Confirmation",
  },
  CANCELLED: {
    bg: "var(--mb-danger-bg-strong)",
    text: "var(--mb-danger-strong-text)",
    icon: CancelIcon,
    subtitle: "Booking Cancelled",
  },
  FAILED: {
    bg: "var(--mb-danger-bg-strong)",
    text: "var(--mb-danger-strong-text)",
    icon: CancelIcon,
    subtitle: "Booking Failed",
  },
};
const DEFAULT_STATUS_STYLE = {
  bg: "var(--mb-surface-muted)",
  text: "var(--mb-text-body)",
  icon: InfoOutlinedIcon,
  subtitle: "",
};

const HotelBookingDetailsDialog = ({ open, loading, data, onClose }) => {
  const result =
    data?.GetBookingDetailResult || data?.data?.GetBookingDetailResult || null;

  const rawStatus = result?.HotelBookingStatus || "";
  const statusKey = rawStatus.toString().trim().toUpperCase();
  const statusStyle = STATUS_STYLES[statusKey] || DEFAULT_STATUS_STYLE;
  const StatusIcon = statusStyle.icon;

  const rooms = result?.Rooms || [];

  const cardSx = {
    bgcolor: "var(--ht-surface)",
    borderRadius: "14px",
    border: "1px solid var(--ht-border)",
    p: { xs: 2, sm: 2.5 },
    mb: 2,
  };
  const sectionTitleSx = {
    fontWeight: 800,
    fontSize: 15,
    color: "var(--mb-title)",
    mb: 1.5,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: "var(--mb-surface)",
          backgroundImage: "none",
          borderRadius: 3,
          overflow: "hidden",
          maxHeight: "92vh",
          mx: { xs: 1, sm: 2 },
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          bgcolor: "var(--mb-header-bg)",
          color: "var(--ht-text-on-brand)",
          px: { xs: 2, sm: 3 },
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ color: "var(--ht-text-on-brand)" }}
          size="small"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 } }}>
          Hotel Booking Details
        </Typography>
      </Box>

      <DialogContent
        sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: "var(--ht-surface-muted)" }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <Typography sx={{ fontSize: 13, color: "var(--ht-text-soft)" }}>
              Loading details...
            </Typography>
          </Box>
        ) : !result ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <Typography sx={{ fontSize: 13, color: "var(--ht-text-soft)" }}>
              No details available.
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* ── Summary card ── */}
            <Box sx={cardSx}>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: "10px",
                      border: "1px solid var(--ht-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      bgcolor: "var(--ht-surface-subtle)",
                    }}
                  >
                    <HotelIcon sx={{ color: GREEN }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: "var(--ht-text-strong)",
                      }}
                      noWrap
                    >
                      {result?.HotelName || "Hotel"}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 0.25,
                      }}
                    >
                      <LocationOnIcon
                        sx={{ fontSize: 14, color: "var(--ht-text-faint)" }}
                      />
                      <Typography
                        sx={{ fontSize: 12, color: "var(--ht-text-faint)" }}
                        noWrap
                      >
                        {result?.City || "—"}
                        {result?.StarRating ? ` · ${result.StarRating}★` : ""}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: "10px",
                    bgcolor: statusStyle.bg,
                  }}
                >
                  <StatusIcon sx={{ fontSize: 18, color: statusStyle.text }} />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: statusStyle.text,
                        lineHeight: 1.2,
                      }}
                    >
                      {rawStatus || "—"}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 10.5, color: statusStyle.text }}
                    >
                      {statusStyle.subtitle}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  rowGap: 2,
                  columnGap: 4,
                }}
              >
                <MetaItem
                  icon={<ReceiptLongIcon sx={{ fontSize: 18, color: GREEN }} />}
                  label="Confirmation No"
                  value={result?.ConfirmationNo || "—"}
                />
                <MetaItem
                  label="Booking Ref No"
                  value={result?.BookingRefNo || "—"}
                />
                <MetaItem label="Invoice No" value={result?.InvoiceNo || "—"} />
                <MetaItem
                  icon={
                    <CalendarMonthIcon sx={{ fontSize: 18, color: GREEN }} />
                  }
                  label="Booking Date"
                  value={formatDate(result?.BookingDate, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                <MetaItem
                  label="No. of Rooms"
                  value={result?.NoOfRooms ?? "—"}
                />
              </Box>
            </Box>

            {/* ── Stay details ── */}
            <Box sx={cardSx}>
              <Typography sx={sectionTitleSx}>Stay Details</Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "var(--ht-text-faint)",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Check-In
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: "var(--ht-text-strong)",
                    }}
                  >
                    {formatDate(result?.CheckInDate)}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "center", minWidth: 90 }}>
                  <Typography
                    sx={{ fontSize: 11.5, color: "var(--ht-text-faint)" }}
                  >
                    {nightsBetween(result?.CheckInDate, result?.CheckOutDate)}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", my: 0.5 }}>
                    <Box
                      sx={{
                        flex: 1,
                        height: 1,
                        bgcolor: "var(--mb-border-strong)",
                      }}
                    />
                    <HotelIcon
                      sx={{
                        fontSize: 16,
                        color: "var(--ht-text-disabled)",
                        mx: 0.5,
                      }}
                    />
                    <Box
                      sx={{
                        flex: 1,
                        height: 1,
                        bgcolor: "var(--mb-border-strong)",
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "var(--ht-text-faint)",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Check-Out
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: "var(--ht-text-strong)",
                    }}
                  >
                    {formatDate(result?.CheckOutDate)}
                  </Typography>
                </Box>

                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ display: { xs: "none", sm: "block" } }}
                />

                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography
                    sx={{ fontSize: 12.5, color: "var(--ht-text-body)" }}
                  >
                    {result?.AddressLine1 || "—"}
                  </Typography>
                  {result?.LastCancellationDate && (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "var(--mb-warn-strong-text)",
                        mt: 0.5,
                      }}
                    >
                      Free cancellation till{" "}
                      {formatDate(result.LastCancellationDate, {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* ── Rooms ── */}
            {rooms.map((room, idx) => (
              <Box key={idx} sx={cardSx}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BedroomParentIcon sx={{ fontSize: 18, color: GREEN }} />
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 14.5,
                        color: "var(--ht-text-strong)",
                      }}
                    >
                      Room {idx + 1}: {room?.RoomTypeName || "—"}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={`${room?.AdultCount ?? 0} Adult${
                      (room?.AdultCount ?? 0) > 1 ? "s" : ""
                    }${room?.ChildCount ? `, ${room.ChildCount} Child` : ""}`}
                    sx={{
                      bgcolor: "var(--ht-success-bg)",
                      color: GREEN,
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  />
                </Box>

                {/* Passengers */}
                {(room?.HotelPassenger || []).map((p, pIdx) => (
                  <Box
                    key={pIdx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      py: 0.75,
                      borderTop:
                        pIdx > 0 ? "1px solid var(--mb-border-soft)" : "none",
                    }}
                  >
                    <PersonIcon
                      sx={{ fontSize: 16, color: "var(--ht-text-faint)" }}
                    />
                    <Typography
                      sx={{ fontSize: 13, color: "var(--ht-text-body)" }}
                    >
                      {p?.Title} {p?.FirstName} {p?.LastName}
                      {p?.LeadPassenger ? " (Lead)" : ""}
                    </Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 1.5 }} />

                {/* Price breakup */}
                <FareRow
                  label="Room Rate"
                  value={money(room?.PriceBreakUp?.RoomRate)}
                />
                <FareRow
                  label="Room Tax"
                  value={money(room?.PriceBreakUp?.RoomTax)}
                />
                {Number(room?.PriceBreakUp?.RoomExtraGuestCharges) > 0 && (
                  <FareRow
                    label="Extra Guest Charges"
                    value={money(room.PriceBreakUp.RoomExtraGuestCharges)}
                  />
                )}
                {Number(room?.PriceBreakUp?.RoomChildCharges) > 0 && (
                  <FareRow
                    label="Child Charges"
                    value={money(room.PriceBreakUp.RoomChildCharges)}
                  />
                )}

                {room?.Inclusion && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 0.75,
                      mt: 1.5,
                    }}
                  >
                    <CheckCircleIcon
                      sx={{ fontSize: 15, color: GREEN, mt: 0.2 }}
                    />
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        color: "var(--ht-brand-strong-text)",
                      }}
                    >
                      {room.Inclusion}
                    </Typography>
                  </Box>
                )}

                {room?.CancellationPolicy && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 0.75,
                      mt: 1,
                      bgcolor: "var(--ht-surface-subtle)",
                      borderRadius: "8px",
                      p: 1.25,
                    }}
                  >
                    <PolicyIcon
                      sx={{
                        fontSize: 15,
                        color: "var(--ht-text-faint)",
                        mt: 0.2,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        color: "var(--ht-text-muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {room.CancellationPolicy.replace(
                        /#\^#|#!#/g,
                        " ",
                      ).replace(/\|/g, " · ")}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}

            {/* ── Fare summary ── */}
            <Box sx={cardSx}>
              <Typography sx={sectionTitleSx}>
                Fare Summary (All amounts in INR)
              </Typography>
              <FareRow label="Net Amount" value={money(result?.NetAmount)} />
              <FareRow label="Net Tax" value={money(result?.NetTax)} />
              <Divider sx={{ my: 1.5 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "var(--ht-blue-accent-bg)",
                  borderRadius: "8px",
                  px: 1.5,
                  py: 1.25,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: "var(--ht-text-strong)",
                  }}
                >
                  Total Invoice Amount
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: "var(--ht-text-strong)",
                  }}
                >
                  {money(result?.InvoiceAmount)}
                </Typography>
              </Box>
            </Box>

            {/* ── Footer note ── */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "var(--ht-blue-accent-bg)",
                borderRadius: "10px",
                px: 2,
                py: 1.5,
              }}
            >
              <InfoOutlinedIcon
                sx={{ fontSize: 18, color: "var(--ht-info-text)" }}
              />
              <Typography
                sx={{ fontSize: 12.5, color: "var(--mb-indigo-strong-text)" }}
              >
                Please carry a valid government-issued photo ID at the time of
                check-in.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const MetaItem = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: icon ? 0.75 : 0,
      flexDirection: icon ? "row" : "column",
    }}
  >
    <Box>
      <Typography
        sx={{
          fontSize: 11,
          color: "var(--ht-text-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{ fontSize: 14, fontWeight: 700, color: "var(--ht-text-strong)" }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

const FareRow = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      py: 0.9,
    }}
  >
    <Typography sx={{ fontSize: 13.5, color: "var(--ht-text-body)" }}>
      {label}
    </Typography>
    <Typography
      sx={{ fontSize: 13.5, fontWeight: 700, color: "var(--ht-text-strong)" }}
    >
      {value}
    </Typography>
  </Box>
);

export default HotelBookingDetailsDialog;
