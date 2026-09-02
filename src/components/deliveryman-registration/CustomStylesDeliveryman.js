import styled from "@emotion/styled";
import { Box } from "@mui/system";

export const RegistrationCardWrapper = styled(Box)(({ theme }) => ({
  border: `1px solid black`, // Add width, style, and color
  padding: "30px",
  marginTop: "40px", // Optional: Add padding
  background:"rgb(255, 255, 255)",
  [theme.breakpoints.down("md")]: {
    padding: "16px",
    marginTop: "30px",
  },
}));

export const ActonButtonsSection = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "end",
  alignItems: "center",
  gap: "15px",
}));

export const FormSection = styled(Box)(({ theme }) => ({}));
export const TitleTopSection = styled(Box)(({ theme }) => ({}));
