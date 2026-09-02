import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import { CustomSwitch } from "../NavBar.style";
import { useSettings } from "../../../contexts/use-settings";  // Custom hook for settings
import i18n from "i18next";

// Helper function to extract values from settings
const getValues = (settings) => ({
  direction: settings.direction,
  responsiveFontSizes: settings.responsiveFontSizes,
  theme: "light",  // Always use light theme
});

const ThemeSwitches = ({ noText }) => {
  // Retrieve settings and saveSettings from context
  const { settings, saveSettings } = useSettings();

  // Set initial state for values based on the settings object (fixed to light mode)
  const [values, setValues] = useState(getValues(settings));

  // Translate function from react-i18next
  const { t } = useTranslation();

  // Theme from Material-UI (not necessary for this change, but kept for completeness)
  const theme = useTheme();

  // Handle the switch change (no need for dark mode)
  const handleChange = (event) => {
    // We will no longer toggle between light and dark, so always set light mode
    saveSettings({
      ...values,
      theme: "light",  // Always keep light mode
    });

    // Update local state to reflect light mode
    setValues({ ...values, theme: "light" });
  };

  useEffect(() => {
    // Ensure default theme is set to light mode when the component first renders
    if (!settings.theme) {
      saveSettings({
        ...values,
        theme: "light",  // Set theme to light mode on initial load
      });
    }
  }, [settings, saveSettings, values]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={0.8}
    >
      {/* Custom Switch, but it will always reflect light mode */}
      <CustomSwitch
        checked={settings.theme === "light"}  // Always checked as it will only be light mode
        onChange={handleChange}  // Will always set light mode on toggle
      />
      {/* Display text only for light mode */}
      {!noText ? (
        <Typography color="#ffffff">
          {t("Light Mode")}  {/* Always display Light Mode */}
        </Typography>
      ) : null}
    </Stack>
  );
};

// Prop types validation (optional)
ThemeSwitches.propTypes = {
  noText: PropTypes.bool,  // Optionally disable text display
};

export default ThemeSwitches;
