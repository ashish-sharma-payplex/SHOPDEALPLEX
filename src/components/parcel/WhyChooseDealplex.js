import React from "react";
import { Box, Typography } from "@mui/material";

const features = [
    {
        id: 1,
        title: "Fast & Live Updates",
        desc: "Riders reach your location in minutes, and you can track your parcel in real time from pickup to delivery.",
    },
    {
        id: 2,
        title: "Safe & Secure Delivery",
        desc: "Every parcel is handled with care, with proof photos at pickup & drop. All delivery partners are fully verified.",
    },
    {
        id: 3,
        title: "Affordable & Transparent Pricing",
        desc: "No hidden charges — get clear, upfront pricing for every delivery based on distance and parcel type.",
        fullWidth: true,
    },
];

const IMG_RIGHT = "/DealplexSection.png";

function NumberBadge({ num }) {
    return (
        <Box
            sx={{
                width: 26,
                height: 26,
                minWidth: 26,
                borderRadius: "50%",
                bgcolor: "#2e7d32",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontfamily: "Inter",
            }}
        >
            {num}
        </Box>
    );
}

function FeatureItem({ feature }) {
    return (
        <Box sx={{ width: "100%", boxSizing: "border-box" }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2, mb: 0.75 }}>
                <NumberBadge num={feature.id} />
                <Typography
                    sx={{
                        fontFamily: "Inter",
                        fontWeight: 500,
                        color: "#181818",
                        fontSize: { xs: "0.88rem", sm: "1rem", md: "24px" },
                        lineHeight: 1.35,
                        mt: "2px",
                    }}
                >
                    {feature.title}
                </Typography>
            </Box>
            <Typography
                sx={{
                    color: "#777E90",
                    lineHeight: 1.65,
                    pl: "38px",
                    fontSize: { xs: "0.76rem", sm: "0.85rem", md: "16px" },
                    fontFamily: "Inter",
                    fontWeight: 400,
                }}
            >
                {feature.desc}
            </Typography>
        </Box>
    );
}

export default function WhyChooseDealplex() {
    return (
        <Box
            sx={{
                bgcolor: "#fff",
                py: { xs: 4, md: 7 },
                position: "relative",
                width: "100vw",
                ml: "calc(-50vw + 50%)",
                boxSizing: "border-box",
                overflowX: "hidden",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "1400px",
                    mx: "auto",
                    px: { xs: "20px", sm: "32px", md: "48px" },
                    boxSizing: "border-box",
                }}
            >
                {/*
                  MOBILE (column):
                    — Heading   (order 1)
                    — Image     (order 2)
                    — Features  (order 3)

                  DESKTOP (row):
                    — Left col: Heading + Features  (order 1)
                    — Right col: Image              (order 2)
                */}
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",          // allows reordering across rows on mobile
                        flexDirection: { md: "row" },
                        alignItems: { md: "center" },
                        gap: { md: "150px" },
                        width: "100%",
                        boxSizing: "border-box",
                    }}
                >
                    {/* ── HEADING ── */}
                    <Box
                        sx={{
                            width: "100%",                          // full row on mobile
                            flex: { md: "1 1 0" },                 // left col on desktop
                            minWidth: 0,
                            boxSizing: "border-box",
                            order: { xs: 1, md: 1 },
                            mb: { xs: "16px", md: 0 },
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: "Inter",
                                fontWeight: 600,
                                color: "#181818",
                                lineHeight: 1.25,
                                fontSize: {
                                    xs: "1.3rem",
                                    sm: "1.6rem",
                                    md: "32px",
                                },
                                textAlign: {
                                    xs: "center",
                                    sm: "center",
                                    md: "left",
                                },
                                mb: { md: 4.5 },
                            }}
                        >
                            Why Choose Dealplex
                            <br />
                            for Your Parcel
                        </Typography>

                        {/* Features — hidden on mobile here, shown in its own box below */}
                        <Box
                            sx={{
                                display: { xs: "none", md: "grid" },
                                gridTemplateColumns: "1fr 1fr",
                                gap: "40px 48px",
                                boxSizing: "border-box",
                            }}
                        >
                            {features.map((f) => (
                                <Box
                                    key={f.id}
                                    sx={{
                                        gridColumn: f.fullWidth ? "1 / -1" : "auto",
                                        minWidth: 0,
                                    }}
                                >
                                    <FeatureItem feature={f} />
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* ── IMAGE ── */}
                    <Box
                        sx={{
                            width: { xs: "100%", md: "380px" },
                            minWidth: { md: "380px" },
                            flexShrink: 0,
                            borderRadius: "12px",
                            overflow: "hidden",
                            height: { xs: "100%", sm: "100%", md: "330px" },
                            boxSizing: "border-box",
                            order: { xs: 2, md: 2 },
                            my: { xs: "16px", md: 0 },
                        }}
                    >
                        <img
                            src={IMG_RIGHT}
                            alt="Dealplex delivery"
                            title="Dealplex delivery"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                            }}
                        />
                    </Box>

                    {/* ── FEATURES (mobile only) ── */}
                    <Box
                        sx={{
                            display: { xs: "grid", md: "none" },
                            gridTemplateColumns: "1fr",
                            gap: "20px",
                            width: "100%",
                            boxSizing: "border-box",
                            order: 3,
                        }}
                    >
                        {features.map((f) => (
                            <Box key={f.id} sx={{ minWidth: 0 }}>
                                <FeatureItem feature={f} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}