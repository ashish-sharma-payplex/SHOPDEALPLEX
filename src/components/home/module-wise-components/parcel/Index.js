import React, { useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import CustomContainer from "../../../container";
import OrderDetailsModal from "../../../order-details-modal/OrderDetailsModal";
import { getToken } from "helper-functions/getToken";
import { setParcelData } from "redux/slices/parcelDeliveryInfo";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import ParcelFeatures from "components/parcel/ParcelFeatures";
import HeroSection from "components/parcel/HeroSection";
import SendAnywhere from "components/parcel/SendAnythingAnywhere";
import VehicleSelection from "components/parcel/VehicleSelection";
import HowItWorkss from "../../../../components/parcel/HowItWorkss";
import ComingSoonPage from "../commingSoon";
import DealplexSection from "components/parcel/DealplexSection";
import WhyChooseDealplex from "components/parcel/WhyChooseDealplex";

const Parcel = ({ configData }) => {
  const dispatch = useDispatch();
  const { orderDetailsModalOpen } = useSelector((state) => state.utilsData);
  const token = getToken();

  useEffect(() => {
    dispatch(setParcelData(null));
  }, [dispatch]);

  return (
    <>
      <CustomStackFullWidth>
        <Grid container justifyContent="center">
          <Grid item xs={12}>
            <Box
              sx={{
                maxWidth: "1280px",
                mx: "auto",
                width: "100%",
              }}
            >
              <CustomContainer>
                <HeroSection />
              </CustomContainer>

              <CustomContainer>
                <HowItWorkss />
              </CustomContainer>

              <CustomContainer>
                <SendAnywhere />
              </CustomContainer>

              <CustomContainer>
                <ParcelFeatures />
              </CustomContainer>

              <CustomContainer>
                <VehicleSelection />
              </CustomContainer>

              <CustomContainer>
                {/* <DealplexSection/> */}
                <WhyChooseDealplex />
              </CustomContainer>

              {orderDetailsModalOpen && !token && (
                <OrderDetailsModal
                  orderDetailsModalOpen={orderDetailsModalOpen}
                />
              )}
            </Box>
          </Grid>
          {/* <ComingSoonPage/> */}
        </Grid>
      </CustomStackFullWidth>
    </>
  );
};

export default Parcel;