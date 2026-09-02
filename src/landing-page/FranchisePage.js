import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import Image from "next/image"; // ✅ Corrected import
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SchoolIcon from "@mui/icons-material/School";
import LaunchIcon from "@mui/icons-material/Launch";
import BGI from "./assets/bb.png";

const montserratFont = "'Montserrat', sans-serif";

const steps = [
  { label: "Submit Application", icon: <HowToRegIcon /> },
  { label: "Introductory Meeting", icon: <MeetingRoomIcon /> },
  { label: "Training & Setup", icon: <SchoolIcon /> },
  { label: "Launch Franchise", icon: <LaunchIcon /> },
];

const FranchisePage = () => {
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const faqData = [
    {
      question: "What is the investment required to start a franchise?",
      answer: "The investment varies depending on the location and size of the franchise. Please contact us for detailed information.",
    },
    {
      question: "What kind of support do you provide to franchisees?",
      answer: "We provide comprehensive training, marketing support, and operational assistance to ensure your success.",
    },
    {
      question: "How long does it take to start a franchise?",
      answer: "Typically, it takes 3-6 months from signing the agreement to opening your franchise.",
    },
  ];

  return (
    <Container maxWidth="100%" sx={{ py: 2 }}>
      <Box
        sx={{
          mb: 6,
          height: 300,
          width: "100%",
          borderRadius: 2,
          background: "linear-gradient(135deg,rgb(255, 115, 0) 0%,rgba(255, 145, 0, 0.96) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Image
          src={BGI.src}
          alt="Franchise Banner"
          width={1000} // You can fine-tune dimensions based on layout
          height={300}
          style={{
            objectFit: "cover",
            borderRadius: 8,
            position: "absolute",
            top: 0,
            marginLeft: "20%",
          }}
        />
      </Box>

      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Why Partner With Us?
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {["🚀", "🤝", "💼"].map((icon, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ boxShadow: 3, textAlign: "center", p: 2, fontFamily: montserratFont }}>
                <CardContent>
                  <Typography variant="h2" color="primary" gutterBottom sx={{ fontFamily: montserratFont }}>
                    {icon}
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ fontFamily: montserratFont }}>
                    {i === 0 ? "Fast Growth" : i === 1 ? "Strong Support" : "Proven Model"}
                  </Typography>
                  <Typography sx={{ fontFamily: montserratFont }}>
                    {i === 0
                      ? "Leverage our brand and technology to grow your business quickly."
                      : i === 1
                      ? "Receive comprehensive training and ongoing support."
                      : "Benefit from our successful business model and operational expertise."}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontFamily: montserratFont }}>
          How It Works
        </Typography>
        <Stepper alternativeLabel>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel icon={step.icon} sx={{ fontFamily: montserratFont }}>
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box
        sx={{
          bgcolor: "rgb(252, 185, 41)",
          color: "primary.contrastText",
          p: 2,
          borderRadius: 2,
          textAlign: "center",
          mb: 6,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Become a Franchise Partner
        </Typography>
        <Typography variant="h6" gutterBottom>
          Join our growing network and build a successful business with us.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
        >
          Get Started
        </Button>
      </Box>

      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontFamily: montserratFont }}>
          Frequently Asked Questions
        </Typography>
        {faqData.map((item, index) => (
          <Accordion key={index} expanded={expanded === index} onChange={handleChange(index)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography sx={{ fontFamily: montserratFont }}>{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ fontFamily: montserratFont }}>{item.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontFamily: montserratFont }}>
          Contact Us
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            maxWidth: 1000,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            fontFamily: montserratFont,
          }}
        >
          <TextField label="Your Name" name="name" value={formData.name} onChange={handleInputChange} required />
          <TextField
            label="Your Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Your Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Your Message"
            name="message"
            multiline
            rows={4}
            value={formData.message}
            onChange={handleInputChange}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ fontFamily: montserratFont, backgroundColor: "#FF6600" }}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FranchisePage;
