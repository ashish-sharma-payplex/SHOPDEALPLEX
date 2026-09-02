import React from 'react';
import { Box, Typography, Grid, Container } from '@mui/material';

const DealplexSection = () => {
  const features = [
    {
      id: 1,
      title: "Fast & Live Updates",
      desc: "Riders reach your location in minutes, and you can track your parcel in real time from pickup to delivery."
    },
    {
      id: 2,
      title: "Safe & Secure Delivery",
      desc: "Every parcel is handled with care, with proof photos at pickup & drop. All delivery partners are fully verified."
    },
    {
      id: 3,
      title: "Affordable & Transparent Pricing",
      desc: "No hidden charges get clear, upfront pricing for every delivery based on distance and parcel type."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 10 } }}>
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        
        {/* Left Side: Content (Size increased to 8 for more space) */}
        <Grid item xs={12} md={8}>
          <Typography 
            variant="h4" 
            fontWeight="800" 
            sx={{ mb: 6, color: '#1a1a1a', lineHeight: 1.2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}
          >
            Why Choose Dealplex <br /> for Your Parcel
          </Typography>

          <Grid container spacing={4}>
            {features.map((item, index) => (
              <Grid 
                item 
                xs={12} 
                sm={index === 2 ? 12 : 6} 
                key={item.id}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#1b8a43', 
                      color: 'white', 
                      borderRadius: '50%', 
                      minWidth: 28, 
                      height: 28, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      mt: 0.5,
                      flexShrink: 0
                    }}
                  >
                    {item.id}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 0.5, color: '#212529' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, maxWidth: '350px' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Side: Image (Size decreased to 4 for smaller look) */}
        <Grid item md={4} sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
          <Box 
            component="img"
            src="/DealplexSection.png" 
            alt="Dealplex Features"
            sx={{ 
              width: '90%', // Yahan se size mazeed control kar sakte ho
              maxWidth: '380px', 
              height: 'auto',
              ml: 'auto', // Right align karne ke liye
              display: 'block'
            }}
          />
        </Grid>

      </Grid>
    </Container>
  );
};

export default DealplexSection;