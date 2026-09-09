import {
  Box,
  NoSsr,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Link,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import LogoSide from "../../components/logo/LogoSide";
import styles from "styles/navbar.module.css";

const TopNavBar = () => {
  const { configData } = useSelector((state) => state.configData);
  const theme = useTheme();
  const isSmall = useMediaQuery("(max-width:600px)");

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about-us" },
    { label: "Career", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <NoSsr>
      <Box
        className={styles["navbar-root"]}
        sx={{
          width: "100%",
          mt: 1,
          padding: "10px 20px",
          borderRadius: "12px !important",
          border: "1px solid var(--nav-border)",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          flexWrap="wrap"
        >
          {/* Left side: Logo */}
          <Stack
            direction="row"
            alignItems="center"
            width="auto"
            marginLeft="30px"
            marginRight="50px"
          >
            {!isSmall && (
              <LogoSide
                width="500px"
                height="70px"
                configData={configData}
                objectFit="contain"
              />
            )}
          </Stack>

          {/* Right side: Navigation links */}
          <Stack
            direction={isSmall ? "column" : "row"}
            spacing={isSmall ? 1 : 4}
            sx={{
              width: isSmall ? "100%" : "auto",
              justifyContent: "flex-end",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                underline="none"
                className={styles["navbar-link"]}
                sx={{
                  fontWeight: "bold",
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                    color: theme.palette.primary.main,
                  },
                  textAlign: isSmall ? "center" : "right",
                }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Box>
    </NoSsr>
  );
};

export default TopNavBar;
