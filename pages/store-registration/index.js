import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "../../src/components/layout/MainLayout";
import PolicyPage from "../../src/components/policy-page";
import useGetPolicyPage from "../../src/api-manage/hooks/react-query/useGetPolicyPage";
import { getServerSideProps } from "../index";
import SEO from "../../src/components/seo";
import { getImageUrl } from "utils/CustomFunctions";
import StoreRegistration from "../../src/components/store-resgistration";
import useScrollToTop from "../../src/api-manage/hooks/custom-hooks/useScrollToTop";
import { NoSsr } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useGetConfigData } from "../../src/api-manage/hooks/useGetConfigData";
import { setConfigData } from "../../src/redux/slices/configData";
import { useRouter } from "next/router";

const Index = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const { landingPageData, configData } = useSelector(
    (state) => state.configData
  );
  const { data: dataConfig, refetch: configRefetch } = useGetConfigData();
  
  // Use the custom scroll to top hook for route changes
  useScrollToTop();
  
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

  useEffect(() => {
    // Force scroll to top when the component mounts (instant scroll)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // Changed from "smooth" to "auto" for instant scroll
    });
    
    // Additional scroll insurance for browsers that might need it
    if (window.scrollY > 0) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);
  return (
    <>
      <CssBaseline />
      <SEO
        title={configData ? `Store registration` : "Loading..."}
        image={configData?.fav_icon_full_url}
        businessName={configData?.business_name}
      />
      <MainLayout configData={configData} landingPageData={landingPageData}>
        <NoSsr>
          <StoreRegistration />
        </NoSsr>
      </MainLayout>
    </>
  );
};

export default Index;
export { getServerSideProps };
