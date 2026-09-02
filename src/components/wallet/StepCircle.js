// src\components\wallet\StepCircle.js
import CheckIcon from "@mui/icons-material/Check";
import { Box } from "@mui/system";

const StepCircle = ({ size = 24, iconSize = 16 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: "#0F9D58",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    }}
  >
    <CheckIcon sx={{ color: "#fff", fontSize: iconSize }} />
  </Box>
);

export default StepCircle;
