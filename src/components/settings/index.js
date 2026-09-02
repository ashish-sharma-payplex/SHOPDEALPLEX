import React from "react";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import { Box, Grid, Paper, styled, Typography } from "@mui/material";
import ThemeSwitches from "../header/top-navbar/ThemeSwitches";
import { Stack } from "@mui/system";
import CustomLanguage from "../header/top-navbar/language/CustomLanguage";
import { useSelector } from "react-redux";
import { t } from "i18next";

const CustomPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  //maxWidth: "247px",
  height: "168px",
  marginLeft: "auto",
  marginRight: "auto",
  justifyContent: "center",
}));
const languageImage = "/language-icon.png";

const CustomSettings = (props) => {
  const { configData } = props;
  const { countryCode, language } = useSelector((state) => state.configData);
  return (
    <CustomStackFullWidth
      mt="2rem"
      // minHeight="80vh"
      maxWidth="100%"
      paddingLeft={{ xs: "0px", sm: "20px", md: "5px" }}
      paddingRight={{ xs: "0px", sm: "20px", md: "5px" }}

    >
      <Grid container spacing={3} justifyContent="center" alignItems="center">
        {/* <Grid item xs={12} sm={6} md={4} lg={3}>
          <CustomPaper elevation={8}>
            <Stack alignItems="center" justifyContent="center" spacing={1}>
              <Typography fontWeight="bold">{t("Theme Settings")}</Typography>
              <ThemeSwitches />
            </Stack>
          </CustomPaper>
        </Grid> */}
      <Grid item xs={12} sm={12} md={12} lg={12}>
  <CustomPaper
    elevation={8}
    sx={{
      border: "1x solid #000000",
      borderRadius: "8px !important",
      position: "relative",
    }}
  >
    <Stack
      spacing={1}
      width="100%"
      sx={{ mx: 2 }}
    >
      {/* IMAGE */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: {
            xs: "center",   // 📱 mobile → center
            sm: "flex-start" // 💻 laptop → left
          },
          mb: 1,
        }}
      >
        <Box
          component="img"
          src="/language-icon.png"
          alt="Language"
          sx={{
            width: 50,
            height: 50,
          }}
        />
      </Box>

      {/* TITLE */}
      <Typography
        fontWeight="bold"
        sx={{
          textAlign: {
            xs: "center",   // mobile center
            sm: "left",     // desktop left
          },
        }}
      >
        {t("Change language")}
      </Typography>

      {/* DROPDOWN */}
      <Box width="100%">
        <CustomLanguage countryCode={countryCode} language={language} />
      </Box>
    </Stack>
  </CustomPaper>
</Grid>

      </Grid>
    </CustomStackFullWidth>
  );
};

CustomSettings.propTypes = {};

export default CustomSettings;
