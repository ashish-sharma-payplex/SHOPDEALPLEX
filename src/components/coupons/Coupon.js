import { Card, Typography, Box, IconButton } from "@mui/material";
import { Stack } from "@mui/system";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import moment from "moment";
import toast from "react-hot-toast";

const Coupon = ({ coupon, setCopy, index, isExpired, isExpiringSoon }) => {
  const bgColors = [
    "#f3fcff",
    "#f5f5fa",
    "#e9e9e9",
    "#d1e9ff",
    "#f1f1f1",
    "#fffee5",
  ];

  const bgColor = bgColors[index % bgColors.length];

  const handleCopy = (couponCode) => {
    setCopy(couponCode);
    navigator.clipboard
      .writeText(couponCode)
      .then(() => {
        toast.success(`Coupon code ${couponCode} copied!`);
      })
      .catch(() => {
        toast.error("Failed to copy code!");
      });
  };

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        display: "flex",
        backgroundColor: bgColor,
        borderRadius: "10px",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
        overflow: "hidden",
        mb: 2,
        opacity: isExpired ? 0.5 : 1,
        pointerEvents: isExpired ? "none" : "auto",
        filter: isExpired ? "grayscale(100%)" : "none",

        // Height fix for all coupons (adjust height as needed)
        minHeight: "160px",

        // Maintain left-right cut shape with WebkitMaskImage as before
        WebkitMaskImage:
          "radial-gradient(circle at 0px 50%, transparent 15px, white 16px), radial-gradient(circle at 100% 50%, transparent 15px, white 16px)",
        WebkitMaskComposite: "destination-in",
        maskComposite: "intersect",
      }}
    >
      {/* LEFT STRIP */}
      <Box
        sx={{
          width: "70px",
          backgroundColor: "rgba(0,0,0,0.03)",
          borderRight: "1px dashed #1A914B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pl: 2,
        }}
      >
        <Box
          sx={{
            border: "1px dashed #1A914B",
            borderRadius: "6px",
            padding: "6px 4px",
          }}
        >
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#1A914B",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              textAlign: "center",
              pt: 1,
            }}
          >
            DISCOUNT
          </Typography>
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#1A914B",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              textAlign: "center",
            }}
          >
            COUPON
          </Typography>
        </Box>
      </Box>

      {/* RIGHT CONTENT */}
      <Stack
        flex={1}
        padding="16px"
        spacing={0.8}
        justifyContent="center"
        // Fix the height so content always aligns vertically
        sx={{ height: "100%" }}
      >
        {isExpired && (
          <Typography fontSize="11px" color="#ff4d4d" fontWeight={700}>
            EXPIRED
          </Typography>
        )}

        {isExpiringSoon && !isExpired && (
          <Box
            sx={{
              backgroundColor: "#fff3cd",
              color: "#856404",
              fontSize: "10px",
              fontWeight: 700,
              px: 1,
              py: "2px",
              borderRadius: "4px",
              width: "fit-content",
            }}
          >
            Expiring Soon
          </Box>
        )}

        <Typography fontSize="13px" fontWeight={500}>
          Flat {coupon?.discount} off*
        </Typography>

        <Typography fontSize="16px" fontWeight={700}>
          {coupon?.code}
        </Typography>

        <Typography fontSize="11px" color="text.secondary">
          Valid until {moment(coupon?.expire_date).format("DD MMMM YYYY")}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
          <Box
            sx={{
              backgroundColor: "rgba(26,145,75,0.1)",
              border: "1px dashed #1A914B",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {coupon?.code}
          </Box>

          <IconButton size="small" onClick={() => handleCopy(coupon?.code)}>
            <ContentCopyIcon sx={{ fontSize: "14px" }} />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
};

export default Coupon;
