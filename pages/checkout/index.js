import CssBaseline from "@mui/material/CssBaseline";
import { getCartListModuleWise } from "../../src/helper-functions/getCartListModuleWise";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import PrescriptionCheckout from "../../src/components/checkout/Prescription";
import RedirectWhenCartEmpty from "../../src/components/checkout/RedirectWhenCartEmpty";
import ItemCheckout from "../../src/components/checkout/item-checkout";
import ParcelCheckout from "../../src/components/checkout/parcel";
import CustomContainer from "../../src/components/container";
import MainLayout from "../../src/components/layout/MainLayout";
import AuthGuard from "../../src/components/route-guard/AuthGuard";
import SEO from "../../src/components/seo";

import { getImageUrl } from "utils/CustomFunctions";
import useScrollToTop from "api-manage/hooks/custom-hooks/useScrollToTop";
import { setConfigData } from "redux/slices/configData";
import { useGetConfigData } from "../../src/api-manage/hooks/useGetConfigData";

import { getCorrectCart } from "../../src/helper-functions/getCorrectCart";
import { getToken, getGuestId } from "helper-functions/getToken";
import { Toaster } from "react-hot-toast";

const CheckOutPage = () => {
  useScrollToTop();
  const dispatch = useDispatch();
  const router = useRouter();
  const { page, store_id } = router.query;

  const { landingPageData, configData } = useSelector(
    (state) => state.configData
  );

  /* ===========================
     ✅ CORRECT CART SOURCE
  =========================== */
  const rawCartList = useSelector(getCorrectCart);

  const {
    campaignItemList,
    buyNowItemList,
    totalAmount,
  } = useSelector((state) => state.cart);

  /* ===========================
     FINAL CART (AFTER STATE)
  =========================== */
  const finalCartList =
  page === "buy_now"
    ? buyNowItemList   // 👈 DIRECT PASS
    : getCartListModuleWise(rawCartList);


  const token = getToken();
  const guestId = getGuestId();

  const { data: dataConfig, refetch: configRefetch } = useGetConfigData();


  useEffect(() => {
  // console.log("🟡 RAW buyNowItemList (redux):", buyNowItemList);
  // console.log(
  //   "🔴 AFTER getCartListModuleWise:",
  //   getCartListModuleWise(buyNowItemList)
  // );
}, [buyNowItemList]);

  /* ===========================
     🔍 CHECKOUT DEBUG LOGS
  =========================== */
  useEffect(() => {
    // console.group("🛒 CHECKOUT PAGE DEBUG (FIXED)");

    // console.log("➡️ isGuest:", !token);
    // console.log("➡️ token:", token);
    // console.log("➡️ guestId:", guestId);

    // console.log("➡️ rawCartList (getCorrectCart):", rawCartList);
    // console.log("➡️ rawCartList length:", rawCartList?.length);

    // console.log("➡️ finalCartList:", finalCartList);
    // console.log("➡️ finalCartList length:", finalCartList?.length);


    // console.log("➡️ campaignItemList length:", campaignItemList?.length);
    // console.log("➡️ buyNowItemList length:", buyNowItemList?.length);
    // console.log("➡️ totalAmount:", totalAmount);

    // console.groupEnd();
  }, [
    page,
    rawCartList,
    finalCartList,  
    campaignItemList,
    buyNowItemList,
    totalAmount,
    token,
    guestId,
  ]);

  /* ===========================
     CONFIG FETCH
  =========================== */
  useEffect(() => {
    if (!configData) {
      // console.log("⚙️ Config missing → refetching");
      configRefetch();
    }
  }, [configData]);

  useEffect(() => {
    if (dataConfig) {
      // console.log("✅ Config loaded");
      dispatch(setConfigData(dataConfig));
    }
  }, [dataConfig]);

  return (
    <>
     <Toaster position="top-center" reverseOrder={false} />
      <CssBaseline />

      <SEO
        configData={configData}
        title={configData ? "Checkout" : "Loading..."}
        image={`${getImageUrl(
          { value: configData?.logo_storage },
          "business_logo_url",
          configData
        )}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
      />

      <MainLayout configData={configData} landingPageData={landingPageData}>
        <CustomContainer>
          <AuthGuard from="checkout">
            {page === "parcel" && <ParcelCheckout configData={configData} />}

            {page === "prescription" && (
              <PrescriptionCheckout
                storeId={store_id}
                configData={configData}
              />
            )}

            {page === "campaign" && campaignItemList.length > 0 && (
              <ItemCheckout
                router={router}
                configData={configData}
                page={page}
                cartList={finalCartList}
                campaignItemList={campaignItemList}
                totalAmount={totalAmount}
              />
            )}

            {page === "cart" && (
              <ItemCheckout
                router={router}
                configData={configData}
                page={page}
                cartList={finalCartList}
                campaignItemList={campaignItemList}
                totalAmount={totalAmount}
              />
            )}

            {page === "buy_now" && buyNowItemList.length > 0 && (
              <ItemCheckout
                router={router}
                configData={configData}
                page={page}
                cartList={finalCartList}
                campaignItemList={campaignItemList}
                totalAmount={totalAmount}
              />
            )}


            {/* ✅ IMPORTANT: now uses correct cart */}
            <RedirectWhenCartEmpty
              page={page}
              cartList={
                page === "buy_now" ? buyNowItemList : rawCartList
              }
              campaignItemList={campaignItemList}
              buyNowItemList={buyNowItemList}
            />

          </AuthGuard>
        </CustomContainer>
      </MainLayout>
    </>
  );
};

export default CheckOutPage;
