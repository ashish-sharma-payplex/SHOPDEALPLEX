import { useEffect, useState } from "react";
import { Box, styled } from "@mui/material";
import HeaderComponent from "../../../src/components/header";
import FooterComponent from "../../../src/components/footer";
import { CustomStackFullWidth } from "../../../src/styled-components/CustomStyles.style";
import PaymentSuccess from "../../../src/components/home/module-wise-components/utility/PaymentSuccess";
import { useRouter } from "next/router";

const MainLayoutRoot = styled("div")({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
});

const serviceImageMap = {
  "education-fees": "/utility/educationfees.svg",
  electricity: "/utility/ElectricBill.svg",
  "loan-repayment": "/utility/loanrepayment.svg",
  gas: "/utility/gas-pipe.svg",
  water: "/utility/water.svg",
  "mobile-postpaid": "/utility/postpaid.svg",
  "housing-society": "/utility/housing.svg",
  "broadband-postpaid": "/utility/broadband.svg",
  insurance: "/utility/insurance.svg",
  "landline-postpaid": "/utility/device-landline-phone.svg",
  fastag: "/utility/fastag.svg",
  "cable-tv": "/utility/postpaid.svg",
  "municipal-taxes": "/utility/muncipal.svg",
  "life-insurance": "/utility/lifeinsurance.svg",
  dth: "/utility/DTHrecharge.svg",
  "credit-card": "/utility/cards.svg",
  "hospital-and-pathology": "/utility/pathology.svg",
  "municipal-services": "/utility/muncipal.svg",
  "lpg-gas": "/utility/LPG.svg",
  "clubs-and-associations": "/utility/club&association.svg",
  subscription: "/utility/subcription.svg",
  "health-insurance": "/utility/healthinsurance.svg",
  "mobile-prepaid": "/utility/recharge.svg",
  "recurring-deposit": "/utility/recharge.svg",
  hospital: "/utility/hospital.svg",
  rental: "/utility/rental.svg",
  b2b: "/utility/b2b.svg",
  "metro-recharge": "/utility/train-front.svg",
  "ncmc-recharge": "/utility/recharge.svg",
  donation: "/utility/donation.svg",
  "national-pension-system": "/utility/recharge.svg",
  "prepaid-meter": "/utility/prepaid.svg",
  "agent-collection": "/utility/agentcollection.svg",
  echallan: "/utility/eChallan.svg",
  "ev-recharge": "/utility/EVrecharge.svg",
};

const UtilitySuccessPage = () => {
  const router = useRouter();
  const slug = router.query?.slug || "";

  const [apiResponse, setApiResponse] = useState(null);
  const [amount, setAmount] = useState("");
  const [billerName, setBillerName] = useState("");
  const [consumerNumber, setConsumerNumber] = useState("");
  const [billInfo, setBillInfo] = useState({});

  const serviceIcon = serviceImageMap[slug] || "/utility/recharge.svg";
  const serviceName = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";


  const handleNeedHelp = () => {
    router.push("/utility?section=help");
  };

  useEffect(() => {
    try {
      // ── 1. Pay API response ──────────────────────────────────────────────
      const rawPayRes = sessionStorage.getItem("bbps_payment_response");
      // console.log("💰 PAY RESPONSE:", rawPayRes ? JSON.parse(rawPayRes) : "❌ EMPTY");

      if (rawPayRes) {
        const parsed = JSON.parse(rawPayRes);
        setApiResponse(parsed);
        if (parsed?.amount) setAmount(String(parsed.amount));
      }

      // ── 2. QR session ────────────────────────────────────────────────────
      const rawQr = sessionStorage.getItem("bbps_qr_data");
      // console.log("📱 QR DATA:", rawQr ? JSON.parse(rawQr) : "❌ EMPTY");

      if (rawQr) {
        const qr = JSON.parse(rawQr);
        if (qr?.amount) setAmount((prev) => prev || String(qr.amount));
        if (qr?.biller_name) setBillerName(qr.biller_name);
        const firstParm = qr?.customerParms?.[0]?.value || "";
        if (firstParm) setConsumerNumber(firstParm);
      }

      // ── 3. Biller name fallback ──────────────────────────────────────────
      const storedBillerName = sessionStorage.getItem("bbps_biller_name");
      // console.log("🏢 BILLER NAME:", storedBillerName || "❌ EMPTY");

      if (storedBillerName) setBillerName((prev) => prev || storedBillerName);

      // ── 4. Bill data → billInfo grid ─────────────────────────────────────
      const rawBill = sessionStorage.getItem("bbps_bill_data");
      // console.log("📄 BILL DATA:", rawBill ? JSON.parse(rawBill) : "❌ EMPTY");

      if (rawBill) {
        const bill = JSON.parse(rawBill);
        const info = {};

        (bill?.additionalInfo || []).forEach((f) => {
          if (f?.name && f?.value) info[f.name] = f.value;
        });
        (bill?.billDetails || []).forEach((f) => {
          if (f?.name && f?.value) info[f.name] = f.value;
        });
        if (bill?.billerResponse?.customerName)
          info["Customer Name"] = bill.billerResponse.customerName;
        if (bill?.billerResponse?.billNumber)
          info["Bill Number"] = bill.billerResponse.billNumber;

        // console.log("✅ FINAL billInfo:", info); // ← sabse zaroori log

        if (!amount && bill?.billerResponse?.amount)
          setAmount(String(bill.billerResponse.amount));

        const firstParm = bill?.customerParms?.[0]?.value || "";
        if (firstParm) setConsumerNumber((prev) => prev || firstParm);

        setBillInfo(info);
      }
    } catch (e) {
      // console.error("❌ ERROR in success page:", e);
    }
  }, []);

  const handleBackToHome = () => {
    sessionStorage.removeItem("bbps_payment_response");
    sessionStorage.removeItem("bbps_qr_data");
    sessionStorage.removeItem("bbps_bill_data");
    sessionStorage.removeItem("bbps_biller_name");
    sessionStorage.removeItem("bbps_biller_id");
    router.push("/utility");
  };

  return (
    <MainLayoutRoot>
      <header style={{ display: "flex", alignItems: "center" }}>
        <HeaderComponent />
      </header>

      <CustomStackFullWidth
        sx={{
          width: "100%",
          px: "5%",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            maxWidth: "480px",
            width: "100%",
            marginTop: { xs: "80px", sm: "120px" },
            marginBottom: "40px",
          }}
        >
          <PaymentSuccess
            apiResponse={apiResponse}
            amount={amount}
            serviceType={serviceName}
            billerName={billerName}
            consumerNumber={consumerNumber}
            billerLogo={serviceIcon}
            billInfo={billInfo}
            onBackToHome={handleBackToHome}
             onNeedHelp={handleNeedHelp}
          />
        </Box>
      </CustomStackFullWidth>

      <footer
        style={{
          width: "100%",
          backgroundColor: "#F8F8F8",
          display: "flex",
          justifyContent: "center",
          padding: "20px 0",
        }}
      >
        <Box>
          <FooterComponent />
        </Box>
      </footer>
    </MainLayoutRoot>
  );
};

export default UtilitySuccessPage;