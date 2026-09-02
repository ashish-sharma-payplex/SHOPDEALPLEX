/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Button,
  Grid,
  ListItemIcon,
  MenuItem,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
//import { CustomColouredTypography } from "../styled-components/CustomStyles.style";
import { useTheme } from "@mui/material/styles";
import i18n, { t } from "i18next";
import cookie from "js-cookie";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useSettings } from "../../../../contexts/use-settings";
import {
  setCountryCode,
  setLanguage,
} from "../../../../redux/slices/configData";
import {
  CustomModalWrapper,
  CustomPaperBigCard,
  CustomStackFullWidth,
} from "../../../../styled-components/CustomStyles.style";
import { StyledMenu, TopBarButton } from "../../NavBar.style";
import { languageList } from "./languageList";
import { haveRtlLanguages } from "./rtlLanguageList";

const getValues = (settings) => ({
  direction: settings.direction,
  responsiveFontSizes: settings.responsiveFontSizes,
  theme: settings.theme,
});

const CustomLanguage = ({
  formmobilemenu,
  language,
  countryCode,
  noPaddingRight,
  noText,
}) => {
  const { configData } = useSelector((state) => state.configData);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const theme = useTheme();
  // const [language, setLanguage] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const { settings, saveSettings } = useSettings();
  const [values, setValues] = useState(getValues(settings));
  const anchorRef = useRef(null);
  //const { configData } = useSelector((state) => state.configDataSettings);
  const dispatch = useDispatch();
  useEffect(() => {
    if (typeof window !== "undefined") {
      let languageSetting = JSON.parse(
        localStorage.getItem("language-setting")
      );
      localStorage.setItem(
        "language-setting",
        JSON.stringify(languageSetting || i18n.language)
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let languageSetting = JSON.parse(
        localStorage.getItem("language-setting")
      );
      let country = JSON.parse(localStorage.getItem("country"));
      if (languageSetting) {
        dispatch(setCountryCode(country));
        dispatch(setLanguage(languageSetting));
        i18n.changeLanguage(languageSetting);
      }
    }
  }, [language]);

  useEffect(() => {
    if (selectedLanguage) {
      setOpenModal(true);
    }
  }, [selectedLanguage]);

  const handleClick = (event) => {
    // i18n.changeLanguage(language)
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    settings && setValues(getValues(settings));
  }, [settings]);
  const open = Boolean(anchorEl);
  const isRTLLanguage = (value) => {
    return haveRtlLanguages.includes(value);
  };

  const handleChangeLanguage = (lan) => {
    //i18n.changeLanguage(lan?.languageCode);
    dispatch(setLanguage(lan?.languageCode));
    dispatch(setCountryCode(lan?.countryCode));
    cookie.set("languageSetting", lan?.languageCode);
    localStorage.setItem("language-setting", JSON.stringify(lan?.languageCode));
    localStorage.setItem("country", JSON.stringify(lan?.countryCode));
    toast.success(t("Language has been changed"), {
      id: "lan",
    });

    saveSettings({
      ...values,
      direction: isRTLLanguage(lan?.languageCode) ? "rtl" : "ltr",
    });
    window.location.reload();
    handleClose?.();

    // window.location.reload();
    // setTimeout(() => {
    //   // toast.success(t("Language has been changed"),{
    //   //     id:'lan'
    //   // });
    // }, 300);
  };
  const handleSelection = (lan) => {
    setSelectedLanguage(lan);
  };
  const handleCloseModal = () => {
    setSelectedLanguage(null);
    setOpenModal(false);
  };
  const handleYes = (value) => {
    handleChangeLanguage(value);
    handleCloseModal();
  };

  return (
    <>
    <TopBarButton
  formmobilemenu={formmobilemenu}
  variant="outlined"
  size="medium"
  fullWidth
  onClick={handleClick}
  sx={{
    width: "100%",
    justifyContent: "space-between",
    borderRadius: "8px",
    border: "1px solid #D0D5DD",
    padding: "10px 12px",
    textTransform: "none",
    backgroundColor: "#FFFFFF",

    "&:hover": {
      backgroundColor: "#FFFFFF",
      borderColor: "#D0D5DD",
    },
  }}
  startIcon={
    <Stack direction="row" spacing={1} alignItems="center">
      <img
        width="20"
        src={
          languageList?.find(
            (item) => item?.languageCode === language
          )?.countryFlag
        }
        alt="flag"
      />
      <Typography color="#667085" fontSize="14px">
        {
          languageList?.find(
            (item) => item?.languageCode === language
          )?.languageName || t("Select Language")
        }
      </Typography>
    </Stack>
  }
  endIcon={
    <KeyboardArrowDownIcon sx={{ color: "#667085" }} />
  }
/>

      <StyledMenu
  anchorEl={anchorEl}
  open={open}
  onClose={handleClose}
  disableScrollLock
  PaperProps={{
    sx: {
      width: anchorEl ? anchorEl.clientWidth : "100%",
    },
  }}
>

        {languageList?.map((lan, index) => (
         <MenuItem
  onClick={() => handleSelection(lan)}
  key={index}
  sx={{
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 1,
  }}
>
  <img width="20" src={lan.countryFlag} alt="flag" />
  <Typography>{lan.languageName}</Typography>
</MenuItem>

        ))}
      </StyledMenu>
      {openModal && (
        <Modal open={openModal} onClose={handleCloseModal}>
          <CustomModalWrapper>
            <CustomPaperBigCard
              noboxshadow="true"
              sx={{ width: { xs: "300px", sm: "400px", md: "500px" } }}
            >
              <CustomStackFullWidth
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <Grid container spacing={2} p={2} >
                  <Grid item xs={12} align="center">
                    <CustomStackFullWidth spacing={1}>
                      <Typography variant="h6">
                        {t("Are you sure to change the language?")}
                      </Typography>
                      <Typography variant="h8">
                        {t(
                          "The browser will refresh to get translated content."
                        )}
                      </Typography>
                    </CustomStackFullWidth>
                  </Grid>
                  <Grid item xs={12}>
                    <CustomStackFullWidth
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={2}
                    >
                      <Button
                        sx={{ maxWidth: "200px" }}
                        variant="outlined"
                        fullWidth
                        onClick={handleCloseModal}
                      >
                        {t("No")}
                      </Button>
                      <Button
                        sx={{ maxWidth: "200px" }}
                        fullWidth
                        variant="contained"
                        onClick={() => handleYes(selectedLanguage)}
                      >
                        {t("Yes")}
                      </Button>
                    </CustomStackFullWidth>
                  </Grid>
                </Grid>
              </CustomStackFullWidth>
            </CustomPaperBigCard>
          </CustomModalWrapper>
        </Modal>
      )}
    </>
  );
};

CustomLanguage.propTypes = {};

export default CustomLanguage;
