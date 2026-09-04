"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    Grid,
    Collapse,
    useTheme,
    useMediaQuery,
    Skeleton,
} from "@mui/material";
import EastIcon from '@mui/icons-material/East';
import Link from "next/link";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';

import { zoneId_api } from "../../../../../api-manage/ApiRoutes";
import MainApi from "../../../../../api-manage/MainApi";

// ----------------------------------------------------------------------------------

const btoaSafe = (str) =>
    typeof window !== "undefined"
        ? window.btoa(str)
        : Buffer.from(str).toString("base64");

const getModuleId = () => 5;

const API_URL = "https://dealplex.in/api/v1/categories";

// ----------------------------------------------------------------------------------
// CATEGORY CARD
// ----------------------------------------------------------------------------------
const CategoryCardContent = ({ cat }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Card
            sx={{
                borderRadius: "12px",
                textAlign: "center",
                padding: isMobile ? "2px" : "16px",
                height: isMobile ? "100px" : "170px",
                // backgroundColor: "var(--bg-subtle)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "none",
                transition: "transform .2s",
                "&:hover": {
                    transform: "scale(1.02)",
                },
            }}
        >
            <Box
                sx={{
                    width: isMobile ? "65px" : "90px",   // 🔥 smaller image
                    height: isMobile ? "65px" : "90px",
                }}
            >
                <img
                    src={cat.image_full_url || cat.image || "/placeholder.png"}
                    alt={cat.name}
                    title={cat.name}
                    style={{
                        width: isMobile ? "65px" : "90px",
                        height: isMobile ? "65px" : "90px",
                        objectFit: "cover",
                        borderRadius: "10px",
                    }}
                />
            </Box>

            <Typography
                variant="body2"
                sx={{
                    fontWeight: 600,
                    fontSize: isMobile ? "0.65rem" : "0.9rem",  // 🔥 smaller text
                    height: isMobile ? "32px" : "38px",
                    lineHeight: "1.3",
                }}
            >
                {cat.name}
            </Typography>
        </Card>
    );
};


// ----------------------------------------------------------------------------------
// SKELETON
// ----------------------------------------------------------------------------------
const CategoryCardSkeleton = () => (
    <Card
        sx={{
            borderRadius: "12px",
            textAlign: "center",
            padding: "16px",
            width: "100%",
            height: "170px",
            backgroundColor: "var(--bg-subtle)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "none",
        }}
    >
        <Skeleton variant="circular" width={90} height={90} />
        <Skeleton variant="text" sx={{ fontSize: '1rem', width: '80%', mt: 1 }} />
    </Card>
);

// ==================================================================================
// MAIN COMPONENT
// ==================================================================================
const AllFoodCategories = () => {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // ⭐ ZONE STATE
    const [zoneIds, setZoneIds] = useState([]);

    // ----------------------------------------------------------------------------------
    // ⭐ FETCH ZONE ID
    // ----------------------------------------------------------------------------------
    const fetchZoneId = async () => {
        try {
            const storedLatLng = localStorage.getItem("currentLatLng");
            if (!storedLatLng) throw new Error("Location not selected");

            const { lat, lng } = JSON.parse(storedLatLng);
            if (!lat || !lng) throw new Error("Invalid lat/lng");

            const res = await MainApi.get(zoneId_api, { params: { lat, lng } });
            const data = res.data;

            // console.log("🌐 RAW ZONE API RESPONSE:", data);

            const zones =
                data?.zone_ids ||
                data?.data?.zone_ids ||
                data?.zone_id ||
                data?.data?.zone_id;

            if (!zones) throw new Error("Zone not found");

            const zoneArray = Array.isArray(zones) ? zones : [zones];

            // console.log("✅ Zone API resolved IDs:", zoneArray);

            localStorage.setItem("zoneid", JSON.stringify(zoneArray));
            // console.log("💾 Cached zone IDs:", zoneArray);

            setZoneIds(zoneArray);

        } catch (err) {
            // console.error("❌ ZONE FETCH FAILED:", err);
            setZoneIds([15, 17]); // fallback for safety
        }
    };

    // ----------------------------------------------------------------------------------
    // ⭐ FETCH CATEGORIES USING ZONES
    // ----------------------------------------------------------------------------------
    const fetchCategories = async (zones) => {
        try {
            // console.log("🚀 Fetching categories for zoneIds:", zones);

            setLoading(true);
            setError(null);

            const moduleId = getModuleId();

            const res = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    moduleId: String(moduleId),
                    zoneId: JSON.stringify([15, 17]),
                },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            // console.log("✅ Category API data:", data);

            const categoryList = data?.data || data?.categories || data || [];

            setCategories(categoryList);

        } catch (err) {
            // console.error("❌ CATEGORY FETCH FAILED:", err);
            setError(err.message);

        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------------------------------------
    // ⭐ LOAD ZONES (CACHE FIRST → API)
    // ----------------------------------------------------------------------------------
    useEffect(() => {
        const stored = localStorage.getItem("zoneid");

        if (stored) {
            // console.log("📦 Using cached zoneIds:", JSON.parse(stored));
            setZoneIds(JSON.parse(stored));
        } else {
            // console.log("🚫 No cached zones → calling API...");
            fetchZoneId();
        }
    }, []);

    // ----------------------------------------------------------------------------------
    // ⭐ WHEN ZONES READY → LOAD CATEGORIES
    // ----------------------------------------------------------------------------------
    useEffect(() => {
        // console.log("👀 zoneIds updated:", zoneIds);

        if (zoneIds.length === 0) return;

        fetchCategories(zoneIds);

    }, [zoneIds]);

    // ----------------------------------------------------------------------------------
    const toggleExpand = () => setExpanded(p => !p);

    const initialCategories = categories.slice(0, 8);
    const expandedCategories = categories.slice(8);

    // ----------------------------------------------------------------------------------
    // LOADING UI
    // ----------------------------------------------------------------------------------
    if (loading) {

        return (
            <Box
                sx={{
                    // backgroundColor: "var(--bg-subtle)",
                    borderRadius: "12px",
                    px: 3,
                    py: 3,
                    mt: 3,
                }}
            >
                <Skeleton variant="text" sx={{ fontSize: isMobile ? '1.5rem' : '2rem', width: '30%', mb: 2 }} />

                {isMobile ? (
                    <Swiper modules={[Autoplay, FreeMode]} spaceBetween={16} slidesPerView={2.2}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SwiperSlide key={i}>
                                <CategoryCardSkeleton />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <Grid container spacing={2}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Grid item xs={3} sm={2} md={1.5} key={i}>
                                <CategoryCardSkeleton />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: "center", color: "var(--danger)", mt: 3 }}>
                <Typography>Failed to load categories</Typography>
                <Typography variant="body2">{error}</Typography>
            </Box>
        );
    }

    if (categories.length === 0) {
        return (
            <Typography sx={{ textAlign: "center", mt: 3, color: "var(--text-secondary)" }}>
                No categories available.
            </Typography>
        );
    }

    // ----------------------------------------------------------------------------------
    // FINAL RENDER
    // ----------------------------------------------------------------------------------
    return (
        <Box sx={{ borderRadius: "12px", px: 3, py: 3, mt: 3 }}>

            {/* HEADER */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2,mr:1 }}>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                    All Categories
                </Typography>

                {!isMobile && categories.length > 8 && (
                     <Button
  onClick={toggleExpand}
  sx={{
    textTransform: "none",
    color: "var(--brand-green-hover)",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px", // 👈 yaha gap control karo
  }}
>
  {expanded ? "Show Less" : "View All"}

  {!expanded && (
    <EastIcon
      sx={{
        fontSize: 15, // thoda chota
        color: "var(--food-cta-green)",
      }}
    />
  )}
</Button>
                )}
            </Box>

            {/* MOBILE SWIPER */}
            {isMobile && !expanded ? (

                <Swiper
                    modules={[Autoplay, FreeMode]}
                    slidesPerView={3.2}
                    spaceBetween={12}

                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                >
                    {initialCategories.map((cat) => (
                        <SwiperSlide key={cat.id}>
                            <Link
                                href={{
                                    pathname: "/home",
                                    query: {
                                        search: "category",
                                        id: cat.id,
                                        module_id: getModuleId(),
                                        name: btoaSafe(cat.name),
                                        data_type: "category",
                                    },
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                    setTimeout(() => {
                                        window.location.href = e.target.closest("a").href;
                                    }, 500);
                                }}
                                style={{ textDecoration: "none" }}
                            >
                                <CategoryCardContent cat={cat} />
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>

            ) : (
                // DESKTOP & EXPANDED
                <Grid container spacing={2}>
                    {initialCategories.map((cat) => (
                        <Grid item xs={3} sm={2} md={1.5} key={cat.id}>
                            <Link
                                href={{
                                    pathname: "/home",
                                    query: {
                                        search: "category",
                                        id: cat.id,
                                        module_id: getModuleId(),
                                        name: btoaSafe(cat.name),
                                        data_type: "category",
                                    },
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                    setTimeout(() => {
                                        window.location.href = e.target.closest("a").href;
                                    }, 500);
                                }}
                                style={{ textDecoration: "none" }}
                            >
                                <CategoryCardContent cat={cat} />
                            </Link>
                        </Grid>
                    ))}

                    <Collapse in={expanded} timeout={400} sx={{ width: '100%' }}>
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {expandedCategories.map((cat) => (
                                <Grid item xs={3} sm={2} md={1.5} key={cat.id}>
                                    <Link
                                        href={{
                                            pathname: "/home",
                                            query: {
                                                search: "category",
                                                id: cat.id,
                                                module_id: getModuleId(),
                                                name: btoaSafe(cat.name),
                                                data_type: "category",
                                            },
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                            setTimeout(() => {
                                                window.location.href = e.target.closest("a").href;
                                            }, 500);
                                        }}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <CategoryCardContent cat={cat} />
                                    </Link>
                                </Grid>
                            ))}
                        </Grid>
                    </Collapse>
                </Grid>
            )}
        </Box>
    );
};

export default AllFoodCategories;
