// pages/utility/[slug]/index.js
import { Box, styled } from "@mui/material";
import HeaderComponent from "../../../src/components/header";
import FooterComponent from "../../../src/components/footer";
import UtilitySelection from "../../../src/components/home/module-wise-components/utility/UtilitySelection";
import { CustomStackFullWidth } from "../../../src/styled-components/CustomStyles.style";

const MainLayoutRoot = styled("div")({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
});

const UtilitySlugPage = () => {
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
          <UtilitySelection />
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

export default UtilitySlugPage;