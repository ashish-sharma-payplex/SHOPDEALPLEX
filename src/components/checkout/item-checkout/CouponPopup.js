import { Card, Typography, Box, IconButton, Stack } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import moment from "moment";
import toast from "react-hot-toast";

const Coupon = ({ coupon, setCopy, index, isExpired, isExpiringSoon }) => {
  const bgColors = ["#f3fcff", "#f5f5fa", "#e9e9e9", "#d1e9ff", "#f1f1f1", "#fffee5"];
  const bgColor = bgColors[index % bgColors.length];

  const handleCopy = (code) => {
    setCopy(code);
    navigator.clipboard.writeText(code)
      .then(() => toast.success(`Coupon code ${code} copied!`))
      .catch(() => toast.error("Failed to copy code!"));
  };

  return (
    <Card sx={{
      display: "flex", backgroundColor: bgColor, borderRadius: "10px",
      opacity: isExpired ? 0.5 : 1, pointerEvents: isExpired ? "none" : "auto", mb: 2
    }}>
      <Box sx={{ width: "70px", backgroundColor: "rgba(0,0,0,0.03)", borderRight: "1px dashed #1A914B", display: "flex", alignItems: "center", justifyContent: "center", pl: 2 }}>
        <Box sx={{ border: "1px dashed #1A914B", borderRadius: "6px", padding: "6px 4px" }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#1A914B", writingMode: "vertical-rl", transform: "rotate(180deg)", textAlign: "center" }}>DISCOUNT</Typography>
          <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#1A914B", writingMode: "vertical-rl", transform: "rotate(180deg)", textAlign: "center" }}>COUPON</Typography>
        </Box>
      </Box>

      <Stack flex={1} padding="16px" spacing={0.8} justifyContent="center">
        {isExpired && <Typography fontSize="11px" color="#ff4d4d" fontWeight={700}>EXPIRED</Typography>}
        {isExpiringSoon && !isExpired && <Box sx={{ backgroundColor: "#fff3cd", color: "#856404", fontSize: "10px", fontWeight: 700, px: 1, py: "2px", borderRadius: "4px", width: "fit-content" }}>Expiring Soon</Box>}
        <Typography fontSize="13px" fontWeight={500}>Flat {coupon.discount} off*</Typography>
        <Typography fontSize="16px" fontWeight={700}>{coupon.code}</Typography>
        <Typography fontSize="11px" color="text.secondary">Valid until {moment(coupon.expire_date).format("DD MMM YYYY")}</Typography>

        <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
          <Box sx={{ backgroundColor: "rgba(26,145,75,0.1)", border: "1px dashed #1A914B", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 600 }}>{coupon.code}</Box>
          <IconButton size="small" onClick={() => handleCopy(coupon.code)}><ContentCopyIcon sx={{ fontSize: "14px" }} /></IconButton>
        </Stack>
      </Stack>
    </Card>
  );
};

export default Coupon;
