"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Card,
  CardMedia,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Stack,
  Collapse,
  Divider,
  Pagination,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Skeleton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import TuneIcon from "@mui/icons-material/Tune";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import ShareIcon from "@mui/icons-material/Share";
import SocialShareModal from "../../../src/components/SocialMediaShare";

import {
  setCart,
  setCartItemQuantity,
  setBuyNowItemList,
} from "../../../src/redux/slices/cart";

import ProductModal from "../../../src/components/home/module-wise-components/food/foodUpdateComp/popUpFood";
import ProductCard from "../../../src/components/home/module-wise-components/food/foodUpdateComp/restocard";
import useWishlistHandler from "../../../src/components/home/search/pathflow/wishlisthandler";
import useStoreWishlistHandler from "../../../src/components/home/search/pathflow/storewishlisthandler";

import { useTranslation } from "react-i18next";

export default function RestorentComponent({
  restaurant,
  categories: initialCategories,
  onBack,
}) {
  if (!restaurant) return null;

  const { t } = useTranslation();
  const { addStoreToWishlist, removeStoreFromWishlist, isStoreWishlisted } =
    useStoreWishlistHandler(t);

  const dispatch = useDispatch();
  const { cartList } = useSelector((state) => state.cart);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [categories, setCategories] = useState(initialCategories || null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleShareClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (!categories || categories.length === 0) return;

    const firstParent = categories.find(
      (c) => c.parent_id === 0 && c.childes && c.childes.length > 0,
    );

    if (!firstParent) return;

    const firstSub = firstParent.childes[0];
    if (firstSub) {
      setSelectedSubId(firstSub.id);
      handleSubClick(firstSub);
      setExpanded((prev) => ({ ...prev, [firstParent.id]: true }));
      initialized.current = true;
    }
  }, [categories]);

  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [vegFilter, setVegFilter] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const filter = searchParams.get("filter") || "all";

  const [page, setPage] = useState(1);
  const itemsPerRow = 4;
  const rowsPerPage = 2;
  const itemsPerPage = itemsPerRow * rowsPerPage;

  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, page, itemsPerPage]);

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
  const ProductCardSkeleton = () => (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        p: 1,
      }}
    >
      {/* Image skeleton */}
      <Skeleton
        variant="rectangular"
        height={110}
        sx={{ borderRadius: "8px" }}
      />

      {/* Text skeletons */}
      <Skeleton height={18} sx={{ mt: 1 }} />
      <Skeleton height={14} width="60%" />
    </Box>
  );

  useEffect(() => {
    if (initialCategories) return;

    const fetchCategories = async () => {
      try {
        const zone = JSON.parse(localStorage.getItem("zoneid"));
        // console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO ", zone);

        const { lat, long } = getLatLngFromStorage();
        // console.log("Latitude and Longitude: ", lat, long);
        const finalZoneId = zone ?? ["0"];
        // console.log("finalZone id $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ", finalZoneId);

        const res = await fetch("https://dealplex.in/api/v1/categories", {
          method: "GET",
          headers: {
            moduleId: "5",
            zoneId: JSON.stringify(finalZoneId),
            latitude: lat,
            longitude: long,
          },
        });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data?.categories || []);
      } catch (err) {
        // console.error("Category fetch failed:", err);
      }
    };

    fetchCategories();
  }, [initialCategories]);

  const toggleCategory = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const restoCatIds = useMemo(() => {
    return new Set((restaurant.category_ids || []).map(Number));
  }, [restaurant]);

  const parentsToRender = useMemo(() => {
    if (!categories) return [];
    return categories.filter((parent) => parent?.parent_id === 0);
  }, [categories]);

  useEffect(() => {
    if (!products) return;

    let temp = [...products];

    if (searchQuery.trim() !== "") {
      const lower = searchQuery.toLowerCase();
      temp = temp.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const desc = (p.description || p.meta_description || "").toLowerCase();
        return name.includes(lower) || desc.includes(lower);
      });
    }

    if (vegFilter === "veg") {
      temp = temp.filter((p) => p.veg === 1);
    } else if (vegFilter === "nonveg") {
      temp = temp.filter((p) => p.veg === 0);
    }

    setFilteredProducts(temp);
    setPage(1);
  }, [products, searchQuery, vegFilter]);

  // -------------------- fetch products for a subcategory --------------------
  const handleSubClick = async (sub) => {
    setSelectedSubId(sub.id);
    setLoading(true);
    setPage(1);
    setSearchQuery("");
    try {
      const zone = JSON.parse(localStorage.getItem("zoneid"));
      // console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO ", zone);

      const { lat, long } = getLatLngFromStorage();
      // console.log("Latitude and Longitude: ", lat, long);
      const finalZoneId = zone ?? ["0"];
      // console.log("finalZone id $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ", finalZoneId);

      const res = await fetch(
        `https://dealplex.in/api/v1/categories/items/list?category_ids=[${sub.id}]&limit=200&offset=1`,
        {
          method: "GET",
          headers: {
            moduleId: "5",
            zoneId: JSON.stringify(finalZoneId),
            latitude: lat,
            longitude: long,
          },
        },
      );

      const data = await res.json();
      if (Array.isArray(data.products)) {
        const filtered = data.products.filter(
          (p) => p.store_name === restaurant.name,
        );
        setProducts(filtered);
        setFilteredProducts(filtered);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      // console.error("Product fetch failed:", err);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Right search: filter products --------------------
  const handleRightSearchChange = (e) => {
    const q = e.target.value || "";
    setSearchQuery(q);
    const lower = q.toLowerCase();

    if (lower.trim() === "") {
      setFilteredProducts(products);
      setPage(1);
      return;
    }

    const filtered = products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || p.meta_description || "").toLowerCase();
      return name.includes(lower) || desc.includes(lower);
    });

    setFilteredProducts(filtered);
    setPage(1);
  };

  const handleAddToCart = (product) => {
    const exist = cartList.find((p) => p.id === product.id);
    if (exist) {
      dispatch(
        setCartItemQuantity({ id: product.id, quantity: exist.quantity + 1 }),
      );
      toast.success("Quantity updated");
    } else {
      dispatch(setCart({ ...product, quantity: 1 }));
      toast.success("Added to cart");
    }
  };

  const [mobileStep, setMobileStep] = useState("category");
  const [mobileCategory, setMobileCategory] = useState(null);
  const [mobileSubCategory, setMobileSubCategory] = useState(null);

  const handleMobileCategoryClick = (cat) => {
    setMobileCategory(cat);

    if (cat.childes && cat.childes.length > 0) {
      const firstSub = cat.childes[0];

      setSelectedSubId(firstSub.id);
      handleSubClick(firstSub);
    }

    setMobileStep("products");
  };

  const handleBuyNow = (product) => {
    dispatch(setBuyNowItemList({ ...product, quantity: 1 }));
    router.push("/checkout?page=buy_now");
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };
  return (
    <Box sx={{ mt: isMobile ? 0 : 0, px: { xs: 2, md: 6 } }}>
      {/* BACK BUTTON */}
      {/* <IconButton onClick={() => router.push("/restaurant?view=all")}>
        <ArrowBackIcon />
      </IconButton> */}

      {/* ---------------- MOBILE VIEW ---------------- */}
      {isMobile ? (
        <>
          {/* RESTAURANT HERO (MOBILE) */}
          <Box
            sx={{
              border: "1px solid #eee",
              borderRadius: "12px",
              overflow: "hidden",
              pt: 0,
              mt: 0,
              bgcolor: "white",
            }}
          >
            <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={() => {
                  router.push("/restaurant?view=all");
                }}
                sx={{
                  background: "#f3f3f3",
                  height: 22,
                  width: 44,
                  borderRadius: "12px",
                }}
              >
                <ArrowBackIcon />
              </IconButton>

              <Typography sx={{ ml: 1, fontWeight: 600 }}>
                Back to Restaurants
              </Typography>
            </Box>
            <Box
              sx={{
                border: "1px solid #eeeeeea8",
                borderRadius: "12px",
                overflow: "hidden",
                // bgcolor: "white",
              }}
            >
              {/* TOP INFO */}
              <Box sx={{ p: 0 }}>
                {/* LOGO + NAME */}
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Avatar
                    src={restaurant.logo_full_url}
                    sx={{ width: 56, height: 56 }}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={800} noWrap>
                      {restaurant.name}
                    </Typography>

                    <Chip
                      label={restaurant.open ? "Open now" : "Closed"}
                      color={restaurant.open ? "success" : "error"}
                      size="small"
                      sx={{ mt: 0.3 }}
                    />
                  </Box>

                  {/* WISHLIST */}
                  {/* <IconButton
                    onClick={handleWishlistClick}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.9)",
                      border: "1px solid #ddd",
                    }}
                  >
                    {isWishlisted ? (
                      <FavoriteIcon sx={{ color: "red" }} />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton> */}
                </Box>

                {/* DESCRIPTION */}
                {restaurant.meta_description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {restaurant.meta_description}
                  </Typography>
                )}

                {/* ADDRESS */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => {
                    const query = encodeURIComponent(restaurant.address);
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${query}`,
                      "_blank",
                    );
                  }}
                >
                  {restaurant.address?.length > 50
                    ? restaurant.address.slice(0, 50) + "..."
                    : restaurant.address}
                </Typography>

                {/* DELIVERY + RATING */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    ⏱ {restaurant.delivery_time}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <StarIcon sx={{ color: "#00b15e", fontSize: 18 }} />
                    <Typography variant="body2">
                      {Number(restaurant?.avg_rating || 0).toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({restaurant.reviews_comments_count})
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* COVER IMAGE */}
              <CardMedia
                component="img"
                height="180"
                image={restaurant.cover_photo_full_url}
                alt={restaurant.name || "Restaurant Image"}
                title={restaurant.name || "Restaurant Image"}
                sx={{ objectFit: "cover" }}
              />
            </Box>
          </Box>

          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              component="button"
              underline="hover"
              onClick={() => {
                setMobileStep("category");
                setMobileCategory(null);
                setMobileSubCategory(null);
              }}
            >
              Home
            </Link>

            {mobileCategory && (
              <Link
                component="button"
                underline="hover"
                onClick={() => setMobileStep("subcategory")}
              >
                {mobileCategory.name}
              </Link>
            )}

            {mobileSubCategory && (
              <Typography>{mobileSubCategory.name}</Typography>
            )}
          </Breadcrumbs>

          {/* CATEGORY GRID */}
          {mobileStep === "category" && (
            <Grid container spacing={2}>
              {parentsToRender.map((c) => (
                <Grid item xs={4} key={c.id}>
                  <Box
                    textAlign="center"
                    onClick={() => handleMobileCategoryClick(c)}
                  >
                    <Avatar
                      src={c.image_full_url}
                      sx={{ mx: "auto", mb: 1, bgcolor: "white" }}
                    />
                    <Typography variant="body2">{c.name}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          {/* SUBCATEGORY + PRODUCTS */}
          {mobileStep === "products" && mobileCategory && (
            <>
              {/* SUBCATEGORY SCROLL */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  pb: 1,
                  mb: 2,
                  bgcolor: "#fff",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {mobileCategory.childes?.map((sub) => (
                  <Box
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubId(sub.id);
                      handleSubClick(sub);
                    }}
                    sx={{
                      minWidth: 90,
                      textAlign: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <Avatar
                      src={sub.image_full_url}
                      sx={{
                        mx: "auto",
                        mb: 0.5,
                        bgcolor: "#fff",
                      }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={selectedSubId === sub.id ? 700 : 400}
                    >
                      {sub.name}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* ✅ PRODUCTS GRID (THIS WAS MISSING / OUTSIDE) */}
              {loading ? (
                <Grid container spacing={2}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Grid item xs={6} key={i}>
                      <ProductCardSkeleton />
                    </Grid>
                  ))}
                </Grid>
              ) : filteredProducts.length === 0 ? (
                <Typography>No items found</Typography>
              ) : (
                <Grid container spacing={2}>
                  {filteredProducts.map((p) => (
                    <Grid item xs={6} key={p.id}>
                      <ProductCard
                        product={p}
                        onAddToCart={handleAddToCart}
                        onProductClick={() => {
                          setSelectedProduct(p);
                          setOpenModal(true);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </>
      ) : (
        /* ---------------- DESKTOP VIEW ---------------- */

        <>
          <CustomBoxFullWidth
            sx={{
              width: "100%",
              maxWidth: "1280px",
              mx: "auto",
            }}
          >
            <Box sx={{ mt: "50px", px: { xs: 2, md: 6 }, pb: 6 }}>
              {/* HEADER */}
              <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <IconButton
                  onClick={() => {
                    router.push("/restaurant?view=all");
                  }}
                  sx={{
                    // background: "#f3f3f3",
                    height: 44,
                    width: 44,
                    borderRadius: "12px",
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>

                <Typography sx={{ ml: 1, fontWeight: 600 }}>
                  Back to Restaurants
                </Typography>
              </Box>

              {/* RESTAURANT HERO */}
              <Box
                sx={{
                  border: "1px solid #eee",
                  borderRadius: "12px",
                  overflow: "hidden",
                  mb: 4,
                  bgcolor: "white",
                }}
              >
                <Grid container sx={{ p: 3, alignItems: "center" }}>
                  <Grid item>
                    <Avatar
                      src={restaurant.logo_full_url}
                      sx={{ width: 70, height: 70, mr: 2 }}
                    />
                  </Grid>

                  <Grid item xs>
                    <Stack spacing={0.7}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h5" fontWeight={800}>
                          {restaurant.name}
                        </Typography>

                        <Chip
                          label={restaurant.open ? "Open now" : "Closed"}
                          color={restaurant.open ? "success" : "error"}
                          size="small"
                        />
                      </Stack>

                      {restaurant.meta_description && (
                        <Typography variant="body2" color="text.secondary">
                          {restaurant.meta_description}
                        </Typography>
                      )}

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          cursor: "pointer",
                          textDecoration: "underline",
                          maxWidth: "300px", // adjust as per UI
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          display: "block",
                          position: "relative",
                        }}
                        onClick={() => {
                          const query = encodeURIComponent(restaurant.address);
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${query}`,
                            "_blank",
                          );
                        }}
                      >
                        <style>
                          {`
                          @keyframes scrollText {
                            0% {
                              transform: translateX(0);
                            }
                            100% {
                              transform: translateX(-100%);
                            }
                          }
                        `}
                        </style>
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        ⏱ {restaurant.delivery_time}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item sx={{ textAlign: "right", position: "relative" }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <StarIcon sx={{ color: "#00b15e", fontSize: 22 }} />
                      <Typography variant="h6" sx={{ ml: 0.5 }}>
                        {Number(restaurant?.avg_rating || 0).toFixed(1)}
                      </Typography>

                      <Box
                        sx={{
                          width: "1px",
                          height: "28px",
                          bgcolor: "#ddd",
                          mx: 1.5,
                        }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          ml: 1,
                          position: "relative",
                          alignItems: "center",
                        }}
                      >
                        {restaurant.id && (
                          <Box
                            sx={{
                              width: 35,
                              height: 35,
                              borderRadius: "12px",
                              backgroundColor: "rgba(255,255,255,0.95)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid #E7E7E7",
                              cursor: "pointer",
                              zIndex: 5,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: "#ffffff",
                                transform: "scale(1.05)",
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isStoreWishlisted(restaurant)) {
                                removeStoreFromWishlist(restaurant, e);
                              } else {
                                addStoreToWishlist(restaurant, e);
                              }
                            }}
                          >
                            {isStoreWishlisted(restaurant) ? (
                              <FavoriteIcon
                                sx={{ color: "#E53935", fontSize: 20 }}
                              />
                            ) : (
                              <FavoriteBorderIcon
                                sx={{ color: "#c4c2c2", fontSize: 20 }}
                              />
                            )}
                          </Box>
                        )}

                        {/* Share Button */}
                        <IconButton
                          sx={{
                            width: 35,
                            height: 35,
                            borderRadius: "12px",
                            backgroundColor: "rgba(255,255,255,0.95)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #E7E7E7",
                            cursor: "pointer",
                            zIndex: 4,
                            "&:hover": {
                              backgroundColor: "#ffffff",
                            },
                          }}
                          onClick={handleShareClick}
                        >
                          <ShareIcon sx={{ color: "#333" }} />
                        </IconButton>

                        {/* Modal for social sharing */}
                        <SocialShareModal
                          open={modalOpen}
                          handleClose={handleCloseModal}
                          currentUrl={window.location.href} // Get current page URL
                        />
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      marginRight={13}
                    >
                      ({restaurant.reviews_comments_count}) reviews
                    </Typography>
                  </Grid>
                </Grid>

                <CardMedia
                  component="img"
                  height="350"
                  image={restaurant.cover_photo_full_url}
                  alt={restaurant.name || "Restaurant Image"}
                  title={restaurant.name || "Restaurant Image"}
                  sx={{ objectFit: "cover" }}
                />
              </Box>

              {/* MENU + PRODUCTS LAYOUT */}
              <Grid container spacing={3}>
                {/* LEFT MENU */}
                <Grid item xs={12} md={3.5} sx={{ maxHeight: 695 }}>
                  <Card
                    sx={{
                      p: 2,
                      borderRadius: "12px !important",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      Menu
                    </Typography>

                    {/* LEFT (menu) SEARCH - unchanged, uses `search` */}
                    <TextField
                      placeholder="Search categories..."
                      size="small"
                      fullWidth
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />

                    {/* CATEGORY LIST */}
                    <Box sx={{ overflowY: "auto", flex: 1 }}>
                      <Box sx={{ marginRight: 2 }}>
                        {!categories ? (
                          <Typography color="text.secondary">
                            Loading...
                          </Typography>
                        ) : (
                          parentsToRender.map((parent) => {
                            const pid = Number(parent.id);
                            let childes = parent.childes || [];

                            // LEFT MENU SEARCH
                            if (search.trim() !== "") {
                              const lowerSearch = search.toLowerCase();
                              // Filter childes (subcategories) based on the search term
                              childes = childes.filter((c) =>
                                c.name.toLowerCase().includes(lowerSearch),
                              );
                            }

                            // Check if the parent or any child matches the search, and highlight the parent if so
                            const isParentHighlighted = parent.name
                              .toLowerCase()
                              .includes(search.toLowerCase());
                            const isExpanded =
                              !!expanded[pid] ||
                              (search.trim() !== "" && childes.length > 0);

                            return (
                              <Box key={pid} sx={{ mb: 1 }}>
                                {/* PARENT CATEGORY */}
                                <Box
                                  onClick={() => toggleCategory(pid)}
                                  sx={{
                                    cursor: "pointer",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(52,168,83,0.25)",
                                    p: 1.1,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    bgcolor: isParentHighlighted
                                      ? "rgba(52,168,83,0.05)"
                                      : "white", // Highlight parent if matches search
                                  }}
                                >
                                  <Box
                                    display="flex"
                                    gap={2}
                                    alignItems="center"
                                  >
                                    <Avatar
                                      src={parent.image_full_url}
                                      sx={{ width: 38, height: 38 }}
                                    />
                                    <Typography fontWeight={700}>
                                      {parent.name}
                                    </Typography>
                                  </Box>

                                  <Box display="flex" alignItems="center">
                                    {expanded[pid] ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )}
                                  </Box>
                                </Box>

                                {/* SUBCATEGORIES */}
                                <Collapse in={isExpanded}>
                                  <Box sx={{ mt: 1 }}>
                                    {parent.childes.map((c, i) => {
                                      // Highlight the subcategory if it matches the search term
                                      const isSubHighlighted = c.name
                                        .toLowerCase()
                                        .includes(search.toLowerCase());
                                      return (
                                        <Box key={c.id}>
                                          <Box
                                            onClick={() => handleSubClick(c)}
                                            sx={{
                                              cursor: "pointer",
                                              p: 1.2,
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1.5,
                                              color:
                                                selectedSubId === c.id
                                                  ? "#34a853"
                                                  : "#000", // Highlight selected subcategory
                                              fontWeight:
                                                selectedSubId === c.id
                                                  ? 700
                                                  : 400,
                                              bgcolor: isSubHighlighted
                                                ? "rgba(52,168,83,0.1)"
                                                : "transparent", // Highlight if matches search
                                            }}
                                          >
                                            <Avatar
                                              src={c.image_full_url}
                                              sx={{ width: 28, height: 28 }}
                                            />
                                            <Typography variant="body2">
                                              {c.name}
                                            </Typography>
                                          </Box>

                                          {i < parent.childes.length - 1 && (
                                            <Divider sx={{ ml: 6 }} />
                                          )}
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Collapse>
                              </Box>
                            );
                          })
                        )}
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                {/* RIGHT PRODUCT GRID */}
                <Grid item xs={12} md={8.5}>
                  {/* RIGHT search bar (PRODUCT search) - this is the one with functionality */}
                  <Box
                    sx={{
                      mb: 3,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                      position: "relative", // 👈 important
                    }}
                  >
                    <TextField
                      placeholder="Search for items..."
                      size="small"
                      sx={{ width: 260 }}
                      value={searchQuery}
                      onChange={handleRightSearchChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 20, color: "#777" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Box
                      sx={{ position: "relative" }}
                      onMouseEnter={() => setShowFilterMenu(true)}
                      onMouseLeave={() => setShowFilterMenu(false)}
                    >
                      <IconButton
                        sx={{ border: "1px solid #ddd", borderRadius: "10px" }}
                        onFocus={() => setShowFilterMenu(true)}
                        onBlur={() => setShowFilterMenu(false)}
                      >
                        <TuneIcon />
                      </IconButton>

                      {showFilterMenu && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 45,
                            right: 0,
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            bgcolor: "#fff",
                            zIndex: 1000,
                            boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                            minWidth: 100, // Reduced width
                            mr: -2,
                          }}
                        >
                          {/* Veg option */}
                          {/* Veg option */}
                          <Box
                            sx={{
                              p: 1,
                              cursor: "pointer",
                              fontWeight:
                                vegFilter === "veg" ? "bold" : "normal",
                              fontSize: "0.85rem",
                              backgroundColor:
                                vegFilter === "veg" ? "#f0f0f0" : "transparent",
                              borderRadius: "4px",
                              "&:hover": {
                                backgroundColor: "#f5f5f5", // light hover color
                              },
                            }}
                            onClick={() => {
                              setVegFilter("veg");
                              setShowFilterMenu(false);
                            }}
                          >
                            Veg
                          </Box>

                          {/* Non-Veg option */}
                          <Box
                            sx={{
                              p: 1,
                              cursor: "pointer",
                              fontWeight:
                                vegFilter === "nonveg" ? "bold" : "normal",
                              fontSize: "0.85rem",
                              backgroundColor:
                                vegFilter === "nonveg"
                                  ? "#f0f0f0"
                                  : "transparent",
                              borderRadius: "4px",
                              "&:hover": {
                                backgroundColor: "#f5f5f5", // same hover
                              },
                            }}
                            onClick={() => {
                              setVegFilter("nonveg");
                              setShowFilterMenu(false);
                            }}
                          >
                            Non-Veg
                          </Box>

                          {/* Clear Filter option */}
                          <Box
                            sx={{
                              p: 1,
                              cursor: "pointer",
                              fontSize: "0.85rem", // Reduced font size
                              color: "gray",
                            }}
                            onClick={() => {
                              setVegFilter(null);
                              setShowFilterMenu(false);
                            }}
                          >
                            Clear Filter
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Product List */}
                  {loading ? (
                    <Typography>Loading...</Typography>
                  ) : filteredProducts.length === 0 ? (
                    <Typography>No items found</Typography>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      {/* Product Cards (85/90% area) */}
                      <Box sx={{ flex: "1 0 90%" }}>
                        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                          {paginatedProducts.map((product) => (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              lg={3}
                              key={product.id}
                            >
                              <ProductCard
                                product={product}
                                onAddToCart={handleAddToCart}
                                onProductClick={handleProductClick}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>

                      {/* Pagination controls (bottom fixed area) */}
                      {filteredProducts.length > itemsPerPage && (
                        <Box
                          sx={{
                            flex: "0 0 10%",
                            display: "flex",
                            justifyContent: "center",
                            mt: 1,
                            mb: 2,
                          }}
                        >
                          <Pagination
                            count={Math.ceil(
                              filteredProducts.length / itemsPerPage,
                            )}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                          />
                        </Box>
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>

              {/* POPUP MODAL */}
              <ProductModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                product={selectedProduct}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            </Box>
          </CustomBoxFullWidth>
        </>
      )}

      {/* MODAL */}
      <ProductModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </Box>
  );
}
