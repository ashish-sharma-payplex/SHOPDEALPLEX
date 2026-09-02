import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import TopNavbar from "../src/components/footernavbar/TopNavbar"
import Footermiddle from "../src/components/footer/footer-middle/FooterMiddle";
import BottomFooter from "../src/components/footer/BottomFooter";
import useGetLandingPage from "src/api-manage/hooks/react-query/useGetLandingPage";
import { setLandingPageData, setConfigData } from "src/redux/slices/configData";
import { useGetConfigData } from "src/api-manage/hooks/useGetConfigData";
import HeaderComponent from "../src/components/header";
import { Box } from "@mui/system";
import Contact from "./contact-us";




const Contactus = () => {
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
      <HeaderComponent configData={configData} />
      <Box sx={{ width: '1200px', mx: 'auto' }}>
        <Contact configData={configData} />
      </Box>
      <Footermiddle configData={configData} />


    </>

  )
};

export default Contactus;
