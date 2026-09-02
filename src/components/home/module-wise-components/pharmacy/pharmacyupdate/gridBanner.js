import React from 'react';
import { Box, Grid, Card, CardMedia } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material'; // Import hooks for responsiveness

export default function VitaminGridLayout() {
  const items = [
    { id: 1, img: '/img5.png' },  
    { id: 2, img: '/img4.png' }, 
    { id: 3, img: '/img1.png'},
    { id: 4, img: '/img2.png' },
    { id: 5, img: '/img3.png' },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Check for mobile screen

  const BORDER_RADIUS = 6; // Increase border-radius for a smoother look
  const TALL_IMAGE_MIN_HEIGHT_MD = 500;  // Desktop/Tablet height for the tall item
  const EQUAL_IMAGE_HEIGHT_XS = 200;    // Mobile height for all items to look equal

  // Helper function to render a product card
  const renderCard = (item, isTallItem) => {
    let minHeight = 'unset';
    if (isMobile) {
      minHeight = EQUAL_IMAGE_HEIGHT_XS; // Mobile: All cards get the same small height
    } else if (isTallItem) {
      minHeight = TALL_IMAGE_MIN_HEIGHT_MD; // Desktop: Tall card gets a larger height
    }

    return (
      <Card 
        sx={{ 
            borderRadius: '12px !important',
            height: '100%', 
            minHeight: minHeight, // Apply conditional height
            overflow: 'hidden', 
        }}
        >
        <CardMedia
            component="img"
            image={item.img}
            alt={`product-${item.id}`}
            sx={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 

            }}
        />
        </Card>

    );
  };

  return (
    <Box sx={{ p: 2, maxWidth: '1200px', margin: '0 auto', borderRadius: BORDER_RADIUS, overflow: 'hidden' }}> {/* Border radius for parent container */}
      {/* MAIN GRID CONTAINER */}
      <Grid container spacing={3}>
        
        {/* === LEFT SECTION: 4 Images in an Asymmetrical 2x2 Grid === */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            
            {/* UPPER ROW */}
            <Grid item xs={12} md={7}> 
              {renderCard(items[0], false)} {/* Product 1 */}
            </Grid>
            <Grid item xs={12} md={5}>
              {renderCard(items[1], false)} {/* Product 2 */}
            </Grid>
            
            {/* LOWER ROW */}
            <Grid item xs={12} md={5}>
              {renderCard(items[2], false)} {/* Product 3 */}
            </Grid>
            <Grid item xs={12} md={7}>
              {renderCard(items[3], false)} {/* Product 4 */}
            </Grid>

          </Grid>
        </Grid>

        {/* === RIGHT SECTION: Tall Image (Product 5) === */}
        <Grid item xs={12} md={4}>
          {renderCard(items[4], true)}  {/* Product 5 (Tall Image) */}
        </Grid>
      </Grid>
    </Box>
  );
}
