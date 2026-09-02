import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Grid,
  IconButton,
  Skeleton,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
  Button,
  Stack,
} from "@mui/material";
import adminImage from "../../../../../public/static/profile/fi_4460756 (1).png";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import React, { memo, useEffect, useState } from "react";
import "simplebar-react/dist/simplebar.min.css";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { CustomTypographyEllipsis } from "styled-components/CustomTypographies.style";
import CustomDivider from "../../../CustomDivider";
import CustomImageContainer from "../../../CustomImageContainer";
import CustomModal from "../../../modal";
import CashSvg from "../../assets/CashSvg";
import ParcelOrderSummery from "../ParcelOrderSummery";
import OfflineOrderDenied from "../offline-order/OfflineOrderDenied";
import OfflineOrderDetails from "../offline-order/OfflineOrderDetails";
import OfflinePaymentEdit from "../offline-order/OfflinePaymentEdit";
import PrescriptionOrderCalculation from "../prescription-order/PerscriptionOrderCalculation";
import PrescriptionOrderSummery from "../prescription-order/PrescriptionOrderSummery";
import SingleOrderAttachment from "../singleOrderAttachment";
import InstructionBox from "./InstructionBox";
import OrderCalculation from "./OrderCalculation";
import ChatWithAdmin from "components/my-orders/order-details/other-order/ChatWithAdmin";
import { useGetOrderCancelReason } from "api-manage/hooks/react-query/order/useGetAutomatedMessage";
import { getToken } from "helper-functions/getToken";

// ⭐ Star Rating Helper
const StarRating = ({ rating }) => {
  return (
    <Stack direction="row" spacing={0.3}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Typography
          key={star}
          sx={{
            fontSize: "16px",
            color: star <= rating ? "#FFC107" : "#E0E0E0",
          }}
        >
          ★
        </Typography>
      ))}
    </Stack>
  );
};

const getAddOnsNames = (addOns) => {
  const names = addOns?.map(
    (item, index) =>
      `${addOns[0]?.name}(${addOns[0]?.quantity})${index !== addOns?.length - 1 ? "," : ""
      }`
  );
  return names;
};

const OrderSummery = (props) => {
  const {
    trackOrderData,
    configData,
    t,
    data,
    isLoading,
    dataIsLoading,
    refetchTrackOrder,
  } = props;

  // ✅ KEY FIX — grocery/food/pharmacy teeno ke liye same
  // data = { items: [...], delivery_man_review: {...} }
  const items = data?.items || [];
  const deliveryManReview = data?.delivery_man_review || null;

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [openModal, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [openOfflineDetails, setOpenOfflineDetails] = useState(false);
  const [openOfflineModal, setOpenOfflineModal] = useState(false);
  const [partialWithOffline, setPartialWithOffline] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const { data: automateMessageData } = useGetOrderCancelReason();

  useEffect(() => {
    if (trackOrderData?.offline_payment !== null) {
      setPartialWithOffline(true);
    }
  }, []);

  const handleImageOnClick = (value) => {
    setModalImage(value);
    setModalOpen(true);
  };
  const handleModalClose = (value) => {
    setModalOpen(value);
    setModalImage(null);
  };
  const handleClickOffline = () => {
    setOpenOfflineDetails(!openOfflineDetails);
  };

  const buttonBackgroundColor = () => {
    if (trackOrderData?.offline_payment?.data?.status === "denied") {
      return `${alpha(theme.palette.error.deepLight, 0.9)}`;
    } else if (trackOrderData?.offline_payment?.data?.status === "unpaid") {
      return theme.palette.info.main;
    } else if (trackOrderData?.offline_payment?.data?.status === "verified") {
      return theme.palette.success.main;
    } else {
      return theme.palette.warning.lite;
    }
  };

  const getVariationNames = (variation) => {
    return variation
      ?.map((v) => v?.values?.map((val) => val?.label).join(", "))
      .join(", ");
  };

  const getAddonNames = (addons) => {
    return addons?.map((item) => item?.name).join(", ");
  };

  return (
    <>
      {/* ✅ parcel check — trackOrderData se, data se nahi */}
      {trackOrderData && trackOrderData?.module_type === "parcel" ? (
        <ParcelOrderSummery
          data={data}
          trackOrderData={trackOrderData}
          configData={configData}
          refetchTrackOrder={refetchTrackOrder}
        />
      ) : (
        <Grid container pr={{ xs: "0px", sm: "0px", md: "40px" }}>
          <Grid container item md={8} xs={12}>
            <Grid item xs={12} sm={12} md={12}>
              {!data?.prescription_order &&
                trackOrderData?.module_type === "pharmacy" &&
                trackOrderData?.order_attachment_full_url && (
                  <SingleOrderAttachment
                    title="Prescription"
                    trackOrderData={trackOrderData}
                    configData={configData}
                  />
                )}
              {data?.prescription_order && (
                <PrescriptionOrderSummery data={data} />
              )}

              {/* ✅ items.map — grocery/food/pharmacy teeno ke liye same */}
              {items?.length > 0 &&
                items?.map((product) => {
                  const isFood =
                    product?.item_details?.module_type === "food";
                  const variation = product?.variation?.[0];
                  const basePrice = variation?.price || product?.price || 0;
                  const discount = product?.item_details?.discount || 0;
                  const discountType = product?.item_details?.discount_type;
                  const newPrice =
                    discount > 0
                      ? discountType === "percent"
                        ? (basePrice * (100 - discount)) / 100
                        : basePrice - discount
                      : basePrice;
                  const unitLabel = variation?.type;
                  const unitType =
                    product?.item_details?.unit?.unit || "Unit";
                  const itemName = product?.item_details?.name || "";

                  return (
                    <Grid
                      container
                      alignItems="flex-start"
                      md={12}
                      xs={12}
                      spacing={{ xs: 1 }}
                      key={product?.id}
                      mb="13px"
                      sx={{ "&:last-child": { mb: 0 } }}
                      pl={{ xs: "0px", sm: "20px", md: "25px" }}
                    >
                      {/* Image */}
                      <Grid item xs={3} sm={1.2} md={1.2}>
                        <CustomImageContainer
                          src={product?.image_full_url}
                          height="73px"
                          maxWidth="73px"
                          width="100%"
                          loading="lazy"
                          smHeight="70px"
                          borderRadius=".7rem"
                        />
                      </Grid>

                      {/* Details */}
                      <Grid item md={10.8} xs={9} sm={10.8} align="left">
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          paddingBottom={{ xs: "5px", md: "0px" }}
                        >
                          <Stack>
                            <CustomTypographyEllipsis
                              fontWeight="500"
                              fontSize="13px"
                              noWrap
                              sx={{ maxWidth: 250 }}
                            >
                              {t(itemName)}
                            </CustomTypographyEllipsis>

                            {isFood ? (
                              <>
                                {product?.variation?.length > 0 && (
                                  <Typography
                                    variant="body2"
                                    mt="3px"
                                    sx={{ fontWeight: 400 }}
                                  >
                                    {t("Variation")}:{" "}
                                    {getVariationNames(product?.variation)}
                                  </Typography>
                                )}
                                {product?.add_ons?.length > 0 && (
                                  <Typography
                                    variant="body2"
                                    mt="3px"
                                    sx={{ fontWeight: 400 }}
                                  >
                                    {t("Add on")}:{" "}
                                    {getAddonNames(product?.add_ons)}
                                  </Typography>
                                )}
                              </>
                            ) : (
                              unitLabel && (
                                <Typography variant="body2" mt="3px">
                                  {unitLabel} {unitType}
                                </Typography>
                              )
                            )}

                            <Typography variant="body2" mt="5px">
                              {t("Item Price")} :{" "}
                              <Typography
                                component="span"
                                fontWeight="600"
                                color="primary"
                                sx={{ marginRight: "6px" }}
                              >
                                {getAmountWithSign(newPrice)}
                              </Typography>
                              {discount > 0 && (
                                <Typography
                                  component="span"
                                  sx={{
                                    textDecoration: "line-through",
                                    color: "gray",
                                    fontSize: "13px",
                                  }}
                                >
                                  {getAmountWithSign(basePrice)}
                                </Typography>
                              )}
                            </Typography>
                          </Stack>

                          <Stack
                            direction={isSmall ? "column-reverse" : "column"}
                            gap="5px"
                          >
                            <Typography variant="body2" mt="8px">
                              {t("Qty")}: {product?.quantity}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>

                      {/* ⭐ Item Review — sirf tab dikhao jab review ho */}
                      {product?.review && (
                        <Grid item xs={12}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{
                              mt: "2px",
                              mb: "8px",
                              px: "10px",
                              py: "8px",
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.05
                              ),
                              borderRadius: "8px",
                              border: `1px solid ${alpha(
                                theme.palette.primary.main,
                                0.15
                              )}`,
                            }}
                          >
                            <StarRating rating={product?.review?.rating} />
                            <Typography
                              fontSize="12px"
                              color="text.secondary"
                              fontStyle="italic"
                            >
                              "{product?.review?.comment}"
                            </Typography>
                          </Stack>
                        </Grid>
                      )}

                      <CustomDivider border="1px" />
                    </Grid>
                  );
                })}

              {/* 🚴 Delivery Man Review — sirf tab dikhao jab deliveryManReview ho */}
              {items?.length > 0 && deliveryManReview && (
                <Grid
                  item
                  xs={12}
                  pl={{ xs: "0px", sm: "20px", md: "25px" }}
                  mt="20px"
                  mb="10px"
                >
                  <Typography
                    fontSize={{ xs: "14px", md: "16px" }}
                    fontWeight="500"
                    mb="10px"
                  >
                    {t("Delivery Man Review")}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      px: "10px",
                      py: "10px",
                      backgroundColor: alpha(
                        theme.palette.primary.main,
                        0.05
                      ),
                      borderRadius: "8px",
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.15
                      )}`,
                    }}
                  >
                    <StarRating rating={deliveryManReview?.rating} />
                    <Typography
                      fontSize="12px"
                      color="text.secondary"
                      fontStyle="italic"
                    >
                      "{deliveryManReview?.comment}"
                    </Typography>
                  </Stack>
                </Grid>
              )}
            </Grid>

            {/* Address + Payment */}
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              pl={{ xs: "0px", sm: "20px", md: "25px" }}
            >
              <CustomStackFullWidth
                direction={{ xs: "column", md: "row" }}
                sx={{
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  padding: { xs: "0px , 20px", md: "0px 25px" },
                  gap: { xs: "10px", md: "0px" },
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    fontSize={{ xs: "14px", md: "16px" }}
                    fontWeight="500"
                  >
                    {t("Address")}
                  </Typography>
                  <Typography
                    fontSize={{ xs: "12px", md: "14px" }}
                    fontWeight="400"
                    color={theme.palette.neutral[500]}
                    width="215px"
                    lineHeight="25px"
                  >
                    {trackOrderData?.delivery_address?.address}
                  </Typography>
                </Stack>
                {!isSmall && (
                  <Stack
                    sx={{
                      borderLeft: (theme) =>
                        `3px solid ${alpha(theme.palette.neutral[400], 0.2)}`,
                      paddingLeft: "30px",
                      height: "100px",
                    }}
                  ></Stack>
                )}
                <Stack>
                  <Stack
                    spacing={1}
                    flexDirection="row"
                    justifyContent="space-between"
                  >
                    <Stack gap="12px">
                      <Typography
                        fontSize={{ xs: "14px", md: "16px" }}
                        fontWeight="500"
                      >
                        {t("Payment")}
                      </Typography>
                      {trackOrderData?.payment_method ? (
                        <CustomStackFullWidth flexDirection="row">
                          <CashSvg />
                          <Typography
                            padding={"0px 10px"}
                            fontSize={{ xs: "12px", md: "14px" }}
                            fontWeight="400"
                            color={theme.palette.neutral[500]}
                            width="215px"
                            lineHeight="25px"
                            textTransform="capitalize"
                          >
                            {t(
                              trackOrderData?.payment_method.replaceAll(
                                "_",
                                " "
                              )
                            )}
                          </Typography>
                        </CustomStackFullWidth>
                      ) : (
                        <Skeleton width="100px" variant="text" />
                      )}
                    </Stack>
                    {(trackOrderData?.payment_method === "offline_payment" ||
                      partialWithOffline) && (
                        <Stack alignItems="flex-end" gap="5px">
                          <Typography
                            component="span"
                            fontSize="12px"
                            sx={{
                              textTransform: "capitalize",
                              padding: "4px",
                              marginLeft: "15px",
                              borderRadius: "3px",
                              backgroundColor: buttonBackgroundColor(),
                              color: theme.palette.whiteContainer.main,
                              fontWeight: "600",
                            }}
                          >
                            {trackOrderData?.offline_payment?.data?.status}
                          </Typography>
                          <ExpandMoreIcon
                            onClick={handleClickOffline}
                            sx={{ cursor: "pointer" }}
                          />
                        </Stack>
                      )}
                  </Stack>
                  {openOfflineDetails &&
                    (trackOrderData?.payment_method === "offline_payment" ||
                      partialWithOffline) && (
                      <OfflineOrderDetails
                        trackOrderData={trackOrderData}
                        setOpenOfflineModal={setOpenOfflineModal}
                      />
                    )}
                  {trackOrderData?.offline_payment?.data?.status ===
                    "denied" && (
                      <OfflineOrderDenied trackOrderData={trackOrderData} />
                    )}
                  {openOfflineModal && (
                    <CustomModal
                      openModal={openOfflineModal}
                      handleClose={() => setOpenOfflineModal(false)}
                    >
                      <CustomStackFullWidth
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{ position: "relative" }}
                      >
                        <IconButton
                          onClick={() => setOpenOfflineModal(false)}
                          sx={{
                            zIndex: "99",
                            position: "absolute",
                            top: 10,
                            right: 10,
                            backgroundColor: (theme) =>
                              theme.palette.neutral[100],
                            borderRadius: "50%",
                            [theme.breakpoints.down("md")]: {
                              top: 10,
                              right: 5,
                            },
                          }}
                        >
                          <CloseIcon
                            sx={{ fontSize: "24px", fontWeight: "500" }}
                          />
                        </IconButton>
                      </CustomStackFullWidth>
                      <OfflinePaymentEdit
                        trackOrderData={trackOrderData}
                        refetchTrackOrder={refetchTrackOrder}
                        data={data}
                        setOpenOfflineModal={setOpenOfflineModal}
                      />
                    </CustomModal>
                  )}
                </Stack>
                {!isSmall && trackOrderData?.unavailable_item_note && (
                  <Stack
                    sx={{
                      borderLeft: (theme) =>
                        `3px solid ${alpha(theme.palette.neutral[400], 0.2)}`,
                      paddingLeft: "30px",
                      height: "100px",
                    }}
                  ></Stack>
                )}
                {trackOrderData?.cutlery && (
                  <Stack
                    spacing={1}
                    sx={{ ":last-child": { marginLeft: "0px" } }}
                  >
                    <Typography
                      fontSize={{ xs: "14px", md: "16px" }}
                      fontWeight="500"
                      textTransform="capitalize"
                    >
                      {t("Cutlery")}
                    </Typography>
                    <Typography
                      fontSize={{ xs: "12px", md: "14px" }}
                      fontWeight="400"
                      color={theme.palette.neutral[500]}
                      width="215px"
                      lineHeight="25px"
                      textTransform="capitalize"
                    >
                      {t("Yes")}
                    </Typography>
                  </Stack>
                )}
              </CustomStackFullWidth>
            </Grid>

            {/* Instruction Boxes */}
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              pl={{ xs: "0px", sm: "20px", md: "25px" }}
            >
              {trackOrderData?.unavailable_item_note && (
                <InstructionBox
                  title="Unavailable item Note"
                  note={trackOrderData?.unavailable_item_note}
                />
              )}
              {trackOrderData?.delivery_instruction && (
                <InstructionBox
                  title="delivery instruction"
                  note={trackOrderData?.delivery_instruction}
                />
              )}
              {trackOrderData?.order_status === "refund_requested" && (
                <InstructionBox
                  title="refund reason"
                  note={trackOrderData?.refund?.customer_reason}
                />
              )}
              {trackOrderData?.order_status === "refund_request_canceled" && (
                <InstructionBox
                  title="refund cancellation note"
                  note={trackOrderData?.refund_cancellation_note}
                />
              )}
              {trackOrderData?.order_status === "canceled" && (
                <InstructionBox
                  title="cancellation note"
                  note={trackOrderData?.cancellation_reason}
                />
              )}
            </Grid>
          </Grid>

          {/* Right Side — Order Calculation */}
          <Grid item xs={12} md={4} pl={{ xs: "0px", sm: "15px", md: "20px" }}>
            {data?.prescription_order ? (
              <PrescriptionOrderCalculation
                data={items}
                t={t}
                trackOrderData={trackOrderData}
                configData={configData}
              />
            ) : (
              <OrderCalculation
                data={items}
                t={t}
                trackOrderData={trackOrderData}
                configData={configData}
              />
            )}
            {getToken() && !data?.prescription_order && (
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                mt="1.4rem"
                alignItems="center"
              >
                <CustomImageContainer
                  src={adminImage.src}
                  width="35px"
                  height="35px"
                />
                <Typography
                  fontSize={{ xs: "14px", md: "16px" }}
                  fontWeight="500"
                  sx={{ cursor: "pointer" }}
                  onClick={() => setOpenAdmin(true)}
                >
                  {t(`Message to `)}
                  <Typography
                    component="span"
                    fontSize={{ xs: "14px", md: "16px" }}
                    fontWeight="500"
                    color="primary"
                    sx={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    {configData?.business_name}
                  </Typography>
                </Typography>
              </Stack>
            )}
          </Grid>
        </Grid>
      )}

      <CustomModal
        openModal={openAdmin}
        handleClose={() => setOpenAdmin(false)}
        closeButton
      >
        <ChatWithAdmin
          automateMessageData={automateMessageData?.data}
          orderID={trackOrderData?.id}
        />
      </CustomModal>
    </>
  );
};

OrderSummery.propTypes = {};

export default memo(OrderSummery);