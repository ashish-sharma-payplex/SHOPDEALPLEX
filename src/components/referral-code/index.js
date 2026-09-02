import React from "react";
import { Grid, Typography, Box, Stack, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { t } from "i18next";
import WalletBgSvg from "components/wallet/WalletBgSvg";
import ReferAFriend from "./svg/ReferAFriend";
import CodePreview from "./CodePreview";
import HowItWorks from "./HowItWorks";
import CustomImageContainer from "components/CustomImageContainer";

const ReferralCode = ({ configData }) => {
  return (
    <Box width="100%" display="flex" justifyContent="center" mt={3}>
      <Box width="100%" maxWidth="100%">

        {/* 🔹 Top Green Banner */}
        <Box
          position="relative"
          borderRadius="14px"
          overflow="hidden"
          mb={2}
        >
          <WalletBgSvg />
        <Stack
  position="relative"
  zIndex={1}
  p={2}
  spacing={1}
>
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    gap={2}
  >
    {/* TEXT SIDE */}
    <Stack spacing={0.5}>
      <Typography fontSize={{xs:"11px",sm:"12px",md:"13px"}} color="#E9FFF5" fontWeight={600}>
        REFER YOUR FRIEND & EARN
      </Typography>

      <Typography fontSize="22px" fontWeight={700} color="#fff">
        ₹{configData?.ref_earning_exchange_rate}
        <Typography
          component="span"
         fontSize={{xs:"10px",sm:"11px",md:"13px"}}
          fontWeight={400}
          ml={1}
        >
          Each Time 
        </Typography>
      </Typography>
    </Stack>

    {/* IMAGE SIDE */}
    <CustomImageContainer
  src={"/refferalImg.png"}
  alt="loyalty"
  sx={{
    width: {
      xs: "65px",   // mobile
      sm: "90px",   // small tablet
      md: "120px",  // desktop
    },
    height: {
      xs: "55px",
      sm: "75px",
      md: "100px",
    },
    flexShrink: 0, // text push na kare
  }}
/>

  </Stack>
</Stack>


        </Box>

        {/* 🔹 Referral Code Card */}
        <Box
          bgcolor="#fff"
          borderRadius="14px"
					border= "1px solid #D9E1EC"
          p={2}
          // boxShadow="0px 4px 20px rgba(0,0,0,0.06)"
          // border="1px solid #E3E8EE"
          mb={2}
          
        >
          <Typography fontSize="13px" fontWeight={600} mb={1}>
            Copy Your Code, Share It with Your Friends
          </Typography>



          {/* Or Share */}
           <Grid xs={12} md={12} align="center">
            <CodePreview t={t} />
          </Grid>
        </Box>

        {/* 🔹 How It Works */}
        <Box
          // bgcolor="#fff"
          borderRadius="14px"
          p={2}
          // boxShadow="0px 4px 20px rgba(0,0,0,0.06)"
          border="1px solid #E3E8EE"
        >
          <Typography fontSize="17px" fontWeight={700}>
            How It Works?
          </Typography>
          <HowItWorks configData={configData} />
        </Box>

      </Box>
    </Box>
  );
};

export default ReferralCode;
