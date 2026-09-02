// pages\my-travel-trips\BookingDetailsDialog.jsx
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ScheduleIcon from "@mui/icons-material/Schedule";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonIcon from "@mui/icons-material/Person";
import FlightIcon from "@mui/icons-material/Flight";
import LuggageIcon from "@mui/icons-material/Luggage";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { GREEN } from "components/travel-hooks/my-trips/constants";

/* ─────────────────────────────────────────────────────────────────
   ⚠️ FIELD PATHS — asli booking-details API ka response is shape me
   aata hai:
     response.data = { booking_id, pnr, origin, destination,
                        airline_code, ..., raw: { FlightItinerary } }
   Poora detail (Segments, Passenger, Fare, FareRules waghera)
   `raw.FlightItinerary` ke andar nested hota hai — top-level pe nahi.
   Isliye har jagah `getItinerary(booking)` se hi access karo, direct
   `booking.Segments` jaisa kabhi mat likhna warna "No booking
   details available" wapas dikhega.
   ───────────────────────────────────────────────────────────── */

const PAX_TYPE_LABEL = { 1: "Adult", 2: "Child", 3: "Infant" };

const CABIN_CLASS_LABEL = { 1: "Premium Economy", 2: "Economy", 3: "Premium Business", 4: "Business", 5: "First" };

// TBO ticket status ("OK", "Cancelled" etc) → UI status
const TICKET_STATUS_STYLES = {
  OK: { label: "Confirmed", subtitle: "Booking Confirmed", bg: "#dcfce7", text: "#15803d", icon: CheckCircleIcon },
  CNF: { label: "Confirmed", subtitle: "Booking Confirmed", bg: "#dcfce7", text: "#15803d", icon: CheckCircleIcon },
  CANCELLED: { label: "Cancelled", subtitle: "Booking Cancelled", bg: "#fee2e2", text: "#dc2626", icon: CancelIcon },
  FAILED: { label: "Failed", subtitle: "Booking Failed", bg: "#fee2e2", text: "#dc2626", icon: CancelIcon },
};
const DEFAULT_TICKET_STATUS_STYLE = { label: "Pending", subtitle: "Awaiting Confirmation", bg: "#fef3c7", text: "#b45309", icon: ScheduleIcon };

const money = (v) =>
  v === undefined || v === null || v === "" ? "—" : `₹${Number(v).toLocaleString("en-IN")}`;

const formatDate = (iso, opts) => (iso ? new Date(iso).toLocaleDateString("en-IN", opts) : "—");
const formatTime = (iso) => (iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—");

const formatDuration = (mins) => {
  if (!mins && mins !== 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

// ✅ safe unwrap — kabhi bhi `booking.Segments` seedha mat likhna
const getItinerary = (booking) => booking?.raw?.FlightItinerary || booking?.FlightItinerary || {};

const BookingDetailsDialog = ({ open, bookings = [], onClose, onDownloadInvoice }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [expandedTax, setExpandedTax] = useState(true);

  const journeyList = (bookings || []).filter((b) => getItinerary(b)?.Segments?.length);
  const isMultiJourney = journeyList.length > 1;

  const handleClose = () => {
    setExpandedTax(true);
    onClose?.();
  };

  const handleDownloadInvoice = (fi) => {
    if (onDownloadInvoice) {
      onDownloadInvoice(fi?.InvoiceNo, fi);
      return;
    }
    if (fi?.Invoice?.[0]?.InvoiceNo) {
      // koi default download handler nahi diya gaya — parent se
      // onDownloadInvoice prop pass karo actual PDF fetch/download ke liye
      // console.log("Download invoice:", fi.Invoice[0].InvoiceNo);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      fullScreen={isXs}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: isXs ? 0 : 3,
          overflow: "hidden",
          maxHeight: isXs ? "100%" : "92vh",
          mx: { xs: 0, sm: 2 },
        },
      }}
    >
      {/* ── Header bar ── */}
      <Box
        sx={{
          bgcolor: "#0f1e4d",
          color: "#fff",
          px: { xs: 1.5, sm: 3 },
          py: { xs: 1.25, sm: 2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <IconButton onClick={handleClose} sx={{ color: "#fff", flexShrink: 0 }} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: { xs: 15, sm: 18 } }}>
            Booking Details
          </Typography>
        </Box>

        {journeyList.length === 1 && (
          <Button
            onClick={() => handleDownloadInvoice(getItinerary(journeyList[0]))}
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            size="small"
            sx={{
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.4)",
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: 11.5, sm: 13 },
              borderRadius: "8px",
              px: { xs: 1.25, sm: 2 },
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            {isXs ? "Invoice" : "Download Invoice"}
          </Button>
        )}
      </Box>

      <DialogContent sx={{ p: { xs: 1.25, sm: 3 }, bgcolor: "#f5f5f5" }}>
        {journeyList.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "#9ca3af", textAlign: "center", py: 6 }}>
            No booking details available.
          </Typography>
        ) : (
          journeyList.map((booking, jIdx) => {
            const fi = getItinerary(booking);
            const segments = fi.Segments || [];
            const passengers = fi.Passenger || [];
            const fare = fi.Fare || {};
            const taxBreakup = (fare.TaxBreakup || []).filter((t) => t.key !== "TotalTax");
            const chargeBU = fare.ChargeBU || [];

            const firstSeg = segments[0];
            const lastSeg = segments[segments.length - 1];

            const ticketStatus = passengers[0]?.Ticket?.Status?.toUpperCase();
            const statusStyle = TICKET_STATUS_STYLES[ticketStatus] || DEFAULT_TICKET_STATUS_STYLE;
            const StatusIcon = statusStyle.icon;

            const bookingDate = passengers[0]?.Ticket?.IssueDate || fi.Invoice?.[0]?.InvoiceCreatedOn;
            const journeyTypeLabel = isMultiJourney
              ? booking.journey_type || (jIdx === 0 ? "Onward" : "Return")
              : "One Way";
            const ticketTypeLabel = passengers[0]?.Ticket?.TicketType === "N" ? "E-Ticket" : passengers[0]?.Ticket?.TicketType || "—";

            return (
              <Box key={booking.booking_id || jIdx} sx={{ mb: jIdx < journeyList.length - 1 ? 3 : 0 }}>
                {isMultiJourney && (
                  <Chip
                    label={journeyTypeLabel}
                    size="small"
                    sx={{ bgcolor: "#eef2ff", color: "#4338ca", fontWeight: 700, mb: 1.5 }}
                  />
                )}

                {/* ── Summary card ── */}
                <Box sx={cardSx}>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: { xs: 1.5, sm: 2 },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
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
                        <FlightIcon sx={{ color: GREEN, transform: "rotate(45deg)" }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography noWrap sx={{ fontWeight: 800, fontSize: { xs: 14, sm: 16 }, color: "#111827" }}>
                            {firstSeg?.Airline?.AirlineName || "—"} ({fi.AirlineCode || "—"})
                          </Typography>
                          {fi.IsLCC && (
                            <Chip label="LCC" size="small" sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: "#eef2ff", color: "#4338ca" }} />
                          )}
                        </Box>
                        <Typography sx={{ fontSize: 13, color: "#374151", mt: 0.25 }}>
                          PNR: <b>{fi.PNR || "—"}</b>
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                          Booking ID: {fi.BookingId || "—"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 22 }, color: "#111827" }}>
                          {firstSeg?.Origin?.Airport?.AirportCode || fi.Origin}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                          {firstSeg?.Origin?.Airport?.CityName}
                        </Typography>
                      </Box>
                      <FlightIcon sx={{ fontSize: 18, color: "#c9c9c9", transform: "rotate(90deg)" }} />
                      <Box sx={{ textAlign: "center" }}>
                        <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 22 }, color: "#111827" }}>
                          {lastSeg?.Destination?.Airport?.AirportCode || fi.Destination}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                          {lastSeg?.Destination?.Airport?.CityName}
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
                          {statusStyle.label}
                        </Typography>
                        <Typography sx={{ fontSize: 10.5, color: statusStyle.text }}>
                          {statusStyle.subtitle}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", flexWrap: "wrap", rowGap: 2, columnGap: 4 }}>
                    <MetaItem label="Booking Date" value={bookingDate ? `${formatDate(bookingDate, { day: "2-digit", month: "short", year: "numeric" })}, ${formatTime(bookingDate)}` : "—"} />
                    <MetaItem label="Journey Type" value={journeyTypeLabel} />
                    <MetaItem label="Fare Type" value={firstSeg?.Remark || fi.FareType || "—"} />
                    <MetaItem label="Ticket Type" value={ticketTypeLabel} />
                    <MetaItem label="Is Domestic" value={fi.IsDomestic === undefined ? "—" : fi.IsDomestic ? "Yes" : "No"} />
                  </Box>
                </Box>

                {/* ── Passenger(s) ── */}
                <Box sx={cardSx}>
                  <Typography sx={sectionTitleSx}>Passenger(s)</Typography>
                  {passengers.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>No passenger data available.</Typography>
                  ) : (
                    passengers.map((p, idx) => {
                      const segInfo = p.SegmentAdditionalInfo?.[0] || {};
                      return (
                        <Box
                          key={p.PaxId || idx}
                          sx={{ py: 1.25, borderTop: idx > 0 ? "1px solid #f1f1f1" : "none" }}
                        >
                          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
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
                                  fontWeight: 700,
                                  fontSize: 13,
                                  flexShrink: 0,
                                }}
                              >
                                {idx + 1}
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                                    {p.Title} {p.FirstName} {p.LastName}
                                  </Typography>
                                  <Chip
                                    label={PAX_TYPE_LABEL[p.PaxType] || "Passenger"}
                                    size="small"
                                    sx={{ bgcolor: "#f0fdf4", color: GREEN, height: 20, fontWeight: 700, fontSize: 10.5 }}
                                  />
                                </Box>
                                <Typography sx={{ fontSize: 12, color: "#9ca3af", mt: 0.25 }}>
                                  Pax Type: {PAX_TYPE_LABEL[p.PaxType]?.slice(0, 3).toUpperCase() || "—"} &nbsp;|&nbsp; Is Reissued: {p.IsReissued ? "Yes" : "No"}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: "flex", gap: { xs: 2, sm: 3 }, flexWrap: "wrap" }}>
                              <MetaItem label="Seat" value={segInfo.Seat || "—"} inline />
                              <MetaItem label="Meal" value={segInfo.Meal || "—"} inline />
                              <MetaItem label="Baggage" value={segInfo.Baggage || "—"} inline />
                            </Box>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>

                {/* ── Flight Itinerary ── */}
                <Box sx={cardSx}>
                  <Typography sx={sectionTitleSx}>Flight Itinerary</Typography>
                  {segments.map((seg, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "auto 1fr auto 1fr auto" },
                        alignItems: "center",
                        gap: { xs: 1.5, sm: 2 },
                        py: 1.5,
                        borderTop: idx > 0 ? "1px solid #f1f1f1" : "none",
                      }}
                    >
                      <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 20, color: "#111827", lineHeight: 1 }}>
                          {seg.Origin?.DepTime ? new Date(seg.Origin.DepTime).getDate() : "—"}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#6b7280" }}>
                          {formatDate(seg.Origin?.DepTime, { month: "short", year: "numeric" })}
                        </Typography>
                        <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>
                          {formatDate(seg.Origin?.DepTime, { weekday: "long" })}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#111827" }}>
                          {formatTime(seg.Origin?.DepTime)}
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                          {seg.Origin?.Airport?.AirportCode}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#9ca3af" }}>
                          {seg.Origin?.Airport?.AirportName}
                          {seg.Origin?.Airport?.CityName ? `, ${seg.Origin.Airport.CityName}` : ""}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: "center", px: { xs: 0, sm: 2 } }}>
                        <Typography sx={{ fontSize: 11.5, color: "#9ca3af" }}>{formatDuration(seg.Duration)}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, my: 0.5 }}>
                          <Box sx={{ width: { xs: 24, sm: 40 }, borderTop: "1px dashed #ccc" }} />
                          <FlightIcon sx={{ fontSize: 16, color: "#c9c9c9", transform: "rotate(90deg)" }} />
                          <Box sx={{ width: { xs: 24, sm: 40 }, borderTop: "1px dashed #ccc" }} />
                        </Box>
                        <Typography sx={{ fontSize: 11.5, color: "#9ca3af" }}>
                          {seg.StopOver ? "Via " + (seg.StopPoint || "1 Stop") : "Non Stop"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#111827" }}>
                          {formatTime(seg.Destination?.ArrTime)}
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                          {seg.Destination?.Airport?.AirportCode}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#9ca3af" }}>
                          {seg.Destination?.Airport?.AirportName}
                          {seg.Destination?.Airport?.CityName ? `, ${seg.Destination.Airport.CityName}` : ""}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          borderLeft: { xs: "none", sm: "1px solid #eee" },
                          borderTop: { xs: "1px solid #eee", sm: "none" },
                          pl: { xs: 0, sm: 2 },
                          pt: { xs: 1.5, sm: 0 },
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#111827" }}>
                          {seg.Airline?.AirlineCode} {seg.Airline?.FlightNumber}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#9ca3af" }}>{seg.Airline?.AirlineName}</Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#9ca3af" }}>
                          {CABIN_CLASS_LABEL[seg.CabinClass] || "Economy"} {seg.Remark ? ` | ${seg.Remark}` : ""}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* ── Fare & Tax ── */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box sx={cardSx}>
                    <Typography sx={sectionTitleSx}>Fare &amp; Charges (All amounts in {fare.Currency || "INR"})</Typography>
                    <FareRow label="Base Fare" value={money(fare.BaseFare)} />
                    <FareRow
                      label="Tax"
                      value={money(fare.Tax)}
                      onClick={() => setExpandedTax((v) => !v)}
                      expandable
                      expanded={expandedTax}
                    />
                    <FareRow label="Other Charges" value={money(fare.OtherCharges)} />

                    <Divider sx={{ my: 1.5 }} />

                    <FareRow label="Total Baggage Charges" value={money(fare.TotalBaggageCharges)} />
                    <FareRow label="Total Meal Charges" value={money(fare.TotalMealCharges)} />
                    <FareRow label="Total Seat Charges" value={money(fare.TotalSeatCharges)} />
                    <FareRow label="Total Special Service Charges" value={money(fare.TotalSpecialServiceCharges)} />

                    <Divider sx={{ my: 1.5 }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: "#eef2ff",
                        borderRadius: "8px",
                        px: 1.5,
                        py: 1.25,
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>Total Amount Paid</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>
                        {money(fare.OfferedFare ?? fare.PublishedFare)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.5 }}>
                      <InfoOutlinedIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
                      <Typography sx={{ fontSize: 11.5, color: "#9ca3af" }}>
                        Published Fare: {money(fare.PublishedFare)} &nbsp;|&nbsp; Currency: {fare.Currency || "INR"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    {expandedTax && (
                      <Box sx={cardSx}>
                        <Typography sx={sectionTitleSx}>Tax Breakup</Typography>
                        {taxBreakup.map((t, idx) => (
                          <FareRow key={idx} label={t.key} value={money(t.value)} />
                        ))}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            bgcolor: "#eef2ff",
                            borderRadius: "8px",
                            px: 1.5,
                            py: 1,
                            mt: 1,
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#111827" }}>Total Tax</Typography>
                          <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>{money(fare.Tax)}</Typography>
                        </Box>
                      </Box>
                    )}

                    {chargeBU.length > 0 && (
                      <Box sx={cardSx}>
                        <Typography sx={sectionTitleSx}>Other Charges Breakup</Typography>
                        {chargeBU.map((c, idx) => (
                          <FareRow key={idx} label={c.key} value={money(c.value)} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* ── Extras Summary ── */}
                <Box sx={cardSx}>
                  <Typography sx={sectionTitleSx}>Extras Summary</Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                      gap: 1.5,
                    }}
                  >
                    <ExtraTile icon={<LuggageIcon sx={{ fontSize: 18 }} />} label="Baggage" value={money(fare.TotalBaggageCharges)} bg="#eef2ff" color="#4338ca" />
                    <ExtraTile icon={<RestaurantIcon sx={{ fontSize: 18 }} />} label="Meal" value={money(fare.TotalMealCharges)} bg="#f0fdf4" color={GREEN} />
                    <ExtraTile icon={<EventSeatIcon sx={{ fontSize: 18 }} />} label="Seat" value={money(fare.TotalSeatCharges)} bg="#f5f3ff" color="#7c3aed" />
                    <ExtraTile icon={<NotificationsActiveIcon sx={{ fontSize: 18 }} />} label="Special Services" value={money(fare.TotalSpecialServiceCharges)} bg="#fffbeb" color="#b45309" />
                  </Box>
                </Box>

                {/* ── Meta grid ── */}
                <Box sx={cardSx}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, rowGap: 2, columnGap: 2 }}>
                    <MetaItem label="Booking ID" value={fi.BookingId || "—"} />
                    <MetaItem label="Issuance PCC" value={fi.IssuancePcc || "—"} />
                    <MetaItem label="Is Partial Void Allowed" value={fi.IsPartialVoidAllowed ? "Yes" : "No"} />
                    <MetaItem label="Booking Allowed For Roamer" value={fi.BookingAllowedForRoamer ? "Yes" : "No"} />
                    <MetaItem label="PNR" value={fi.PNR || "—"} />
                    <MetaItem label="Is LCC" value={fi.IsLCC ? "Yes" : "No"} />
                    <MetaItem label="Is Auto Reissuance Allowed" value={fi.IsAutoReissuanceAllowed ? "Yes" : "No"} />
                    <MetaItem label="TBO Confirmation No." value={fi.TBOConfNo || "—"} />
                    <MetaItem label="Non Refundable" value={fi.NonRefundable ? "Yes" : "No"} />
                  </Box>
                </Box>

                {/* ── Footer note ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#eef2ff", borderRadius: "10px", px: 2, py: 1.5 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: "#4338ca", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 12.5, color: "#3730a3" }}>
                    This is an e-ticket. Please carry a valid photo ID at the time of travel.
                  </Typography>
                </Box>

                {isMultiJourney && jIdx < journeyList.length - 1 && <Divider sx={{ mt: 3 }} />}
              </Box>
            );
          })
        )}
      </DialogContent>
    </Dialog>
  );
};

const cardSx = {
  bgcolor: "#fff",
  borderRadius: "14px",
  border: "1px solid #e8e8e8",
  p: { xs: 1.5, sm: 2.5 },
  mb: 2,
};

const sectionTitleSx = { fontWeight: 800, fontSize: 15, color: "#0f1e4d", mb: 1.5 };

const MetaItem = ({ icon, label, value, inline }) => (
  <Box sx={{ display: "flex", alignItems: inline ? "center" : "flex-start", gap: inline ? 0.75 : 0, flexDirection: inline ? "row" : "column" }}>
    {icon && !inline && <Box sx={{ mb: 0.5 }}>{icon}</Box>}
    <Box>
      <Typography sx={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: inline ? 13 : 14, fontWeight: 700, color: "#111827", wordBreak: "break-word" }}>{value}</Typography>
    </Box>
  </Box>
);

const FareRow = ({ label, value, onClick, expandable, expanded }) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      py: 0.9,
      cursor: expandable ? "pointer" : "default",
      userSelect: expandable ? "none" : "auto",
    }}
  >
    <Typography sx={{ fontSize: 13.5, color: "#374151" }}>{label}</Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{value}</Typography>
      {expandable && (
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 18,
            color: "#9ca3af",
            transition: "transform 0.2s ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      )}
    </Box>
  </Box>
);

const ExtraTile = ({ icon, label, value, bg, color }) => (
  <Box
    sx={{
      border: "1px solid #eee",
      borderRadius: "10px",
      p: 1.25,
      display: "flex",
      alignItems: "center",
      gap: 1,
      minWidth: 0,
    }}
  >
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "8px",
        bgcolor: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography noWrap sx={{ fontSize: 11.5, color: "#6b7280", fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 800, color: "#111827" }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

export default BookingDetailsDialog;