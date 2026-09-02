import React from 'react';
import { Paper, Stack, Typography, IconButton, Box } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import toast from 'react-hot-toast';
import { styled } from '@mui/material/styles';

// ===== Custom Paper Styling =====
const CustomPaper = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "17px 28px 22px 28px",
  borderRadius: "12px",
  gap: "18px",
  position: "relative",
  minWidth: 300,
  boxShadow: theme.shadows[4],
}));

// ===== Toast Component =====
const CustomToast = ({ t, title, description, icon, type, onIconClick }) => {
  const bgColors = {
    success: "#E8F5E9",
    error: "#FDECEA",
    warning: "#FFF8E1",
    info: "#E3F2FD",
  };

  const textColors = {
    success: "#2E7D32",
    error: "#C62828",
    warning: "#EF6C00",
    info: "#1565C0",
  };

  return (
    <Paper
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: "10px",
        minWidth: "280px",
        backgroundColor: bgColors[type],
        color: textColors[type],
        boxShadow: 3,
      }}
    >
      {/* LEFT ICON */}
      <Box
        onClick={onIconClick}
        sx={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          backgroundColor: textColors[type],
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: "bold",
          cursor: "pointer",
          mr: 1,
        }}
      >
        ✓
      </Box>

      {/* MESSAGE */}
      <Typography sx={{ flex: 1, fontSize: "13px", fontWeight: 500 }}>
        {description}
      </Typography>

      {/* CLOSE */}
      <IconButton onClick={() => toast.dismiss(t.id)}>
        <CloseIcon sx={{ fontSize: "16px" }} />
      </IconButton>
    </Paper>
  );
};

// ===== Show Toast Helper =====
export const showToast = ({
  title,
  description,
  icon,
  position,
  type,
  onIconClick,
}) => {
  toast.custom(
    (t) => (
      <CustomToast
        t={t}
        title={title}
        description={description}
        icon={icon}
        type={type}
        onIconClick={onIconClick}
      />
    ),
    {
      position: position || "top-center",
      duration: 6000,
    }
  );
};