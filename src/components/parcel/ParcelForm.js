// ParcelForm.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  MenuItem,
  Switch,
  Button,
  Grid,
  FormControlLabel,
} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import useGetParcelCategory from "api-manage/hooks/react-query/percel/usePercelCategory";
import { useDispatch, useSelector } from "react-redux";
import { setParcelCategories } from "redux/slices/parcelCategoryData";
import toast, { Toaster } from "react-hot-toast";
import { PARCEL_RAW_KEY } from "./MainForm";

const STATIC_WEIGHT_RANGES = [
  { id: 1, weight_range: "0-20" },
  { id: 2, weight_range: "20-500" },
  { id: 3, weight_range: "500-1500" },
  { id: 4, weight_range: "1500-3000" },
];

const labelSx = { fontWeight: 500, mb: 0.5, ml: 0.5, fontSize: "14px" };

const selectFieldSx = {
  mb: 1.5,
  "& .MuiInputBase-root": { height: 32 },
  "& .MuiSelect-select": { paddingTop: "6px", paddingBottom: "6px", fontSize: "12px" },
};

const textFieldSx = {
  "& .MuiInputBase-root": { height: 32 },
  "& .MuiInputBase-input": { padding: "6px 10px", fontSize: "12px" },
};

// Read persisted field values once at component init
const readParcelRaw = () => {
  try {
    return JSON.parse(localStorage.getItem(PARCEL_RAW_KEY) || "null") || {};
  } catch {
    return {};
  }
};

const ParcelForm = ({ onNext, parcelData }) => {
  
  const dispatch = useDispatch();

  const selectedCategoryRedux = useSelector(
    (state) => state.parcelCategories?.parcelCategories,
  );

  const [initRaw] = useState(readParcelRaw);

  const [selectedCategoryId, setSelectedCategoryId] = useState(initRaw.selectedCategoryId || "");
  const [selectedWeightId,   setSelectedWeightId]   = useState(initRaw.selectedWeightId   || "");
  const [selectedUnit,       setSelectedUnit]       = useState(initRaw.selectedUnit       || "");
  const [length,             setLength]             = useState(initRaw.length             || "");
  const [breadth,            setBreadth]            = useState(initRaw.breadth            || "");
  const [height,             setHeight]             = useState(initRaw.height             || "");
  const [fragile,            setFragile]            = useState(initRaw.fragile            ?? false);
  const [instruction,        setInstruction]        = useState(initRaw.instruction        || "");
  const [fieldErrors,        setFieldErrors]        = useState({});
  const [touched,            setTouched]            = useState({});

  const { data: categories = [], refetch } = useGetParcelCategory();
  const profileInfo = useSelector((state) => state.profileInfo.profileInfo);
  const userId = profileInfo?.id || profileInfo?.user_id;

  // Persist all field values on every change
  useEffect(() => {
    try {
      localStorage.setItem(PARCEL_RAW_KEY, JSON.stringify({
        selectedCategoryId, selectedWeightId, selectedUnit,
        length, breadth, height, fragile, instruction,
      }));
    } catch {}
  }, [selectedCategoryId, selectedWeightId, selectedUnit, length, breadth, height, fragile, instruction]);

  useEffect(() => {
    const zone     = localStorage.getItem("zoneid");
    const location = localStorage.getItem("currentLatLng");
    if (!zone || !location) toast.error("Please select location to continue");
  }, []);

  useEffect(() => {
    if (selectedCategoryRedux?.id && !initRaw.selectedCategoryId) {
      setSelectedCategoryId(selectedCategoryRedux.id);
    }
  }, [selectedCategoryRedux]);

  useEffect(() => { refetch(); }, []);

  // Validation
  const getFrontendErrors = () => {
    const errors = {};
    if (!selectedCategoryId)    errors.selectedCategoryId = "Please select parcel category";
    if (!selectedWeightId)      errors.selectedWeightId   = "Please select weight range";
    if (!selectedUnit)          errors.selectedUnit       = "Please select unit";
    if (!length)                errors.length  = "Length is required";
    else if (isNaN(length))     errors.length  = "Length must be a number";
    if (!breadth)               errors.breadth = "Breadth is required";
    else if (isNaN(breadth))    errors.breadth = "Breadth must be a number";
    if (!height)                errors.height  = "Height is required";
    else if (isNaN(height))     errors.height  = "Height must be a number";
    return errors;
  };

  const getFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) return fieldErrors[fieldName];
    if (touched[fieldName] || touched.__submitted)
      return getFrontendErrors()[fieldName] || "";
    return "";
  };

  const handleBlur = (fieldName) =>
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

  const handleCategoryChange = (e) => {
    const id = e.target.value;
    setSelectedCategoryId(id);
    setTouched((prev) => ({ ...prev, selectedCategoryId: true }));
    const selected = categories.find((cat) => cat.id === id);
    if (selected) dispatch(setParcelCategories(selected));
  };

  const handleWeightChange = (e) => {
    setSelectedWeightId(e.target.value);
    setTouched((prev) => ({ ...prev, selectedWeightId: true }));
  };

  const handleUnitChange = (e) => {
    setSelectedUnit(e.target.value);
    setTouched((prev) => ({ ...prev, selectedUnit: true }));
  };

  const handleConfirm = () => {
    const coords = JSON.parse(localStorage.getItem("currentLatLng") || "null");
    const zone   = JSON.parse(localStorage.getItem("zoneid")        || "null");

    if (!coords) { toast.error("Please select location to continue"); return; }
    if (coords.lat < 6.5 || coords.lat > 37.1 || coords.lng < 68.1 || coords.lng > 97.4) {
      toast.error("Service is available only in India"); return;
    }
    if (!zone || zone.length === 0) {
      toast.error("Service not available in your area"); return;
    }

    setTouched({
      __submitted:      true,
      selectedCategoryId: true,
      selectedWeightId:   true,
      selectedUnit:       true,
      length:  true,
      breadth: true,
      height:  true,
    });

    const frontendErrors = getFrontendErrors();
    if (Object.keys(frontendErrors).length > 0) {
      toast.error(Object.values(frontendErrors)[0]);
      return;
    }

    toast.success("Parcel details saved successfully!");

    const selectedWeightObj = STATIC_WEIGHT_RANGES.find((w) => w.id === selectedWeightId);

    const parcelPayload = {
      user_id:          userId,
      category_id:      selectedCategoryId,
      weight_rangeid:   selectedWeightObj?.weight_range || "",
      measurement_unit: selectedUnit?.toUpperCase(),
      parcel_length:    String(length),
      parcel_breadth:   String(breadth),
      parcel_height:    String(height),
      instructions:     instruction || "No Instructions",
      fragile_items:    fragile ? "Yes" : "No",
    };

    setTimeout(() => { onNext(parcelPayload); }, 800);
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Box sx={{ fontFamily: "Inter", display: "flex", alignItems: "flex-start",
        justifyContent: "center", p: 0, mt: 2, mb: 2, maxWidth: 1100 }}>
        <Card elevation={0} sx={{ p: 2, mb: 0, borderRadius: 3,
          boxShadow: "none", border: "none", width: "100%" }}>
          <Grid container spacing={2} alignItems="stretch">

            {/* LEFT FORM */}
            <Grid item xs={12} md={5} sx={{ display: "flex" }}>
              <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "16px", p: 3,
                bgcolor: "#fff", width: "100%", display: "flex",
                flexDirection: "column", justifyContent: "space-between" }}>

                {/* Parcel Category */}
                <Typography sx={labelSx}>
                  Parcel Categories&nbsp;<span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField select fullWidth size="small"
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                  onBlur={() => handleBlur("selectedCategoryId")}
                  error={!!getFieldError("selectedCategoryId")}
                  helperText={getFieldError("selectedCategoryId")}
                  sx={selectFieldSx}>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id} sx={{ fontSize: "12px" }}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Weight Range */}
                <Typography sx={labelSx}>
                  Weight Range&nbsp;<span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField select fullWidth size="small"
                  value={selectedWeightId || ""}
                  onChange={handleWeightChange}
                  onBlur={() => handleBlur("selectedWeightId")}
                  error={!!getFieldError("selectedWeightId")}
                  helperText={getFieldError("selectedWeightId")}
                  sx={selectFieldSx}
                  SelectProps={{
                    renderValue: (selected) => {
                      if (!selected)
                        return <span style={{ color: "#9e9e9e", fontSize: "12px" }}>Select Weight Range</span>;
                      const item = STATIC_WEIGHT_RANGES.find((w) => w.id === selected);
                      return <span style={{ fontSize: "12px" }}>{item ? item.weight_range : selected}</span>;
                    },
                  }}>
                  <MenuItem value="" disabled sx={{ fontSize: "12px" }}>Select Weight Range</MenuItem>
                  {STATIC_WEIGHT_RANGES.map((item) => (
                    <MenuItem key={item.id} value={item.id} sx={{ fontSize: "12px" }}>
                      {item.weight_range}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Unit */}
                <Typography sx={labelSx}>
                  Unit&nbsp;<span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField select fullWidth size="small"
                  value={selectedUnit}
                  onChange={handleUnitChange}
                  onBlur={() => handleBlur("selectedUnit")}
                  error={!!getFieldError("selectedUnit")}
                  helperText={getFieldError("selectedUnit")}
                  sx={selectFieldSx}>
                  <MenuItem value="" sx={{ fontSize: "12px" }}><em>Select Unit</em></MenuItem>
                  {["cm", "mm", "m", "ml", "g", "kg"].map((u) => (
                    <MenuItem key={u} value={u} sx={{ fontSize: "12px" }}>
                      {u.charAt(0).toUpperCase() + u.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Length / Breadth / Height */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {[
                    { label: "Length",  value: length,  setter: setLength,  key: "length",  placeholder: "Enter length" },
                    { label: "Breadth", value: breadth, setter: setBreadth, key: "breadth", placeholder: "Enter breadth" },
                    { label: "Height",  value: height,  setter: setHeight,  key: "height",  placeholder: "Enter height"  },
                  // Replace the .map() block for Length / Breadth / Height fields:

].map(({ label, value, setter, key, placeholder }) => (
  <Grid item xs={4} key={key}>
    <Typography sx={labelSx}>
      {label}&nbsp;<span style={{ color: "red" }}>*</span>
    </Typography>
    <TextField size="small" fullWidth type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        const val = e.target.value;
        if (val === "" || /^(?:\d{0,3})(?:\.\d{0,2})?$/.test(val))
          setter(val);
      }}
      onBlur={() => handleBlur(key)}
      error={!!getFieldError(key)}
      helperText={getFieldError(key)}
      inputProps={{ inputMode: "decimal", maxLength: 6 }}
      FormHelperTextProps={{           // ← ADD THIS
        sx: {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: "10px",
          mx: 0,
        },
      }}
      sx={textFieldSx}
    />
  </Grid>
))}
                </Grid>

                {/* Fragile */}
                <Card variant="outlined" sx={{ p: 2, mb: 2, borderRadius: "8px !important" }}>
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Typography fontWeight={500} mb={0.5} fontSize="14px">
                        Fragile Item (optional)
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        Need Extensive care
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={fragile}
                          onChange={(e) => setFragile(e.target.checked)}
                          color="success"
                        />
                      }
                    />
                  </Box>
                </Card>

                {/* Instructions */}
                <Typography sx={labelSx}>Special Instructions (optional)</Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={instruction}
                  onChange={(e) => {
                    const value = e.target.value;
                  
                    if (value === "" || value[0] !== " ") {
                      setInstruction(value);
                    }
                  }}
                  placeholder="For eg. Handle with care, call before delivery"
                  sx={{ "& .MuiInputBase-input": { fontSize: "12px" } }}
                />

                {/* Submit */}
                <Button
                  fullWidth
                  onClick={handleConfirm}
                  endIcon={<KeyboardArrowRightIcon />}
                  sx={{
                    backgroundColor: "#1f8f4a", color: "#fff",
                    textTransform: "none", fontWeight: 600,
                    fontSize: "16px", borderRadius: "10px",
                    height: "45px", mt: 2,
                    "&:hover": { backgroundColor: "#187a3e" },
                  }}>
                  Confirm & Continue
                </Button>
              </Box>
            </Grid>

            {/* RIGHT IMAGE */}
            <Grid item xs={12} md={7} sx={{ display: { xs: "none", md: "flex" } }}>
              <Box sx={{ width: "100%", height: "100%", display: "flex",
                alignItems: "center", justifyContent: "center" }}>
                <Box component="img" src="/parcelForm.png" alt="delivery"
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </Box>
            </Grid>

          </Grid>
        </Card>
      </Box>
    </>
  );
};

export default ParcelForm;