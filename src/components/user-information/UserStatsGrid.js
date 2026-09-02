import React from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WalletIcon from "@mui/icons-material/Wallet";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import SendToMobileIcon from "@mui/icons-material/SendToMobile";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";

const stats = [
//   { id: 1, label: "Days since Joining", value: 24, icon: <AccountCircleIcon /> },
//   { id: 2, label: "Amount In Wallet", value: 24, icon: <WalletIcon /> },
//   { id: 3, label: "Total Orders", value: 40, icon: <ShoppingCartCheckoutIcon /> },
//   { id: 4, label: "Loyalty Points", value: 24, icon: <LoyaltyIcon /> },
  { id: 5, label: "Coupons", value: 24, icon: <ConfirmationNumberIcon /> },
  { id: 6, label: "Referral Code", value: 24, icon: <SendToMobileIcon /> },
  { id: 7, label: "Inbox", value: 24, icon: <ImportContactsIcon /> },
];

const UserStatsGrid = ({ onLogout }) => {
  return (
    <Box sx={{ flex: 1 }}>
      <Grid container spacing={2}>
        {stats.map(({ id, label, value, icon }) => (
          <Grid key={id} item xs={12} sm={6} md={4}>
            <Box
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 8px rgb(0 0 0 / 0.05)",
                bgcolor: "background.paper",
                p: 2,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  mb: 1,
                  p: 1,
                  borderRadius: "50%",
                  bgcolor: "#f5f5f5",
                  color: "primary.main",
                  fontSize: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {icon}
              </Box>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          sx={{ borderRadius: 1, py: 1.5, fontWeight: 700 }}
          onClick={onLogout}
        >
          LOGOUT
        </Button>
      </Box>
    </Box>
  );
};

export default UserStatsGrid;
