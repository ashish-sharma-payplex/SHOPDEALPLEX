"use client";

import { Grid, useMediaQuery, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { useTranslation } from "react-i18next";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import CustomImageContainer from "../../CustomImageContainer";
import { OfferTypography } from "../../food-details/food-card/FoodCard.style";
import OrganicTag from "../../organic-tag";
import ProductImageView from "./ProductImageView";
import ProductInformation from "./ProductInformation";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import ProductBadges from "components/product-badge";
// 👆 use SAME path as ProductCard

/* ---------------- Discount Chip ---------------- */
export const handleDiscountChip = (product, t) => {
  if (product?.store_discount > 0) {
    return (
      <OfferTypography>
        {/* {product.store_discount}% {t("OFF")} */}
      </OfferTypography>
    );
  }

  if (product?.discount) {
    if (product.discount_type === "percent") {
      return (
        <OfferTypography>
             {/* 🏷 Updated Zig-Zag Offer Tag */}
                      
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 8,
                            background:
                              "#1A914B",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "0.5rem",
                            padding: "6px 8px",
                            width: "30px",
                            textAlign: "center",
                            clipPath: `polygon(
                              0 0,
                              100% 0,
                              100% 85%,
                              90% 100%,
                              80% 85%,
                              70% 100%,
                              60% 85%,
                              50% 100%,
                              40% 85%,
                              30% 100%,
                              20% 85%,
                              10% 100%,
                              0 85%
                            )`,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                            zIndex: 5,
                          }}
                        >
                          {product.discount}% OFF
                        </Box>
                      
        </OfferTypography>
      );
    }
    return (
      <OfferTypography>
        {getAmountWithSign(product.discount)}
      </OfferTypography>
    );
  }

  return null;
};

/* ---------------- Component ---------------- */
const ProductDetailsSection = ({
  productDetailsData,
  configData,
  handleModalClose,
  productUpdate,
  modalmanage,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  /* ✅ CORRECT PLACE FOR HOOK */
  const {
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
  } = useWishlistHandler(productDetailsData);

  const productImage = productDetailsData?.image_full_url;
  const productThumbImage = productDetailsData?.images_full_url;
  const imageBaseUrl = productDetailsData?.isCampaignItem
    ? "campaign_image_url"
    : "item_image_url";

  return (
    <CustomStackFullWidth>
      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* LEFT: IMAGE */}
        <Grid item xs={12} sm={5} md={5} textAlign="center">
          <Box sx={{ position: "relative" }}>
            {/* {handleDiscountChip(productDetailsData, t)} */}
           <ProductBadges
  product={productDetailsData}
  isSmall={isSmall}
/>

          </Box>

          {productDetailsData?.module_type !== "food" && productUpdate ? (
            <CustomImageContainer
              width={isSmall ? "200px" : "100%"}
              height={isSmall ? "200px" : "250px"}
              src={productImage}
              objectfit="contained"
              aspectRatio="1/1"
            />
          ) : (
            <ProductImageView
              productImage={productImage}
              productThumbImage={productThumbImage}
              imageBaseUrl={imageBaseUrl}
              configData={configData}
              productDetailsData={productDetailsData}
              isWishlisted={isWishlisted}
              addToWishlistHandler={(e) => {
                e.stopPropagation();
                addToWishlist(e);
              }}
              removeFromWishlistHandler={(e) => {
                e.stopPropagation();
                removeFromWishlist(e);
              }}
            />
          )}
        </Grid>

        {/* RIGHT: INFO */}
        <Grid
          item
          xs={12}
          sm={7}
          md={7}
          marginTop={productThumbImage?.length > 0 ? "0px" : "05px"}
        >
          {productDetailsData?.module_type !== "food" && (
            <ProductInformation
              productDetailsData={productDetailsData}
              configData={configData}
              productUpdate={productUpdate}
              handleModalClose={handleModalClose}
              modalmanage={modalmanage}
              isSmall={isSmall}
            />
          )}
        </Grid>
      </Grid>
    </CustomStackFullWidth>
  );
};

export default ProductDetailsSection;
