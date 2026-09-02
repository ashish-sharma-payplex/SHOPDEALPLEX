import React from "react";
import CustomImageContainer from "components/CustomImageContainer";
import { Stack, Typography, useTheme, Link as MuiLink } from "@mui/material";
import { PrimaryButton } from "components/Map/map.style";
import Box from "@mui/material/Box";
import { t } from "i18next";
import successImg from "../../asset/success.png";
import { useRouter } from "next/router";
import {getToken} from "helper-functions/getToken";
import toast from "react-hot-toast";

const RentalSuccessModal = ({ handleCloseSuccessModal, tripDetails }) => {
  const theme = useTheme();
  const router = useRouter();
  
  // Custom checkmark SVG to match the image's style (if successImg is not the desired checkmark)
  const CheckmarkIcon = () => (
    <Box 
      sx={{ 
        width: 48, 
        height: 48, 
        borderRadius: '50%', 
        backgroundColor: theme.palette.success.main, // Green circle background
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mb: '10px' // Margin to separate icon from text
      }}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
      </svg>
    </Box>
  );

  const handleClick = () => {
    if(getToken()){
      router.push({
        pathname: "/profile",
        query: {
          page: "inbox",
          type: "vendor",
          id: tripDetails?.provider?.id,
          routeName: "vendor_id",
          chatFrom: "true",
          deliveryman_name: tripDetails?.provider?.name,
          deliveryManData_image: tripDetails?.provider?.logo_full_url,
        },
      });
    }else{
      toast.error(t("Please login to continue"))
    }
  };

  return (
    <Box
      sx={{
        // The modal looks like it has a padding or internal max-width
        maxWidth: "440px", 
        width: "100%",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px", // Reduced gap to match the tight spacing
        borderRadius: "8px", // Added border radius here
      }}
    >
      {/* 1. Success Icon (The checkmark in a green circle) */}
      {/* Assuming successImg is the checkmark, otherwise use the custom CheckmarkIcon */}
      <CustomImageContainer
        width="48px"
        height="48px"
        maxWidth="48px"
        src={successImg.src} // If successImg is not the desired checkmark, replace with CheckmarkIcon
        sx={{ borderRadius: "50%", mb: "10px" }}
      />
      {/* If CustomImageContainer cannot render the exact image style, use the component below: */}
      {/* <CheckmarkIcon /> */}


      <Stack justifyContent="center" alignItems="center" gap="1rem">
        
        {/* 2. Title: Trip Booking Request Successful! */}
        <Typography
          fontSize="1rem"
          fontWeight="700"
          color={theme.palette.neutral[1000]}
          textAlign="center"
          sx={{ mb: 0 }}
        >
          {t("Trip Booking Request Successful!")}
        </Typography>
        
        {/* 3. Description text */}
        <Typography 
          color={theme.palette.neutral[500]} 
          textAlign="center" 
          sx={{ 
            fontSize: "14px", // Smaller font size to match image
            lineHeight: 1.5,
            mb: "20px" // Increased margin below description
          }}
        >
          {t(
            "Your request has been submitted successfully. Your preferable vehicles will be arrived on time after confirmation."
          )}
        </Typography>
        
        {/* 4. Contact vendor link (Changed structure to match image text "For Trips Detials Contact vendor") */}
        <Box 
          sx={{ 
            fontSize: "12px", 
            textAlign: "center",
            mt: "-10px", // Pull up closer to the description
            mb: "15px", // Margin before the button
            color: theme.palette.neutral[700] // Text color for the non-link part
          }}
        >
            {t("For Trip Details")}{" "}
            <MuiLink
              onClick={handleClick}
              sx={{ 
                textDecoration: "none", 
                color: "#1A914B", // Color of the link in the image
                cursor:"pointer",
                fontWeight: 500,
                "&:hover": { 
                    textDecoration: "underline",
                } 
              }}
            >
              {t("Contact vendor")}
            </MuiLink>
        </Box>

        {/* 5. Okay Button (Modified style to match image: solid green background) */}
        <PrimaryButton
          onClick={handleCloseSuccessModal}
          sx={{ 
            marginTop: "0",
            width: "100%",
            maxWidth: "200px", // Constrained width like in the image
            backgroundColor: "#1A914B",
            "&:hover": {
                backgroundColor: "#168a46",
            },
            padding: "10px 20px"
          }}
        >
          {t("Ok")}
        </PrimaryButton>
      </Stack>
    </Box>
  );
};

export default RentalSuccessModal;