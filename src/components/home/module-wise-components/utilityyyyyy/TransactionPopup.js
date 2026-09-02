import React from 'react';
import {
    Box,
    Card,
    Typography,
    Divider,
    Grid,
    Avatar,
    Chip,
    Button,
    Link,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig = {
    Success: { bg: '#e8f5e9', color: '#2e7d32', dot: '#4CAF50' },
    Pending: { bg: '#FFF8E1', color: '#E65100', dot: '#FFA726' },
    Failed: { bg: '#FFEBEE', color: '#C62828', dot: '#EF5350' },
};

// ─── Copy helper ──────────────────────────────────────────────────────────────
const copyToClipboard = (text) => {
    if (text && text !== '—') navigator.clipboard.writeText(text);
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, copyable = false }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Box>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body1" fontWeight="600" sx={{ wordBreak: 'break-all' }}>
                {value || '—'}
            </Typography>
        </Box>
        {copyable && value && value !== '—' && (
            <Button
                startIcon={<ContentCopyIcon fontSize="small" />}
                size="small"
                sx={{ fontWeight: 600, flexShrink: 0, ml: 1 }}
                onClick={() => copyToClipboard(value)}
            >
                COPY
            </Button>
        )}
    </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TransactionPopup = ({ tx }) => {
    if (!tx) return null;
    // console.log("💳 FULL TX DATA:", tx);

    const commonFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
    const cfg = statusConfig[tx.status] || statusConfig.Pending;

    return (
        <Card
            elevation={3}
            sx={{ width: '100%', borderRadius: 4, overflow: 'visible', position: 'relative', mb: 5 }}
        >
            {/* ── Header ── */}
            <Box sx={{ ...commonFlex, p: 2 }}>
                <Typography variant="h6" fontWeight="700" color="text.primary">
                    {tx.service}
                </Typography>
                <Link href="#" underline="none" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                    <HelpOutlineIcon sx={{ fontSize: 18, mr: 0.5 }} /> Need Help?
                </Link>
            </Box>

            <Divider />

            {/* ── Brand & Status ── */}
            <Box sx={{ p: 2.5 }}>
                <Box sx={{ ...commonFlex }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            src={tx.logo}
                            sx={{ width: 45, height: 45, mr: 2, border: '1px solid #eee', p: 0.3, bgcolor: '#fafafa' }}
                            imgProps={{ style: { objectFit: 'contain' } }}
                        />
                        <Box>
                            <Typography variant="h6" fontWeight="700" letterSpacing={0.5}>
                                {tx.service}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {tx.dateTime}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1 }}>
                        <Typography variant="h6" fontWeight="700">{tx.amount}</Typography>
                        <Chip
                            icon={<FiberManualRecordIcon style={{ fontSize: 10, color: cfg.dot }} />}
                            label={tx.status}
                            size="small"
                            sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, height: 24 }}
                        />
                    </Box>
                </Box>

                {/* Failed reason */}
                {tx.reason && (
                    <Box sx={{ mt: 1.5, px: 1.5, py: 1, bgcolor: '#FFF3F3', borderRadius: 2 }}>
                        <Typography variant="caption" color="error">
                            Reason: {tx.reason}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ── Dashed Divider ── */}
            <Box sx={{ borderBottom: '1px dashed #ccc', mx: 2, mb: 2 }} />

            {/* ── Service Information ── */}
            <Box sx={{ px: 2.5, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                    Service Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Amount</Typography>
                        <Typography variant="body1" fontWeight="600">{tx.amount}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Service Number</Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ wordBreak: 'break-all' }}>
                            {tx.serviceNumber}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {tx.status === "Success" && tx.txnRefId !== "—" && (
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    B-Connect Txn ID
                                </Typography>
                                <Typography variant="body1" fontWeight="600" sx={{ wordBreak: "break-all" }}>
                                    {tx.txnRefId}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ borderBottom: '1px dashed #ccc', mx: 2, mb: 2 }} />

            {/* ── Payment Information ── */}
            <Box sx={{ px: 2.5, pb: 5 }}>
                <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                    Payment Information
                </Typography>

                <InfoRow label="Paid From" value={tx.method} />
                <InfoRow
                    label="UPI Transaction ID"
                    value={tx.payment?.payment_reference || "—"}
                    copyable
                />
                <InfoRow label="Transaction ID" value={tx.transactionId} copyable />
            </Box>

            {/* ── Bottom Logo ── */}
            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: -30, left: 0, right: 0 }}>
                <Avatar
                    sx={{ width: 65, height: 65, bgcolor: 'white', boxShadow: 3, border: '1px solid #e0e0e0' }}
                >
                    <Box
                        component="img"
                        src="/utility/B_Assured.svg"
                        alt="Assured Logo"
                        sx={{ width: '80%', height: 'auto', objectFit: 'contain' }}
                    />
                </Avatar>
            </Box>
        </Card>
    );
};

export default TransactionPopup;