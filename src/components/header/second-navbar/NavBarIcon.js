// src\components\header\second-navbar\NavBarIcon.js
import React from "react";
import { Badge, IconButton, Stack, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

const NavBarIcon = ({ icon, label, handleClick, badgeCount }) => {
  const { t } = useTranslation();

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <Tooltip
        title={t(label)}
        arrow
        placement="top"
        enterDelay={300}
        leaveDelay={100}
      >
        <IconButton
          onClick={handleClick}
          sx={{
            width: 48,
            height: 48,
            position: "relative",
          }}
        >
          {icon}

          {badgeCount !== null && (
            <Badge
              color="primary"
              badgeContent={badgeCount}
              sx={{
                position: "absolute",
                top: 6,
                right: 6,
              }}
            />
          )}
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default NavBarIcon;
