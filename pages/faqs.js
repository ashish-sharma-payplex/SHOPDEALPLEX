import React from "react";
import Career from "src/components/home/careers/careers";
import FAq from "../pages/FAQ/faq";
import TopNavbar from "../src/components/footernavbar/TopNavbar";
import Footermiddle from "../src/components/footer/footer-middle/FooterMiddle";
import BottomFooter from "../src/components/footer/BottomFooter";
import useGetLandingPage from "src/api-manage/hooks/react-query/useGetLandingPage";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import Router from "next/router";
import { setLandingPageData, setConfigData } from "src/redux/slices/configData";
import { useGetConfigData } from "src/api-manage/hooks/useGetConfigData";
import { Box } from "@mui/material";

const Careers = () => {
  const dispatch = useDispatch();
  const { configData, landingPageData } = useSelector((state) => state.configData);

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
  
  return (
    <>
      <Box
        sx={{
          maxWidth: "1300px",
          width: "100%",
          mx: "auto",
          pb: "20px",
        }}
      >
        <TopNavbar configData={configData} />
        <FAq />
        <Footermiddle configData={configData} />
      </Box>
    </>

  )
};

export default Careers;
