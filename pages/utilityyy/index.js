// pages/utility/index.js
import { Box, styled } from "@mui/material";
import { CustomStackFullWidth } from "../../src/styled-components/CustomStyles.style";
import HeaderComponent from "../../src/components/header";
import FooterComponent from "../../src/components/footer";
import RechargeDashboard from "../../src/components/home/module-wise-components/utility/RechargeDashboard";
import UtilityBillDetails from "../../src/components/home/module-wise-components/utility/UtilityBillDetails";
import PayUsingQR from "../../src/components/home/module-wise-components/utility/PayUsingQR";
import PaymentSuccess from "../../src/components/home/module-wise-components/utility/PaymentSuccess";
import PayViaWallet from "../..//src/components/home/module-wise-components/utility/PaymentWithWallet";

const MainLayoutRoot = styled("div")({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
});

const UtilityLayout = () => {
  return (
    <MainLayoutRoot>
      <header style={{ display: "flex", alignItems: "center" }}>
        <HeaderComponent />
      </header>

      <CustomStackFullWidth
        sx={{
          width: "100%",
          px: "5%",
          alignItems: "center !important",
          justifyContent: "center !important",
          alignContent: "center !important",
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            maxWidth: "1280px",
            width: "100%",
            marginTop: { xs: "80px", sm: "160px" },
          }}
        >
          <RechargeDashboard />

          {/* <UtilityBillDetails /> */}
          {/* <PayUsingQR /> */}
          {/* <PaymentSuccess /> */}
          {/* <PayViaWallet /> */}
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
        <Box
          sx={{
            backgroundColor: "pink",
            padding: "10px 20px",
            borderRadius: "5px",
          }}
        >
          <FooterComponent />
        </Box>
      </footer>
    </MainLayoutRoot>
  );
};

export default UtilityLayout;
