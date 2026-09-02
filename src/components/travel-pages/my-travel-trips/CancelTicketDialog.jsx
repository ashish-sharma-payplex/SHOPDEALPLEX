// pages\my-travel-trips\CancelTicketDialog.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  TextField,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
  CircularProgress,
  Alert,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  InputLabel,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlightIcon from "@mui/icons-material/Flight";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useFlightCancellationCharges } from "components/travel-hooks/flight/useFlightCancellationCharges";
import { useFlightChangeRequest } from "components/travel-hooks/flight/useFlightChangeRequest";
import { getBookingDetails } from "components/travel-hooks/my-trips/MyTripsApi";
import { GREEN } from "components/travel-hooks/my-trips/constants";

const REQUEST_TYPES = [
  { value: 1, label: "Full Cancellation" },
  { value: 2, label: "Partial Cancellation" },
];

const CANCELLATION_TYPES = [
  { value: 1, label: "No Show" },
  { value: 2, label: "Flight Cancelled" },
  { value: 3, label: "Others" },
];

// ✅ NAYA — CancellationType ka wahi "3" (Others) value, jisme hi
// multiple Sectors allow karne hain. Isko yaha ek jagah rakha hai
// taaki magic-number "3" repeat na ho.
const OTHERS_CANCELLATION_TYPE = 3;

const money = (amt, currency = "INR") => {
  if (amt === null || amt === undefined) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amt);
  } catch {
    return `₹${Number(amt).toLocaleString("en-IN")}`;
  }
};

// ✅ NAYA — international round-trip bookings me ek hi booking_id ke
// Segments array me Outbound + Return dono ke legs hote hain
// (TripIndicator: 1 = Outbound, 2 = Return). Yaha se unhe group karke
// har direction ka actual origin→destination nikaalte hain, taaki
// summary card me sirf "DXB → HND" (pehla connecting leg) na dikhe.
const groupSegmentsByTrip = (segments = []) => {
  const grouped = segments.reduce((acc, seg) => {
    const key = seg?.TripIndicator ?? 1;
    if (!acc[key]) acc[key] = [];
    acc[key].push(seg);
    return acc;
  }, {});
  return Object.keys(grouped)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => grouped[k]);
};

const routeLabel = (group = []) => {
  if (!group.length) return "";
  const from = group[0]?.Origin?.Airport?.AirportCode || "";
  const to = group[group.length - 1]?.Destination?.Airport?.AirportCode || "";
  return `${from} → ${to}`;
};

// ✅ NAYA — ek khaali sector row banane ka helper
const emptySector = (origin = "", destination = "") => ({ origin, destination });

export default function CancelTicketDialog({ open, booking, onClose, onSuccess }) {
  const { getCancellationCharges, loading: chargesLoading, error: chargesError } =
    useFlightCancellationCharges();
  const { sendChangeRequest, loading: submitting, error: submitError } =
    useFlightChangeRequest();

  const cancellableJourneys = useMemo(
    () => (booking?.journeys || []).filter((j) => j.booking_id),
    [booking],
  );

  const [selectedJourneyIdx, setSelectedJourneyIdx] = useState(0);
  const selectedJourney = cancellableJourneys[selectedJourneyIdx] || null;

  const [charges, setCharges] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  // ── booking-details se passengers/tickets nikalne ke liye ──────────────
  const [passengers, setPassengers] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // ✅ NAYA — booking-details se actual itinerary segments (Outbound/Return
  // dono, agar round trip hai) summary card me sahi route dikhane ke liye
  const [tripGroups, setTripGroups] = useState([]);
  const [journeyTypeCode, setJourneyTypeCode] = useState(null);

  const [requestType, setRequestType] = useState(1);
  const [cancellationType, setCancellationType] = useState(0);
  const [remarks, setRemarks] = useState("");

  // ✅ UPDATED — single sectorOrigin/sectorDestination ki jagah ab
  // ek array hai, taaki Partial + Others combination me multiple
  // sector pairs bheje ja sakein (jaise TOY→HND aur NRT→DXB dono).
  const [sectors, setSectors] = useState([emptySector()]);

  const [localSubmitError, setLocalSubmitError] = useState(null);

  // ✅ NAYA — ab ek ARRAY hai (multiple ticket ids select ho sakte hain,
  // sirf Partial Cancellation ke liye use hoga)
  const [ticketIds, setTicketIds] = useState([]);

  const isPartial = requestType === 2;

  // ✅ NAYA — multi-sector sirf Partial Cancellation + "Others" reason
  // ke combination me allow hoga. Baaki sab combinations me (Partial +
  // No Show / Flight Cancelled) pehle jaisa hi single sector rahega.
  const allowMultipleSectors = isPartial && cancellationType === OTHERS_CANCELLATION_TYPE;

  // ✅ UPDATED — Ticket Id selection ab SIRF Partial Cancellation
  // (RequestType 2) me allow hogi. Full Cancellation (1) + Others (3)
  // combination me ab Ticket Id selector nahi dikhega — hata diya gaya.
  const requiresTicketSelection = isPartial;

  // ✅ sirf tab true jab booking-details me actually 2+ direction
  // groups milein (ya JourneyType === 2). Domestic/one-way bookings ke
  // liye ye false hi rahega aur UI pehle jaisi normal dikhegi.
  const isRoundTripItinerary = tripGroups.length > 1 || journeyTypeCode === 2;
  const outboundGroup = tripGroups[0] || [];
  const returnGroup = tripGroups[1] || [];

  // ── Dialog open hote hi / leg badalte hi charges + booking-details dono fetch ──
  useEffect(() => {
    if (!open || !selectedJourney) return;

    let cancelled = false;
    setCharges(null);
    setLoadError(null);
    setSubmitted(null);
    setPassengers([]);
    setTicketIds([]);
    setTripGroups([]); // ✅ NAYA
    setJourneyTypeCode(null); // ✅ NAYA
    setLocalSubmitError(null); // ✅ purana "already exists" error yahi clear hota hai
    setSectors([emptySector(selectedJourney.origin || "", selectedJourney.destination || "")]);

    (async () => {
      try {
        const data = await getCancellationCharges(selectedJourney.booking_id);
        if (!cancelled) setCharges(data);
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      }
    })();

    (async () => {
      try {
        setDetailsLoading(true);
        const res = await getBookingDetails(selectedJourney.booking_id);
        const itinerary = res?.data?.raw?.FlightItinerary || {};
        const pax = itinerary?.Passenger || [];
        const segments = itinerary?.Segments || [];
        if (!cancelled) {
          setPassengers(pax);
          setTripGroups(groupSegmentsByTrip(segments)); // ✅ NAYA
          setJourneyTypeCode(itinerary?.JourneyType ?? null); // ✅ NAYA
          // single-passenger booking ho to uska TicketId auto-select kar do
          if (pax.length === 1 && pax[0]?.Ticket?.TicketId) {
            setTicketIds([String(pax[0].Ticket.TicketId)]);
          }
        }
      } catch (err) {
        // silent — sirf display ke liye hai
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedJourney?.booking_id]);

  useEffect(() => {
    if (!open) {
      setSelectedJourneyIdx(0);
      setRequestType(1);
      setCancellationType(0);
      setRemarks("");
      setTicketIds([]);
      setSubmitted(null);
      setPassengers([]);
      setTripGroups([]); // ✅ NAYA
      setJourneyTypeCode(null); // ✅ NAYA
      setSectors([emptySector()]); // ✅ NAYA
    }
  }, [open]);

  // ✅ NAYA — agar user "Others" se hatke kisi aur Cancellation Type pe
  // switch karta hai (ya Partial se bahar jaata hai), to extra sector
  // rows drop karke sirf pehli row rakh do — payload me galti se multiple
  // sectors na chale jayein jab wo allowed hi nahi hai.
  useEffect(() => {
    if (!allowMultipleSectors) {
      setSectors((prev) => (prev.length > 1 ? [prev[0]] : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowMultipleSectors]);

  useEffect(() => {
    if (submitError) setLocalSubmitError(submitError);
  }, [submitError]);

  // ✅ NAYA — sector row helpers
  const updateSector = (idx, field, value) => {
    setSectors((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value.toUpperCase() } : s)),
    );
  };

  const addSector = () => {
    setSectors((prev) => [...prev, emptySector()]);
  };

  const removeSector = (idx) => {
    setSectors((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  };

  const raw = charges?.raw?.Response;
  const refundAmount = raw?.RefundAmount ?? charges?.refund_amount;
  const cancellationCharge = raw?.CancellationCharge ?? charges?.cancellation_charge;
  const currency = raw?.Currency ?? charges?.currency ?? "INR";
  const gst = raw?.GST;
  const paxCharges = raw?.CancelChargeDetails || [];

  // ✅ Summary box ke liye
  const summaryTicketId =
    passengers.length === 1
      ? passengers[0]?.Ticket?.TicketId
      : passengers.length > 1
        ? "Multiple"
        : null;

  // ✅ UPDATED — Partial me har sector row ka Origin + Destination dono
  // filled hone chahiye (chahe 1 ho ya multiple)
  const sectorsValid =
    !isPartial || sectors.every((s) => s.origin?.trim() && s.destination?.trim());

  // ✅ UPDATED — TicketId ab sirf Partial ke liye mandatory hai. Baaki
  // combinations (jaha selector hi nahi dikhta) me ye check apne aap
  // skip ho jata hai.
  const canSubmit =
    !!selectedJourney &&
    !!requestType &&
    !!cancellationType &&
    (!requiresTicketSelection || ticketIds.length > 0) &&
    sectorsValid &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLocalSubmitError(null);
    try {
      const payload = {
        BookingId: Number(selectedJourney.booking_id),
        RequestType: requestType,
        CancellationType: cancellationType,
        Remarks: remarks || "",
        // ✅ Sectors sirf Partial (RequestType 2) me jaate hain — Full
        // Cancellation (1) me Sectors kabhi nahi jaate.
        // ✅ UPDATED — Sectors ab poore array se banta hai. Normally
        // (Partial + No Show/Flight Cancelled) ye array me sirf 1 hi
        // entry hoti hai — jaisa pehle tha. "Others" ke saath user ne
        // agar aur rows add ki hain, to wo sab is array me chali jaayengi.
        ...(isPartial && {
          Sectors: sectors.map((s) => ({ Origin: s.origin, Destination: s.destination })),
        }),
        // ✅ UPDATED — TicketId ab sirf Partial Cancellation me bhejte hain.
        ...(requiresTicketSelection && {
          TicketId: ticketIds.map((id) => Number(id)), // ✅ array of numbers
        }),
      };
      const result = await sendChangeRequest(payload);
      setSubmitted(result || { ok: true });
    } catch (err) {
      // error already captured in submitError via hook state
    }
  };

  const handleDone = () => {
    onClose?.();
    if (submitted) onSuccess?.();
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f0f0f0",
          py: 1.5,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: 17 }}>Cancel Ticket</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {submitted ? (
          <Box sx={{ p: 3 }}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Box sx={{ fontSize: 46, mb: 1 }}>✅</Box>
              <Typography sx={{ fontWeight: 800, fontSize: 17, color: GREEN, mb: 0.5 }}>

                Cancellation Request Submitted
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                {submitted.message}
              </Typography>
            </Box>

            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2.5,
                p: 1.8,
                bgcolor: "#fafafa",
              }}
            >
              <Grid container spacing={1.4}>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>
                    Change Request ID
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    {submitted.change_request_id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>
                    Status
                  </Typography>
                  <Chip
                    size="small"
                    label={submitted.change_request_status_label}
                    sx={{
                      fontSize: 11,
                      height: 20,
                      textTransform: "capitalize",
                      bgcolor: "#fef3c7",
                      color: "#92400e",
                      fontWeight: 700,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>
                    Request Status
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, textTransform: "capitalize" }}>
                    {submitted.request_status_label}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>
                    Remarks
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    {submitted.remarks}
                  </Typography>
                </Grid>
              </Grid>

              {/* ✅ NAYA — jab submit hua tha use multiple sectors, to confirmation
                  screen pe bhi wo sab sectors dikha do, taaki user ko confirm ho
                  jaaye ki dono/saari sectors sahi se submit hui hain. */}
              {isPartial && sectors.length > 0 && sectors.some((s) => s.origin || s.destination) && (
                <>
                  <Divider sx={{ my: 1.4 }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#111827", mb: 0.8 }}>
                    Sector(s) Submitted
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                    {sectors.map((s, idx) => (
                      <Chip
                        key={idx}
                        size="small"
                        label={`${s.origin || "—"} → ${s.destination || "—"}`}
                        sx={{ fontSize: 11, height: 22, bgcolor: "#f0fdf4", color: GREEN, fontWeight: 700 }}
                      />
                    ))}
                  </Box>
                </>
              )}

              {submitted.raw?.TicketCRInfo?.length > 0 && (
                <>
                  <Divider sx={{ my: 1.4 }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#111827", mb: 0.8 }}>
                    Ticket-wise Status
                  </Typography>
                  {submitted.raw.TicketCRInfo.map((t, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 12,
                        mb: 0.6,
                      }}
                    >
                      <span>Ticket ID: <b>{t.TicketId}</b></span>
                      <Chip
                        size="small"
                        label={t.Remarks}
                        sx={{
                          fontSize: 10.5,
                          height: 19,
                          bgcolor: t.Status === 1 ? "#f0fdf4" : "#fef2f2",
                          color: t.Status === 1 ? GREEN : "#dc2626",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  ))}
                </>
              )}

              <Typography sx={{ fontSize: 10.5, color: "#9ca3af", mt: 1.2 }}>
                Trace ID: {submitted.trace_id}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2.5 }}>
            {cancellableJourneys.length > 1 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#9ca3af", mb: 0.8 }}>
                  SELECT LEG TO CANCEL
                </Typography>
                <ToggleButtonGroup
                  value={selectedJourneyIdx}
                  exclusive
                  size="small"
                  onChange={(_, val) => val !== null && setSelectedJourneyIdx(val)}
                  sx={{ display: "flex", width: "100%" }}
                >
                  {cancellableJourneys.map((j, idx) => (
                    <ToggleButton
                      key={j.booking_id}
                      value={idx}
                      sx={{
                        flex: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 12.5,
                        "&.Mui-selected": { bgcolor: "#f0fdf4", color: GREEN, borderColor: GREEN },
                      }}
                    >
                      {j.journey_type} · {j.origin}→{j.destination}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            )}

            {/* ── TICKET SUMMARY ────────────────────────────────────────── */}
            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2.5,
                p: 1.8,
                mb: 2,
                bgcolor: "#fafafa",
              }}
            >
              {/* ✅ UPDATED — agar booking-details se pata chale ki ye
                  actually round trip hai (Outbound + Return segments dono
                  ek hi booking_id me), to dono direction ke asli routes
                  dikhao + "Round Trip" chip. Warna (domestic / one-way)
                  pehle jaisa hi single route + journey_type chip normal
                  rahega — koi change nahi. */}
              {isRoundTripItinerary ? (
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <FlightIcon sx={{ fontSize: 18, color: GREEN, transform: "rotate(45deg)" }} />
                    <Chip
                      size="small"
                      label="Round Trip"
                      sx={{ fontSize: 10.5, height: 20, bgcolor: "#ede9fe", color: "#7c3aed", fontWeight: 700 }}
                    />
                  </Box>

                  {/* ✅ NAYA — har group (Outbound / Return) ke andar jitne bhi
        individual segments hain (connecting flights samet), sab
        alag-alag line me dikhte hain — sirf first→last route nahi */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {outboundGroup.length > 0 && (
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4 }}>
                          <Chip size="small" label="Outbound" sx={{ fontSize: 9.5, height: 18, bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }} />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3, pl: 0.5 }}>
                          {outboundGroup.map((seg, idx) => (
                            <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                                {seg?.Origin?.Airport?.AirportCode || "—"} → {seg?.Destination?.Airport?.AirportCode || "—"}
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                                {seg?.Airline?.AirlineCode} {seg?.Airline?.FlightNumber}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {returnGroup.length > 0 && (
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4 }}>
                          <Chip size="small" label="Return" sx={{ fontSize: 9.5, height: 18, bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 }} />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3, pl: 0.5 }}>
                          {returnGroup.map((seg, idx) => (
                            <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                                {seg?.Origin?.Airport?.AirportCode || "—"} → {seg?.Destination?.Airport?.AirportCode || "—"}
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                                {seg?.Airline?.AirlineCode} {seg?.Airline?.FlightNumber}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <FlightIcon sx={{ fontSize: 18, color: GREEN, transform: "rotate(45deg)" }} />
                  <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
                    {selectedJourney?.origin} → {selectedJourney?.destination}
                  </Typography>
                  <Chip
                    size="small"
                    label={selectedJourney?.journey_type}
                    sx={{ fontSize: 10.5, height: 20 }}
                  />
                </Box>
              )}

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>PNR</Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                    {selectedJourney?.pnr || "—"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>Booking ID</Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                    {selectedJourney?.booking_id || "—"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>Ticket ID</Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                    {detailsLoading ? "Loading..." : summaryTicketId || "—"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>Fare Paid</Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                    {selectedJourney?.fare?.published_fare
                      ? money(selectedJourney.fare.published_fare)
                      : "—"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>Order Status</Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                    {booking.status}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {chargesLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
                <CircularProgress size={18} sx={{ color: GREEN }} />
                <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                  Fetching cancellation charges...
                </Typography>
              </Box>
            ) : loadError ? (
              <Alert severity="error" sx={{ mb: 2, fontSize: 12.5 }}>
                {loadError}
              </Alert>
            ) : charges ? (
              <Box
                sx={{
                  border: "1px solid #fde68a",
                  background: "#fffbeb",
                  borderRadius: 2.5,
                  p: 1.8,
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#92400e", mb: 1 }}>
                  Cancellation Charges
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>
                      Cancellation Charge
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#dc2626" }}>
                      {money(cancellationCharge, currency)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: 10.5, color: "#9ca3af" }}>
                      Refund Amount
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: GREEN }}>
                      {money(refundAmount, currency)}
                    </Typography>
                  </Grid>
                  {gst && (
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: 10.5, color: "#9ca3af", mt: 0.5 }}>
                        GST (Taxable: {money(gst.TaxableAmount, currency)}) — IGST{" "}
                        {gst.IGSTRate}% = {money(gst.IGSTAmount, currency)}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {paxCharges.length > 0 && (
                  <>
                    <Divider sx={{ my: 1.2 }} />
                    {paxCharges.map((p, idx) => (
                      <Box
                        key={idx}
                        sx={{ display: "flex", justifyContent: "space-between", fontSize: 12, mb: 0.4 }}
                      >
                        <span>
                          {p.Title} {p.FirstName} {p.LastName}
                        </span>
                        <span style={{ fontWeight: 700 }}>
                          Refund: {money(p.RefundAmount, currency)}
                        </span>
                      </Box>
                    ))}
                  </>
                )}
              </Box>
            ) : null}

            <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#111827", mb: 1.2 }}>
              Cancellation Request Details
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              label="Request Type"
              value={requestType}
              onChange={(e) => setRequestType(Number(e.target.value))}
              sx={{ mb: 1.6 }}
              required
            >
              {REQUEST_TYPES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Cancellation Type"
              value={cancellationType}
              onChange={(e) => setCancellationType(Number(e.target.value))}
              sx={{ mb: 1.6 }}
              required
            >
              <MenuItem value={0} disabled>
                Select a reason
              </MenuItem>
              {CANCELLATION_TYPES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            {/* ✅ Sectors + TicketId — SIRF Partial Cancellation (RequestType 2) me dikhega */}
            {isPartial && (
              <>
                {/* ✅ UPDATED — ab ek-ek karke sector rows dikhte hain.
                    Normal case (No Show / Flight Cancelled) me sirf 1 row
                    dikhegi, koi "Add" button nahi. "Others" select hote hi
                    "+ Add Another Sector" button appear ho jayega. */}
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#9ca3af", mb: 0.8 }}>
                  {allowMultipleSectors ? "SECTOR(S)" : "SECTOR"}
                </Typography>

                {sectors.map((sector, idx) => (
                  <Grid container spacing={1.2} sx={{ mb: 1 }} key={idx} alignItems="center">
                    <Grid item xs={allowMultipleSectors ? 5 : 6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Sector Origin"
                        value={sector.origin}
                        onChange={(e) => updateSector(idx, "origin", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={allowMultipleSectors ? 5 : 6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Sector Destination"
                        value={sector.destination}
                        onChange={(e) => updateSector(idx, "destination", e.target.value)}
                      />
                    </Grid>
                    {/* ✅ NAYA — remove button sirf tab dikhega jab multi-sector
                        allowed hai aur 1 se zyada rows hain */}
                    {allowMultipleSectors && sectors.length > 1 && (
                      <Grid item xs={2} sx={{ textAlign: "center" }}>
                        <IconButton
                          size="small"
                          onClick={() => removeSector(idx)}
                          sx={{ color: "#dc2626" }}
                        >
                          <RemoveCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                ))}

                {/* ✅ NAYA — sirf Partial + Others combination me hi dikhega */}
                {allowMultipleSectors && (
                  <Button
                    size="small"
                    startIcon={<AddCircleOutlineIcon fontSize="small" />}
                    onClick={addSector}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      color: GREEN,
                      mb: 1.6,
                      px: 0,
                      "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                    }}
                  >
                    Add Another Sector
                  </Button>
                )}

                {!allowMultipleSectors && <Box sx={{ mb: 1.6 }} />}
              </>
            )}

            {/* ✅ UPDATED — Ticket Id selector ab sirf Partial Cancellation
                (RequestType 2) me dikhega. Full Cancellation + Others
                combination ke liye ye hata diya gaya hai. */}
            {requiresTicketSelection && (
              <FormControl fullWidth size="small" sx={{ mb: 1.6 }} required>
                <InputLabel id="ticket-ids-label">Select Passenger(s) / Ticket Id(s)</InputLabel>
                <Select
                  labelId="ticket-ids-label"
                  multiple
                  value={ticketIds}
                  onChange={(e) => setTicketIds(
                    typeof e.target.value === "string"
                      ? e.target.value.split(",")
                      : e.target.value
                  )}
                  input={<OutlinedInput label="Select Passenger(s) / Ticket Id(s)" />}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {passengers.map((p) => {
                    const tid = String(p.Ticket?.TicketId || "");
                    return (
                      <MenuItem key={tid} value={tid}>
                        <Checkbox checked={ticketIds.indexOf(tid) > -1} size="small" />
                        <ListItemText
                          primary={`${p.Title} ${p.FirstName} ${p.LastName} — Ticket #${tid}`}
                        />
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Reason for cancellation (optional)"
            />

            {localSubmitError && (
              <Alert severity="error" sx={{ mt: 2, fontSize: 12.5 }}>
                {localSubmitError}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid #f0f0f0" }}>
        {submitted ? (
          <Button
            fullWidth
            variant="contained"
            onClick={handleDone}
            sx={{ bgcolor: GREEN, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#15803d" } }}
          >
            Done
          </Button>
        ) : (
          <>
            <Button onClick={onClose} sx={{ textTransform: "none", color: "#6b7280" }}>
              Close
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={!canSubmit}
              onClick={handleSubmit}
              sx={{ textTransform: "none", fontWeight: 700, minWidth: 160 }}
            >
              {submitting ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}