// DynamicFavicon.js
import React from "react";
import Head from "next/head";
import { useSelector } from "react-redux";

const DynamicFavicon = () => {
  const configData = useSelector((state) => state.configData.configData);
  const faviconUrl = configData?.fav_icon_full_url;

  // Jab tak API se data nahi aata, fallback use karo
  const favicon = faviconUrl || "/icons/favIcon.png";

  return (
    <Head>
      <link rel="icon" href={favicon} key="favicon-default" />
      <link rel="icon" type="image/png" sizes="32x32" href={favicon} key="favicon-32" />
      <link rel="icon" type="image/png" sizes="16x16" href={favicon} key="favicon-16" />
      <link rel="apple-touch-icon" sizes="180x180" href={favicon} key="favicon-apple" />
    </Head>
  );
};

export default DynamicFavicon;