// pages\index.js
import { LandingLayout } from "components/layout/LandingLayout";
import LandingPage from "../src/components/landing-page";
import CssBaseline from "@mui/material/CssBaseline";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setConfigData, setLandingPageData } from "redux/slices/configData";
import Router from "next/router";
import SEO from "../src/components/seo";
import useGetLandingPage from "../src/api-manage/hooks/react-query/useGetLandingPage";
import { useGetConfigData } from "../src/api-manage/hooks/useGetConfigData";

const Root = (props) => {
  const { configData, landingData } = props;
  const { data, refetch } = useGetLandingPage();
  const dispatch = useDispatch();
  const { data: dataConfig, refetch: configRefetch } = useGetConfigData();

  useEffect(() => {
    configRefetch();
    refetch();
  }, [configRefetch, refetch]);

  useEffect(() => {
    if (data) dispatch(setLandingPageData(data));
    if (dataConfig) {
      if (dataConfig.length === 0) Router.push("/404");
      else if (dataConfig?.maintenance_mode) Router.push("/maintainance");
      else dispatch(setConfigData(dataConfig));
    }
  }, [dataConfig, data, dispatch]);


  console.log("Landing Page Data:", data);
  console.log("Config Data:", dataConfig);
  return (
    <>
      <CssBaseline />
      <SEO
        title="Dealplex – Groceries, Food, Medicines & More Delivered Fast"
        description="Dealplex is your one-stop app for daily needs order groceries, food, medicines, travel & more. Fast delivery across India. Download now."
        keywords="dealplex, online shopping india, quick commerce, grocery delivery, food delivery, medicine delivery, travel booking, vehicle rental, dark store franchise, one stop shop india, dealplex app, shopdealplex, daily essentials delivery, hyperlocal delivery india"
        image={configData?.fav_icon_full_url || "/icons/favicon.png"}
        businessName={configData?.business_name || "Dealplex"}
        configData={configData}
        noIndex={false} // ✅ Root page hamesha indexable
      />
      {data && (
        <LandingLayout configData={landingData} landingPageData={data}>
          <div
            style={{
              backgroundColor: "white",
              minHeight: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              padding: "0",
            }}
          >
            <LandingPage configData={landingData} landingPageData={data} />
          </div>
        </LandingLayout>
      )}
    </>
  );
};

export default Root;

export const getServerSideProps = async (context) => {
  const { req, res, query } = context;
  const language = req.cookies?.languageSetting;

  // ✅ Root page pe koi bhi query param aaye → noindex + redirect
  const isFilteredURL =
    query.data_type || query.id || query.search || query.zone_id || query.name;

  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // ✅ Agar filtered URL hai toh "/" pe redirect karo
    if (isFilteredURL) {
      return {
        redirect: {
          destination: "/",
          permanent: false, // 302 redirect — Google samjhega
        },
      };
    }

    const configRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`,
      {
        method: "GET",
        headers: {
          "X-software-id": 33571750,
          "X-server": "server",
          "X-localization": language,
          origin: process.env.NEXT_CLIENT_HOST_URL,
        },
      },
    );

    if (!configRes.ok)
      throw new Error(`Config fetch failed: ${configRes.status}`);

    const config = await configRes.json();

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate",
    );

    return {
      props: {
        configData: config,
        landingData: config,
      },
    };
  } catch (error) {
    // console.error("Error fetching config:", error);
    return {
      props: {
        configData: null,
        landingData: null,
      },
    };
  }
};
