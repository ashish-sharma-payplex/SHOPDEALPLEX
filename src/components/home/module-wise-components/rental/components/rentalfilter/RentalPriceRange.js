import { alpha, Box, Typography } from "@mui/material";
import CustomSlider from "components/search/CustomSlider";
import React from "react";
import { CustomTextField } from "styled-components/CustomStyles.style";
import { getAmountWithSign } from "helper-functions/CardHelpers";

const RentalPriceRange = ({ minMax, setMinMax, rentalPriceFilterRange }) => {
  const handleMinMax = (value) => {
    setMinMax(value);
  };

  // ✅ SAFE VALUES (no ||)
  const min = minMax?.[0] ?? rentalPriceFilterRange?.[0] ?? 0;

  const max = minMax?.[1] ?? rentalPriceFilterRange?.[1] ?? 0;

  return (
    <>
      {/* PRICE LABELS */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: "7px",
        }}
      >
        <Typography
          sx={{
            color: (theme) => theme.palette.text.primary,
            letterSpacing: "1px",
          }}
        >
          {getAmountWithSign(min)}
        </Typography>

        <Typography
          sx={{
            fontSize: "12px",
            color: (theme) => theme.palette.neutral[400],
          }}
        >
          {getAmountWithSign(max)}
        </Typography>
      </Box>

      {/* SLIDER */}
      <CustomSlider
        handleChangePrice={handleMinMax}
        minMax={[min, max]}
        rentalPriceFilterRange={rentalPriceFilterRange}
      />

      {/* INPUT BOXES */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "9px",
        }}
      >
        <CustomTextField
          type="number"
          disabled
          value={min}
          sx={{
            textAlign: "center",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none !important",
            },
            "& .MuiInputBase-input": {
              padding: "10px",
              borderRadius: "5px",
              textAlign: "center",
              background: (theme) => alpha(theme.palette.neutral[200], 0.3),
            },
          }}
        />

        <Typography>-</Typography>

        <CustomTextField
          type="number"
          disabled
          value={max}
          sx={{
            textAlign: "center",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none !important",
            },
            "& .MuiInputBase-input": {
              padding: "10px",
              borderRadius: "5px",
              textAlign: "center",
              background: (theme) => alpha(theme.palette.neutral[200], 0.3),
            },
          }}
        />
      </Box>
    </>
  );
};

export default RentalPriceRange;
