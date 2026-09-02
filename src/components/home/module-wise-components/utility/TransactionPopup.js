import React, { useState, useRef } from 'react';
import {
    Box,
    Card,
    Typography,
    Divider,
    Grid,
    Avatar,
    Button,
    Link,
    CircularProgress,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig = {
    Success: { bg: '#e8f5e9', color: '#2e7d32', dot: '#4CAF50' },
    Pending: { bg: '#FFF8E1', color: '#E65100', dot: '#FFA726' },
    Failed: { bg: '#FFEBEE', color: '#C62828', dot: '#EF5350' },
};

// ─── Copy helper ──────────────────────────────────────────────────────────────
const copyToClipboard = (text) => {
    if (!text || text === '—') return;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, copyable = false, isPdfMode = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        copyToClipboard(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 10000);
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Box>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="body1" fontWeight="600" sx={{ wordBreak: 'break-all' }}>
                    {value || '—'}
                </Typography>
            </Box>
            {/* Copy button — hidden in PDF mode */}
            {copyable && value && value !== '—' && !isPdfMode && (
                <Button
                    startIcon={<ContentCopyIcon fontSize="small" />}
                    size="small"
                    onClick={handleCopy}
                    sx={{
                        fontWeight: 600,
                        flexShrink: 0,
                        ml: 1,
                        color: copied ? '#2e7d32' : 'primary.main',
                        transition: 'color 0.3s',
                    }}
                >
                    {copied ? 'COPIED!' : 'COPY'}
                </Button>
            )}
        </Box>
    );
};

const formatRefundDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr.replace(' ', 'T'));
    return (
        d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TransactionPopup = ({ tx, onNeedHelp = () => { } }) => {
    if (!tx) return null;

    const [downloading, setDownloading] = useState(false);
    const [isPdfMode, setIsPdfMode] = useState(false);
    const cardRef = useRef(null);

    const commonFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
    const cfg = statusConfig[tx.status] || statusConfig.Pending;

    // ── Refund visibility check ───────────────────────────────────────────────
    const showRefund = tx.refund?.eligible === false && tx.refund?.refunded === true;
    // console.log("Transaction Popup", '[TransactionPopup] tx.refund=', tx.refund, '| showRefund=', showRefund);

    // ── PDF Download ──────────────────────────────────────────────────────────
    const handleDownloadPDF = async () => {
        if (!cardRef.current) return;
        setDownloading(true);

        try {
            const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
                import('html2canvas'),
                import('jspdf'),
            ]);

            const element = cardRef.current;

            // Hide interactive elements before capture
            setIsPdfMode(true);
            await new Promise((r) => setTimeout(r, 50));

            const originalBorderRadius = element.style.borderRadius;
            element.style.borderRadius = '0';

            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            element.style.borderRadius = originalBorderRadius;
            setIsPdfMode(false);

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin = 10;
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = (canvas.height / canvas.width) * imgWidth;

            let remainingHeight = imgHeight;
            let sourceY = 0;

            while (remainingHeight > 0) {
                const sliceHeight = Math.min(remainingHeight, pageHeight - margin * 2);
                const sliceCanvas = document.createElement('canvas');
                sliceCanvas.width = canvas.width;
                sliceCanvas.height = (sliceHeight / imgHeight) * canvas.height;
                const ctx = sliceCanvas.getContext('2d');
                ctx.drawImage(
                    canvas,
                    0, sourceY,
                    canvas.width, sliceCanvas.height,
                    0, 0,
                    canvas.width, sliceCanvas.height
                );

                if (sourceY > 0) pdf.addPage();
                pdf.addImage(
                    sliceCanvas.toDataURL('image/png'),
                    'PNG',
                    margin, margin,
                    imgWidth, sliceHeight
                );

                sourceY += sliceCanvas.height;
                remainingHeight -= sliceHeight;
            }

            const fileName = `transaction_${tx.status?.toLowerCase()}_${tx.client_request_id || Date.now()
                }.pdf`;
            pdf.save(fileName);

        } catch (err) {
            // console.error('PDF generation failed:', err);
            alert('PDF download failed. Please try again.');
        } finally {
            setIsPdfMode(false);
            setDownloading(false);
        }
    };

    return (
        <Card
            ref={cardRef}
            elevation={3}
            sx={{ width: '100%', borderRadius: '14px !important', overflow: 'visible', position: 'relative', mb: 5 }}
        >
            {/* ── Header ── */}
            <Box sx={{ ...commonFlex, p: 2 }}>
                <Typography variant="h6" fontWeight="700" color="text.primary">
                    {tx.service}
                </Typography>

                {/* Right: Download icon + Need Help — Need Help hidden in PDF */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

                    {/* Download icon — hidden during PDF capture */}
                    {!isPdfMode && (
                        <Box
                            onClick={!downloading ? handleDownloadPDF : undefined}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: downloading ? 'not-allowed' : 'pointer',
                                opacity: downloading ? 0.6 : 1,
                                transition: 'opacity 0.2s',
                                '&:hover': { opacity: downloading ? 0.6 : 0.7 },
                            }}
                        >
                            {downloading ? (
                                <CircularProgress size={16} sx={{ color: '#6b7280' }} />
                            ) : (
                                <DownloadIcon sx={{ fontSize: 20, color: '#6b7280' }} />
                            )}
                        </Box>
                    )}

                    {/* Need Help — hidden during PDF capture */}
                    {!isPdfMode && (
                        <Box
                            onClick={onNeedHelp}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                cursor: 'pointer',
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                                '&:hover': { opacity: 0.8 },
                            }}
                        >
                            <HelpOutlineIcon sx={{ fontSize: 18, color: '#6b7280', flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 13, color: '#6b7280' }}>Need Help?</Typography>
                        </Box>
                    )}
                </Box>
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
                        {/* Status — same style as PaymentSuccess: dot + text only */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                justifyContent: 'flex-end',
                                mt: 0.4,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    background: cfg.dot,
                                    flexShrink: 0,
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    color: cfg.color,
                                    fontWeight: 500,
                                }}
                            >
                                {tx.status}
                            </Typography>
                        </Box>
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
                        {tx.status === 'Success' && tx.txnRefId !== '—' && (
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    B-Connect Txn ID
                                </Typography>
                                <Typography variant="body1" fontWeight="600" sx={{ wordBreak: 'break-all' }}>
                                    {tx.txnRefId}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ borderBottom: '1px dashed #ccc', mx: 2, mb: 2 }} />

            {/* ── Payment Information ── */}
            <Box sx={{ px: 2.5, pb: isPdfMode ? 3 : showRefund ? 2 : 5 }}>
                <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                    Payment Information
                </Typography>

                <InfoRow label="Paid From" value={tx.method} isPdfMode={isPdfMode} />
                <InfoRow label="Payer Name" value={tx.payerName} isPdfMode={isPdfMode} />
                <InfoRow
                    label="UPI Transaction ID"
                    value={tx.payment?.payment_reference || '—'}
                    copyable
                    isPdfMode={isPdfMode}
                />
                <InfoRow label="Transaction ID" value={tx.client_request_id} copyable isPdfMode={isPdfMode} />
            </Box>

            {/* ── Refund Information ── */}
            {showRefund && (
                <>
                    <Box sx={{ borderBottom: '1px dashed #ccc', mx: 2, mb: 2 }} />

                    <Box sx={{ px: 2.5, pb: isPdfMode ? 3 : 5 }}>
                        <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                            Refund Information
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    Refund Reference
                                </Typography>
                                <Typography variant="body1" fontWeight="600" sx={{ wordBreak: 'break-all' }}>
                                    {tx.refund.reference || '—'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    Refunded At
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {formatRefundDate(tx.refund.refunded_at)}  {/* ← yeh change */}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </>
            )}

            {/* ── Bottom Logo ── */}
            {/* PDF mode: inside card flow so html2canvas captures it */}
            {isPdfMode ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 3, pt: 1 }}>
                    <Box sx={{
                        width: 65, height: 65,
                        bgcolor: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                    }}>
                        <Box
                            component="img"
                            src="/utility/B_Assured.svg"
                            alt="Assured Logo"
                            sx={{ width: '80%', height: 'auto', objectFit: 'contain' }}
                        />
                    </Box>
                </Box>
            ) : (
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
            )}
        </Card>
    );
};

export default TransactionPopup;