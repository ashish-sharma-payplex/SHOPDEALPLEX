import React from 'react';
import { Box, Grid, Typography, useMediaQuery } from '@mui/material';

const VehicleSelection = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <Box sx={{ padding: { xs: 2, md: 4 }, textAlign: 'center', mb: 8 }}>
      <Typography variant="h4" gutterBottom fontFamily={"Inter"}
        fontWeight={500}
        color="#000000">
        Pick the Vehicle That Fits Your Parcel
      </Typography>
      <Typography align="center" fontFamily={"Inter"}
        fontWeight={500}
        color="#767676" sx={{ mb: 3, fontSize: 20 }}>
        We offer multiple vehicle types to match your delivery size, weight, and urgency.
      </Typography>

      <Grid
        container
        spacing={2}
        justifyContent="center"
        sx={{
          // Tablet aur Laptop dono par nowrap rakhenge taaki side-by-side hi rahe
          flexWrap: { xs: 'wrap', sm: 'nowrap' }
        }}
      >
        {[
          { src: '/scooter.png', title: '2 Wheeler', desc: 'Documents, small boxes, fast delivery up to 20 kg.' },
          { src: '/3wheeler.png', title: '3 Wheeler', desc: 'For medium-weight goods, groceries, cartons, up to 500 kg.' },
          { src: '/4wheeler.png', title: 'Mini Truck', desc: 'Large items, small appliances, up to 750 kg load capacity.' },
          { src: '/truck.png', title: 'Pickup Truck', desc: 'Bulky parcels, furniture, commercial goods (1.5-3 Ton).' }
        ].map((item, index) => (
          <Grid item xs={12} sm={3} key={index} sx={{ display: 'flex' }}>
            <Box sx={{
              padding: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}>
              {/* Image Container: Fixed height taaki titles align rahein */}
              <Box sx={{ height: '160px', display: 'flex', alignItems: 'center', mb: 2 }}>
                <img
                  src={item.src}
                  alt={item.title}
                  title={item.title}
                  style={{
                    width: '100%',
                    maxWidth: '150px', // Image size badi kar di
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </Box>

              {/* Title: Aligned with min-height */}
              <Typography
                variant="h6"
                align="center"
                fontFamily="Inter"
                fontWeight={500}
                color="#204945"
                sx={{
                  mb: 1,
                  minHeight: '32px',
                  fontSize: {
                    xs: '16px',   // mobile
                    sm: '18px',   // tablet
                    md: '20px',   // small laptop
                    lg: '24px',   // laptop (as you wanted)
                  },
                }}
              >
                {item.title}
              </Typography>

              {/* Description: 2 lines fixed with ellipsis */}
              <Typography
                variant="body2"
                fontFamily="Inter"
                fontWeight={400}
                color="#777E90"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minHeight: '40px',
                  lineHeight: '1.4',

                  fontSize: {
                    xs: '12px', 
                    sm: '13px',  
                    md: '14px',  
                    lg: '16px',  
                  },
                }}
              >
                {item.desc}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VehicleSelection;