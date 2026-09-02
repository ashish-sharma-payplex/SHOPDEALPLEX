import React from "react";
import { Box, Avatar, Typography, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import WalletIcon from "@mui/icons-material/Wallet";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import SendToMobileIcon from "@mui/icons-material/SendToMobile";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import SettingsIcon from "@mui/icons-material/Settings";

const menuItems = [
  { id: 1, name: "Overview", icon: <AccountCircleIcon />, page: "overview" },
  { id: 2, name: "Profile Settings", icon: <AccountCircleIcon />, page: "profile-settings" },
  { id: 3, name: "My Orders", icon: <ShoppingCartCheckoutIcon />, page: "my-orders" },
  { id: 4, name: "My Trips", icon: <LocalTaxiIcon />, page: "my-trips" },
  { id: 5, name: "My Address", icon: <WalletIcon />, page: "my-address" },
  { id: 6, name: "Wallet", icon: <WalletIcon />, page: "wallet" },
  { id: 7, name: "Coupons", icon: <ConfirmationNumberIcon />, page: "coupons" },
  { id: 8, name: "Loyalty Points", icon: <LoyaltyIcon />, page: "loyalty-points" },
  { id: 9, name: "Referral Code", icon: <SendToMobileIcon />, page: "referral-code" },
  { id: 10, name: "Inbox", icon: <ImportContactsIcon />, page: "inbox" },
  { id: 11, name: "Settings", icon: <SettingsIcon />, page: "settings" },
];

const UserMenuSidebar = ({ currentPage, user }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleMenuClick = (page) => {
    router.push({ pathname: "/profile", query: { page } });
  };

  return (
    <Box
      sx={{
        width: 280,
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        p: 2,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "fit-content",
      }}
    >
      {/* User header */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
        <Avatar
          src={user?.avatar || ""}
          alt={user?.name || "Anonymous"}
          sx={{ width: 64, height: 64 }}
        />
        <Typography fontWeight={700} fontSize={16} textAlign="center">
          {user?.name || "Anonymous"}
        </Typography>
        <Typography fontSize={12} color="text.secondary" textAlign="center">
          Joined {user?.joinedDate || "Dec 16, 2025"}
        </Typography>
      </Box>

      {/* Menu items list */}
      <List disablePadding>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.id}
            onClick={() => handleMenuClick(item.page)}
            selected={currentPage === item.page}
            sx={{
              borderRadius: 1,
              mb: 1,
              "&.Mui-selected": {
                bgcolor: "#e6f4ea",
                color: "primary.main",
                fontWeight: "600",
                "& .MuiListItemIcon-root": { color: "primary.main" },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                bgcolor: currentPage === item.page ? "primary.main" : "#f5f5f5",
                borderRadius: 1.5,
                color: currentPage === item.page ? "white" : "primary.main",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={t(item.name)}
              sx={{ textTransform: "capitalize" }}
              primaryTypographyProps={{ fontWeight: currentPage === item.page ? 600 : 400 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default UserMenuSidebar;
