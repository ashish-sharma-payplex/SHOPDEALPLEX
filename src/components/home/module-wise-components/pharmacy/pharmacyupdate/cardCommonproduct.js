import React from "react";
import { Box, Typography, Button, CircularProgress, Grid } from "@mui/material";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import CustomImageContainer from "components/CustomImageContainer";

const PharmacyProductCard = ({
  item,
  handleProductPreview, // <-- New prop for modal opening
  handleAddToCart,
  addingProductId,
}) => {
  // Determine the price to display
  const currentPrice = item.discounted_price || item.price;
  const hasDiscount = item.discount > 0 || item.store_discount > 0;
  const oldPrice = hasDiscount ? item.price : null;

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid var(--border-default)",
        borderRadius: "12px",
        backgroundColor: "var(--bg-card)",
        transition: "all 0.25s ease",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "180px", // Reduced width for cards
        "&:hover": {
          boxShadow: "0 4px 10px var(--shadow-review-color)",
          transform: "translateY(-2px)",
        },
      }}
      onClick={() => handleProductPreview(item)}
    >
      {/* Product Image */}
      <Box
        sx={{
          width: "100%",
          height: "150px", // Adjusted height for smaller card size
          borderRadius: "8px",
          backgroundColor: "var(--bg-subtle)",
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s",
          "&:hover": { transform: "scale(1.05)" },
        }}
      >
        <CustomImageContainer
          src={item.image_full_url || item.image}
          alt={item.name}
          height="100%"
          width="100%"
          objectFit="contain"
          sx={{ borderRadius: "8px" }}
        />
      </Box>

      {/* Product Name */}
      <Typography
        variant="body2"
        fontWeight={600}
        noWrap
        title={item.name}
        sx={{
          fontSize: "14px", // Slightly smaller font size
          textAlign: "left",
          lineHeight: 1.3,
          color: "var(--text-primary)",
        }}
      >
        {item.name}
      </Typography>

      {/* Unit Type */}
      <Typography
        variant="caption"
        color="var(--text-secondary)"
        sx={{ textAlign: "left", mb: 1 }}
      >
        {item.unit_type || "1 pack"}
      </Typography>

      {/* Price + Add button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: "auto",
        }}
      >
        <Box
          sx={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 0.6,
          }}
        >
          {/* Current Price */}
          <Typography
            variant="body1"
            fontWeight={700}
            sx={{ color: "var(--text-strong)" }}
          >
            {getAmountWithSign(currentPrice) || `₹${currentPrice}`}
          </Typography>

          {/* Old/Discounted Price */}
          {hasDiscount && oldPrice && (
            <Typography
              variant="body2"
              sx={{
                textDecoration: "line-through",
                fontSize: "13px",
                color: "var(--text-faint)",
              }}
            >
              {getAmountWithSign(oldPrice) || `₹${oldPrice}`}
            </Typography>
          )}
        </Box>

        {/* ADD Button */}
        <Button
          variant="outlined"
          size="small"
          disabled={addingProductId === item.id}
          onClick={(e) => {
            e.stopPropagation(); // Prevents handleProductPreview from being called
            handleAddToCart(item);
          }}
          sx={{
            fontWeight: 700,
            borderRadius: "4px",
            textTransform: "none",
            fontSize: "13px",
            minWidth: "58px",
            height: "30px",
            color: "var(--pharmacy-cta-green)",
            backgroundColor: "var(--pharmacy-add-btn-bg)",
            border: "1.8px solid var(--pharmacy-cta-green)",
            "&:hover": {
              backgroundColor: "var(--pharmacy-add-btn-hover-bg)",
              borderColor: "var(--pharmacy-cta-green-hover)",
            },
            "&.Mui-disabled": {
              color: "var(--text-faint)",
              borderColor: "var(--border-default)",
              backgroundColor: "var(--bg-subtle)",
            },
          }}
        >
          {addingProductId === item.id ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            "ADD"
          )}
        </Button>
      </Box>
    </Box>
  );
};

// Parent component to display cards in a grid layout with 5 cards per row
const PharmacyProductList = ({
  products,
  handleProductPreview,
  handleAddToCart,
  addingProductId,
}) => {
  return (
    <Grid
      container
      spacing={2} // Gap between cards
      sx={{
        overflowX: "auto", // Enables horizontal scroll when cards overflow
        flexWrap: "wrap", // Wraps items in case they don't fit on the screen
      }}
    >
      {products.map((item) => (
        <Grid item xs={12} sm={6} md={4} lg={2.4} key={item.id}>
          <PharmacyProductCard
            item={item}
            handleProductPreview={handleProductPreview}
            handleAddToCart={handleAddToCart}
            addingProductId={addingProductId}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default PharmacyProductList;
