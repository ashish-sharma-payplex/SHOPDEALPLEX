import React, { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "../../src/components/layout/MainLayout";
import AuthGuard from "../../src/components/route-guard/AuthGuard";
import { useRouter } from "next/router";
import RateAndReview from "../../src/components/review/RateAndReview";
import SEO from "../../src/components/seo";
import CustomContainer from "../../src/components/container";
import { getImageUrl } from "utils/CustomFunctions";
import { useSelector, useDispatch } from "react-redux";
import { setConfigData } from "src/redux/slices/configData";
import { useGetConfigData } from "src/api-manage/hooks/useGetConfigData";
import Router from "next/router";

const Index = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { configData } = useSelector((state) => state.configData);

  // ✅ Fetch config data client-side instead of reusing the root page's
  // getServerSideProps (that one redirects to "/" whenever the request has
  // a "query.id" — which every visit to this dynamic [id] route has, so it
  // was redirecting this page back to home on every click).
  const { data: dataConfig, refetch: refetchConfig } = useGetConfigData();

  useEffect(() => {
    refetchConfig();
  }, [refetchConfig]);

  useEffect(() => {
    if (dataConfig) {
      if (dataConfig.length === 0) {
        Router.push("/404");
      } else if (dataConfig?.maintenance_mode) {
        Router.push("/maintainance");
      } else {
        dispatch(setConfigData(dataConfig));
      }
    }
  }, [dataConfig, dispatch]);

  return (
    <>
      <SEO
        title={configData ? `Rate and Review` : "Loading..."}
        image={`${getImageUrl(
          { value: configData?.logo_storage },
          "business_logo_url",
          configData,
        )}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
      />
      <CssBaseline />
      <AuthGuard from={router.pathname.replace("/", "")}>
        <MainLayout configData={configData}>
          <CustomContainer>
            <RateAndReview />
          </CustomContainer>
        </MainLayout>
      </AuthGuard>
    </>
  );
};

export default Index;
