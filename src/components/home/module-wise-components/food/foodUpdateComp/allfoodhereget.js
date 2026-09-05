"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Typography,
  Container,
  Button,
  useMediaQuery,
  useTheme,
  Paper,
  IconButton,
  // Skeleton is now imported from @mui/material in modern versions
  // If using an older version, you might need: import { Skeleton } from "@mui/lab";
  Skeleton,
} from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
// NOTE: Assuming these imports point to valid files in your project structure
import useAddCartItem from "../../../../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import { setCartList } from "redux/slices/cart";
import { getGuestId } from "helper-functions/getToken";
import { getItemDataForAddToCart } from "../../../../product-details/product-details-section/helperFunction";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useTranslation } from "react-i18next";
import MainApi from "api-manage/MainApi";
import {
  categories_Childes_api,
  categories_details_api,
  zoneId_api,
  // NOTE: Assuming these imports point to valid files in your project structure
} from "api-manage/ApiRoutes";

// Use the same modal you used in FoodPopular
import ProductModal from "./popUpFood"; // ensure this path is correct

// Wishlist hook used in your Popular component
import useWishlistHandler from "../../../search/pathflow/wishlisthandler"; // ensure path is correct

// Constants
const CARD_WIDTH = 200;
const GREEN_COLOR = "var(--brand-green)";
const CATEGORIES_API_URL = "https://dealplex.in/api/v1/categories";
const moduleId = 5;
const offset = 1;

/* -------------------------
    Product Card (Design B)
    ------------------------- */
const ProductCardDesignB = ({ product, handleProductPreview, loading }) => {
  // Added loading prop
  const name =
    product?.name || product?.translations?.[0]?.value || "Unnamed Product";
  const price = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;
  const deliveryTime =
    product?.delivery_time ||
    `${product?.min_delivery_time || 10}-${
      product?.max_delivery_time || 30
    } min`;
  const rating =
    product?.avg_rating > 0 ? Number(product.avg_rating).toFixed(1) : "0";
  const restaurant = product?.store_name || "Unknown Store";

  const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;
  // const showDiscountBanner = discount > 0; // Not strictly needed

  // Wishlist hook for each card (hooks-safe)
  const { isWishlisted, addToWishlist, removeFromWishlist } =
    useWishlistHandler(product);

  return (
    <Paper
      elevation={0}
      onClick={() => !loading && handleProductPreview(product)} // Disable click when loading
      sx={{
        minWidth: CARD_WIDTH,
        maxWidth: 200,
        borderRadius: "12px !important",
        flexShrink: 0,
        mr: 2,
        border: "1px solid var(--border-default)",
        overflow: "hidden",
        backgroundColor: "var(--bg-card)",
        cursor: loading ? "default" : "pointer", // Change cursor when loading
        scrollSnapAlign: "start",
        position: "relative",
      }}
    >
      {loading ? (
        // SKELETON STATE FOR CARD
        <Box>
          {/* Discount Badge Skeleton */}
          <Skeleton
            variant="rectangular"
            width={45}
            height={44}
            sx={{
              position: "absolute",
              top: 0,
              left: 8,
              zIndex: 5,
              borderRadius: 0, // Reset border radius for clip path effect
              clipPath: `polygon(0 0, 100% 0, 100% 85%, 90% 100%, 80% 85%, 70% 100%, 60% 85%, 50% 100%, 40% 85%, 30% 100%, 20% 85%, 10% 100%, 0 85%)`,
            }}
          />

          {/* Image Skeleton */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={120}
            sx={{ pt: 1, mt: 2 }}
          />

          {/* Content Skeleton */}
          <Box sx={{ p: 1, pt: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 0.5,
              }}
            >
              <Skeleton variant="text" width="70%" height={24} />
              <Skeleton
                variant="rectangular"
                width={40}
                height={20}
                sx={{ borderRadius: 1 }}
              />
            </Box>
            <Skeleton variant="text" width="50%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Box>
        </Box>
      ) : (
        // ACTUAL CONTENT
        <>
          {/* UPDATED Discount Badge to show OFF below % */}
          {discount > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 8,
                backgroundColor: "var(--food-cta-green)",
                color: "var(--food-text-on-brand)",
                fontWeight: 700,
                fontSize: "0.6rem",
                padding: "6px 4px", // Adjusted padding for better fit
                width: "45px", // Slightly increased width
                minHeight: "44px", // Added minHeight to accommodate two lines
                textAlign: "center",
                display: "flex", // Added flex for stacking
                flexDirection: "column", // Stack items vertically
                alignItems: "center",
                justifyContent: "center", // Center text vertically
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
                boxShadow: "0 2px 6px var(--food-overlay-modal)",
                zIndex: 5,
              }}
            >
              <Typography
                variant="caption"
                sx={{ lineHeight: 1, fontWeight: 700, fontSize: "0.7rem" }}
              >
                {discount}%
              </Typography>
              <Typography
                variant="caption"
                sx={{ lineHeight: 1, fontWeight: 700, fontSize: "0.6rem" }}
              >
                OFF
              </Typography>
            </Box>
          )}

          {/* Image */}
          <Box
            sx={{
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pt: 1,
              mt: 2,
            }}
          >
            <img
              src={product?.image_full_url || "/default.png"}
              alt={name}
              title={name}
              style={{
                width: "300px",
                maxHeight: "131px",
                padding: "0px 12px ",
                objectFit: "cover",
                borderRadius: 8,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleProductPreview(product);
              }}
            />

            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 24,
                height: 24,
                borderRadius: "12px",
                //   backgroundColor: "var(--food-overlay-95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                //   border:"1px solid var(--border-image)",
                cursor: "pointer",
                zIndex: 5,
                transition: "all 0.2s ease",
                "&:hover": {
                  // backgroundColor: "var(--bg-card)",
                  transform: "scale(1.05)",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isWishlisted(product)) {
                  removeFromWishlist(product, e);
                } else {
                  addToWishlist(product, e);
                }
              }}
            >
              {isWishlisted(product) ? (
                <FavoriteIcon sx={{ color: "var(--danger)", fontSize: 20 }} />
              ) : (
                <FavoriteBorderIcon
                  sx={{ color: "var(--wishlist-inactive)", fontSize: 20 }}
                />
              )}
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: 1, pt: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 0.1,
                minHeight: "40px",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{
                  flexGrow: 1,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  marginRight: 1,
                }}
                title={name}
              >
                {name}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",

                  color: GREEN_COLOR,
                  borderRadius: 1,
                  px: 0.75,
                  py: 0.25,
                  flexShrink: 0,
                }}
              >
                <StarIcon sx={{ color: GREEN_COLOR, fontSize: 14, mr: 0.2 }} />
                <Typography variant="body2" fontWeight="bold">
                  {rating}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={0.5}>
              {restaurant}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <AccessTimeIcon
                sx={{ fontSize: 14, color: GREEN_COLOR, mr: 0.5 }}
              />
              <Typography variant="body2" color="text.secondary">
                {deliveryTime}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pb: 1,
              }}
            >
              <Box display="flex" alignItems="baseline" gap={0.6}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="text.primary"
                  lineHeight={1}
                  sx={{ fontSize: "1rem" }}
                >
                  ₹{Math.round(finalPrice)}
                </Typography>
                {discount > 0 && (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textDecoration: "line-through" }}
                  >
                    ₹{Math.round(price)}
                  </Typography>
                )}
              </Box>
              {/* NOTE: Add button intentionally removed per request */}
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

/* -------------------------
    Horizontal Slider Wrapper
    ------------------------- */
const ProductSliderDesignB = ({
  products = [],
  pageLimit = 6,
  handleProductPreview,
  loading,
}) => {
  // Added loading prop
  // Determine how many cards/skeletons to show
  const skeletonCount = pageLimit;

  // Create an array for mapping: actual products if loaded, or placeholder objects for skeletons
  const itemsToRender = loading
    ? Array.from({ length: skeletonCount })
    : products.slice(0, pageLimit);

  return (
    <Box
      sx={{
        borderRadius: 2,
        py: 3,
        px: 2,
        width: "100%",
        display: "flex",
        overflowX: "auto",
        whiteSpace: "nowrap",
        gap: 1.5,
        scrollSnapType: "x mandatory",

        // scrollbar
        "&::-webkit-scrollbar": {
          height: 8,
          cursor: "pointer", // optional (mostly works on thumb)
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "var(--food-border-lightgray)",
          borderRadius: 4,
          cursor: "pointer",
        },

        // ✅ hover effect
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "var(--text-strong)", // black on hover
          cursor: "pointer",
        },
      }}
    >
      {itemsToRender.map((p, i) => (
        <ProductCardDesignB
          key={loading ? `skeleton-${i}` : p?.id ?? i}
          product={p}
          handleProductPreview={handleProductPreview}
          loading={loading} // Pass loading state
        />
      ))}
      <Box sx={{ width: 8 }} />
    </Box>
  );
};

/* -------------------------
    API helpers
    ------------------------- */
const getData = async (pageParams) => {
  const { category_id } = pageParams;
  const { data } = await MainApi.get(
    `${categories_Childes_api}/${category_id}`,
  );
  return data;
};

const getLatLngFromStorage = () => {
  const currentLatLng = localStorage.getItem("currentLatLng");
  if (currentLatLng) {
    try {
      const parsedLatLng = JSON.parse(currentLatLng); // Parse the stored JSON string
      return {
        lat: parsedLatLng.lat,
        long: parsedLatLng.lng,
      };
    } catch (error) {
      // console.error('Error parsing lat/lng from localStorage:', error);
      return { lat: null, long: null }; // Return null if parsing fails
    }
  } else {
    // console.log('No lat/lng data found in localStorage.');
    return { lat: null, long: null }; // Return null if data is not found
  }
};
// MODIFIED: Accepts zoneIds as an argument
const getSubCategoryProducts = async (subcategoryId, limit, zones) => {
  const finalZones = Array.isArray(zones) && zones.length > 0 ? zones : ["0"];

  try {
    const { data } = await MainApi.get(
      `${categories_details_api}/list?category_ids=[${subcategoryId}]&limit=${limit}&offset=${offset}`,
      {
        headers: {
          moduleId: String(moduleId),
          zoneId: JSON.stringify(finalZones),
        },
      },
    );

    return data?.products || data?.data?.products || data?.data || [];
  } catch (err) {
    // console.error("❌ Error fetching products:", err);
    return [];
  }
};

/* -------------------------
    Main Component
    ------------------------- */
export default function FoodDynamicUI() {
  const { t } = useTranslation();
  const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [activeSub, setActiveSub] = useState({});
  const [products, setProducts] = useState({});

  // State for Zone IDs
  const [zoneIds, setZoneIds] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const dispatch = useDispatch();
  const addCartMutation = useAddCartItem();

  const [addingProductId, setAddingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const [pageLimit, setPageLimit] = useState(6);

  useEffect(() => {
    if (isXs) setPageLimit(2);
    else if (isSm) setPageLimit(3);
    else if (isMd) setPageLimit(4);
    else if (isLg) setPageLimit(6);
  }, [isXs, isSm, isMd, isLg]);

  // --------------------------- Fetch Zone-ID Logic ---------------------------
  const fetchZoneId = async () => {
    try {
      const storedLatLng = localStorage.getItem("currentLatLng");
      if (!storedLatLng) throw new Error("Location not selected");

      const { lat, lng } = JSON.parse(storedLatLng);
      if (!lat || !lng) throw new Error("Invalid lat/lng");

      const res = await MainApi.get(zoneId_api, { params: { lat, lng } });
      const data = res.data;

      const zones =
        data?.zone_ids ||
        data?.data?.zone_ids ||
        data?.zone_id ||
        data?.data?.zone_id;

      if (!zones) throw new Error("Zone not found");

      const zoneArray = Array.isArray(zones) ? zones : [zones];

      console.log("✅ Dynamic UI Zone API resolved IDs:", zoneArray);
      localStorage.setItem("zoneid", JSON.stringify(zoneArray));
      setZoneIds(zoneArray);
    } catch (err) {
      // console.error("❌ DYNAMIC UI ZONE FETCH FAILED:", err);
      // Fallback to default zones
      setZoneIds([15, 17]);
    } finally {
      setInitialLoadComplete(true);
    }
  };

  // Load zoneIds (cache first) on component mount
  useEffect(() => {
    const cached = localStorage.getItem("zoneid");
    if (cached) {
      // console.log("📦 Using cached zoneIds for Dynamic UI:", JSON.parse(cached));
      setZoneIds(JSON.parse(cached));
      setInitialLoadComplete(true);
    } else {
      // console.log("🚫 No cached zones for Dynamic UI → calling API...");
      fetchZoneId();
    }
  }, []);
  // --------------------------- End Zone-ID Logic ---------------------------

  // Fetch all categories (no filter) - depends on zoneIds being ready
  useEffect(() => {
    if (!initialLoadComplete) return;

    const fetchCategories = async () => {
      try {
        const { lat, long } = getLatLngFromStorage();

        // ✅ If zoneIds empty → use ["0"]
        const finalZoneIds =
          Array.isArray(zoneIds) && zoneIds.length > 0 ? zoneIds : ["0"];

        const res = await fetch(CATEGORIES_API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            moduleId: String(moduleId),
            zoneId: JSON.stringify(finalZoneIds),
            latitude: lat ?? 0,
            longitude: long ?? 0,
          },
        });

        const parsed = await res.json();
        const allCats = parsed?.data || parsed || [];
        const mainCats = Array.isArray(allCats)
          ? allCats.filter((c) => c.parent_id === 0)
          : [];

        setCategories(mainCats);
        mainCats.forEach((cat) => fetchSubcategories(cat.id));
      } catch (err) {
        // console.error("❌ Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, [zoneIds, initialLoadComplete, pageLimit]); // Dependency array updated

  const fetchSubcategories = async (categoryId) => {
    try {
      const data = await getData({ category_id: categoryId });
      const subcats = Array.isArray(data)
        ? data
        : data?.childes || data?.data?.childes || [];

      setSubCategories((prev) => ({ ...prev, [categoryId]: subcats }));

      if (subcats.length > 0) {
        const firstSub = subcats[0];
        setActiveSub((prev) => ({ ...prev, [categoryId]: firstSub.id }));
        // Pass zoneIds to getSubCategoryProducts
        const prodData = await getSubCategoryProducts(
          firstSub.id,
          pageLimit,
          zoneIds,
        );
        setProducts((prev) => ({ ...prev, [categoryId]: prodData }));
      }
    } catch (err) {
      // console.error("❌ Error fetching subcategories for", categoryId, err);
    }
  };

  const handleSubChange = async (categoryId, sub) => {
    setActiveSub((prev) => ({ ...prev, [categoryId]: sub.id }));
    // Pass zoneIds to getSubCategoryProducts
    const prodData = await getSubCategoryProducts(sub.id, pageLimit, zoneIds);
    setProducts((prev) => ({ ...prev, [categoryId]: prodData }));
  };

  // open modal for preview
  const handleProductPreview = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedProduct(null);
  };

  // Add to cart (used by modal)
  const handleAddToCart = (product) => {
    setAddingProductId(product?.id);
    const guestId = getGuestId();
    const itemData = getItemDataForAddToCart(
      product,
      1,
      product.price,
      guestId,
    );

    addCartMutation.mutate(itemData, {
      onSuccess: (res) => {
        setAddingProductId(null);
        if (res && res.length > 0) {
          dispatch(
            setCartList(
              res.map((item) => ({
                ...item.item,
                cartItemId: item.id,
                quantity: item.quantity,
                totalPrice: item.price,
                selectedOption: [],
              })),
            ),
          );
        }
        toast.success(`${product?.name} added to cart`);
      },
      onError: () => {
        setAddingProductId(null);
        toast.error("Failed to add to cart");
      },
    });
  };

  // Wishlist state & handlers for the product shown in modal
  const {
    isWishlisted: isSelectedProductWishlisted,
    addToWishlist: addSelectedProductToWishlist,
    removeFromWishlist: removeSelectedProductFromWishlist,
  } = useWishlistHandler(selectedProduct);

  // Simplified loading state for rendering skeletons
  // The main loading is when we haven't completed the zone check OR if categories list is empty after load
  const isMainLoading =
    !initialLoadComplete || (initialLoadComplete && categories.length === 0);

  // Render basic loading text if we're waiting for zone Ids
  if (!initialLoadComplete) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h5" color="text.secondary">
          Loading location data...
        </Typography>
      </Container>
    );
  }

  // Determine the array to iterate over for sections
  const categoriesToRender = isMainLoading
    ? Array.from({ length: 3 }) // Render 3 skeleton sections
    : categories;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Toaster position="top-center" reverseOrder={false} />

      {categoriesToRender.map((cat, catIndex) => {
        // Determine if this specific section (or the whole page) is loading
        const subcats = subCategories[cat?.id] || [];
        const activeId = activeSub[cat?.id];
        const isSectionLoading =
          isMainLoading || (cat && (!subcats || subcats.length === 0));

        return (
          <Box
            key={isMainLoading ? `section-skeleton-${catIndex}` : cat.id}
            mb={6}
          >
            {/* Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
              px={2}
            >
              {isSectionLoading ? (
                <Skeleton variant="text" width="40%" height={36} />
              ) : (
                <Typography
                  variant="h4"
                  fontWeight={600}
                  sx={{ fontSize: "1.5rem" }}
                >
                  {cat.name}
                </Typography>
              )}

              {/* <Button
                                variant="text"
                                size="small"
                                color="success"
                                endIcon={<ArrowForwardIcon />}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                                disabled={isSectionLoading}
                            >
                                {isSectionLoading ? <Skeleton variant="text" width={60} /> : "View All"}
                            </Button> */}
            </Box>

            {/* Subcategory Chips */}
            <Box
              sx={{
                display: "flex",
                marginLeft: 0,
                gap: 2,
                overflowX: "auto",
                flexWrap: "nowrap",
                pb: 1,
              }}
            >
              {isSectionLoading
                ? // Chip Skeletons
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      width={80}
                      height={32}
                      sx={{ borderRadius: 8, flexShrink: 0 }}
                    />
                  ))
                : // Actual Chips
                  subcats.map((sub) => (
                    <Chip
                      key={sub.id}
                      label={sub.name}
                      clickable
                      sx={{
                        flexShrink: 0,
                        fontWeight: 500,
                        backgroundColor: "var(--bg-card) !important",
                        color:
                          activeId === sub.id
                            ? GREEN_COLOR
                            : "var(--text-strong)",
                        border: "none",
                        height: "auto",
                        padding: 0,
                      }}
                      onClick={() => handleSubChange(cat.id, sub)}
                    />
                  ))}
            </Box>

            {/* Product Slider (Cards) */}
            <Box mt={1}>
              <ProductSliderDesignB
                products={products[cat?.id]}
                pageLimit={pageLimit}
                handleProductPreview={handleProductPreview}
                loading={isSectionLoading} // Pass loading prop to slider
              />
            </Box>
          </Box>
        );
      })}

      {/* Shared Product Modal (same as in Popular section) */}
      <ProductModal
        open={openModal}
        onClose={handleModalClose}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onBuyNow={(product) => {
          // Default buy now behavior: add to cart then (optionally) navigate from modal
          const guestId = getGuestId();
          const itemData = getItemDataForAddToCart(
            product,
            1,
            product.price,
            guestId,
          );

          addCartMutation.mutate(itemData, {
            onSuccess: (res) => {
              if (res && res.length > 0) {
                dispatch(
                  setCartList(
                    res.map((item) => ({
                      ...item.item,
                      cartItemId: item.id,
                      quantity: item.quantity,
                      totalPrice: item.price,
                      selectedOption: [],
                    })),
                  ),
                );
              }
              toast.success(`${product?.name} added to cart`);
            },
            onError: () => {
              toast.error("Failed to add to cart");
            },
          });
        }}
        isWishlisted={isSelectedProductWishlisted}
        addToWishlist={addSelectedProductToWishlist}
        removeFromWishlist={removeSelectedProductFromWishlist}
      />
    </Container>
  );
}
