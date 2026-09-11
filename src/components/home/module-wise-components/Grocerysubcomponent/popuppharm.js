"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  Rating,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { toast } from "react-hot-toast";

// Redux imports
import {
  setIncrementToCartItem,
  setDecrementToCartItem,
  setBuyNowItemList,
  fetchCartFromApi,
  setRemoveItemFromCart,
} from "redux/slices/cart";
import { getItemDataForAddToCart } from "components/product-details/product-details-section/helperFunction";
// Hook for adding items to the cart
import useAddCartItem from "api-manage/hooks/react-query/add-cart/useAddCartItem";
// Helper functions
import { getGuestId } from "helper-functions/getToken";
import { getCorrectCart } from "helper-functions/getCorrectCart";

// Function to get user identifier (token or guest)
const getUserIdentifier = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? token : getGuestId();
};

const Perticular1 = ({
  open,
  onClose,
  product,
  isWishlisted,
  addToWishlist,
  removeFromWishlist,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1); // Local state for quantity
  const [currentVariation, setCurrentVariation] = useState(
    product?.variations?.[0] || {},
  ); // Default to the first variation if available
  const [cartQuantity, setCartQuantity] = useState(0); // Cart quantity for product
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // For gallery image navigation
  const [openReviews, setOpenReviews] = useState(false); // Control review dialog
  const [reviews, setReviews] = useState([]); // Store reviews
  const [averageRating, setAverageRating] = useState(0); // Store average rating
  const [reviewCount, setReviewCount] = useState(0); // Store review count
  const [loading, setLoading] = useState(true); // Loading state

  const cartList = useSelector((state) => getCorrectCart(state));

  const addCartMutation = useAddCartItem();

  const mainImage = product?.image_full_url || ""; // The main image
  const galleryImages = [mainImage, ...(product?.images_full_url || [])]; // Include main image in gallery

  const MAX_CART_QUANTITY = product?.maximum_cart_quantity || 1; // Get maximum cart quantity from product data

  // ---- Price Calculation ----
  const getUpdatedPrice = (variation, qty) => {
    if (product?.variations?.length > 0 && variation?.price) {
      // If variations exist, use the selected variation price
      const discountPrice =
        variation.price - (variation.price * (product?.discount || 0)) / 100;
      return discountPrice * qty;
    } else {
      // If no variations exist, apply discount directly on base product price
      const discountPrice =
        product?.price - (product?.price * (product?.discount || 0)) / 100;
      return discountPrice * qty;
    }
  };

  // ---- Get Original Price ----
  const getOriginalPrice = () => {
    // If variations exist, use the selected variation price
    if (product?.variations?.length > 0 && currentVariation?.price) {
      return currentVariation?.price * quantity;
    } else {
      // If no variations, use the base product price
      return product?.price * quantity;
    }
  };

  // Calculate the discount percentage
  const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
    if (!originalPrice || !discountedPrice) return 0;
    return ((originalPrice - discountedPrice) / originalPrice) * 100;
  };

  const discountPercentage = calculateDiscountPercentage(
    getOriginalPrice(),
    getUpdatedPrice(currentVariation, quantity),
  );

  // ---- Image Carousel ----
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  // ---- Handle Gallery Image Click ----
  const handleGalleryImageClick = (index) => {
    setCurrentImageIndex(index); // Update the main image with the clicked gallery image
  };

  // ---- Increment / Decrement ----
  const handleIncrement = () => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + 1;

      // Check if the new quantity exceeds the maximum allowed
      if (newQuantity > MAX_CART_QUANTITY) {
        // Show an error if the new quantity exceeds the maximum limit
        toast.error(
          `You can't add more than ${MAX_CART_QUANTITY} items to the cart.`,
        );
        return prevQuantity; // Prevent incrementing
      }

      updateCartState(newQuantity);
      return newQuantity;
    });
  };

  const handleDecrement = () => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity > 1 ? prevQuantity - 1 : 1;
      updateCartState(newQuantity);
      return newQuantity;
    });
  };

  // ---- Update Cart ----
  const updateCartState = (newQuantity) => {
    const userId = getUserIdentifier();
    const cartItem = cartList.find((item) => item.product.id === product?.id);

    if (!cartItem) {
      return; // Prevent further operations if the product is not found in the cart
    }

    const newTotal = getUpdatedPrice(currentVariation, newQuantity);

    const updatedPayload = {
      ...cartItem,
      quantity: newQuantity,
      totalPrice: newTotal,
      userId,
    };

    dispatch(setIncrementToCartItem(updatedPayload));

    setTimeout(() => {
      dispatch(fetchCartFromApi());
    }, 300);
  };

  // ---- Add to Cart ----
  const handleAddToCart = () => {
    const userId = getUserIdentifier();
    // console.log("=== Add to Cart Triggered ===");
    // console.log("User ID:", userId);
    // console.log("Product:", product);
    // console.log("Selected Quantity:", quantity);
    // console.log("Current Variation:", currentVariation);
    // console.log("Current Cart List:", cartList);

    // Check if the item already exists in the cart
    const cartItem = cartList.find((item) => item.product.id === product?.id);
    //  console.log("Existing Cart Item:", cartItem);

    if (cartItem) {
      // Calculate the new quantity (existing quantity + newly added quantity)
      const newQty = cartItem.quantity + quantity;
      // console.log(`Updating quantity from ${cartItem.quantity} to ${newQty}`);

      // Recalculate the total price
      const newTotal = getUpdatedPrice(currentVariation, newQty);
      // console.log("New Total Price:", newTotal);

      const updatedPayload = {
        ...cartItem,
        quantity: newQty,
        totalPrice: newTotal,
        userId,
      };
      // console.log("Payload for dispatching increment:", updatedPayload);

      dispatch(setIncrementToCartItem(updatedPayload));

      setTimeout(() => {
        // console.log("Fetching updated cart after increment...");
        dispatch(fetchCartFromApi());
      }, 300);

      toast.success(`${product?.name} quantity updated in cart`);
    } else {
      // If the item does not exist in the cart, add it to the cart
      const payload = getItemDataForAddToCart(
        product,
        quantity,
        currentVariation?.price,
        currentVariation,
        userId,
      );
      payload.totalPrice = getUpdatedPrice(currentVariation, quantity);

      // console.log("Payload for addCartMutation:", payload);

      addCartMutation.mutate(payload, {
        onSuccess: (response) => {
          // console.log("Add to Cart Success Response:", response);

          setTimeout(() => {
            // console.log("Fetching updated cart after addition...");
            dispatch(fetchCartFromApi());
          }, 300);

          toast.success(`${product?.name} added to cart`);
        },
        onError: (error) => {
          // console.error("Add to Cart Error:", error);
          toast.error("Failed to add to cart");
        },
      });
    }
  };

  // ---- Buy Now ----
  const handleBuyNow = () => {
    const payload = {
      ...product,
      quantity,
      price: getUpdatedPrice(currentVariation, quantity),
    }; // Add price based on selected variation
    dispatch(setBuyNowItemList(payload));
    router.push("/checkout?page=buy_now");
  };

  // Fetch reviews when the product ID is available
  const fetchReviews = async (productId) => {
    const headers = {
      moduleId: "5",
    };

    const params = new URLSearchParams({
      offset: 1,
      limit: 100,
    });

    const url = `https://dealplex.in/api/v1/items/reviews/${productId}?${params.toString()}`;

    try {
      const response = await fetch(url, { method: "GET", headers });
      if (!response.ok) {
        // console.error("Failed to fetch reviews");
        return;
      }
      const data = await response.json();
      // console.log("Fetched reviews data:", data);  // Log to check the data received

      if (data && data.reviews) {
        setReviews(data.reviews);
        setReviewCount(data.total_size || 0);

        // Calculate average rating
        const totalRating = data.reviews.reduce(
          (acc, review) => acc + review.rating,
          0,
        );
        setAverageRating(totalRating / data.reviews.length);
      }
    } catch (error) {
      // console.error("Error fetching reviews:", error);
    }
  };

  // Fetch reviews when the product ID is available
  useEffect(() => {
    if (open && product?.id) {
      setLoading(true); // Set loading state to true when fetching data
      fetchReviews(product.id).finally(() => setLoading(false)); // Fetch reviews and set loading to false after completion
    }
  }, [open, product?.id]);

  // Check if the product is already in the cart and set the quantity accordingly
  useEffect(() => {
    if (product?.id) {
      const cartItem = cartList.find((item) => item.product.id === product.id);
      if (cartItem) {
        setQuantity(cartItem.quantity); // Set the quantity to the one in the cart
      }
    }
  }, [open, product?.id, cartList]); // Only re-run when the product changes or the modal opens

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: "16px !important" } }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          color: "gray",
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent>
        <Grid container spacing={2}>
          {/* LEFT IMAGE SECTION */}
          <Grid item xs={12} md={6}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              height="300px"
            >
              {/* Main Image */}
              <Box
                sx={{
                  position: "relative",
                  flex: 1,
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "var(--shadow-review)",
                  width: 340,
                  height: 250,
                }}
              >
                <img
                  src={galleryImages[currentImageIndex] || mainImage}
                  alt={product?.name || "Product Image"} // Check for product existence
                  width={150}
                  height={130}
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                    borderRadius: "12px",
                    transition: "all 0.6s ease",
                  }}
                />
                <IconButton
                  onClick={prevImage}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 10,
                    transform: "translateY(-50%)",
                    bgcolor: "var(--grocery-overlay-70)",
                    "&:hover": { bgcolor: "var(--bg-card)" },
                  }}
                >
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={nextImage}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 10,
                    transform: "translateY(-50%)",
                    bgcolor: "var(--grocery-overlay-70)",
                    "&:hover": { bgcolor: "var(--bg-card)" },
                  }}
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Thumbnail Gallery */}
              <Box
                sx={{
                  display: "flex",
                  overflowX: "auto",
                  gap: 1,
                  marginTop: 2,
                }}
              >
                {galleryImages.map((img, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      border:
                        idx === currentImageIndex
                          ? "2px solid var(--brand-green)"
                          : "1px solid var(--border-default)",
                      borderRadius: 2,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "0.3s",
                      "&:hover": { border: "2px solid var(--brand-green)" },
                      flexShrink: 0,
                      maxWidth: "40px", // Adjust the max width and height
                      maxHeight: "40px", // Adjust the max width and height
                    }}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      width="40"
                      height="40"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* RIGHT PRODUCT DETAILS SECTION */}
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {product?.name || "Product Name"}{" "}
                {/* Fallback to Product Name */}
              </Typography>
              <Chip
                label="In Stock"
                color="success"
                size="small"
                sx={{ fontWeight: 600, marginLeft: "5px" }}
              />
            </Box>

            <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, marginRight: "5px" }}
              >
                Net Qty:{" "}
                <b>
                  {currentVariation?.type || "N/A"}{" "}
                  {product?.unit_type || "Unit"}
                </b>
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Rating value={averageRating} size="small" readOnly />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ cursor: "pointer" }}
                  onClick={() => setOpenReviews(true)} // Open reviews dialog on click
                >
                  {reviewCount} Reviews
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {product?.description || "Product Description"}
            </Typography>

            <Box display="flex" alignItems="center" sx={{ mt: 0.2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "green" }}>
                ₹{getUpdatedPrice(currentVariation, quantity)}
              </Typography>
              {product?.discount > 0 && (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: "line-through", ml: 1 }}
                  >
                    ₹{getOriginalPrice()}
                  </Typography>
                  <Chip
                    label={`${product.discount}% Off`}
                    color="error"
                    size="small"
                    sx={{
                      bgcolor: "var(--grocery-discount-bg)",
                      color: "var(--grocery-discount-text)",
                      ml: 1,
                    }}
                  />
                </>
              )}
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>Choose quantity</Typography>
              {product?.variations?.length > 0 ? (
                <ToggleButtonGroup
                  color="success"
                  value={currentVariation?.type}
                  exclusive
                  onChange={(e, newVariation) =>
                    setCurrentVariation(
                      product?.variations?.find((v) => v.type === newVariation),
                    )
                  }
                  sx={{ mt: 1 }}
                >
                  {product?.variations?.map((variation, idx) => (
                    <ToggleButton key={idx} value={variation.type}>
                      {variation.type} {product?.unit_type}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  No variations available. Showing base price.
                </Typography>
              )}

              <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  sx={{ minWidth: "28px", height: "28px" }}
                  onClick={handleDecrement}
                >
                  –
                </Button>
                <Typography variant="body1">{quantity}</Typography>
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  sx={{ minWidth: "28px", height: "28px" }}
                  onClick={handleIncrement}
                >
                  +
                </Button>
              </Box>
            </Box>

            <Box display="flex" gap={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ fontWeight: 600, flex: 1, py: 1.2 }}
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={{ fontWeight: 600, flex: 1, py: 1.2 }}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Reviews Dialog */}
      <Dialog
        open={openReviews}
        onClose={() => setOpenReviews(false)}
        maxWidth="xs"
        sx={{ "& .MuiDialog-paper": { borderRadius: "16px !important" } }}
        fullWidth
      >
        <Box
          sx={{
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <Typography sx={{ fontWeight: "bold" }}>
            {product?.name} Reviews
          </Typography>
          <IconButton onClick={() => setOpenReviews(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ padding: "12px 16px" }}>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card)",
                  boxShadow: "var(--shadow-review)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: "var(--grocery-blue-info)",
                      color: "var(--grocery-text-on-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      mr: 1,
                    }}
                  >
                    {review.customer
                      ? review.customer.f_name[0]?.toUpperCase()
                      : "U"}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {review.customer
                        ? review.customer.f_name
                        : "Unknown User"}
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
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: "var(--grocery-text-body)",
                  }}
                >
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
    </Dialog>
  );
};

export default Perticular1;
