import { styled } from "@mui/material/styles";
import { alpha, Button, Grid, Typography, Box } from "@mui/material";

export const OrderIdTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.main,
  [theme.breakpoints.up("xs")]: {
    fontSize: "16px",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "24px",
  },
}));

export const DateTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "14px",
  [theme.breakpoints.down("md")]: {
    fontSize: "12px",
  },
}));

export const OrderAmountTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  [theme.breakpoints.up("xs")]: {
    fontSize: "14px",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "18px",
  },
}));

export const SuccessButton = styled(Button)(({ theme }) => ({
  background: "rgba(0, 171, 17, 0.15)",
  color: theme.palette.success.main,
  borderRadius: "6px",
  fontWeight: 600,
  [theme.breakpoints.up("xs")]: {
    width: "70px",
    height: "24px",
    fontSize: "14px",
  },
  [theme.breakpoints.up("md")]: {
    width: "100px",
    height: "36px",
    fontSize: "16px",
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.success.main, 0.25),
  },
}));

export const PendingButton = styled(Box)(({ theme }) => ({
  textAlign: "center",
  textTransform: "capitalize",
  background: "rgba(0, 95, 149, 0.15)",
  color: theme.palette.info.dark,
  borderRadius: "6px",
  padding: "6px 12px",
  width: "auto",
  fontWeight: 600,
  [theme.breakpoints.down("md")]: {
    maxWidth: "120px",
  },
  [theme.breakpoints.up("xs")]: {
    fontSize: "14px",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "18px",
  },
}));

export const TrackOrderButton = styled(Button)(({ theme }) => ({
  width: "100%",
  color: "#078A46",
  borderRadius: "6px",
  alignItems: "center",
  padding: "8px 16px",
  fontWeight: 600,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#078A46",
    color: theme.palette.common.white,
  },
  [theme.breakpoints.down("md")]: {
    padding: "4px 8px",
    fontSize: "14px",
  },
}));

export const HeadingBox = styled(Box)(() => ({
  padding: "12px 0 24px 0",
}));

export const OrderStatusBox = styled(Box)(({ theme }) => ({
  padding: "10px 0 24px 0",
  [theme.breakpoints.up("xs")]: {
    textAlign: "center",
  },
}));

export const OrderStatusGrid = styled(Grid)(({ theme }) => ({
  background: theme.palette.neutral[300],
  borderRadius: "16px",
  padding: "24px",
  rowGap: "12px",
}));

export const InformationGrid = styled(Grid)(({ theme }) => ({
  background: theme.palette.primary.custom6,
  borderRadius: "16px",
  padding: "24px",
  [theme.breakpoints.down("md")]: {
    background: theme.palette.neutral[100],
    padding: "16px",
  },
}));

export const OrderStatusButton = styled(Button)(
  ({ theme, background, fontcolor }) => ({
    textTransform:"capitalize",
    backgroundColor: background,
    color: theme.palette.common.white,
     padding: "8px 12px",
    borderRadius: "10px",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: alpha(background, 0.85),
    },
    [theme.breakpoints.down("md")]: {
      padding: "6px 8px",
      fontSize: "12px",
    },
  })
);
