import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  CssBaseline, Box, Typography, Grid, Container, TextField, Button,
  Paper, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert,
  useTheme, useMediaQuery
} from "@mui/material";
import emailjs from "emailjs-com";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SEO from "../../src/components/seo";
import { getImageUrl } from "utils/CustomFunctions";

// Reusable Info Card
const ContactInfoCard = ({ icon, title, content }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: '#FF6600', color: 'white', borderRadius: '50%', p: 1.5, mr: 2,
      minWidth: '48px', height: '48px'
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
      <Typography variant="body2" color="text.secondary">{content}</Typography>
    </Box>
  </Box>
);

// Header section
const ContactHeader = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{
      py: 6,
      textAlign: 'center',
      borderBottom: '1px solid',
      borderColor: 'divider',
      mb: 3,
      mt: 15,
      width: "1280px",
      whiteSpace: 'nowrap'  // Prevent line break for the heading text
    }}>
      <Typography variant="h2" component="h1" sx={{
        fontWeight: 'bold',
        mb: 2,
        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
        color: '#1A1A1A',
        whiteSpace: 'nowrap', // Prevent line break for heading text
      }}>
        Contact Us
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{
        maxWidth: '800px',
        mx: 'auto',
        px: 2,
        fontSize: { xs: '1rem', sm: '1.1rem' },
        color: '#606060',
        whiteSpace: 'nowrap',  // Prevent line break for the description text
      }}>
        Have a question, suggestion, or just want to say hello? Our team is ready to assist.
      </Typography>
    </Box>
  );
};

const Contact = ({ configData, landingPageData }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const formRef = useRef();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  });

  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t("Name is required");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("Name must be at least 2 characters long");
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = t("Name can only contain letters and spaces");
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("Please enter a valid email address");
    }

    // Phone validation
    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
      const phoneRegex = /^[\+]?[\d]{10}$/;
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = t("Please enter a valid phone number (10 digits)");
      }
    }

    // Subject validation
    if (!formData.subject) {
      newErrors.subject = t("Please select a subject");
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = t("Message is required");
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t("Message must be at least 10 characters long");
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = t("Message must not exceed 1000 characters");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      emailjs.sendForm(
        'service_1hg7btn',
        'template_czyto8h',
        formRef.current,
        'ASXu01Vz69rgsdShX'
      ).then(
        () => {
          setSnackbar({
            open: true,
            message: t("Your message has been sent successfully!"),
            severity: 'success'
          });
          setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        },
        (error) => {
          // console.error("EmailJS Error:", error.text);
          setSnackbar({
            open: true,
            message: t("Something went wrong. Please try again later."),
            severity: 'error'
          });
        }
      );
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <CssBaseline />
      <SEO
        title={t("Contact Us")}
        description={t("Get in touch with our team")}
        image={`${getImageUrl({ value: configData?.logo_storage }, "business_logo_url", configData)}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
      />

      <Container sx={{ maxWidth: 'none', width: '1200px', mx: 'auto' }}>
        <ContactHeader />

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Contact Form Section */}
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                {t("Send us a message")}
              </Typography>

              <form ref={formRef} onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="name"
                      label={t("Your Name")}
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="email"
                      label={t("Email Address")}
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="phone"
                      label={t("Phone Number")}
                      value={formData.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.subject} required>
                      <InputLabel>{t("Subject")}</InputLabel>
                      <Select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        label={t("Subject")}
                      >
                        <MenuItem value="">{t("Select a subject")}</MenuItem>
                        <MenuItem value="general">{t("General Inquiry")}</MenuItem>
                        <MenuItem value="support">{t("Customer Support")}</MenuItem>
                        <MenuItem value="feedback">{t("Product Feedback")}</MenuItem>
                        <MenuItem value="partnership">{t("Partnership Opportunity")}</MenuItem>
                        <MenuItem value="other">{t("Other")}</MenuItem>
                      </Select>
                      {errors.subject && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.subject}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="message"
                      label={t("Your Message")}
                      value={formData.message}
                      onChange={handleChange}
                      error={!!errors.message}
                      helperText={errors.message}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        bgcolor: "#1A914B",
                        color: "white",
                        py: 1.5,
                        px: 4,
                        fontWeight: "bold",
                        "&:hover": { bgcolor: "#1A914B" },
                      }}
                    >
                      {t("Send Message")}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* Image Section */}
          <Grid item xs={12} md={5}>
            <img src="/contactUss.png" alt="Contact Us Image" style={{ width: "100%", borderRadius: "8px" }} />
          </Grid>
        </Grid>

        {/* Get In Touch Section */}
        <Grid
          container
          spacing={4}
          sx={{
            backgroundColor: "#F4F9F4",
            p: 4,
            borderRadius: 2,
            mx: "auto",  // Center the container horizontally
            width: "1200px",  // Ensure the width is set to 1200px
            marginLeft: "-25px"
          }}
        >
          {/* Section 1: Get in touch heading and description */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 4, color: "#2C2C2C" }}>
              {t("Get in touch")}
            </Typography>
            <Typography variant="body2" sx={{ color: "#606060" }}>
              {t("Don't hesitate, we're just a message away. Our Super friendly team will get back to you as soon as possible")}
            </Typography>
          </Grid>

          {/* Section 2: Contact Info Cards */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              {/* Upper Row: Chat with us and Phone */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column", // Stacks items vertically
                    alignItems: "flex-start", // Align items to the left
                    justifyContent: "flex-start",
                    bgcolor: "#ffffff",
                    borderRadius: "12px !important", // More pronounced border-radius for a rounded effect
                    border: "1px solid #E5E5E5", // Light border for clean look
                    boxShadow: "none", // No heavy shadow
                  }}
                >
                  <img src="/mailsym.svg" alt="Email Symbol" style={{ width: "30px", height: "30px", marginBottom: "16px" }} />
                  <Typography variant="h7" fontWeight="bold" sx={{ color: "#000000", mb: 1 }}>
                    Chat with us
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Talk to our friendly team
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1A914B" }}>
                    support@dealplex.in
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column", // Stacks items vertically
                    alignItems: "flex-start", // Align items to the left
                    justifyContent: "flex-start",
                    bgcolor: "#ffffff",
                    borderRadius: "12px !important", // More pronounced border-radius for a rounded effect
                    border: "1px solid #E5E5E5", // Light border for clean look
                    boxShadow: "none", // No heavy shadow
                  }}
                >
                  <img src="/phonesym.svg" alt="Phone Symbol" style={{ width: "30px", height: "30px", marginBottom: "16px" }} />
                  <Typography variant="h7" fontWeight="bold" sx={{ color: "#000000", mb: 1 }}>
                    Phone
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Mon-Fri from 9:00 am to 7:00 pm
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1A914B" }}>
                    +91 9199096920
                  </Typography>
                </Paper>
              </Grid>

              {/* Lower Row: Office */}
              <Grid item xs={12} md={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column", // Stacks items vertically
                    alignItems: "flex-start", // Align items to the left
                    justifyContent: "flex-start",
                    bgcolor: "#ffffff",
                    borderRadius: "12px !important", // More pronounced border-radius for a rounded effect
                    border: "1px solid #E5E5E5", // Light border for clean look
                    boxShadow: "none", // No heavy shadow
                  }}
                >
                  <img src="/addresssym.svg" alt="Address Symbol" style={{ width: "30px", height: "30px", marginBottom: "16px" }} />
                  <Typography variant="h7" fontWeight="bold" sx={{ color: "#000000", mb: 1 }}>
                    Office
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Visit Our Office
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1A914B", lineHeight: 1.5 }}>
                    Office no.528B, Gera Imperium Rise, Wipro Circle, Hinjawadi Phase II, Hinjawadi, Pune, Pimpri-Chinchwad, Maharashtra 411057
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Contact;