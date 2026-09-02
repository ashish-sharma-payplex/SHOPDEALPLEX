import { useTranslation } from "react-i18next";
import useGetPolicyPage from "../../src/api-manage/hooks/react-query/useGetPolicyPage";
import React, { useState, useEffect, useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "../../src/components/layout/MainLayout";
import SEO from "../../src/components/seo";
import { getImageUrl } from "utils/CustomFunctions";
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Paper,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// FAQ categories component
const FAQCategories = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2}>
        {categories.map((category) => (
          <Grid item key={category.id}>
            <Box
              onClick={() => setActiveCategory(category.id)}
              sx={{
                py: 1,
                px: 2,
                borderRadius: "20px",
                cursor: "pointer",
                backgroundColor: activeCategory === category.id ? "#1A914B" : "#fff",
                color: activeCategory === category.id ? "#fff" : "#333",
                fontWeight: 500,
                border: "1px solid #e0e0e0",
                "&:hover": {
                  backgroundColor: activeCategory === category.id ? "#1A914B" : "#f0f0f0",
                },
              }}
            >
              {category.name}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

// FAQ Accordion component
const FAQAccordion = ({ faqs }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      {faqs.map((faq, index) => (
        <Accordion
          key={index}
          expanded={expanded === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          sx={{
            mb: 2,
            boxShadow: "none",
            border: "1px solid #e0e0e0",
            borderRadius: "8px !important",
            "&:before": { display: "none" },
            "& .MuiAccordionSummary-root": { borderRadius: "8px" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#1A914B" }} />}
            sx={{
              backgroundColor: "#f8f8f8",
              borderRadius: expanded === `panel${index}` ? "8px 8px 0 0" : "8px",
            }}
          >
            <Typography fontWeight={500}>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, pb: 3 }}>
            <Typography
              dangerouslySetInnerHTML={{ __html: faq.answer }}
              sx={{ color: "#666" }}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

// ✅ Main Faq component
const Faq = ({ configData, landingPageData }) => {
  const { t } = useTranslation();

  // ✅ Memoized to stop useEffect warning
  const dummyFaqs = useMemo(() => [
    {
      question: "What is Shopdealplex.in?",
      answer: "shopdealplex is your one-stop online marketplace for all your daily needs.",
      category: "all",
    },


    // Grocery
    
    {
      question: "What is the typical Parcel time for grocery orders?",
      answer: "Dealplex aims for Parcel within 10–30 minutes for nearby dark stores, depending on your location, order size, and item availability. Exact estimated Parcel time is displayed before you place the order.",
      category: "Grocery",
    },

        {
      question: "Is there a Parcel fee on grocery orders? ",
      answer: "A small Parcel or handling fee may apply based on order value and distance. The exact fee is always shown at checkout before you confirm Food. Many stores offer free Parcel above a minimum cart value.",
      category: "Grocery",
    },

        {
      question: " Can I schedule a grocery Parcel for later instead of instant Parcel?",
      answer: "Yes, where available, you can choose a scheduled Parcel slot instead of instant Parcel whichis useful for planned weekly or bulk grocery orders. ",
      category: "Grocery",
    },


        {
      question: "What happens if an item I ordered is out of stock? ",
      answer: " If an item becomes unavailable after you order, you will be notified in the app, and the amount for that item will be refunded or adjusted automatically.",
      category: "Grocery",
    },


        {
      question: " Can I edit or add items to my order after placing it?",
      answer: "Once an order is placed and accepted for packing, it usually cannot be edited. You would need to cancel (if eligible) and place a new order, or place a fresh order separately. ",
      category: "Grocery",
    },


                {
      question: " How do I cancel a grocery order?",
      answer: " You can cancel from the Orders section as long as the order has not been packed or dispatched. Once it is out for Parcel, cancellation may not be possible. ",
      category: "Grocery",
    },

            {
      question: " What is the return or refund policy for grocery items?",
      answer: " Damaged, expired, or incorrect items can be reported within a short window after Parcel through the app, and you will be offered a replacement or refund after verification.",
      category: "Grocery",
    },



            {
      question: " Do I get a bill or invoice for my grocery order?",
      answer: " Yes, a digital invoice is generated automatically for every order and is accessible from your order history in the app.",
      category: "Grocery",
    },

            {
      question: " Can I order fruits, vegetables, and perishables along with packaged groceries?",
      answer: " Yes, depending on store availability, you can order fresh produce, dairy, and packaged goods together in a single cart.",
      category: "Grocery",
    },


            {
      question: " Is there a minimum cart value for free delivery? ",
      answer: "Many stores offer free or reduced delivery charges above a certain cart value, which is displayed on the cart page before checkout.",
      category: "Grocery",
    },


            {
      question: " How do I know if Dealplex grocery delivery is available in my area?",
      answer: "  Enter or allow access to your delivery address in the app; available stores and estimated delivery times for your exact location will be shown automatically.",
      category: "Grocery",
    },


            {
      question: " Can I reorder my previous grocery list easily?",
      answer: " Yes, your past orders are saved in order history, and you can reorder the same items in one tap without searching again.",
      category: "Grocery",
    },


            {
      question: " What if my delivery partner cannot find my address?",
      answer: " The delivery partner will attempt to contact you via the in-app call or chat feature; keeping your address details and a reachable phone number updated helps avoid delays.",
      category: "Grocery",
    },


            {
      question: " Are prices on Dealplex the same as in physical stores?",
      answer: " Prices may vary slightly from in-store pricing due to platform discounts, delivery costs, or partner-store pricing, and are always shown clearly before you pay.",
      category: "Grocery",
    },



// account

    // {
    //   question: "How can I reset my password?",
    //   answer: "Go to the account settings and click on 'Reset Password' to receive a password reset link.",
    //   category: "account",
    // },


// Food

    {
      question: "How do I track my food order in real time?",
      answer: "Once a restaurant accepts your order, you can track each stage like preparing, picked up, and out for delivery, live on the map within the Orders section.",
      category: "Food",
    },


        {
      question: "What if my food order arrives late?",
      answer: " Estimated delivery times are shown at checkout based on live traffic and restaurant load; if there is a significant delay, you can check live status in-app or contact support.",
      category: "Food",
    },


        {
      question: "Can I cancel a food order after placing it?",
      answer: "You can attempt to cancel before the restaurant starts preparing your order. Once preparation begins, cancellation may not be possible or may be subject to a partial charge.",
      category: "Food",
    },


        {
      question: "What happens if my food order is missing items or wrong?",
      answer: "Report the issue through the Help section within the order details, and after verification you will be offered a refund or credit for the missing or incorrect items.",
      category: "Food",
    },


        {
      question: "Can I add special cooking instructions to my order?",
      answer: "Yes, most items allow you to add notes such as 'less spicy' or 'no onions' during checkout, which are sent directly to the restaurant.",
      category: "Food",
    },


        {
      question: "Can I tip my delivery partner through the app?",
      answer: "Yes, an optional tip can usually be added either at checkout or after delivery is completed, going entirely to the delivery partner.",
      category: "Food",
    },


        {
      question: "Is there a way to see restaurant ratings and reviews before ordering?",
      answer: "Yes, every restaurant listing shows a rating along with customer reviews to help you decide before placing an order.",
      category: "Food",
    },


        {
      question: "What if the food delivered is of poor quality or not fresh?",
      answer: "You can raise a complaint with photos through the Help section, and our team reviews it with the restaurant partner for a refund or resolution.",
      category: "Food",
    },



        {
      question: "Can I order from multiple restaurants in a single delivery?",
      answer: " Typically, each order is placed with a single restaurant to ensure food quality and timely delivery; ordering from multiple restaurants requires separate orders.",
      category: "Food",
    },


        {
      question: "Are there packaging charges on food orders?",
      answer: "Some restaurants apply a small packaging charge, which is itemised and shown clearly in your bill before payment.",
      category: "Food",
    },


        {
      question: "Can I pre-book a food order for a later time?",
      answer: "Where supported by the restaurant, you can schedule an order in advance for a specific delivery time, useful for office lunches or planned events.",
      category: "Food",
    },


        {
      question: "What payment options are available for food orders?",
      answer: "You can pay via UPI, debit/credit card, net banking, wallet balance, or cash on delivery where available.",
      category: "Food",
    },


// Parcel

    {
      question: " What types of parcels or goods can I send through Dealplex?",
      answer: " You can send documents, small packages, and household or business goods, subject to size, weight, and item restrictions shown in the app.",
      category: "Parcel",
    },


        {
      question: " How is the delivery charge for a parcel calculated?",
      answer: " Charges are based on distance, parcel weight or size, and vehicle type selected (two-wheeler, mini-truck, etc.), shown upfront before booking.",
      category: "Parcel",
    },


        {
      question: "Can I track my parcel in real time? ",
      answer: " Yes, once a delivery partner is assigned, you can track the parcel's live location on the map until it reaches the destination.",
      category: "Parcel",
    },



        {
      question: "What items are restricted or not allowed for delivery? ",
      answer: "Illegal items, hazardous materials, and certain restricted goods cannot be shipped; a list of prohibited items is available within the booking flow. ",
      category: "Parcel",
    },


        {
      question: "What happens if my parcel is damaged or lost during delivery? ",
      answer: " You can file a claim through the app's support section with order details; eligible cases are investigated and compensated as per policy.",
      category: "Parcel",
    },


        {
      question: "Can I book a vehicle for bulky goods like furniture or appliances? ",
      answer: "Yes, larger vehicle options such as mini-trucks are available for bulky or heavy goods, selectable at the time of booking. ",
      category: "Parcel",
    },


        {
      question: "Is there same-day delivery for parcels? ",
      answer: " Yes, most parcel bookings on Dealplex are designed for same-day, on-demand delivery within the city.",
      category: "Parcel",
    },


        {
      question: "How do I get a delivery confirmation or proof of delivery? ",
      answer: " A delivery confirmation, often including an OTP entry or photo, is logged in the app and accessible from your order history.",
      category: "Parcel",
    },


        {
      question: "Can businesses use Dealplex for regular parcel or goods delivery needs? ",
      answer: "Yes, businesses can use the platform for recurring delivery needs; for high-volume or contractual logistics, our B2B partnership team can be contacted at sales@dealplex.in. ",
      category: "Parcel",
    },

// Travels

    {
      question: "What types of travel can I book through Dealplex? ",
      answer: "  You can book trains, flights, hotels, bus tickets, and train tickets, all from within the Travel section of the app. ",
      category: "Travels",
    },

        {
      question: "How do I cancel or reschedule a flight or hotel booking? ",
      answer: "Cancellations and reschedules can be initiated from the Bookings section; refund or rebooking eligibility depends on the railways, airline or hotel's individual cancellation policy. ",
      category: "Travels",
    },

        {
      question: "Will I get a full refund if I cancel my travel booking? ",
      answer: " Refund amounts depend on how far in advance you cancel and the fare or rate type selected; non-refundable bookings may not be eligible for a refund.",
      category: "Travels",
    },

        {
      question: " How do I know if my flight or hotel booking is confirmed?",
      answer: " A confirmation with your booking ID, PNR (for railways, flights), or hotel voucher is sent to your registered email and shown in the app immediately after successful payment.",
      category: "Travels",
    },

        {
      question: "Can I book travel for someone else using my account? ",
      answer: " Yes, you can enter different traveller details during booking; the ticket or voucher will be issued in the name of the actual traveller.",
      category: "Travels",
    },


        {
      question: " Are hotel prices on Dealplex inclusive of taxes?",
      answer: "Final prices shown at checkout are generally inclusive of applicable taxes, though some properties may charge additional fees directly at check-in, which is mentioned in the listing. ",
      category: "Travels",
    },


        {
      question: " Can I add travel insurance while booking trains, flights or buses?",
      answer: "Where available, optional travel insurance can be added during checkout for additional protection against cancellations or emergencies. ",
      category: "Travels",
    },


        {
      question: "What documents do I need to carry for train or domestic flight travel? ",
      answer: "A valid government-issued photo ID is required at the airport along with your e-ticket or boarding pass for domestic travel.",
      category: "Travels",
    },


        {
      question: " Can I get a GST invoice for business travel bookings?",
      answer: "Yes, GST invoices for eligible bookings can usually be downloaded from your booking confirmation or requested through support for business travel needs. ",
      category: "Travels",
    },


        {
      question: " What if there is a schedule change or cancellation by the airline, buses or railways?",
      answer: "You will be notified of any railways, buses or airline-initiated changes, and the platform will assist with rebooking or refund as per the airline's policy. ",
      category: "Travels",
    },

    //Utility 


           {
      question: "What payment methods does Dealplex support?",
      answer: " Dealplex supports UPI, debit and credit cards, net banking, and Dealplex wallet balance, along with cash on delivery for eligible services. ",
      category: "Utility",
    },
  
  
    {
      question: " My payment failed but the amount was deducted. What do I do?",
      answer: " In most cases, the amount is automatically refunded to your original payment method within a few hours to a few business days; if not, raise a complaint through the app's payment support section. ",
      category: "Utility",
    },


        {
      question: " How long does a refund take to reflect in my account? ",
      answer: " Refunds to UPI or bank accounts typically take a few hours up to 5–7 business days depending on your bank, while refunds to Dealplex wallet are usually instant. ",
      category: "Utility",
    },


        {
      question: " What is the Dealplex wallet, and how do I use it?",
      answer: " The Dealplex wallet lets you store refunds, cashback, and added balance for faster checkout on future orders across all modules like groceries, food, travel, and more. ",
      category: "Utility",
    },


        {
      question: "   Is it safe to save my card details on Dealplex?",
      answer: "  Yes, saved card details are tokenised and stored securely as per RBI guidelines, meaning your actual card number is not stored directly on Dealplex servers.",
      category: "Utility",
    },


        {
      question: "Are there any hidden charges on payments made through Dealplex? ",
      answer: " No hidden charges are applied; any applicable convenience fee, delivery charge, or tax is itemized and shown clearly before you confirm payment. ",
      category: "Utility",
    },


        {
      question: " Can I pay using a combination of wallet balance and another payment method?",
      answer: "  Yes, where supported, you can apply your wallet balance first and pay the remaining amount via UPI, card, or net banking.",
      category: "Utility",
    },


        {
      question: " What should I do if I notice an unauthorized transaction on my account? ",
      answer: " Report it immediately through the app's help section and contact your bank to secure your account, as quick reporting helps with faster resolution. ",
      category: "Utility",
    },



        {
      question: "Is Dealplex compliant with RBI and UPI security guidelines? ",
      answer: " Yes, Dealplex follows applicable RBI and NPCI guidelines for digital payments, including secure authentication and data protection standards for all transactions.",
      category: "Utility",
    },



    // Rental

    {
      question: "What documents are required to rent a self-drive car? ",
      answer: " A valid driving licence and a government-issued ID proof are required, along with a refundable security deposit depending on the vehicle category.",
      category: "Rental",
    },


      {
      question: "Is fuel included in the rental price? ",
      answer: " Generally, fuel is not included. The vehicle is provided with a certain fuel level; you are expected to return it with the same level, or refuel charges may apply.",
      category: "Rental",
    },


          {
      question: " What is the minimum age to rent a self-drive vehicle?",
      answer: " Most rental categories require the renter to be at least 21 years old with a valid driving licence held for a minimum period, as specified in the rental terms.",
      category: "Rental",
    },


          {
      question: " What happens if the rented vehicle breaks down during my trip?",
      answer: " .  In case of a breakdown, you can contact in-app support for roadside assistance, a replacement vehicle, or further guidance.",
      category: "Rental",
    },


          {
      question: "Is the security deposit refundable? ",
      answer: " Yes, the security deposit is returned after the vehicle is checked in, provided there is no damage or policy violation.",
      category: "Rental",
    },


          {
      question: " Can I extend my rental period while the vehicle is still with me?",
      answer: "Yes, rental extensions can usually be requested through the app, subject to vehicle availability for the extended period. ",
      category: "Rental",
    },


          {
      question: " What if I return the vehicle late?",
      answer: " Late returns may attract additional hourly or daily charges as specified in the rental agreement shown at the time of booking.",
      category: "Rental",
    },

          {
      question: "Is insurance included with vehicle rentals? ",
      answer: " Basic insurance coverage is typically included, with details on what is covered shown during booking. Additional coverage options may be available.",
      category: "Rental",
    },


          {
      question: " What if I am unhappy with the cleanliness or condition of a rented vehicle?",
      answer: " Report condition issues immediately at pickup through the app with photos, which helps with deposit settlement and improves future vehicle quality checks.",
      category: "Rental",
    },

    //General


              {
      question: "How do I create a Dealplex account?  ",
      answer: " Download the Dealplex app, enter your mobile number, verify via OTP, and complete your profile. Your account gives you access to all eight service modules from a single login. ",
      category: "General",
    },


    {
      question: " How do I delete my Dealplex account? ",
      answer: "  From the profile section through the “Delete” option in the app. After requesting deletion, your account and associated data will be permanently removed and cannot be restored. ",
      category: "General",
    },


        {
      question: " How does Dealplex protect my personal data?  ",
      answer: "  Dealplex complies fully with the Digital Personal Data Protection Act, 2023 (DPDP Act). Your data is encrypted, never sold to third parties, and managed with industry-standard security protocols including TLS encryption and PCI-DSS compliant payment processing. ",
      category: "General",
    },



        {
      question: " Can I use Dealplex if I am under 18? ",
      answer: "  Dealplex services are intended for users 18 years of age and older unless permitted by applicable local laws. We do not knowingly collect personal information from minors. ",
      category: "General",
    },


        {
      question: " How do I report a fraud or suspicious activity on my Dealplex account? ",
      answer: "  Report it immediately through the Help section in the app, and contact your bank if a payment is involved. Dealplex will never ask for your OTP, UPI PIN, or CVV over any channel. Any such request is fraudulent. ",
      category: "General",
    },


        {
      question: " Which cities is Dealplex currently available in? ",
      answer: "   Dealplex is currently operational in Ranchi, Jharkhand and Pune, Maharashtra. We are expanding pan-India with new city launches planned throughout 2026 and 2027.",
      category: "General",
    },


        {
      question: " How can I be notified when Dealplex launches in my city? ",
      answer: "  Register your interest at shopdealplex.in and set in your location name. We will notify you as soon as Dealplex launches in your area. ",
      category: "General",
    },



        {
      question: " How do I contact Dealplex customer support? ",
      answer: " You can reach us through the in-app Help section, by email at support@dealplex.in. Our team is available Monday to Saturday, 10:00 AM to 7:00 PM IST.",
      category: "General",
    },

  ], []);

  const [activeCategory, setActiveCategory] = useState(null);
  const [filteredFaqs, setFilteredFaqs] = useState([]);

  const faqCategories = [
    { id: "all", name: t("All FAQs") },
    { id: "Grocery", name: t("Grocery") },
    // { id: "account", name: t("Account") },
    { id: "Food", name: t("Food") },
    { id: "Parcel", name: t("Parcel") },
    { id: "Travels", name: t("Travels ") },
    
    { id: "Utility", name: t("Utility")},
    { id: "Rental", name: t("Rental") },
    { id: "General", name: t("General") },
  ];

  useEffect(() => {
    if (!activeCategory) {
      setActiveCategory("all");
    }
  }, [activeCategory]);

  useEffect(() => {
    if (!activeCategory || activeCategory === "all") {
      setFilteredFaqs(dummyFaqs);
    } else {
      setFilteredFaqs(dummyFaqs.filter((faq) => faq.category === activeCategory));
    }
  }, [activeCategory, dummyFaqs]); // ✅ now warning-free

  return (
    <>
      <CssBaseline />
      <SEO
        title={`${t("Frequently Asked Questions")} - ${configData?.business_name}`}
        image={`${getImageUrl(
          { value: configData?.logo_storage },
          "business_logo_url",
          configData
        )}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
      />
      <Box sx={{ py: 5 }}>
        <Container maxWidth="lg">
          <Box mb={4}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {t("Frequently Asked Questions")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("Find answers to common questions about our services")}
            </Typography>
          </Box>

          <FAQCategories
            categories={faqCategories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />

          <Box>
            <FAQAccordion faqs={filteredFaqs || []} />
          </Box>

          <Box
            mt={6}
            p={4}
            border="1px solid #e0e0e0"
            borderRadius="8px"
            bgcolor="#fff"
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              {t("Still have questions?")}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {t("If you cannot find answer to your question in our FAQ, you can always contact us. We will answer to you shortly!")}
            </Typography>
            <Box
              component="a"
              href="/contact-us"
              sx={{
                display: "inline-block",
                px: 3,
                py: 1,
                backgroundColor: "#1A914B",
                color: "#fff",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#1A914B",
                },
              }}
            >
              {t("Contact Us")}
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Faq;
