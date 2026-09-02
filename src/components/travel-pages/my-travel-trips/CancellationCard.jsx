// pages\my-travel-trips\CancellationCard.jsx
import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Divider,
    Button,
    CircularProgress,
    Chip,
} from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import Swal from "sweetalert2";
import { getChangeRequestStatus } from "components/travel-hooks/my-trips/MyTripsApi";
import { CHANGE_REQUEST_STATUS, DEFAULT_CHANGE_REQUEST_STATUS, GREEN } from "components/travel-hooks/my-trips/constants";

const REQUEST_TYPE_LABELS = {
    1: "Full Cancellation",
    2: "Partial Cancellation",
    3: "Reissuance",
};

const money = (v) =>
    v === undefined || v === null || v === "" || Number(v) === 0
        ? "—"
        : `₹${Number(v).toLocaleString("en-IN")}`;

const formatDate = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

// ── Ek order ke andar jitne bhi cancellation/change-requests hain
// (round trip me multiple booking_id, ya same booking pe multiple
// requests) — sab yaha ek card ke andar list hote hain. ──
const CancellationCard = ({ orderId, requests = [] }) => {
    return (
        <Card
            elevation={0}
            sx={{
                border: "1px solid #e5e7eb",
                borderLeft: "4px solid #dc2626",
                borderRadius: "14px",
                transition: "all 0.2s ease",
                height: "fit-content", // ✅ NAYA — card apni content jitni hi height le, stretch na ho
                "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.09)" },
            }}
        >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <Box
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            bgcolor: "#fee2e2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <CancelOutlinedIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                    </Box>
                    {/* ✅ UPDATED — poora order_id dikhega, truncate nahi hoga */}
                    <Typography
                        sx={{
                            fontSize: 12.5,
                            fontWeight: 800,
                            color: "#1a1a1a",
                            wordBreak: "break-all",
                        }}
                    >
                        Order: {orderId || "—"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {requests.map((req, idx) => (
                        <React.Fragment key={req.change_request_id}>
                            {idx > 0 && <Divider sx={{ my: 1.4 }} />}
                            <ChangeRequestRow request={req} />
                        </React.Fragment>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

// ── Ek single change-request row — compact display, "Check Status"
// click par live status SweetAlert popup me professionally dikhta hai. ──
const ChangeRequestRow = ({ request }) => {
    const [checking, setChecking] = useState(false);

    const listStatusMeta =
        CHANGE_REQUEST_STATUS[request.change_request_status] || DEFAULT_CHANGE_REQUEST_STATUS;

    const handleCheckStatus = async () => {
        setChecking(true);
        try {
            const res = await getChangeRequestStatus(request.change_request_id);
            const data = res?.data || {};
            const code = data?.raw?.ChangeRequestStatus ?? data?.status;
            const meta = CHANGE_REQUEST_STATUS[code] || DEFAULT_CHANGE_REQUEST_STATUS;

            Swal.fire({
                title: "Change Request Status",
                confirmButtonColor: GREEN,

                confirmButtonText: "Close",
                html: `
          <div style="text-align:left; font-family:inherit;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
              <span style="
                display:inline-block; padding:4px 12px; border-radius:20px;
                font-size:12.5px; font-weight:700;
                background:${meta.bg}; color:${meta.color};
              ">${meta.label}</span>
            </div>

            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <tr>
                <td style="padding:6px 0; color:#9ca3af;">Trace ID</td>
                <td style="padding:6px 0; font-weight:700; text-align:right;">${data.trace_id ?? "—"}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#9ca3af;">Change Request ID</td>
                <td style="padding:6px 0; font-weight:700; text-align:right;">${data.change_request_id ?? "—"}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#9ca3af;">Ticket ID</td>
                <td style="padding:6px 0; font-weight:700; text-align:right;">${data.ticket_id ?? "—"}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#9ca3af;">Cancellation Charge</td>
                <td style="padding:6px 0; font-weight:700; text-align:right;">${money(data.cancellation_charge)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#9ca3af;">Refunded Amount</td>
                <td style="padding:6px 0; font-weight:700; text-align:right; color:${GREEN};">${money(data.refunded_amount)}</td>
              </tr>
            </table>

            ${data.message
                        ? `<div style="margin-top:14px; padding:10px 12px; background:#f8fafc; border-radius:8px; font-size:12.5px; color:#374151;">
                     ${data.message}
                   </div>`
                        : ""
                    }
          </div>
        `,
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Unable to Fetch Status",
                text: err?.message || "Something went wrong while checking the status.",
                confirmButtonColor: "#dc2626",
            });
        } finally {
            setChecking(false);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>
                        Booking ID: {request.booking_id}
                    </Typography>
                    {/* ✅ UPDATED — "CR ID" ki jagah ab full naam "Change Request ID" niche alag line mein */}
                    <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "#4b5563", mt: 0.2 }}>
                        Change Request ID: {request.change_request_id}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#9ca3af", mt: 0.25 }}>
                        {REQUEST_TYPE_LABELS[request.request_type] || "Cancellation"} · {formatDate(request.created_at)}
                    </Typography>
                </Box>

                <Chip
                    size="small"
                    label={listStatusMeta.label}
                    sx={{
                        fontSize: 10.5,
                        height: 20,
                        fontWeight: 700,
                        bgcolor: listStatusMeta.bg,
                        color: listStatusMeta.color,
                        flexShrink: 0,
                    }}
                />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 0.4 }}>
                {request.remarks ? (
                    <Typography sx={{ fontSize: 11.5, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {request.remarks}
                    </Typography>
                ) : (
                    <span />
                )}

                <Button
                    size="small"
                    variant="outlined"
                    onClick={handleCheckStatus}
                    disabled={checking}
                    startIcon={checking ? <CircularProgress size={12} /> : <FactCheckOutlinedIcon sx={{ fontSize: 14 }} />}
                    sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: 11.5,
                        borderRadius: "8px",
                        px: 1.4,
                        py: 0.3,
                        minWidth: 0,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        borderColor: GREEN,
                        color: GREEN,
                        "&:hover": { borderColor: GREEN, bgcolor: "#f0fdf4" },
                    }}
                >
                    {checking ? "Checking..." : "Check Status"}
                </Button>
            </Box>
        </Box>
    );
};

export default CancellationCard;