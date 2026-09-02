// pages\rental\checkout\index.js
import React, { Suspense, lazy, useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import SEO from "../../../src/components/seo";
import MainLayout from "../../../src/components/layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import { useGetConfigData } from "../../../src/api-manage/hooks/useGetConfigData";
import { setConfigData } from "../../../src/redux/slices/configData";
import { NoSsr } from "@mui/material";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// ✅ Dynamically import LottieLoader (SSR safe)
const LottieLoader = dynamic(
  () => import("../../../src/components/home/module-wise-components/rental/components/rental-checkout/RentalCheckoutPage"),
  { ssr: false }
);

// ✅ Lazy load checkout page
const RentalCheckoutPage = lazy(() =>
  import(
    "../../../src/components/home/module-wise-components/rental/components/rental-checkout/RentalCheckoutPage"
  )
);

const Index = () => {

const router = useRouter(); // agar nahi hai toh add karo import mein

useEffect(() => {
  const handleRouteComplete = () => {
    // window try karo
    window.scrollTo({ top: 0, behavior: "instant" });
    // Layout container bhi scroll karo (agar MainLayout ka scroll alag hai)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    // koi bhi scrollable div ho toh usse bhi
    const scrollContainer = document.querySelector("#main-scroll") 
      || document.querySelector("main") 
      || document.querySelector(".layout-scroll");
    if (scrollContainer) scrollContainer.scrollTop = 0;
  };

  handleRouteComplete(); // mount pe bhi chalao
  router.events.on("routeChangeComplete", handleRouteComplete);
  return () => router.events.off("routeChangeComplete", handleRouteComplete);
}, []);

  const dispatch = useDispatch();
  const { landingPageData, configData } = useSelector(
    (state) => state.configData
  );

  const { data: dataConfig, refetch: configRefetch } =
    useGetConfigData();

  const bookingData = useSelector(
    (state) => state.configData.bookingData
  );

  useEffect(() => {
    if (!configData) {
      configRefetch();
    }
  }, [configData]);

  useEffect(() => {
    if (dataConfig) {
      dispatch(setConfigData(dataConfig));
    }
  }, [dataConfig]);

  return (
    <>
      <CssBaseline />

      <SEO
        title={configData ? "Checkout" : "Loading..."}
        image={configData?.fav_icon_full_url}
        businessName={configData?.business_name}
        configData={configData}
      />

      <MainLayout
        configData={configData}
        landingPageData={landingPageData}
      >
        <NoSsr>
          <Suspense
            fallback={<LottieLoader height={250} fullScreen />}
          >
            <RentalCheckoutPage
              bookingData={bookingData}
              sx={{ mx: 6 }}
            />
          </Suspense>
        </NoSsr>
      </MainLayout>
    </>
  );
};

export default Index;
