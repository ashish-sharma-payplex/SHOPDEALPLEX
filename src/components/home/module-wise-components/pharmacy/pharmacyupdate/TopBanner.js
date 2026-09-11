import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/system";

// Define the breakpoint where the layout *changes* from side-by-side to stacked (typically phone size)
const SM_BREAKPOINT = "600px";
const TABLET_AND_BELOW = "899px";

const BannerContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "12px",
  padding: "20px 0",
  backgroundColor: "var(--pharmacy-hero-bg)", // Full width background color maintained
  width: "100% !important",
  height: "474px", // Default desktop/tablet height (side-by-side)

  // Mobile changes (Stacking)
  [`@media (max-width: ${SM_BREAKPOINT})`]: {
    flexDirection: "column",
    height: "auto", // Auto height for stacked content
    padding: "30px 0",
  },
}));

// ContentWrapper is now full screen width, constrained only by small padding on the sides.
const ContentWrapper = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  // Content is full width of the browser, constrained only by padding
  padding: "0 30px", // Small left/right padding for desktop/laptop edge spacing

  // Mobile adjustments (Stacking)
  [`@media (max-width: ${SM_BREAKPOINT})`]: {
    flexDirection: "column", // Stack content
    padding: "0 16px", // Mobile padding is slightly less
    gap: "20px",
  },
}));

const BannerTextContainer = styled(Box)(() => ({
  color: "var(--text-primary)",
  flex: "1", // Text container is flexible and shares space
  paddingRight: "20px", // Adds space between text and image
  zIndex: 2,

  // Mobile changes (Stacking)
  [`@media (max-width: ${SM_BREAKPOINT})`]: {
    maxWidth: "100%",
    padding: "0",
    marginLeft: "0",
    textAlign: "center",
    order: 1, // Text on top
  },
}));

const BannerButton = styled(Button)(() => ({
  backgroundColor: "var(--pharmacy-brand-green)",
  color: "var(--text-on-brand)",
  padding: "10px 20px",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "var(--pharmacy-cta-green-hover)",
  },
}));

const TitleText = styled(Typography)(() => ({
  fontWeight: "bold",
  fontSize: "2rem", // Default Desktop Size
  color: "var(--pharmacy-hero-title)",

  // Tablet and Below adjustments (Font size reduction)
  [`@media (max-width: ${TABLET_AND_BELOW})`]: {
    fontSize: "1.25rem",
  },
  // Mobile specific adjustment (Allow wrapping)
  [`@media (max-width: ${SM_BREAKPOINT})`]: {
    whiteSpace: "normal",
  },
}));

const OfferText = styled(Typography)(() => ({
  fontWeight: "bold",
  fontSize: "3rem", // Default Desktop Size
  color: "var(--pharmacy-hero-offer)",
  marginBottom: "16px",

  // Tablet and Below adjustments (Font size reduction)
  [`@media (max-width: ${TABLET_AND_BELOW})`]: {
    fontSize: "1.75rem",
    lineHeight: "1.2",
    marginBottom: "10px",
  },
  // Mobile specific adjustment (Allow wrapping)
  [`@media (max-width: ${SM_BREAKPOINT})`]: {
    whiteSpace: "normal",
  },
}));

const DescriptionText = styled(Typography)(() => ({
  fontSize: "1.125rem", // Default Desktop Size
  color: "var(--text-secondary)",
  marginBottom: "20px",

  // Tablet and Below adjustments (Font size reduction)
  [`@media (max-width: ${TABLET_AND_BELOW})`]: {
    fontSize: "1rem",
    marginBottom: "20px",
  },
}));

const ImageContainer = styled(Box)(() => ({
  zIndex: 1,
  display: "flex",
  justifyContent: "flex-end", // Aligns image to the far right within its container
  alignItems: "center",
  flex: "1", // Image container is flexible and shares space
  paddingLeft: "20px", // Adds space between text and image

  // Mobile changes (Stacking and hiding image)
  [`@media (max-width: ${SM_BREAKPOINT})`]: {
    display: "none", // Hides the image on mobile screens
  },
}));

const PharmacyBanner = () => {
  return (
    <BannerContainer>
      <ContentWrapper>
        {/* Left side content (Text and Button) */}
        <BannerTextContainer>
          <TitleText variant="h2">Get Your Medicines</TitleText>
          <OfferText variant="h">Delivered Safely to Your Doorstep</OfferText>
          <DescriptionText variant="body1">
            Fast, Trusted, And Pharmacist-Verified Delivery Right To Your Home.
          </DescriptionText>
          <BannerButton
            variant="contained"
            onClick={() => {
              document.getElementById("order-section")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            sx={{
              borderRadius: "8px",
              backgroundColor: "var(--pharmacy-brand-green)",
            }}
          >
            Order Now
          </BannerButton>
        </BannerTextContainer>

        {/* Right side content (image) */}
        <ImageContainer>
          <img
            src="/pharmacybanner.png" // Path to your uploaded PNG image
            alt="Pharmacy"
            title="Pharmacy"
            style={{
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain",
              maxHeight: "400px", // Default Desktop image size

              // Reduced image size for Tablet and Below
              [`@media (max-width: ${TABLET_AND_BELOW})`]: {
                maxHeight: "250px",
              },

              // Reduced image size for Mobile View (SM_BREAKPOINT and below)
              [`@media (max-width: ${SM_BREAKPOINT})`]: {
                maxHeight: "150px",
                width: "60%",
              },
            }}
          />
        </ImageContainer>
      </ContentWrapper>
    </BannerContainer>
  );
};

export default PharmacyBanner;
