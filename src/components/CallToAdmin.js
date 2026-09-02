import { useTheme } from "@mui/material/styles";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import { Typography } from "@mui/material";
import React from "react";
import { TopBarButton } from "./header/NavBar.style";
import ClickToCall from "./header/top-navbar/ClickToCall";

const CallToAdmin = (props) => {
  const { configData } = props;
  const theme = useTheme();

  return (
    <ClickToCall phone={configData?.phone}>
      <TopBarButton
        size="small"
        variant="text"
        
        sx={{
          ".MuiTypography-body1": {
            transition: "all ease 0.5s",
          },
          "&:hover .MuiTypography-body1": {
            color:  "#ffffff !important",
          },
          color:"#ffffff",
        }}
        startIcon={
          <LocalPhoneIcon
            sx={{
              ml: 1,
              color:  "#ffffff",
            }}
          />
        }
      >
        <Typography sx={{ color:  "#ffffff", }}>
          {configData?.phone}
        </Typography>
      </TopBarButton>
    </ClickToCall>
  );
};

CallToAdmin.propTypes = {};

export default CallToAdmin;
