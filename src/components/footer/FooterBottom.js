import React from "react";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import { Typography, alpha, useMediaQuery, Grid, Divider } from "@mui/material";
import { getCurrentModuleType } from "../../helper-functions/getCurrentModuleType";
import { ModuleTypes } from "../../helper-functions/moduleTypes";
import { useTheme } from "@emotion/react";
import { Box, Stack } from "@mui/system";
import { t } from "i18next";
import CustomContainer from "../container";
import { useRouter } from "next/router";
import FooterBottomItems from "./FooterBottomItems";

const FooterBottom = (props) => {
  const router = useRouter();
  const handleClickToRoute = (href) => {
    router.push(href, undefined, { shallow: true });
  };
  const { configData } = props;
  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));
  
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        },
      }}
    >
      <CustomStackFullWidth
        py="1.5rem"
        justifyContent="center"
        alignItems="center"
        sx={{
          position: "relative",
          zIndex: "1",
          // backgroundColor: theme.palette.background.paper,
          boxShadow: `0 -2px 10px ${alpha(theme.palette.common.black, 0.05)}`,
        }}
      >
        <CustomContainer>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack 
                direction="row" 
                justifyContent={{ xs: "center", md: "center" }}
                spacing={1}
                alignItems="center"
              >
                <Box
                  component="span"
                  sx={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: theme.palette.primary.main,
                    display: "flex",
                    direction:"row",
                    mr: 0.5
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: "500",
                    textAlign: { xs: "center", md: "left" }
                  }}
                >
                  {configData?.footer_text}
                </Typography>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {!isXSmall ? (
                <Stack 
                  direction="row" 
                  justifyContent="center"
                  alignItems="center"
                  spacing={3}
                >
                  <FooterBottomItems 
                    handleClickToRoute={handleClickToRoute} 
                    configData={configData} 
                  />
                </Stack>
              ) : (
                <Stack 
                  direction="column" 
                  alignItems="center"
                  spacing={1}
                  mt={1}
                >
                  <Divider sx={{ width: "50%", mb: 1 }} />
                  <FooterBottomItems 
                    handleClickToRoute={handleClickToRoute} 
                    configData={configData} 
                  />
                </Stack>
              )}
            </Grid>
          </Grid>
        </CustomContainer>
      </CustomStackFullWidth>
    </Box>
  );
};

FooterBottom.propTypes = {};

export default FooterBottom;