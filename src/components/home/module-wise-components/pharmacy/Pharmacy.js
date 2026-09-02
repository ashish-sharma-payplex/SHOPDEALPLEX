import { Grid, Typography, CircularProgress, Box, Step } from "@mui/material";
import useGetNewArrivalStores from "api-manage/hooks/react-query/store/useGetNewArrivalStores";
import { useGetVisitAgain } from "api-manage/hooks/react-query/useGetVisitAgain";
import PaidAds from "components/home/paid-ads";
import { getModuleId } from "helper-functions/getModuleId";
import { getToken } from "helper-functions/getToken";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useGetOtherBanners from "../../../../api-manage/hooks/react-query/useGetOtherBanners";
import CustomContainer from "../../../container";
import OrderDetailsModal from "../../../order-details-modal/OrderDetailsModal";
import Banners from "../../banners";
import BestReviewedItems from "../../best-reviewed-items";
import FeaturedCategories from "../../featured-categories";
import RunningCampaigns from "../../running-campaigns";
import Stores from "../../stores";
import VisitAgain from "../../visit-again";
import CommonConditions from "./common-conditions";
import FeaturedStores from "./featured-stores";
import PharmacyStaticBanners from "./pharmacy-banners/PharmacyStaticBanners";
import TopOffersNearMe from "components/home/top-offers-nearme";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import PharmacyBanner from "./pharmacyupdate/TopBanner";
import ExploreCategories from "./pharmacyupdate/categorySubcat";
import Steps from "./pharmacyupdate/processBanner";
import PharmacySession from "components/landing-page/pharmacysession";
import PharmacyPopular from "./pharmacyupdate/popularItemhere";
import PharmacyProductDynamicUI from "./pharmacyupdate/allcategoryProduct";
import VitaminGridLayout from "./pharmacyupdate/gridBanner";
import CommonConditions1 from "./pharmacyupdate/commoncondition";
import { maxWidth } from "@mui/system";
import Lottie from "lottie-react";
import loaderAnimation from "../../../../../public/Pharmacy.json";
import LocationScreen from "components/landing-page/LocationScreen";

const menus = ["All", "New", "Baby Care", "Womans Care", "Mens"];

const Pharmacy = ({ configData }) => {
  const router = useRouter();
  const page = router.query.page;
  const token = getToken();
  const [isVisited, setIsVisited] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const { orderDetailsModalOpen } = useSelector((state) => state.utilsData);
  const [storeData, setStoreData] = React.useState([]);
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

  const [zoneId, setZoneId] = useState(null);
  const [zoneLoading, setZoneLoading] = useState(true);

  // ✅ CHANGED — pehle [0] ko invalid maan ke null return karta tha,
  // jisse LocationScreen dikhta tha. Ab [0] ko bhi VALID maanta hai
  // aur "0" string return karta hai (LocationScreen kabhi nahi dikhega
  // is case mein — content hamesha load hoga, zone "0" ke sath).
  const getValidZoneId = () => {
    try {
      const raw = localStorage.getItem("zoneid");
      if (!raw) return null; // zoneid key hi missing hai — sirf yahi case LocationScreen dikhayega

      const parsed = JSON.parse(raw);

      // Agar already "0" string ya number 0 save hai (non-array), usko bhi valid maano
      if (!Array.isArray(parsed)) {
        if (parsed === "0" || parsed === 0) return "0";
        return null;
      }

      const flat = parsed.flat();

      if (flat.length === 0) return null; // genuinely empty — LocationScreen dikhega

      // ✅ [0] wala case ab "0" treat hoga, null nahi — LocationScreen skip
      if (flat.length === 1 && flat[0] === 0) return "0";

      return flat; // normal valid zone array
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

  // Image loading tracking
  useEffect(() => {
    const checkImages = () => {
      const images = document.querySelectorAll("img");
      const total = images.length;

      if (total === 0) {
        setImagesLoaded(true);
        return;
      }

      setTotalImages(total);
      let loaded = 0;

      const handleLoad = () => {
        loaded += 1;
        setLoadedCount(loaded);
        if (loaded === total) {
          setImagesLoaded(true);
        }
      };

      const handleError = () => {
        loaded += 1;
        setLoadedCount(loaded);
        if (loaded === total) {
          setImagesLoaded(true);
        }
      };

      images.forEach((img) => {
        if (img.complete) {
          handleLoad();
        } else {
          img.addEventListener("load", handleLoad);
          img.addEventListener("error", handleError);
        }
      });

      return () => {
        images.forEach((img) => {
          img.removeEventListener("load", handleLoad);
          img.removeEventListener("error", handleError);
        });
      };
    };

    // Check images after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(checkImages, 100);
    return () => clearTimeout(timeoutId);
  }, []);

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

  // Show loading state until images are loaded
  if (!imagesLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          width: "100%",
          // backgroundColor: '#f5f5f5',
          borderRadius: "8px",
          margin: "20px 0",
        }}
      >
        <Box sx={{ width: 150, height: 150, mb: 2 }}>
          <Lottie animationData={loaderAnimation} loop={true} />
        </Box>
        <Typography variant="h6" color="primary" gutterBottom>
          Loading Pharmacy Items...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalImages > 0
            ? `${Math.round((loadedCount / totalImages) * 100)}% Complete`
            : "Preparing your pharmacy experience..."}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <CustomStackFullWidth
        sx={{ width: "100%", alignItems: "center", bgcolor: "#ffffff" }}
      >
        <Grid
          item
          xs={12}
          sx={{
            alignItems: "center",
            maxWidth: "1280px",
            mt: { xs: "0px", sm: 8, md: 8 },
          }}
        >
          <CustomContainer>
            <PharmacyBanner />
          </CustomContainer>
        </Grid>

        {zoneLoading ? null : !zoneId ? (
          <Grid item xs={12}>
            <LocationScreen
              title="Trusted Pharmacy & Care, near you"
              subtext="Set your location to see nearby stores and get fast delivery."
            />
          </Grid>
        ) : (
          <Grid
            container
            spacing={1}
            sx={{ alignItems: "center", maxWidth: "1280px" }}
          >
            <Grid item xs={12} sx={{ marginTop: "10px" }}>
              <CustomContainer>
                <Steps />
              </CustomContainer>
            </Grid>
            {/* <Grid item xs={12} sx={{ marginTop: "10px" }}>
        <CustomContainer>
          <FeaturedCategories configData={configData} />
        </CustomContainer>
      </Grid> */}

            <Grid item xs={12} sx={{ marginTop: "10px" }} id="order-section">
              <CustomContainer>
                <ExploreCategories />
              </CustomContainer>
            </Grid>

            <Grid item xs={12} sx={{ marginTop: "10px" }}>
              <CustomContainer>
                <PharmacyPopular />
              </CustomContainer>
            </Grid>

            {/* <Grid item xs={12} sx={{ marginTop: "10px" }}>
          <CustomContainer>
            <VitaminGridLayout />
          </CustomContainer>
        </Grid> */}
            <Grid item xs={12}>
              <CustomContainer>
                <CommonConditions1 />
              </CustomContainer>
            </Grid>

            <Grid item xs={12} sx={{ marginTop: "10px" }}>
              <CustomContainer>
                <PharmacyProductDynamicUI />
              </CustomContainer>
            </Grid>

            {/* <Grid item xs={12}>
              <CustomContainer>
                <PharmacyStaticBanners />
              </CustomContainer>
            </Grid> */}
            {/* <Grid item xs={12}>
        <CustomContainer>
          <VisitAgain
            configData={configData}
            visitedStores={storeData}
            isVisited={isVisited}
            isFetching={visitIsFetching || isFetching}
          />
        </CustomContainer>
      </Grid> */}
            {/* <Grid item xs={12} marginLeft={5} paddingRight={10}>
        <CustomContainer>
          <CommonConditions title="Common Condition"/>
        </CustomContainer>
      </Grid> */}
            {/* <Grid item xs={12}>
              <CustomContainer>
                <PaidAds />
              </CustomContainer>
            </Grid> */}
            {/* <Grid item xs={12}>
          <CustomContainer>
            <BestReviewedItems
              menus={menus}
              title="Basic Medicine Nearby"
              bannerIsLoading={isLoading}
              url={`${data?.promotional_banner_url}/${data?.basic_section_nearby}`}
            />
          </CustomContainer>
        </Grid> */}



            {/* <Grid item xs={12}>
              <CustomContainer>
                <Banners />
              </CustomContainer>
            </Grid> */}


            {/* <Grid item xs={12}>
              <CustomContainer>
                <TopOffersNearMe title="Top offers near me" />
              </CustomContainer>
            </Grid> */}

            {/* <Grid item xs={12}>
        <CustomContainer>
          <FeaturedStores title="Featured Store" configData={configData} />
        </CustomContainer>
      </Grid> */}
            <Grid item xs={12}>
              <CustomContainer>
                <RunningCampaigns />
              </CustomContainer>
            </Grid>

            {/*<Grid item xs={12}>*/}
            {/*  <CustomContainer>*/}
            {/*    <RedirectBanner />*/}
            {/*  </CustomContainer>*/}
            {/*</Grid>*/}
            <Grid
              item
              xs={12}
              sx={{
                position: "sticky",
                top: { xs: "47px", md: "92px" },
                zIndex: 999,
              }}
            >
              {/* <CustomContainer>
          <Stores />
        </CustomContainer> */}
            </Grid>
            {orderDetailsModalOpen && !token && (
              <OrderDetailsModal
                orderDetailsModalOpen={orderDetailsModalOpen}
              />
            )}
          </Grid>
        )}
      </CustomStackFullWidth>
    </>
  );
};

Pharmacy.propTypes = {};

export default Pharmacy;
