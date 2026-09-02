import LoadingButton from "@mui/lab/LoadingButton";
import { alpha, Button, IconButton, styled } from "@mui/material";

export const CustomIconButton = styled(IconButton)(({ theme }) => ({
  background: theme.palette.neutral[100],
  boxShadow: `0px 4px 4px ${alpha(theme.palette.footer.inputButton, 0.5)}`,
  padding: 10,
}));

export const CustomButtonWarning = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
  },
  width: "100%",
  [theme.breakpoints.up("xs")]: {
    width: "11.5rem",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "0.313rem",
  },
}));

export const CustomButtonCancel = styled(Button)(({ theme, width }) => ({
  backgroundColor: theme.palette.neutral[300],
  color: theme.palette.neutral[1000],

  "&:hover": {
    backgroundColor: theme.palette.neutral[400],
  },
  width: "100%",
  [theme.breakpoints.up("xs")]: {
    width: width ? width : "11.5rem",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "0.313rem",
  },
}));

export const CustomButtonSuccess = styled(LoadingButton)(
  ({ theme, width }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.neutral[100],
    width: "100%",
    [theme.breakpoints.up("xs")]: {
      width: width ? width : "11.5rem",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "0.313rem",
    },
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  })
);

export const CustomButtonGray = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.neutral[300],
  color: theme.palette.neutral[100],
  width: "100%",
  [theme.breakpoints.up("xs")]: {
    width: "11.5rem",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "0.313rem",
  },
  "&:hover": {
    backgroundColor: theme.palette.neutral[400],
  },
}));

export const CustomButtonPrimary = styled(Button)(
  ({ theme, fullwidth, height }) => ({
    backgroundColor: "#FF6600",
    color: theme.palette.whiteContainer.main,
    width: fullwidth && "100%",
    height: height ? height : "",
    "&:hover": {
   
		backgroundColor: "#f06102", 
								
    },
    [theme.breakpoints.up("xs")]: {
      maxWidth: fullwidth === "true" ? "100%" : "131px",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "12px",
    },
  })
);

// ##ziaul

export const CustomButtonGreen = styled(Button)(
  ({ theme, fullwidth, height }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.whiteContainer.main,
    width: fullwidth && "100%",
    height: height ? height : "",
    "&:hover": {
   
		backgroundColor: "#008236", 
								
    },
    [theme.breakpoints.up("xs")]: {
      maxWidth: fullwidth === "true" ? "100%" : "170px",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "8px",
    },
  })
);


export const DeliveryOptionButton = styled(CustomButtonPrimary)(
  ({ theme, orderType }) => ({
    backgroundColor: orderType
      ?"#FF6600"
      : theme.palette.neutral[100],
    width: "100%",
    borderRadius: "5px",
    border: `1px solid #ffe553ff,`,
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    padding: "7px 16px",
    "&:hover": {
      backgroundColor: "#FF6600",
      ".text": {
        color: theme.palette.whiteContainer.main,
      },
    },
    [theme.breakpoints.down("md")]: {
      gap: "10px",
      fontSize: "12px",
      padding: "8px 10px",
      width: "fit-content",
    },
  })
);
