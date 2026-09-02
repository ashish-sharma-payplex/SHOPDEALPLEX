import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  InputLabel,
  FormHelperText,
  CircularProgress,
  Snackbar
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import SecurityIcon from "@mui/icons-material/Security";
import { bug_report } from "../../src/api-manage/ApiRoutes";
import axios from "axios";

const DealplexReport = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bugName: "",
    message: "",
    file: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [fileName, setFileName] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
      setFileName(e.target.files[0].name);
      
      if (errors.file) {
        setErrors({
          ...errors,
          file: ""
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t("Name is required");
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("Email is invalid");
    }
    
    if (!formData.bugName.trim()) {
      newErrors.bugName = t("Bug name is required");
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t("Description is required");
    } else if (formData.message.length < 20) {
      newErrors.message = t("Please provide more details about the bug");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append("fullname", formData.name);
      formPayload.append("email", formData.email);
      formPayload.append("vulnerability_title", formData.bugName);
      formPayload.append("issue_desc", formData.message);
      if (formData.file) {
        formPayload.append("attachement", formData.file);
      }

      const fullUrl = "https://dealplex.in/api/v1/bug-report";
      // console.log("Submitting bug report to URL:", fullUrl);
      const response = await axios.post(fullUrl, formPayload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.status === 200) {
        setSubmitStatus("success");
        setSnackbarMessage(t("Thank you! Your report has been submitted successfully."));
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setFormData({
          name: "",
          email: "",
          bugName: "",
          message: "",
          file: null
        });
        setFileName("");
      } else {
        setSubmitStatus("error");
        setSnackbarMessage(t("Failed to submit the report. Please try again."));
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      // console.error("Error submitting bug report:", error.response || error.message || error);
      setSubmitStatus("error");
      setSnackbarMessage(t("An error occurred while submitting the report. Please try again."));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box 
          sx={{ 
            py: 8,
            background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)',
            borderRadius: { xs: 0, md: 2 },
            mb: 6,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Container>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SecurityIcon sx={{ fontSize: 64, color: '#00B868', mb: 2 }} />
              <Typography 
                variant="h2" 
                component="h1"
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  color: '#333'
                }}
              >
                {t("Report a Security Vulnerability")}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  mb: 3,
                  fontWeight: 'normal',
                  maxWidth: '700px',
                  mx: 'auto'
                }}
              >
                {t("Help keep Shopdealplex safe by submitting potential security vulnerabilities you've discovered")}
              </Typography>
            </Box>
          </Container>
        </Box>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, sm: 4, md: 5 }, 
            borderRadius: 2,
            mb: 6
          }}
        >
          {submitStatus === "success" ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Alert severity="success" sx={{ mb: 3, fontSize: '1.1rem' }}>
                {t("Thank you! Your report has been submitted successfully.")}
              </Alert>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {t("Our security team will review your report and respond as soon as possible.")}
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setSubmitStatus(null)}
                sx={{ 
                  bgcolor: '#00B868', 
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#009955'
                  }
                }}
              >
                {t("Submit Another Report")}
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("Full Name")}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("Email Address")}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t("Vulnerability Title")}
                    name="bugName"
                    value={formData.bugName}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.bugName}
                    helperText={errors.bugName}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t("Detailed Description")}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    multiline
                    rows={6}
                    fullWidth
                    required
                    error={!!errors.message}
                    helperText={errors.message || t("Please include steps to reproduce, impact, and any other relevant details")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel htmlFor="file-upload" sx={{ mb: 1 }}>
                    {t("Attachment (Optional)")}
                  </InputLabel>
                  <Box
                    component="label"
                    htmlFor="file-upload"
                    sx={{
                      border: '1px dashed',
                      borderColor: errors.file ? 'error.main' : 'grey.400',
                      borderRadius: 1,
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.02)'
                      }
                    }}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <CloudUploadIcon sx={{ fontSize: 40, color: '#FF6600', mb: 1 }} />
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {fileName || t("Drag and drop files here or click to browse")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("Acceptable formats: PDF, PNG, JPG, ZIP (Max 10MB)")}
                    </Typography>
                  </Box>
                  {errors.file && (
                    <FormHelperText error>{errors.file}</FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    endIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{ 
                      bgcolor: '#FF6600', 
                      color: 'white', 
                      px: 4, 
                      py: 1.5, 
                      borderRadius: 3,
                      '&:hover': {
                        bgcolor: '#00B868'
                      }
                    }}
                  >
                    {isSubmitting ? t("Submitting...") : t("Submit Report")}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default DealplexReport;