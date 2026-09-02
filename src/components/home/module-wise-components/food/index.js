// src\components\home\module-wise-components\food\index.js
import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  CircularProgress,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

import useGetOtherBanners from "../../../../api-manage/hooks/react-query/useGetOtherBanners";
import { useGetVisitAgain } from "api-manage/hooks/react-query/useGetVisitAgain";
import useGetNewArrivalStores from "api-manage/hooks/react-query/store/useGetNewArrivalStores";
import { getToken } from "../../../../helper-functions/getToken";
import { getModuleId } from "helper-functions/getModuleId";

import CustomContainer from "../../../container";
import OrderDetailsModal from "../../../order-details-modal/OrderDetailsModal";
import Banners from "../../banners";
import LoveItem from "../../love-item";
import RunningCampaigns from "../../running-campaigns";
import TopBannerLoader from "./foodUpdateComp/TopBannerFood";
import AllFoodCategories from "./foodUpdateComp/allfoodcat";
import RecommendedRestaurant from "./foodUpdateComp/recomandedResto";
import SpecialOffersCompleteLayout from "./foodUpdateComp/specialofferSession";
import TopOffers from "./foodUpdateComp/TopOffers";
import TopReviewedItemsLayout from "./foodUpdateComp/TopReview";
import RestaurantsGrid1 from "./foodUpdateComp/Restorentdata";
import FoodDynamicUI from "./foodUpdateComp/allfoodhereget";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import FoodPopular from "./foodUpdateComp/popfoodhere";
import Lottie from "lottie-react";
import loaderAnimation from "../../../../../public/Food loader.json";
import LocationScreen from "components/landing-page/LocationScreen";
import Head from "next/head";

// --- Loader Component ---
const FoodLoader = ({ loadedCount, totalImages }) => {
  const percentage =
    totalImages > 0 ? Math.round((loadedCount / totalImages) * 100) : 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        width: "100%",
        // backgroundColor: "#fff",
        borderRadius: 2,
        margin: "20px 0",
        padding: 2,
      }}
    >
      <Box sx={{ width: 150, height: 150, mb: 2 }}>
        <Lottie animationData={loaderAnimation} loop={true} />
      </Box>

      {/* <Typography variant="h5" sx={{ color: "#FF4500", mt: 2, fontWeight: "bold" }}>
        Preparing Your Feast...
      </Typography> */}

      {/* <Typography variant="body1" color="text.secondary">
        {totalImages > 0 ? `Loading ${percentage}% Complete` : "Gathering the best recipes..."}
      </Typography> */}
    </Box>
  );
};

// --- FoodModule Component ---
const FoodModule = ({ configData }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const router = useRouter();
  const page = router.query.page;

  const token = getToken();
  const [isVisited, setIsVisited] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const { orderDetailsModalOpen } = useSelector((state) => state.utilsData);

  const { data, refetch } = useGetOtherBanners();
  const {
    data: visitedStores,
    refetch: refetchVisitAgain,
    isFetching: visitIsFetching,
  } = useGetVisitAgain();
  const {
    data: newStore,
    refetch: newStoreRefetch,
    isFetching,
  } = useGetNewArrivalStores({ type: "all" });

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [zoneId, setZoneId] = useState(null);
  const [zoneLoading, setZoneLoading] = useState(true);

  const getValidZoneId = () => {
    try {
      const raw = localStorage.getItem("zoneid");
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;

      const flat = parsed.flat();

      if (flat.length === 0) return null;
      if (flat.length === 1 && flat[0] === 0) return null;

      return flat;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const checkZone = () => {
      const zone = getValidZoneId();
      setZoneId(zone);
      setZoneLoading(false);
    };

    checkZone();

    // 🔥 Important: reactively update when localStorage changes
    window.addEventListener("storage", checkZone);

    return () => {
      window.removeEventListener("storage", checkZone);
    };
  }, []);

  // Track images loaded
  useEffect(() => {
    const images = document.querySelectorAll("img");
    const total = images.length;
    setTotalImages(total);

    if (total === 0) {
      setImagesLoaded(true);
      return;
    }

    let loaded = 0;
    const handleLoad = () => {
      loaded += 1;
      setLoadedCount(loaded);
      if (loaded === total) setImagesLoaded(true);
    };
    images.forEach((img) => {
      if (img.complete) handleLoad();
      else img.addEventListener("load", handleLoad);
    });

    return () => {
      images.forEach((img) => img.removeEventListener("load", handleLoad));
    };
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await refetch();
        if (token) await refetchVisitAgain();
        newStoreRefetch();
      } catch (error) {
        // console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [token]);

  // Update store data
  useEffect(() => {
    if (visitedStores?.length > 0 || newStore?.stores?.length > 0) {
      if (visitedStores?.length > 0) {
        setStoreData(visitedStores);
        setIsVisited(true);
      } else {
        setStoreData(newStore?.stores || []);
      }
    }
  }, [visitedStores, newStore?.stores, getModuleId()]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const handleCategorySelect = (category) => setSelectedCategory(category);

  if (!imagesLoaded)
    return <FoodLoader loadedCount={loadedCount} totalImages={totalImages} />;

  return (
    <>
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#ffffff" }}>
        {" "}
        {/* full page white background */}
        <CustomStackFullWidth
          sx={{
            width: "100%",
            pt: isSmallScreen ? 7 : 8,
            alignItems: "center",
          }}
        >
          <Grid container spacing={2} sx={{ maxWidth: 1280 }}>
            {/* Top Banner */}
            <Grid item xs={12}>
              <CustomContainer>
                <TopBannerLoader />
              </CustomContainer>
            </Grid>

            {zoneLoading ? null : !zoneId ? (
              <Grid item xs={12}>
                <LocationScreen
                  title="Craving Something ? It’s near you"
                  subtext="Set your location to see nearby stores and get fast delivery."
                />
              </Grid>
            ) : (
              <>
                <Grid item xs={12}>
                  <CustomContainer>
                    <AllFoodCategories />
                  </CustomContainer>
                </Grid>

                <Grid item xs={12}>
                  <CustomContainer>
                    <FoodPopular />
                  </CustomContainer>
                </Grid>

                <Grid item xs={12}>
                  <CustomContainer>
                    <RecommendedRestaurant />
                  </CustomContainer>
                </Grid>

                <Grid item xs={12}>
                  <CustomContainer>
                    <SpecialOffersCompleteLayout />
                  </CustomContainer>
                </Grid>

                <Grid item xs={12}>
                  <CustomContainer>
                    <TopReviewedItemsLayout />
                  </CustomContainer>
                </Grid>

                <Grid item xs={12}>
                  <CustomContainer>
                    <RestaurantsGrid1 />
                  </CustomContainer>
                </Grid>

                <Grid item xs={12}>
                  <CustomContainer>
                    <FoodDynamicUI />
                  </CustomContainer>
                </Grid>

                <Grid item xs={12}>
                  <CustomContainer>
                    <Banners />
                  </CustomContainer>
                </Grid>

                <Grid item xs={12}>
                  <CustomContainer>
                    <LoveItem />
                  </CustomContainer>
                </Grid>

                <Grid item xs={12}>
                  <CustomContainer>
                    <RunningCampaigns />
                  </CustomContainer>
                </Grid>
              </>
            )}
          </Grid>

          {orderDetailsModalOpen && !token && (
            <OrderDetailsModal orderDetailsModalOpen={orderDetailsModalOpen} />
          )}
        </CustomStackFullWidth>
      </Box>
    </>
  );
};

export default FoodModule;
