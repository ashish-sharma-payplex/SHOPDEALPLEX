import { Box, Typography, Toolbar, Tabs, Tab, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton, IconButton } from '@mui/material';
import { useState, useEffect, useRef, useCallback } from 'react';
import MainApi from "../../../../../api-manage/MainApi";
import { common_condition_api, common_conditions_product_api } from "../../../../../api-manage/ApiRoutes";
import CustomImageContainer from "../../../../../components/CustomImageContainer";
import { useDispatch, useSelector } from "react-redux";
import { fetchCartFromApi, setIncrementToCartItem, setDecrementToCartItem, setRemoveItemFromCart, setCartList } from "redux/slices/cart";
import toast from "react-hot-toast";
import useAddCartItem from "../../../../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import useDeleteAllCartItem from "../../../../../api-manage/hooks/react-query/add-cart/useDeleteAllCartItem";
import { getGuestId } from "helper-functions/getToken";
import { getItemDataForAddToCart } from "../../../../product-details/product-details-section/helperFunction";
import { zoneId_api } from "../../../../../api-manage/ApiRoutes";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";
import { getCorrectCart } from "../../../../../helper-functions/getCorrectCart";

import Perticular from "../../Grocerysubcomponent/PerticularProduct";

import useWishlistHandler from 'components/home/search/pathflow/wishlisthandler';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useTranslation } from 'react-i18next';
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
      data?.zone_ids || data?.data?.zone_ids || data?.zone_id || data?.data?.zone_id;
    if (!zones) throw new Error("Zone not found");
    const zoneArray = Array.isArray(zones) ? zones : [zones];
    localStorage.setItem("zoneid", JSON.stringify(zoneArray));
    return zoneArray;
  } catch (err) {
    // console.error("fetchZoneId error:", err);
    return [];
  }
};

// ─── Stock helper (same as PharmacyPopular) ──────────────────────────────────
const getEffectiveStock = (product, selectedVar = null) => {
  const variationStock = selectedVar?.stock ?? product?.variations?.[0]?.stock;
  const productStock = product?.stock;
  if (variationStock != null && variationStock > 0) return variationStock;
  if (productStock != null && productStock > 0) return productStock;
  return 0;
};

const getUpdatedPrice = (item, qty) => {
  const base = item?.selectedOption?.[0]?.price ?? item.price;
  return base * qty;
};

// ─── Card size constants ──────────────────────────────────────────────────────
const CARD_WIDTH = 180;
const CARD_GAP = 16;


const getData = async (pageParams) => {
  const { conditionId, page_limit, offset } = pageParams;
  const { data } = await MainApi.get(
    `${common_conditions_product_api}/${conditionId}?limit=${page_limit}&offset=${offset}`
  );
  return data;
};

export default function CommonConditions1() {
  const { t } = useTranslation();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistHandler(t);
  const dispatch = useDispatch();
  const cartList = useSelector((state) => getCorrectCart(state));
  const addCartMutation = useAddCartItem();
  const { mutateAsync: deleteAllCartItems } = useDeleteAllCartItem();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [addingProductId, setAddingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [variationProduct, setVariationProduct] = useState(null);

  // ✅ Store switch states
  const [storeSwitchOpen, setStoreSwitchOpen] = useState(false);
  const [storeSwitchProduct, setStoreSwitchProduct] = useState(null);
  const [storeSwitchVariant, setStoreSwitchVariant] = useState(null);
  const [storeSwitchLoading, setStoreSwitchLoading] = useState(false);

  const scrollRef = useRef(null);
const [canScrollLeft, setCanScrollLeft]   = useState(false);
const [canScrollRight, setCanScrollRight] = useState(false);

  // ─── Cart helpers ─────────────────────────────────────────────────────────
  const getCartItemByProductId = (productId) =>
    cartList?.find((cartItem) => Number(cartItem?.id) === Number(productId));

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

  // ✅ Store-conflict check — GrocerySession.js jaisa hi
  const checkStoreConflict = (product) => {
    const cartStoreId =
      cartList?.[0]?.product?.store_id ?? cartList?.[0]?.store_id ?? null;
    const newProductStoreId = product?.store_id ?? product?.store?.id ?? null;
    return (
      cartList?.length > 0 &&
      cartStoreId &&
      newProductStoreId &&
      String(cartStoreId) !== String(newProductStoreId)
    );
  };

  // ─── Data fetch ───────────────────────────────────────────────────────────
  const getCategoriesData = async () => {
    try {
      const { data } = await MainApi.get(common_condition_api);
      if (data) {
        setCategories(data);
        if (data.length > 0) {
          const firstCategoryId = data[0]?.id || '';
          setSelectedCategory(firstCategoryId);
          const productData = await getData({
            conditionId: firstCategoryId,
            page_limit: 100,
            offset: 1,
          });
          setProducts(productData.products || []);
          setIsLoading(false);
        }
      }
    } catch (error) {
      // console.error('Error fetching categories:', error);
      setIsLoading(false);
      setError(error);
    }
  };

  useEffect(() => { getCategoriesData(); }, []);

  const handleCategoryChange = async (event, newCategory) => {
    setSelectedCategory(newCategory);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    try {
      const data = await getData({ conditionId: newCategory, page_limit: 100, offset: 1 });
      setProducts(data.products || []);
      setIsLoading(false);
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }
  };

  // ─── Add to Cart (with single-variation auto-add + stock check) ───────────
  const handleAddToCart = useCallback(
    (product, selectedVar = null, bypassStoreCheck = false) => {
      const zoneId = getValidZoneId();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        toast.error("Please log in to continue.");
        dispatch(setModalFor("sign-in"));
        dispatch(setSignInModalOpen(true));
        return;
      }

      if (!zoneId || (Array.isArray(zoneId) && zoneId.length === 1 && zoneId[0] === 0)) {
        toast.error("Service is not available in your current zone");
        return;
      }

      // ── Variation gate: if only 1 variation → auto-select, skip popup ──
      if (Array.isArray(product?.variations) && product.variations.length > 0 && !selectedVar) {
        if (product.variations.length === 1) {
          // Single variation: auto-add without popup
          selectedVar = product.variations[0];
        } else {
          // Multiple variations: open popup
          setVariationProduct(product);
          setVariationModalOpen(true);
          return;
        }
      }

      // ── Stock check ──
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
        toast.error(`Only ${maxQty} items allowed. You already have ${existingQty} in cart.`);
        return;
      }

      // ✅ STORE VALIDATION
      if (!bypassStoreCheck && checkStoreConflict(product)) {
        setStoreSwitchProduct(product);
        setStoreSwitchVariant(selectedVar);
        setStoreSwitchOpen(true);
        return;
      }

      setAddingProductId(product.id);
      const userId = getUserIdentifier();
      const finalPrice = selectedVar?.price ?? product.price;
      const payload = getItemDataForAddToCart(
        { ...product, selectedOption: selectedVar ? [selectedVar] : [] },
        1,
        finalPrice,
        userId
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
    [dispatch, addCartMutation, cartList]
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

  // ─── Increment / Decrement ────────────────────────────────────────────────
  const handleIncrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();
      const variationStock = cartItem?.variation?.[0]?.stock ?? cartItem?.selectedOption?.[0]?.stock;
      const productStock = cartItem?.product?.stock ?? cartItem?.stock;
      const effectiveStock =
        variationStock != null && variationStock > 0 ? variationStock :
          productStock != null && productStock > 0 ? productStock : 0;
      const cartLimit = cartItem?.maximum_cart_quantity ?? Infinity;
      const maxQty = Math.min(effectiveStock, cartLimit);

      if (effectiveStock <= 0) { toast.error("This item is out of stock."); return; }
      if (cartItem.quantity >= maxQty) {
        toast.error(`Only ${maxQty} items allowed.`, { id: "max-qty-toast" });
        return;
      }
      const newQty = cartItem.quantity + 1;
      dispatch(setIncrementToCartItem({ ...cartItem, quantity: newQty, totalPrice: getUpdatedPrice(cartItem, newQty), userId }));
      setTimeout(() => dispatch(fetchCartFromApi()), 300);
    },
    [dispatch]
  );

  const handleDecrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();
      const newQty = cartItem.quantity - 1;
      if (newQty <= 0) {
        dispatch(setRemoveItemFromCart({ cartItemKey: cartItem.cartItemKey, cartItemId: cartItem.cartItemId, userId }));
        toast.success(`${cartItem.name} removed from cart`);
        setTimeout(() => dispatch(fetchCartFromApi()), 300);
        return;
      }
      dispatch(setDecrementToCartItem({ ...cartItem, quantity: newQty, totalPrice: getUpdatedPrice(cartItem, newQty), userId }));
      setTimeout(() => dispatch(fetchCartFromApi()), 300);
    },
    [dispatch]
  );

  // ─── Product Preview ──────────────────────────────────────────────────────
  const handleProductPreview = (product) => { setSelectedProduct(product); setOpenModal(true); };
  const handleModalClose = () => { setOpenModal(false); setSelectedProduct(null); };

  // ─── Add/+/- Button (same design logic as PharmacyPopular) ───────────────
  const renderAddButton = (item) => {
    const cartItem = getCartItemByProductId(item.id);
    const selectedVar = item?.variations?.[0] ?? null;
    const effectiveStock = getEffectiveStock(item, selectedVar);
    const cartLimit = item?.maximum_cart_quantity ?? Infinity;
    const maxQty = Math.min(effectiveStock, cartLimit);
    const isOutOfStock = effectiveStock <= 0;
    const isMaxReached = cartItem ? cartItem.quantity >= maxQty : false;
    const buttonWidth = "70px";

    // Out of stock
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

    // Not in cart
    if (!cartItem) {
      return (
        <Button
          variant="outlined"
          size="small"
          disabled={addingProductId === item.id}
          onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
          sx={{
            borderRadius: "8px",
            fontSize: "12px",
            width: buttonWidth,
            color: "#16A34A",
            border: "1.8px solid #16A34A",
            padding: "5px",
          }}
        >
          {addingProductId === item.id ? "..." : "ADD"}
        </Button>
      );
    }

    // In cart — increment / decrement
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
          onClick={(e) => { e.stopPropagation(); handleDecrement(cartItem); }}
          sx={{
            width: "20px", height: "20px", display: "flex", alignItems: "center",
            justifyContent: "center", backgroundColor: "#f1f1f1", borderRadius: "4px", cursor: "pointer",
          }}
        >
          <Typography sx={{ fontSize: "14px", color: "#000000" }}>−</Typography>
        </Box>

        <Typography fontWeight={600} sx={{ fontSize: "14px", color: "#000000" }}>
          {cartItem.quantity}
        </Typography>

        <Box
          onClick={(e) => {
            e.stopPropagation();
            if (!isMaxReached) handleIncrement(cartItem);
            else toast.error(`Only ${maxQty} items allowed.`, { id: "max-qty" });
          }}
          sx={{
            width: "20px", height: "20px", display: "flex", alignItems: "center",
            justifyContent: "center",
            backgroundColor: isMaxReached ? "#e0e0e0" : "#f1f1f1",
            borderRadius: "4px",
            cursor: isMaxReached ? "not-allowed" : "pointer",
            opacity: isMaxReached ? 0.5 : 1,
          }}
        >
          <Typography sx={{ fontSize: "14px", color: isMaxReached ? "#aaa" : "#000000" }}>+</Typography>
        </Box>
      </Box>
    );
  };

  // ─── Product Card ─────────────────────────────────────────────────────────
  const renderProductCard = (product) => {
    const discountedPrice = product.price - (product.price * product.discount) / 100;
    const effectiveStock = getEffectiveStock(product);
    const outOfStock = effectiveStock <= 0;

    return (
      <Card
        sx={{
          minWidth: CARD_WIDTH,
          maxWidth: CARD_WIDTH,
          height: 240,
          borderRadius: "12px !important",
          background: "#fff",
          border: "1px solid #f0f0f0",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          position: "relative",
          transition: "0.3s",
          "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transform: "translateY(-3px)" },
        }}
        onClick={() => handleProductPreview(product)}
      >
        {/* Discount Tag */}
        {!outOfStock && product.discount > 0 && (
          <Box
            sx={{
              position: "absolute", top: 0, left: 8,
              backgroundColor: "#1A914B", color: "#fff", fontWeight: 700,
              fontSize: "0.55rem", padding: "4px 6px", width: "30px", textAlign: "center",
              clipPath: `polygon(0 0,100% 0,100% 85%,90% 100%,80% 85%,70% 100%,60% 85%,50% 100%,40% 85%,30% 100%,20% 85%,10% 100%,0 85%)`,
              zIndex: 10,
            }}
          >
            {product.discount}% OFF
          </Box>
        )}

        <CardContent sx={{ p: 0 }}>
          {/* IMAGE */}
          <Box sx={{
            width: "100%", height: 120, borderRadius: "10px", bgcolor: "#f8f8f8", mb: 1, overflow: "hidden",
            display: "flex", justifyContent: "center", alignItems: "center",
            opacity: outOfStock ? 0.4 : 1,
          }}>
            <CustomImageContainer
              src={product.image_full_url || product.image}
              alt={product.name}
              width="100%" height="100%" objectFit="contain"
            />
          </Box>

          {/* Wishlist Icon */}
          <Box
            sx={{
              position: "absolute", top: 12, right: 12, width: 24, height: 24,
              borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 5, transition: "all 0.2s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isWishlisted(product)) removeFromWishlist(product, e);
              else addToWishlist(product, e);
            }}
          >
            {isWishlisted(product) ? (
              <FavoriteIcon sx={{ color: "#E53935", fontSize: 20 }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: "#c4c2c2", fontSize: 20 }} />
            )}
          </Box>

          {/* PRODUCT NAME */}
          <Typography noWrap sx={{ fontWeight: 600, fontSize: "14px", mb: 0.5, textAlign: "left", color: "#333" }}>
            {product.name}
          </Typography>

          {/* UNIT */}
          <Typography variant="caption" sx={{ color: "#777", mb: 1, display: "block", textAlign: "left" }}>
            {product?.variations?.[0]?.type}{product?.unit?.unit}
          </Typography>

          {/* Price + Add Button (using renderAddButton for consistent logic) */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
            <Box>
              <Typography variant="body2" fontWeight="bold" sx={{ fontSize: "0.75rem", color: outOfStock ? "#999" : "#1A914B" }}>
                ₹{discountedPrice % 1 === 0 ? Math.floor(discountedPrice) : discountedPrice.toFixed(2)}
              </Typography>
              {product.discount > 0 && !outOfStock && (
                <Typography variant="body2" color="text.disabled" sx={{ textDecoration: "line-through", fontSize: "0.65rem", mt: "2px" }}>
                  ₹{product.price}
                </Typography>
              )}
            </Box>
            {renderAddButton(product)}
          </Box>
        </CardContent>
      </Card>
    );
  };

 

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
}, [products]); // products change होने पर re-check

const scrollLeft  = () =>
  scrollRef.current?.scrollBy({ left: -(CARD_WIDTH + CARD_GAP) * 2, behavior: "smooth" });
const scrollRight = () =>
  scrollRef.current?.scrollBy({ left:  (CARD_WIDTH + CARD_GAP) * 2, behavior: "smooth" });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ flexGrow: 1, padding: 2, width: "100%" }}>
      <Typography fontWeight={700} sx={{ fontSize: '24px' }}>
        Common Conditions
      </Typography>

      {/* Category Tabs */}
      <Box position="sticky" sx={{ boxShadow: 'none' }}>
        <Toolbar>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
            sx={{ width: '100%' }}
          >
            {categories.map((category) => (
              <Tab key={category.id} label={category.name} value={category.id} />
            ))}
          </Tabs>
        </Toolbar>
      </Box>

      {/* Product Cards Swiper */}
      {/* Product Cards */}
{isLoading ? (
  <Box sx={{ display: "flex", gap: `${CARD_GAP}px`, overflowX: "auto", pb: 1 }}>
    {[...Array(6)].map((_, i) => (
      <Card key={i} sx={{ flexShrink: 0, width: CARD_WIDTH, height: 240, borderRadius: "12px", border: "1px solid #f0f0f0", p: 1.5 }}>
        <Skeleton variant="rectangular" width="100%" height={120} animation="wave" sx={{ borderRadius: "10px" }} />
        <Skeleton width="80%" height={20} animation="wave" sx={{ mt: 1 }} />
        <Skeleton width="40%" height={15} animation="wave" />
      </Card>
    ))}
  </Box>
) : products.length === 0 ? (
  <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "200px", width: "100%" }}>
    <Box component="img" src="/nomedicine.png" alt="No Medicines Found" title="No Medicines Found"
      sx={{ width: "150px", height: "150px", objectFit: "contain", mb: 1 }} />
    <Typography sx={{ color: "#777", fontSize: "14px", fontWeight: 500 }}>
      No Medicines Found
    </Typography>
  </Box>
) : (
  <Box sx={{ position: "relative" }}>

    {/* ← Left Arrow */}
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

    {/* → Right Arrow */}
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

    {/* Scroll Container */}
    <Box
      ref={scrollRef}
      sx={{
        display: "flex",
        gap: `${CARD_GAP}px`,
        overflowX: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
        pb: 1,
        mt: "10px",
      }}
    >
      {products.map((product, index) => (
        <Box key={`${product.id}-${index}`} sx={{ flexShrink: 0 }}>
          {renderProductCard(product)}
        </Box>
      ))}
    </Box>
  </Box>
)}

      {/* Variation Modal (only opens when 2+ variations) */}
      {variationModalOpen && variationProduct && (
        <Dialog
          open={variationModalOpen}
          onClose={() => setVariationModalOpen(false)}
          fullWidth
          maxWidth="xs"
          sx={{
            width: "450px", margin: "auto",
            "& .MuiPaper-root": { borderRadius: "12px !important" },
          }}
        >
          <DialogContent dividers sx={{ borderRadius: "12px !important", backgroundColor: "#FFFFFF", border: "1px solid #ccc6c6" }}>
            <DialogTitle sx={{ paddingTop: 0 }}>Select Variations</DialogTitle>
            {variationProduct?.variations?.map((variation, index) => {
              const originalPrice = variation.price;
              const discount = variationProduct.discount || 0;
              const discountedPrice = discount > 0
                ? Math.round(originalPrice - (originalPrice * discount) / 100)
                : originalPrice;
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    mb: 1.5, p: 1, borderRadius: 1, border: "1px dashed #e0e0e0",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    {/* <Box component="img" src={variationProduct.image_full_url} alt={variation.type} title={variation.type}
                      sx={{ width: 48, height: 48, borderRadius: 1, objectFit: "cover" }}
                    /> */}
                    <Box>
                      <Typography fontWeight={600}>{variation.type} {variationProduct.unit_type}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={600}>₹{discountedPrice}</Typography>
                        {discount > 0 && (
                          <Typography sx={{ textDecoration: "line-through", color: "#9e9e9e", fontSize: "13px" }}>
                            ₹{originalPrice}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      color: "#1A914b", fontWeight: 600, px: 2,
                      borderColor: "#1A914b", "&:hover": { borderColor: "#1A914b" },
                    }}
                    onClick={() => { setVariationModalOpen(false); handleAddToCart(variationProduct, variation); }}
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

      {/* Product Preview Modal */}
      {selectedProduct && (
        <Perticular open={openModal} onClose={handleModalClose} product={selectedProduct} />
      )}
    </Box>
  );
}