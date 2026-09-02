"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Skeleton,
} from "@mui/material";
import { FavoriteBorder, Star, AccessTime } from "@mui/icons-material";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useTranslation } from 'react-i18next';
import { useRouter } from "next/router";
import Link from "next/link";
import useStoreWishlistHandler from "components/home/search/pathflow/storewishlisthandler";
import EastIcon from '@mui/icons-material/East';

export default function RestaurantsGrid1() {
  const { t } = useTranslation();
  const { addStoreToWishlist, removeStoreFromWishlist, isStoreWishlisted } =
    useStoreWishlistHandler(t);
  const router = useRouter();

  const {
    module_id = "5",
    category_id = "",
    search = "",
    name = "",
  } = router.query;

  const [stores, setStores] = useState([]);
  const [zoneIds, setZoneIds] = useState([0]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------
  // FETCH ZONE-ID
  // -------------------------------------
  const fetchZoneId = async () => {
    try {
      const storedZone = localStorage.getItem("zoneid");
      const storedLatLng = localStorage.getItem("currentLatLng");

      // ✅ If zone exists → use it
      if (storedZone) {
        setZoneIds(JSON.parse(storedZone));
        return;
      }

      if (!storedLatLng) {
        setZoneIds([0]);
        return;
      }

      const { lat, lng } = JSON.parse(storedLatLng);

      if (!lat || !lng) {
        setZoneIds([0]);
        return;
      }

      const res = await fetch(
        `https://your-api-url.com/getZoneId?lat=${lat}&lng=${lng}`
      );

      const data = await res.json();

      if (data?.zoneIds?.length) {
        localStorage.setItem("zoneid", JSON.stringify(data.zoneIds));
        setZoneIds(data.zoneIds);
      } else {
        setZoneIds([0]);
      }
    } catch (err) {
      // console.error("Zone fetch failed:", err);
      setZoneIds([0]);
    }
  };

  // -------------------------------------
  // FETCH RESTAURANTS
  // -------------------------------------
  const fetchAllStores = async () => {
    try {
      setLoading(true);

      const storedLatLng = localStorage.getItem("currentLatLng");
      const { lat, lng } = storedLatLng
        ? JSON.parse(storedLatLng)
        : { lat: 0, lng: 0 };

      let apiUrl = "https://dealplex.in/api/v1/stores/get-stores/all";

      const headers = {
        moduleId: module_id || "5",
        zoneId: JSON.stringify(zoneIds?.length ? zoneIds : [0]),
        latitude: lat || 0,
        longitude: lng || 0,
      };

      if (search === "category" && category_id) {
        headers.categoryId = String(category_id);
      }

      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      setStores(data?.stores || []);
      setLoading(false);
    } catch (error) {
      // console.log("Fetch error:", error);
      setLoading(false);
    }
  };

  // Load zone on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchZoneId();
    }
  }, []);

  // Fetch restaurants after zone ready
  useEffect(() => {
    if (router.isReady) {
      fetchAllStores();
    }
  }, [router.isReady, module_id, category_id, zoneIds]);

  // -------------------------------------
  // DRAG SCROLL
  // -------------------------------------
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDown.current = true;
    scrollRef.current.style.cursor = "grabbing";
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseUp = () => {
    isDown.current = false;
    scrollRef.current.style.cursor = "grab";
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    scrollRef.current.style.cursor = "grab";
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <Box p={4}>
      {/* HEADER + VIEW ALL */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {search === "category"
              ? `Category: ${atob(name || "")}`
              : "Top Restaurants"}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {loading ? <Skeleton width="50%" /> : `${stores.length} Restaurants found`}
          </Typography>
        </Box>

        {/* VIEW ALL BUTTON → REMOVE FILTERS */}
        <Link
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "20px",
            padding: "4px 12px",
            border: "1px solid #cfeccc",
            textDecoration: "none",
          }}
          href={{
            pathname: "/restaurant",
            query: {
              view: "all",
              module_id: module_id,
              filter: "all",
            },
          }}
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => {
              window.location.href = e.target.closest("a").href;
            }, 500);
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "#1A914B", // ✅ FORCE TEXT COLOR
            }}
          >
            View All
            <EastIcon
              sx={{
                fontSize: 12,
                color: "#1A914B",
              }}
            />
          </span>
        </Link>
      </Box>

      {/* SINGLE HORIZONTAL SCROLL ROW */}
      <Box
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          pb: 1,
          whiteSpace: "nowrap",
          cursor: "grab",
          userSelect: "none",
          scrollBehavior: "smooth",
        }}
      >
        {loading ? (
          // Show Skeleton loading effect for cards
          <Skeleton variant="rectangular" width={280} height={380} sx={{ margin: 1 }} />
        ) : (
          stores.map((res) => (

            <Card
              key={res.id}
              sx={{
                minWidth: 320,
                width: 280,
                borderRadius: "12px !important",
                border: "1px solid #e0e0e0",
                overflow: "hidden",
                boxShadow: "none",
                display: "inline-block",
              }}

            >
              {/* IMAGE */}
              <Box position="relative">
                <Link
                  key={res.id}
                  href={`/restaurant/${res.id}`}
                  style={{ textDecoration: "none" }}
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setTimeout(() => {
                      window.location.href = e.target.closest("a").href;
                    }, 500);
                  }}
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={res.cover_photo_full_url || res.logo_full_url}
                    alt={res.name}
                    title={res.name}
                    style={{ objectFit: "cover" }}
                  />
                </Link>

                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 35,
                    height: 35,
                    borderRadius: "12px",
                    // backgroundColor: "rgba(255,255,255,0.95)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    // border:"1px solid #E7E7E7",
                    cursor: "pointer",
                    zIndex: 5,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      // backgroundColor: "#ffffff",
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isStoreWishlisted(res)) {
                      removeStoreFromWishlist(res, e);
                    } else {
                      addStoreToWishlist(res, e);
                    }
                  }}
                >
                  {isStoreWishlisted(res) ? (
                    <FavoriteIcon sx={{ color: "#E53935", fontSize: 20 }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ color: "#c4c2c2", fontSize: 20 }} />
                  )}
                </Box>

              </Box>

              {/* PRICE BAR */}
              <Box
                sx={{
                  background: "linear-gradient(150deg, #56e388ff, #f7fcf9ff)",
                  padding: "8px 12px",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "#1a3d1a", fontSize: "13px" }}
                >
                  {loading ? <Skeleton width="50%" /> : `ITEMS START AT ₹${res.minimum_order}`}
                </Typography>
              </Box>

              {/* CONTENT */}
              <CardContent sx={{ paddingTop: 1 }}>
                <Link
                  key={res.id}
                  href={`/restaurant/${res.id}`}
                  style={{ textDecoration: "none" }}
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setTimeout(() => {
                      window.location.href = e.target.closest("a").href;
                    }, 500);
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {loading ? <Skeleton width="80%" /> : res.name}
                    </Typography>

                    {/* Rating */}
                    <Box
                      display="flex"
                      alignItems="center"
                      sx={{
                        backgroundColor: "#E6F4EA",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        color: "#34A853",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      <Star sx={{ fontSize: 18, mr: 0.5 }} />
                      {loading ? <Skeleton width={30} /> : res.avg_rating?.toFixed(1)}
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.3 }}
                  >
                    {loading ? <Skeleton width="60%" /> : res.meta_description || "Cuisines available"}
                  </Typography>

                  {/* Address */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, mb: 1 }}
                  >
                    {loading ? (
                      <Skeleton width="60%" />
                    ) : (
                      (() => {
                        const words = res.address?.split(" ") || [];
                        if (words.length <= 45) return res.address;
                        return words.slice(0, 45).join(" ") + "...";
                      })()
                    )}
                  </Typography>

                  {/* Delivery Time */}
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AccessTime sx={{ fontSize: 17, color: "#555" }} />
                    <Typography variant="caption" color="text.secondary">
                      {loading ? <Skeleton width="30%" /> : res.delivery_time}
                    </Typography>
                  </Box>
                </Link>
              </CardContent>
            </Card>

          ))
        )}
      </Box>
    </Box>
  );
}