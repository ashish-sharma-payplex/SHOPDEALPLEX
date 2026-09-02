// menuData.js

import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import WalletIcon from "@mui/icons-material/Wallet";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import SendToMobileIcon from "@mui/icons-material/SendToMobile";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import SettingsIcon from "@mui/icons-material/Settings";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

// ⚡ DYNAMIC MENU GENERATOR
export const menuData = (isMobile) => {
  // MAIN PROFILE MENU (desktop + mobile)
  const baseMenu = [
    // {
    //   id: 1,
    //   name: "Overview",
    //   icon: <AccountCircleIcon />,
    //   path: "/overview",
    // },
    {
      id: 1,
      name: "profile-settings",
      icon: <AccountCircleIcon />,
      path: "/profile",
    },
    {
      id: 2,
      name: "my-orders",
      icon: <ShoppingCartCheckoutIcon />,
      path: "/my-orders",
    },
    {
      id: 3,
      name: "wishlist",
      icon:  <FavoriteIcon sx={{ width: 24, height: 24 }} />,
      path: "/wishlist",
    },
    { 
      id: 4,
      name: "my-trips",
      icon: <LocalTaxiIcon />,
      path: "/my-trips",
    },
    {
      id: 5,
      name: "my-bookings",
      icon: <ReceiptLongIcon />,
      path: "/my-bookings",
    },
    {
      id: 6,
      name: "wallet",
      icon: <WalletIcon />,
      path: "/wallet",
    },
    {
      id: 7,
      name: "coupons",
      icon: <ConfirmationNumberIcon />,
      path: "/coupons",
    },
    {
      id: 8,
      name: "loyalty-points",
      icon: <LoyaltyIcon />,
      path: "/loyalty-points",
    },
    {
      id: 9,
      name: "referral-code",
      icon: <SendToMobileIcon />,
      path: "/referral-code",
    },
    {
      id: 10,
      name: "inbox",
      icon: <ImportContactsIcon />,
      path: "/inbox",
    },
    {
      id: 11,
      name: "settings",
      icon: <SettingsIcon />,
      path: "/settings",
    },
  ];

  // EXTRA OPTIONS ONLY FOR MOBILE USERS
  const mobileExtras = [
    {
      id: 12,
      name: "track-order",
      icon: <LocalShippingOutlinedIcon />,
      path: "/track-order",
    },
    {
      id: 13,
      name: "cart",
      icon: <ShoppingCartOutlinedIcon />,
      path: null, // optional
    }

  ];

  // Return combined menu for mobile (profile + order + cart)
  return isMobile ? [...baseMenu, ...mobileExtras] : baseMenu;
};