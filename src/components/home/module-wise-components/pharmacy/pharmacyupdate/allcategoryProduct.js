import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Chip,
  Typography,
  Card,
  CardContent,
  Container,
  Button,
  useMediaQuery,
  useTheme,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import MainApi from "../../../../../api-manage/MainApi";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useTranslation } from "react-i18next";

import {
  categories_Childes_api,
  categories_details_api,
} from "../../../../../api-manage/ApiRoutes";
import {
  setIncrementToCartItem,
  setDecrementToCartItem,
  setCartList,
  setRemoveItemFromCart,
  fetchCartFromApi,
} from "redux/slices/cart";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import useAddCartItem from "../../../../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import { getGuestId } from "helper-functions/getToken";
import { getItemDataForAddToCart } from "../../../../product-details/product-details-section/helperFunction";
import { zoneId_api } from "../../../../../api-manage/ApiRoutes";
import { getCorrectCart } from "helper-functions/getCorrectCart";
import Perticular from "../../Grocerysubcomponent/PerticularProduct";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";

const CARD_WIDTH = 180;
const CARD_GAP = 15;

// New helper function to get the user identifier
const getUserIdentifier = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? token : getGuestId();
};

/* ------------------ FETCH ZONE ------------------ */
const fetchZoneId = async () => {
  try {
    const storedLatLng = localStorage.getItem("currentLatLng");
    if (!storedLatLng) throw new Error("Location not selected");

    const { lat, lng } = JSON.parse(storedLatLng);
    const res = await MainApi.get(zoneId_api, { params: { lat, lng } });
    const data = res.data;
    const zones =
      data?.zone_ids ||
      data?.data?.zone_ids ||
      data?.zone_id ||
      data?.data?.zone_id;

    if (!zones) throw new Error("Zone not found in API response");

    const zoneArray = Array.isArray(zones) ? zones : [zones];
    localStorage.setItem("zoneid", zoneArray);
    return zoneArray;
  } catch (error) {
    // console.error("fetchZoneId failed:", error);
    return [];
  }
};

const CATEGORIES_API_URL = "https://dealplex.in/api/v1/categories";
const moduleId = 3;
const offset = 1;

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
      const parsedLatLng = JSON.parse(currentLatLng);
      return { lat: parsedLatLng.lat, long: parsedLatLng.lng };
    } catch (error) {
      return { lat: null, long: null };
    }
  }
  return { lat: null, long: null };
};

const getSubCategoryProducts = async (subcategoryId) => {
  try {
    let zones = JSON.parse(localStorage.getItem("zoneid") || "[]");
    const zone = JSON.parse(localStorage.getItem("zoneid"));
    const { lat, long } = getLatLngFromStorage();
    const finalZoneId = zone ?? ["0"];

    if (!zones.length) zones = await fetchZoneId();

    const { data } = await MainApi.get(
      `${categories_details_api}/list?category_ids=[${subcategoryId}]&limit=1000&offset=${offset}`,
      {
        headers: {
          moduleId: String(moduleId),
          zoneId: JSON.stringify(finalZoneId),
          latitude: lat,
          longitude: long,
        },
      },
    );

    const productsData =
      data?.products || data?.data?.products || data?.data || [];

    return productsData;
  } catch (err) {
    // console.error(`Product fetch error for subcategory ${subcategoryId}:`, err);
    return [];
  }
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function PharmacyProductDynamicUI() {
  const { t } = useTranslation();
  const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [activeSub, setActiveSub] = useState({});
  const [products, setProducts] = useState({});

  const dispatch = useDispatch();
  const addCartMutation = useAddCartItem();
  const [addingProductId, setAddingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const cartList = useSelector((state) => getCorrectCart(state));

  // ─── Arrow scroll refs per category ───────────────────────────────────────────
  const scrollRefs = useRef({});
  const [scrollEdge, setScrollEdge] = useState({}); // { catId: { left: bool, right: bool } }

  const checkScrollEdge = useCallback((catId) => {
    const el = scrollRefs.current[catId];
    if (!el) return;
    setScrollEdge((prev) => ({
      ...prev,
      [catId]: {
        left: el.scrollLeft > 0,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      },
    }));
  }, []);

  // Re-check edges whenever products change
  useEffect(() => {
    Object.keys(products).forEach((catId) => checkScrollEdge(catId));
  }, [products, checkScrollEdge]);

  const handleScrollLeft = (catId) => {
    const el = scrollRefs.current[catId];
    if (el)
      el.scrollBy({ left: -(CARD_WIDTH + CARD_GAP) * 2, behavior: "smooth" });
  };

  const handleScrollRight = (catId) => {
    const el = scrollRefs.current[catId];
    if (el)
      el.scrollBy({ left: (CARD_WIDTH + CARD_GAP) * 2, behavior: "smooth" });
  };

  // ─── Stock helper ─────────────────────────────────────────────────────────────
  const getEffectiveStock = (product, selectedVar = null) => {
    const variationStock =
      selectedVar?.stock ?? product?.variations?.[0]?.stock;
    const productStock = product?.stock;
    if (variationStock != null && variationStock > 0) return variationStock;
    if (productStock != null && productStock > 0) return productStock;
    return 0;
  };

  const getUpdatedPrice = (item, qty) => {
    const isFood = getCurrentModuleType() === "food";
    const base = isFood
      ? item.price + getTotalVariationsPrice(item?.food_variations)
      : item?.selectedOption?.[0]?.price ?? item.price;
    return base * qty;
  };

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  /* ------------------ FETCH CATEGORIES ------------------ */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let zones = JSON.parse(localStorage.getItem("zoneid") || "[]");
        const zone = JSON.parse(localStorage.getItem("zoneid"));
        const { lat, long } = getLatLngFromStorage();
        const finalZoneId = zone ?? ["0"];

        if (!zones.length) zones = await fetchZoneId();

        const res = await fetch(CATEGORIES_API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            moduleId: String(moduleId),
            zoneId: JSON.stringify(finalZoneId),
            latitude: lat,
            longitude: long,
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
        // console.error("Category fetch error:", err);
      }
    };

    fetchCategories();
  }, []);

  /* ------------------ SUBCATEGORIES ------------------ */
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

        const prodData = await getSubCategoryProducts(firstSub.id);
        setProducts((prev) => ({ ...prev, [categoryId]: prodData }));
      }
    } catch (err) {
      // console.error("Subcategory fetch error:", err);
    }
  };

  const handleSubChange = async (categoryId, sub) => {
    setActiveSub((prev) => ({ ...prev, [categoryId]: sub.id }));
    const prodData = await getSubCategoryProducts(sub.id);
    setProducts((prev) => ({ ...prev, [categoryId]: prodData }));
  };

  const handleProductPreview = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedProduct(null);
  };

  const getValidZoneId = () => {
    try {
      const raw = localStorage.getItem("zoneid");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      const flat = parsed.flat();
      return flat.length > 0 ? flat : null;
    } catch {
      return null;
    }
  };

  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [variationProduct, setVariationProduct] = useState(null);

  /* ------------------ ADD TO CART ------------------ */
  const handleAddToCart = useCallback(
    (product, selectedVar = null) => {
      const zoneId = getValidZoneId();
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        toast.error("Please log in to continue.");
        dispatch(setModalFor("sign-in"));
        dispatch(setSignInModalOpen(true));
        return;
      }

      if (
        !zoneId ||
        (Array.isArray(zoneId) && zoneId.length === 1 && zoneId[0] === 0)
      ) {
        toast.error("Service is not available in your current zone");
        return;
      }

      if (
        Array.isArray(product?.variations) &&
        product.variations.length > 0 &&
        !selectedVar
      ) {
        if (product.variations.length === 1) {
          selectedVar = product.variations[0];
        } else {
          setVariationProduct(product);
          setVariationModalOpen(true);
          return;
        }
      }

      setAddingProductId(product.id);
      const userId = getUserIdentifier();
      const finalPrice = selectedVar?.price ?? product.price;
      const payload = getItemDataForAddToCart(
        { ...product, selectedOption: selectedVar ? [selectedVar] : [] },
        1,
        finalPrice,
        userId,
      );

      addCartMutation.mutate(payload, {
        onSuccess: () => {
          setAddingProductId(null);
          dispatch(fetchCartFromApi());
          toast.success(`${product.name} added to cart`);
        },
        onError: (err) => {
          // console.error("Add to cart failed:", err);
          setAddingProductId(null);
        },
      });
    },
    [dispatch, addCartMutation],
  );

  /* ================= INCREMENT ================= */
  const handleIncrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();
      const newQty = cartItem.quantity + 1;

      const maxQuantity =
        cartItem?.variation?.[0]?.stock ||
        cartItem?.maximum_cart_quantity ||
        cartItem?.stock ||
        cartItem?.product?.stock ||
        1;

      if (newQty > maxQuantity) {
        toast.error(`Cannot add more than ${maxQuantity} of this product.`);
        return;
      }

      const newTotal = getUpdatedPrice(cartItem, newQty);
      dispatch(
        setIncrementToCartItem({
          ...cartItem,
          quantity: newQty,
          totalPrice: newTotal,
          userId,
        }),
      );
    },
    [dispatch],
  );

  /* ================= DECREMENT ================= */
  const handleDecrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();
      const newQty = cartItem.quantity - 1;

      if (newQty === 0) {
        dispatch(
          setRemoveItemFromCart({
            cartItemKey: cartItem.cartItemKey,
            cartItemId: cartItem.cartItemId,
            userId,
          }),
        );
        toast.success(`${cartItem.name} removed from cart`);
        return;
      }

      const newTotal = getUpdatedPrice(cartItem, newQty);
      dispatch(
        setDecrementToCartItem({
          ...cartItem,
          quantity: newQty,
          totalPrice: newTotal,
          userId,
        }),
      );
    },
    [dispatch],
  );

  const getCartItemByProductId = (productId) =>
    cartList.find((item) => item.id === productId);

  const renderAddButton = (item) => {
    const cartItem = getCartItemByProductId(item.id);
    const selectedVar = item?.variations?.[0] ?? null;
    const effectiveStock = getEffectiveStock(item, selectedVar);
    const cartLimit = item?.maximum_cart_quantity ?? Infinity;
    const maxQty = Math.min(effectiveStock, cartLimit);
    const isOutOfStock = effectiveStock <= 0;
    const isMaxReached = cartItem ? cartItem.quantity >= maxQty : false;
    const buttonWidth = "70px";

    if (isOutOfStock) {
      return (
        <Button
          variant="outlined"
          size="small"
          disabled
          sx={{
            borderRadius: "8px",
            fontSize: "10px",
            width: buttonWidth,
            color: "var(--danger) !important",
            border: "1.8px solid var(--danger) !important",
            padding: "5px 0px",
            opacity: 0.7,
          }}
        >
          Out of Stock
        </Button>
      );
    }

    if (!cartItem) {
      return (
        <Button
          variant="outlined"
          size="small"
          disabled={addingProductId === item.id}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
          sx={{
            borderRadius: "8px",
            fontSize: "12px",
            width: buttonWidth,
            color: "var(--pharmacy-cta-green)",
            border: "1.8px solid var(--pharmacy-cta-green)",
            padding: "5px",
          }}
        >
          {addingProductId === item.id ? "..." : "ADD"}
        </Button>
      );
    }

    return (
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: buttonWidth,
          height: "32px",
          border: "1.8px solid var(--pharmacy-cta-green)",
          borderRadius: "6px",
        }}
      >
        <Box
          onClick={(e) => {
            e.stopPropagation();
            handleDecrement(cartItem);
          }}
          sx={{
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--qty-btn-bg)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <Typography sx={{ fontSize: "14px" }}>−</Typography>
        </Box>

        <Typography fontWeight={600} sx={{ fontSize: "14px" }}>
          {cartItem.quantity}
        </Typography>

        <Box
          onClick={(e) => {
            e.stopPropagation();
            if (!isMaxReached) handleIncrement(cartItem);
            else
              toast.error(`Only ${maxQty} items allowed.`, { id: "max-qty" });
          }}
          sx={{
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isMaxReached
              ? "var(--qty-btn-bg-disabled)"
              : "var(--qty-btn-bg)",
            borderRadius: "4px",
            cursor: isMaxReached ? "not-allowed" : "pointer",
            opacity: isMaxReached ? 0.5 : 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              color: isMaxReached
                ? "var(--text-disabled)"
                : "var(--text-strong)",
            }}
          >
            +
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Container sx={{ py: 0, width: "100%", maxWidth: "1280px" }}>
      <Toaster position="top-center" reverseOrder={false} />

      {/* ------------ CATEGORY SKELETON ------------ */}
      {categories.length === 0
        ? [...Array(4)].map((_, i) => (
            <Box key={i} mb={6}>
              <Skeleton variant="text" width={120} height={30} />
              <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 1 }}>
                {[...Array(5)].map((_, j) => (
                  <Skeleton
                    key={j}
                    variant="rounded"
                    width={70}
                    height={32}
                    sx={{ borderRadius: "16px" }}
                  />
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 1 }}>
                {[...Array(4)].map((_, j) => (
                  <Skeleton
                    key={j}
                    variant="rounded"
                    width={180}
                    height={230}
                    sx={{ borderRadius: "8px" }}
                  />
                ))}
              </Box>
            </Box>
          ))
        : categories.map((cat) => {
            const subcats = subCategories[cat.id] || [];
            const activeId = activeSub[cat.id];
            const productList = products[cat.id] || [];
            const isProductLoading = !products[cat.id];
            const edge = scrollEdge[cat.id] || { left: false, right: false };

            return (
              <Box key={cat.id} mb={6}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" fontWeight={700}>
                    {cat.name}
                  </Typography>
                </Box>

                {/* SUBCATEGORIES */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    overflowX: "auto",
                    flexWrap: "nowrap",
                    pb: 1,
                  }}
                >
                  {subcats.length === 0
                    ? [...Array(5)].map((_, i) => (
                        <Skeleton
                          key={i}
                          variant="rounded"
                          width={70}
                          height={32}
                          sx={{ borderRadius: "16px" }}
                        />
                      ))
                    : subcats.map((sub) => (
                        <Chip
                          key={sub.id}
                          label={sub.name}
                          clickable
                          color={activeId === sub.id ? "primary" : "default"}
                          onClick={() => handleSubChange(cat.id, sub)}
                          sx={{
                            flexShrink: 0,
                            fontWeight: activeId === sub.id ? 600 : 400,
                            backgroundColor:
                              activeId === sub.id
                                ? "var(--pharmacy-brand-green)"
                                : "transparent",
                            borderRadius: "8px",
                          }}
                        />
                      ))}
                </Box>

                {/* PRODUCTS */}
                {!isProductLoading && productList.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "180px",
                      width: "100%",
                    }}
                  >
                    <Box
                      component="img"
                      src="/nomedicine.png"
                      alt="No Medicines Found"
                      title="No Medicines Found"
                      sx={{
                        width: "130px",
                        height: "130px",
                        objectFit: "contain",
                        mb: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      No Medicines Found
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ position: "relative", mt: "10px" }}>
                    {/* LEFT ARROW */}
                    {edge.left && (
                      <IconButton
                        onClick={() => handleScrollLeft(cat.id)}
                        sx={{
                          position: "absolute",
                          left: { xs: "2px", sm: "-18px" },
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 20,
                          backgroundColor: "var(--bg-card)",
                          boxShadow: "0 2px 8px var(--shadow-review-color)",
                          width: "36px",
                          height: "36px",
                          "&:hover": { backgroundColor: "var(--bg-subtle)" },
                        }}
                      >
                        <ArrowBackIosNewIcon sx={{ fontSize: "16px" }} />
                      </IconButton>
                    )}

                    {/* RIGHT ARROW */}
                    {edge.right && (
                      <IconButton
                        onClick={() => handleScrollRight(cat.id)}
                        sx={{
                          position: "absolute",
                          right: { xs: "2px", sm: "-18px" },
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 20,
                          backgroundColor: "var(--bg-card)",
                          boxShadow: "0 2px 8px var(--shadow-review-color)",
                          width: "36px",
                          height: "36px",
                          "&:hover": { backgroundColor: "var(--bg-subtle)" },
                        }}
                      >
                        <ArrowForwardIosIcon sx={{ fontSize: "16px" }} />
                      </IconButton>
                    )}

                    {/* SCROLLABLE PRODUCT ROW */}
                    <Box
                      ref={(el) => {
                        scrollRefs.current[cat.id] = el;
                        if (el) {
                          el.onscroll = () => checkScrollEdge(cat.id);
                          // initial check after mount
                          setTimeout(() => checkScrollEdge(cat.id), 100);
                        }
                      }}
                      sx={{
                        display: "flex",
                        gap: `${CARD_GAP}px`,
                        overflowX: "auto",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                        pb: 1,
                      }}
                    >
                      {(isProductLoading ? [...Array(5)] : productList).map(
                        (p, i) => {
                          // ── Skeleton card ──
                          if (isProductLoading) {
                            return (
                              <Card
                                key={i}
                                sx={{
                                  flexShrink: 0,
                                  width: CARD_WIDTH,
                                  height: 230,
                                  borderRadius: "8px",
                                  border:
                                    "1px solid var(--pharmacy-card-outline)",
                                  p: 1,
                                }}
                              >
                                <Skeleton
                                  variant="rectangular"
                                  width="100%"
                                  height={130}
                                  animation="wave"
                                  sx={{ borderRadius: "8px" }}
                                />
                                <Skeleton
                                  width="80%"
                                  height={20}
                                  animation="wave"
                                  sx={{ mt: 1 }}
                                />
                                <Skeleton
                                  width="40%"
                                  height={15}
                                  animation="wave"
                                />
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  mt={1}
                                >
                                  <Skeleton
                                    width="40%"
                                    height={20}
                                    animation="wave"
                                  />
                                  <Skeleton
                                    variant="rectangular"
                                    width={50}
                                    height={28}
                                    animation="wave"
                                    sx={{ borderRadius: "6px" }}
                                  />
                                </Box>
                              </Card>
                            );
                          }

                          // ── Real card ──
                          const name =
                            p.name ||
                            p?.translations?.[0]?.value ||
                            "Unnamed Product";
                          const price = Number(p.price) || 0;
                          const discount = Number(p.discount) || 0;
                          const discountedPrice =
                            p.price - (p.price * p.discount) / 100;
                          const variation = p?.variations?.[0];
                          const unitLabel = variation?.type;
                          const unitType = p?.unit?.unit;
                          const outOfStock = getEffectiveStock(p) <= 0;

                          return (
                            <Card
                              key={p.id ?? i}
                              sx={{
                                flexShrink: 0,
                                width: CARD_WIDTH,
                                height: 230,
                                borderRadius: "8px",
                                border:
                                  "1px solid var(--pharmacy-card-outline)",
                                position: "relative",
                                cursor: "pointer",
                                borderRadius: "8px !important",
                              }}
                              onClick={() => handleProductPreview(p)}
                            >
                              {/* Discount tag */}
                              {!outOfStock && discount > 0 && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 8,
                                    background: "var(--pharmacy-brand-green)",
                                    color: "var(--text-on-brand)",
                                    fontWeight: 700,
                                    fontSize: "0.5rem",
                                    padding: "6px 8px",
                                    width: "30px",
                                    textAlign: "center",
                                    clipPath: `polygon(0 0,100% 0,100% 85%,90% 100%,80% 85%,70% 100%,60% 85%,50% 100%,40% 85%,30% 100%,20% 85%,10% 100%,0 85%)`,
                                    zIndex: 5,
                                  }}
                                >
                                  {discount}% OFF
                                </Box>
                              )}

                              <CardContent sx={{ p: 1.5 }}>
                                <Box
                                  height={130}
                                  display="flex"
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <img
                                    src={p.image_full_url || "/default.png"}
                                    alt={name}
                                    title={name}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      opacity: outOfStock ? 0.5 : 1,
                                    }}
                                  />
                                </Box>

                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  noWrap
                                  sx={{ fontSize: "0.75rem", mb: 0.5 }}
                                >
                                  {name}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.7rem" }}
                                >
                                  {unitLabel}
                                  {unitType}
                                </Typography>

                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  mt={0.5}
                                >
                                  <Box>
                                    <Typography
                                      fontWeight="bold"
                                      sx={{
                                        fontSize: "0.75rem",
                                        color: outOfStock
                                          ? "var(--text-muted)"
                                          : "var(--pharmacy-brand-green)",
                                      }}
                                    >
                                      ₹
                                      {discountedPrice % 1 === 0
                                        ? Math.floor(discountedPrice)
                                        : discountedPrice.toFixed(2)}
                                    </Typography>
                                    {discount > 0 && !outOfStock && (
                                      <Typography
                                        sx={{
                                          textDecoration: "line-through",
                                          fontSize: "0.65rem",
                                        }}
                                      >
                                        ₹{p.price}
                                      </Typography>
                                    )}
                                  </Box>
                                  {renderAddButton(p)}
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        },
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}

      {/* Variation Modal */}
      {variationModalOpen && variationProduct && (
        <Dialog
          open={variationModalOpen}
          onClose={() => setVariationModalOpen(false)}
          fullWidth
          maxWidth="xs"
          sx={{
            width: "450px",
            margin: "auto",
            height: "60vh",
            maxHeight: "60vh",
            "& .MuiPaper-root": { borderRadius: "12px !important" },
          }}
        >
          <DialogContent
            dividers
            sx={{
              borderRadius: "12px !important",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-variation)",
              overflowY: "auto",
              m: "4px",
            }}
          >
            <Typography sx={{ p: "8px 0px" }}>Select Variations</Typography>
            {variationProduct?.variations?.map((variation, index) => {
              const originalPrice = variation.price;
              const discount = variationProduct.discount || 0;
              const discountedPrice =
                discount > 0
                  ? Math.round(originalPrice - (originalPrice * discount) / 100)
                  : originalPrice;

              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                    p: 1,
                    borderRadius: 1,
                    border: "1px dashed var(--border-default)",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      component="img"
                      src={variationProduct.image_full_url}
                      alt={variation.type}
                      title={variation.type}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        objectFit: "cover",
                      }}
                    />
                    <Box>
                      <Typography fontWeight={600}>
                        {(() => {
                          const [qty, weight] = variation.type.split("-");
                          return `${qty} ${variationProduct.unit_type} (${weight})`;
                        })()}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={600}>
                          ₹{discountedPrice}
                        </Typography>
                        {discount > 0 && (
                          <Typography
                            sx={{
                              textDecoration: "line-through",
                              color: "var(--text-faint)",
                              fontSize: "13px",
                            }}
                          >
                            ₹{originalPrice}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    sx={{
                      color: "var(--pharmacy-brand-green)",
                      fontWeight: 600,
                      px: 2,
                      borderColor: "var(--pharmacy-brand-green)",
                      "&:hover": { borderColor: "var(--pharmacy-brand-green)" },
                    }}
                    size="small"
                    onClick={() => {
                      setVariationModalOpen(false);
                      handleAddToCart(variationProduct, variation);
                    }}
                  >
                    ADD
                  </Button>
                </Box>
              );
            })}
          </DialogContent>
        </Dialog>
      )}

      {selectedProduct && (
        <Perticular
          open={openModal}
          onClose={handleModalClose}
          product={selectedProduct}
          isWishlisted={false}
          addToWishlist={() => {}}
          removeFromWishlist={() => {}}
        />
      )}
    </Container>
  );
}
