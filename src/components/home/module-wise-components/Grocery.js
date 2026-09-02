// src\components\home\module-wise-components\Grocery.js
import { Grid, Box, CircularProgress, Typography } from "@mui/material";
import useGetNewArrivalStores from "api-manage/hooks/react-query/store/useGetNewArrivalStores";
import { useGetVisitAgain } from "api-manage/hooks/react-query/useGetVisitAgain";
import PaidAds from "components/home/paid-ads";
import { getModuleId } from "helper-functions/getModuleId";
import { getToken } from "helper-functions/getToken";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useGetOtherBanners from "../../../api-manage/hooks/react-query/useGetOtherBanners";
import { IsSmallScreen } from "utils/CommonValues";
import CustomContainer from "../../container";
import OrderDetailsModal from "../../order-details-modal/OrderDetailsModal";
import PromotionalBanner from "../PromotionalBanner";
import Banners from "../banners";
import BestReviewedItems from "../best-reviewed-items";
import Coupons from "../coupons";
import FeaturedCategories from "../featured-categories";
import LoveItem from "../love-item";
import NewArrivalStores from "../new-arrival-stores";
import PopularItemsNearby from "../popular-items-nearby";
import RunningCampaigns from "../running-campaigns";
import SpecialFoodOffers from "../special-food-offers";
import Stores from "../stores";
import VisitAgain from "../visit-again";
import PharmacyStaticBanners from "./pharmacy/pharmacy-banners/PharmacyStaticBanners";
import TopOffersNearMe from "../top-offers-nearme";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import CategoryBanners from "../../../components/home/module-wise-components/Grocerysubcomponent/subBanner";
import HotDeals from "./Grocerysubcomponent/hotDeals";
import AllCategories from "./Grocerysubcomponent/AllCategory";
import GroceryDynamicUI from "./Grocerysubcomponent/CategoryProduct";
import Perticular from "./Grocerysubcomponent/PerticularProduct";
import GroceryBanner from "./Grocerysubcomponent/subBanner";
import Lottie from "lottie-react";
import loaderAnimation from "../../../../public/Loading screen grocery.json"; // adjust path if needed
import LocationScreen from "components/landing-page/LocationScreen";

const menus = ["All", "Beauty", "Bread & Juice", "Drinks", "Milks"];
const Grocery = (props) => {
  const { configData } = props;
  const router = useRouter();
  const page = router.query.page;
  const token = getToken();
  const [isVisited, setIsVisited] = useState(false);
  const [storeData, setStoreData] = React.useState([]);
  // const [imagesLoaded, setImagesLoaded] = useState(false);
  // const [loadedCount, setLoadedCount] = useState(0);
  // const [totalImages, setTotalImages] = useState(0);
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

  const { orderDetailsModalOpen, orderInformation } = useSelector(
    (state) => state.utilsData,
  );
  const { data, refetch, isLoading } = useGetOtherBanners();
  const {
    data: visitedStores,
    refetch: refetchVisitAgain,
    isFetching: visitIsFetching,
  } = useGetVisitAgain();
  const {
    data: newStore,
    refetch: newStoreRefetch,
    isFetching,
  } = useGetNewArrivalStores({
    type: "all",
  });

  // ✅ GLOBAL COMBINED LOADING STATE
  // const pageIsLoading =
  //   !imagesLoaded || isLoading || isFetching || visitIsFetching;

  // Image loading tracking
  // useEffect(() => {
  //   const checkImages = () => {
  //     const images = document.querySelectorAll("img");
  //     const total = images.length;

  //     if (total === 0) {
  //       setImagesLoaded(true);
  //       return;
  //     }

  //     setTotalImages(total);
  //     let loaded = 0;

  //     const handleLoad = () => {
  //       loaded += 1;
  //       setLoadedCount(loaded);
  //       if (loaded === total) {
  //         setImagesLoaded(true);
  //       }
  //     };

  //     const handleError = () => {
  //       loaded += 1;
  //       setLoadedCount(loaded);
  //       if (loaded === total) {
  //         setImagesLoaded(true);
  //       }
  //     };

  //     images.forEach((img) => {
  //       if (img.complete) {
  //         handleLoad();
  //       } else {
  //         img.addEventListener("load", handleLoad);
  //         img.addEventListener("error", handleError);
  //       }
  //     });

  //     return () => {
  //       images.forEach((img) => {
  //         img.removeEventListener("load", handleLoad);
  //         img.removeEventListener("error", handleError);
  //       });
  //     };
  //   };

  //   // Check images after a small delay to ensure DOM is ready
  //   const timeoutId = setTimeout(checkImages, 100);
  //   return () => clearTimeout(timeoutId);
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refetch();
        if (token) {
          await refetchVisitAgain();
        }
        newStoreRefetch();
      } catch (error) {
        // console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (visitedStores?.length > 0 || newStore?.stores?.length > 0) {
      if (visitedStores?.length > 0 && visitedStores) {
        setStoreData(visitedStores);
        setIsVisited(true);
      } else {
        if (newStore?.stores) {
          setStoreData(newStore?.stores);
        }
      }
    }
  }, [visitedStores, newStore?.stores, getModuleId()]);

  useEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Additional scroll to top after a delay to ensure component is fully rendered
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);

    // One more scroll to top after component is fully loaded
    const finalTimeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(finalTimeoutId);
    };
  }, [page]);

  // 🔵 GLOBAL LOADING UI FOR ENTIRE PAGE
  // if (pageIsLoading) {
  //   return (
  //     <Box
  //       sx={{
  //         display: "flex",
  //         flexDirection: "column",
  //         alignItems: "center",
  //         justifyContent: "center",
  //         minHeight: "400px",
  //         width: "100%",
  //         backgroundColor: "#ffffff",
  //         borderRadius: "8px",
  //         margin: "20px 0",
  //       }}
  //     >
  //       <Box sx={{ width: 150, height: 150, mb: 2 }}>
  //         <Lottie animationData={loaderAnimation} loop={true} />
  //       </Box>

  //       {/* <Typography variant="h6" color="primary" gutterBottom>
  //         Loading Grocery Items...
  //       </Typography>
  //       <Typography variant="body2" color="text.secondary">
  //         {totalImages > 0 ? `${Math.round((loadedCount / totalImages) * 100)}% Complete` : 'Preparing your shopping experience...'}
  //       </Typography> */}
  //     </Box>
  //   );
  // }

  return (
    <>
      <CustomStackFullWidth
        sx={{
          width: "100%",
          px: "5%",
          alignItems: "center !important",
          justifyContent: "center !important",
          alignContent: "center !important",
          bgcolor: "#ffffff",
        }}
      >
        <Grid
          container
          spacing={1}
          sx={{
            maxWidth: "1280px !important",
            width: "100%",
            alignContent: "center !important",
          }}
        >
          {/* <Grid item xs={12} sx={{ marginTop: { xs: "-10px", sm: "10px" }  }}>
        <CustomContainer>
          <FeaturedCategories configData={configData} />
        </CustomContainer>
      </Grid> */}

          <Grid item xs={12}>
            <GroceryBanner />
          </Grid>

          {zoneLoading ? null : !zoneId ? (
            // ❌ NO ZONE → show LocationScreen
            <Grid item xs={12}>
              <LocationScreen
                title="Fresh Groceries, near you"
                subtext="Set your location to see nearby stores and get fast delivery."
              />
            </Grid>
          ) : (
            <>
              <Grid
                item
                xs={12}
                sx={{ marginTop: { xs: "-10px", sm: "10px" } }}
                id="order-section"
              >
                <AllCategories />
              </Grid>

              <Grid
                item
                xs={12}
                sx={{ marginTop: { xs: "-10px", sm: "10px" } }}
              >
                <HotDeals />
              </Grid>

              <Grid
                item
                xs={12}
                sx={{ marginTop: { xs: "-10px", sm: "10px" } }}
              >
                <GroceryDynamicUI />
              </Grid>

              {/* 
      <Grid item xs={12} sx={{ marginTop: { xs: "-10px", sm: "10px" }  }}>
        <Perticular/>
      </Grid> */}

              {/* <Grid item xs={12} mb={3} sx={{ display: token ? "" : "none" }}>
        {IsSmallScreen() ? (
          <VisitAgain
            configData={configData}
            isVisited={isVisited}
            visitedStores={storeData}
          />
        ) : (
          <CustomContainer>
            <VisitAgain
              configData={configData}
              isVisited={isVisited}
              visitedStores={storeData}
              isFetching={isFetching || visitIsFetching}
            />
          </CustomContainer>
        )}
      </Grid>     
        <Grid item xs={12}>
        <CustomContainer>
          <SpecialFoodOffers />  
        </CustomContainer>
      </Grid> */}

              {/* <Grid item xs={12}>
        <CustomContainer>
          <BestReviewedItems
            menus={menus}
            title="Best Reviewed Items"
            bannerIsLoading={isLoading}
            info={data}
          />
        </CustomContainer>
      </Grid> */}
              {/* <Grid item xs={12} mb={3}>
        <CustomContainer>
          <PaidAds />
        </CustomContainer>
      </Grid>
       */}
              {/* <Grid item xs={12}>
        <CustomContainer>
          <PharmacyStaticBanners />  
        </CustomContainer>
      </Grid>
     */}
              {/* <Grid item xs={12}>
        <CustomContainer>
          <TopOffersNearMe title="Top offers near me" /> 
        </CustomContainer>
      </Grid>
      <Grid item xs={12}>
        <CustomContainer>
          <Banners />   
        </CustomContainer>
      </Grid> */}

              {/* <Grid item xs={12} mt="10px">
        <CustomContainer>
          <RunningCampaigns />
        </CustomContainer>
      </Grid> */}




              {/* <Grid item xs={12}>
                <CustomContainer>
                  <LoveItem />
                </CustomContainer>
              </Grid>

              <Grid item xs={12} mb={2}>
                {IsSmallScreen() ? (
                  <Coupons />
                ) : (
                  <CustomContainer>
                    <Coupons />
                  </CustomContainer>
                )}
              </Grid> */}




              {/* <Grid item xs={12}>
        <CustomContainer>
          <NewArrivalStores />
        </CustomContainer>
      </Grid> */}

              <Grid item xs={12}>
                <CustomContainer></CustomContainer>
              </Grid>

              {/* <Grid item xs={12}>
        <CustomContainer>
          <Stores />
        </CustomContainer>
      </Grid> */}

              {orderDetailsModalOpen && !token && (
                <OrderDetailsModal
                  orderDetailsModalOpen={orderDetailsModalOpen}
                  orderInformation={orderInformation}
                />
              )}
            </>
          )}
        </Grid>
      </CustomStackFullWidth>
    </>
  );
};

Grocery.propTypes = {};

export default Grocery;
