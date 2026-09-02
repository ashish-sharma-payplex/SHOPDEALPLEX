import React from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Divider,
    Chip,
    Grid,
    IconButton,
    CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// ─── Status color map ────────────────────────────────────────────────────────
const STATUS_STYLES = {
    ASSIGNED: { bg: "#d1fae5", color: "#065f46" },
    REFUNDED: { bg: "#dcfce7", color: "#166534" },
    REFUND_INITIATED: { bg: "#e0f2fe", color: "#0369a1" },
    RESOLVED: { bg: "#fef9c3", color: "#854d0e" },
    REJECTED: { bg: "#fee2e2", color: "#991b1b" },
    CLOSED: { bg: "#f3f4f6", color: "#374151" },
    PENDING: { bg: "#fff3e0", color: "#d97706" },
};

const getStatusStyle = (s) =>
    STATUS_STYLES[s] ?? { bg: "#f3f4f6", color: "#374151" };

const Row = ({ label, value, isStatus }) => {
    const style = isStatus ? getStatusStyle(value) : null;
    return (
        <>
            <Grid container spacing={1} alignItems="center">
                <Grid item xs={5} sm={4}>
                    <Typography color="text.secondary" fontSize={14}>
                        {label}
                    </Typography>
                </Grid>
                <Grid item xs={7} sm={8} sx={{ display: "flex", justifyContent: "flex-end" }}> {/* ← yeh add karo */}
                    {isStatus ? (
                        <Chip
                            label={value}
                            size="small"
                            sx={{
                                backgroundColor: style.bg,
                                color: style.color,
                                fontWeight: 600,
                                fontSize: 12.5,
                                borderRadius: 10,
                                height: 26,
                                "& .MuiChip-label": { px: 1.5 },
                            }}
                        />
                    ) : (
                        <Typography fontSize={14} fontWeight={500} sx={{ wordBreak: "break-all", textAlign: "right" }}> {/* ← textAlign add karo */}
                            {value || "—"}
                        </Typography>
                    )}
                </Grid>
            </Grid>
            <Divider sx={{ my: 1.5 }} />
        </>
    );
};

// ─── Component ───────────────────────────────────────────────────────────────
// Props:
//   data       → API response object (ya null jab loading ho)
//   isLoading  → boolean
//   onClose    → popup band karne ke liye
export default function TicketStatusCard({ data, isLoading, onClose, serviceName, issueName }) {
    const ticket = data?.ticket;
    const bbps = data?.bbps;

    return (
        <Card sx={{ width: { xs: 320, sm: 420 }, borderRadius: "16px !important", boxShadow: 6 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                {/* Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography fontWeight={700} fontSize={16} color="#111827">
                        Ticket Status
                    </Typography>
                    {onClose && (
                        <IconButton size="small" onClick={onClose} sx={{ color: "#6b7280" }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>

                {/* Loading */}
                {isLoading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                        <CircularProgress size={30} sx={{ color: "#22c55e" }} />
                    </Box>
                )}

                {/* Data */}
                {!isLoading && ticket && (
                    <>
                        <Box sx={{ backgroundColor: "#f9fafb", borderRadius: 2, p: 2 }}>
                            <Row label="Ticket ID" value={ticket.ticket_id} />
                            <Row label="Status" value={ticket.ticket_status} isStatus />
                            <Row label="Service Name" value={serviceName} />
                            <Row label="Txn Reference" value={ticket.txn_reference_id} />
                            <Row label="Issue" value={issueName} />
                            {/* <Row label="Created"         value={ticket.created_at} />
              <Row label="Updated"         value={ticket.updated_at?.slice(0, 16).replace("T", " ")} /> */}
                        </Box>

                        {/* Description */}
                        {/* <Box mt={2}>
              <Typography fontSize={13} color="text.secondary" gutterBottom>
                Your Description
              </Typography>
              <Typography fontSize={14}>{ticket.description || "—"}</Typography>
            </Box> */}

                        {/* BBPS Remarks */}
                        {/* {bbps && (
              <Box mt={2} sx={{ bgcolor: "#f0fdf4", borderRadius: 2, p: 1.5 }}>
                <Typography fontSize={13} color="text.secondary" gutterBottom fontWeight={600}>
                  BBPS Remarks
                </Typography>
                <Typography fontSize={13} color="#374151">
                  {bbps.description || "—"}
                </Typography>
                {bbps.remarks && (
                  <Typography fontSize={12} color="#6b7280" mt={0.5}>
                    {bbps.remarks}
                  </Typography>
                )}
              </Box>
            )} */}
                    </>
                )}

                {/* No data fallback */}
                {!isLoading && !ticket && (
                    <Typography fontSize={14} color="text.secondary" textAlign="center" py={3}>
                        Could not load ticket details.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}