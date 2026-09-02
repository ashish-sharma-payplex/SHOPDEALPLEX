import { useTranslation } from "react-i18next";
import useGetPolicyPage from "../../src/api-manage/hooks/react-query/useGetPolicyPage";
import React, { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "../../src/components/layout/MainLayout";
import PolicyPage from "../../src/components/policy-page";
import SEO from "../../src/components/seo";
import { getImageUrl } from "utils/CustomFunctions";
import { setLandingPageData, setConfigData } from "src/redux/slices/configData";
import { useSelector, useDispatch } from "react-redux";
import { useGetConfigData } from "src/api-manage/hooks/useGetConfigData";
import useGetLandingPage from "../../src/api-manage/hooks/react-query/useGetLandingPage";
import { useRouter } from "next/router";
const Index = ({ configData, landingPageData }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, refetch, isFetching } = useGetPolicyPage("/api/v1/about-us");

  const dispatch = useDispatch();
  const configDataFromStore = useSelector((state) => state.configData.configData);
  const landingPageDataFromStore = useSelector((state) => state.configData.landingPageData);

  const { data: dataLandingPage, refetch: refetchLandingPage } = useGetLandingPage();
  const { data: dataConfig, refetch: refetchConfig } = useGetConfigData();

  useEffect(() => {
    if (refetch) refetch();
  }, [refetch]);

  useEffect(() => {
    refetchLandingPage();
    refetchConfig();
  }, [refetchLandingPage, refetchConfig]);

  useEffect(() => {
    dispatch(setLandingPageData(dataLandingPage));
    if (dataConfig) {
      if (dataConfig.length === 0) {
        router.push("/404");
      } else if (dataConfig?.maintenance_mode) {
        router.push("/maintainance");
      } else {
        dispatch(setConfigData(dataConfig));
      }
    }
  }, [dataConfig, dataLandingPage, dispatch, router]);

  useEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    // Fallback: scroll to top again after a short delay in case of async content
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  if (!configData) {
    return <div>{t("Configuration data is not available")}</div>;
  }

  return (
    <>
      <CssBaseline />
      <SEO
        image={`${getImageUrl(
          { value: configData?.logo_storage },
          "business_logo_url",
          configData
        )}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
      />
      <MainLayout configData={configData} landingPageData={landingPageData}>
        <PolicyPage data={data} title={t("About us")} isFetching={isFetching} />
      </MainLayout>
    </>
  );
};

export default Index;

export const getStaticProps = async () => {
  try {
    const configRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`,
      {
        method: "GET",
        headers: {
          "X-software-id": 33571750,
          "X-server": "server",
          origin: process.env.NEXT_CLIENT_HOST_URL,
        },
      }
    );

    if (!configRes.ok) {
      throw new Error(`Failed to fetch config: ${configRes.statusText}`);
    }

    const config = await configRes.json();

    return {
      props: {
        configData: config,
      },
      revalidate: 3600,
    };
  } catch (error) {
    // console.error("Error fetching config data:", error);

    return {
      props: {
        configData: null,
      },
      revalidate: 3600,
    };
  }
};
