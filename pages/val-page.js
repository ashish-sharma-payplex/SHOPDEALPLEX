import React, { useEffect } from "react";
import ValuesPage from "./our-values/ValuesPage";
import { useSelector, useDispatch } from "react-redux";
import TopNavbar from "../src/components/footernavbar/TopNavbar";
import FooterMiddle from "../src/components/footer/footer-middle/FooterMiddle";
import BottomFooter from "../src/components/footer/BottomFooter";
import { setLandingPageData, setConfigData } from "src/redux/slices/configData";
import useGetLandingPage from "../src/api-manage/hooks/react-query/useGetLandingPage";
import Router from "next/router";
import { useGetConfigData } from "src/api-manage/hooks/useGetConfigData";
import { Box } from "@mui/material";
import SecondNavBar from "components/header/second-navbar/SecondNavbar";

const Valuepage = () => {
  const dispatch = useDispatch();
  const { configData, landingPageData } = useSelector(
    (state) => state.configData,
  );

  const { data: dataLandingPage, refetch: refetchLandingPage } =
    useGetLandingPage();
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
          maxWidth: "1280px",
          width: "100%",
          mx: "auto",
          pb:"20px"
        }}
      >
        <SecondNavBar configData={configData} />
        <ValuesPage configData={configData} />
        <FooterMiddle configData={configData} />
      </Box>
    </>
  );
};

export default Valuepage;
