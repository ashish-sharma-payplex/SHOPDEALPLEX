// pages\home\index.js
import CssBaseline from "@mui/material/CssBaseline";
import Router from "next/router";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setConfigData } from "redux/slices/configData";
import MainLayout from "../../src/components/layout/MainLayout";
import ModuleWiseLayout from "../../src/components/module-wise-layout";
import ZoneGuard from "../../src/components/route-guard/ZoneGuard";
import SEO from "../../src/components/seo";
import { useGetConfigData } from "../../src/api-manage/hooks/useGetConfigData";
import useGetLandingPage from "../../src/api-manage/hooks/react-query/useGetLandingPage";
import { setLandingPageData } from "../../src/redux/slices/configData";

const MODULE_SEO = {
  grocery: {
    title:
      "Online Grocery Delivery in 10 Minutes | Fresh & Daily Essentials | Dealplex",
    description:
      "Order fresh groceries, vegetables, fruits, dairy & daily essentials online. Get ultra-fast delivery in 10 minutes from your nearest dark store.",
    keywords:
      "online grocery delivery, grocery delivery near me, fresh vegetables online, fruits delivery, dairy products online, instant grocery delivery, 10 minute grocery delivery, blinkit alternative, zepto alternative, bigbasket alternative, instamart alternative, grocery app india, buy groceries online, FMCG delivery, daily essentials online, grocery store near me, supermarket delivery, household items online, staples delivery india, dealplex grocery",
  },
  food: {
    title: "Food Delivery Online | Order from Restaurants Near You | Dealplex",
    description:
      "Craving something delicious? Order food from top restaurants near you on Dealplex. Fast delivery, live tracking & great offers. Download the app today.",
    keywords:
      "food delivery near me, online food order, restaurant delivery, order food online india, fast food delivery, zomato alternative, swiggy alternative, food delivery app, best food delivery, home food delivery, restaurant near me, biryani delivery, pizza delivery, burger delivery, tiffin delivery, cloud kitchen delivery, dealplex food, food order online, meal delivery, late night food delivery",
  },
  pharmacy: {
    title: "Online Medicine Delivery | Medicines & Health Products | Dealplex",
    description:
      "Order prescription medicines, OTC drugs & wellness products online. Get fast doorstep delivery. Upload your prescription and order now.",
    keywords:
      "online medicine delivery, order medicines online, medicine delivery near me, prescription medicine online, pharmacy delivery, netmeds alternative, pharmeasy alternative, 1mg alternative, health products online, wellness products delivery, OTC medicines online, vitamins supplements online, upload prescription online, generic medicines online, medicine app india, healthcare delivery, dealplex pharmacy, buy medicines online india, ayurvedic products online, personal care products online",
  },
  ecommerce: {
    title: "Online Shopping | Electronics, Fashion & More | Dealplex",
    description:
      "Shop online for electronics, fashion, home essentials and more. Best deals and fast delivery across India on Dealplex.",
    keywords:
      "online shopping india, buy electronics online, fashion online, home essentials, flipkart alternative, amazon alternative, meesho alternative, dealplex shop",
  },
  parcel: {
    title: "Instant Parcel & Courier Delivery Near You | Dealplex",
    description:
      "Send parcels, documents & packages instantly with Dealplex. Same-day courier delivery at your doorstep. Book a delivery partner in minutes. Fast & reliable.",
    keywords:
      "parcel delivery near me, instant courier service, same day delivery india, send parcel online, courier booking app, porter alternative, dunzo alternative, package delivery india, document delivery service, bike courier near me, instant delivery app, on demand courier india, courier service india, send package online, luggage transport india, parcel booking online, local courier service, hyperlocal delivery india, intracity courier, express delivery india, dealplex parcel",
  },
  rental: {
    title: "Self Drive Car & Bike Rental Near You | Dealplex",
    description:
      "Rent self-drive cars, bikes & scooters near you. Affordable hourly, daily & monthly plans. No driver needed. Book your vehicle on Dealplex now!",
    keywords:
      "car rental near me, self drive car rental, bike rental near me, vehicle rental india, zoomcar alternative, ola rental alternative, rent a car india, scooter rental, two wheeler rental, affordable car rental, hourly car rental, daily car rental, monthly car rental, outstation car rental, electric vehicle rental, dealplex rental, cab booking india, car hire india, drive yourself car rental, vehicle booking online",
  },
  default: {
    title: "Dealplex – Groceries, Food, Medicines & More Delivered Fast",
    description:
      "Dealplex is your one-stop app for daily needs – order groceries, food, medicines, travel & more. Fast delivery across India. Download now.",
    keywords:
      "dealplex, online shopping india, quick commerce, grocery delivery, food delivery, medicine delivery, travel booking, vehicle rental, dark store franchise, one stop shop india, dealplex app, shopdealplex, daily essentials delivery, hyperlocal delivery india",
  },
};

const Home = ({
  seoData = MODULE_SEO["default"],
  configData: serverConfigData,
  shouldIndex = true, // ✅ NEW
}) => {
  const dispatch = useDispatch();
  const { data: dataConfig, refetch: configRefetch } = useGetConfigData();
  const { data: dataLanding, refetch: refetchLanding } = useGetLandingPage();

  const { landingPageData, configData } = useSelector(
    (state) => state.configData,
  );

  useEffect(() => {
    if (!configData) configRefetch();
  }, [configData, configRefetch]);

  useEffect(() => {
    if (!landingPageData) refetchLanding();
  }, [landingPageData, refetchLanding]);

  useEffect(() => {
    if (dataConfig) {
      if (dataConfig.length === 0) Router.push("/404");
      else if (dataConfig?.maintenance_mode) Router.push("/maintainance");
      else dispatch(setConfigData(dataConfig));
    }
  }, [dataConfig, dispatch]);

  return (
    <>
      <CssBaseline />
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        image={serverConfigData?.fav_icon_full_url || "/icons/favIcon.png"}
        businessName={serverConfigData?.business_name || "Dealplex"}
        configData={serverConfigData}
        noIndex={!shouldIndex} // ✅ NEW
      />
      <MainLayout configData={configData} landingPageData={landingPageData}>
        <ModuleWiseLayout
          configData={configData}
          landingPageData={landingPageData}
        />
      </MainLayout>
    </>
  );
};

export default Home;

Home.getLayout = (page) => <ZoneGuard>{page}</ZoneGuard>;

export const getServerSideProps = async (context) => {
  const { query } = context;

  const moduleType = query?.module?.toLowerCase() || "default";
  const seoData = MODULE_SEO[moduleType] || MODULE_SEO["default"];

  const isFilteredURL =
    query.data_type || query.id || query.search || query.zone_id || query.name;

  return {
    props: {
      seoData,
      shouldIndex: !isFilteredURL,
    },
  };


  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

    const configData = configRes.ok ? await configRes.json() : null;

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate",
    );

    // ✅ Header level pe bhi noindex set karo (double protection)
    if (isFilteredURL) {
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
    }

    return {
      props: {
        seoData,
        configData: configData || null,
        shouldIndex: !isFilteredURL, // ✅ NEW — meta tag ke liye
      },
    };
  } catch (error) {
    // console.error("Error fetching config:", error);
    return {
      props: {
        seoData,
        configData: null,
        shouldIndex: false,
      },
    };
  }
};
