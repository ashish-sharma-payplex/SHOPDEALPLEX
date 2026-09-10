import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Collapse,
  Skeleton,
  IconButton,
  useMediaQuery, // ✅ ADD
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"; // ✅ ADD
import Link from "next/link";
import MainApi from "api-manage/MainApi";
import { zoneId_api } from "api-manage/ApiRoutes";

const CARD_WIDTH = 130;  // ✅ ADD
const CARD_GAP = 16;     // ✅ ADD (matches gap: 2 = 16px)
const btoaSafe = (str) =>
  typeof window !== "undefined"
    ? window.btoa(str)
    : Buffer.from(str).toString("base64");

const getModuleId = () => 2;
const API_URL = "https://dealplex.in/api/v1/categories";

const GroceryCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [zoneIds, setZoneIds] = useState([15, 16]);
  const containerRef = useRef(null);

  // ✅ ADD — slider refs & state
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  // ✅ ADD — scroll position checker
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  // ✅ ADD — attach scroll/resize listeners
  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories, expanded]); // re-check when data loads or expanded changes

  // ✅ ADD — arrow click handlers
  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -(CARD_WIDTH + CARD_GAP) * 2, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: (CARD_WIDTH + CARD_GAP) * 2, behavior: "smooth" });

  // ── all your existing functions unchanged ──────────────────────────

  const fetchZoneId = async () => {
    try {
      const storedLatLng = localStorage.getItem("currentLatLng");
      if (!storedLatLng) return;
      const { lat, lng } = JSON.parse(storedLatLng);
      if (!lat || !lng) return;
      const res = await MainApi.get(zoneId_api, { params: { lat, lng } });
      const data = res.data;
      const zones =
        data?.zone_ids ||
        data?.data?.zone_ids ||
        data?.zone_id ||
        data?.data?.zone_id;
      if (!zones) return;
      const zoneArray = Array.isArray(zones) ? zones : [zones];
      localStorage.setItem("zoneid", JSON.stringify(zoneArray));
      setZoneIds(zoneArray);
    } catch (err) {
      // console.error("❌ ZONE FETCH FAILED:", err);
    }
  };

  const getLatLngFromStorage = () => {
    const currentLatLng = localStorage.getItem("currentLatLng");
    if (currentLatLng) {
      try {
        const parsedLatLng = JSON.parse(currentLatLng);
        return { lat: parsedLatLng.lat, long: parsedLatLng.lng };
      } catch (error) {
        return { lat: null, long: null };
      }
    }
    return { lat: null, long: null };
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const zone = JSON.parse(localStorage.getItem("zoneid"));
      const { lat, long } = getLatLngFromStorage();
      const zones = zone ?? ["0"];
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          moduleId: "2",
          zoneId: JSON.stringify(zones),
          latitude: lat,
          longitude: long,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("zoneid");
    if (stored) {
      setZoneIds(JSON.parse(stored));
    } else {
      fetchZoneId();
    }
  }, []);

  useEffect(() => {
    if (zoneIds.length === 0) return;
    fetchCategories(zoneIds);
  }, [zoneIds]);

  const toggleExpand = () => setExpanded((prev) => !prev);

  // ── skeleton & error states unchanged ─────────────────────────────

  if (loading) {
    return (
      <Box sx={{ backgroundColor: "var(--bg-card)", borderRadius: "12px", px: 3, py: 3, mt: 3, width: "100%" }}>
        <Skeleton variant="text" sx={{ fontSize: "2rem", width: "30%", mb: 2 }} />
        <Box sx={{ display: "flex", overflowX: "auto", gap: 2 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} sx={{ borderRadius: "16px", width: "130px", minWidth: "130px", backgroundColor: "var(--bg-card)", boxShadow: "none", overflow: "hidden" }}>
              <Skeleton variant="rectangular" width={130} height={120} />
              <Box sx={{ p: 1 }}>
                <Skeleton variant="text" sx={{ width: "80%" }} />
                <Skeleton variant="text" sx={{ width: "60%" }} />
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  if (error)
    return (
      <Box sx={{ textAlign: "center", mt: 3, color: "var(--danger)" }}>
        Failed to load categories<br />{error}
      </Box>
    );

  if (!categories.length)
    return (
      <Typography sx={{ textAlign: "center", mt: 3, color: "var(--text-muted)" }}>
        No categories available.
      </Typography>
    );

  // ── CategoryCard unchanged ─────────────────────────────────────────

  const CategoryCard = ({ cat }) => (
    <Card sx={{ borderRadius: 4, width: "130px", minWidth: "130px",  boxShadow: "none", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s", "&:hover": { transform: "scale(1.03)" }, display: "flex", flexDirection: "column" }}>
      <Box sx={{ width: "100%", aspectRatio: "1 / 1", backgroundColor: "var(--bg-muted)", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", borderRadius: "12px" }}>
        <img src={cat.image_full_url || cat.image || "/placeholder.png"} alt={cat.name} title={cat.name} style={{ width: "180px", height: "170px", objectFit: "contain" }} />
      </Box>
      <Box
        sx={{
          backgroundColor: "var(--bg-card)",
          px: 1,
          py: 1.2,
          textAlign: "center",
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="body2"
          fontFamily="Inter"
          sx={{
           fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: isMobile ? "14px" : "16px",
            color: "var(--text-strong)",
            // whiteSpace: "nowrap",
            lineHeight: "1.3",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {cat.name}
        </Typography>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: "var(--bg-card)", borderRadius: "12px", px: 8, py: 3, mt: 3, width: "100%", maxWidth: "1320px" }} ref={containerRef}>

      {/* HEADER — unchanged */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: isMobile ? "18px" : "24px",
            color: "var(--text-strong)",
            whiteSpace: "nowrap",
          }}
        >
          Shop by Categories
        </Typography>
        {/* {categories.length > 8 && (
          <Button onClick={toggleExpand} sx={{ textTransform: "none", fontWeight: 700, color: "var(--brand-green-hover)", display: "flex", alignItems: "center", gap: 0.5 }}>
            {expanded ? "Show Less" : "View All"}
            {!expanded && <ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
          </Button>
        )} */}
      </Box>

      {/* ✅ SCROLLABLE ROW — wrapped in relative Box for arrow positioning */}
      {!expanded && (
        <Box sx={{ position: "relative" }}>

          {/* ✅ Left Arrow */}
          {canScrollLeft && (
            <IconButton onClick={scrollLeft} sx={{ position: "absolute", left: { xs: "2px", sm: "-18px" }, top: "40%", transform: "translateY(-50%)", zIndex: 20, backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-arrow)", width: "30px", height: "30px", "&:hover": { backgroundColor: "var(--bg-muted)" } }}>
              <ArrowBackIosNewIcon sx={{ fontSize: "16px" }} />
            </IconButton>
          )}

          {/* ✅ Right Arrow */}
          {canScrollRight && (
            <IconButton onClick={scrollRight} sx={{ position: "absolute", right: { xs: "2px", sm: "-18px" }, top: "40%", transform: "translateY(-50%)", zIndex: 20, backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-arrow)", width: "30px", height: "30px", "&:hover": { backgroundColor: "var(--bg-muted)" } }}>
              <ArrowForwardIosIcon sx={{ fontSize: "16px" }} />
            </IconButton>
          )}

          {/* Scrollable row — ref added, everything else unchanged */}
          <Box
            ref={scrollRef} // ✅ ADD
            sx={{ display: "flex", overflowX: "auto", gap: 2, paddingBottom: 1, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
          >
            {categories.map((cat) => (
              <Box key={cat.id} sx={{ flex: "0 0 auto" }}>
                <Link href={{ pathname: "/home", query: { search: "category", id: cat.id, module_id: `${getModuleId()}`, zone_id: JSON.stringify(zoneIds), name: btoaSafe(cat.name), data_type: "category" } }} style={{ textDecoration: "none" }}>
                  <CategoryCard cat={cat} />
                </Link>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* EXPANDED GRID — completely unchanged */}
      <Collapse in={expanded} timeout={400}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {categories.map((cat) => (
            <Grid key={cat.id} item xs={6} sm={4} md={3} lg={2} xl={2}>
              <Link href={{ pathname: "/home", query: { search: "category", id: cat.id, module_id: `${getModuleId()}`, name: btoaSafe(cat.name), data_type: "category" } }} style={{ textDecoration: "none" }}>
                <CategoryCard cat={cat} />
              </Link>
            </Grid>
          ))}
        </Grid>
      </Collapse>

    </Box>
  );
};

export default GroceryCategories;