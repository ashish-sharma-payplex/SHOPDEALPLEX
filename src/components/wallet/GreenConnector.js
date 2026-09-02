import { StepConnector, styled } from "@mui/material";

export const GreenConnector = styled(StepConnector)(({ orientation, isMobile }) => ({
  ...(orientation === "horizontal" && {
     top: "30%",  
    "& .MuiStepConnector-line": {
      borderTopWidth: 2,
      borderColor: "#0F9D58",
    },
  }),
  ...(orientation === "vertical" && {
    left: 0, // move line to left
    position: "absolute", // position absolute to control placement
    top: 0,
    "& .MuiStepConnector-line": {
      borderLeftWidth: 2,
      borderColor: "#0F9D58",
      minHeight: isMobile ? 18 : 30, // line height shorter for mobile
      marginLeft: isMobile ? 9 : 12, // adjust left to center under circle
      marginTop: isMobile ? 6 : 0,   // start line just below circle
    },
  }),
}));
