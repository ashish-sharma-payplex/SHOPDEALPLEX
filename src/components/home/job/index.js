import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "../../../components/layout/MainLayout";
import SEO from "../../../components/seo";
import { getImageUrl } from "utils/CustomFunctions";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  Divider,
  FormHelperText,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import { job_apl } from "api-manage/ApiRoutes";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  marginBottom: theme.spacing(4),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(3, 0),
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Index = ({ configData, landingPageData }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    company: '',
    jobRole: '',
    experienceLevel: '',
    skills: [],
    hearAbout: '',
    additionalInfo: '',
    agreeTerms: false,
    resume: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('First name is required');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('Last name is required');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('Invalid email address');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('Phone number is required');
    }
    if (!formData.address.trim()) {
      newErrors.address = t('Address is required');
    }
    if (!formData.city.trim()) {
      newErrors.city = t('City is required');
    }
    if (!formData.state.trim()) {
      newErrors.state = t('State is required');
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = t('ZIP code is required');
    }
    if (!formData.jobRole.trim()) {
      newErrors.jobRole = t('Job role is required');
    }
    // Removed required validation for experienceLevel to accept any selected value or empty
    // if (!formData.experienceLevel.trim()) {
    //   newErrors.experienceLevel = t('Experience level is required');
    // }
    if (!formData.skills.length) {
      newErrors.skills = t('Select at least one skill');
    }
    if (!formData.hearAbout.trim()) {
      newErrors.hearAbout = t('This field is required');
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = t('You must accept the terms and conditions');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'agreeTerms') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'checkbox' && name === 'skills') {
      let newSkills = [...formData.skills];
      if (checked) {
        newSkills.push(value);
      } else {
        newSkills = newSkills.filter(skill => skill !== value);
      }
      setFormData({ ...formData, skills: newSkills });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, resume: e.target.files[0] });
      if (errors.resume) {
        setErrors({ ...errors, resume: '' });
      }
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) {
        return;
      }
      setLoading(true);
      try {
        const formPayload = new FormData();
        formPayload.append('first_name', formData.firstName);
        formPayload.append('last_name', formData.lastName);
        formPayload.append('phone_number', formData.phone);
        formPayload.append('email', formData.email);
        formPayload.append('street_address', formData.address);
        formPayload.append('city', formData.city);
        formPayload.append('state', formData.state);
        formPayload.append('zip_code', formData.zipCode);
        formPayload.append('job_role', formData.jobRole);
        formPayload.append('experience_level', formData.experienceLevel);
        formData.skills.forEach(skill => {
          formPayload.append('skills[]', skill);
        });
        formPayload.append('additional_information', formData.additionalInfo || '');
        // Remove message field as it's not in formData and not required
        if (formData.resume) {
          formPayload.append('resume', formData.resume);
        }

        const fullUrl = "https://dealplex.in/api/v1/job-application";
        const response = await axios.post(fullUrl, formPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          setSubmitStatus('success');
          setOpenSnackbar(true);
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            company: '',
            jobRole: '',
            experienceLevel: '',
            skills: [],
            hearAbout: '',
            additionalInfo: '',
            agreeTerms: false,
            resume: null,
          });
        } else {
          setSubmitStatus('error');
          setOpenSnackbar(true);
        }
      } catch (error) {
        if (error.response) {
          // console.error('Error response data:', error.response.data);
          // console.error('Error response status:', error.response.status);
          // console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
          // console.error('Error request:', error.request);
        } else {
          // console.error('Error message:', error.message);
        }
        setSubmitStatus('error');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      <CssBaseline />
      <SEO
        title={`${t("Job Application Form")} - ${configData?.business_name}`}
        image={`${getImageUrl(
          { value: configData?.logo_storage },
          "business_logo_url",
          configData
        )}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
      />
      <MainLayout configData={configData} landingPageData={landingPageData}>
        <Box sx={{ backgroundColor: "#f8f8f8", py: 5 }}>
          <Container maxWidth="md">
            {/* Form Header */}
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {t("Job Application Form")}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t("Please complete the form below to apply for a position with us")}
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <StyledPaper>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  {t("Personal Information")}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label={t("First Name")}
                      variant="outlined"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={Boolean(errors.firstName)}
                      helperText={errors.firstName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="lastName"
                      name="lastName"
                      label={t("Last Name")}
                      variant="outlined"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={Boolean(errors.lastName)}
                      helperText={errors.lastName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label={t("Email")}
                      variant="outlined"
                      value={formData.email}
                      onChange={handleChange}
                      error={Boolean(errors.email)}
                      helperText={errors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label={t("Phone Number")}
                      variant="outlined"
                      value={formData.phone}
                      onChange={handleChange}
                      error={Boolean(errors.phone)}
                      helperText={errors.phone}
                      required
                    />
                  </Grid>
                </Grid>
              </StyledPaper>

              {/* Address Information */}
              <StyledPaper>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  {t("Address")}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="address"
                      name="address"
                      label={t("Street Address")}
                      variant="outlined"
                      value={formData.address}
                      onChange={handleChange}
                      error={Boolean(errors.address)}
                      helperText={errors.address}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="city"
                      name="city"
                      label={t("City")}
                      variant="outlined"
                      value={formData.city}
                      onChange={handleChange}
                      error={Boolean(errors.city)}
                      helperText={errors.city}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      id="state"
                      name="state"
                      label={t("State")}
                      variant="outlined"
                      value={formData.state}
                      onChange={handleChange}
                      error={Boolean(errors.state)}
                      helperText={errors.state}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      id="zipCode"
                      name="zipCode"
                      label={t("ZIP Code")}
                      variant="outlined"
                      value={formData.zipCode}
                      onChange={handleChange}
                      error={Boolean(errors.zipCode)}
                      helperText={errors.zipCode}
                      required
                    />
                  </Grid>
                </Grid>
              </StyledPaper>

              {/* Professional Information */}
              <StyledPaper>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  {t("Professional Information")}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="company"
                      name="company"
                      label={t("Current Company (if applicable)")}
                      variant="outlined"
                      value={formData.company}
                      onChange={handleChange}
                      error={Boolean(errors.company)}
                      helperText={errors.company}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={Boolean(errors.jobRole)}>
                      <InputLabel id="jobRole-label">{t("Job Role")}</InputLabel>
                      <Select
                        labelId="jobRole-label"
                        id="jobRole"
                        name="jobRole"
                        value={formData.jobRole}
                        onChange={handleChange}
                        label={t("Job Role")}
                      >
                        <MenuItem value="developer">{t("Developer")}</MenuItem>
                        <MenuItem value="designer">{t("Designer")}</MenuItem>
                        <MenuItem value="product_manager">{t("Product Manager")}</MenuItem>
                        <MenuItem value="data_scientist">{t("Data Scientist")}</MenuItem>
                        <MenuItem value="marketing">{t("Marketing")}</MenuItem>
                        <MenuItem value="sales">{t("Sales")}</MenuItem>
                        <MenuItem value="other">{t("Other")}</MenuItem>
                      </Select>
                      {errors.jobRole && (
                        <FormHelperText>{errors.jobRole}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={Boolean(errors.experienceLevel)}>
                      <InputLabel id="experience-label">{t("Experience Level")}</InputLabel>
                      <Select
                        labelId="experience-label"
                        id="experienceLevel"
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleChange}
                        label={t("Experience Level")}
                      >
                        <MenuItem value="Entry">{t("Entry Level (0-2 years)")}</MenuItem>
                        <MenuItem value="Beginner">{t("Beginner Level (3-5 years)")}</MenuItem>
                        <MenuItem value="Intermediate">{t("Intermediate Level (6-9 years)")}</MenuItem>
                        <MenuItem value="Expert">{t("Expert Level (10+ years)")}</MenuItem>
                      </Select>
                      {errors.experienceLevel && (
                        <FormHelperText>{errors.experienceLevel}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl component="fieldset" error={Boolean(errors.skills)}>
                      <FormLabel component="legend">{t("Skills (select all that apply)")}</FormLabel>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.skills.includes('javascript')}
                              onChange={handleChange}
                              name="skills"
                              value="javascript"
                            />
                          }
                          label="JavaScript"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.skills.includes('react')}
                              onChange={handleChange}
                              name="skills"
                              value="react"
                            />
                          }
                          label="React"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.skills.includes('node')}
                              onChange={handleChange}
                              name="skills"
                              value="node"
                            />
                          }
                          label="Node.js"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.skills.includes('python')}
                              onChange={handleChange}
                              name="skills"
                              value="python"
                            />
                          }
                          label="Python"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.skills.includes('ui_design')}
                              onChange={handleChange}
                              name="skills"
                              value="ui_design"
                            />
                          }
                          label="UI Design"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.skills.includes('ux_design')}
                              onChange={handleChange}
                              name="skills"
                              value="ux_design"
                            />
                          }
                          label="UX Design"
                        />
                      </Box>
                      {errors.skills && (
                        <FormHelperText>{errors.skills}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </StyledPaper>

              {/* Upload Resume */}
              <StyledPaper>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  {t("Resume")}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, border: '2px dashed #ccc', borderRadius: '8px' }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      mb: 2,
                      backgroundColor: configData?.primary_color || '#FF6600',
                      '&:hover': {
                        backgroundColor: configData?.secondary_color || configData?.primary_color,
                      },
                    }}
                  >
                    {t("Upload Resume")}
                    <VisuallyHiddenInput
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {formData.resume
                      ? t("Selected file: ") + formData.resume.name
                      : t("Accepted formats: PDF, DOC, DOCX (max 5MB)")}
                  </Typography>
                </Box>
              </StyledPaper>

              {/* Additional Information */}
              <StyledPaper>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  {t("Additional Information")}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required error={Boolean(errors.hearAbout)}>
                      <FormLabel id="hearAbout-label">{t("How did you hear about us?")}</FormLabel>
                      <RadioGroup
                        aria-labelledby="hearAbout-label"
                        name="hearAbout"
                        value={formData.hearAbout}
                        onChange={handleChange}
                      >
                        <FormControlLabel value="social_media" control={<Radio />} label={t("Social Media")} />
                        <FormControlLabel value="job_board" control={<Radio />} label={t("Job Board")} />
                        <FormControlLabel value="company_website" control={<Radio />} label={t("Company Website")} />
                        <FormControlLabel value="referral" control={<Radio />} label={t("Referral")} />
                        <FormControlLabel value="other" control={<Radio />} label={t("Other")} />
                      </RadioGroup>
                      {errors.hearAbout && (
                        <FormHelperText>{errors.hearAbout}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="additionalInfo"
                      name="additionalInfo"
                      label={t("Additional Information")}
                      variant="outlined"
                      multiline
                      rows={4}
                      value={formData.additionalInfo}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </StyledPaper>

              {/* Terms and Submit */}
              <StyledPaper>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      name="agreeTerms"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {t("I agree to the")} <Box component="span" sx={{ textDecoration: 'underline', color: configData?.primary_color || '#1976d2' }}>{t("Terms and Conditions")}</Box> {t("and")} <Box component="span" sx={{ textDecoration: 'underline', color: configData?.primary_color || '#1976d2' }}>{t("Privacy Policy")}</Box>
                    </Typography>
                  }
                />
                {errors.agreeTerms && (
                  <FormHelperText error>{errors.agreeTerms}</FormHelperText>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      minWidth: '200px',
                      py: 1.5,
                      backgroundColor: configData?.primary_color || '#FF6600',
                      '&:hover': {
                        backgroundColor: configData?.secondary_color || configData?.primary_color,
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : t("Submit Application")}
                  </Button>
                </Box>
              </StyledPaper>
            </form>
          </Container>
        </Box>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={submitStatus === 'success' ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {submitStatus === 'success'
              ? t("Your application has been submitted successfully!")
              : t("There was an error submitting your application. Please try again.")}
          </Alert>
        </Snackbar>
      </MainLayout>
    </>
  );
};

export default Index;

export const getStaticProps = async () => {
  try {
    const configRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`,
      {
        method: "GET",
        headers: {
          "X-software-id": 33571750,
          "X-server": "server",
          origin: process.env.NEXT_CLIENT_HOST_URL,
        },
      }
    );

    if (!configRes.ok) {
      throw new Error(`Failed to fetch config: ${configRes.statusText}`);
    }

    const config = await configRes.json();

    // Also fetch landing page data if needed
    const landingPageRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/landing-page`,
      {
        method: "GET",
        headers: {
          "X-software-id": 33571750,
          "X-server": "server",
          origin: process.env.NEXT_CLIENT_HOST_URL,
        },
      }
    );

    const landingPageData = landingPageRes.ok ? await landingPageRes.json() : null;

    return {
      props: {
        configData: config,
        landingPageData: landingPageData,
      },
      revalidate: 3600,
    };
  } catch (error) {
    // console.error("Error fetching data:", error);

    return {
      props: {
        configData: null,
        landingPageData: null,
      },
      revalidate: 3600,
    };
  }
};
