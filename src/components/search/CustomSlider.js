import React, { useEffect, useState } from "react";
import { Slider, Stack, styled } from "@mui/material";
import { useSelector } from "react-redux";
import { useIsMount } from "../first-render-useeffect-controller/useIsMount";

const StyledSlider = styled(Slider)(({ theme }) => ({
  "& .MuiSlider-rail": {
    height: "5px",
    backgroundColor: theme.palette.neutral[600],
  },

  "& .MuiSlider-mark": {
    display: "none",
  },

  "& .MuiSlider-thumb": {
    backgroundColor: theme.palette.neutral[100],
    border: `4px solid ${theme.palette.primary.main}`,
    boxShadow: "0px 2px 4px rgba(9, 87, 203, 0.15)",
  },
}));

const CustomSlider = ({
  handleChangePrice,
  minMax,
  priceFilterRange,
  store,
  rentalPriceFilterRange,
}) => {
  const { filterData } = useSelector(
    (state) => state.searchFilterStore
  );

  // ✅ SAFE initial value
  const [value, setValue] = useState(
    rentalPriceFilterRange?.[0] != null &&
      rentalPriceFilterRange?.[1] != null
      ? [
          Number(rentalPriceFilterRange[0]),
          Number(rentalPriceFilterRange[1]),
        ]
      : [
          Number(minMax?.[0] ?? 0),
          Number(minMax?.[1] ?? 0),
        ]
  );

  const minDistance = 1;
  const isMount = useIsMount();

  /* ---------------------------------- */
  /* SLIDER CHANGE LOGIC */
  /* ---------------------------------- */

  const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) return;

    if (activeThumb === 0) {
      setValue([
        Math.min(newValue[0], value[1] - minDistance),
        value[1],
      ]);
    } else {
      setValue([
        value[0],
        Math.max(newValue[1], value[0] + minDistance),
      ]);
    }
  };

  const handleChangeCommitted = (event, newValue) => {
    handleChangePrice(newValue);
  };

  /* ---------------------------------- */
  /* SYNC WITH API RANGE */
  /* ---------------------------------- */

  useEffect(() => {
    if (
      rentalPriceFilterRange &&
      rentalPriceFilterRange[0] != null &&
      rentalPriceFilterRange[1] != null
    ) {
      setValue([
        Number(rentalPriceFilterRange[0]),
        Number(rentalPriceFilterRange[1]),
      ]);
    }
  }, [rentalPriceFilterRange]);

  useEffect(() => {
    if (
      (!rentalPriceFilterRange ||
        rentalPriceFilterRange[0] == null) &&
      minMax
    ) {
      setValue([
        Number(minMax?.[0] ?? 0),
        Number(minMax?.[1] ?? 0),
      ]);
    }
  }, [minMax, rentalPriceFilterRange]);

  /* ---------------------------------- */
  /* SAFE LIMITS */
  /* ---------------------------------- */

  const min = rentalPriceFilterRange?.[0] != null
    ? Number(rentalPriceFilterRange[0])
    : 0;

  const max = rentalPriceFilterRange?.[1] != null
    ? Number(rentalPriceFilterRange[1])
    : 20000;

  /* ---------------------------------- */
  /* RENDER */
  /* ---------------------------------- */

  return (
    <Stack
      direction="row"
      sx={{ mb: 1 }}
      alignItems="center"
      spacing={1}
      px=".7rem"
    >
      <StyledSlider
        value={value}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay="auto"
        disabled={
          priceFilterRange &&
          (store
            ? priceFilterRange?.min_price === priceFilterRange?.max_price
            : priceFilterRange?.[0] === priceFilterRange?.[1])
        }
        min={min}
        max={max}
        marks={[
          { value: min },
          { value: max },
        ]}
        disableSwap
      />
    </Stack>
  );
};

export default CustomSlider;
