import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "../../src/components/layout/MainLayout";
import SEO from "../../src/components/seo";
import { getImageUrl } from "utils/CustomFunctions";
import {
  Box,
  Typography,
  Grid,
  Container,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Divider,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SecurityIcon from "@mui/icons-material/Security";
import HelpIcon from "@mui/icons-material/Help";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TopNavbar from "../../src/components/footernavbar/TopNavbar";
import Head from "next/head";

// Mock FAQ data - replace with actual API data
const MOCK_FAQS = {
  orders: [
    {
      id: 1,
      question: "How do I check my order status?",
      answer:
        "You can track your current order status in the 'Orders' section of the app or website. You'll see the estimated delivery time and the current stage of your order.",
    },
    {
      id: 2,
      question: "Can I cancel my order?",
      answer:
        "Orders can be cancelled within 30 seconds of placing them. After that, if the restaurant has already accepted your order, you won't be able to cancel. For exceptional circumstances, please contact our customer support.",
    },
    {
      id: 3,
      question: "I received the wrong items in my order. What should I do?",
      answer:
        "We're sorry about that! Please go to your order history, select the specific order, and tap on 'Report an Issue'. You can then select 'Wrong items received' and submit details about the problem.",
    },
  ],
  delivery: [
    {
      id: 4,
      question: "Why is my delivery delayed?",
      answer:
        "Delivery times can be affected by various factors like high demand, weather conditions, or traffic. If your order is significantly delayed, you can track your delivery person's location in real-time through the app or contact customer support.",
    },
    {
      id: 5,
      question: "How is the delivery fee calculated?",
      answer:
        "Delivery fees are calculated based on factors like distance from the restaurant, time of day, weather conditions, and availability of delivery partners. The exact delivery fee is always shown before you confirm your order.",
    },
  ],
  account: [
    {
      id: 6,
      question: "How do I edit my account information?",
      answer:
        "You can update your profile information, including name, phone number, and email, by going to the 'Profile' section in the app or website. Tap on 'Edit Profile' to make changes.",
    },
    {
      id: 7,
      question: "How do I add or remove a delivery address?",
      answer:
        "To manage your delivery addresses, go to the 'Addresses' section in your profile. You can add new addresses by tapping 'Add New Address' or remove existing ones by selecting an address and tapping the delete icon.",
    },
  ],
  payment: [
    {
      id: 8,
      question: "What payment methods are accepted?",
      answer:
        "We accept various payment methods including credit/debit cards, digital wallets, UPI, net banking, and cash on delivery. Available payment options may vary by location.",
    },
    {
      id: 9,
      question: "I was charged but my order failed. What should I do?",
      answer:
        "Don't worry! If your payment was charged but the order wasn't placed, the amount will be refunded to your original payment method within 5-7 business days. You can also check the 'Help' section for more information on refunds.",
    },
  ],
};

// Support categories
const SUPPORT_CATEGORIES = [
  {
    id: "orders",
    title: "Orders",
    description: "Track, cancel, or report issues with your orders",
    icon: <RestaurantIcon fontSize="large" />,
    color: "#1A914B",
  },
  {
    id: "delivery",
    title: "Delivery",
    description: "Delivery timing, fees, and related issues",
    icon: <DeliveryDiningIcon fontSize="large" />,
    color: "#1A914B",
  },
  {
    id: "account",
    title: "Account",
    description: "Profile settings, addresses, and account security",
    icon: <AccountCircleIcon fontSize="large" />,
    color: "#1A914B",
  },
  {
    id: "payment",
    title: "Payment",
    description: "Payment methods, refunds, and billing issues",
    icon: <PaymentIcon fontSize="large" />,
    color: "#1A914B",
  },
  {
    id: "offers",
    title: "Offers & Promos",
    description: "Coupons, referrals, and loyalty programs",
    icon: <LocalOfferIcon fontSize="large" />,
    color: "#1A914B",
  },
  {
    id: "safety",
    title: "Safety & Security",
    description: "Privacy, food safety, and secure ordering",
    icon: <SecurityIcon fontSize="large" />,
    color: "#1A914B",
  },
];

// Popular topics
const POPULAR_TOPICS = [
  "Refund Status",
  "Wrong Order",
  "Late Delivery",
  "Payment Failed",
  "Missing Items",
  "Account Verification",
];

// Support Header Component
const SupportHeader = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // console.log("Searching for:", searchQuery);
    // Implement actual search functionality here
  };

  return (
    <>
      {/* <TopNavbar configData={configData} /> */}
      <Box
        sx={{
          pt: 6,
          pb: 8,
          textAlign: "center",
          bgcolor: "#f5f5f5",
          borderRadius: { md: 2 },
          mt:2,
          mb: 6,
        }}
      >
        <Container>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: "bold",
              mb: 2,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            {t("How can we help you?")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: "700px",
              mx: "auto",
              mb: 4,
              px: 2,
              fontWeight: "normal",
            }}
          >
            {t("Search our help center for quick answers to common questions")}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              maxWidth: "650px",
              mx: "auto",
              px: 2,
            }}
          >
            <TextField
              fullWidth
              placeholder={t(
                "Search for help with orders, delivery, account...",
              )}
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: "white",
                  borderRadius: 1,
                  py: 0.5,
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.15)",
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1.5 }}
            >
              {t("Popular topics")}:
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
              sx={{ px: 2 }}
            >
              {POPULAR_TOPICS.map((topic, index) => (
                <Chip
                  key={index}
                  label={t(topic)}
                  clickable
                  sx={{
                    mb: 1,
                    bgcolor: "white",
                    "&:hover": { bgcolor: "#f0f0f0" },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
      {/* <Footermiddle configData={configData} /> */}
    </>
  );
};

// Category Card Component
const CategoryCard = ({ category, onClick }) => {
  const { t } = useTranslation();

  return (
    <Card
      onClick={() => onClick(category.id)}
      sx={{
        height: "100%",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              color: category.color,
              mb: 2,
            }}
          >
            {category.icon}
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            {t(category.title)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t(category.description)}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#1A914B",
              fontWeight: "medium",
              mt: "auto",
            }}
          >
            <Typography variant="body2" sx={{ mr: 0.5 }}>
              {t("Learn more")}
            </Typography>
            <ArrowForwardIcon fontSize="small" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// FAQ Accordion Component
const FAQAccordion = ({ faq }) => {
  const { t } = useTranslation();

  return (
    <Accordion
      sx={{
        boxShadow: "none",
        "&:before": {
          display: "none",
        },
        border: "1px solid",
        borderColor: "divider",
        mb: 1,
        borderRadius: "4px !important",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`faq-${faq.id}-content`}
        id={`faq-${faq.id}-header`}
        sx={{
          "&.Mui-expanded": {
            minHeight: 48,
          },
        }}
      >
        <Typography fontWeight="medium">{t(faq.question)}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography color="text.secondary">{t(faq.answer)}</Typography>
      </AccordionDetails>
    </Accordion>
  );
};

// Contact Support Card Component
const ContactSupportCard = ({ onContactSupport }) => {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "#f9f9f9",
        border: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <HelpIcon
          sx={{
            fontSize: 40,
            color: "#1A914B",
          }}
        />
      </Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        {t("Still need help?")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t(
          "Can't find what you're looking for? Our customer support team is here to help.",
        )}
      </Typography>
      <Button
        variant="contained"
        onClick={onContactSupport}
        sx={{
          bgcolor: "#1A914B",
          color: "white",
          "&:hover": {
            bgcolor: "#2a8b52",
          },
          px: 3,
        }}
      >
        {t("Contact Support")}
      </Button>
    </Paper>
  );
};

const SupportPage = ({ configData, landingPageData }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(null);
  const [displayedFaqs, setDisplayedFaqs] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Set initially displayed FAQs
  useEffect(() => {
    // Show a mix of FAQs from different categories initially
    const initialFaqs = [
      ...MOCK_FAQS.orders.slice(0, 1),
      ...MOCK_FAQS.delivery.slice(0, 1),
      ...MOCK_FAQS.account.slice(0, 1),
      ...MOCK_FAQS.payment.slice(0, 1),
    ];

    setDisplayedFaqs(initialFaqs);
  }, []);

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);

    // Update displayed FAQs based on selected category
    if (MOCK_FAQS[categoryId]) {
      setDisplayedFaqs(MOCK_FAQS[categoryId]);
    } else {
      // If no FAQs for this category, show a default set
      setDisplayedFaqs([
        ...MOCK_FAQS.orders.slice(0, 1),
        ...MOCK_FAQS.delivery.slice(0, 1),
      ]);
    }
  };

  return (
    <>
      <CssBaseline />
      <SEO
        title="Contact Dealplex | Customer Support & Help Center"
        description="Need help? Contact Dealplex support for order tracking, refunds, complaints & franchise queries. Reach us via WhatsApp, email or our help center."
        keywords="dealplex contact, dealplex customer support, dealplex help center, order support, track my order, refund request, complaint dealplex, franchise query, vendor support, delivery issue, dealplex helpline, customer care india, online support india, dealplex email, dealplex whatsapp, support center india, help desk dealplex, dealplex FAQ, order problem solution, contact us dealplex"
        image={`${getImageUrl(
          { value: configData?.logo_storage },
          "business_logo_url",
          configData,
        )}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
      />

      <Container maxWidth="lg">
        <SupportHeader />

        {/* Categories Section */}
        <Typography
          variant="h5"
          component="h2"
          fontWeight="bold"
          sx={{ mb: 3 }}
        >
          {t("Browse by category")}
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {SUPPORT_CATEGORIES.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <CategoryCard category={category} onClick={handleCategoryClick} />
            </Grid>
          ))}
        </Grid>

        {/* FAQs Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h5"
            component="h2"
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            {activeCategory
              ? t(
                  `Frequently Asked Questions: ${
                    SUPPORT_CATEGORIES.find((c) => c.id === activeCategory)
                      ?.title
                  }`,
                )
              : t("Frequently Asked Questions")}
          </Typography>

          {activeCategory && (
            <Button
              variant="text"
              color="primary"
              onClick={() => setActiveCategory(null)}
              sx={{ mb: 3 }}
            >
              {t("Back to all topics")}
            </Button>
          )}

          <Box sx={{ mt: 3 }}>
            {displayedFaqs.length > 0 ? (
              displayedFaqs.map((faq) => (
                <FAQAccordion key={faq.id} faq={faq} />
              ))
            ) : (
              <Typography
                color="text.secondary"
                sx={{ py: 4, textAlign: "center" }}
              >
                {t("No FAQs available for this category yet.")}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Contact Support Section */}
        <Grid container spacing={3} justifyContent="center" sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <ContactSupportCard
              onContactSupport={() => router.push("/contactus")}
            />
          </Grid>
        </Grid>

        {/* Additional Resources Section */}
      </Container>
    </>
  );
};

export default SupportPage;
