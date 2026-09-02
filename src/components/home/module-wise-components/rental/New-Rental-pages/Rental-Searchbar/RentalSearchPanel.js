import {
  alpha,
  Box,
  Stack,
  useTheme,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
  MenuItem,
  ListItemText,
  Radio,
} from "@mui/material";
import { t } from "i18next";
import React from "react";
import RentalSearchLocation from "components/home/module-wise-components/rental/components/global/search/RentalSearchLocation";
import DateTimePicker from "components/home/module-wise-components/rental/components/global/DateTimePicker";
import { CustomTextField } from "styled-components/CustomStyles.style";
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined";
import dayjs from "dayjs";

const RentalSearchPanel = (props) => {
  const theme = useTheme();

  const {
    rentalSearch,
    searchKey,
    locations,
    selectedDate,
    tripType,
    duration,
    open,
    isFocused,
    handleLocationChange,
    handleSearchChange,
    handleDateChange,
    handleTripTypeChange,
    handleDurationChange,
    handleSearchClick,
    handleOpen,
    handleClick,
    handleFocus,
    setOpenMap,
    pickLocationFormAddress,
    getCurrentLocation,
    formControlRef,
    inputRef,
    searchPanelRef,
    predictions,
  } = props;

  return (
    <Box
      ref={searchPanelRef}
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 20,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1000px",
          mx: { xs: 2, md: 0 },
          p: 3,
          backgroundColor: theme.palette.background.paper,
          borderRadius: "12px",
          boxShadow: `0px 10px 30px 0px ${alpha(
            theme.palette.neutral[1000],
            0.1
          )}`,
        }}
      >
        <Stack
          direction="row"
          flexWrap={{ xs: "wrap", md: "nowrap" }}
          gap={2}
          sx={{
            "> *": {
              flexBasis: { xs: "100%", sm: "48%", md: "auto" },
            },
          }}
        >
          {/* Destination */}
          <Box flexGrow={1} sx={{ minWidth: { md: "250px" } }}>
            <RentalSearchLocation
              setOpenMap={setOpenMap}
              fromHome
              getCurrentLocation={getCurrentLocation}
              pickLocationFormAddress={pickLocationFormAddress}
              predictions={predictions}
              handleChange={(e, val) =>
                handleLocationChange("destination", val)
              }
              HandleChangeForSearch={handleSearchChange}
              label={t("Destination")}
              height="40px"
              onFocus={handleFocus}
              disabled={!locations.pickup}
              value={{
                description: searchKey,
              }}
              isFocused={isFocused}
              endIcon={
                <NearMeOutlinedIcon
                  sx={{
                    color: (theme) => alpha(theme.palette.neutral[400], 0.5),
                  }}
                />
              }
            />
          </Box>

          {/* DatePicker */}
          <Box flexGrow={1} sx={{ minWidth: { md: "250px" } }}>
            <DateTimePicker
              value={dayjs(rentalSearch?.selectedDate || selectedDate)}
              handleDateChange={handleDateChange}
              label="Pickup date & time"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    border: "1px solid",
                    borderColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.4),
                  },
                  height: "40px",
                },
              }}
            />
          </Box>

          {/* Trip Type + Duration */}
          <Box flexGrow={1} sx={{ minWidth: { md: "180px" } }}>
            <FormControl ref={formControlRef} sx={{ width: "100%" }}>
              <InputLabel id="trip-type-label">{t("Trip Type")}</InputLabel>
              <Select
                labelId="trip-type-label"
                value={rentalSearch?.tripType || tripType}
                sx={{ textTransform: "capitalize", height: "40px" }}
                onChange={handleTripTypeChange}
                open={open}
                onOpen={handleOpen}
                input={<OutlinedInput label={t("Trip Type")} />}
                renderValue={(s) => t(s?.replaceAll("_", " "))}
              >
                <MenuItem
                  value="distance_wise"
                  onClick={(e) => handleClick(e, "distance_wise")}
                >
                  <Radio checked={tripType === "distance_wise"} />
                  <ListItemText primary={t("Distance Wise")} />
                </MenuItem>

                <MenuItem
                  value="hourly"
                  onClick={(e) => handleClick(e, "hourly")}
                >
                  <Radio checked={tripType === "hourly"} />
                  <ListItemText primary={t("Hourly")} />
                </MenuItem>

                {tripType === "hourly" && open && (
                  <Box ref={inputRef} sx={{ px: 2, mt: 2, pb: 2 }}>
                    <CustomTextField
                      label={t("Duration (Hours)")}
                      value={duration}
                      onChange={handleDurationChange}
                      type="number"
                      sx={{ width: "100%" }}
                    />
                  </Box>
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Search Button */}
          <Box
            sx={{
              width: { xs: "100%", md: "auto" },
              alignSelf: "flex-end",
              minWidth: { md: "150px" },
            }}
          >
            <Button
              variant="contained"
              onClick={handleSearchClick}
              fullWidth
              sx={{
                height: "40px",
                borderRadius: "8px",
                fontSize: "1rem",
                backgroundColor: theme.palette.success.main,
                "&:hover": { backgroundColor: theme.palette.success.dark },
              }}
            >
              {t("Find a Vehicle")}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default RentalSearchPanel;
