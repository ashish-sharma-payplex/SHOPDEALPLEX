import React, { useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const faqs = [
  {
    question: "How long does it take to resolve a ticket?",
    answer: "Most issues are resolved within 24–48 hours. Complex cases may take up to 5 business days. You'll receive updates via SMS and email.",
  },
  {
    question: "Money was deducted, but recharge failed. What should I do?",
    answer: "Please wait 30 minutes — the amount may auto-credit. If not resolved, raise a ticket with your transaction ID, amount, and date of payment.",
  },
  {
    question: "Can I get a refund for a failed transaction?",
    answer: "Yes. If your payment was deducted but the recharge didn't go through, a refund will be initiated within 5–7 business days to your original payment method.",
  },
  {
    question: "How can I track my ticket status?",
    answer: 'Go to the "Track My Tickets" section. Enter your ticket ID or registered mobile number to see real-time status updates.',
  },
  {
    question: "I recharged the wrong mobile number. What can I do?",
    answer: "Unfortunately, recharges to incorrect numbers cannot be reversed once processed. Raise a ticket and we'll try to assist further.",
  },
  {
    question: "How can I update my account email?",
    answer: 'Go to Account Settings → "Edit Profile". Update your email and verify via OTP. Changes reflect immediately.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Box sx={{ width: "100%", py: 1 }}>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <Box key={index}>
            <Divider />
            <Box
              onClick={() => handleToggle(index)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: "18px",
                gap: 2,
                cursor: "pointer",
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#1a1a1a",
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {faq.question}
              </Typography>

              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "1px solid #e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  bgcolor: isOpen ? "#f5f5f5" : "transparent",
                  transition: "background 0.2s",
                }}
              >
                {isOpen
                  ? <CloseIcon sx={{ fontSize: 13, color: "#555" }} />
                  : <AddIcon sx={{ fontSize: 13, color: "#555" }} />
                }
              </Box>
            </Box>

            {/* Answer with smooth height transition */}
            <Box
              sx={{
                maxHeight: isOpen ? "200px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "#6b7280",
                  lineHeight: 1.7,
                  pb: "18px",
                }}
              >
                {faq.answer}
              </Typography>
            </Box>
          </Box>
        );
      })}
      <Divider />
    </Box>
  );
};

export default FAQSection;