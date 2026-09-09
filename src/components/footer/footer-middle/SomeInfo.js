import { useTheme } from "@emotion/react";
import { Typography } from "@mui/material";
import React from "react";
import {
  CustomStackFullWidth,
  CustomTypographyBold,
} from "../../../styled-components/CustomStyles.style";
import CustomImageContainer from "../../CustomImageContainer";
import ClickToCall from "../../header/top-navbar/ClickToCall";
import SendMail from "../../SendMail";
import Link from "next/link";

const SomeInfo = (props) => {
  const { image, alt, title, info, t, href } = props;
  const theme = useTheme();
  return (
    <>
      {href ? (
        <Link href={href}>
          <CustomStackFullWidth
            alignItems="center"
            justifyContent="center"
            spacing={3}
            sx={{
              cursor: "pointer",
              img: {
                transition: "all ease 0.5s",
              },
              "&:hover": {
                ".MuiTypography-body1": {
                  color: theme.palette.primary.main,
                },
                ".MuiTypography-body2": {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
            {/* <CustomImageContainer src={image} alt={alt} height={50} width={50} /> */}
            <CustomStackFullWidth
              alignItems="center"
              justifyContent="center"
              spacing={1}
            >
              <CustomTypographyBold
                sx={{
                  textTransform: "capitalize",
                }}
              >
                {t(title)}
              </CustomTypographyBold>
              <Typography
                variant="subtitle"
                sx={{
                  textAlign: "justify",
                  fontFamily: "Inter",
                }}
              >
                {info}
              </Typography>
            </CustomStackFullWidth>
          </CustomStackFullWidth>
        </Link>
      ) : (
        <CustomStackFullWidth
          alignItems="center"
          justifyContent="center"
          spacing={3}
          sx={{
            cursor: "pointer",
            img: {
              transition: "all ease 0.5s",
            },
            "&:hover": {
              ".MuiTypography-body1": {
                color: theme.palette.primary.main,
              },
              ".MuiTypography-body2": {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          {/* <CustomImageContainer src={image} alt={alt} height={50} width={50} /> */}
          <CustomStackFullWidth
            alignItems="center"
            justifyContent="center"
            spacing={1}
          >
            <CustomTypographyBold
              sx={{
                textTransform: "capitalize",
              }}
            >
              {t(title)}
            </CustomTypographyBold>
            <Typography
              variant="subtitle"
              sx={{
                textAlign: "justify",
                color: "var(--footer-text)",
                fontSize: "16px",
              }}
            >
              {info}
            </Typography>
          </CustomStackFullWidth>
        </CustomStackFullWidth>
      )}
    </>
  );
};

SomeInfo.propTypes = {};

export default SomeInfo;
