import React from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import CustomImageContainer from "../../../../../components/CustomImageContainer"; // Assuming you have this component

const ProductCard = ({ product, onAddToCart, isAdding, onPreviewProduct }) => {
  const finalPrice =
    product.discount > 0 ? product.price - product.discount : product.price;
  const outOfStock =
    product.stock === 0 || product.stock === null || product.in_stock === false;

  const handleAddToCartClick = (e) => {
    e.stopPropagation(); // Prevent card click from triggering
    // console.log("Add to Cart clicked for:", product.name);
    onAddToCart(product); // Trigger the parent function to add the product to the cart
  };

  const handleImageClick = () => {
    // console.log("Image clicked for:", product.name);
    onPreviewProduct(product); // Trigger the parent function to preview the product
  };

  return (
    <Card
      sx={{
        minWidth: 180,
        maxWidth: 180,
        height: 240,
        borderRadius: "12px !important",
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 2px 6px var(--shadow-review-color)",
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
        transition: "0.3s",
        "&:hover": {
          boxShadow: "0 4px 12px var(--shadow-review-color)",
          transform: "translateY(-3px)",
        },
      }}
      onClick={handleImageClick} // Image click will open the preview modal
    >
      {/* Discount Tag */}
      {!outOfStock && product.discount > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 8,
            background: "linear-gradient(135deg, #ff8a65 0%, #ffbc5a 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.55rem",
            padding: "4px 6px",
            width: "30px",
            textAlign: "center",
            clipPath: `polygon(
              0 0,
              100% 0,
              100% 85%,
              90% 100%,
              80% 85%,
              70% 100%,
              60% 85%,
              50% 100%,
              40% 85%,
              30% 100%,
              20% 85%,
              10% 100%,
              0 85%
            )`,
            zIndex: 10,
          }}
        >
          {product.discount}% OFF
        </Box>
      )}

      <CardContent sx={{ p: 0 }}>
        {/* IMAGE */}
        <Box
          sx={{
            width: "100%",
            height: 120,
            borderRadius: "10px",
            bgcolor: "var(--bg-subtle)",
            mb: 1,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: outOfStock ? 0.4 : 1,
          }}
        >
          <CustomImageContainer
            src={product.image_full_url || product.image}
            alt={product.name}
            width="100%"
            height="100%"
            objectFit="contain"
          />
        </Box>

        {/* PRODUCT NAME */}
        <Typography
          noWrap
          sx={{
            fontWeight: 600,
            fontSize: "14px",
            mb: 0.5,
            textAlign: "left",
            color: "var(--text-primary)",
          }}
        >
          {product.name}
        </Typography>

        {/* UNIT */}
        <Typography
          variant="caption"
          sx={{
            color: "var(--text-secondary)",
            mb: 1,
            display: "block",
            textAlign: "left",
          }}
        >
          {product.unit_type || "1 pack"}
        </Typography>

        {/* OUT OF STOCK */}
        {outOfStock ? (
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--danger)",
              mt: 1,
              textAlign: "left",
            }}
          >
            Out of Stock
          </Typography>
        ) : (
          <>
            {/* Price + Add */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: "auto",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "var(--pharmacy-cta-green)",
                  }}
                >
                  ₹{finalPrice}
                </Typography>

                {product.discount > 0 && (
                  <Typography
                    sx={{
                      textDecoration: "line-through",
                      fontSize: "12px",
                      color: "var(--text-faint)",
                    }}
                  >
                    ₹{product.price}
                  </Typography>
                )}
              </Box>

              <Button
                variant="outlined"
                size="small"
                disabled={isAdding === product.id} // Disable if product is being added
                onClick={handleAddToCartClick} // Button click will add to cart
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "12px",
                  px: 1.5,
                  height: "28px",
                  borderRadius: "6px",
                  color: "var(--pharmacy-cta-green)",
                  borderColor: "var(--pharmacy-cta-green)",
                  "&:hover": {
                    backgroundColor: "var(--pharmacy-add-btn-hover-bg)",
                    borderColor: "var(--pharmacy-cta-green-hover)",
                  },
                }}
              >
                {isAdding === product.id ? "..." : "ADD"}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
