import styled from "@emotion/styled";
import { Stack, IconButton } from "@mui/material";
import { alpha } from "@mui/material/styles";

/* Referral Code Preview Box */
export const CodePreviewWrapper = styled(Stack)(({ theme }) => ({
  width: "100%",
//   backgroundColor: alpha(theme.palette.success.main, 0.12),
  border: `1.5px dashed ${theme.palette.success.main}`,
  borderRadius: "8px",
  padding: "10px 14px",
}));

/* Social Share Icons Container */
export const ReferralShareBox = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "horizontal",
})(({ horizontal }) => ({
  display: "flex",
  flexDirection: horizontal ? "row" : "row",
  justifyContent: "center",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
}));

/* Extra Share Button (last icon) */
export const ShareButton = styled(IconButton)(({ theme, size }) => ({
  width: size || "40px",
  height: size || "40px",
  borderRadius: "50%",
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
}));
