import CssBaseline from "@mui/material/CssBaseline";
import SEO from "../../../../src/components/seo";
import MainLayout from "../../../../src/components/layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import { useGetConfigData } from "../../../../src/api-manage/hooks/useGetConfigData";
import { setConfigData } from "../../../../src/redux/slices/configData";
import { useEffect } from "react";
import TripStatusPage from "../../../../src/components/home/module-wise-components/rental/components/trip-status/TripStatusPage";

const index = () => {
  const dispatch = useDispatch();
  const { landingPageData, configData } = useSelector(
    (state) => state.configData
  );
  const { data: dataConfig, refetch: configRefetch } = useGetConfigData();
  
  useEffect(() => {
    if (!configData) {
      configRefetch();
    }
  }, [configData]);

  useEffect(() => {
    if (dataConfig) {
      dispatch(setConfigData(dataConfig));
    }
  }, [dataConfig]);

  return (
    <>
      <CssBaseline />
      <SEO
        title={configData ? `Profile` : "Loading..."}
        image={configData?.fav_icon_full_url}
        businessName={configData?.business_name}
        configData={configData}
      />
      <MainLayout configData={configData} landingPageData={landingPageData}>
        <div style={{ maxWidth: "1300px", margin: " 20px auto" }}>
          <TripStatusPage />
        </div>
      </MainLayout>
    </>
  );
};

export default index;