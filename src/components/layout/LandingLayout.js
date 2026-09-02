import { NoSsr, Box, Stack, styled } from "@mui/material";
import HeaderComponent from "../header";
import FooterComponent from "../footer";
import PropTypes from "prop-types";
import useGetLandingPage from "api-manage/hooks/react-query/useGetLandingPage";
import { useEffect } from "react";

export const MainLayoutRoot = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  height: "100vh",
}));

export const LandingLayout = ({ children, configData, landingPageData }) => {
  const { data, refetch } = useGetLandingPage();
  useEffect(() => {
    refetch();
  }, []);

  return (
    <MainLayoutRoot>
      <header style={{ display: "flex", alignItems: "center" }}>
        <HeaderComponent />
      </header>

      <Stack sx={{ paddingTop: { xs: "70px", md: "100px" }, display: "flex", alignItems: "center" }}>
        {children}
      </Stack>

      <footer
        style={{
          width: "100%",          // Ensure footer takes full width
          // backgroundColor: "#F8F8F8", // Set the footer background color to red
          display: "flex",        // Use flexbox to align the content of footer
          justifyContent: "center", // Center the content horizontally
          padding: "20px 0",  
          mt:5   , // Optional padding for spacing
          // border: "1px solid #e61515", // Optional: Add a border to the footer for better separation
        }}
      >
        <Box
          sx={{
            // backgroundColor: "pink",  
            padding: "10px 20px",     // Add some padding to the FooterComponent for better appearance
            borderRadius: "5px",      // Optional: Adds rounded corners for a better look
          }}
        >
          <FooterComponent />
        </Box>
      </footer>
    </MainLayoutRoot>


  );
};

LandingLayout.propTypes = {
  children: PropTypes.node,
};
