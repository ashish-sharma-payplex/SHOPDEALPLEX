import React from "react";
import { Box } from "@mui/system";
import OrganicTag from "../organic-tag";
import HalalTag from "../halal-tag";

const ProductBadges = ({ product, isSmall }) => {
  if (!product) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: isSmall ? 20 : 20,
        left: 0,
        display: "flex",
        flexDirection: "column", // ✅ vertical stack
        alignItems: "flex-start",
        gap: "6px", // ✅ space between badges
        zIndex: 2,
      }}
    >
      {product?.organic === 1 && <OrganicTag status={1} />}
      {product?.is_halal === 1 && <HalalTag status={1} />}
    </Box>
  );
};

export default ProductBadges;
