import { Typography, useTheme } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import { CustomStackFullWidth } from '../../styled-components/CustomStyles.style';

const FooterBottomItems = ({ configData, handleClickToRoute }) => {
  const theme = useTheme();

  // return (
  //   <CustomStackFullWidth
  //     display="flex"
  //     direction="column" // Changed to column for list-style format
  //     spacing={3} // Added spacing for vertical list separation
  //     alignItems="flex-start" // Centered items
  //     justifyContent="flex-start"
  //     marginTop="20px"
  //   >
  //     {/* Terms & Conditions link */}
  //     <Typography
  //       onClick={() => handleClickToRoute("/terms-and-conditions")}
  //       sx={{
  //         cursor: "pointer",
  //         "&:hover": {
  //           color: theme.palette.primary.main,
  //         },
  //       }}
  //     >
  //       {t("Terms & Conditions  Kill me buddy")}
  //     </Typography>

  //     {/* Privacy Policy link */}
  //     <Typography
  //       onClick={() => handleClickToRoute("/privacy-policy")}
  //       sx={{
  //         cursor: "pointer",
  //         "&:hover": {
  //           color: theme.palette.primary.main,
  //         },
  //       }}
  //     >
  //       {t("Privacy Policy")}
  //     </Typography>

  //     {/* Refund Policy link (only if available in configData) */}
  //     {configData?.refund_policy !== 0 && (
  //       <Typography
  //         onClick={() => handleClickToRoute("/refund-policy")}
  //         sx={{
  //           cursor: "pointer",
  //           "&:hover": {
  //             color: theme.palette.primary.main,
  //           },
  //         }}
  //       >
  //         {t("Refund Policy")}
  //       </Typography>
  //     )}

  //     {/* Cancellation Policy link (only if available in configData) */}
  //     {configData?.cancelation_policy !== 0 && (
  //       <Typography
  //         onClick={() => handleClickToRoute("/cancellation-policy")}
  //         sx={{
  //           cursor: "pointer",
  //           "&:hover": {
  //             color: theme.palette.primary.main,
  //           },
  //         }}
  //       >
  //         {t("Cancellation Policy")}
  //       </Typography>
  //     )}

  //     {/* Shipping Policy link (only if available in configData) */}
  //     {configData?.shipping_policy !== 0 && (
  //       <Typography
  //         onClick={() => handleClickToRoute("/shipping-policy")}
  //         sx={{
  //           cursor: "pointer",
  //           "&:hover": {
  //             color: theme.palette.primary.main,
  //           },
  //         }}
  //       >
  //         {t("Shipping Policy")}
  //       </Typography>
  //     )}
  //   </CustomStackFullWidth>
  // );
};

export default FooterBottomItems;
