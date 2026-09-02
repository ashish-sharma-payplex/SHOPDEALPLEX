
import React, { useEffect, useState } from "react";
import { Grid, InputBase, Dialog, DialogActions, DialogContent, DialogTitle, Button, Stack, Typography, Box, Tooltip, Skeleton } from "@mui/material";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { CouponApi } from "api-manage/another-formated-api/couponApi";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { setCouponInfo, setCouponType } from "redux/slices/profileInfo";
import { coupon_minimum } from "utils/toasterMessages";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import HadCouponBox from "./HadCouponBox";
import { InputField } from "../CheckOut.style";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';


const CouponCardSkeleton = () => {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          backgroundColor: "#f1f8f7",
          borderRadius: "12px",
          overflow: "hidden",
          minHeight: "130px",
          width: "100%",
        }}
      >
        {/* Left Strip */}
        <Box
          sx={{
            width: "45px",
            borderRight: "1px dashed #2e7d32",
            margin: "16px 0",
            ml: 1,
          }}
        >
          <Skeleton
            variant="rectangular"
            width="30px"
            height="80px"
            sx={{ borderRadius: "4px", ml: 1 }}
            animation="wave"
          />
        </Box>

        {/* Right Content */}
        <Box
          sx={{
            flex: 1,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Skeleton animation="wave" width="70%" height={20} />
          <Skeleton animation="wave" width="50%" height={16} sx={{ mt: 1 }} />
          <Skeleton animation="wave" width="60%" height={24} sx={{ mt: 1 }} />
          <Skeleton animation="wave" width="40%" height={14} sx={{ mt: 1 }} />
          <Skeleton animation="wave" width="30%" height={20} sx={{ mt: 2 }} />
        </Box>
      </Box>
    </Grid>
  );
};

const HaveCoupon = (props) => {
  const {
    store_id,
    setCouponDiscount,
    couponDiscount,
    totalAmount,
    deliveryFee,
    deliveryTip,
    setSwitchToWallet,
    payableAmount,
    walletBalance,
  } = props;

  const theme = useTheme();
  const { couponInfo } = useSelector((state) => state.profileInfo);
  const [couponCode, setCouponCode] = useState(couponInfo?.code);
  const [openDialog, setOpenDialog] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  let zoneId;

  const [coupons, setCoupons] = useState([]);
  const [isApplying, setIsApplying] = useState(false);


  if (typeof window !== "undefined") {
    zoneId = JSON.parse(localStorage.getItem("zoneid"));
  }

  const { isLoading, isError } = useQuery(
    ["coupon-list", store_id],
    () => CouponApi.couponList(store_id),
    {
      enabled: !!store_id,
      onSuccess: (response) => {
        // console.log("Coupon Response of rental:", response);
        if (response?.data?.length > 0) {
          setCoupons(response.data);
        } else {
          setCoupons([]);
        }
      },
      onError: () => {
        toast.error("Error fetching coupons");
      },
    }
  );


  const getCouponDiscount = (discount, discountType, totalAmountOverall) => {
    if (discountType === "amount") {
      return discount;
    } else {
      return (discount / 100) * totalAmountOverall;
    }
  };

  const handleSuccess = (response) => {
    const totalAmountOverall = totalAmount - deliveryFee - deliveryTip;

    if (Number(response?.data?.min_purchase) <= Number(totalAmountOverall)) {

      let fixedDiscountAmount = 0;
      if (response?.data?.discount_type === "percent") {
        fixedDiscountAmount = (Number(response.data.discount) / 100) * Number(totalAmountOverall);
      } else if (response?.data?.discount_type === "amount") {
        fixedDiscountAmount = Number(response.data.discount);
      }

      const couponDiscountObj = {
        ...response.data,
        zoneId: zoneId,
        fixed_discount_amount: fixedDiscountAmount,
      };

      if (response?.data?.discount_type === "percent") {
        dispatch(setCouponInfo(response.data));
        toast.success(t("Coupon Applied"));
        dispatch(setCouponType(response.data.coupon_type));
        setCouponDiscount(couponDiscountObj);
        const currentModule = JSON.parse(localStorage.getItem("module"));
        localStorage.setItem("coupon", JSON.stringify({
          ...couponDiscountObj,
          _module_id: currentModule?.id,
          _store_id: store_id,
        }));
      } else {
        if (response?.data?.discount && payableAmount >= response?.data?.discount) {
          dispatch(setCouponInfo(response.data));
          toast.success(t("Coupon Applied"));
          dispatch(setCouponType(response.data.coupon_type));
          setCouponDiscount(couponDiscountObj);
          const currentModule = JSON.parse(localStorage.getItem("module"));
          localStorage.setItem("coupon", JSON.stringify({
            ...couponDiscountObj,
            _module_id: currentModule?.id,
            _store_id: store_id,
          }));
        } else {
          toast.error(t("Your total price must be more than the coupon amount"));
        }
      }
    } else {
      toast.error(
        `${t(coupon_minimum)} ${getAmountWithSign(response?.data?.min_purchase)}`
      );
    }
  };


  const { refetch } = useQuery(
    "apply-coupon",
    () => CouponApi.applyCoupon(couponCode, store_id),
    {
      onSuccess: handleSuccess,
      onError: onErrorResponse,
      enabled: false,
      retry: 1,
    }
  );

  const removeCoupon = () => {
    setCouponDiscount(null);
    localStorage.removeItem("coupon");
    setCouponCode(null);
    dispatch(setCouponInfo(null));
    setSwitchToWallet(false);
  };


  // ✅ Auto-remove coupon when cart subtotal drops below coupon's min_purchase
  useEffect(() => {
    if (!couponInfo) return;

    const totalAmountOverall = totalAmount - deliveryFee - deliveryTip;

    if (Number(totalAmountOverall) < Number(couponInfo.min_purchase)) {
      removeCoupon(); // ← clears Redux + setCouponDiscount + localStorage ek sath
      toast.error(
        `Coupon removed! Minimum order amount is ${getAmountWithSign(couponInfo.min_purchase)}`,
        { id: "coupon-auto-remove" } // duplicate toast prevent
      );
    }
  }, [totalAmount, deliveryFee, deliveryTip]); // cart change pe re-run

  const handleApply = async () => {
    if (!couponCode) return;
    setIsApplying(true);          // Loader start
    try {
      await refetch();            // Coupon apply
      setOpenDialog(false);       // Dialog close
    } finally {
      setIsApplying(false);       // Loader stop
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    if (!couponCode) return true; // show all if empty

    const searchText = couponCode.toLowerCase();

    const codeMatch = coupon.code?.toLowerCase().includes(searchText);
    const titleMatch = coupon.title?.toLowerCase().includes(searchText);
    const discountMatch = String(coupon.discount)?.includes(searchText);
    const dateMatch = coupon.expire_date?.toLowerCase().includes(searchText);

    return codeMatch || titleMatch || discountMatch || dateMatch;
  });

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        spacing={2}
        mb={2.5}
        mt={3}
      >
        <Typography
          fontSize="18px"
          fontWeight={600}
          color="#000"
          whiteSpace="nowrap"
        >
          Redeem
        </Typography>
        <Stack
          flex={1}
          height="2px"
          sx={{
            background:
              "linear-gradient(to right, #e0e0e0 0%, #e0e0e0 60%, rgba(224,224,224,0) 100%)",
          }}
        />
      </Stack>
      <Grid
        item
        md={12}
        xs={12}
        sm={12}
        pr={{ xs: "0px", sm: "4px", md: "0px" }}
        onClick={() => setOpenDialog(true)}
        sx={{
          // border:"1px solid #e0e0e0",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          width: "100%",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        {couponInfo ? (
          <Grid item xs={12} sm={12} md={12}>
            <HadCouponBox removeCoupon={removeCoupon} couponInfo={couponInfo} />
          </Grid>
        ) : (
          <Grid
            item
            md={12}
            xs={12}
            sm={12}
            // pr={{ xs: "0px", sm: "4px", md: "6px" }}
            onClick={() => setOpenDialog(true)}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              padding: "13px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              width: "100%",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <Grid container justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
              <Grid item display="flex" alignItems="center">
                <img
                  src="/Discount1.svg"
                  alt="Apply Offer Icon"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                />
                <span style={{ fontSize: "14px", color: "#3C3C3C" }}>Apply offer</span>
              </Grid>
              {/* <Grid item>
                <span style={{ fontSize: "30px", color: "#3c3c3c" }}>â€º</span>
              </Grid> */}
              <Grid item>
                <ArrowForwardIosIcon sx={{ fontSize: "18px", color: "#3c3c3c", mt: "5px" }} />
              </Grid>

            </Grid>
          </Grid>
        )}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            minHeight: '500px',
            padding: '16px',
          },
        }}
      ><Typography variant="h6" fontWeight="bold" ml={3} mb={0} >
          Apply Coupon
        </Typography>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <InputField
                variant="outlined"
                sx={{
                  height: "100%",
                  border: `1px solid #1A914B`,
                  borderRadius: "5px !important",
                }}
              >
                <InputBase
                  placeholder={t("Enter Your Coupon..")}
                  sx={{
                    flex: 1,
                    width: "100%",
                    padding: "5px 10px 5px",
                    [theme.breakpoints.down("sm")]: {
                      fontSize: "12px",
                    },
                  }}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value.startsWith(" ")) return;
                    setCouponCode(value);
                  }}
                  value={couponCode || ""}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleApply();
                    }
                  }}
                />
              </InputField>
            </Grid>
          </Grid>

          <Typography variant="h6" fontWeight="bold" mt={2}>
            Available Coupons
          </Typography>
          <Grid container spacing={2} mt={1}>
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <CouponCardSkeleton key={item} />
                ))}
              </>
            )
              : isError ? (
                <Typography>Error fetching coupons</Typography>
              ) : filteredCoupons.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    minHeight: "200px", // adjust height if needed
                  }}
                >
                  <img
                    src="\noCouponFound.png" // your image in public folder
                    alt="No Coupon Found"
                    style={{ maxWidth: "350px", maxHeight: "350px" }}
                  />
                </Box>
              ) : (

                filteredCoupons.map((coupon) => {
                  const isExpired = coupon.expire_date ? new Date(coupon.expire_date) < new Date() : false;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={coupon.id}>
                      <Box
                        onClick={async () => {
                          if (isExpired) return; // expired coupon click par kuch na ho
                          setCouponCode(coupon.code);
                          await handleApply();
                        }}
                        sx={{
                          position: "relative",
                          display: "flex",
                          backgroundColor: isExpired ? "#e0e0e0" : "#f1f8f7",
                          borderRadius: "12px",
                          overflow: "hidden",
                          cursor: isExpired ? "not-allowed" : "pointer",
                          minHeight: "130px",
                          width: "100%",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: isExpired ? "none" : "scale(1.02)",
                            boxShadow: isExpired ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
                          },
                          "&::before, &::after": {
                            content: '""',
                            position: "absolute",
                            width: "26px",
                            height: "26px",
                            backgroundColor: "#fff",
                            borderRadius: "50%",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 2,
                          },
                          "&::before": { left: "-13px" },
                          "&::after": { right: "-13px" },
                        }}
                      >
                        {/* Left Section */}
                        <Box
                          sx={{
                            width: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRight: "1px dashed #2e7d32",
                            margin: "16px 0",
                            paddingLeft: "5px",
                            ml: 1
                          }}
                        >
                          <Typography
                            sx={{
                              transform: "rotate(-90deg)",
                              whiteSpace: "nowrap",
                              fontSize: "9px",
                              fontWeight: "800",
                              color: "#2e7d32",
                              border: "1.5px dashed #2e7d32",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px"
                            }}
                          >
                            COUPON DISCOUNT
                          </Typography>
                        </Box>

                        {/* Right Section */}
                        <Box
                          sx={{
                            flex: 1,
                            padding: "12px 16px 12px 18px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            overflow: "hidden",
                            mr: 3
                          }}
                        >
                          <Typography
                            noWrap
                            sx={{
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#2e7d32",
                              mb: 0.2
                            }}
                          >
                            {coupon.title || "Exclusive Offer"}
                          </Typography>

                          <Typography sx={{ fontSize: "12px", color: "#555", mb: 0.5 }}>
                            {coupon.discount_type === "amount" ? `Flat ${coupon.discount} off*` : `${coupon.discount}% off*`}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: "18px",
                              fontWeight: "900",
                              color: "#333",
                              mb: 0.5,
                            }}
                          >
                            {coupon.code}
                          </Typography>

                          <Typography sx={{ fontSize: "10px", color: "#999", mb: 1.2 }}>
                            Valid until {coupon.expire_date || "28 Feb 2026"}
                          </Typography>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                border: "1px dashed #2e7d32",
                                borderRadius: "4px",
                                padding: "2px 8px",
                                backgroundColor: "#DFF0ED",
                                color: "#2e7d32",
                                fontWeight: "700",
                                fontSize: "12px",
                                opacity: isExpired ? 0.5 : 1
                              }}
                            >
                              {coupon.code}
                            </Box>
                            <Box sx={{ color: "#777", display: "flex", opacity: 0.6 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            </Box>
                          </Stack>
                        </Box>
                      </Box>
                    </Grid>
                  )
                })


              )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              color: "#1A914B",
              border: "1px solid #1A914B",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            Cancel
          </Button>
          <Tooltip
            title={!couponCode ? "Please select a coupon first" : ""}
            arrow
            placement="top"
          >
            <span>
              <Button
                onClick={() => {
                  if (!couponCode || isApplying) return;
                  handleApply();
                }}
                sx={{
                  backgroundColor: "#1A914B",
                  color: "#FFFFFF",
                  border: "1px solid transparent",
                  textTransform: "none",
                  cursor: couponCode ? "pointer" : "not-allowed",
                  opacity: 1, // always fully visible

                  "&:hover": {
                    backgroundColor: couponCode
                      ? "#147a3f"
                      : "#1A914B", // no hover effect if no coupon
                  },
                }}
              >
                {isApplying ? (
                  <Box
                    component="span"
                    sx={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid white",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  "Apply"
                )}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>

        {/* CSS for loader animation */}
        <style>
          {`
  @keyframes spin {
    0% { transform: rotate(0deg);}
    100% { transform: rotate(360deg);}
  }
`}
        </style>


        {/* CSS for loader animation */}
        <style>
          {`
  @keyframes spin {
    0% { transform: rotate(0deg);}
    100% { transform: rotate(360deg);}
  }
`}
        </style>


      </Dialog>
    </>
  );
};

export default HaveCoupon