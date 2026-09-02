import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Chip,
  Typography,
  Card,
  CardContent,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import MainApi from "../../../../api-manage/MainApi";
import {
  categories_Childes_api,
  categories_details_api,
} from "../../../../api-manage/ApiRoutes";
import {
  setIncrementToCartItem,
  setDecrementToCartItem,
  setRemoveItemFromCart,
  fetchCartFromApi,
  setCartList,
  addOptimisticCartItem,
  patchCartItemId,
  removeOptimisticCartItem,
} from "redux/slices/cart";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import useAddCartItem from "../../../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import useDeleteAllCartItem from "../../../../api-manage/hooks/react-query/add-cart/useDeleteAllCartItem";
import { getGuestId } from "helper-functions/getToken";
import { getItemDataForAddToCart } from "../../../product-details/product-details-section/helperFunction";
import { zoneId_api } from "../../../../api-manage/ApiRoutes";
import { getCorrectCart } from "helper-functions/getCorrectCart";
import Perticular from "./PerticularProduct";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";
import { useTranslation } from "react-i18next";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const CARD_WIDTH = 180;
const CARD_GAP = 15;

// ✅ Pure div skeleton - MUI theme se bilkul independent
const shimmerStyle = {
  background: "linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
};

const GrayBox = ({ width = "100%", height, borderRadius = "4px", mt = 0 }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      marginTop: mt,
      flexShrink: 0,
      ...shimmerStyle,
    }}
  />
);

const CardSkeleton = () => (
  <div
    style={{
      flexShrink: 0,
      width: CARD_WIDTH,
      height: 235,
      borderRadius: "8px",
      border: "1px solid #E3E8EE",
      backgroundColor: "#ffffff",
      padding: "8px",
      boxSizing: "border-box",
    }}
  >
    <GrayBox height={130} borderRadius="8px" />
    <GrayBox width="70%" height={18} mt={8} />
    <GrayBox width="40%" height={14} mt={4} />
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "8px",
      }}
    >
      <GrayBox width="40%" height={18} />
      <GrayBox width="45px" height={28} borderRadius="6px" />
    </div>
  </div>
);

const ChipSkeleton = () => (
  <div
    style={{
      flexShrink: 0,
      width: 70,
      height: 32,
      borderRadius: "8px",
      ...shimmerStyle,
    }}
  />
);

const TitleSkeleton = () => (
  <div
    style={{
      width: 120,
      height: 28,
      borderRadius: "4px",
      marginBottom: "12px",
      ...shimmerStyle,
    }}
  />
);

const getUserIdentifier = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? token : getGuestId();
};

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
    if (!zones) throw new Error("Zone not found");
    const zoneArray = Array.isArray(zones) ? zones : [zones];
    localStorage.setItem("zoneid", zoneArray);
    return zoneArray;
  } catch (error) {
    // console.error("fetchZoneId failed:", error);
    return [];
  }
};

const CATEGORIES_API_URL = "https://dealplex.in/api/v1/categories";
const moduleId = 2;
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
    } catch {
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
      `${categories_details_api}/list?category_ids=[${subcategoryId}]&limit=200&offset=${offset}`,
      {
        headers: {
          moduleId: String(moduleId),
          zoneId: JSON.stringify(finalZoneId),
          latitude: lat,
          longitude: long,
        },
      },
    );
    return data?.products || data?.data?.products || data?.data || [];
  } catch (err) {
    // console.error(`Product fetch error:`, err);
    return [];
  }
};

// ✅ Scroll row component
const ProductScrollRow = ({
  productList,
  isProductLoading,
  renderAddButton,
  handleProductPreview,
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [productList]);

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({
      left: -(CARD_WIDTH + CARD_GAP) * 2,
      behavior: "smooth",
    });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({
      left: (CARD_WIDTH + CARD_GAP) * 2,
      behavior: "smooth",
    });

  return (
    <Box sx={{ position: "relative" }}>
      {canScrollLeft && (
        <IconButton
          onClick={scrollLeft}
          sx={{
            position: "absolute",
            left: { xs: "2px", sm: "-18px" },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            width: "36px",
            height: "36px",
            "&:hover": { backgroundColor: "#f0f0f0" },
          }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: "16px" }} />
        </IconButton>
      )}
      {canScrollRight && (
        <IconButton
          onClick={scrollRight}
          sx={{
            position: "absolute",
            right: { xs: "2px", sm: "-18px" },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            width: "36px",
            height: "36px",
            "&:hover": { backgroundColor: "#f0f0f0" },
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: "16px" }} />
        </IconButton>
      )}

      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: `${CARD_GAP}px`,
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          pb: 1,
        }}
      >
        {isProductLoading
          ? [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
          : productList.map((p, i) => {
              const name =
                p.name || p?.translations?.[0]?.value || "Unnamed Product";
              const price = Number(p.price) || 0;
              const discount = Number(p.discount) || 0;
              const discountedPrice = price - (price * discount) / 100;
              const variation = p?.variations?.[0];
              const unitLabel = variation?.type;
              const unitType = p?.unit_type || p?.unit?.unit;
              const isNum = /^\d+(\.\d+)?$/.test(unitLabel || "");
              const outOfStock =
                p.stock === 0 || p.stock === null || p.in_stock === false;

              return (
                <Box key={p.id ?? i} sx={{ flexShrink: 0, width: CARD_WIDTH }}>
                  <Card
                    sx={{
                      width: CARD_WIDTH,
                      height: 238,
                      borderRadius: "8px !important ",
                      border: "1px solid #E3E8EE",
                      p: 1,
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                    }}
                    onClick={() => handleProductPreview(p)}
                  >
                    <CardContent sx={{ p: 0 }}>
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
                            borderRadius: "8px",
                            opacity: outOfStock ? 0.5 : 1,
                          }}
                        />
                      </Box>
                      <Typography
                        fontWeight={600}
                        noWrap
                        sx={{ fontSize: "0.75rem", mt: 1, color: "#000" }}
                      >
                        {name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        {unitLabel}
                        {isNum && unitType ? ` ${unitType}` : unitType}
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
                            sx={{ fontSize: "0.75rem", color: "#1A914B" }}
                          >
                            ₹
                            {discountedPrice % 1 === 0
                              ? Math.floor(discountedPrice)
                              : discountedPrice.toFixed(2)}
                          </Typography>
                          {discount > 0 && (
                            <Typography
                              sx={{
                                textDecoration: "line-through",
                                fontSize: "0.65rem",
                                color: "#000",
                              }}
                            >
                              ₹{price}
                            </Typography>
                          )}
                        </Box>
                        {renderAddButton(p)}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
      </Box>
    </Box>
  );
};

export default function GroceryDynamicUI() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [activeSub, setActiveSub] = useState({});
  const [products, setProducts] = useState({});
  const dispatch = useDispatch();
  const addCartMutation = useAddCartItem();
  const { mutateAsync: deleteAllCartItems } = useDeleteAllCartItem();
  const [addingProductId, setAddingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const cartList = useSelector((state) => getCorrectCart(state));
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [variationProduct, setVariationProduct] = useState(null);
  const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);

  // ✅ Store switch states
  const [storeSwitchOpen, setStoreSwitchOpen] = useState(false);
  const [storeSwitchProduct, setStoreSwitchProduct] = useState(null);
  const [storeSwitchVariant, setStoreSwitchVariant] = useState(null);
  const [storeSwitchLoading, setStoreSwitchLoading] = useState(false);

  const getUpdatedPrice = (item, qty) => {
    const isFood = getCurrentModuleType() === "food";
    const base = isFood
      ? item.price
      : item?.selectedOption?.[0]?.price ?? item.price;
    const discount = item.discount || 0;
    let finalPrice = base * qty;
    if (discount > 0) finalPrice = finalPrice - (finalPrice * discount) / 100;
    return finalPrice;
  };

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

  const getEffectiveStock = (product, selectedVar = null) => {
    const variationStock =
      selectedVar?.stock ?? product?.variations?.[0]?.stock;
    const productStock = product?.stock;
    if (variationStock != null && variationStock > 0) return variationStock;
    if (productStock != null && productStock > 0) return productStock;
    return 0;
  };

  // ✅ Store-conflict check — GrocerySession.js jaisa hi
  const checkStoreConflict = (product) => {
    const cartStoreId =
      cartList?.[0]?.product?.store_id ?? cartList?.[0]?.store_id ?? null;
    const newProductStoreId = product?.store_id ?? product?.store?.id ?? null; // ✅ fallback add kiya

    return (
      cartList?.length > 0 &&
      cartStoreId &&
      newProductStoreId &&
      String(cartStoreId) !== String(newProductStoreId)
    );
  };

  /* ================= ADD TO CART (OPTIMISTIC) ================= */
  const handleAddToCart = useCallback(
    (product, selectedVar = null, bypassStoreCheck = false) => {
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
        if (product.variations.length === 1)
          selectedVar = product.variations[0];
        else {
          setVariationProduct(product);
          setVariationModalOpen(true);
          return;
        }
      }

      // ✅ Stock check — variation first, then product, then maximum_cart_quantity
      const effectiveStock = getEffectiveStock(product, selectedVar);
      const cartLimit = product?.maximum_cart_quantity ?? Infinity;
      const maxQty = Math.min(effectiveStock, cartLimit);

      if (effectiveStock <= 0) {
        toast.error("This item is out of stock.");
        return;
      }

      const existingCartItem = getCartItemByProductId(product.id);
      const existingQty = existingCartItem?.quantity ?? 0;

      if (existingQty + 1 > maxQty) {
        toast.error(
          `Only ${maxQty} items allowed. You already have ${existingQty} in cart.`,
        );
        return;
      }

      // ✅ STORE VALIDATION — different store hone par confirmation dialog
      if (!bypassStoreCheck && checkStoreConflict(product)) {
        setStoreSwitchProduct(product);
        setStoreSwitchVariant(selectedVar);
        setStoreSwitchOpen(true);
        return;
      }

      const userId = getUserIdentifier();
      const finalPrice = selectedVar?.price ?? product.price;
      const variationArr = selectedVar ? [selectedVar] : [];
      const cartItemKey = `${product.id}-${JSON.stringify(variationArr)}`;
      const tempCartItemId = `temp-${Date.now()}`;

      // 🚀 STEP 1: OPTIMISTIC UI UPDATE — instant, no API wait
      dispatch(
        addOptimisticCartItem({
          cartItemKey,
          cartItemId: tempCartItemId,
          id: product.id,
          name: product.name,
          image_full_url: product.image_full_url || product.image,
          quantity: 1,
          price: finalPrice,
          totalPrice: finalPrice,
          variation: variationArr,
          selectedOption: variationArr,
          food_variations: variationArr,
          module_type: product.module_type,
          stock: product.stock,
          maximum_cart_quantity: product.maximum_cart_quantity,
          product,
        }),
      );

      toast.success(`${product.name} added to cart`);

      const payload = getItemDataForAddToCart(
        { ...product, selectedOption: variationArr },
        1,
        finalPrice,
        userId,
      );

      // 🚀 STEP 2: background API sync — UI already updated, no blocking
      addCartMutation.mutate(payload, {
        onSuccess: (response) => {
          if (response?.id) {
            dispatch(patchCartItemId({ cartItemKey, cartItemId: response.id }));
          }
        },
        onError: (err) => {
          // console.error("Add to cart failed:", err);
          dispatch(removeOptimisticCartItem({ cartItemKey })); // rollback
          toast.error("Item add nahi ho paya, dobara try karo");
        },
      });
    },
    [dispatch, addCartMutation, cartList],
  );

  // ✅ Store switch confirm — cart clear karke retry
  const handleStoreSwitchConfirm = async () => {
    try {
      setStoreSwitchLoading(true);
      const userId = getUserIdentifier();
      await deleteAllCartItems(userId);
      dispatch(setCartList([]));
      setStoreSwitchOpen(false);
      if (storeSwitchProduct) {
        handleAddToCart(storeSwitchProduct, storeSwitchVariant, true);
      }
    } catch (error) {
      // console.error("❌ Cart clear failed:", error);
      toast.error("Cart clear nahi hui. Please try again.");
    } finally {
      setStoreSwitchLoading(false);
      setStoreSwitchProduct(null);
      setStoreSwitchVariant(null);
    }
  };

  const handleStoreSwitchCancel = () => {
    setStoreSwitchOpen(false);
    setStoreSwitchProduct(null);
    setStoreSwitchVariant(null);
  };

  /* ================= INCREMENT (no blocking refetch) ================= */
  const handleIncrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();

      // ✅ variation first, then product stock, then maximum_cart_quantity
      const variationStock =
        cartItem?.variation?.[0]?.stock ?? cartItem?.selectedOption?.[0]?.stock;
      const productStock = cartItem?.product?.stock ?? cartItem?.stock;
      const effectiveStock =
        variationStock != null && variationStock > 0
          ? variationStock
          : productStock != null && productStock > 0
          ? productStock
          : 0;

      const cartLimit = cartItem?.maximum_cart_quantity ?? Infinity;
      const maxQty = Math.min(effectiveStock, cartLimit);

      if (effectiveStock <= 0) {
        toast.error("This item is out of stock.");
        return;
      }

      if (cartItem.quantity >= maxQty) {
        toast.error(`Only ${maxQty} items allowed.`, { id: "max-qty-toast" });
        return;
      }

      const newQty = cartItem.quantity + 1;

      dispatch(
        setIncrementToCartItem({
          ...cartItem,
          quantity: newQty,
          totalPrice: getUpdatedPrice(cartItem, newQty),
          userId,
        }),
      );
      // ✅ No fetchCartFromApi() here — reducer already syncs to backend
      // in the background, and local state is already updated instantly.
    },
    [dispatch],
  );

  /* ================= DECREMENT (no blocking refetch) ================= */
  const handleDecrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();
      const newQty = cartItem.quantity - 1;

      if (newQty <= 0) {
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

      dispatch(
        setDecrementToCartItem({
          ...cartItem,
          quantity: newQty,
          totalPrice: getUpdatedPrice(cartItem, newQty),
          userId,
        }),
      );
      // ✅ No fetchCartFromApi() here either — same reasoning as increment
    },
    [dispatch],
  );

  const getCartItemByProductId = (productId) =>
    cartList.find((item) => item.id === productId);

  const renderAddButton = (item) => {
    const cartItem = getCartItemByProductId(item.id);

    // ✅ Stock check — variation first, then product, then maximum_cart_quantity
    const selectedVar = item?.variations?.[0] ?? null;
    const variationStock = selectedVar?.stock;
    const productStock = item?.stock;
    const effectiveStock =
      variationStock != null && variationStock > 0
        ? variationStock
        : productStock != null && productStock > 0
        ? productStock
        : 0;

    const cartLimit = item?.maximum_cart_quantity ?? Infinity;
    const maxQty = Math.min(effectiveStock, cartLimit);
    const isOutOfStock = effectiveStock <= 0;
    const isMaxReached = cartItem ? cartItem.quantity >= maxQty : false;

    const buttonWidth = "70px";

    // ✅ Out of stock
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
            color: "#e53935 !important",
            border: "1.8px solid #e53935 !important",
            padding: "5px 0px",
            opacity: 0.7,
          }}
        >
          Out of Stock
        </Button>
      );
    }

    // ✅ Not in cart
    if (!cartItem) {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
          sx={{
            borderRadius: "8px",
            fontSize: "12px",
            width: buttonWidth,
            color: "#16A34A",
            border: "1.8px solid #16A34A",
            padding: "5px",
          }}
        >
          ADD
        </Button>
      );
    }

    // ✅ In cart — increment/decrement
    return (
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: buttonWidth,
          height: "32px",
          border: "1.8px solid #16A34A",
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
            backgroundColor: "#f1f1f1",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <Typography sx={{ fontSize: "14px", color: "#000" }}>−</Typography>
        </Box>

        <Typography fontWeight={600} sx={{ fontSize: "14px", color: "#000" }}>
          {cartItem.quantity}
        </Typography>

        {/* ✅ + button disable when max reached */}
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
            backgroundColor: isMaxReached ? "#e0e0e0" : "#f1f1f1",
            borderRadius: "4px",
            cursor: isMaxReached ? "not-allowed" : "pointer",
            opacity: isMaxReached ? 0.5 : 1,
          }}
        >
          <Typography
            sx={{ fontSize: "14px", color: isMaxReached ? "#aaa" : "#000" }}
          >
            +
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <>
      {/* ✅ Shimmer CSS - theme se independent */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <Container sx={{ py: 0, width: "100%", maxWidth: "1280px" }}>
        <Toaster position="top-center" reverseOrder={false} />

        {categories.length === 0
          ? // ✅ Pure div skeleton - no MUI, no theme issues
            [...Array(4)].map((_, i) => (
              <div key={i} style={{ marginBottom: "48px" }}>
                <TitleSkeleton />
                <div
                  style={{ display: "flex", gap: "12px", marginBottom: "12px" }}
                >
                  {[...Array(5)].map((_, j) => (
                    <ChipSkeleton key={j} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: `${CARD_GAP}px` }}>
                  {[...Array(6)].map((_, j) => (
                    <CardSkeleton key={j} />
                  ))}
                </div>
              </div>
            ))
          : categories.map((cat) => {
              const subcats = subCategories[cat.id] || [];
              const activeId = activeSub[cat.id];
              const productList = products[cat.id] || [];
              const isProductLoading = !products[cat.id];

              return (
                <Box key={cat.id} mb={6}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography
                      fontWeight={700}
                      sx={{ fontSize: "24px", color: "#000000" }}
                    >
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
                      mb: 1,
                    }}
                  >
                    {subcats.length === 0 ? (
                      <div style={{ display: "flex", gap: "12px" }}>
                        {[...Array(5)].map((_, i) => (
                          <ChipSkeleton key={i} />
                        ))}
                      </div>
                    ) : (
                      subcats.map((sub) => (
                        <Chip
                          key={sub.id}
                          label={sub.name
                            .split(" ")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                          clickable
                          onClick={() => handleSubChange(cat.id, sub)}
                          sx={{
                            flexShrink: 0,
                            fontWeight: activeId === sub.id ? 600 : 400,
                            backgroundColor:
                              activeId === sub.id
                                ? "#1A914B !important"
                                : "#ffffff !important",
                            color:
                              activeId === sub.id
                                ? "#ffffff !important"
                                : "#000000",
                            border: "1px solid #1A914B",
                            borderRadius: "8px",
                            "&:hover": {
                              backgroundColor:
                                activeId === sub.id
                                  ? "#1A914B"
                                  : "#f0faf4 !important",
                            },
                          }}
                        />
                      ))
                    )}
                  </Box>

                  <ProductScrollRow
                    productList={productList}
                    isProductLoading={isProductLoading}
                    renderAddButton={renderAddButton}
                    handleProductPreview={handleProductPreview}
                  />
                </Box>
              );
            })}

        {variationModalOpen && variationProduct && (
          <Dialog
            open={variationModalOpen}
            onClose={() => setVariationModalOpen(false)}
            fullWidth
            maxWidth="xs"
            sx={{
              width: "450px",
              margin: "auto",
              "& .MuiPaper-root": { borderRadius: "12px !important" },
            }}
          >
            <DialogContent
              dividers
              sx={{
                borderRadius: "12px !important",
                backgroundColor: "#FFFFFF",
                border: "1px solid #ccc6c6",
              }}
            >
              <DialogTitle sx={{ paddingTop: 0 }}>
                Select Variations
              </DialogTitle>
              {variationProduct?.variations?.map((variation, index) => {
                const originalPrice = variation.price;
                const discount = variationProduct.discount || 0;
                const discountedPrice =
                  discount > 0
                    ? Math.round(
                        originalPrice - (originalPrice * discount) / 100,
                      )
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
                      border: "1px dashed #e0e0e0",
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
                          {variation.type} {variationProduct.unit_type}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography fontWeight={600}>
                            ₹{discountedPrice}
                          </Typography>
                          {discount > 0 && (
                            <Typography
                              sx={{
                                textDecoration: "line-through",
                                color: "#9e9e9e",
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
                        color: "#1A914b",
                        fontWeight: 600,
                        px: 2,
                        borderColor: "#1A914b",
                        "&:hover": { borderColor: "#1A914b" },
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

        {/* ================= STORE SWITCH DIALOG ================= */}
        <Dialog
          open={storeSwitchOpen}
          onClose={handleStoreSwitchCancel}
          PaperProps={{
            sx: {
              borderRadius: { xs: "24px", sm: "28px" },
              padding: { xs: "8px", sm: "12px" },
              maxWidth: { xs: "92vw", sm: "420px" },
              width: "100%",
              mx: "auto",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pt: { xs: 2.5, sm: 3 },
              pb: 1,
              px: { xs: 2, sm: 3 },
            }}
          >
            <Box
              sx={{
                width: { xs: 52, sm: 60 },
                height: { xs: 52, sm: 60 },
                borderRadius: "50%",
                backgroundColor: "#fff7ed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                border: "2px solid #fed7aa",
              }}
            >
              <Typography sx={{ fontSize: { xs: 24, sm: 28 } }}>🛒</Typography>
            </Box>

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: "17px", sm: "19px" },
                color: "#111827",
                textAlign: "center",
                lineHeight: 1.3,
                mb: 0.5,
              }}
            >
              Switch Store?
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "12px", sm: "13px" },
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              Your cart has items from another store
            </Typography>
          </Box>

          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
            <Box
              sx={{
                backgroundColor: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: "12px",
                px: { xs: 1.8, sm: 2 },
                py: { xs: 1.5, sm: 1.8 },
                display: "flex",
                gap: 1.2,
                alignItems: "flex-start",
              }}
            >
              <Typography sx={{ fontSize: { xs: 15, sm: 17 }, mt: "1px" }}>
                ⚠️
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "12px", sm: "13px" },
                  color: "#92400e",
                  lineHeight: 1.6,
                }}
              >
                Adding this item will <strong>clear your current cart</strong>.
                All previously added items from the other store will be removed.
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 2,
                mb: 1.5,
                borderTop: "1px dashed #e5e7eb",
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: "13px", sm: "14px" },
                color: "#374151",
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              Do you want to clear the cart and add this item?
            </Typography>
          </DialogContent>

          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              pb: { xs: 2.5, sm: 3 },
              pt: 1,
              gap: { xs: 1, sm: 1.5 },
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              fullWidth
              onClick={handleStoreSwitchCancel}
              disabled={storeSwitchLoading}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "13px", sm: "14px" },
                py: { xs: 1.3, sm: 1.4 },
                border: "1.5px solid #e5e7eb",
                color: "#374151",
                backgroundColor: "#fff",
                order: { xs: 2, sm: 1 },
                "&:hover": {
                  backgroundColor: "#f9fafb",
                  borderColor: "#d1d5db",
                },
              }}
            >
              Keep Current Cart
            </Button>

            <Button
              fullWidth
              onClick={handleStoreSwitchConfirm}
              disabled={storeSwitchLoading}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: { xs: "13px", sm: "14px" },
                py: { xs: 1.3, sm: 1.4 },
                backgroundColor: "#16a34a",
                color: "#fff",
                order: { xs: 1, sm: 2 },
                boxShadow: "0 4px 14px rgba(22,163,74,0.25)",
                "&:hover": {
                  backgroundColor: "#15803d",
                  boxShadow: "0 4px 18px rgba(22,163,74,0.35)",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#86efac",
                  color: "#fff",
                },
              }}
            >
              {storeSwitchLoading ? "Clearing..." : "Yes, Clear"}
            </Button>
          </DialogActions>
        </Dialog>

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
    </>
  );
}
