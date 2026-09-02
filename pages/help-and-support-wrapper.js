import React from "react";
import HelpAndSupport from "./support";
import TopNavbar from "../src/components/footernavbar/TopNavbar";
import FooterMiddle from "../src/components/footer/footer-middle/FooterMiddle";
import BottomFooter from "../src/components/footer/BottomFooter"
import { setLandingPageData, setConfigData } from "src/redux/slices/configData";
import { useSelector, useDispatch } from "react-redux";
import { useGetConfigData } from "src/api-manage/hooks/useGetConfigData";
import useGetLandingPage from "../src/api-manage/hooks/react-query/useGetLandingPage";
import  { useEffect } from "react";

  
const HelpAndSupportWrapper = () => {
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
      <TopNavbar />
      <HelpAndSupport />
      <FooterMiddle />
      
    </>
  );
};

export default HelpAndSupportWrapper;
