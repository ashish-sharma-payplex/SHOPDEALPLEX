"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://dealplex.in/api/v1/categories", {
          headers: {
            moduleId: "2",
          },
        });
        const data = await res.json();

        // Find "Vegetables & Fruits" category
        const vegCategory = data.find(
          (cat) => cat.name === "Vegetables & Fruits",
        );

        if (vegCategory && vegCategory.childes) {
          // Fetch first product image for each subcategory
          const enrichedChildes = await Promise.all(
            vegCategory.childes.map(async (sub) => {
              try {
                const prodRes = await fetch(
                  `https://dealplex.in/api/v1/products?category_id=${sub.id}`,
                  {
                    headers: { moduleId: "2" },
                  },
                );
                const prodData = await prodRes.json();

                const firstProductImage =
                  prodData?.data?.[0]?.image_full_url || null;

                return {
                  ...sub,
                  displayImage:
                    firstProductImage ||
                    sub.image_full_url ||
                    "https://dealplex.in/storage/app/public/category/def.png",
                };
              } catch (err) {
                // console.error("Error fetching product image:", err);
                return {
                  ...sub,
                  displayImage:
                    sub.image_full_url ||
                    "https://dealplex.in/storage/app/public/category/def.png",
                };
              }
            }),
          );

          setCategories(enrichedChildes);
        }
      } catch (error) {
        // console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Vegetables & Fruits
      </Typography>

      <Grid container spacing={3}>
        {categories.map((sub) => (
          <Grid item xs={6} sm={4} md={2} key={sub.id}>
            <Link
              href={`/categories/${sub.slug}`}
              style={{ textDecoration: "none" }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "none",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 150,
                    width: "100%",
                    backgroundColor: "var(--bg-subtle)",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    overflow: "hidden", // prevents zoom overflow
                  }}
                >
                  <CardMedia
                    component="img"
                    image={sub.displayImage}
                    alt={sub.name}
                    sx={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 2,
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="text.primary"
                    textAlign="center"
                  >
                    {sub.name}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
