import * as React from "react";
import { useEffect, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";

const BasicDateTimePicker = ({ value, handleDateChange, label, sx }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    let active = false;
    const armTimer = setTimeout(() => {
      active = true;
    }, 150);

    const handleScroll = (event) => {
      if (!active) return;

      const target = event.target;
      if (
        target &&
        typeof target.closest === "function" &&
        target.closest(".MuiPickersPopper-root, .MuiPickersLayout-root")
      ) {
        return;
      }

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
