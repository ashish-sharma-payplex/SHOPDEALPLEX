import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Grid, Alert } from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import MainApi from "../../../../api-manage/MainApi";
import { categories_details_api } from "../../../../api-manage/ApiRoutes";
import { useDispatch, useSelector } from "react-redux";
import useAddCartItem from "../../../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import useDeleteCartItem from "../../../../api-manage/hooks/react-query/add-cart/useDeleteCartItem";
import { setCartList } from "redux/slices/cart";
import { getGuestId } from "helper-functions/getToken";
import { getItemDataForAddToCart } from "../../../product-details/product-details-section/helperFunction";
import ProductCard from "./productcard";

import Perticular from "components/home/module-wise-components/Grocerysubcomponent/PerticularProduct";
import FoodPopup from "components/home/module-wise-components/food/foodUpdateComp/popUpFood";

/* ===== CONFIG ===== */
const PAGE_SIZE = 12; // ✅ fetched from the API in real pages now, not sliced client-side

/* ===== SKELETON ===== */
const ProductSkeleton = () => (
  <Box sx={{ borderRadius: "12px", overflow: "hidden" }}>
    <Box
      className="shimmer"
      sx={{ width: "100%", height: "140px", borderRadius: "10px", mb: 1 }}
    />
    <Box
      className="shimmer"
      sx={{ height: "12px", borderRadius: "6px", mb: 1 }}
    />
    <Box
      className="shimmer"
      sx={{ height: "10px", width: "60%", borderRadius: "6px" }}
    />
  </Box>
);

/* ===== SAFE ZONE IDS HELPER ===== */
// Handles: ["[15]"] → [15], ["15"] → [15], [15] → [15], "[15]" → [15]
const safeZoneIds = (zoneIds) => {
  if (!zoneIds || zoneIds.length === 0) return [0];

  const result = [];

  for (const z of zoneIds) {
    if (typeof z === "number" && !isNaN(z)) {
      result.push(z);
    } else if (typeof z === "string") {
      const trimmed = z.trim();
      // Agar "[15]" jaisi JSON string hai
      if (trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            parsed.forEach((n) => {
              const num = Number(n);
              if (!isNaN(num)) result.push(num);
            });
          }
        } catch {
          const num = Number(trimmed);
          if (!isNaN(num)) result.push(num);
        }
      } else {
        // Simple string number jaise "15"
        const num = Number(trimmed);
        if (!isNaN(num)) result.push(num);
      }
    }
  }

  return result.length > 0 ? result : [0];
};

/* ===== MAIN COMPONENT ===== */
const ProductGridDynamic = ({
  catid,
  subid,
  limit = PAGE_SIZE,
  module_id,
  zoneIds,
}) => {
  const [products, setProducts] = useState([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openFoodPopup, setOpenFoodPopup] = useState(false);
  const [openPerticularPopup, setOpenPerticularPopup] = useState(false);

  const loaderRef = useRef(null);
  const dispatch = useDispatch();
  const addCartMutation = useAddCartItem();
  const deleteCartMutation = useDeleteCartItem();
  const { cartList } = useSelector((state) => state.cart);

  // ✅ Har render pe safe zones calculate karo
  const resolvedZones = safeZoneIds(zoneIds);
  const moduleHeader = String(module_id);

  /* ===== PRODUCT CLICK HANDLER ===== */
  const handleProductClick = (product) => {
    const moduleType = product?.module?.module_type;
    setSelectedProduct(product);
    if (moduleType === "food") {
      setOpenFoodPopup(true);
    } else if (moduleType === "grocery" || moduleType === "pharmacy") {
      setOpenPerticularPopup(true);
    }
  };

  /* ===== RESET ON CATEGORY/SUBCATEGORY CHANGE ===== */
  useEffect(() => {
    setProducts([]);
    setNextOffset(0);
    setHasMore(true);
    setError(null);
  }, [catid, subid]);

  /* ===== CORE PAGED FETCH ===== */
  // ✅ Fetches ONE page at a time (category or subcategory) instead of the
  // old "get total_size then fetch everything in one giant call" pattern —
  // that double-call + huge single payload was the main cause of the 15-20s
  // delay on subcategory click.
  const fetchProductPage = async (offset) => {
    const zones = safeZoneIds(zoneIds);
    const zoneStr = JSON.stringify(zones);
    const targetId = subid && subid !== "all" ? subid : catid;

    try {
      const { data } = await MainApi.get(
        `${categories_details_api}/list?category_ids=[${targetId}]&limit=${PAGE_SIZE}&offset=${offset}`,
        {
          headers: {
            moduleId: moduleHeader,
            zoneId: zoneStr,
          },
        },
      );

      const pageProducts = data?.products || data?.data?.products || data?.data || [];
      const totalSize = data?.total_size ?? data?.data?.total_size ?? null;

      return { pageProducts, totalSize };
    } catch (err) {
      // console.error("Error fetching product page:", err);
      return { pageProducts: [], totalSize: null };
    }
  };

  /* ===== FETCH: DEFAULT PRODUCTS (no catid/subid resolvable, fallback flow) ===== */
  const fetchDefaultProducts = async () => {
    const zones = safeZoneIds(zoneIds);
    const zoneStr = JSON.stringify(zones);

    try {
      setLoading(true);
      setError(null);

      const { data: firstRes } = await MainApi.get(
        `https://dealplex.in/api/v1/categories/getall/items?limit=1&offset=0`,
        {
          headers: {
            moduleId: moduleHeader,
            zoneId: zoneStr,
          },
        },
      );

      const total = firstRes?.total_size || firstRes?.data?.total_size || 100;

      const { data } = await MainApi.get(
        `https://dealplex.in/api/v1/categories/getall/items?limit=${total}&offset=0`,
        {
          headers: {
            moduleId: moduleHeader,
            zoneId: zoneStr,
          },
        },
      );

      const allProducts = data?.products || [];
      const filteredProducts = allProducts.filter((product) =>
        product.category_ids?.some((category) => category.id === catid),
      );

      if (filteredProducts.length === 0) {
        setError("No products found.");
      } else {
        setProducts(filteredProducts);
        setHasMore(false); // this fallback path already loads everything
      }
    } catch (err) {
      // console.error("fetchDefaultProducts error:", err);
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  /* ===== INITIAL LOAD (first page only) ===== */
  const loadFirstPage = async () => {
    const zones = safeZoneIds(zoneIds);

    if (!subid && zones[0] === 0) {
      fetchDefaultProducts();
      return;
    }

    setLoading(true);
    setError(null);

    const { pageProducts, totalSize } = await fetchProductPage(0);

    if (pageProducts.length === 0) {
      setError("No products found.");
      setHasMore(false);
    } else {
      setProducts(pageProducts);
      setNextOffset(pageProducts.length);
      setHasMore(
        totalSize != null
          ? pageProducts.length < totalSize
          : pageProducts.length === PAGE_SIZE,
      );
    }

    setLoading(false);
  };

  /* ===== TRIGGER FETCH ON DEPS CHANGE ===== */
  useEffect(() => {
    if (!zoneIds || zoneIds.length === 0) return;
    if (!catid) return;

    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subid, zoneIds, catid, module_id]);

  /* ===== INFINITE SCROLL — fetches the NEXT page from the API ===== */
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;

    setLoadingMore(true);
    const { pageProducts, totalSize } = await fetchProductPage(nextOffset);

    setProducts((prev) => [...prev, ...pageProducts]);
    setNextOffset((prev) => prev + pageProducts.length);

    if (pageProducts.length === 0) {
      setHasMore(false);
    } else if (totalSize != null) {
      setHasMore(nextOffset + pageProducts.length < totalSize);
    } else {
      setHasMore(pageProducts.length === PAGE_SIZE);
    }

    setLoadingMore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, loading, hasMore, nextOffset, catid, subid, zoneIds, module_id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreProducts();
      },
      { rootMargin: "200px" },
    );
    const node = loaderRef.current;
    if (node) observer.observe(node);
    return () => node && observer.unobserve(node);
  }, [loadMoreProducts]);

  /* ===== CART HANDLER ===== */
  const handleAddToCart = (product) => {
    const isFoodModule = product.module_id === 5;

    if (isFoodModule && product.quantity > product.maximum_cart_quantity) {
      toast.error(
        `You can only add up to ${product.maximum_cart_quantity} ${product.name}(s)`,
      );
      return;
    }

    if (!isFoodModule && (product.stock === 0 || product.in_stock === false)) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    const guestId = getGuestId();
    const itemData = getItemDataForAddToCart(
      product,
      product.quantity || 1,
      product.price,
      guestId,
    );

    const existingIndex = cartList.findIndex((p) => p.id === product.id);
    const updatedCart = [...cartList];

    if (existingIndex !== -1) {
      const current = updatedCart[existingIndex];
      const newQty = product.quantity || current.quantity;

      if (newQty <= 0) {
        updatedCart.splice(existingIndex, 1);
        dispatch(setCartList([...updatedCart]));
        return;
      }

      updatedCart[existingIndex] = {
        ...current,
        quantity: newQty,
        totalPrice: (product.price || current.price) * newQty,
      };
      dispatch(setCartList(updatedCart));
      return;
    }

    setAddingProductId(product.id);
    addCartMutation.mutate(itemData, {
      onSuccess: (res) => {
        setAddingProductId(null);
        dispatch(setCartList(res));
        toast.success(`${product.name} added to cart`);
      },
      onError: () => {
        setAddingProductId(null);
        toast.error("Failed to add to cart");
      },
    });
  };

  /* ===== RENDER ===== */
  return (
    <Box
      sx={{
        px: { xs: 1, sm: 4 },
        py: { xs: 2, sm: 4 },
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <Toaster />

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} lg={2.4} key={i}>
              <ProductSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid item key={product.id} xs={6} sm={4} md={3} lg={2.4}>
                <ProductCard
                  product={product}
                  onClick={() => handleProductClick(product)}
                  handleProductClick={handleProductClick}
                />
              </Grid>
            ))}
          </Grid>

          <Box ref={loaderRef} sx={{ mt: 2 }}>
            {loadingMore && (
              <Grid container spacing={2}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Grid item xs={6} sm={4} md={3} lg={2.4} key={i}>
                    <ProductSkeleton />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {!loadingMore && !hasMore && products.length > 0 && (
            <Box
              sx={{
                textAlign: "center",
                mt: 3,
                mb: 2,
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              — All products loaded —
            </Box>
          )}
        </>
      )}

      {selectedProduct && (
        <FoodPopup
          open={openFoodPopup}
          onClose={() => {
            setOpenFoodPopup(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      {selectedProduct && (
        <Perticular
          open={openPerticularPopup}
          onClose={() => {
            setOpenPerticularPopup(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </Box>
  );
};

export default ProductGridDynamic;