import { Typography, useTheme } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import { CustomStackFullWidth } from "../../../styled-components/CustomStyles.style";

const AppDemo = ({ configData, handleClickToRoute }) => {
     const theme = useTheme();
      return (
         <CustomStackFullWidth
           display="flex"
           direction="row" // Changed to column for list-style format
           spacing={3} // Added spacing for vertical list separation
           alignItems="center" // Centered items
           justifyContent="flex-start"
           marginTop="20px"
         >
           {/* Terms & Conditions link */}
           <Typography
             onClick={() => handleClickToRoute("/terms-and-conditions")}
             sx={{
               cursor: "pointer",
               "&:hover": {
                 color: theme.palette.primary.main,
               },
             }}
           >
             {t("Demo")}
           </Typography>
           </CustomStackFullWidth>
           );
        };
export default AppDemo;