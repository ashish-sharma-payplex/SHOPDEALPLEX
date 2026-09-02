"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  Typography,
  Button,
  Skeleton,
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";

const CustomContainer = ({ children }) => (
  <Box sx={{ maxWidth: 1300, mx: "auto" }}>{children}</Box>
);

const fetchPopularItems = async () => {
  try {
    const moduleId = 2;
    const zoneIds = [15, 16];
    const apiUrl = `https://dealplex.in/api/v1/items/popular?limit=10&offset=1`;

    // console.log("Fetching API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        moduleId: String(moduleId),
        zoneId: JSON.stringify(zoneIds),
      },
    });

    // console.log("HTTP Status:", response.status);
    // console.log("Response Headers:", [...response.headers.entries()]);

    const text = await response.text();
    // console.log("Raw Response Body:", text);

    let result;
    try {
      result = JSON.parse(text);
      // console.log("Parsed JSON Response:", result);
    } catch (jsonError) {
      // console.error("JSON Parsing Error:", jsonError);
      throw new Error(`Invalid JSON response: ${text}`);
    }

    if (!response.ok) {
      throw new Error(
        `API Error (Status ${response.status}): ${JSON.stringify(result)}`
      );
    }

    return result;
  } catch (error) {
    // console.error("Fetch Error:", error);
    throw error;
  }
};

const GrocerySession = () => {
  const router = useRouter();
  const [addingProductId, setAddingProductId] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchPopularItems();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  const products = useMemo(() => {
    if (!data) return [];
    return data.items || data.products || [];
  }, [data]);

  const handleAddToCart = (item) => {
    setAddingProductId(item.id);
    setTimeout(() => {
      toast.success(`${item.name} added to cart!`);
      setAddingProductId(null);
    }, 700);
  };

  const handleProductPreview = (item) => {
    toast(item.name);
  };

  return (
    <CustomContainer>
      <Toaster position="top-center" reverseOrder={false} />

      <Box
        sx={{
          px: { xs: 2, sm: 4, md: 8 },
          py: 3,
          background: "#fff",
          borderRadius: 2,
          boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Shop Fresh Groceries
          </Typography>
          <Button
            onClick={() => router.push("/grocery")}
            variant="text"
            sx={{
              color: "#16a34a",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            View All →
          </Button>
        </Box>

        {/* Product Grid */}
        <Grid container spacing={2.5} justifyContent="center">
          {/* Loading */}
          {isLoading &&
            Array.from({ length: 8 }).map((_, idx) => (
              <Grid item xs={6} sm={4} md={2.4} key={idx}>
                <Skeleton
                  variant="rectangular"
                  height={230}
                  sx={{ borderRadius: "12px" }}
                />
              </Grid>
            ))}

          {/* Products */}
          {!isLoading &&
            products.map((item) => (
              <Grid item xs={6} sm={4} md={2.4} key={item.id}>
                <Box
                  onClick={() => handleProductPreview(item)}
                  sx={{
                    p: 2,
                    border: "1px solid #eee",
                    borderRadius: "12px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": { boxShadow: 2 },
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {/* Image */}
                  {item.image ? (
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        height: 110,
                        width: "100%",
                        objectFit: "contain",
                        mb: 1,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 110,
                        width: "100%",
                        bgcolor: "#f0f0f0",
                        mb: 1,
                        borderRadius: 1,
                      }}
                    />
                  )}

                  {/* Name */}
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    noWrap
                    title={item.name}
                  >
                    {item.name || "Unnamed Product"}
                  </Typography>

                  {/* Weight */}
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                    {item.weight || "250 g"}
                  </Typography>

                  {/* Price */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1" fontWeight={700} color="success.main">
                      ₹{item.price}
                    </Typography>
                    {item.originalPrice && item.originalPrice !== item.price && (
                      <Typography
                        variant="body2"
                        color="text.disabled"
                        sx={{ textDecoration: "line-through" }}
                      >
                        ₹{item.originalPrice}
                      </Typography>
                    )}
                  </Box>

                  {/* Add button */}
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    disabled={addingProductId === item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                    sx={{
                      mt: "auto",
                      fontWeight: 700,
                      borderRadius: 1,
                    }}
                  >
                    {addingProductId === item.id ? "Adding..." : "ADD"}
                  </Button>
                </Box>
              </Grid>
            ))}

          {/* Empty */}
          {!isLoading && products.length === 0 && !error && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              No grocery products found.
            </Typography>
          )}

          {/* Error */}
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 3 }}>
              Failed to load groceries.
            </Typography>
          )}
        </Grid>
      </Box>
    </CustomContainer>
  );
};

export default GrocerySession;
