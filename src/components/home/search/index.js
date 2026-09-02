import React, { useEffect, useRef, useState } from "react";
import CustomContainer from "../../container";
import {
  CustomBoxFullWidth,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import TabsTypeTwo from "../../custom-tabs/TabsTypeTwo";
import SearchMenu from "../../search/SearchMenu";
import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";
import { alpha, useMediaQuery, useTheme, Box, Typography } from "@mui/material";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { filterTypeStores } from "components/search/filterTypes";
import SideBarWithData from "components/search/SideBarWithData";
import useGetSearchPageData from "api-manage/hooks/react-query/search/useGetSearchPageData";
import MobileSideDrawer from "components/home/search/MobileSideDrawer";
import { useDispatch, useSelector } from "react-redux";
import {
  setFilterData,
  setRating_Count,
  setSelectedBrands,
  setSelectedCategories,
} from "redux/slices/categoryIds";
import PathFlow from "./pathflow/pathflow";
import Sidebar from "./pathflow/sidebar";
import SubCategoryLoader from "./pathflow/subcategorynameloader";
import ProductGrid from "./pathflow/cardLoader";
import ProductGridDynamic from "./pathflow/cardLoader";

// 👇 NAYA IMPORT — zone resolve karne ke liye lat/lng wali API
import MainApi from "../../../api-manage/MainApi"; // ⚠️ apne project ke actual path se adjust karo
import { zoneId_api } from "../../../api-manage/ApiRoutes"; // ⚠️ apne project ke actual path se adjust karo

const SearchResult = (props) => {
  const {
    searchValue,
    configData,
    subCategoryId,
    fromAllCategories,
    fromNav,
    routeTo,
    currentTab,
    setCurrentTab,
  } = props;
  const router = useRouter();
  const dispatch = useDispatch();
  const moduleid = router.query.module_id;
  const { data_type, zone_id } = router.query;

  // ✅ FIX (SPEED): initialize zoneIds FROM the localStorage cache
  // synchronously instead of starting empty and always waiting on the
  // lat/lng → zone API call on every navigation. ProductGridDynamic only
  // starts fetching once zoneIds is non-empty, so this alone removes one
  // full network round-trip from the critical path on every subcategory
  // click.
  const getCachedZoneIds = () => {
    try {
      const cached = localStorage.getItem("zoneid");
      if (!cached) return [];
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  };

  const [zoneIds, setZoneIds] = useState(getCachedZoneIds);

  // console.log("module id present here : ", moduleid);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const id = router.query.id;
  const brand_id = router.query.brand_id;
  const [currentView, setCurrentView] = useState(0);
  const [offset, setOffset] = useState(0);
  const [openSideDrawer, setOpenSideDrawer] = useState(false);
  const [filterValue, setFilterValue] = useState([]);
  const [minMax, setMinMax] = useState([0, 20000000]);
  const [type, setType] = useState("all");
  const [category_id, setCategoryId] = useState(id);
  const [sortBy, setSortBy] = useState("");
  const [newSort, setNewSort] = useState("");
  const [isEmpty, setIsEmpty] = useState(false);
  const [linkRouteTo, setLinkRouteTo] = useState(routeTo);
  const { ref, inView } = useInView({
    rootMargin: "0px 0px 10% 0px",
  });
  const { selectedBrands, selectedCategories, filterData, rating_count } =
    useSelector((state) => state.categoryIds);
  useEffect(() => {
    dispatch(setSelectedBrands(data_type === "brand" ? [brand_id] : []));
    dispatch(setSelectedCategories(data_type === "category" ? [id] : []));
  }, []);

  const page_limit = 12;

  /* ============================================================
     ✅ FIX: category_id aur subcatid ko URL ke `id` param ke
     saath sync rakho. Pehle yeh sirf useState(id) se ek baar
     set hota tha — agar id query param baad me change hota
     (sitemap se navigate karne par ya kisi bhi client-side
     navigation par bina full reload ke), to category_id stale
     reh jaata tha aur galat category_ids API me chali jaati thi.
     ============================================================ */
  useEffect(() => {
    setCategoryId(id);

    /* ============================================================
       ✅ FIX: Subcategory name / heading was not displaying.
       This effect used to always reset subcatid to null, so the
       `subcategory_id` coming from the URL (e.g. a deep link like
       /home?...&id=1117&subcategory_id=1125, or a page refresh) was
       completely ignored — PathFlow/SubCategoryLoader/ProductGrid
       never received a subid on first load, so the subcategory name
       never rendered anywhere.

       Now we sync subcatid FROM the URL's subcategory_id whenever the
       category (id) or that query param changes. If the URL has no
       subcategory_id (plain category page), it correctly falls back
       to null/"All".
       ============================================================ */
    setsubcatid(router.query.subcategory_id || null);
  }, [id, router.query.subcategory_id]);

  const selectedCategoriesHandler = (dataArray) => {
    if (dataArray?.length > 0) {
      setLinkRouteTo("");
      dispatch(setSelectedCategories([...new Set(dataArray)]));
    } else {
      dispatch(setSelectedCategories([]));
    }
  };

  const selectedBrandsHandler = (dataArray) => {
    if (linkRouteTo === "nav") {
      dispatch(setSelectedBrands([]));
    } else {
      const filteredArray = dataArray.filter((item) => !isNaN(item));
      if (filteredArray.length > 0) {
        dispatch(setSelectedBrands([...new Set(filteredArray)]));
      } else {
        dispatch(setSelectedBrands([]));
      }
    }
  };

  const tabs = [
    {
      name:
        getCurrentModuleType() === "food"
          ? "Foods"
          : getCurrentModuleType() === "ecommerce"
          ? "Items"
          : getCurrentModuleType() === "pharmacy"
          ? "Medicines"
          : "Groceries",
      value: "items",
    },
    {
      name: getCurrentModuleType() === "food" ? "Restaurants" : "Stores",
      value: "stores",
    },
  ];

  const selectedCategoriesIds = selectedCategories;

  const handleSuccess = (res) => {
    if (res) {
      const hasData =
        currentTab === 0
          ? res?.pages[0]?.products?.length > 0
          : res?.pages[0]?.stores?.length > 0;
      if (!hasData) {
        setIsEmpty(true);
      }

      setOffset((prev) => prev + 1);
    }
  };
  const pageParams = {
    data_type,
    searchValue,
    category_id,
    selectedCategoriesIds,
    selectedBrands,
    page_limit,
    offset,
    type,
    currentTab,
    filterValue,
    rating_count,
    minMax,
    zoneIds,
  };

  const {
    data: searchData,
    refetch: serachRefetch,
    isFetching: isFetchingSearchAPi,
    isRefetching: isRefetchingSearch,
    fetchNextPage: fetchNextPageSearch,
    isFetchingNextPage,
    isLoading: isLoadingSearch,
  } = useGetSearchPageData(pageParams, handleSuccess);

  const prevSelectedCategoriesIds = useRef(pageParams.selectedCategoriesIds);
  const prevBrands = useRef(pageParams.selectedBrands);
  const prvMinmax = useRef(pageParams.minMax);
  const prvRating = useRef(pageParams.rating_count);
  const topRef = useRef(null);
  useEffect(() => {
    topRef.current?.scrollIntoView({
      behavior: "instant", // ❗ smooth hatao
      block: "start",
    });
  }, [router.query]);

  useEffect(() => {
    const handle = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    };

    setTimeout(handle, 0);
  }, [router.query]);

  useEffect(() => {
    handleFilterSelection();
  }, []);

  /* ============================================================
     ✅ FIX (ZONE BUG): Pehle yahaan `zone_id` query param (jo
     sitemap URLs me hardcoded baked-in hota hai, jaise
     ?zone_id=[15]) ko seedha trust kar liya jaata tha aur
     current location ke lat/lng se zone resolve karne wali API
     SKIP ho jaati thi. Isse jab koi user kisi alag location se
     sitemap link kholta tha, to galat/mismatched zone use hoti
     thi aur "No products found" jaisa empty result aata tha
     (especially pharmacy/baby-care jaise modules me jinke
     products sirf specific zones me available hote hain).

     Naya behavior: `zone_id` query param ko IGNORE karte hain.
     Hamesha current lat/lng (localStorage me saved
     "currentLatLng") se zone resolve karte hain — bilkul waise
     hi jaise normal flow (AllFoodCategories.jsx /
     ProductGridDynamic.jsx) me hota hai. Agar zone resolve na ho
     paaye, to fallback me [0] pass karte hain (no-zone case).
     ============================================================ */
  const resolveZoneFromLatLng = async () => {
    try {
      const storedLatLng = localStorage.getItem("currentLatLng");
      if (!storedLatLng) throw new Error("Location not selected");

      const { lat, lng } = JSON.parse(storedLatLng);
      if (!lat || !lng) throw new Error("Invalid lat/lng");

      const res = await MainApi.get(zoneId_api, { params: { lat, lng } });
      const data = res?.data;

      const zones =
        data?.zone_ids ||
        data?.data?.zone_ids ||
        data?.zone_id ||
        data?.data?.zone_id;

      if (!zones) throw new Error("Zone not found");

      const zoneArray = Array.isArray(zones) ? zones : [zones];
      setZoneIds(zoneArray);
      localStorage.setItem("zoneid", JSON.stringify(zoneArray));
      // console.log("✅ zoneIds resolved from lat/lng:", zoneArray);
    } catch (err) {
      // console.warn("⚠️ lat/lng zone resolve failed:", err.message);

      // Fallback 1: URL query param se
      try {
        const queryZone = router.query.zone_id; // e.g. "[15]" string
        if (queryZone) {
          // decodeURIComponent => "[15]", JSON.parse => [15] (number array)
          const decoded = decodeURIComponent(queryZone); // "[15]"
          const parsed = JSON.parse(decoded); // [15]
          // Make sure numbers hain, strings nahi
          const zoneArray = (Array.isArray(parsed) ? parsed : [parsed])
            .map(Number)
            .filter((n) => !isNaN(n));

          // console.log("✅ zoneIds from URL query param:", zoneArray);
          setZoneIds(zoneArray);
          return;
        }
      } catch (parseErr) {
        // console.warn("⚠️ URL zone_id parse failed:", parseErr.message);
      }

      // Fallback 2: localStorage cached zoneid
      try {
        const cached = localStorage.getItem("zoneid");
        if (cached) {
          const parsed = JSON.parse(cached);
          const zoneArray = (Array.isArray(parsed) ? parsed : [parsed])
            .map(Number)
            .filter((n) => !isNaN(n));
          // console.log("✅ zoneIds from localStorage cache:", zoneArray);
          setZoneIds(zoneArray);
          return;
        }
      } catch (cacheErr) {
        // console.warn("⚠️ Cached zone parse failed");
      }

      // Fallback 3: Last resort
      // console.error("❌ All zone resolves failed, using [0]");
      setZoneIds([0]);
    }
  };

  useEffect(() => {
    // ✅ FIX (SPEED): zoneIds already cache se instantly set ho chuka hai
    // (upar useState initializer me). Ab yeh call sirf BACKGROUND me cache
    // ko refresh/verify karta hai — product grid ka pehla render ab is
    // network call ka wait nahi karta.
    resolveZoneFromLatLng();
  }, []);

  useEffect(() => {
    const hasData =
      currentTab === 0
        ? searchData?.pages[0]?.products?.length > 0
        : searchData?.pages[0]?.stores?.length > 0;
    const selectedCategoriesChanged =
      prevSelectedCategoriesIds.current !== pageParams.selectedCategoriesIds;
    const selectedBrandsChanged =
      prevBrands.current !== pageParams.selectedBrands;
    prevSelectedCategoriesIds.current = pageParams.selectedCategoriesIds;
    const selectedMinMaxChanged = prvRating.current !== pageParams.minMax;
    prvMinmax.current = pageParams.minMax;

    const selectedRating = prvRating.current !== pageParams.rating_count;
    prvMinmax.current = pageParams.rating_count;
    if (
      (!hasData && selectedCategoriesChanged && isEmpty) ||
      (!hasData && selectedMinMaxChanged && isEmpty) ||
      (!hasData && selectedRating && isEmpty) ||
      (!hasData && selectedBrandsChanged && isEmpty)
    ) {
      serachRefetch();
    }
  }, [
    searchData,
    pageParams.selectedCategoriesIds,
    pageParams.selectedBrands,
    serachRefetch,
    filterData,
    pageParams?.minMax,
    rating_count,
    selectedBrands,
  ]);

  const handleFilterSelection = () => {
    const filterTypesConditionally = filterTypeStores;
    const newData = filterTypesConditionally?.map((item) => {
      if (item?.value === "discounted") {
        if (data_type === "discounted") {
          return {
            ...item,
            checked: true,
          };
        } else {
          return item;
        }
      } else {
        return item;
      }
    });
    dispatch(setFilterData(newData));
  };

  const handleSortBy = (value) => {
    setSortBy(value);
    setFilterValue((prevValues) => {
      let newFilterValues = new Set([...prevValues]);
      if (value === "low") {
        if (newFilterValues?.has("high")) {
          newFilterValues?.delete("high");
        }
      } else {
        // Assuming the only other option is "high2Low"
        if (newFilterValues?.has("low")) {
          newFilterValues?.delete("low");
        }
      }
      newFilterValues.add(value);
      return [...newFilterValues];
    });
  };
  const handleSortByNew = (value) => {
    setNewSort(value);
    setFilterValue((prevValues) => {
      let newFilterValues = new Set([...prevValues]);

      // Clear "default," "nearby," and "distance" if already present
      ["default", "fast_delivery", "nearby"].forEach((item) => {
        if (newFilterValues.has(item)) {
          newFilterValues.delete(item);
        }
      });

      // Add the new value from "default", "nearby", or "distance"
      if (["default", "fast_delivery", "nearby"].includes(value)) {
        newFilterValues.add(value);
      }

      return [...newFilterValues];
    });
  };

  const handleCheckbox = (value, e) => {
    let newData = filterData?.map((item) =>
      item?.value === value?.value
        ? { ...item, checked: e.target.checked }
        : item,
    );
    dispatch(setFilterData(newData));
  };

  useEffect(() => {
    const defaultValues = ["default", "fast_delivery", "nearby", "high", "low"];
    const currentlyCheckedValues = filterData
      .filter((item) => item.checked)
      .map((item) => item.value);

    // Include default values if they exist in the current filterValue
    const updatedFilterValue = [
      ...new Set([
        ...currentlyCheckedValues,
        ...filterValue.filter((val) => defaultValues.includes(val)),
      ]),
    ];

    // Update filterValue only if there is a change
    if (
      updatedFilterValue.length !== filterValue.length ||
      !updatedFilterValue.every((val, index) => val === filterValue[index])
    ) {
      setFilterValue(updatedFilterValue);
    }
  }, [filterData]);

  const handleChangeRatings = (value) => {
    dispatch(setRating_Count(value));
  };

  const filterDataAndFunctions = {
    filterData: filterData,
    setFilterData: setFilterData,
    handleCheckbox: handleCheckbox,
    handleChangeRatings: handleChangeRatings,
    getRatingValue: rating_count,
    currentTab: currentTab,
  };

  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return; // ❌ skip first auto trigger
    }

    if (inView) {
      fetchNextPageSearch();
    }
  }, [inView]);

  const [subcatid, setsubcatid] = useState(null);

  const handleSubCategorySelect = (subCategoryId) => {
    setsubcatid(subCategoryId);
    // console.log("Selected Subcategory ID:", subCategoryId);
  };

  // console.log("hehehehehehe : ", subcatid);

  const handleCurrentTab = (value) => {
    setCurrentTab(value);
    setFilterValue([]);

    // Uncheck all filters and dispatch the updated data
    dispatch(
      setFilterData(filterData.map((item) => ({ ...item, checked: false }))),
    );
  };

  const getRefBox = () => (
    <CustomBoxFullWidth ref={ref} sx={{ height: "10px" }}></CustomBoxFullWidth>
  );

  const refBoxHandler = () => {
    return <>{getRefBox()}</>;
  };

  // console.log("Current Tab : ", currentTab);
  // console.log("Tab : ", tabs);
  // console.log("Category id : ", category_id);

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  const handleProductSelection = (product) => {
    setActiveProduct(product); // Set the active product
    setActiveCategory(product.category); // Assuming the product has a `category` field
    setActiveSubcategory(product.subcategory); // Assuming the product has a `subcategory` field

    // Log to check if values are updated correctly
    // console.log("Selected Product:", product);
    // console.log("Active Category:", product.category);
    // console.log("Active Subcategory:", subCategoryId);
  };
  // console.log("router.query full:", router.query);
  // console.log("moduleid from query:", router.query.module_id);
  // console.log("subid (subcatid):", subcatid);
  // console.log("catid (id):", router.query.id);
  return (
    <CustomContainer ref={topRef}>
      <CustomStackFullWidth
        alignItems="center"
        justifyContent="center"
        mt="30px"
      >
        {/* Breadcrumb / Path */}
        <PathFlow
          catid={category_id}
          subid={subcatid}
          module_id={moduleid}
          zone_id={zoneIds} // ✅ NEW
        />

        {/* Optional Top Divider */}
        <CustomBoxFullWidth
          sx={{
            borderBottom: (theme) =>
              `1px solid ${alpha(theme.palette.neutral[400], 0.4)}`,
            mb: 2,
          }}
        ></CustomBoxFullWidth>

        {/* Main Layout: Sidebar + Right Section */}
        <CustomBoxFullWidth
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" }, // ✅ mobile column, desktop row
            alignItems: "flex-start",
            gap: 2,
            width: "100%",
          }}
        >
          {/* ---------- Sidebar ---------- */}
          {/* ---------- Sidebar ---------- */}
          <Box
            sx={{
              width: { xs: "100%", md: "250px" },
              flexShrink: 0,

              // 👇 add this
              position: { xs: "static", md: "sticky" },
              top: { md: "120px" }, // distance from top while scrolling
              height: "fit-content",
            }}
          >
            <Sidebar
              catid={category_id}
              onSubCategorySelect={handleSubCategorySelect}
              module_id={moduleid}
            />
          </Box>

          {/* ---------- Right Section (Heading + Products) ---------- */}
          <Box sx={{ flexGrow: 1 }}>
            {/* Subcategory Heading */}
            <Box
              sx={{
                borderBottom: (theme) =>
                  `1px solid ${alpha(theme.palette.neutral[400], 0.4)}`,
                mb: 2,
                pb: 1,
              }}
            >
              <Typography
                variant="h5"
                fontWeight="600"
                sx={{ textTransform: "capitalize" }}
              >
                <SubCategoryLoader
                  catid={category_id}
                  subid={subcatid}
                  module_id={moduleid}
                />
              </Typography>
            </Box>

            {/* Product Grid */}
            <Box
              sx={{
                display: "grid",
                gap: 2,
              }}
            >
              {/* ============================================================
                  ✅ FIX: `module_id` prop pehle pass nahi ho raha tha —
                  ProductGridDynamic ke andar `module_id` hamesha undefined
                  aata tha, jiski wajah se API call me header
                  `moduleId: "undefined"` (string) jaata tha. Food module
                  zyaadatar category_ids se hi module resolve kar leta
                  tha isliye normal flow me chal jaata tha, lekin
                  pharmacy/baby-care jaise modules me yeh header zaroori
                  nikla aur empty result deta tha.
                  ============================================================ */}
              <ProductGridDynamic
                catid={category_id}
                subid={subcatid}
                module_id={moduleid} // 👈 YE LINE ADD KI GAYI HAI
                zoneIds={zoneIds}
              />
            </Box>
          </Box>
        </CustomBoxFullWidth>

        {refBoxHandler()}
      </CustomStackFullWidth>
    </CustomContainer>
  );
};

SearchResult.propTypes = {};

export default React.memo(SearchResult);