
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  CustomPaperBigCard,
  CustomStackFullWidth,
  CustomBoxFullWidth,
  CustomPaper,
} from "styled-components/CustomStyles.style";
import {
  Grid,
  Typography,
  Skeleton,
  TextField,
  InputAdornment,
} from "@mui/material";
import { t } from "i18next";
import CustomTextFieldWithFormik from "../form-fields/CustomTextFieldWithFormik";
import CustomPhoneInput from "../custom-component/CustomPhoneInput";
import { useFormik } from "formik";
import { setGuestUserInfo } from "redux/slices/guestUserInfo";
import { getLanguage, getModule } from "helper-functions/getLanguage";
import { PrimaryButton } from "../Map/map.style";
import TrackOrderDetails from "./TrackOrderDetails";
import { getGuestId } from "helper-functions/getToken";
import useGetTrackOrderData from "../../api-manage/hooks/react-query/order/useGetTrackOrderData";
import { useDispatch, useSelector } from "react-redux";

import Router from "next/router";
import { useGetTripDetails } from "api-manage/hooks/react-query/useGetTripDetails";

// MyOrders related imports
import NavigationButtons from "../../components/my-orders/NavigationButtons";
import useGetMyOrdersList from "../../api-manage/hooks/react-query/order/useGetMyOrdersList";
import { useTheme } from "@mui/material/styles";
import { toast } from "react-hot-toast";
import TabsTypeOne from "../custom-tabs/TabsTypeOne";
import active from "../../components/my-orders/assets/active_image.png";
import past from "../../components/my-orders/assets/past_image.png";
import { Stack } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import CustomEmptyResult from "../custom-empty-result";
import nodata from "../loyalty-points/assets/Search.svg";
import Order, {
  CustomPaper as OrderPaper,
} from "../../components/my-orders/order/index";
import CustomPagination from "../custom-pagination";
import { setCurrentTab, setOrderType } from "redux/slices/utils";
import { useMediaQuery } from "@mui/material";

// -------------------- MyOrders Component --------------------
const CustomShimmerCard = ({ isXs }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <CustomBoxFullWidth>
      <Grid container spacing={3}>
        {[...Array(6)].map((item, index) => {
          return (
            <Grid item xs={12} sm={isXs ? 12 : 6} md={12} lg={12} key={index}>
              <OrderPaper>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    width="100%"
                  >
                    <Skeleton
                      variant="rectangular"
                      width={isSmall ? "100px" : "90px"}
                      height={isSmall ? "100px" : "72px"}
                    />
                    <Stack width="100%" spacing={0.5}>
                      <Skeleton
                        variant="text"
                        width="200px"
                        height={isSmall ? "15px" : "20px"}
                      />
                      <Skeleton
                        variant="text"
                        width="130px"
                        height={isSmall ? "15px" : "20px"}
                      />
                      <Skeleton
                        variant="text"
                        width="130px"
                        height={isSmall ? "15px" : "20px"}
                      />
                      {isSmall && (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Skeleton
                            variant="text"
                            width="100px"
                            height="20px"
                          />
                          <Skeleton
                            variant="text"
                            width="100px"
                            height="35px"
                          />
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                  {!isSmall && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Skeleton variant="text" width="130px" height="40px" />
                      <Skeleton variant="text" width="130px" height="60px" />
                    </Stack>
                  )}
                </Stack>
              </OrderPaper>
            </Grid>
          );
        })}
      </Grid>
    </CustomBoxFullWidth>
  );
};

const MyOrders = (props) => {
  const tabsData = [
    {
      title: "Active orders ",
      img: active,
    },
    {
      title: "History",
      img: past,
    },
  ];

  const theme = useTheme();
  const { configData } = props;
  const { t } = useTranslation();
  const isXs = useMediaQuery("(max-width:600px)");
  const { orderType, currentTab } = useSelector((state) => state.utilsData);

  const [offset, setOffSet] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const orderTypeValue = orderType === 0 ? "running-orders" : "list";

  const { data, refetch, isFetching } = useGetMyOrdersList({
    orderType: orderTypeValue,
    offset: offset,
    limit: 5,
    searchTerm: searchTerm,
  });

  const handleNextPage = () => {
    setOffSet((prev) => prev + 1);
  };

  const deleteOrder = async (orderId) => {
    try {
      toast.success("Order deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  useEffect(() => {
    refetch();
    dispatch(setOrderType(orderType === 0 ? 0 : 1));
  }, [orderType, offset]);

  useEffect(() => {
    if (currentTab) {
      setOffSet(1);
      dispatch(setOrderType(currentTab === "Active orders " ? 0 : 1));
    }
  }, [currentTab]);

  useEffect(() => {
    if (isFetching) {
    } else {
      toast.dismiss();
    }
  }, [isFetching]);

  const filteredOrders = data?.orders?.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order?.id?.toString().endsWith(searchTerm) ||
      order?.restaurant_name?.toLowerCase().includes(searchLower) ||
      order?.order_status?.toLowerCase().includes(searchLower) ||
      order?.total_amount?.toString().includes(searchLower) ||
      order?.items?.[0]?.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleInnerContent = () => {
    if (data) {
      if (filteredOrders.length === 0) {
        return (
          <CustomEmptyResult
            image={nodata}
            label={searchTerm ? "No matching orders found" : "No Orders Found"}
            width="128px"
            height="128px"
          />
        );
      } else {
        return (
          <Grid container spacing={2}>
            {filteredOrders.map((order, index) => (
              <Grid
                item
                xs={12}
                sm={isXs ? 12 : 6}
                md={12}
                lg={12}
                key={order?.id}
              >
                <Order
                  index={index}
                  order={order}
                  t={t}
                  configData={configData}
                  dispatch={dispatch}
                  onDelete={() => deleteOrder(order.id)}
                />
              </Grid>
            ))}
          </Grid>
        );
      }
    } else {
      return <CustomShimmerCard isXs={isXs} />;
    }
  };

  return (
    <CustomStackFullWidth
      spacing={2}
      sx={{
        minHeight: "80vh",
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: isSmall ? "10px 10px 10px 0px" : "20px 20px 20px 0px",
      }}
    >
      <TabsTypeOne
        tabs={tabsData}
        currentTab={currentTab}
        t={t}
        width="fit-content"
        onNextPage={handleNextPage}
        sx={{ marginBottom: 2, marginLeft: 2 }}
      />

      <TextField
        fullWidth
        variant="outlined"
        placeholder={t("Search orders...")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      <CustomStackFullWidth spacing={3}>
        {handleInnerContent()}
      </CustomStackFullWidth>
      {data?.total_size > 5 && (
        <CustomStackFullWidth
          sx={{ justifyContent: "center", mb: 0 }}
          direction="row"
        >
          <CustomPagination
            total_size={data?.total_size}
            page_limit={5}
            offset={offset}
            setOffset={setOffSet}
          />
        </CustomStackFullWidth>
      )}
    </CustomStackFullWidth>
  );
};

// -------------------- TrackOrderInput (Merged) --------------------
const TrackOrderInput = ({ configData }) => {
  const dispatch = useDispatch();
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { selectedModule } = useSelector((state) => state.utilsData);

  const trackOrderFormik = useFormik({
    initialValues: {
      order_id: "",
      contact_person_number: "",
    },
    onSubmit: async (values) => {
      try {
        dispatch(setGuestUserInfo(values));
        setShowOrderDetails(true);
      } catch (err) {}
    },
  });

  const lanDirection = getLanguage() ? getLanguage() : "ltr";

  const nameHandler = (value) =>
    trackOrderFormik.setFieldValue("order_id", value);
  const numberHandler = (value) =>
    trackOrderFormik.setFieldValue("contact_person_number", `+${value}`);

  return (
    <CustomBoxFullWidth
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        backgroundColor: "#FFF",
        px: 2,
      }}
    >
      <CustomStackFullWidth
        spacing={4}
        sx={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <CustomStackFullWidth pt="40px" spacing={2}>
          <CustomPaperBigCard
            sx={{
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
              boxShadow: "none",
            }}
          >
            <Typography
              align="center"
              paddingBottom="30px"
              fontSize="20px"
              fontWeight="600"
              color="#1A914B"
              textTransform="uppercase"
              letterSpacing="1px"
            >
              {selectedModule?.module_type === "rental"
                ? t("Track Your Trip")
                : t("Track Your Order")}
            </Typography>
            <form noValidate onSubmit={trackOrderFormik.handleSubmit}>
              <Grid
                container
                spacing={2}
                paddingX={{ xs: ".5rem", md: "2rem" }}
              >
                <Grid item xs={12} md={5}>
                  <CustomTextFieldWithFormik
                    placeholder={
                      selectedModule?.module_type === "rental"
                        ? t("Enter your trip id")
                        : t("Enter your order id")
                    }
                    required="true"
                    type="text"
                    label={
                      selectedModule?.module_type === "rental"
                        ? t("Trip Id")
                        : t("Order Id")
                    }
                    touched={trackOrderFormik.touched.order_id}
                    errors={trackOrderFormik.errors.order_id}
                    fieldProps={trackOrderFormik.getFieldProps("order_id")}
                    onChangeHandler={nameHandler}
                    value={trackOrderFormik.values.order_id}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  {/* ✅ showBorder={true} — sirf yahan border aayegi, OtpLogin mein nahi */}
                  <CustomPhoneInput
                    value={trackOrderFormik.values.contact_person_number}
                    onHandleChange={numberHandler}
                    initCountry={configData?.country}
                    touched={trackOrderFormik.touched.contact_person_number}
                    errors={trackOrderFormik.errors.contact_person_number}
                    rtlChange="true"
                    lanDirection={lanDirection}
                    height="56px"
                    showBorder={true}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <PrimaryButton
                    type="submit"
                    sx={{ backgroundColor: "#1A914B" }}
                  >
                    {selectedModule?.module_type === "rental"
                      ? t("Search Trip")
                      : t("Search Order")}
                  </PrimaryButton>
                </Grid>
              </Grid>
            </form>
          </CustomPaperBigCard>
        </CustomStackFullWidth>

        <MyOrders configData={configData} />
      </CustomStackFullWidth>
    </CustomBoxFullWidth>
  );
};

export default TrackOrderInput;