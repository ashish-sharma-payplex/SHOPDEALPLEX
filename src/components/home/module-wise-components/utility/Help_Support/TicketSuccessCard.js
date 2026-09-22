import React from "react";
import { Box, Typography, Divider, Button, Paper } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function TicketSuccessCard({ ticketData, onViewTickets }) {
  const rows = [
    {
      label: "Ticket ID",
      value: ticketData?.ticketId ? `#${ticketData.ticketId}` : "—",
    },
    {
      label: "Status",
      value: ticketData?.status || "Pending Review",
      isBadge: true,
    },
    {
      label: "Service",
      value: ticketData?.service || "—",
    },
    {
      label: "Issue",
      value: ticketData?.issue || "—",
    },
    {
      label: "Transaction ID",
      value: ticketData?.transactionId || "—",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 400,
          borderRadius: "16px",
          border: "1px solid var(--ut-border-eaecf0)",
          p: { xs: "24px 20px", sm: "32px 28px" },
          textAlign: "center",
        }}
      >
        {/* Green check icon */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "var(--ut-bg-e8f5e9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <CheckCircleOutlineIcon
            sx={{ fontSize: 34, color: "var(--ut-text-2e7d32)" }}
          />
        </Box>

        {/* Title */}
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            color: "var(--ut-text-101828)",
            mb: 0.75,
          }}
        >
          Ticket Raised Successfully
        </Typography>

        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            color: "var(--ut-text-667085)",
            lineHeight: 1.6,
            mb: 2.5,
          }}
        >
          We've received your request and are looking into it.
        </Typography>

        {/* Rows */}
        <Divider sx={{ borderColor: "var(--ut-border-eaecf0)" }} />

        {rows.map((row, i) => (
          <Box key={i}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: "12px",
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  color: "var(--ut-text-667085)",
                  flexShrink: 0,
                }}
              >
                {row.label}
              </Typography>

              {row.isBadge ? (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    bgcolor: "var(--ut-bg-fff8e1)",
                    px: "10px",
                    py: "3px",
                    borderRadius: "20px",
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "#F59E0B",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--ut-text-854f0b)",
                    }}
                  >
                    {row.value}
                  </Typography>
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--ut-text-101828)",
                    textAlign: "right",
                    wordBreak: "break-all",
                  }}
                >
                  {row.value}
                </Typography>
              )}
            </Box>
            {i < rows.length - 1 && (
              <Divider sx={{ borderColor: "var(--ut-border-eaecf0)" }} />
            )}
          </Box>
        ))}

        {/* View Tickets Button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={onViewTickets}
          sx={{
            mt: 2.5,
            borderColor: "var(--ut-border-e5e7eb)",
            color: "var(--ut-text-101828)",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            textTransform: "none",
            borderRadius: "8px",
            py: 1.2,
            "&:hover": {
              borderColor: "var(--ut-border-9ca3af)",
              bgcolor: "var(--ut-bg-f9fafb)",
            },
          }}
        >
          View Tickets
        </Button>
      </Paper>
    </Box>
  );
}
