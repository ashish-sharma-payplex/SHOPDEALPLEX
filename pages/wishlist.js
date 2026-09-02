// pages\wishlist.js
import React, { useEffect } from "react";
import WishlistPage from "../src/components/home/wishlistpage";
import SecondNavBar from "../src/components/header/second-navbar/SecondNavbar";
import FooterMiddle from "../src/components/footer/footer-middle/FooterMiddle";
import { useSelector, useDispatch } from "react-redux";
import { setConfigData } from "src/redux/slices/configData";
import { useGetConfigData } from "src/api-manage/hooks/useGetConfigData";
import Router from "next/router";

const Wishlist = () => {
  const dispatch = useDispatch();
  const { configData } = useSelector((state) => state.configData);

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
      <SecondNavBar sx={{ boxShadow: "none" }} configData={configData} />
      <WishlistPage />
      <FooterMiddle configData={configData} />
    </>
  );
};

export default Wishlist;
