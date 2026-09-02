import CssBaseline from "@mui/material/CssBaseline";

import SEO from "../../../../src/components/seo";
import MainLayout from "../../../../src/components/layout/MainLayout";

import { useDispatch, useSelector } from "react-redux";

import { useGetConfigData } from "../../../../src/api-manage/hooks/useGetConfigData";
import { setConfigData } from "../../../../src/redux/slices/configData";
import { useEffect } from "react";
import RentalProviderDetailsPage from "../../../../src/components/home/module-wise-components/rental/components/rental-provider-details/RentalProviderDetailsPage";
import { Box } from "@mui/material";


const Index = () => {
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
        title={configData ? `Provider` : "Loading..."}
        image={configData?.fav_icon_full_url}
        businessName={configData?.business_name}
        configData={configData}
      />
      <MainLayout configData={configData} landingPageData={landingPageData}>
        <Box
          sx={{
            maxWidth: "1300px",
            width: "100%",
            mx: "auto", // center align
            my:4,
            px: { xs: 2, md: 3 }, // optional padding inside
          }}
        >
          <RentalProviderDetailsPage configData={configData} />
        </Box>
      </MainLayout>
    </>
  );
};

export default Index;
