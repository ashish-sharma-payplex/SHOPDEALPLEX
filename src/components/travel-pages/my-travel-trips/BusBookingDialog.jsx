// pages\my-travel-trips\BusBookingDetailsDialog.jsx
import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  CircularProgress,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import PersonIcon from "@mui/icons-material/Person";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HistoryIcon from "@mui/icons-material/History";
import GavelIcon from "@mui/icons-material/Gavel";
import { GREEN } from "components/travel-hooks/my-trips/constants";

/* ─────────────────────────────────────────────────────────────────
   ⚠️ ASSUMED FIELD PATHS — /api/busv2/booking-detail/ ke sample
   response ke hisaab se bana hai. Agar production response me
   naming alag ho (jaise `journey.departure_time` vs `DepartureTime`)
   to yahan fields correct karna.
   ───────────────────────────────────────────────────────────── */

const money = (v) =>
  v === undefined || v === null || v === ""
    ? "—"
    : `₹${Number(v).toLocaleString("en-IN")}`;

const formatDateTime = (iso, opts) =>
  iso ? new Date(iso).toLocaleString([], opts) : "—";

const STATUS_STYLES = {
  CONFIRMED: { bg: "#dcfce7", text: "#15803d", icon: CheckCircleIcon, subtitle: "Booking Confirmed" },
  CANCELLED: { bg: "#fee2e2", text: "#b91c1c", icon: CancelIcon, subtitle: "Booking Cancelled" },
  PENDING: { bg: "#fef9c3", text: "#a16207", icon: ScheduleIcon, subtitle: "Awaiting Confirmation" },
};
const DEFAULT_STATUS_STYLE = { bg: "#f3f4f6", text: "#374151", icon: InfoOutlinedIcon, subtitle: "" };

const BusBookingDetailsDialog = ({
  open,
  data,
  loading,
  onClose,
  onCancelBooking, // async (traceId, busId, remarks) => {...}
}) => {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [remarks, setRemarks] = useState("");

  const summary = data?.summary || {};
  const journey = data?.journey || {};
  const passengers = data?.passengers || [];
  const price = data?.price || {};
  const cancellationPolicy = data?.cancellation_policy || [];
  const bookingHistory = data?.booking_history || [];
  const provider = data?.provider || {};

  const rawStatus = (summary?.status || "").toString();
  const statusKey = rawStatus.trim().toUpperCase();
  const statusStyle = STATUS_STYLES[statusKey] || DEFAULT_STATUS_STYLE;
  const StatusIcon = statusStyle.icon;

  const cardSx = {
    bgcolor: "#fff",
    borderRadius: "14px",
    border: "1px solid #e8e8e8",
    p: { xs: 2, sm: 2.5 },
    mb: 2,
  };
  const sectionTitleSx = { fontWeight: 800, fontSize: 15, color: "#0f1e4d", mb: 1.5 };

  const isCancelled = statusKey === "CANCELLED";

  const handleClose = () => {
    setConfirmingCancel(false);
    setCancelError("");
    setRemarks("");
    onClose?.();
  };

  const handleConfirmCancel = async () => {
    if (!onCancelBooking) return;

    if (!remarks.trim()) {
      setCancelError("Please enter a remark for cancellation.");
      return;
    }

    try {
      setCancelling(true);
      setCancelError("");

      // ✅ FIX — bus_id kabhi API se number aa sakta hai (e.g. 38910
      // instead of "38910"). Backend sirf string expect karta hai,
      // number bhejne pe 500 crash karta hai. String() se force karo
      // taaki payload hamesha Postman-jaisa exact match ho.
      await onCancelBooking(data?.trace_id, String(summary?.bus_id), remarks.trim());

      setConfirmingCancel(false);
      setRemarks("");
    } catch (err) {
      setCancelError("Cancellation failed. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { borderRadius: 3, overflow: "hidden", maxHeight: "92vh", mx: { xs: 1, sm: 2 } },
      }}
    >
      {/* ── Header bar ── */}
      <Box
        sx={{
          bgcolor: "#0f1e4d",
          color: "#fff",
          px: { xs: 2, sm: 3 },
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <IconButton onClick={handleClose} sx={{ color: "#fff" }} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 } }}>
          Bus Booking Details
        </Typography>
      </Box>

      <DialogContent sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: "#f5f5f5" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: GREEN }} />
          </Box>
        ) : !data ? (
          <Typography sx={{ fontSize: 13, color: "#9ca3af", textAlign: "center", py: 4 }}>
            No booking details available.
          </Typography>
        ) : (
          <Box>
            {/* ── Summary card ── */}
            <Box sx={cardSx}>
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: "10px",
                      border: "1px solid #eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#fafafa",
                      flexShrink: 0,
                    }}
                  >
                    <DirectionsBusIcon sx={{ color: GREEN }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>
                      {journey?.operator || "Bus Operator"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#374151", mt: 0.25 }}>
                      Ticket No: <b>{summary?.ticket_number || "—"}</b>
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                      Bus ID: {summary?.bus_id || "—"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>
                      {journey?.origin}
                    </Typography>
                  </Box>
                  <DirectionsBusIcon sx={{ fontSize: 18, color: "#c9c9c9" }} />
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>
                      {journey?.destination}
                    </Typography>
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
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: statusStyle.text, lineHeight: 1.2 }}>
                      {rawStatus || "—"}
                    </Typography>
                    <Typography sx={{ fontSize: 10.5, color: statusStyle.text }}>
                      {statusStyle.subtitle || rawStatus || "—"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", flexWrap: "wrap", rowGap: 2, columnGap: 4 }}>
                <MetaItem
                  icon={<CalendarMonthIcon sx={{ fontSize: 18, color: GREEN }} />}
                  label="Journey Date"
                  value={
                    journey?.date_of_journey
                      ? formatDateTime(journey.date_of_journey, { day: "2-digit", month: "short", year: "numeric" })
                      : "—"
                  }
                />
                <MetaItem
                  icon={<ReceiptLongIcon sx={{ fontSize: 18, color: GREEN }} />}
                  label="Invoice No."
                  value={summary?.invoice?.number || "—"}
                />
                <MetaItem
                  icon={<ReceiptLongIcon sx={{ fontSize: 18, color: GREEN }} />}
                  label="Invoice Amount"
                  value={money(summary?.invoice?.amount)}
                />
                <MetaItem label="Seats Booked" value={journey?.no_of_seats ?? "—"} />
                <MetaItem label="Bus Type" value={journey?.bus_type || "—"} />
              </Box>
            </Box>

            {/* ── Journey / boarding details ── */}
            <Box sx={cardSx}>
              <Typography sx={sectionTitleSx}>Journey Details</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", fontWeight: 700 }}>
                    Departure
                  </Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>
                    {formatDateTime(journey?.departure_time, { hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#374151" }}>{journey?.origin}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", fontWeight: 700 }}>
                    Arrival
                  </Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>
                    {formatDateTime(journey?.arrival_time, { hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#374151" }}>{journey?.destination}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                <PlaceIcon sx={{ fontSize: 18, color: GREEN, mt: 0.25 }} />
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                    Boarding Point: {journey?.boarding_point?.CityPointName || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                    {journey?.boarding_point?.CityPointLocation || ""}
                    {journey?.boarding_point?.CityPointLandmark
                      ? ` • Landmark: ${journey.boarding_point.CityPointLandmark}`
                      : ""}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                    Boarding Time:{" "}
                    {formatDateTime(journey?.boarding_point?.CityPointTime, {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ── Passenger(s) ── */}
            <Box sx={cardSx}>
              <Typography sx={sectionTitleSx}>Passenger(s)</Typography>
              {passengers.length === 0 ? (
                <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>No passenger data available.</Typography>
              ) : (
                passengers.map((p, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      py: 1.25,
                      borderTop: idx > 0 ? "1px solid #f1f1f1" : "none",
                    }}
                  >
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            bgcolor: "#eef2ff",
                            color: "#4338ca",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                              {p?.Title} {p?.FirstName} {p?.LastName}
                            </Typography>
                            {p?.LeadPassenger && (
                              <Chip label="Lead Passenger" size="small" sx={{ bgcolor: "#f0fdf4", color: GREEN, height: 20, fontWeight: 700 }} />
                            )}
                          </Box>
                          <Typography sx={{ fontSize: 12, color: "#9ca3af", mt: 0.25 }}>
                            Age: {p?.Age ?? "—"} &nbsp;|&nbsp; Phone: {p?.Phoneno || "—"}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 3 }}>
                        <MetaItem label="Seat No." value={p?.Seat?.SeatName || "—"} inline />
                        <MetaItem label="Seat Fare" value={money(p?.Seat?.SeatFare)} inline />
                        <MetaItem label="Berth" value={p?.Seat?.IsUpper ? "Upper" : "Lower"} inline />
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </Box>

            {/* ── Fare breakdown ── */}
            <Box sx={cardSx}>
              <Typography sx={sectionTitleSx}>Fare Details ({price?.CurrencyCode || "INR"})</Typography>
              <FareRow label="Base Price" value={money(price?.BasePrice)} />
              <FareRow label="Tax" value={money(price?.Tax)} />
              <FareRow label="Other Charges" value={money(price?.OtherCharges)} />
              <FareRow label="Discount" value={money(price?.Discount)} />

              <Divider sx={{ my: 1.5 }} />

              <FareRow label="Published Price" value={money(price?.PublishedPrice)} />
              <FareRow label="Offered Price" value={money(price?.OfferedPrice)} />
              <FareRow label="Agent Commission" value={money(price?.AgentCommission)} />
              <FareRow label="Agent Markup" value={money(price?.AgentMarkUp)} />
              <FareRow label="TDS" value={money(price?.TDS)} />

              {price?.GST && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#6b7280", mb: 0.5 }}>
                    GST Breakup
                  </Typography>
                  <FareRow label={`CGST (${price.GST.CGSTRate}%)`} value={money(price.GST.CGSTAmount)} />
                  <FareRow label={`SGST (${price.GST.SGSTRate}%)`} value={money(price.GST.SGSTAmount)} />
                  <FareRow label={`IGST (${price.GST.IGSTRate}%)`} value={money(price.GST.IGSTAmount)} />
                  <FareRow label={`Cess (${price.GST.CessRate}%)`} value={money(price.GST.CessAmount)} />
                </>
              )}

              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#eef2ff", borderRadius: "8px", px: 1.5, py: 1.25 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>Total Paid</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>
                  {money(price?.OfferedPriceRoundedOff ?? price?.PublishedPriceRoundedOff)}
                </Typography>
              </Box>
            </Box>

            {/* ── Cancellation Policy ── */}
            {cancellationPolicy.length > 0 && (
              <Box sx={cardSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <GavelIcon sx={{ fontSize: 18, color: GREEN }} />
                  <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#0f1e4d" }}>
                    Cancellation Policy
                  </Typography>
                </Box>
                {cancellationPolicy.map((policy, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1,
                      borderTop: idx > 0 ? "1px solid #f1f1f1" : "none",
                    }}
                  >
                    <Typography sx={{ fontSize: 13, color: "#374151" }}>{policy?.PolicyString}</Typography>
                    <Chip
                      size="small"
                      label={`${policy?.CancellationCharge}${policy?.CancellationChargeType === 2 ? "%" : ""} charge`}
                      sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            {/* ── Booking History ── */}
            {bookingHistory.length > 0 && (
              <Box sx={cardSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <HistoryIcon sx={{ fontSize: 18, color: GREEN }} />
                  <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#0f1e4d" }}>
                    Booking History
                  </Typography>
                </Box>
                {bookingHistory.map((h, idx) => (
                  <Box key={idx} sx={{ py: 1, borderTop: idx > 0 ? "1px solid #f1f1f1" : "none" }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                      {h?.Remarks}
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, color: "#9ca3af" }}>
                      By {h?.CreatedByName || "—"} on{" "}
                      {formatDateTime(h?.CreatedOn, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* ── Meta grid ── */}
            <Box sx={cardSx}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, rowGap: 2, columnGap: 2 }}>
                <MetaItem label="Service" value={provider?.service_name || "—"} />
                <MetaItem label="Source ID" value={provider?.source_id ?? "—"} />
                <MetaItem label="Is Domestic" value={provider?.is_domestic === undefined ? "—" : provider.is_domestic ? "Yes" : "No"} />
                <MetaItem label="Operator PNR" value={provider?.travel_operator_pnr || "—"} />
              </Box>
            </Box>

            {/* ── Footer note ── */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#eef2ff", borderRadius: "10px", px: 2, py: 1.5, mb: 2 }}>
              <InfoOutlinedIcon sx={{ fontSize: 18, color: "#4338ca" }} />
              <Typography sx={{ fontSize: 12.5, color: "#3730a3" }}>
                Please carry a valid photo ID at the time of boarding.
              </Typography>
            </Box>

            {/* ── Cancel Booking ── */}
            {!isCancelled && (
              <Box
                sx={{
                  border: "1px solid #fecaca",
                  bgcolor: "#fff5f5",
                  borderRadius: "12px",
                  p: 2,
                }}
              >
                {!confirmingCancel ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#b91c1c" }}>
                        Cancel this booking?
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#7f1d1d" }}>
                        Cancellation charges may apply as per the policy above.
                      </Typography>
                    </Box>
                    <Button
                      onClick={() => setConfirmingCancel(true)}
                      startIcon={<CancelIcon />}
                      sx={{
                        color: "#fff",
                        bgcolor: "#dc2626",
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: "8px",
                        px: 2.5,
                        "&:hover": { bgcolor: "#b91c1c" },
                      }}
                    >
                      Cancel Booking
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#b91c1c", mb: 1 }}>
                      Are you sure? This action cannot be undone.
                    </Typography>

                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      placeholder="Enter a reason for cancellation..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      disabled={cancelling}
                      sx={{
                        bgcolor: "#fff",
                        borderRadius: "8px",
                        mb: 1.5,
                        "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                      }}
                    />
                    {cancelError && (
                      <Typography sx={{ fontSize: 12.5, color: "#b91c1c", mb: 1 }}>{cancelError}</Typography>
                    )}

                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <Button
                        onClick={handleConfirmCancel}
                        disabled={cancelling}
                        startIcon={cancelling ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <CancelIcon />}
                        sx={{
                          color: "#fff",
                          bgcolor: "#dc2626",
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: "8px",
                          px: 2.5,
                          "&:hover": { bgcolor: "#b91c1c" },
                        }}
                      >
                        {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
                      </Button>
                      <Button
                        onClick={() => {
                          setConfirmingCancel(false);
                          setRemarks("");
                          setCancelError("");
                        }}
                        disabled={cancelling}
                        sx={{
                          color: "#374151",
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: "8px",
                          px: 2.5,
                          border: "1px solid #d1d5db",
                        }}
                      >
                        Keep Booking
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const MetaItem = ({ icon, label, value, inline }) => (
  <Box sx={{ display: "flex", alignItems: inline ? "center" : "flex-start", gap: inline ? 0.75 : 0, flexDirection: inline ? "row" : "column" }}>
    {icon && !inline && <Box sx={{ mb: 0.5 }}>{icon}</Box>}
    <Box>
      <Typography sx={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: inline ? 13 : 14, fontWeight: 700, color: "#111827" }}>{value}</Typography>
    </Box>
  </Box>
);

const FareRow = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.9 }}>
    <Typography sx={{ fontSize: 13.5, color: "#374151" }}>{label}</Typography>
    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{value}</Typography>
  </Box>
);

export default BusBookingDetailsDialog;