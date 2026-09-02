import { NoSsr } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

import React, { useEffect, useState } from "react";
import { getImageUrl } from "utils/CustomFunctions";

import MainLayout from "../../src/components/layout/MainLayout";
import SEO from "../../src/components/seo";
import CustomContainer from "../../src/components/container";
import DeliveryManComponent from "../../src/components/deliveryman-registration/DeliveryManComponent";
import { useDispatch, useSelector } from "react-redux";
import { useGetConfigData } from "../../src/api-manage/hooks/useGetConfigData";
import { setConfigData } from "../../src/redux/slices/configData";
const Index = () => {
  const dispatch = useDispatch();
  const { landingPageData, configData } = useSelector(
    (state) => state.configData
  );
  const { data: dataConfig, refetch: configRefetch } = useGetConfigData();

  const forceScrollToTop = () => {
    // console.log("Scrolling to top"); // Added log for debugging
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to top when the component mounts
    forceScrollToTop();
    
    // Additional scroll to top after a delay to ensure component is fully rendered
    const timeoutId = setTimeout(() => {
      forceScrollToTop();
    }, 200);
    
    // One more scroll to top after component is fully loaded
    const finalTimeoutId = setTimeout(() => {
      forceScrollToTop();
    }, 500);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(finalTimeoutId);
    };
  }, []);
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
        title={configData ? `Deliveryman Registration` : "Loading..."}
        image={`${getImageUrl(
          { value: configData?.logo_storage },
          "business_logo_url",
          configData
        )}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
        configData={configData}
      />
      <MainLayout configData={configData} landingPageData={landingPageData}>
        <NoSsr>
          <CustomContainer>
            <DeliveryManComponent
              configData={configData}
              landingPageData={landingPageData}
            />
          </CustomContainer>
        </NoSsr>
      </MainLayout>
    </>
  );
};

export default Index;
