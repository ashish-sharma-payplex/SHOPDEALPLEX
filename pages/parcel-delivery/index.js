import React, { useEffect } from "react";
import MainLayout from "../../src/components/layout/MainLayout";
import MainForm from "../../src/components/parcel/MainForm";
import CssBaseline from "@mui/material/CssBaseline";
import { NoSsr } from "@mui/material";
import SEO from "../../src/components/seo";
import CustomContainer from "../../src/components/container";
import { getImageUrl } from "utils/CustomFunctions";
import { useDispatch, useSelector } from "react-redux";
import { useGetConfigData } from "../../src/api-manage/hooks/useGetConfigData";
import { setConfigData } from "../../src/redux/slices/configData";

const ParcelDelivery = () => {
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
        configData={configData}
        title={configData ? `Parcel Delivery Booking` : "Loading..."}
        image={`${getImageUrl(
          { value: configData?.logo_storage },
          "business_logo_url",
          configData
        )}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
      />

      <MainLayout configData={configData} landingPageData={landingPageData}>
        <NoSsr>
          <CustomContainer>
            <MainForm />
          </CustomContainer>
        </NoSsr>
      </MainLayout>
    </>
  );
};

export default ParcelDelivery;