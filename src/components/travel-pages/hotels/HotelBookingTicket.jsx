// pages\hotels\HotelBookingTicket.jsx
import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Divider, Button, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import BedOutlinedIcon from "@mui/icons-material/BedOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

const GREEN = "#16a34a";
const DARK = "#0f172a";
const LIGHT = "#64748b";
const BORDER = "#e2e8f0";
const BG = "#f1f5f9";
const FONT = "'Inter', sans-serif";

// ── Dotted Tear Line with SEMI-CIRCLE CUTOUTS ─────────────────────────────────────
const TearLine = () => (
    <Box
        sx={{
            position: "relative",
            my: 0,
            mx: 0,
            height: 32,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",

        }}
    >
        {/* Left semi-circle cutout (carved INTO ticket) */}
        <Box
            sx={{
                position: "absolute",
                left: -16,
                top: "50%",
                transform: "translateY(-50%)",
                width: 32,
                height: 32,
                borderRadius: "0 50% 50% 0",  /* Only RIGHT half is rounded = left side carved in */
                bgcolor: BG,
                zIndex: 10,
            }}
        />
        {/* Right semi-circle cutout (carved INTO ticket) */}
        <Box
            sx={{
                position: "absolute",
                right: -16,
                top: "50%",
                transform: "translateY(-50%)",
                width: 32,
                height: 32,
                borderRadius: "50% 0 0 50%",  /* Only LEFT half is rounded = right side carved in */
                bgcolor: BG,
                zIndex: 10,
            }}
        />
        {/* Dotted line - full width */}
        <Box
            sx={{
                flex: 1,
                borderTop: "2px dashed #cbd5e1",
                mx: 0,
                position: "relative",
                zIndex: 1,
            }}
        />
    </Box>
);

// ── Label + Value row ────────────────────────────────────
const InfoRow = ({ label, value, valueColor, icon }) =>
    value ? (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 1,
                mb: 1.2,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                {icon &&
                    React.cloneElement(icon, { sx: { fontSize: 14, color: LIGHT } })}
                <Typography sx={{ fontSize: 12.5, color: LIGHT, fontFamily: FONT }}>
                    {label}
                </Typography>
            </Box>
            <Typography
                sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: valueColor ?? DARK,
                    fontFamily: FONT,
                    textAlign: "right",
                    maxWidth: "55%",
                }}
            >
                {value}
            </Typography>
        </Box>
    ) : null;

// ── Guest row (naam + adult/child badge) ─────────────────
const GuestRow = ({ guest, index }) => {
    const isChild = guest.paxType === 2 || guest.isChild;
    const fullName = [guest.salutation, guest.firstName, guest.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                py: 1,
                borderBottom: "1px solid #f1f5f9",
                "&:last-of-type": { borderBottom: "none" },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
                <PersonOutlineOutlinedIcon sx={{ fontSize: 15, color: LIGHT, flexShrink: 0 }} />
                <Typography
                    sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: DARK,
                        fontFamily: FONT,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {fullName || `Guest ${index + 1}`}
                </Typography>
                {guest.isLead && (
                    <Chip
                        label="Lead"
                        size="small"
                        sx={{
                            height: 18,
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor: "#dcfce7",
                            color: GREEN,
                            fontFamily: FONT,
                        }}
                    />
                )}
            </Box>
            <Chip
                label={isChild ? `Child${guest.age ? ` · ${guest.age}y` : ""}` : "Adult"}
                size="small"
                sx={{
                    height: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: FONT,
                    bgcolor: isChild ? "#fef9c3" : "#e0f2fe",
                    color: isChild ? "#ca8a04" : "#0369a1",
                    flexShrink: 0,
                }}
            />
        </Box>
    );
};

// ── Barcode SVG (decorative) ─────────────────────────────
const Barcode = ({ value = "THPB_423" }) => {
    const bars = [];
    const seed = value.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    for (let i = 0; i < 48; i++) {
        const w = ((seed * (i + 7) * 13) % 3) + 1;
        bars.push(w);
    }
    let x = 0;
    return (
        <svg
            width="180"
            height="44"
            viewBox={`0 0 ${bars.reduce((a, b) => a + b + 1, 0)} 44`}
        >
            {bars.map((w, i) => {
                const cx = x;
                x += w + 1;
                return (
                    <rect
                        key={i}
                        x={cx}
                        y={0}
                        width={w}
                        height={44}
                        fill="#0f172a"
                        opacity={0.75}
                    />
                );
            })}
        </svg>
    );
};

// ── Main Component ───────────────────────────────────────
const HotelBookingTicket = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // All data comes from navigation state
    const bookingResult = state?.bookingResult ?? {};
    const hotelSnapshot = state?.hotelSnapshot ?? {};
    const roomSnapshot = state?.roomSnapshot ?? {};
    const paymentMeta = state?.paymentMeta ?? {};
    // ✅ NAYA — checkout page se aaya passengers array (naam, paxType, age, lead)
    const passengers = state?.passengers ?? [];

    // Hotel info
    const hotelName = hotelSnapshot.hotelName ?? "Hotel";
    const hotelStars = hotelSnapshot.hotelStars ?? 4;
    const hotelImage =
        hotelSnapshot.hotelImage ??
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
    const hotelLocation = hotelSnapshot.hotelLocation ?? "";

    // Room info
    const roomName = roomSnapshot.roomName ?? "Room";
    const bedType = roomSnapshot.bedType ?? "";
    const sleeps = roomSnapshot.maxOccupancy ?? "";
    const inclusions = roomSnapshot.inclusions ?? [];

    // Stay info
    const checkInDay = state?.checkInDay ?? "";
    const checkInDate = state?.checkInDate ?? "";
    const checkOutDay = state?.checkOutDay ?? "";
    const checkOutDate = state?.checkOutDate ?? "";
    const nights = state?.nights ?? 1;
    const roomQty = state?.roomQty ?? 1;
    const currency = state?.currency ?? "₹";

    // ✅ UPDATED — Book API response ke actual fields se seedha map kiya
    // (response.data.{booking_id, booking_ref_no, confirmation_no,
    // invoice_number, hotel_booking_status, is_final, message})
    const bookingData = bookingResult?.data ?? bookingResult ?? {};
    const bookingRefId =
        bookingData?.booking_ref_no ??
        bookingData?.booking_id ??
        state?.prebookId ??
        "—";
    const bookingId = bookingData?.booking_id ?? "—";
    const confirmationNo = bookingData?.confirmation_no ?? "—";
    const invoiceNumber = bookingData?.invoice_number ?? "";
    const bookingStatus = bookingData?.hotel_booking_status ?? "Confirmed";
    const bookingMessage = bookingData?.message ?? "";
    const isFinal = bookingData?.is_final ?? true;

    const guestName =
        bookingData?.GuestName ??
        bookingData?.guestName ??
        state?.leadName ??
        (passengers.find((p) => p.isLead)?.firstName
            ? `${passengers.find((p) => p.isLead).firstName} ${passengers.find((p) => p.isLead).lastName ?? ""}`.trim()
            : "");
    const leadEmail = state?.leadEmail ?? bookingData?.Email ?? "";
    const leadPhone = state?.leadPhone ?? bookingData?.Phone ?? "";

    // Fare
    const confirmedNet = state?.confirmedNet ?? state?.baseAmount ?? 0;
    const convenienceFee = state?.convenienceFee ?? 0;
    const totalPaid = Number(confirmedNet) + Number(convenienceFee);

    // Payment info
    const orderId = paymentMeta?.orderId ?? bookingData?.orderId ?? "—";
    const paymentMode = paymentMeta?.mode ?? "UPI";
    const txnTimestamp = paymentMeta?.transactionTimestamp ?? "";

    return (
        <Box
            sx={{
                minHeight: "100vh",
                // bgcolor: BG,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                py: { xs: 3, sm: 5 },
                px: { xs: 1.5, sm: 2 },
                fontFamily: FONT,
                mt: { xs: "56px", md: "120px" },  // 👈 navbar ke peeche hide hone se bachayega
            }}
        >
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

            {/* ── Success Badge ── */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "#dcfce7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1.5,
                        boxShadow: "0 0 0 8px #f0fdf4",
                    }}
                >
                    <CheckCircleIcon sx={{ fontSize: 32, color: GREEN }} />
                </Box>
                <Typography
                    sx={{
                        fontSize: { xs: 22, sm: 26 },
                        fontWeight: 900,
                        color: DARK,
                        fontFamily: FONT,
                        letterSpacing: "-0.5px",
                    }}
                >
                    Booking Confirmed!
                </Typography>
                <Typography
                    sx={{
                        fontSize: 13.5,
                        color: LIGHT,
                        mt: 0.5,
                        fontFamily: FONT,
                        textAlign: "center",
                    }}
                >
                    {bookingMessage ||
                        (leadEmail
                            ? `Confirmation sent to ${leadEmail}`
                            : "Your hotel is booked successfully")}
                </Typography>
            </Box>

            {/* ── Ticket Card ── */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    bgcolor: "#fff",
                    borderRadius: "20px",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                    overflow: "visible",
                    position: "relative",
                }}
            >
                {/* Hotel Image Banner */}
                <Box
                    sx={{
                        width: "100%",
                        height: 140,
                        overflow: "hidden",
                        borderRadius: "20px 20px 0 0",
                        position: "relative",
                    }}
                >
                    <Box
                        component="img"
                        src={hotelImage}
                        alt={hotelName}
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                        onError={(e) => {
                            e.target.src =
                                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80";
                        }}
                    />
                    {/* Overlay gradient */}
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            background:
                                "linear-gradient(to top, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.1) 60%)",
                        }}
                    />
                    {/* Hotel name on image */}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 2,
                        }}
                    >
                        <Box
                            sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.3 }}
                        >
                            <Chip
                                label={`${hotelStars} ★`}
                                size="small"
                                sx={{
                                    bgcolor: "#fef3c7",
                                    color: "#92400e",
                                    fontWeight: 700,
                                    fontSize: 11,
                                    height: 20,
                                    fontFamily: FONT,
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: 11.5,
                                    color: "rgba(255,255,255,0.8)",
                                    fontFamily: FONT,
                                }}
                            >
                                Hotel
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontSize: { xs: 17, sm: 19 },
                                fontWeight: 800,
                                color: "#fff",
                                fontFamily: FONT,
                                lineHeight: 1.2,
                            }}
                        >
                            {hotelName}
                        </Typography>
                        {hotelLocation && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.4,
                                    mt: 0.3,
                                }}
                            >
                                <LocationOnOutlinedIcon
                                    sx={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: 11.5,
                                        color: "rgba(255,255,255,0.7)",
                                        fontFamily: FONT,
                                    }}
                                >
                                    {hotelLocation}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* ── Check-in / Check-out bar ── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 2.5,
                        py: 1.8,
                        bgcolor: "#f8fafc",
                        borderBottom: `1px solid ${BORDER}`,
                    }}
                >
                    {/* Check-in */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            sx={{
                                fontSize: 10.5,
                                color: LIGHT,
                                mb: 0.2,
                                fontFamily: FONT,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                            }}
                        >
                            Check-in
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 15,
                                fontWeight: 800,
                                color: DARK,
                                fontFamily: FONT,
                                lineHeight: 1.2,
                            }}
                        >
                            {checkInDate}
                        </Typography>
                        {checkInDay && (
                            <Typography
                                sx={{ fontSize: 11.5, color: LIGHT, fontFamily: FONT }}
                            >
                                {checkInDay}
                            </Typography>
                        )}
                    </Box>

                    {/* Nights badge */}
                    <Box
                        sx={{
                            px: 1.8,
                            py: 0.6,
                            bgcolor: "#dcfce7",
                            borderRadius: "20px",
                            mx: 1,
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: GREEN,
                                fontFamily: FONT,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {nights}N
                        </Typography>
                    </Box>

                    {/* Check-out */}
                    <Box sx={{ flex: 1, textAlign: "right" }}>
                        <Typography
                            sx={{
                                fontSize: 10.5,
                                color: LIGHT,
                                mb: 0.2,
                                fontFamily: FONT,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                            }}
                        >
                            Check-out
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 15,
                                fontWeight: 800,
                                color: DARK,
                                fontFamily: FONT,
                                lineHeight: 1.2,
                            }}
                        >
                            {checkOutDate}
                        </Typography>
                        {checkOutDay && (
                            <Typography
                                sx={{ fontSize: 11.5, color: LIGHT, fontFamily: FONT }}
                            >
                                {checkOutDay}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* ── Room & Booking details ── */}
                <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
                    <InfoRow
                        icon={<BedOutlinedIcon />}
                        label="Room"
                        value={`${roomQty}x ${roomName}${bedType ? ` · ${bedType}` : ""}`}
                    />
                    {sleeps && (
                        <InfoRow
                            icon={<PeopleOutlineOutlinedIcon />}
                            label="Guests"
                            value={`Sleeps ${sleeps}`}
                        />
                    )}
                    {inclusions.length > 0 && (
                        <InfoRow label="Includes" value={inclusions.join(", ")} />
                    )}
                    {guestName && <InfoRow label="Guest Name" value={guestName} />}
                    {leadPhone && (
                        <InfoRow
                            icon={<PhoneOutlinedIcon />}
                            label="Phone"
                            value={leadPhone}
                        />
                    )}
                    {leadEmail && (
                        <InfoRow
                            icon={<EmailOutlinedIcon />}
                            label="Email"
                            value={leadEmail}
                        />
                    )}
                </Box>

                {/* ── NAYA — Guest List (naam + Adult/Child) ── */}
                {passengers.length > 0 && (
                    <>
                        <TearLine />
                        <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    color: DARK,
                                    fontFamily: FONT,
                                    mb: 0.8,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.4px",
                                }}
                            >
                                Guests ({passengers.length})
                            </Typography>
                            {passengers.map((guest, i) => (
                                <GuestRow key={i} guest={guest} index={i} />
                            ))}
                        </Box>
                    </>
                )}

                {/* ── Tear Line ── */}
                <TearLine />

                {/* ── Payment & Booking ID section ── */}
                <Box sx={{ px: 2.5, pt: 2, pb: 2 }}>
                    <InfoRow
                        icon={<ConfirmationNumberOutlinedIcon />}
                        label="Booking Ref No"
                        value={String(bookingRefId)}
                        valueColor={GREEN}
                    />
                    {bookingId !== "—" && (
                        <InfoRow label="Booking ID" value={String(bookingId)} />
                    )}
                    {confirmationNo !== "—" && (
                        <InfoRow label="Confirmation No" value={String(confirmationNo)} />
                    )}
                    {invoiceNumber && (
                        <InfoRow
                            icon={<ReceiptLongOutlinedIcon />}
                            label="Invoice No"
                            value={String(invoiceNumber)}
                        />
                    )}
                    {orderId !== "—" && (
                        <InfoRow label="Order ID" value={String(orderId)} />
                    )}
                    <InfoRow
                        icon={<AccountBalanceWalletOutlinedIcon />}
                        label="Payment Mode"
                        value={paymentMode}
                    />
                    {txnTimestamp && <InfoRow label="Paid At" value={txnTimestamp} />}

                    <Divider sx={{ my: 1.5, borderColor: "#f1f5f9" }} />

                    {/* Total */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            bgcolor: "#f0fdf4",
                            borderRadius: "10px",
                            px: 1.8,
                            py: 1.2,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 13.5,
                                fontWeight: 600,
                                color: DARK,
                                fontFamily: FONT,
                            }}
                        >
                            Total Paid
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 18,
                                fontWeight: 900,
                                color: GREEN,
                                fontFamily: FONT,
                            }}
                        >
                            {currency}
                            {Number(totalPaid).toLocaleString("en-IN")}
                        </Typography>
                    </Box>
                </Box>

                {/* ── Tear Line ── */}
                <TearLine />

                {/* ── Barcode ── */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        py: 2.5,
                        px: 2.5,
                    }}
                >
                    <Barcode value={String(bookingRefId)} />
                    <Typography
                        sx={{
                            fontSize: 11,
                            color: LIGHT,
                            mt: 1,
                            letterSpacing: "2px",
                            fontFamily: FONT,
                            fontWeight: 500,
                        }}
                    >
                        {String(bookingRefId).toUpperCase()}
                    </Typography>

                    {/* Status pill */}
                    <Chip
                        label={bookingStatus?.toUpperCase?.() ?? "CONFIRMED"}
                        sx={{
                            mt: 1.5,
                            bgcolor: "#dcfce7",
                            color: GREEN,
                            fontWeight: 700,
                            fontSize: 11,
                            fontFamily: FONT,
                            letterSpacing: "0.5px",
                        }}
                    />
                    {!isFinal && (
                        <Typography
                            sx={{
                                fontSize: 11,
                                color: "#ca8a04",
                                mt: 1,
                                fontFamily: FONT,
                                fontWeight: 600,
                                textAlign: "center",
                            }}
                        >
                            Final confirmation pending — we'll notify you once confirmed.
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* ── Action Buttons ── */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    mt: 2.5,
                    display: "flex",
                    gap: 1.5,
                    flexDirection: { xs: "column", sm: "row" },
                }}
            >
                <Button
                    fullWidth
                    onClick={() => window.print()}
                    variant="outlined"
                    sx={{
                        borderRadius: "12px",
                        py: 1.4,
                        fontWeight: 700,
                        fontFamily: FONT,
                        fontSize: 14,
                        textTransform: "none",
                        borderColor: BORDER,
                        color: DARK,
                        "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
                    }}
                >
                    Download Ticket
                </Button>
                <Button
                    fullWidth
                    onClick={() => navigate("/")}
                    sx={{
                        borderRadius: "12px",
                        py: 1.4,
                        fontWeight: 700,
                        fontFamily: FONT,
                        fontSize: 14,
                        textTransform: "none",
                        bgcolor: GREEN,
                        color: "#fff",
                        boxShadow: "0 4px 14px rgba(22,163,74,0.28)",
                        "&:hover": { bgcolor: "#15803d" },
                    }}
                >
                    Back to Home
                </Button>
            </Box>

            {/* ── Support note ── */}
            <Typography
                sx={{
                    fontSize: 12,
                    color: LIGHT,
                    mt: 2.5,
                    textAlign: "center",
                    fontFamily: FONT,
                }}
            >
                Need help? Contact support with your Booking Ref
            </Typography>
        </Box>
    );
};

export default HotelBookingTicket;