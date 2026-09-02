import React from "react";
import { Box, Button, Divider, Grid, Typography } from "@mui/material";
import CustomTextFieldWithFormik from "../form-fields/CustomTextFieldWithFormik";
import CustomSelectWithFormik from "components/custom-select/CustomSelectWithFormik";

const VendorRegistrationForm = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Vendor Registration
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextFieldWithFormik
            label="Vendor Name"
            placeholder="Enter vendor name"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextFieldWithFormik
            label="Vendor Address"
            placeholder="Enter vendor address"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomSelectWithFormik
            selectFieldData={[]} // Add business zone options here
            inputLabel="Business Zone"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomSelectWithFormik
            selectFieldData={[]} // Add business module options here
            inputLabel="Business Module"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextFieldWithFormik
            label="GST"
            placeholder="Enter GST"
            type="number"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextFieldWithFormik
            label="Minimum Delivery Time"
            placeholder="Enter minimum delivery time"
            type="number"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextFieldWithFormik
            label="Maximum Delivery Time"
            placeholder="Enter maximum delivery time"
            type="number"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomSelectWithFormik
            selectFieldData={[]} // Add duration type options here
            inputLabel="Duration Type"
            required
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Owner Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <CustomTextFieldWithFormik
            label="Owner First Name"
            placeholder="Enter first name"
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextFieldWithFormik
            label="Owner Last Name"
            placeholder="Enter last name"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextFieldWithFormik
            label="Contact"
            placeholder="Enter contact number"
            required
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Account Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextFieldWithFormik
            label="Email"
            placeholder="Enter email"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextFieldWithFormik
            label="Password"
            placeholder="Enter password"
            type="password"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextFieldWithFormik
            label="Confirm Password"
            placeholder="Confirm password"
            type="password"
            required
          />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        sx={{ backgroundColor: '#FF6600', color: 'white', mt: 3 }}
      >
        Next
      </Button>
    </Box>
  );
};

export default VendorRegistrationForm;