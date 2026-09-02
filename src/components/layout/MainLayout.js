import { useMediaQuery, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import FooterComponent from "../footer";
import HeaderComponent from "../header";
import BottomNav from "../header/BottomNav";
import { MainLayoutRoot } from "./LandingLayout";
import { useDispatch } from "react-redux";
import { setConfigData } from "redux/slices/configData";
import { useGetConfigData } from "../../../src/api-manage/hooks/useGetConfigData";

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery("(max-width:1180px)");
  const router = useRouter();
  const { page } = router.query;

  const dispatch = useDispatch();

  const { data: configApiData, refetch: refetchConfig } = useGetConfigData();

  useEffect(() => {
    refetchConfig(); // 🔥 Yahi API ko trigger karega
  }, []);

  useEffect(() => {
    if (configApiData) {
      dispatch(setConfigData(configApiData));
      // console.log("✅ Config stored in Redux:", configApiData);
    }
  }, [configApiData]);

  // ✅ Redux se yahi par lo
  const { configData, landingPageData } = useSelector(
    (state) => state.configData,
  );

  useEffect(() => {
    // console.log("🔥 MainLayout configData:", configData);
  }, [configData]);

  return (
    <MainLayoutRoot justifyContent="space-between">
      {/* ✅ HEADER */}
      <header>
        <HeaderComponent configData={configData} />
      </header>

      <CustomStackFullWidth mt={isSmall ? "6.5rem" : "6rem"}>
        <CustomStackFullWidth sx={{ minHeight: "70vh" }}>
          {children}
        </CustomStackFullWidth>
      </CustomStackFullWidth>

      {/* ✅ FOOTER */}
      <footer>
        <FooterComponent
          configData={configData}
          landingPageData={landingPageData}
        />
      </footer>
    </MainLayoutRoot>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default React.memo(MainLayout);
