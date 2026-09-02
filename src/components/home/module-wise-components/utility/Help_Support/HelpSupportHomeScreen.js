import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Divider,
  Stack,
} from "@mui/material";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import RaiseTicket from "./RaiseTicketContent";
import MyTickets from "./MyTickets"; // ✅ MyTickets import karo

const faqs = [
  {
    question: "How long does it takes to resolve a ticket ?",
    answer:
      "Most issues are resolved within 24–48 hours. In rare cases, it may take up to 5 business days depending on the complexity. You'll receive updates via SMS and email.",
  },
  {
    question: "Money was deducted, but recharge failed. What should I do?",
    answer:
      "If your money was deducted but the recharge failed, don't worry. The amount is usually refunded automatically within 24–48 hours. If not, you can raise a ticket for quick assistance.",
  },
  {
    question: "Can I get a refund for a failed transaction?",
    answer:
      "Yes, failed transactions are automatically refunded to your original payment method within 24–48 hours. If the refund is delayed, please raise a support ticket.",
  },
  {
    question: "How can I track my ticket status?",
    answer:
      "You can track your ticket status in the 'My Tickets' section under Help & Support. You'll also receive updates via SMS and email.",
  },
  {
    question: "I recharged the wrong mobile number. What can I do?",
    answer:
      "Recharges to incorrect numbers cannot be reversed once processed. We recommend verifying the number before confirming. For assistance, you may raise a ticket.",
  },
  {
    question: "How can I update my account email?",
    answer:
      "You can update your email address from the Profile section in your account settings. If you face any issues, please contact support.",
  },
];

// ─── FAQ Section ─────────────────────────────────────────────────────────────
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const isFirst = index === 0;

        return (
          <Box key={index}>
            {!isFirst && <Divider color="#EAECF0" />}

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
                  fontFamily: "'Inter', sans-serif",
                  fontSize: { xs: "0.88rem", sm: "0.95rem" },
                  fontWeight: 500,
                  color: "#101828",
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {faq.question}
              </Typography>

              <Box
                component="img"
                src={isOpen ? "/utility/CloseIcon.svg" : "/utility/AddIcon.svg"}
                alt={isOpen ? "close" : "add"}
                sx={{ width: 22, height: 22, flexShrink: 0 }}
              />
            </Box>

            <Box
              sx={{
                maxHeight: isOpen ? "300px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  color: "#667085",
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
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HelpSupportHomeScreen() {
  const [view, setView] = useState("home");


   useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  // ✅ Raise Ticket view
  if (view === "raise-ticket") {
    return <RaiseTicket onBack={() => setView("home")} />;
  }

  // ✅ My Tickets view — same pattern, onBack se home pe wapas
  if (view === "my-tickets") {
    return <MyTickets onBack={() => setView("home")} />;
  }

  return (
    <>
      {/* ── Hero Section ── */}
      <Box
        component="section"
        sx={{
          textAlign: "center",
          py: { xs: 0, md: 0 },
          px: 2,
        }}
      >
        <Container>
          <Typography
            variant="h1"
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: { xs: "2rem", sm: "2.6rem", md: "3rem" },
              lineHeight: 1.2,
              color: "#1a1a2e",
            }}
          >
            Need help with your
            <br />
            <Box component="span" sx={{ color: "#f59e0b" }}>
              payments?
            </Box>
          </Typography>

          <Typography
            sx={{
              mt: 2,
              color: "#4D525F",
              lineHeight: 1.7,
              fontFamily: "'Inter', sans-serif",
              fontSize: { xs: "0.9rem", md: "1rem" },
              maxWidth: 440,
              mx: "auto",
            }}
          >
            Experiencing a failed recharge or payment issue? Create a support
            ticket and track resolution in real-time.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 4 }}
          >
            {/* Raise a Ticket — existing */}
            <Button
              variant="contained"
              endIcon={<NorthEastIcon fontSize="small" />}
              onClick={() => setView("raise-ticket")}
              sx={{
                bgcolor: "#2e7d32",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "0.95rem",
                padding: "12px 28px",
                width: { xs: "100%", sm: "auto" },
                maxWidth: { xs: 280, sm: "none" },
                "&:hover": {
                  bgcolor: "#1b5e20",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 20px rgba(46,125,50,0.3)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Raise a Ticket
            </Button>

            {/* ✅ Track My Tickets — ab My Tickets screen pe jaayega */}
            <Button
              variant="outlined"
              onClick={() => setView("my-tickets")}
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "0.95rem",
                padding: "12px 28px",
                width: { xs: "100%", sm: "auto" },
                maxWidth: { xs: 280, sm: "none" },
                borderColor: "#e5e7eb",
                color: "#1a1a2e",
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Track My Tickets
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ── FAQ Section ── */}
      <Box
        component="section"
        sx={{
          py: { xs: 6, md: 8 },
          px: 2,
        }}
      >
        <Container>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: { xs: "1.4rem", md: "1.85rem" },
                color: "#101828",
                mb: 1,
              }}
            >
              Frequently asked questions
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif",
                color: "#667085",
                fontWeight: 400,
                fontSize: "0.95rem",
              }}
            >
              Get instant help with failed transactions, refunds, and more.
            </Typography>
          </Box>

          <FAQSection />
        </Container>
      </Box>
    </>
  );
}