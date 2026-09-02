import React from "react";
import WishLists from "components/wishlist/WishLists";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { t } from "i18next";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import DrawerHeader from "components/added-cart-view/DrawerHeader";

const WishlistPage = () => {
  return (
    <div
      style={{
        padding: "20px",
        width: "1200px", // Set fixed width
        margin: "0 auto", // Centers the page horizontally
      }}
    >
      {/* Wishlist Content */}
      <CustomStackFullWidth width={"1200px"} height={"auto"}>
        <WishLists t={t} />
      </CustomStackFullWidth>
    </div>
  );
};

export default WishlistPage;