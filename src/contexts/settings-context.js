import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

const initialSettings = {
  direction: "ltr",
  responsiveFontSizes: true,
  theme: "light",
};

// window.matchMedia('(prefers-color-scheme: dark)').matches
//     ? 'dark'
//     : 'light'
export const restoreSettings = () => {
  let settings = null;

  try {
    const storedData = window.localStorage.getItem("settings");
    if (storedData) {
      settings = JSON.parse(storedData);
    } else {
      settings = {
        direction: "ltr",
        responsiveFontSizes: true,
        theme: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      };
    }
  } catch (err) {
    // If stored data is not a stringified JSON this will fail,
    // that's why we catch the error
  }

  return settings;
};
export const storeSettings = (settings) => {
  window.localStorage.setItem("settings", JSON.stringify(settings));
};
export const SettingsContext = createContext({
  settings: initialSettings,
  saveSettings: () => {},
});
export const SettingsProvider = (props) => {
  const { children } = props;
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    const restoredSettings = restoreSettings();
    if (restoredSettings) {
      setSettings(restoredSettings);
    }
  }, []);

  // Bridge: mirror settings.theme onto <html data-theme="..."> so that
  // plain CSS files (Food.css, rental.module.css, navbar.css, footer.css)
  // can react to the SAME toggle MUI uses, instead of the OS-level
  // prefers-color-scheme. Without this, MUI theme and plain CSS go out
  // of sync (MUI stuck on one mode, CSS following the OS setting).
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(
        "data-theme",
        settings.theme === "dark" ? "dark" : "light",
      );
    }
  }, [settings.theme]);

  const saveSettings = (updatedSettings) => {
    setSettings(updatedSettings);
    storeSettings(updatedSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const SettingsConsumer = SettingsContext.Consumer;
