// src\components\checkout\item-checkout\index.js
import { useTheme } from "@emotion/react";
import { alpha, Grid, Typography, useMediaQuery } from "@mui/material";
import { Stack } from "@mui/system";
import { baseUrl } from "api-manage/MainApi";
import { OrderApi } from "api-manage/another-formated-api/orderApi";
import { ProfileApi } from "api-manage/another-formated-api/profileApi";
import {
  onErrorResponse,
  onSingleErrorResponse,
} from "api-manage/api-error-response/ErrorResponses";
import { GoogleApi } from "api-manage/hooks/react-query/googleApi";
import { useOfflinePayment } from "api-manage/hooks/react-query/offlinePayment/useOfflinePayment";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { getStoresOrRestaurants } from "helper-functions/getStoresOrRestaurants";
import { getGuestId, getToken } from "helper-functions/getToken";
import moment from "moment/moment";
import Router from "next/router";
import React, { useEffect, useReducer, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  setClearCart,
  setRemoveItemFromCart,
  setTotalAmount,
} from "redux/slices/cart";
import {
  setOfflineInfoStep,
  setOfflineMethod,
  setOrderDetailsModal,
} from "redux/slices/offlinePaymentData";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import {
  CustomPaperBigCard,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import {
  formatPhoneNumber,
  getDayNumber,
  getDigitalMethodFromZone,
  getFinalTotalPrice,
  getInfoFromZoneData,
  getProductDiscount,
  getTaxableTotalPrice,
  getVariation,
  handleDistance,
  isAvailable,
  isFoodAvailableBySchedule,
} from "utils/CustomFunctions";
import { today, tomorrow } from "utils/formatedDays";
import { cod_exceeds_message } from "utils/toasterMessages";
import useGetOfflinePaymentOptions from "../../../api-manage/hooks/react-query/offlinePayment/useGetOfflinePaymentOptions";
import useGetVehicleCharge from "../../../api-manage/hooks/react-query/order-place/useGetVehicleCharge";
import useGetStoreDetails from "../../../api-manage/hooks/react-query/store/useGetStoreDetails";
import useGetMostTrips from "../../../api-manage/hooks/react-query/useGetMostTrips";
import ItemSelectWithChip from "../../ItemSelectWithChip";
import CustomModal from "../../modal";
import { handleValuesFromCartItems } from "../../product-details/product-details-section/helperFunction";
import { CouponTitle } from "../CheckOut.style";
import DeliveryManTip from "../DeliveryManTip";
import SinglePrescriptionUpload from "../Prescription/SinglePrescriptionUpload";
import AddPaymentMethod from "./AddPaymentMethod";
import CheckoutStepper from "./CheckoutStepper";
import Cutlery from "./Cutlery";
import DeliveryDetails from "./DeliveryDetails";
import HaveCoupon from "./HaveCoupon";
import OrderCalculation from "./OrderCalculation";
import OrderSummaryDetails from "./OrderSummaryDetails";
import PartialPayment from "./PartialPayment";
import PartialPaymentModal from "./PartialPaymentModal";
import PlaceOrder from "./PlaceOrder";
import { INITIAL_STATE, scheduleReducer } from "./ScheduleReducer";
import { deliveryInstructions, productUnavailableData } from "./demoData";
import OfflineForm from "./offline-payment/OfflineForm";
import useGetCashBackAmount from "api-manage/hooks/react-query/cashback/useGetCashBackAmount";
import { ModuleTypes } from "helper-functions/moduleTypes";
import {
  setGuestUserInfo,
  setGuestUserOrderId,
} from "redux/slices/guestUserInfo";
import {
  setOrderDetailsModalOpen,
  setOrderInformation,
} from "redux/slices/utils";
import CustomImageContainer from "../../CustomImageContainer";
import thunderstorm from "../assets/thunderstorm.svg";
import { useFormik } from "formik";
import { calculateOrderPrice } from "utils/priceEngine";
import { normalizeCartList } from "utils/normalizeCart";

import * as Yup from "yup";
import ProductList from "components/product-page/ProductList";
import CheckOutSelectedAddress from "./CheckOutSelectedAddress";
import { setCouponInfo } from "redux/slices/profileInfo";

const ItemCheckout = (props) => {
  const { configData, router, page, cartList, campaignItemList, totalAmount } =
    props;

  const normalizedCartList = React.useMemo(() => {
    return normalizeCartList(cartList || []);
  }, [cartList]);

  // ✅ FINAL SHAPE FOR CHECKOUT UI
  const finalCheckoutCartList = normalizedCartList.map((item) => ({
    ...item,

    // ✅ name & image ke liye
    name: item?.product?.name,
    image_full_url: item?.product?.image_full_url,

    // ✅ VARIATION (RegularOrders expects `variation`)
    variation: item?.food_variations || item?.variation || [],

    // ✅ ADDONS (RegularOrders expects `addons`)
    addons: item?.product?.addons?.filter((a) => a.isChecked) || [],
  }));

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [enabled, setEnabled] = useState(
    normalizedCartList?.length ? true : false,
  );

  const [check, setCheck] = React.useState(null);
  const [orderType, setOrderType] = useState("delivery");
  const [payableAmount, setPayableAmount] = useState(null);
  const [address, setAddress] = useState(undefined);
  const { couponInfo } = useSelector((state) => state.profileInfo);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [numberOfDay, setDayNumber] = useState(getDayNumber(today));
  const [offlinePayments, setOfflinePayments] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [scheduleAt, setScheduleAt] = useState("now");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total_order_amount, setTotalOrderAmount] = useState(0);
  const [deliveryTip, setDeliveryTip] = useState(
    () => parseFloat(localStorage.getItem("deliveryTip")) || 0,
  );
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isImageSelected, setIsImageSelected] = useState([]);
  const [cutlery, setCutlery] = useState(0);
  const [unavailable_item_note, setUnavailable_item_note] = useState(null);
  const [delivery_instruction, setDelivery_instruction] = useState(null);
  const [usePartialPayment, setUsePartialPayment] = useState(false);
  const [switchToWallet, setSwitchToWallet] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openPartialModel, setOpenPartialModel] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [offlineCheck, setOfflineCheck] = useState(false);
  const [cashbackAmount, setCashbackAmount] = useState(null);
  const [isPackaging, setIsPackaging] = useState(false);
  const [packagingCharge, setPackagingCharge] = useState(0);
  const [paymentMethodImage, setPaymentMethodImage] = useState("");
  const [state, customDispatch] = useReducer(scheduleReducer, INITIAL_STATE);
  const { profileInfo } = useSelector((state) => state.profileInfo);
  const { guestUserInfo } = useSelector((state) => state.guestUserInfo);
  const { offlinePaymentInfo } = useSelector((state) => state.offlinePayment);
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  const [editAddress, setEditAddress] = useState(null);

  const handleDropdownChange = (index) => {
    // If the same dropdown is clicked, toggle it; else, open the new one
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const token = getToken();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const guest_id = getGuestId();
  const { method } = router.query;
  const formik = useFormik({
    initialValues: {
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required(t("Password is required"))
        .min(6, t("Password is too short - should be 6 chars minimum.")),
      confirm_password: Yup.string()
        .required(t("Confirm Password"))
        .oneOf([Yup.ref("password"), null], t("Passwords must match")),
    }),
  });

  const currentModuleType = getCurrentModuleType();
  const firstItem = normalizedCartList?.[0];

  const storeId =
    page === "campaign"
      ? campaignItemList?.[0]?.store_id
      : firstItem?.product?.store_id;

  // console.group("🏪 STORE ID CHECK (BUY NOW)");

  // console.groupEnd();

  useEffect(() => {
    const currentModule = JSON.parse(localStorage.getItem("module"));

    try {
      const saved = localStorage.getItem("coupon");
      if (!saved) return;

      const parsed = JSON.parse(saved);

      const isSameModule = parsed?._module_id === currentModule?.id;
      const isSameStore = parsed?._store_id === storeId;

      if (!isSameModule || !isSameStore) {
        // ❌ Different module/store — coupon hatao
        localStorage.removeItem("coupon");
        dispatch(setCouponInfo(null));
        setCouponDiscount(null);
        return;
      }

      // ✅ Same module + store — restore karo
      if (couponInfo && parsed?.code === couponInfo?.code) {
        setCouponDiscount(parsed);
      }
    } catch (e) {
      localStorage.removeItem("coupon");
    }
  }, [storeId]); // storeId change hone par bhi re-run karega

  const { data: storeData, refetch } = useGetStoreDetails(storeId);

  const { data: tripsData } = useGetMostTrips();
  const { mutate: offlineMutate, isLoading: offlinePaymentLoading } =
    useOfflinePayment();
  const {
    data: offlinePaymentOptions,
    refetch: refetchOfflinePaymentOptions,
    isLoading: offlineIsLoading,
  } = useGetOfflinePaymentOptions();

  const passwordHandler = (value) => {
    formik.setFieldValue("password", value);
  };
  const confirmPasswordHandler = (value) => {
    formik.setFieldValue("confirm_password", value);
  };

  useEffect(() => {
    refetchOfflinePaymentOptions();
  }, []);
  useEffect(() => {
    if (storeId) {
      refetch();
    }
  }, [storeId]);

  useEffect(() => {
    const currentLatLng = JSON.parse(localStorage.getItem("currentLatLng"));
    const location = localStorage.getItem("location");
    setAddress({
      ...currentLatLng,
      latitude: currentLatLng?.lat,
      longitude: currentLatLng?.lng,
      address: location,
      address_type: "Selected sadfAddress",
    });
    refetch();
  }, []);
  const currentLatLng = JSON.parse(
    window.localStorage.getItem("currentLatLng"),
  );
  const { data: zoneData } = useQuery(
    ["zoneId", location],
    async () => GoogleApi.getZoneId(currentLatLng),
    {
      retry: 1,
    },
  );

  const {
    data: distanceData,
    refetch: refetchDistance,
    isLoading,
  } = useQuery(
    ["get-distance", storeData, address],
    () => GoogleApi.distanceApi(storeData, address),
    {
      enabled: false,
      onError: onErrorResponse,
    },
  );
  const tempDistance = handleDistance(
    distanceData?.data?.rows?.[0]?.elements,
    { latitude: storeData?.latitude, longitude: storeData?.longitude },
    address,
  );

  const {
    data: extraCharge,
    isLoading: extraChargeLoading,
    refetch: extraChargeRefetch,
  } = useGetVehicleCharge({ tempDistance });
  useEffect(() => {
    if (distanceData) {
      extraChargeRefetch();
    }
  }, [distanceData]);
  const handleChange = (event) => {
    setDayNumber(event.target.value);
  };
  //order post api
  const { mutate: orderMutation, isLoading: orderLoading } = useMutation(
    "order-place",
    OrderApi.placeOrder,
  );
  const userOnSuccessHandler = (res) => {};
  const { isLoading: customerLoading, data: customerData } = useQuery(
    ["profile-info"],
    ProfileApi.profileInfo,
    {
      onSuccess: userOnSuccessHandler,
      onError: onSingleErrorResponse,
    },
  );
  useEffect(() => {}, [customerData]);

  useEffect(() => {
    const currentLatLng = JSON.parse(localStorage.getItem("currentLatLng"));
    const location = localStorage.getItem("location");
    setAddress({
      ...currentLatLng,
      latitude: currentLatLng?.lat,
      longitude: currentLatLng?.lng,
      address: location,
      address_type: "Selected Address",
    });
    refetch();
  }, []);
  useEffect(() => {
    storeData && address && refetchDistance();
  }, [storeData, address]);

  const priceSummary = React.useMemo(() => {
    if (!storeData) return null;

    return calculateOrderPrice({
      cartList: normalizedCartList,
      storeData,
      couponDiscount,
      referDiscount:
        profileInfo?.is_valid_for_discount && customerData?.data
          ? customerData.data.discount_amount || 0
          : 0,
      deliveryFee,
      deliveryTip,
      packagingCharge,
      additionalCharge:
        configData?.additional_charge_status === 1
          ? configData?.additional_charge
          : 0,
    });
  }, [
    normalizedCartList,
    storeData,
    couponDiscount,
    deliveryFee,
    deliveryTip,
    packagingCharge,
    configData,
    profileInfo,
    customerData,
  ]);

  useEffect(() => {
    if (priceSummary?.total >= 0) {
      setPayableAmount(priceSummary.total);
      dispatch(setTotalAmount(priceSummary.total));
    }
  }, [priceSummary]);

  const handleOffineOrder = () => {
    const offlinePaymentData = {
      ...offlinePaymentInfo,
      order_id: orderId,
      guest_id: guest_id,
    };
    dispatch(setOfflineInfoStep(3));
    dispatch(setOrderDetailsModal(true));
    offlineMutate(offlinePaymentData);
  };

  //orderId
  //offlinePaymentInfo
  useEffect(() => {
    if (offlineCheck) {
      handleOffineOrder();
    }
  }, [orderId]);

  const handleProductList = (productList, totalQty) => {
    return productList?.map((cartList) => {
      return {
        add_on_ids:
          cartList?.selectedAddons?.length > 0
            ? cartList?.selectedAddons?.map((add) => {
                return add.id;
              })
            : [],
        add_on_qtys:
          cartList?.selectedAddons?.length > 0
            ? cartList?.selectedAddons?.map((add) => {
                totalQty += add.quantity;
                return totalQty;
              })
            : [],
        add_ons:
          cartList?.selectedAddons?.length > 0
            ? cartList?.selectedAddons?.map((add) => {
                return {
                  id: add.id,
                  name: add.name,
                  price: add.price,
                };
              })
            : [],
        item_id: cartList?.id,
        item_campaign_id: cartList?.available_date_starts ? cartList?.id : null,
        item_type: cartList?.available_date_starts
          ? "AppModelsItemCampaign"
          : "AppModelsItem",
        price: cartList?.price,
        quantity: cartList?.quantity,
        variant:
          cartList?.module_type === "food"
            ? getVariation(cartList?.variation)
            : [],
        //new variation form needs to added here
        variation:
          cartList?.module_type === "food"
            ? cartList?.food_variations?.length > 0
              ? cartList?.food_variations?.map((variation) => {
                  return {
                    name: variation.name,
                    values: {
                      label: handleValuesFromCartItems(variation.values),
                    },
                  };
                })
              : []
            : cartList?.selectedOption?.length > 0
            ? cartList?.selectedOption
            : [],
      };
    });
  };

  const cartData = cartList;

  useEffect(() => {
    // Ensure totalAmount is a valid number and format it to 2 decimal places
    if (typeof totalAmount === "number" && !isNaN(totalAmount)) {
      // console.log("Formatted Total Amount: ", totalAmount.toFixed(2));
    } else {
      // console.log("Invalid totalAmount value: ", totalAmount);
    }
  }, [totalAmount]); // Make sure totalAmount is in the dependency array
  // Call this function on page load or whenever you need to prepare the order payload

const handleOrderMutationObject = (carts, productList) => {
  const guestId = getToken() ? "" : guest_id;
  const isDigital =
    paymentMethod !== "cash_on_delivery" &&
    paymentMethod !== "wallet" &&
    paymentMethod !== "offline_payment" &&
    paymentMethod !== ""
      ? "digital_payment"
      : paymentMethod;

  const originData = {
    latitude: storeData?.latitude,
    longitude: storeData?.longitude,
  };

  // ✅ FIX: ek jagah se contact info resolve karo — dono branches (pharmacy + normal) isi ko use karenge
  const resolvedContactName = token
    ? address?.contact_person_name
      ? address?.contact_person_name
      : `${profileInfo?.f_name || ""} ${profileInfo?.l_name || ""}`.trim()
    : guestUserInfo?.contact_person_name;

  const resolvedContactNumber = token
    ? address?.contact_person_number
      ? address?.contact_person_number
      : profileInfo?.phone
    : `+${guestUserInfo?.contact_person_number}`;

  const resolvedContactEmail = token
    ? address?.contact_person_email
      ? address?.contact_person_email
      : profileInfo?.email
    : guestUserInfo?.contact_person_email;

  if (getCurrentModuleType() === "pharmacy") {
    const formData = new FormData();
    formData.append("cart", JSON.stringify(carts));
    if (scheduleAt !== "now") {
      formData.append("schedule_at", scheduleAt);
    }

    formData.append("payment_method", isDigital);
    formData.append("order_type", "delivery");

    formData.append("store_id", storeData?.id);
    if (couponDiscount?.code) {
      formData.append("coupon_code", couponDiscount?.code);
    }

    formData.append("coupon_discount_amount", couponDiscount?.discount);
    formData.append("coupon_discount_title", couponDiscount?.title);

    formData.append("discount_amount", getProductDiscount(productList));
    formData.append(
      "distance",
      handleDistance(
        distanceData?.data?.rows?.[0]?.elements,
        originData,
        address,
      ),
    );
    formData.append("order_amount", totalAmount.toFixed(2));
    formData.append("dm_tips", deliveryTip);

    formData.append("address", address?.address);
    formData.append("address_type", address?.address_type);
    formData.append("lat", address?.lat);
    formData.append("latitude", address?.latitude);
    formData.append("lng", address?.lng);
    formData.append("longitude", address?.longitude);
    formData.append("guest_id", guestId);
    formData.append(
      "is_buy_now",
      page === "buy_now" || page === "campaign" ? 1 : 0,
    );
    formData.append("house", token ? address?.house : guestUserInfo?.house);
    formData.append("floor", token ? address?.floor : guestUserInfo?.floor);
    formData.append("road", token ? address?.road : guestUserInfo?.road);

    // ✅ FIX: pehle ye sirf guestUserInfo dekh raha tha, ab token-based fallback chain use ho raha hai
    formData.append("contact_person_name", resolvedContactName);
    formData.append("contact_person_number", resolvedContactNumber);
    formData.append("contact_person_email", resolvedContactEmail);

    if (isImageSelected?.length > 0) {
      isImageSelected?.forEach((item) =>
        formData.append("order_attachment", item),
      );
    }
    formData.append(
      "extra_packaging_amount",
      packagingCharge > 0 ? packagingCharge : 0,
    );
    formData.append("create_new_user", check ? 1 : 0);
    formData.append("is_guest", token ? 0 : 1);
    formData.append("password", formik.values.password);

    // 🔍 DEBUG — Pharmacy flow
    const debugObj = {};
    for (let [key, value] of formData.entries()) {
      debugObj[key] = value;
    }
    console.log("📦 FINAL ORDER PAYLOAD (Pharmacy):", debugObj);
    console.log("👤 USER INFO CHECK (Pharmacy):", {
      is_logged_in_user: !!token,
      is_guest: !token,
      contact_person_name: debugObj["contact_person_name"],
      contact_person_number: debugObj["contact_person_number"],
      contact_person_email: debugObj["contact_person_email"],
      house: debugObj["house"],
      floor: debugObj["floor"],
      road: debugObj["road"],
      guest_id: debugObj["guest_id"],
      profileInfo_available: !!profileInfo,
      profileInfo_f_name: profileInfo?.f_name,
      profileInfo_l_name: profileInfo?.l_name,
      profileInfo_phone: profileInfo?.phone,
      profileInfo_email: profileInfo?.email,
      guestUserInfo_available: !!guestUserInfo,
      guestUserInfo_raw: guestUserInfo,
      address_object: address,
    });

    return formData;
  } else {
    const order = {
      cart: JSON.stringify(carts),
      ...address,
      is_buy_now: page === "buy_now" || page === "campaign" ? 1 : 0,
      partial_payment: usePartialPayment,
      schedule_at: scheduleAt === "now" ? null : scheduleAt,
      payment_method: isDigital,
      order_type: orderType === "schedule_order" ? "delivery" : orderType,
      store_id: storeData?.id,
      coupon_code: couponDiscount?.code,
      coupon_discount_amount: couponDiscount?.discount,
      coupon_discount_title: couponDiscount?.title,
      discount_amount: getProductDiscount(productList),
      distance: handleDistance(
        distanceData?.data?.rows?.[0]?.elements,
        originData,
        address,
      ),
      order_amount: totalAmount.toFixed(2),
      dm_tips: deliveryTip,
      cutlery: cutlery,
      unavailable_item_note: unavailable_item_note,
      delivery_instruction: delivery_instruction,
      guest_id: guestId,

      // ✅ FIX: resolved variables use ho rahe hain (profileInfo?.name wrong tha, ab f_name+l_name)
      contact_person_name: resolvedContactName,
      contact_person_number: formatPhoneNumber(resolvedContactNumber),
      contact_person_email: resolvedContactEmail,

      house: token ? address?.house : guestUserInfo?.house,
      floor: token ? address?.floor : guestUserInfo?.floor,
      road: token ? address?.road : guestUserInfo?.road,
      extra_packaging_amount: packagingCharge > 0 ? packagingCharge : 0,
      create_new_user: check ? 1 : 0,
      password: formik.values.password,
      is_guest: token ? 0 : 1,
    };

    // 🔍 DEBUG — Normal flow (Food/Grocery/E-commerce etc.)
    console.log("📦 FINAL ORDER PAYLOAD:", order);
    console.log("👤 USER INFO CHECK:", {
      is_logged_in_user: !!token,
      is_guest: !token,
      contact_person_name: order.contact_person_name,
      contact_person_number: order.contact_person_number,
      contact_person_email: order.contact_person_email,
      house: order.house,
      floor: order.floor,
      road: order.road,
      guest_id: order.guest_id,
      profileInfo_available: !!profileInfo,
      profileInfo_f_name: profileInfo?.f_name,
      profileInfo_l_name: profileInfo?.l_name,
      profileInfo_phone: profileInfo?.phone,
      profileInfo_email: profileInfo?.email,
      guestUserInfo_available: !!guestUserInfo,
      guestUserInfo_raw: guestUserInfo,
      address_object: address,
      payment_method: paymentMethod,
    });

    return order;
  }
};

  const validateOrderParameters = () => {
    // Validate amount, delivery charges, and other parameters before placing order
    if (!totalAmount || totalAmount <= 0) {
      toast.error(t("Total amount is invalid."));
      return false;
    }
    if (deliveryFee === null || deliveryFee < 0) {
      toast.error(t("Delivery fee is invalid."));
      return false;
    }
    if (payableAmount === null || payableAmount < 0) {
      toast.error(t("Payable amount is invalid."));
      return false;
    }
    // COD limit validation moved to handlePlaceOrderBasedOnAvailability to avoid premature error
    // Add more validations as needed
    return true;
  };

  const handlePlaceOrder = () => {
    if (!validateOrderParameters()) {
      return; // Stop if validation fails
    }
    const itemsList = page === "campaign" ? campaignItemList : cartList;
    const isAvailable =
      storeData?.schedule_order && getCurrentModuleType() === ModuleTypes.FOOD
        ? isFoodAvailableBySchedule(itemsList, scheduleAt)
        : true;
    if (isAvailable) {
      const walletAmount = customerData?.data?.wallet_balance;
      let productList = page === "campaign" ? campaignItemList : cartList;
      if (paymentMethod === "wallet") {
        if (Number(walletAmount) < Number(totalAmount)) {
          toast.error(t("Wallet balance is below total amount."), {
            id: "wallet",
            position: "top-center",
          });
        } else {
          let totalQty = 0;
          let carts =
            getCurrentModuleType() === "pharmacy"
              ? cartList
              : handleProductList(productList, totalQty);
          const handleSuccessSecond = (response) => {
            // 🔴 CHECK BACKEND ERRORS FIRST
            if (response?.data?.errors && response.data.errors.length > 0) {
              toast.error(response.data.errors[0].message, {
                position: "top-center",
              });
              return; // STOP EXECUTION
            }

            if (response?.data) {
              if (token) {
                dispatch(setOrderDetailsModal(true));
              }
              if (paymentMethod === "digital_payment") {
                toast.success(response?.data?.message);
                const newBaseUrl = baseUrl;
                const page = "my-orders";
                const callBackUrl = token
                  ? `${window.location.origin}/profile?page=${page}`
                  : `${window.location.origin}/order?order_id=${response?.data?.order_id}&total=${response?.data?.total_ammount}`;
                const url = `${newBaseUrl}/payment-mobile?order_id=${
                  response?.data?.order_id
                }&customer_id=${
                  customerData?.data?.id ?? guest_id
                }&callback=${callBackUrl},`;
                localStorage.setItem("totalAmount", totalAmount);
                dispatch(setClearCart());
                Router.push(url);
              } else if (paymentMethod === "wallet") {
                toast.success(response?.data?.message);
                setOrderId(response?.data?.order_id);
                setOrderSuccess(true);
              } else {
                if (response.status === 203) {
                  toast.error(response.data.errors[0].message);
                }
                //setOrderSuccess(true)
              }
            }
          };
          if (carts?.length > 0) {
            let order = handleOrderMutationObject(carts, productList);
            orderMutation(order, {
              onSuccess: handleSuccessSecond,
              onError: (error) => {
                error?.response?.data?.errors?.forEach((item) =>
                  toast.error(item.message, {
                    position: "top-center",
                  }),
                );
              },
            });
          }
        }
      } else {
        let totalQty = 0;
        let carts = handleProductList(productList, totalQty);
        const handleSuccess = (response) => {
          if (response?.data) {
            if (token) {
              dispatch(setOrderDetailsModal(true));
            } else {
              dispatch(setGuestUserOrderId(response?.data?.order_id));
              dispatch(setOrderInformation(response?.data));
              dispatch(setOrderDetailsModalOpen(true));
              dispatch(setGuestUserInfo(null));
            }
            if (
              paymentMethod === "cash_on_delivery" ||
              paymentMethod === "offline_payment" ||
              paymentMethod === "wallet"
            ) {
              toast.success(response?.data?.message, {
                id: paymentMethod,
              });
            }
            if (
              paymentMethod !== "cash_on_delivery" &&
              paymentMethod !== "offline_payment"
            ) {
              const payment_platform = "web";
              const page = "my-orders";
              const callBackUrl = token
                ? `${window.location.origin}/profile?page=${page}`
                : `${window.location.origin}/home`;
              const url = `${baseUrl}/payment-mobile?order_id=${
                response?.data?.order_id
              }&customer_id=${
                customerData?.data?.id ?? response?.data?.user_id
                  ? response?.data?.user_id
                  : guest_id
              }&payment_platform=${payment_platform}&callback=${callBackUrl}&payment_method=${paymentMethod}`;
              localStorage.setItem("totalAmount", totalAmount);
              dispatch(setGuestUserInfo(null));
              //dispatch(setClearCart());
              Router.push(url, undefined, { shallow: true });
              localStorage.removeItem("deliveryTip"); // Remove deliveryTip from localStorage
            } else if (paymentMethod === "offline_payment") {
              setOrderId(response?.data?.order_id);
              dispatch(setOrderInformation(response?.data));
              setOrderSuccess(true);

              setOfflineCheck(true);
              localStorage.removeItem("deliveryTip"); // Remove deliveryTip from localStorage
            } else {
              setOrderId(response?.data?.order_id);
              dispatch(setOrderInformation(response?.data));
              setOrderSuccess(true);
              localStorage.removeItem("deliveryTip"); // Remove deliveryTip from localStorage
            }
          }
        };
        if (carts?.length > 0) {
          let order = handleOrderMutationObject(carts, productList);
          orderMutation(order, {
            onSuccess: handleSuccess,
            onError: (error) => {
              error?.response?.data?.errors?.forEach((item) =>
                toast.error(item.message, {
                  position: "top-center",
                }),
              );
            },
          });
        }
      }
    } else {
      toast.error(
        t(
          "One or more item is not available for the chosen preferable schedule time. ",
        ),
      );
    }
  };

  const isStoreOpen = () => {
    return isSchedules();
  };
  const storeCloseToast = () =>
    toast.error(
      t(`${getStoresOrRestaurants().slice(0, -1)} is closed. Try again later.`),
    );
  //totalAmount
  const handlePlaceOrderBasedOnAvailability = () => {
    //cod -> cash on delivery
    const codLimit =
      getInfoFromZoneData(zoneData)?.pivot?.maximum_cod_order_amount;

    if (orderType === "take_away") {
      handlePlaceOrder();
    } else {
      if (
        paymentMethod === "cash_on_delivery" &&
        codLimit &&
        getCurrentModuleType() !== "pharmacy"
      ) {
        if (totalAmount <= codLimit) {
          handlePlaceOrder();
        } else {
          toast.error(t(cod_exceeds_message), {
            duration: 5000,
          });
        }
      } else {
        // no COD limit set or paymentMethod not COD or pharmacy module, just place the order
        handlePlaceOrder();
      }
    }
  };

  const isSchedules = () => {
    if (storeData?.schedules.length > 0) {
      const todayInNumber = moment().weekday();
      let isOpen = false;
      let filteredSchedules = storeData?.schedules.filter(
        (item) => item.day === todayInNumber,
      );
      let isAvailableNow = [];

      filteredSchedules.forEach((item) => {
        if (isAvailable(item?.opening_time, item?.closing_time)) {
          isAvailableNow.push(item);
        }
      });

      if (isAvailableNow.length > 0) {
        isOpen = true;
      } else {
        isOpen = false;
      }

      return isOpen; // Add this line to return true or false based on whether the store is open.
    }
  };
  // ✅ NAYA placeOrder LAGAO:
  const placeOrder = () => {
    // ✅ Pharmacy module me prescription validation
    if (currentModuleType === "pharmacy") {
      const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      // Agar koi file selected hai to uski validity check karo
      if (isImageSelected?.length > 0) {
        const file = isImageSelected[0];
        const fileExtension = file.name.split(".").pop().toLowerCase();

        const isExtensionValid = allowedExtensions.includes(fileExtension);
        const isMimeValid = allowedMimeTypes.includes(file.type);

        if (!isExtensionValid || !isMimeValid) {
          toast.error(
            t(
              "Invalid file type. Sirf images (jpg, jpeg, png, webp) upload kar sakte hain.",
            ),
            { duration: 4000 },
          );
          setIsImageSelected([]); // invalid file clear karo
          return; // ❌ checkout block
        }
      }
    }

    // ✅✅ RACE-CONDITION FIX: storeData abhi tak API se aaya hi nahi hai
    // (useGetStoreDetails async hai). Isse pehle "store closed" bol dena
    // galat tha — actual store status pata hi nahi tha. Ab yaha ruk ke
    // user ko wait karne bolo aur refetch trigger kar do.
    if (!storeData) {
      toast.error(
        t("Please wait a moment, store details are still loading..."),
        { id: "store-loading", duration: 2500 },
      );
      refetch();
      return;
    }

    // ✅ Normal store open/close check
    if (storeData?.active) {
      if (isSchedules()) {
        handlePlaceOrderBasedOnAvailability();
      } else {
        storeCloseToast();
      }
    } else {
      storeCloseToast();
    }
  };

  const couponRemove = () => {};
  useEffect(() => {
    if (orderSuccess) {
      handleOrderSuccess();
    }
  }, [orderSuccess]);

  const handleOrderSuccess = () => {
    if (page === "buysetScheduleAt_now") {
      dispatch(setRemoveItemFromCart(cartList?.[0]));
    }

    // ✅ Coupon clear karo — order complete hone ke baad
    setCouponDiscount(null);
    dispatch(setCouponInfo(null));
    localStorage.removeItem("coupon");

    localStorage.setItem("totalAmount", totalAmount);
    if (!token) {
      Router.push("/home");
    } else {
      Router.push(
        {
          pathname: "/profile",
          query: {
            orderId: orderId,
            page: "my-orders",
            from: "checkout",
          },
        },
        undefined,
        { shallow: false },
      );
    }
  };

  // ✅ NAYA handleImageUpload LAGAO:
  const handleImageUpload = (file) => {
    if (!file) return;

    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    const fileExtension = file.name.split(".").pop().toLowerCase();
    const isExtensionValid = allowedExtensions.includes(fileExtension);
    const isMimeValid = allowedMimeTypes.includes(file.type);

    if (!isExtensionValid || !isMimeValid) {
      toast.error(
        t(
          "Only image files are allowed (jpg, jpeg, png, webp). PDF, Word, Excel, and documents are not allowed.",
        ),
        { duration: 4000 },
      );
      setIsImageSelected([]); // Clear invalid file
      return; // Block further upload if file is not valid
    }

    setIsImageSelected([file]); // Store valid file for upload
  };

  const handlePartialPayment = () => {
    if (payableAmount > customerData?.data?.wallet_balance) {
      setUsePartialPayment(true);
      setPaymentMethod("");
      dispatch(setOfflineMethod(""));
    } else {
      setPaymentMethod("wallet");
      setSwitchToWallet(true);
      dispatch(setOfflineMethod(""));
    }
  };
  const removePartialPayment = () => {
    if (payableAmount > customerData?.data?.wallet_balance) {
      setUsePartialPayment(false);
      setPaymentMethod("");
      dispatch(setOfflineMethod(""));
    } else {
      setPaymentMethod("");
      setSwitchToWallet(false);
      dispatch(setOfflineMethod(""));
    }
  };
  const handlePartialPaymentCheck = () => {
    if (configData?.partial_payment_status === 1) {
      if (couponDiscount && usePartialPayment) {
        if (
          payableAmount > customerData?.data?.wallet_balance &&
          !usePartialPayment
        ) {
          setOpenPartialModel(true);
        } else {
          if (
            usePartialPayment &&
            customerData?.data?.wallet_balance > payableAmount
          ) {
            setOpenModal(true);
          }
        }
      } else if ((deliveryTip > 0 && usePartialPayment) || switchToWallet) {
        if (payableAmount > customerData?.data?.wallet_balance) {
          setOpenPartialModel(true);
        } else {
          if (
            usePartialPayment &&
            customerData?.data?.wallet_balance > payableAmount
          ) {
            setOpenModal(true);
          }
        }
      } else if (orderType && usePartialPayment) {
        if (
          payableAmount > customerData?.data?.wallet_balance &&
          !usePartialPayment
        ) {
          setOpenPartialModel(true);
        } else {
          if (
            usePartialPayment &&
            customerData?.data?.wallet_balance > payableAmount
          ) {
            setOpenModal(true);
          }
          //setOpenModal(true);
        }
      }
    }
  };
  const handleCashbackAmount = (data) => {
    setCashbackAmount(data);
  };
  const { refetch: refetchCashbackAmount } = useGetCashBackAmount({
    amount: payableAmount,
    handleSuccess: handleCashbackAmount,
  });
  useEffect(() => {
    handlePartialPaymentCheck();
    if (payableAmount > 0) {
      refetchCashbackAmount();
    }
  }, [payableAmount]);

  // console.log("payable amount here ; ", payableAmount);

  const agreeToPartial = () => {
    setPaymentMethod("");
    setUsePartialPayment(true);
    setOpenPartialModel(false);
    setSwitchToWallet(false);
  };
  const notAgreeToPartial = () => {
    setUsePartialPayment(false);
    setOpenPartialModel(false);
    setSwitchToWallet(false);
  };
  const agreeToWallet = () => {
    setPaymentMethod("wallet");
    setSwitchToWallet(true);
    setUsePartialPayment(false);
    setOpenModal(false);
  };
  const notAgreeToWallet = () => {
    setPaymentMethod("");
    setSwitchToWallet(false);
    setUsePartialPayment(false);
    setOpenModal(false);
  };
  const handleCutlery = (status) => {
    if (status) {
      setCutlery(1);
    } else {
      setCutlery(1);
    }
  };
  const handleItemUnavailableNote = (value) => {
    setUnavailable_item_note(value);
  };
  const handleDeliveryInstructionNote = (value) => {
    setDelivery_instruction(value);
  };
  useEffect(() => {
    if (paymentMethod !== "wallet") {
      setSwitchToWallet(false);
    }
  }, [paymentMethod]);
  const handleBadWeatherUi = (zoneWiseData) => {
    const currentZoneInfo = zoneWiseData?.find(
      (item) => item.id === storeData?.zone_id,
    );

    // console.log("normalizedCartList in checkout page", normalizedCartList);
    // console.log(
    //   "finalCheckoutCartList in checkout page",
    //   finalCheckoutCartList,
    // );

    if (currentZoneInfo) {
      if (currentZoneInfo?.increased_delivery_fee_status === 1) {
        return (
          <>
            {currentZoneInfo?.increase_delivery_charge_message && (
              <CustomStackFullWidth
                alignItems="center"
                justifyContent="flex-start"
                gap="10px"
                direction="row"
                mt="10px"
                sx={{
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.3),
                  borderRadius: "4px",
                  padding: "5px 10px",
                }}
              >
                <CustomImageContainer
                  height="40px"
                  width="40px"
                  src={thunderstorm.src}
                  objectFit="contained"
                />

                <Typography>
                  {currentZoneInfo?.increase_delivery_charge_message}
                </Typography>
              </CustomStackFullWidth>
            )}
          </>
        );
      }
    }
  };
  const handleExtraPackaging = (e) => {
    setIsPackaging(e.target.checked);
  };

  useEffect(() => {
    if (isPackaging) {
      setPackagingCharge(storeData?.extra_packaging_amount);
    } else {
      setPackagingCharge(0);
    }
  }, [isPackaging]);
  const isZoneDigital = getDigitalMethodFromZone(
    storeData?.zone_id,
    zoneData?.data,
  );

  const isZoneCod = () => {};
  const hasOnlyPaymentMethod = () => {
    if (
      !configData?.cash_on_delivery &&
      configData?.customer_wallet_status !== 1 &&
      configData?.offline_payment_status !== 1 &&
      configData?.digital_payment &&
      configData?.active_payment_method_list?.length === 1 &&
      isZoneDigital?.digital_payment
    ) {
      setPaymentMethod(configData?.active_payment_method_list[0]?.gateway);
      setPaymentMethodImage(
        configData?.active_payment_method_list[0]?.gateway_image_full_url,
      );
    }
  };

  useEffect(() => {
    hasOnlyPaymentMethod();
  }, [configData, isZoneDigital]);

  useEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Additional scroll to top after a delay to ensure component is fully rendered
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);

    // One more scroll to top after component is fully loaded
    const finalTimeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(finalTimeoutId);
    };
  }, [page]); // Re-run when page type changes

  // Auto scroll functionality for order summary
  const [isAutoScrolling, setIsAutoScrolling] = useState(false); // Start with false for buy_now
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const simpleBarRef = useRef(null);

  useEffect(() => {
    if (!simpleBarRef.current) return;

    const simpleBarElement = simpleBarRef.current.getScrollElement();
    if (!simpleBarElement) return;

    let scrollInterval;
    let scrollDirection = 1; // 1 for down, -1 for up
    let currentScrollTop = 0;

    // Only enable auto-scroll for cart and campaign pages, not buy_now
    const shouldAutoScroll = page !== "buy_now";

    const startAutoScroll = () => {
      if (!shouldAutoScroll || !isAutoScrolling || isManualScrolling) return;

      scrollInterval = setInterval(() => {
        if (!simpleBarElement) return;

        const maxScrollTop =
          simpleBarElement.scrollHeight - simpleBarElement.clientHeight;

        if (currentScrollTop >= maxScrollTop) {
          scrollDirection = -1; // Change direction to scroll up
        } else if (currentScrollTop <= 0) {
          scrollDirection = 1; // Change direction to scroll down
        }

        currentScrollTop += scrollDirection * 1; // Scroll 1px at a time
        simpleBarElement.scrollTop = currentScrollTop;
      }, 50); // Scroll every 50ms for smooth movement
    };

    const handleManualScroll = () => {
      setIsManualScrolling(true);
      clearInterval(scrollInterval);

      // Resume auto-scroll after 3 seconds of no manual interaction
      setTimeout(() => {
        setIsManualScrolling(false);
        if (shouldAutoScroll) {
          startAutoScroll();
        }
      }, 3000);
    };

    const handleMouseEnter = () => {
      setIsAutoScrolling(false);
      clearInterval(scrollInterval);
    };

    const handleMouseLeave = () => {
      if (shouldAutoScroll) {
        setIsAutoScrolling(true);
        startAutoScroll();
      }
    };

    // Add event listeners
    simpleBarElement.addEventListener("scroll", handleManualScroll);
    simpleBarElement.addEventListener("mouseenter", handleMouseEnter);
    simpleBarElement.addEventListener("mouseleave", handleMouseLeave);

    // Start auto-scroll only for cart and campaign pages
    if (shouldAutoScroll) {
      setIsAutoScrolling(true);
      startAutoScroll();
    }

    return () => {
      clearInterval(scrollInterval);
      if (simpleBarElement) {
        simpleBarElement.removeEventListener("scroll", handleManualScroll);
        simpleBarElement.removeEventListener("mouseenter", handleMouseEnter);
        simpleBarElement.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isAutoScrolling, isManualScrolling, page]);

  return (
    <>
      <CustomStackFullWidth
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          mb: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {method === "offline" ? (
          <CustomStackFullWidth>
            <Grid container spacing={{ xs: 2, md: 8 }}>
              <Grid item xs={12} md={12}>
                {/* <CheckoutStepper />/ */}
                <CustomStackFullWidth
                  marginTop={{ xs: "1.5rem", md: "2.5rem" }}
                  alignItems="center"
                >
                  <CustomPaperBigCard
                    sx={{
                      width: { xs: "100%", sm: "90%", md: "100%" },
                    }}
                  >
                    <OfflineForm
                      offlinePaymentOptions={offlinePaymentOptions}
                      total_order_amount={payableAmount}
                      placeOrder={placeOrder}
                      offlinePaymentLoading={
                        offlinePaymentLoading || orderLoading
                      }
                      usePartialPayment={usePartialPayment}
                    />
                  </CustomPaperBigCard>
                </CustomStackFullWidth>
              </Grid>
            </Grid>
          </CustomStackFullWidth>
        ) : (
          <Grid
            container
            spacing={4}
            mb="2rem"
            paddingTop={{ xs: "1.5rem", md: "2.5rem" }}
            // border="1px solid #2bff00"
          >
            {/* left portion */}

            <Grid item xs={12} md={5} sx={{ pr: { md: 3 } }}>
              <CustomStackFullWidth>
                {currentModuleType === "pharmacy" && (
                  <CustomPaperBigCard
                    sx={{ marginBottom: "1rem" }}
                    padding={isSmall ? "0px" : "0rem"}
                    noboxshadow={"true"}
                    backgroundcolor={
                      isSmall && theme.palette.background.default
                    }
                  >
                    <SinglePrescriptionUpload
                      t={t}
                      handleImageUpload={handleImageUpload}
                      borderRadius="10px"
                    />
                  </CustomPaperBigCard>
                )}
                <CustomPaperBigCard
                  height="auto"
                  padding={isSmall ? "0px" : "0rem"}
                  noboxshadow={"true"}
                  backgroundcolor={isSmall && theme.palette.background.default}
                >
                  <Stack justifyContent="space-between">
                    <Stack
                      direction="row"
                      alignItems="center"
                      width="100%"
                      spacing={2}
                      mb={1}
                    >
                      <Typography
                        fontSize="18px"
                        fontWeight={600}
                        color="#000"
                        whiteSpace="nowrap"
                      >
                        {t("Review Items")}
                      </Typography>

                      <Stack
                        flex={1}
                        height="3px"
                        sx={{
                          background:
                            "linear-gradient(to right, #e0e0e0 0%, #e0e0e0 60%, rgba(224,224,224,0) 100%)",
                        }}
                      />
                    </Stack>

                    {zoneData && handleBadWeatherUi(zoneData?.data?.zone_data)}
                    <SimpleBar
                      style={{
                        maxHeight: "500px",
                        width: "100%",
                      }}
                    >
                      <OrderSummaryDetails
                        page={page}
                        configData={configData}
                        cartList={finalCheckoutCartList}
                        t={t}
                        campaignItemList={campaignItemList}
                        isSmall={isSmall}
                      />
                    </SimpleBar>
                    {storeData && token && (
                      <HaveCoupon
                        store_id={storeData?.id}
                        setCouponDiscount={setCouponDiscount}
                        counponRemove={couponRemove}
                        couponDiscount={couponDiscount}
                        totalAmount={totalAmount}
                        deliveryFee={deliveryFee}
                        deliveryTip={deliveryTip}
                        setSwitchToWallet={setSwitchToWallet}
                        walletBalance={customerData?.data?.wallet_balance}
                        payableAmount={payableAmount}
                      />
                    )}
                    {configData?.customer_wallet_status === 1 &&
                      customerData?.data?.wallet_balance > 0 &&
                      configData?.partial_payment_status === 1 && (
                        <Grid item md={12} xs={12}>
                          <PartialPayment
                            remainingBalance={
                              customerData?.data?.wallet_balance - payableAmount
                            }
                            handlePartialPayment={handlePartialPayment}
                            usePartialPayment={usePartialPayment}
                            walletBalance={customerData?.data?.wallet_balance}
                            paymentMethod={paymentMethod}
                            switchToWallet={switchToWallet}
                            removePartialPayment={removePartialPayment}
                            payableAmount={payableAmount}
                          />
                        </Grid>
                      )}
                    {getCurrentModuleType() === "food" &&
                      storeData?.cutlery && (
                        <Cutlery
                          isChecked={cutlery}
                          handleChange={handleCutlery}
                        />
                      )}
                    <CustomStackFullWidth sx={{ width: "100%" }}>
                      {/* Inside your checkout form */}
                      <Grid item xs={12} md={12}>
                        <ItemSelectWithChip
                          sx={{
                            // color: "#d72a00",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                          showingTitle="Product Not Available"
                          title="If Any Product is not available"
                          data={productUnavailableData}
                          handleChange={handleItemUnavailableNote}
                          isOpen={openDropdown === 0} // Check if this dropdown should be open
                          onToggle={() => handleDropdownChange(0)} // Toggle this dropdown
                        />
                        <ItemSelectWithChip
                          showingTitle="Delivery Instructions"
                          title="Add More Delivery Instruction"
                          data={deliveryInstructions}
                          handleChange={handleDeliveryInstructionNote}
                          isOpen={openDropdown === 1} // Check if this dropdown should be open
                          onToggle={() => handleDropdownChange(1)} // Toggle this dropdown
                        />
                      </Grid>
                    </CustomStackFullWidth>

                    <DeliveryDetails
                      storeData={storeData}
                      setOrderType={setOrderType}
                      orderType={orderType}
                      setAddress={setAddress}
                      address={address}
                      customDispatch={customDispatch}
                      scheduleTime={state.scheduleTime}
                      setDayNumber={setDayNumber}
                      setDeliveryTip={setDeliveryTip}
                      handleChange={handleChange}
                      today={today}
                      tomorrow={tomorrow}
                      numberOfDay={numberOfDay}
                      configData={configData}
                      setScheduleAt={setScheduleAt}
                      formik={formik}
                      passwordHandler={passwordHandler}
                      confirmPasswordHandler={confirmPasswordHandler}
                      check={check}
                      setCheck={setCheck}
                    />

                    <Stack
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "10px",
                        p: 2,
                      }}
                    >
                      <DeliveryManTip
                        orderType={orderType}
                        deliveryTip={deliveryTip}
                        setDeliveryTip={setDeliveryTip}
                        isSmall={isSmall}
                        tripsData={tripsData}
                        setUsePartialPayment={setUsePartialPayment}
                      />
                    </Stack>
                  </Stack>
                </CustomPaperBigCard>
              </CustomStackFullWidth>
            </Grid>

            {/* Right Portion */}

            <Grid item xs={12} md={7} sx={{ pl: { md: 3 } }}>
              <Stack
                spacing={{ xs: 2, sm: 2, md: 3 }}
                pb={{ xs: "1rem", sm: "2rem", md: "4rem" }}
                // border={"1px solid #ff0000"}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  width="100%"
                  spacing={2}
                  mb={1}
                >
                  <Typography
                    fontSize="18px"
                    fontWeight={600}
                    color="#000"
                    whiteSpace="nowrap"
                  >
                    {t("Bill Summary")}
                  </Typography>

                  <Stack
                    flex={1}
                    height="3px"
                    sx={{
                      background:
                        "linear-gradient(to right, #e0e0e0 0%, #e0e0e0 60%, rgba(224,224,224,0) 100%)",
                    }}
                  />
                </Stack>

                <OrderCalculation
                  usePartialPayment={usePartialPayment}
                  cartList={
                    page === "campaign"
                      ? campaignItemList
                      : finalCheckoutCartList
                  }
                  storeData={storeData}
                  couponDiscount={couponDiscount}
                  taxAmount={taxAmount}
                  distanceData={distanceData}
                  total_order_amount={total_order_amount.toFixed(2)}
                  configData={configData}
                  couponInfo={couponInfo}
                  orderType={orderType}
                  deliveryTip={deliveryTip}
                  origin={{
                    latitude: storeData?.latitude,
                    longitude: storeData?.longitude,
                  }}
                  destination={address}
                  zoneData={zoneData}
                  extraCharge={extraCharge && extraCharge}
                  setDeliveryFee={setDeliveryFee}
                  extraChargeLoading={extraChargeLoading}
                  walletBalance={customerData?.data?.wallet_balance}
                  setPayableAmount={setPayableAmount}
                  additionalCharge={
                    configData?.additional_charge_status === 1 &&
                    configData?.additional_charge
                  }
                  payableAmount={payableAmount}
                  cashbackAmount={cashbackAmount}
                  handleExtraPackaging={handleExtraPackaging}
                  isPackaging={isPackaging}
                  packagingCharge={packagingCharge}
                  customerData={customerData}
                  initVauleEx={storeData?.extra_packaging_amount}
                  isLoading={isLoading}
                  /* 🔹 NEW – ADD ONLY (no existing break) */
                  normalizedCartList={normalizedCartList}
                  priceSummary={priceSummary}
                />

                {/* <CheckoutStepper /> */}
                {/* {zoneData && ( */}
                <AddPaymentMethod
                  setPaymentMethod={setPaymentMethod}
                  paymentMethod={paymentMethod}
                  zoneData={zoneData}
                  configData={configData}
                  orderType={orderType}
                  usePartialPayment={usePartialPayment}
                  offlinePaymentOptions={offlinePaymentOptions}
                  setSwitchToWallet={setSwitchToWallet}
                  isZoneDigital={isZoneDigital}
                  setPaymentMethodImage={setPaymentMethodImage}
                  paymentMethodImage={paymentMethodImage}
                />
                {/* )} */}

                <Stack
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    p: 3,
                  }}
                >
                  <CheckOutSelectedAddress
                    address={address}
                    setAddress={setAddress}
                    refetch={refetch}
                    configData={configData}
                    editAddress={editAddress}
                    setEditAddress={setEditAddress}
                  />

                  <PlaceOrder
                    placeOrder={placeOrder}
                    orderLoading={orderLoading}
                    zoneData={zoneData}
                    storeData={storeData}
                    isSchedules={isSchedules}
                    storeCloseToast={storeCloseToast}
                    page={page}
                    isLoading={isLoading}
                  />
                </Stack>

                <Grid item md={12} xs={12}></Grid>
              </Stack>
            </Grid>

            {openModal && (
              <CustomModal
                openModal={openModal}
                //handleClose={() => setOpenModal(false)}
              >
                <PartialPaymentModal
                  payableAmount={payableAmount}
                  agree={agreeToWallet}
                  reject={notAgreeToWallet}
                  colorTitle=" Want to pay via your wallet ? "
                  title="You can pay the full amount with your wallet."
                  remainingBalance={
                    customerData?.data?.wallet_balance - payableAmount
                  }
                />
              </CustomModal>
            )}
            {openPartialModel && (
              <CustomModal
                openModal={openPartialModel}
                //handleClose={() => setOpenPartialModel(false)}
              >
                <PartialPaymentModal
                  payableAmount={payableAmount}
                  agree={agreeToPartial}
                  reject={notAgreeToPartial}
                  colorTitle=" Want to pay partially with wallet ? "
                  title="You do not have sufficient balance to pay full amount via wallet."
                />
              </CustomModal>
            )}
          </Grid>
        )}
      </CustomStackFullWidth>
    </>
  );
};

ItemCheckout.propTypes = {};

export default ItemCheckout;



