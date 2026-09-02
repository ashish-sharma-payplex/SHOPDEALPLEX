import React from "react";
import { Fade, Popover } from "@mui/material";
import Menu from "./Menu";

const AccountPopover = ({ cartListRefetch, anchorEl, onClose, open, openCartDrawer, ...other }) => {
  return (
    <Popover
      disableScrollLock
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      keepMounted
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 300 } }}
      transitionDuration={300}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      {...other}
    >
      {/* Pass cartListRefetch and openCartDrawer to Menu */}
      <Menu 
        onClose={onClose} 
        cartListRefetch={cartListRefetch}  
        openCartDrawer={openCartDrawer} 
      />
    </Popover>
  );
};

export default AccountPopover;
