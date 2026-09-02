// pages\my-travel-trips\BusCancellationCard.jsx
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
import { GREEN } from "components/travel-hooks/my-trips/constants";
import { getBusCancellationStatus } from "travel-api/busApi";


const money = (v) =>
    v === undefined || v === null || v === "" || Number(v) === 0
        ? "—"
        : `₹${Number(v).toLocaleString("en-IN")}`;

const formatDate = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

// ── Bus cancellation ek standalone record hai (order-level grouping
// nahi hoti jaise flight me), isliye flight ke CancellationCard +
// ChangeRequestRow do-layer structure ko yaha ek single card me merge
// kar diya hai — visual language (border, icon, chip, "Check Status")
// bilkul same rakha gaya hai. ──
const BusCancellationCard = ({ booking }) => {
    const [checking, setChecking] = useState(false);

    const {
        trace_id,
        ticket_number,
        change_request_id,
        status,
        credit_note_no,
        total_price,
        refunded_amount,
        cancellation_charge,
        service_charge,
        created_at,
    } = booking || {};

    const handleCheckStatus = async () => {
        setChecking(true);
        try {
            const res = await getBusCancellationStatus(trace_id, change_request_id);
            const data = res?.data || {};
            const refund = (data.refunds && data.refunds[0]) || {};

            Swal.fire({
                title: "Cancellation Status",
                confirmButtonColor: GREEN,
                confirmButtonText: "Close",
                html: `
          <div style="text-align:left; font-family:inherit;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
              <span style="
                display:inline-block; padding:4px 12px; border-radius:20px;
                font-size:12.5px; font-weight:700;
                background:#fee2e2; color:#dc2626;
              ">${(status || "CANCELLED").toUpperCase()}</span>
            </div>

            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <tr>
                <td style="padding:6px 0; color:#9ca3af;">Trace ID</td>
                <td style="padding:6px 0; font-weight:700; text-align:right; word-break:break-all;">${data.trace_id ?? trace_id ?? "—"
                    }</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#9ca3af;">Credit Note No</td>
                <td style="padding:6px 0; font-weight:700; text-align:right;">${refund.credit_note_no ?? credit_note_no ?? "—"
                    }</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#9ca3af;">Total Price</td>
                <td style="padding:6px 0; font-weight:700; text-align:right;">${money(refund.total_price ?? total_price)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#9ca3af;">Cancellation Charge</td>
                <td style="padding:6px 0; font-weight:700; text-align:right;">${money(refund.cancellation_charge ?? cancellation_charge)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#9ca3af;">Service Charge</td>
                <td style="padding:6px 0; font-weight:700; text-align:right;">${money(refund.service_charge ?? service_charge)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#9ca3af;">Refunded Amount</td>
                <td style="padding:6px 0; font-weight:700; text-align:right; color:${GREEN};">${money(refund.refunded_amount ?? refunded_amount)}</td>
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
        <Card
            elevation={0}
            sx={{
                border: "1px solid #e5e7eb",
                borderLeft: "4px solid #dc2626",
                borderRadius: "14px",
                height: "fit-content",
                transition: "all 0.2s ease",
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
                    <Typography
                        sx={{
                            fontSize: 12.5,
                            fontWeight: 800,
                            color: "#1a1a1a",
                            wordBreak: "break-all",
                        }}
                    >
                        Ticket: {ticket_number || "—"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "#4b5563", mt: 0.2 }}>
                            Change Request ID: {change_request_id ?? "—"}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#4b5563", mt: 0.2, wordBreak: "break-all" }}>
                            Credit Note: {credit_note_no || "—"}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#9ca3af", mt: 0.25 }}>
                            Cancellation · {formatDate(created_at)}
                        </Typography>
                    </Box>

                    <Chip
                        size="small"
                        label={status || "CANCELLED"}
                        sx={{
                            fontSize: 10.5,
                            height: 20,
                            fontWeight: 700,
                            bgcolor: "#fee2e2",
                            color: "#dc2626",
                            flexShrink: 0,
                        }}
                    />
                </Box>

                <Divider sx={{ my: 1.4 }} />

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2, mb: 1.4 }}>
                    <Box>
                        <Typography sx={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", fontWeight: 600 }}>
                            Total Price
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{money(total_price)}</Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", fontWeight: 600 }}>
                            Refunded
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: GREEN }}>{money(refunded_amount)}</Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", fontWeight: 600 }}>
                            Cancel Charge
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                            {money(cancellation_charge)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", fontWeight: 600 }}>
                            Service Charge
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                            {money(service_charge)}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
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
            </CardContent>
        </Card>
    );
};

export default BusCancellationCard;