import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import { CustomSwitch } from "../NavBar.style";
import { useSettings } from "../../../contexts/use-settings"; // Custom hook for settings
import i18n from "i18next";

// Helper function to extract values from settings
const getValues = (settings) => ({
  direction: settings.direction,
  responsiveFontSizes: settings.responsiveFontSizes,
  theme: settings.theme || "light",
});

const ThemeSwitches = ({ noText }) => {
  // Retrieve settings and saveSettings from context
  const { settings, saveSettings } = useSettings();

  // Local state kept in sync with the real settings object
  const [values, setValues] = useState(getValues(settings));

  useEffect(() => {
    setValues(getValues(settings));
  }, [settings]);

  // Translate function from react-i18next
  const { t } = useTranslation();

  // Theme from Material-UI
  const theme = useTheme();

  // Toggle between light <-> dark on every switch click
  const handleChange = (event) => {
    const nextTheme = settings.theme === "dark" ? "light" : "dark";
    const updated = { ...settings, theme: nextTheme };
    saveSettings(updated);
    setValues(updated);
  };

  useEffect(() => {
    // Only set a default the very first time (no theme saved yet).
    // Do NOT force it back to light on every render.
    if (!settings.theme) {
      saveSettings({
        ...settings,
        theme: "light",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDark = settings.theme === "dark";

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={0.8}
    >
      <CustomSwitch checked={isDark} onChange={handleChange} />
      {!noText ? (
        <Typography
          color={theme.palette.mode === "dark" ? "#ffffff" : "#000000"}
        >
          {isDark ? t("Dark Mode") : t("Light Mode")}
        </Typography>
      ) : null}
    </Stack>
  );
};

// Prop types validation (optional)
ThemeSwitches.propTypes = {
  noText: PropTypes.bool,
};

export default ThemeSwitches;
