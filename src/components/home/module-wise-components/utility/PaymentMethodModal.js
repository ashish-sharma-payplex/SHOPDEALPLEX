import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  CircularProgress,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import useRegisterBbpsIntent from "api-manage/hooks/react-query/utility/userRegisterBbpsIntent";
import usePayBbpsBillV2 from "api-manage/hooks/react-query/utility/usePayBbpsbillv2";
import useGetProfile from "api-manage/hooks/react-query/profile/useGetProfile";
import { useDispatch } from "react-redux";
import { setUser } from "redux/slices/profileInfo";

const PaymentMethodModal = ({
  open,
  onClose,
  amount,
  billerId,
  customerParms,
  service,
  service_slug,
  amountTags = [],
  fetchRefId = "",
}) => {
  const dispatch = useDispatch();

  const userOnSuccessHandler = (res) => {
    dispatch(setUser(res));
  };

  const { data: userData, refetch } = useGetProfile(userOnSuccessHandler);
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("upi");

  const { mutateAsync: registerIntent, isLoading: registeringIntent } =
    useRegisterBbpsIntent();
  const { mutateAsync: payBillV2, isLoading: payingBill } = usePayBbpsBillV2();

  const isLoading = registeringIntent || payingBill;

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open]);

  const handleMakePayment = async () => {
    if (selectedMethod === "upi") {
      // ── UPI Flow ──────────────────────────────────────────────────────────
      let intentRes = null;
      try {
        intentRes = await registerIntent({ amount });
        if (!intentRes || !intentRes.upi_link) {
          toast.error("Failed to generate QR. Please try again.");
          return;
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while creating QR.";
        toast.error(msg);
        return;
      }

      const upi_order_id = intentRes.order_id;
      const upi_link = intentRes.upi_link;
      const expiry = intentRes.expiry;

      sessionStorage.setItem(
        "bbps_qr_data",
        JSON.stringify({
          upi_link,
          order_id: upi_order_id,
          expiry,
          amount,
          biller_name: service || service_slug,
          biller_id: billerId,
          customerParms,
           service: service || service_slug,  
          service_slug,
          amountTags,
          fetchRefId,
        }),
      );

      // Background mein fire karo — non-blocking
      // payBillV2({
      //   payment_method: "upi",
      //   upi_order_id,
      //   billerId,
      //   customerParms,
      //   service: service || service_slug,
      //   service_slug,
      //   amount: Number(amount),
      //   amountTags,
      //   fetchRefId,
      // }).catch((err) => {
      //   const msg =
      //     err?.response?.data?.message ||
      //     err?.message ||
      //     "Payment processing failed.";
      //   toast.error(msg);
      // });

      onClose();
      router.push(`/utility/${service_slug}/qr`);

    } else {
      // ── Wallet Flow ───────────────────────────────────────────────────────
      try {
        const res = await payBillV2({
          payment_method: "wallet",
          upi_order_id: null,
          billerId,
          customerParms,
           service: service || service_slug,  
          service_slug,
          amount: Number(amount),
          amountTags,
          fetchRefId,
        });

        // ✅ Response sessionStorage mein save karo — amount aur payment_method sakat
        sessionStorage.setItem(
          "bbps_payment_response",
          JSON.stringify({
            ...(res || {}),
            amount,
            payment_method: "wallet",
          }),
        );

        onClose();
        router.push(`/utility/${service_slug}/success`);

      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Wallet payment failed. Please try again.";
        toast.error(msg);
      }
    }
  };

  const methods = [
    {
      id: "wallet",
      icon: (
        <AccountBalanceWalletOutlinedIcon
          sx={{ fontSize: 22, color: "#4b5563" }}
        />
      ),
      title: "Pay via Wallet",
      subtitle: "Pay instantly using your Dealplex wallet.",
      balance: userData?.wallet_balance,
    },
    {
      id: "upi",
      icon: <PhoneIphoneOutlinedIcon sx={{ fontSize: 22, color: "#4b5563" }} />,
      title: "Pay using UPI",
      subtitle: "Use any UPI app like GPay, PhonePe, Paytm",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={!isLoading ? onClose : undefined}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px !important",
          p: 0.5,
          maxWidth: { xs: "95vw", sm: 400 },
          width: "100%",
          mx: "auto",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            pt: 2.5,
            pb: 1.5,
          }}
        >
          <Typography fontWeight={700} fontSize={17}>
            Choose Payment Method
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            disabled={isLoading}
            sx={{ color: "#9ca3af" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mx: 2.5 }} />

        {/* Options */}
        <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
          {methods.map((method, idx) => (
            <Box key={method.id}>
              <Box
                onClick={() => !isLoading && setSelectedMethod(method.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.5,
                  py: 1.5,
                  borderRadius: "12px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                  "&:hover": {
                    background: isLoading ? "transparent" : "#f9fafb",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {method.icon}
                  </Box>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography fontSize={14} fontWeight={500} color="#111">
                        {method.title}
                      </Typography>
                      {method.balance && method.id === "wallet" && (
                        <Typography
                          fontSize={13}
                          fontWeight={600}
                          color="#1A914B"
                        >
                          (₹{method.balance})
                        </Typography>
                      )}
                    </Box>
                    <Typography fontSize={12} color="#6b7280" sx={{ mt: 0.2 }}>
                      {method.subtitle}
                    </Typography>
                  </Box>
                </Box>

                {selectedMethod === method.id ? (
                  <CheckCircleIcon sx={{ color: "#1A914B", fontSize: 24 }} />
                ) : (
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "1.5px solid #d1d5db",
                      flexShrink: 0,
                    }}
                  />
                )}
              </Box>

              {idx < methods.length - 1 && (
                <Divider sx={{ mx: 1.5, my: 0.5 }} />
              )}
            </Box>
          ))}
        </Box>

        {/* Make Payment Button */}
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Button
            fullWidth
            onClick={handleMakePayment}
            disabled={isLoading}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              py: 1.4,
              fontSize: 14,
              background: "#1A914B",
              color: "#fff",
              "&:hover": { background: "#157a3d" },
              "&.Mui-disabled": { background: "#9ca3af", color: "#fff" },
            }}
          >
            {isLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} sx={{ color: "#fff" }} />
                <Typography fontSize={14} color="#fff">
                  {registeringIntent ? "Creating QR..." : "Processing..."}
                </Typography>
              </Box>
            ) : (
              "Make Payment"
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodModal;