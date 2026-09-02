import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import RestorentComponent from "./restocomponent/RestorentComponent";
import MainLayout from "../../src/components/layout/MainLayout"; // adjust path if needed
import { Box, Typography, CircularProgress } from "@mui/material"; // for nice loading UI

export default function RestaurantDetailPage({ configData }) {
  const router = useRouter();
  const { id } = router.query;

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchRestaurant = async () => {
      try {
        const res = await fetch(
          `https://dealplex.in/api/v1/stores/details/${id}`,
          {
            method: "GET",
            headers: {
              moduleId: "5",
              zoneId: "[15,17]",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setRestaurant(data);
      } catch (err) {
        // console.error("Restaurant fetch failed", err);
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  return (
    <MainLayout configData={configData}>
      <Box sx={{ p: 3 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress /> {/* Better than plain text */}
          </Box>
        )}

        {!loading && !restaurant && (
          <Typography
            variant="h6"
            color="error"
            sx={{ textAlign: "center", mt: 5 }}
          >
            Restaurant not found
          </Typography>
        )}

        {!loading && restaurant && (
          <RestorentComponent
            restaurant={restaurant}
            onBack={() => router.push("/restaurant")}
          />
        )}
      </Box>
    </MainLayout>
  );
}
