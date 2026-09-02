import React from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import ParcelPaymentMethod from "./item-checkout/ParcelPaymentMethod";
import OtherModulePayment from "./item-checkout/OtherModulePayment";

// ─── Pure CSS shimmer ────────────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite linear",
  borderRadius: "6px",
};

// Inject keyframes once into <head> — safe to call multiple times
const injectShimmerKeyframes = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("shimmer-keyframes")) return;
  const style = document.createElement("style");
  style.id = "shimmer-keyframes";
  style.innerHTML = `
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
};

// ─── Single shimmer block (reusable shape) ───────────────────────────────────
const ShimmerBlock = ({ width, height, style = {} }) => {
  injectShimmerKeyframes();
  return (
    <div
      style={{
        width,
        height,
        minWidth: width,
        ...shimmerStyle,
        ...style,
      }}
    />
  );
};

// ─── One payment row shimmer ─────────────────────────────────────────────────
const PaymentRowSkeleton = ({ dividerBottom = false }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 16px",
      borderBottom: dividerBottom ? "1px solid #e0e0e0" : "none",
    }}
  >
    {/* Left: icon + two lines */}
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      {/* Icon placeholder */}
      <ShimmerBlock
        width="26px"
        height="26px"
        style={{ borderRadius: "6px" }}
      />

      {/* Text lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <ShimmerBlock width="140px" height="13px" />
        <ShimmerBlock width="100px" height="11px" />
      </div>
    </div>

    {/* Right: radio circle */}
    <ShimmerBlock width="22px" height="22px" style={{ borderRadius: "50%" }} />
  </div>
);

// ─── Full payment block skeleton ─────────────────────────────────────────────
const PaymentMethodSkeleton = () => (
  <div
    style={{
      border: "1px solid #e0e0e0",
      borderRadius: "10px",
      overflow: "hidden",
      backgroundColor: "#fff",
    }}
  >
    <PaymentRowSkeleton dividerBottom={true} /> {/* Wallet */}
    <PaymentRowSkeleton dividerBottom={true} /> {/* Digital 1 */}
    <PaymentRowSkeleton dividerBottom={true} /> {/* Digital 2 */}
    <PaymentRowSkeleton dividerBottom={false} /> {/* COD */}
  </div>
);

// ─── Loading check ───────────────────────────────────────────────────────────
// ✅ CHANGE: ab sirf configData pe wait karenge. zoneData / isZoneDigital
// async (Google API) hone ki wajah se der se aate hain, aur unke liye
// OtherModulePayment/ParcelPaymentMethod ke andar optimistic default use hoga.
// Isse payment methods turant render honge, loader ka wait khatam.
const isDataLoading = (configData) => !configData;

// ─── Main component ──────────────────────────────────────────────────────────
const PaymentMethod = ({
  paymentMethod,
  setPaymentMethod,
  paidBy,
  orderPlace,
  isLoading,
  zoneData,
  forprescription,
  configData,
  orderType,
  parcel,
  setOpenModel,
  offlinePaymentOptions,
  usePartialPayment,
  setPaymentMethodImage,
  setSwitchToWallet,
  isZoneDigital,
  getParcelPayment,
}) => {
  // Show custom shimmer skeleton sirf jab configData bhi na aaya ho
  // (yeh case rare/instant hota hai, so skeleton bahut kam dikhega ab)
  if (isDataLoading(configData)) {
    return (
      <CustomStackFullWidth spacing={2} p="0px">
        <PaymentMethodSkeleton />
      </CustomStackFullWidth>
    );
  }

  return (
    <CustomStackFullWidth spacing={2} p="0px">
      {parcel === "true" ? (
        <ParcelPaymentMethod
          setPaymentMethod={setPaymentMethod}
          paymentMethod={paymentMethod}
          zoneData={zoneData}
          configData={configData}
          orderType={orderType}
          parcel={parcel}
          paidBy={paidBy}
          orderPlace={orderPlace}
          isLoading={isLoading}
          offlinePaymentOptions={offlinePaymentOptions}
          setPaymentMethodImage={setPaymentMethodImage}
          getParcelPayment={getParcelPayment}
        />
      ) : (
        <OtherModulePayment
          setPaymentMethod={setPaymentMethod}
          paymentMethod={paymentMethod}
          zoneData={zoneData}
          configData={configData}
          orderType={orderType}
          setOpenModel={setOpenModel}
          usePartialPayment={usePartialPayment}
          forprescription={forprescription}
          offlinePaymentOptions={offlinePaymentOptions}
          setPaymentMethodImage={setPaymentMethodImage}
          setSwitchToWallet={setSwitchToWallet}
          isZoneDigital={isZoneDigital}
        />
      )}
    </CustomStackFullWidth>
  );
};

export default PaymentMethod;



