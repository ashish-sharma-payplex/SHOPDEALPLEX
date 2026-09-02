import { useTheme } from "@emotion/react";
import { Typography, IconButton, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";
import { CustomStackFullWidth } from "../../../styled-components/CustomStyles.style";
import { Facebook, Twitter, Instagram, LinkedIn, YouTube,Pinterest } from "@mui/icons-material";

const SocialLinks = ({ configData }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const isXsmall = useMediaQuery(theme.breakpoints.down("sm"));

  const socialLinks = [
    { name: "Facebook", icon: <Facebook />, link: "https://www.facebook.com" },
    { name: "Instagram", icon: <Instagram />, link: "https://www.instagram.com" },
    { name: "Twitter", icon: <Twitter />, link: "https://www.twitter.com" },
    { name: "LinkedIn", icon: <LinkedIn />, link: "https://www.linkedin.com" },
    { name: "Pinterest", icon: <Pinterest />, link: "https://www.pinterest.com" },
  ];

  const handleRedirect = (link) => {
    window.open(link, "_blank");
  };

  return (
    <CustomStackFullWidth spacing={2} alignItems={{ xs: "center", sm: "flex-start" }}>
      <Typography
        textAlign={{ xs: "center", sm: "start" }}
        sx={{
          fontSize: "16px",
          mb: 2,
          color: (theme) => theme.palette.neutral[500],
        }}
      >
        {t("Follow us on social media:")}
      </Typography>
      <CustomStackFullWidth
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent={{ xs: "center", sm: "flex-start" }}
        flexWrap="wrap"
      >
        {socialLinks.map((item, index) => (
          <IconButton
            key={index}
            sx={{
              padding: "0px",
              color: theme.palette.primary.icon,
              transition: "all ease 0.5s",
              "&:hover": {
                transform: "scale(1.1)",
                color: theme.palette.primary.main,
              },
            }}
            onClick={() => handleRedirect(item.link)}
          >
            {item.icon}
          </IconButton>
        ))}
      </CustomStackFullWidth>
    </CustomStackFullWidth>
  );
};

export default SocialLinks;
