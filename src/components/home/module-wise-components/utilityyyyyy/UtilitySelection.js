import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Box,
    Grid,
    Typography,
    useMediaQuery,
    Skeleton,
    TextField,
    InputAdornment,
} from "@mui/material";
import { useRouter } from "next/router";
import SearchIcon from "@mui/icons-material/Search";
import useGetBbpsBillers from "api-manage/hooks/react-query/utility/UseGetBbpsBiller";

const serviceImageMap = {
    "education-fees": "/utility/educationfees.svg",
    "electricity": "/utility/ElectricBill.svg",
    "loan-repayment": "/utility/loanrepayment.svg",
    "gas": "/utility/gas-pipe.svg",
    "water": "/utility/water.svg",
    "mobile-postpaid": "/utility/postpaid.svg",
    "housing-society": "/utility/housing.svg",
    "broadband-postpaid": "/utility/broadband.svg",
    "insurance": "/utility/insurance.svg",
    "landline-postpaid": "/utility/device-landline-phone.svg",
    "fastag": "/utility/fastag.svg",
    "cable-tv": "/utility/postpaid.svg",
    "municipal-taxes": "/utility/muncipal.svg",
    "life-insurance": "/utility/lifeinsurance.svg",
    "dth": "/utility/DTHrecharge.svg",
    "credit-card": "/utility/cards.svg",
    "hospital-and-pathology": "/utility/pathology.svg",
    "municipal-services": "/utility/muncipal.svg",
    "lpg-gas": "/utility/LPG.svg",
    "clubs-and-associations": "/utility/club&association.svg",
    "subscription": "/utility/subcription.svg",
    "health-insurance": "/utility/healthinsurance.svg",
    "mobile-prepaid": "/utility/recharge.svg",
    "recurring-deposit": "/utility/recharge.svg",
    "hospital": "/utility/hospital.svg",
    "rental": "/utility/rental.svg",
    "b2b": "/utility/b2b.svg",
    "metro-recharge": "/utility/train-front.svg",
    "ncmc-recharge": "/utility/recharge.svg",
    "donation": "/utility/donation.svg",
    "national-pension-system": "/utility/recharge.svg",
    "prepaid-meter": "/utility/prepaid.svg",
    "agent-collection": "/utility/agentcollection.svg",
    "echallan": "/utility/eChallan.svg",
    "ev-recharge": "/utility/EVrecharge.svg",
};
// ─── Biller Card Skeleton ─────────────────────────────────────────────────────
const BillerSkeleton = () => (
    <Grid item xs={12} sm={6} md={4}>
        <Box
            sx={{
                height: 60,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                borderRadius: "10px",
                border: "1px solid #eee",
                background: "#fff",
            }}
        >
            <Skeleton variant="circular" width={32} height={32} animation="wave" />
            <Skeleton variant="rounded" width={140} height={14} animation="wave" />
        </Box>
    </Grid>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const UtilitySelection = () => {
    const isMobile = useMediaQuery("(max-width:600px)");
    const router = useRouter();

    // ✅ [slug].js dynamic route se — /utility/fastag → slug = "fastag"
    const slug = router.query?.slug || "";
    const serviceIcon = serviceImageMap[slug] || "/utility/recharge.svg";

    // slug ko readable title banana
    const serviceName = slug
        ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "";

    const [searchQuery, setSearchQuery] = useState("");

    // ─── API ──────────────────────────────────────────────────────────────────
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useGetBbpsBillers(slug);

    // Sabhi pages flat array mein
    const allBillers = data?.pages?.flatMap((p) => p.records) || [];

    // Client-side search filter on billerName
    const filteredBillers = allBillers.filter((b) =>
        b.billerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ─── IntersectionObserver ─────────────────────────────────────────────────
    const sentinelRef = useRef(null);

    const handleIntersect = useCallback(
        (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [hasNextPage, isFetchingNextPage, fetchNextPage]
    );

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(handleIntersect, {
            root: null,
            rootMargin: "0px",
            threshold: 0.1,
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleIntersect]);

    // ─── JSX ─────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>

            {/* LEFT SIDEBAR */}
            {!isMobile && (
                <Box
                    sx={{
                        width: 240,
                        p: 2,
                        border: "1px solid #E3E8EE",
                        borderRadius: "8px",
                        height: "fit-content",
                        minHeight: 420,
                        alignSelf: "flex-start",
                    }}
                >
                    <Box sx={{ background: "#fff", borderRadius: "12px", p: 1, minHeight: "100%" }}>
                        {[
                            { name: "Home", icon: "/utility/home.svg" },
                            { name: "Help & Support", icon: "/utility/helpsupport.svg" },
                            { name: "My Transactions", icon: "/utility/mytransactions.svg" },
                        ].map((item, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    px: 1.5,
                                    py: 1.2,
                                    borderRadius: "8px",
                                    mb: 1,
                                    background: i === 0 ? "#eeeeee" : "transparent",
                                    cursor: "pointer",
                                    transition: "0.2s",
                                    "&:hover": { background: "#f3f3f3" },
                                }}
                            >
                                <Box component="img" src={item.icon} alt={item.name} sx={{ width: 22, height: 22, objectFit: "contain" }} />
                                <Typography sx={{ fontFamily: "Inter", fontSize: "14px", color: "#292D32", fontWeight: i === 0 ? 500 : 400 }}>
                                    {item.name}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* RIGHT CONTENT */}
            <Box sx={{ flex: 1, px: { xs: 1.5, md: 3 }, minWidth: 0 }}>
                <Box
                    sx={{
                        // background: "#f8fafc",
                        borderRadius: "16px",
                        p: { xs: 2, md: 3 },
                        border: "1px solid #e5e7eb",
                    }}
                >
                    {/* HEADER */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        <Box>
                            <Typography fontWeight={600}>Recharges & Bill Payments</Typography>
                            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                                Pay utility bills, recharges & government bills securely
                            </Typography>
                        </Box>
                        <Box component="img" src="/BharatConnect.png" sx={{ height: 24 }} />
                    </Box>

                    {/* CATEGORY — dynamic slug se */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: "30%",
                                borderColor: "#e8f5e9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Box
                                component="img"
                                src={serviceIcon}
                                alt={serviceName}
                                sx={{
                                    width: 30,
                                    height: 30,
                                    objectFit: "contain",
                                }}
                            />
                        </Box>
                        <Typography fontWeight={500}>{serviceName}</Typography>
                    </Box>

                    {/* SEARCH */}
                    <Box sx={{ mb: 3, maxWidth: 420 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search for operator"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: "8px", fontSize: "14px", background: "#F8F9FA", borderColor: "#DDE2E4" },
                            }}
                        />
                    </Box>

                    {/* TITLE */}
                    <Typography fontWeight={500} sx={{ mb: 2 }}>All Providers</Typography>

                    {/* BILLERS GRID */}
                    <Grid container spacing={2}>

                        {/* Pehli baar loading */}
                        {isLoading &&
                            Array.from({ length: 6 }).map((_, i) => (
                                <BillerSkeleton key={`sk-${i}`} />
                            ))
                        }

                        {/* Biller cards */}
                        {!isLoading && filteredBillers.map((biller, i) => (
                            <Grid item xs={12} sm={6} md={4} key={biller.billerId || i}>
                                <Box key={biller.billerId || i}
                                    onClick={() => {
                                        router.push(`/utility/${slug}/form?billerId=${biller.billerId}`);
                                    }}
                                    sx={{
                                        height: 60,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        px: 2,
                                        borderRadius: "10px",
                                        border: "1px solid #eee",
                                        background: "#fff",
                                        cursor: "pointer",
                                        "&:hover": { boxShadow: "0 2px 6px rgba(0,0,0,0.08)" },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            background: "#f3f4f6",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={serviceIcon}
                                            alt={slug}
                                            sx={{
                                                width: 18,
                                                height: 18,
                                                objectFit: "contain",
                                            }}
                                        />
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontSize: 13,
                                            color: "#111827",
                                            lineHeight: 1.3,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {biller.billerName}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}

                        {/* Scroll load skeletons */}
                        {isFetchingNextPage &&
                            Array.from({ length: 3 }).map((_, i) => (
                                <BillerSkeleton key={`nsk-${i}`} />
                            ))
                        }

                        {/* No results */}
                        {!isLoading && filteredBillers.length === 0 && (
                            <Grid item xs={12}>
                                <Typography sx={{ color: "#6b7280", fontSize: 14, py: 2 }}>
                                    No providers found{searchQuery ? ` for "${searchQuery}"` : ""}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>

                    {/* IntersectionObserver sentinel */}
                    <Box ref={sentinelRef} sx={{ height: 1, mt: 2 }} />
                </Box>
            </Box>
        </Box>
    );
};

export default UtilitySelection;