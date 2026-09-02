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
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                backgroundColor: "#fff",
                transition: "all 0.25s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "180px", // Reduced width for cards
                "&:hover": {
                    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
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
                    backgroundColor: "#FAFAFA",
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
                    color: "#222",
                }}
            >
                {item.name}
            </Typography>

            {/* Unit Type */}
            <Typography
                variant="caption"
                color="#757575"
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
                        sx={{ color: "black" }}
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
                                color: "#9e9e9e",
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
                        color: "#16A34A",
                        backgroundColor: "#F8FFF9",
                        border: "1.8px solid #16A34A",
                        "&:hover": {
                            backgroundColor: "#E9F9EE",
                            borderColor: "#15803d",
                        },
                        "&.Mui-disabled": {
                            color: "#9e9e9e",
                            borderColor: "#e0e0e0",
                            backgroundColor: "#fafafa",
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
const PharmacyProductList = ({ products, handleProductPreview, handleAddToCart, addingProductId }) => {
    return (
        <Grid
            container
            spacing={2} // Gap between cards
            sx={{
                overflowX: 'auto', // Enables horizontal scroll when cards overflow
                flexWrap: 'wrap', // Wraps items in case they don't fit on the screen
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
