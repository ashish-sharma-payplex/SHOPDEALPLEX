import { Grid, Typography, IconButton, Box, Divider } from "@mui/material";
import React from "react";
import { Facebook, Instagram, YouTube, LinkedIn } from "@mui/icons-material";
import CustomImageContainer from "../../CustomImageContainer";
import { useSelector } from "react-redux";
import HitCounter from "components/HitCounter";

const mockConfigData = {
  social_media: [
    { name: "linkedin", link: "https://www.linkedin.com/company/dealplex/" },
    { name: "instagram", link: "https://www.instagram.com/shopdealplex/" },
    {
      name: "facebook",
      link: "https://www.facebook.com/profile.php?id=61578215300972",
    },
    { name: "youtube", link: "https://www.youtube.com/@Dealplex" },
  ],
};

const iconHandler = (name) => {
  switch (name.toLowerCase()) {
    case "facebook":
      return <Facebook className="footer-icon" sx={{ fontSize: 26 }} />;
    case "instagram":
      return <Instagram className="footer-icon" sx={{ fontSize: 26 }} />;
    case "youtube":
      return <YouTube className="footer-icon" sx={{ fontSize: 26 }} />;
    case "linkedin":
      return <LinkedIn className="footer-icon" sx={{ fontSize: 26 }} />;
    default:
      return null;
  }
};

const FooterMiddle = () => {
  const { configData } = useSelector((state) => state.configData);
  const businessLogo = configData?.logo_full_url;

  return (
    <Box
      className="footer-root"
      sx={{
        mx: "auto",
        pt: { xs: 5, md: 6 },
        px: { sm: 3, md: 3 },
        position: "relative",
        borderRadius: "24px !important",
        overflow: "hidden",
        width: "100%",
        maxWidth: "1200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {/* MAIN CONTENT */}
      <Grid
        container
        spacing={{ xs: 2, sm: 3, md: 4 }}
        justifyContent="center"
        alignItems="flex-start"
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: 2, sm: 0 },
        }}
      >
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: "left", width: "100%" }}>
            <CustomImageContainer
              src="/logodealplex.png"
              alt="Dealplex Logo"
              width="240px"
              height="40px"
              objectfit="contain"
            />

            <Typography
              sx={{
                color: "#555",
                mt: 2,
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                textAlign: { xs: "left", sm: "left" },
                lineHeight: { xs: 1.4, sm: 1.6 },
                maxWidth: { xs: "100%", sm: "260px", md: "300px" },
              }}
            >
              Dealplex is a one-stop shop for all your daily necessities. You
              can shop for groceries, pharmacy items, order food, and more.
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 2,
                mt: 3,
                flexWrap: "wrap",
              }}
            >
              {mockConfigData.social_media.map((item, i) => (
                <IconButton
                  key={i}
                  onClick={() => window.open(item.link, "_blank")}
                  sx={{
                    "&:hover": { transform: "scale(1.15)" },
                    transition: "0.25s",
                  }}
                >
                  {iconHandler(item.name)}
                </IconButton>
              ))}
            </Box>

            {/* App Store Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 2,
                mt: 3,
                flexWrap: "wrap",
              }}
            >
              <Box
                component="img"
                src="/playstore.svg"
                alt="Download on Google Play"
                sx={{
                  height: 40,
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.dealplex.dealplex_user",
                    "_blank",
                  )
                }
              />
              <Box
                component="img"
                src="/appstore.svg"
                alt="Download on App Store"
                sx={{
                  height: 40,
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
                onClick={() => window.open("#", "_blank")}
              />
            </Box>

            {/* Visitor Counter — same left alignment as app buttons */}
            <Box sx={{ mt: 1.5 }}>
              {/* <Box
                component="img"
                src="https://visitor-badge.laobi.icu/badge?page_id=shopdealplex.in"
                alt="visitor count"
                sx={{ height: "20px", display: "block" }}
              />
            </Box> */}
              <HitCounter />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "flex-start",
              gap: { xs: 3, md: 5 },
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {/* HOME */}
            <Box sx={{ flex: "0 0 120px" }}>
              <Typography variant="h6" textAlign={"left"} sx={headingStyle}>
                Home
              </Typography>
              <Typography
                component="a"
                href="https://hrms.dealplex.in/career/1/en"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Careers
              </Typography>
              <Typography
                component="a"
                href="/blog"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Blog
              </Typography>
              <Typography
                component="a"
                href="/leader"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Lead
              </Typography>
              <Typography
                component="a"
                href="/val-page"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Values
              </Typography>
              <Typography
                component="a"
                href="/security"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Security
              </Typography>
              <Typography
                component="a"
                href="/support"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Support
              </Typography>
              <Typography
                component="a"
                href="/sitemap"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Sitemap
              </Typography>
              <Typography
                component="a"
                href="/faqs"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                FAQ's
              </Typography>
            </Box>

            {/* PARTNERSHIP */}
            <Box sx={{ flex: 1, minWidth: "130px" }}>
              <Typography variant="h6" textAlign={"left"} sx={headingStyle}>
                Partnership
              </Typography>
              <Typography
                component="a"
                href="https://franchise.shopdealplex.in/"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Franchise
              </Typography>
              <Typography
                component="a"
                href="https://warehouse.shopdealplex.in/"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Warehouse
              </Typography>
              <Typography
                component="a"
                href="https://vendor.shopdealplex.in/"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Vendor
              </Typography>
              <Typography
                component="a"
                href="https://partner.shopdealplex.in/"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Partner
              </Typography>
              <Typography
                component="a"
                href="https://deliveryman.shopdealplex.in/"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyle}
              >
                Delivery man
              </Typography>
            </Box>

            {/* CATEGORIES */}
            <Box sx={{ flex: 1, minWidth: "130px" }}>
              <Typography variant="h6" textAlign={"left"} sx={headingStyle}>
                Categories
              </Typography>
              <Typography
                component="a"
                href="/home?module=grocery"
                sx={linkStyle}
              >
                Grocery
              </Typography>
              <Typography component="a" href="/home?module=food" sx={linkStyle}>
                Food
              </Typography>
              <Typography
                component="a"
                href="/home?module=pharmacy"
                sx={linkStyle}
              >
                Pharmacy
              </Typography>
              <Typography component="a" href="/travel" sx={linkStyle}>
                Travels
              </Typography>
              <Typography
                component="a"
                href="/home?module=parcel"
                sx={linkStyle}
              >
                Parcel
              </Typography>
              <Typography
                component="a"
                href="/home?module=rental"
                sx={linkStyle}
              >
                Rental
              </Typography>
              <Typography component="a" href="/utility" sx={linkStyle}>
                Utility
              </Typography>
            </Box>

            {/* REGISTERED ADDRESS */}
            <Box
              sx={{
                flex: 1,
                minWidth: "220px",
                textAlign: "left",
              }}
            >
              <Typography variant="h6" sx={headingStyle}>
                Registered Address
              </Typography>

              <Typography
                sx={{
                  color: "#555",
                  fontSize: "0.93rem",
                  lineHeight: 1.7,
                  mb: 2,
                }}
              >
                Office No. 528B, 5th Floor, Gera's Imperium Rise Infotech Park,
                Hinjawadi, Pune, Maharashtra – 411057
              </Typography>

              <Typography
                sx={{
                  color: "#555",
                  fontSize: "0.85rem",
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                GST: 27AAKCD9233F1ZI
              </Typography>

              <Typography
                sx={{
                  color: "#555",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                CIN: U82990PN2024PTC231764
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* DIVIDER */}
      <Divider
        sx={{
          my: 4,
          borderColor: "#e0e0e0",
          maxWidth: "1200px",
          mx: "auto",
        }}
      />

      {/* BOTTOM LINKS */}
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          px: 2,
          py: "0px !important",
        }}
      >
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 1.2, md: 2 },
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              mb: { xs: 2, md: 0 },
              width: "100%",
            }}
          >
            <Typography component="a" href="/about-us" sx={bottomLinkStyle}>
              About us
            </Typography>
            <Typography
              component="a"
              href="/privacy-policy"
              sx={bottomLinkStyle}
            >
              Privacy policy
            </Typography>
            <Typography
              component="a"
              href="/refund-policy"
              sx={bottomLinkStyle}
            >
              Refund/Shipping policy
            </Typography>
            <Typography component="a" href="/contactus" sx={bottomLinkStyle}>
              Contact us
            </Typography>
            <Typography
              component="a"
              href="/terms-and-conditions"
              sx={bottomLinkStyle}
            >
              Terms of Use
            </Typography>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md="auto"
          sx={{ textAlign: { xs: "left", md: "right" } }}
        >
          {/* Copyright */}
          <Typography sx={{ fontSize: "0.9rem", color: "#333" }}>
            © 2026 Dealplex Solutions Private Limited, All Rights Reserved
          </Typography>
        </Grid>
      </Grid>

      {/* DEALPLEX FADED TEXT */}
      <Box
        sx={{
          paddingTop: "0px !important",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "2.6rem", sm: "4.5rem", md: "12rem" },
            fontWeight: "800",
            letterSpacing: "0.11em",
            background: "linear-gradient(0deg, #FFF 0%, #D4D4D4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            alignItems: "center",
            userSelect: "none",
            opacity: 0.8,
            textAlign: "center",
            lineHeight: "230px",
            width: "100%",
            maxWidth: "1300px",
            mx: "auto",
          }}
        >
          DEALPLEX
        </Typography>
      </Box>
    </Box>
  );
};

const headingStyle = {
  color: "#0B3D20",
  fontWeight: "bold",
  mb: 2,
  // textalign: "left",
};

const linkStyle = {
  display: "block",
  mb: 1.2,
  color: "#555",
  fontSize: "0.93rem",
  textDecoration: "none",
  textAlign: "left",
  "&:hover": { textDecoration: "underline" },
};

const bottomLinkStyle = {
  fontSize: "0.9rem",
  color: "#333",
  textDecoration: "none",
  textAlign: "left",
  "&:hover": { textDecoration: "underline" },
};

export default FooterMiddle;
