import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "../../src/components/layout/MainLayout";
import PolicyPage from "../../src/components/policy-page";
import useGetPolicyPage from "../../src/api-manage/hooks/react-query/useGetPolicyPage";
import SEO from "../../src/components/seo";
import { setLandingPageData, setConfigData } from "src/redux/slices/configData";
import { useSelector, useDispatch } from "react-redux";
import { useGetConfigData } from "src/api-manage/hooks/useGetConfigData";
import useGetLandingPage from "../../src/api-manage/hooks/react-query/useGetLandingPage";
import { getImageUrl } from "utils/CustomFunctions";

const Index = ({ configData, landingPageData }) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const configDataFromStore = useSelector((state) => state.configData.configData);
  const landingPageDataFromStore = useSelector((state) => state.configData.landingPageData);

  // Fetch refund policy data
  const { data, refetch, isFetching } = useGetPolicyPage(
    "/api/v1/refund-policy"
  );

  // Refetch data on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  const { data: dataLandingPage, refetch: refetchLandingPage } = useGetLandingPage();
  const { data: dataConfig, refetch: refetchConfig } = useGetConfigData();

  useEffect(() => {
    refetchLandingPage();
    refetchConfig();
  }, [refetchLandingPage, refetchConfig]);

  useEffect(() => {
    dispatch(setLandingPageData(dataLandingPage));
    if (dataConfig) {
      if (dataConfig.length === 0) {
        Router.push("/404");
      } else if (dataConfig?.maintenance_mode) {
        Router.push("/maintainance");
      } else {
        dispatch(setConfigData(dataConfig));
      }
    }
  }, [dataConfig, dataLandingPage, dispatch]);

  // Render fallback UI if configData is missing
  if (!configData) {
    return <div>{t("Configuration data is not available")}</div>;
  }

  return (
    <>
      <CssBaseline />
      <SEO
        title="Refund Policy"
        image={`${getImageUrl(
          { value: configData?.logo_storage },
          "business_logo_url",
          configData
        )}/${configData?.fav_icon || ""}`}
        businessName={configData?.business_name || ""}
      />
      <MainLayout configData={configData} landingPageData={landingPageData}>
        <PolicyPage
          data={data}
          title={t("Return, Refund & Shipping Policy")}
          isFetching={isFetching}
        />
      </MainLayout>
    </>
  );
};

export default Index;

export const getStaticProps = async () => {
  try {
    // Fetch configuration data
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
        configData: config, // Pass configuration data as props
        landingPageData: {}, // Default landing page data
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    // console.error("Error fetching configuration data:", error);

    return {
      props: {
        configData: null, // Pass null if fetching fails
        landingPageData: {}, // Default landing page data
      },
      revalidate: 3600,
    };
  }
};
