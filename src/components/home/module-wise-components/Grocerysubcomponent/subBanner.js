"use client";

import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function GroceryBanner() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(692));

  // ⭐ Simulated loading for skeleton
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // mimic a loading delay — replace with real API or remove timeout
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        
        marginTop: "50px",
        width: "100%",
        maxWidth: "1280px !important",
        backgroundImage: "linear-gradient(180deg, #F7F5F3 0%, #EAE9E4 100%)",
        borderRadius: "20px",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        overflow: "hidden",
        position: "relative",
       
      }}
    >
      {/* LEFT SECTION */}
      <Box sx={{ width: { xs: "100%", md: "50%" }, maxWidth: 520, px: 5, py:0 }}>
        {/* ⭐ Skeleton for heading */}
        {isLoading ? (
          <>
            <Skeleton variant="text" width="70%" height={50} />
            <Skeleton variant="text" width="50%" height={50} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="90%" height={25} sx={{ mt: 2 }} />
            <Skeleton variant="rectangular" width={140} height={45} sx={{ mt: 4, borderRadius: "30px" }} />
          </>
        ) : (
          <>
            <Typography
              variant="h3"
              sx={{ 
                fontWeight: 700, color: "#0f3d1e", lineHeight: 1.2 }}
            >
              Get Your Groceries
            </Typography>

            <Typography
              variant="h3"
              sx={{ fontWeight: 700, mt: 1, color: "#ffcd00" }}
            >
              in 10 min
            </Typography>

            <Typography sx={{ mt: 2, color: "#555", lineHeight: 1.6 }}>
              Stop Juggling Apps. Get Everything Local In One Simple Tap
            </Typography>

            <Button
              variant="contained"
              onClick={() => {
                document.getElementById("order-section")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              sx={{
                mt: 2,
                backgroundColor: "#ffd233",
                color: "#000",
                px: 2,
                py: 1.4,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#ffcd00",
                },
              }}
            >
              Order Now →
            </Button>
          </>
        )}
      </Box>

      {/* RIGHT IMAGE — Desktop Only */}
      {!isMobile && (
        <Box
          sx={{
            width: { xs: "100%", md: "45%" },
            height: { xs: 180, md: 250 },
            position: "relative",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          {/* ⭐ Image Skeleton */}
          {isLoading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              sx={{ borderRadius: "12px" }}
            />
          ) : (
            <Image
              src="/BG.png"
              alt="Grocery Bag"
              fill
              priority
              style={{
                objectFit: "cover",
                objectPosition: "right bottom",
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
