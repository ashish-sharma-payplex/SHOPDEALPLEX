import React, { useEffect } from "react";
import { Box } from "@mui/material";
import Career from "src/components/home/careers/careers";
import Lead from "../pages/lead/lead";
import { useSelector, useDispatch } from "react-redux";
import TopNavbar from "../src/components/footernavbar/TopNavbar";
import FooterMiddle from "../src/components/footer/footer-middle/FooterMiddle";
import BottomFooter from "../src/components/footer/BottomFooter";
import useGetLandingPage from "../src/api-manage/hooks/react-query/useGetLandingPage";
import { useGetConfigData } from "src/api-manage/hooks/useGetConfigData";
import Router from "next/router";
import { setLandingPageData, setConfigData } from "src/redux/slices/configData";

const Leader = () => {
  const dispatch = useDispatch();

  const { configData, landingPageData } = useSelector(
    (state) => state.configData
  );

  const {
    data: dataLandingPage,
    refetch: refetchLandingPage,
  } = useGetLandingPage();

  const {
    data: dataConfig,
    refetch: refetchConfig,
  } = useGetConfigData();

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
      <TopNavbar
        configData={configData}
        landingPageData={landingPageData}
      />

    
        <Lead configData={configData} />
     

      <FooterMiddle configData={configData} />
       </Box>
    </>
  );
};

export default Leader;