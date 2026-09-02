import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, IconButton, Typography, Rating, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// API Endpoint for fetching reviews
const fetchReviews = async (storeId) => {
  try {
    const response = await fetch(`https://dealplex.in/api/v1/stores/reviews?store_id=${storeId}`, {
      method: "GET",
      headers: {
        moduleId: "5",
        zoneId: "[15,17]",
      },
    });
    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    // console.error("Failed to fetch reviews:", error);
    return [];
  }
};

const RestaurantReviewModal = ({ openReviews, setOpenReviews, storeId, restaurant }) => {
  const [reviews, setReviews] = useState([]);

  // Fetch reviews when the modal opens or storeId changes
  useEffect(() => {
    if (storeId) {
      const loadReviews = async () => {
        const fetchedReviews = await fetchReviews(storeId);
        setReviews(fetchedReviews);
      };
      loadReviews();
    }
  }, [storeId]);

  return (
    <Dialog
      open={openReviews}
      onClose={() => setOpenReviews(false)}
      maxWidth="xs"
      fullWidth
      sx={{
        "& .MuiDialog-paper": { borderRadius: "12px", padding: "0px" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
        }}
      >
        <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
          {restaurant?.name} Reviews
        </Typography>

        <IconButton onClick={() => setOpenReviews(false)} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ padding: "12px 16px" }}>
        {reviews?.length > 0 ? (
          reviews.map((review, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: "10px",
                boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.07)",
                backgroundColor: "#fff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#1976d2",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    mr: 1,
                    fontSize: "0.85rem",
                  }}
                >
                  {review.customer?.f_name?.[0]?.toUpperCase() || "U"}
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {review.customer?.f_name || "Unknown User"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "gray" }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Typography>
                </Box>

                <Rating
                  value={review.rating}
                  readOnly
                  size="small"
                  precision={0.5}
                />
              </Box>

              <Typography sx={{ fontSize: "0.85rem", color: "#444" }}>
                {review.comment}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ textAlign: "center", mt: 4 }}
          >
            No reviews available.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantReviewModal;
