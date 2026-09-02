import * as React from "react";
import { useEffect, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";

const BasicDateTimePicker = ({ value, handleDateChange, label, sx }) => {
  const [open, setOpen] = useState(false);

  // Close the calendar popup on a genuine user scroll so it doesn't stay
  // open and overlap the header / top section — no matter whether the
  // page itself scrolls (window) or the picker sits inside a nested
  // scrollable container (a sticky search bar, a modal, etc.).
  //
  // We attach the listener on `window` with capture:true. Scroll events
  // don't bubble, but they DO pass through the capture phase, so a
  // capture listener on window still fires for scrolling on any
  // descendant element — this is what lets it work for nested
  // containers, not just window.scrollY.
  //
  // NOTE: opening the popup itself can shift the layout (a scrollbar
  // appearing, content height changing), which can fire a synthetic
  // scroll event immediately. Reacting to that instantly caused the
  // calendar to flicker open/close in a loop, so we wait a short
  // moment after opening before we start listening, giving the popup's
  // own layout shift time to settle.
  useEffect(() => {
    if (!open) return undefined;

    let active = false;
    const armTimer = setTimeout(() => {
      active = true;
    }, 150);

    const handleScroll = () => {
      if (!active) return;
      setOpen(false);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      clearTimeout(armTimer);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [open]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        value={value ? dayjs(value) : null}
        onChange={handleDateChange}
        minDateTime={dayjs().subtract(10, "minute")}
        timeSteps={{ minutes: 1 }}
        label={label} // ⭐ label yaha dena hai
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          textField: {
            fullWidth: true,
            onClick: () => setOpen(true),
            sx: {
              width: 300,
              "& .MuiOutlinedInput-root": {
                height: "53px",
              },
              "& .MuiInputLabel-root": {
                top: "2px",
              },
              ...sx,
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default BasicDateTimePicker;
