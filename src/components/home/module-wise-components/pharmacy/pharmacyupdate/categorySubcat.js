import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material";
import { useRouter } from "next/router";
import Image from "next/image";

import MainApi from "../../../../../api-manage/MainApi";
import {
  categories_Childes_api,
  zoneId_api,
} from "../../../../../api-manage/ApiRoutes";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

// API URL and constants
const API_URL = "https://dealplex.in/api/v1/categories";
const INITIAL_SUBCATEGORY_LIMIT = 12;
const LEFT_BAR_WIDTH = "200px";

// ✅ NAYA — fallback image jab image_full_url null/undefined/empty ho.
// next/image null/undefined src milte hi crash ho jaata hai
// ("Cannot read properties of null (reading 'default')"), isliye
// har <Image> ko is helper se guard karna zaroori hai.
const FALLBACK_IMG = "/placeholder-category.png"; // apni default image /public mein rakh lena
const safeImgSrc = (src) =>
  typeof src === "string" && src.trim() !== "" ? src : FALLBACK_IMG;

// --------------------------- FETCH DYNAMIC ZONE-ID ---------------------------
// ✅ CHANGED — agar zone na mile (location missing/invalid/API fail),
// ab hardcoded [15,16] ke bajaye seedha "0" string return hoga
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

    localStorage.setItem("zoneid", JSON.stringify(zoneArray));
    return zoneArray;
  } catch (err) {
    // console.error("❌ ZONE FETCH FAILED:", err);
    return "0"; // ✅ fallback ab "0" string hai, [15,16] nahi
  }
};

// --------------------------- SKELETON COMPONENTS ---------------------------
const CategoryListSkeleton = () => (
  <Box sx={{ px: 2, pt: 1 }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <Box
        key={i}
        sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.2 }}
      >
        <Skeleton variant="circular" width={50} height={50} />
        <Skeleton variant="text" width="70%" height={24} />
      </Box>
    ))}
  </Box>
);

const SubCategoryGridSkeleton = ({ count = 8 }) => (
  <Grid container spacing={2} sx={{ pb: 3, justifyContent: "center" }}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid item key={i} xs={6} sm={4} md={3} lg={3} xl={3}>
        <Box
          sx={{
            border: "1px solid var(--border-subtle)",
            borderRadius: 1,
            p: 2,
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height={140}
            sx={{ borderRadius: "4px" }}
          />
          <Skeleton variant="text" width="80%" sx={{ mx: "auto", mt: 1 }} />
        </Box>
      </Grid>
    ))}
  </Grid>
);

const MobileCategoryStripSkeleton = () => (
  <Box sx={{ display: "flex", gap: 1.5, px: 2, pb: 2, overflow: "hidden" }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Box
        key={i}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: "60px",
        }}
      >
        <Skeleton variant="circular" width={60} height={60} />
        <Skeleton variant="text" width={50} sx={{ mt: 1 }} />
      </Box>
    ))}
  </Box>
);

const MobileSubCategorySkeleton = () => (
  <Box sx={{ mx: 2, pb: 2 }}>
    <Skeleton
      variant="rectangular"
      width="100%"
      height={200}
      sx={{ borderRadius: 1 }}
    />
  </Box>
);

// --------------------------- COMPONENT ---------------------------
const ExploreCategories = () => {
  const [zoneIds, setZoneIds] = useState(null); // null = not resolved yet
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [error, setError] = useState(null);
  const [catid, setCatid] = useState(null);
  const [showAllSubcategories, setShowAllSubcategories] = useState(false);

  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // --------------------------- LOAD ZONE-ID (CACHE FIRST, INSTANT) ---------------------------
  useEffect(() => {
    const cached = localStorage.getItem("zoneid");
    if (cached) {
      // ✅ cache mile to turant use karo, network ka wait nahi
      const parsedCache = JSON.parse(cached);
      // console.log(
      //   "🔍 [ZoneId] Loaded from cache (localStorage 'zoneid'):",
      //   parsedCache,
      // );
      setZoneIds(parsedCache);
    } else {
      // console.log("🔍 [ZoneId] No cache found, calling fetchZoneId()...");
      fetchZoneId().then((result) => {
        // console.log("🔍 [ZoneId] fetchZoneId() resolved to:", result);
        setZoneIds(result);
      });
    }
  }, []);

  // --------------------------- FETCH CATEGORIES ---------------------------
  useEffect(() => {
    if (zoneIds === null) return; // abhi zone resolve nahi hua, wait karo

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const moduleId = 3;

        // ✅ NAYA — [0] array (jo cache se aa sakta hai) ko bhi "0" zero-zone
        // case treat karo, sirf literal "0" string nahi. Isse zone-zero
        // detection hamesha sahi chalega chahe state "0" ho ya [0] ho.
        const isZeroZone =
          zoneIds === "0" ||
          (Array.isArray(zoneIds) &&
            zoneIds.flat().length === 1 &&
            zoneIds.flat()[0] === 0);

        // ✅ actual zoneIds use ho rahe hain (pehle hardcoded [15,17] tha)
        // agar zone-zero case hai to hamesha "0" string bhejo, array nahi
        const zonePayload = isZeroZone ? "0" : JSON.stringify(zoneIds);

        // ✅ zone "0" (fallback) ke case mein lat/lng bhi bhejo,
        // taaki backend khud location se zone resolve kar sake instead
        // of throwing "Please select zone first"
        let lat = "";
        let lng = "";
        if (isZeroZone) {
          const storedLatLng = localStorage.getItem("currentLatLng");
          if (storedLatLng) {
            try {
              const parsed = JSON.parse(storedLatLng);
              lat = parsed?.lat ?? "";
              lng = parsed?.lng ?? "";
            } catch (e) {
              // ignore parse error, lat/lng stay empty
            }
          }
        }

        const url =
          isZeroZone && lat && lng
            ? `${API_URL}?lat=${lat}&lng=${lng}`
            : API_URL;

        const requestHeaders = {
          "Content-Type": "application/json",
          moduleId: String(moduleId),
          zoneId: zonePayload,
          ...(isZeroZone && lat && lng
            ? { latitude: String(lat), longitude: String(lng) }
            : {}),
        };

        // 🔍 DEBUG LOG — ye batayega exactly kya bheja ja raha hai categories API ko
        // console.log("🔍 [Categories API] Request debug:", {
        //   zoneIds_state: zoneIds, // raw state — "0", [0], ya real array
        //   isZeroZone, // true/false — zone-zero detect hua ya nahi
        //   zonePayload_sent: zonePayload, // header mein jo zoneId gaya
        //   lat_sent: lat || "(empty)",
        //   lng_sent: lng || "(empty)",
        //   final_url: url,
        //   headers_sent: requestHeaders,
        // });

        const res = await fetch(url, {
          method: "GET",
          headers: requestHeaders,
        });

        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        const categoryList = data?.data || data?.categories || data || [];

        setCategories(categoryList);

        if (categoryList.length > 0) {
          setSelectedCategory(categoryList[0]);
          setCatid(categoryList[0].id);
        } else {
          setSelectedCategory(null);
          setCatid(null);
        }
      } catch (err) {
        // console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [zoneIds]);

  // --------------------------- SUBCATEGORY FETCH ---------------------------
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        if (catid) {
          setSubLoading(true);
          const { data } = await MainApi.get(
            `${categories_Childes_api}/${catid}`,
          );
          setSubCategories(data || []);
          setShowAllSubcategories(false);
        } else {
          setSubCategories([]);
        }
      } catch (error) {
        // console.error("Error fetching subcategories:", error);
        setSubCategories([]);
      } finally {
        setSubLoading(false);
      }
    };

    if (catid) fetchSubcategories();
    else setSubCategories([]);
  }, [catid]);

  // --------------------------- EVENT HANDLERS ---------------------------
  const handleCategorySelection = (category) => {
    setSelectedCategory(category);
    setCatid(category.id);
  };

  const navigateToSubcategory = (subCategory) => {
    if (!selectedCategory) return;

    const nameEncoded =
      typeof window !== "undefined"
        ? btoa(selectedCategory?.name || "")
        : selectedCategory?.name;

    router.push({
      pathname: "/home",
      query: {
        search: "category",
        id: selectedCategory?.id,
        subcategory_id: subCategory.id,
        cateid: catid,
        module_id: 3,
        name: nameEncoded,
        data_type: "category",
      },
    });
  };

  const categoriesToDisplay =
    showAllSubcategories && !isMobile
      ? subCategories
      : subCategories.slice(0, INITIAL_SUBCATEGORY_LIMIT);

  const showViewAllButton =
    !isMobile &&
    subCategories.length > INITIAL_SUBCATEGORY_LIMIT &&
    !showAllSubcategories;

  // --------------------------- ERROR STATE ---------------------------
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (!loading && categories.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1">
          No categories available at the moment.
        </Typography>
      </Box>
    );
  }

  // --------------------------- DESKTOP/TABLET LAYOUT ---------------------------
  if (!isMobile) {
    return (
      <Box>
        <Typography fontWeight={700} sx={{ fontSize: "24px", mb: "10px" }}>
          Explore By Category
        </Typography>

        <Box
          sx={{
            px: 0,
            width: "100%",
            border: "1px solid var(--border-default)",
            borderRadius: "8px !important",
            backgroundColor: "var(--bg-card)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row", height: "520px" }}>
            {/* LEFT COLUMN */}
            <Box
              sx={{
                width: LEFT_BAR_WIDTH,
                borderRight: "1px solid var(--border-subtle)",
                paddingTop: "10px",
                height: "100%",
                overflowY: "auto",
                paddingBottom: "10px",
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
              }}
            >
              {loading ? (
                <CategoryListSkeleton />
              ) : (
                <List disablePadding>
                  {categories.map((category, index) => (
                    <ListItem
                      button
                      key={index}
                      onClick={() => handleCategorySelection(category)}
                      sx={{
                        padding: "10px 16px",
                        borderRadius: 0,
                        display: "flex",
                        alignItems: "center",
                        backgroundColor:
                          selectedCategory?.id === category.id
                            ? "var(--pharmacy-selected-bg)"
                            : "transparent",
                        borderLeft:
                          selectedCategory?.id === category.id
                            ? "4px solid var(--pharmacy-selected-accent)"
                            : "none",
                        borderTopLeftRadius:
                          selectedCategory?.id === category.id ? "8px" : "0",
                        borderBottomLeftRadius:
                          selectedCategory?.id === category.id ? "8px" : "0",
                        width:
                          selectedCategory?.id === category.id
                            ? "calc(100% - 10px)"
                            : "100%",
                        marginLeft:
                          selectedCategory?.id === category.id ? "12px" : "0",
                        "&:hover": {
                          backgroundColor:
                            selectedCategory?.id === category.id
                              ? "var(--pharmacy-selected-bg)"
                              : "var(--bg-subtle)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: 50,
                          height: 50,
                          mr: 1.5,
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={safeImgSrc(category.image_full_url)}
                          alt={category.name}
                          title={category.name}
                          fill
                          sizes="50px"
                          style={{ objectFit: "contain" }}
                        />
                      </Box>

                      <ListItemText
                        primary={category.name}
                        primaryTypographyProps={{
                          fontWeight:
                            selectedCategory?.id === category.id
                              ? "bold"
                              : "normal",
                          fontSize: "14px",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {/* RIGHT COLUMN */}
            <Box
              sx={{
                flex: 1,
                px: 3,
                pt: "10px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                {loading ? (
                  <Skeleton variant="text" width={150} height={32} />
                ) : (
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {selectedCategory?.name}
                  </Typography>
                )}

                {showViewAllButton && (
                  <Button
                    variant="text"
                    color="success"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => setShowAllSubcategories(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      color: "var(--pharmacy-selected-accent)",
                    }}
                  >
                    View All
                  </Button>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  pr: 1.5,
                  "&::-webkit-scrollbar": { width: "8px" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "var(--border-default)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "var(--bg-subtle)",
                  },
                }}
              >
                {loading || subLoading ? (
                  <SubCategoryGridSkeleton />
                ) : (
                  <Grid
                    container
                    spacing={2}
                    sx={{ pb: 3, flexWrap: "wrap", justifyContent: "center" }}
                  >
                    {categoriesToDisplay.map((subCategory) => (
                      <Grid
                        item
                        key={subCategory.id}
                        xs={6}
                        sm={4}
                        md={3}
                        lg={3}
                        xl={3}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          flex: "1 0 auto",
                          minWidth: { xs: "120px", sm: "140px", md: "150px" },
                          maxWidth: { xs: "70%", sm: "85%", md: "100%" },
                        }}
                      >
                        <Box
                          onClick={() => navigateToSubcategory(subCategory)}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            cursor: "pointer",
                            border: "1px solid var(--border-subtle)",
                            padding: 2,
                            borderRadius: 1,
                            width: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              height: 140,
                            }}
                          >
                            <Image
                              src={safeImgSrc(subCategory.image_full_url)}
                              alt={subCategory.name}
                              title={subCategory.name}
                              fill
                              sizes="(max-width: 600px) 45vw, 200px"
                              style={{
                                objectFit: "contain",
                                borderRadius: "4px 4px 0 0",
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body1"
                            sx={{
                              mt: 1,
                              px: 1,
                              fontWeight: 600,
                              height: "3em",
                              overflow: "hidden",
                              textAlign: "center",
                              whiteSpace: "normal",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              width: "100%",
                              fontSize: "0.8rem",
                            }}
                          >
                            {subCategory.name}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // --------------------------- MOBILE LAYOUT ---------------------------
  return (
    <Box
      sx={{
        px: 0,
        width: "100%",
        border: "none",
        borderRadius: "0",
        backgroundColor: "var(--bg-card)",
        overflow: "hidden",
        pb: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          pt: 2,
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Shop by categories
        </Typography>
      </Box>

      {loading ? (
        <MobileCategoryStripSkeleton />
      ) : (
        <Box sx={{ mx: 2, pb: 2, overflow: "hidden" }}>
          <Swiper
            slidesPerView={"auto"}
            spaceBetween={10}
            freeMode={true}
            modules={[FreeMode]}
          >
            {categories.map((category) => (
              <SwiperSlide key={category.id} style={{ width: "100px" }}>
                <Box
                  onClick={() => handleCategorySelection(category)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    textAlign: "center",
                    borderRadius: "8px",
                    p: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      border:
                        selectedCategory?.id === category.id
                          ? "2px solid var(--pharmacy-selected-accent)"
                          : "1px solid var(--border-subtle)",
                      overflow: "hidden",
                      position: "relative",
                      mb: 1,
                    }}
                  >
                    <Image
                      src={safeImgSrc(category.image_full_url)}
                      alt={category.name}
                      title={category.name}
                      fill
                      sizes="60px"
                      style={{ objectFit: "cover" }}
                    />
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight:
                        selectedCategory?.id === category.id
                          ? "bold"
                          : "normal",
                      color:
                        selectedCategory?.id === category.id
                          ? "var(--pharmacy-selected-accent)"
                          : "text.primary",
                      whiteSpace: "normal",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      height: "3em",
                    }}
                  >
                    {category.name}
                  </Typography>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      )}

      <Divider sx={{ mx: 2, mb: 2 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          mb: 2,
        }}
      >
        {loading ? (
          <Skeleton variant="text" width={120} height={24} />
        ) : (
          <Typography variant="body3" sx={{ fontWeight: "bold" }}>
            {selectedCategory?.name}
          </Typography>
        )}
      </Box>

      <Box sx={{ mx: 2, pb: 2, overflow: "hidden" }}>
        {loading || subLoading ? (
          <MobileSubCategorySkeleton />
        ) : subCategories.length > 0 ? (
          <Swiper
            slidesPerView={1}
            spaceBetween={10}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              stopOnLastSlide: false,
            }}
            loop={true}
            pagination={{ clickable: true }}
            modules={[Autoplay, Pagination]}
            style={{ paddingBottom: "30px" }}
          >
            {subCategories.map((subCategory) => (
              <SwiperSlide key={subCategory.id}>
                <Box
                  onClick={() => navigateToSubcategory(subCategory)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    border: "1px solid var(--border-subtle)",
                    padding: 2,
                    height: "200px",
                    width: "100%",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{ position: "relative", width: "100%", height: 180 }}
                  >
                    <Image
                      src={safeImgSrc(subCategory.image_full_url)}
                      alt={subCategory.name}
                      title={subCategory.name}
                      fill
                      sizes="90vw"
                      style={{
                        objectFit: "contain",
                        borderRadius: "4px 4px 0 0",
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      mt: 1,
                      px: 1,
                      fontWeight: 600,
                      height: "2.4em",
                      overflow: "hidden",
                      textAlign: "center",
                      whiteSpace: "normal",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      width: "100%",
                      maxWidth: "100%",
                      fontSize: "0.8rem",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {subCategory.name}
                  </Typography>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <Typography variant="body1" align="center" sx={{ p: 2 }}>
            No subcategories available.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ExploreCategories;
