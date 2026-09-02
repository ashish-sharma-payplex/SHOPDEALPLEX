import React from 'react'
import { useMediaQuery, useTheme } from "@mui/material";

export const useIsSmallScreen = () => {
  const theme = useTheme();
  const isSmallSize = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmall = isSmallSize ? true : false;

  return isSmall;
};

// Keep the old function for backward compatibility, but mark it as deprecated
// WARNING: This function violates React Hooks rules. Use useIsSmallScreen() hook instead.
export const IsSmallScreen = () => {
  // console.error('IsSmallScreen is deprecated and violates React Hooks rules. Use useIsSmallScreen hook instead.');
  return false; // Return a safe default value
};
