import React from 'react';
import { Box, Typography, Grid, Button, useMediaQuery, useTheme } from '@mui/material';
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import Image from 'next/image';
import Link from 'next/link';

const DeliveryPartnerSection = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Box sx={{ padding: { xs: 3, md: 4 }, maxWidth: '1200px', margin: '0 auto' }}>

      <Grid container spacing={4} alignItems="center">

        {/* DESKTOP IMAGE (left side) */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}
        >
          <Image
            src="/deliman.jpg"
            alt="Delivery man"
            title="Delivery man"
            width={500}
            height={400}
            style={{ width: '100%', maxWidth: 450, height: 'auto' }}
          />
        </Grid>

        {/* CONTENT SECTION */}
        <Grid item xs={12} md={6}>
          {/* Badge */}
          {/* <Box
            sx={{
              backgroundColor: '#C4E1C1',
              padding: '5px 12px',
              borderRadius: '20px',
              marginBottom: 2,
              fontWeight: 600,
              color: '#2E7D32',
              fontSize: '0.875rem',
              maxWidth: 'fit-content',
            }}
          >
            For Delivery Partners
          </Box> */}

          {/* Heading */}
          <Typography sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? "18px" : "24px",
            color: "var(--text-primary)",
            lineHeight: 1

          }}>
            Become a Delivery Man
          </Typography>



          {/* ⭐ MOBILE IMAGE goes here between heading and text ⭐ */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Image
              src="/deliman.jpg"
              alt="Delivery man"
              width={350}
              height={260}
              style={{
                width: '100%',
                maxWidth: 320,
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* Description */}
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: isMobile ? "14px" : "16px",
              color: "var(--text-secondary)",
              padding: "14px 0px"
            }}
          >
            Earn money on your own schedule by joining our network of delivery
            partners. Get flexible hours, reliable support, and instant payouts.
          </Typography>


          {/* Feature List */}


          <Box sx={{ marginBottom: 3 }}>
            {[
              "Flexible working hours",
              "Instant payout after each delivery",
              "Reliable support",
              "Instant payouts after each delivery",
            ].map((item, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  marginBottom: 1.5,
                  fontSize: { xs: "1rem", sm: "1rem", md: "1.2rem" },
                }}
              >
                {/* Round Green Tick Icon */}
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: "var(--brand-green)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CheckIcon
                    sx={{
                      color: "#FFFFFF",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  />
                </Box>

                {/* Text */}
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: { xs: "16px", md: "18px" },
                  }}
                >
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>



          {/* CTA Buttons for Delivery Man */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* Button 1 */}
            <Link href="https://dealplex.in/deliveryman/apply" passHref>
              <Button
                variant="contained"
                sx={{
                  // minWidth: 220,
                  // height: 48,
                  fontFamily: "Inter, sans-serif",
                  padding: '6px 12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  backgroundColor: 'var(--brand-green)',
                  color: "#ffffff",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  '&:hover': { backgroundColor: 'var(--brand-green-hover)' },
                  '&:hover .arrow-icon': { transform: 'translateX(4px)' },
                }}
              >
                Register as Delivery Man
                <ArrowForwardIcon
                  className="arrow-icon"
                  sx={{ fontSize: 20, transition: 'transform 0.25s ease' }}
                />
              </Button>
            </Link>

            {/* Button 2 */}
            {/* <Link href="#" passHref>
              <Button
                variant="outlined"
                sx={{
                  // minWidth: 220,
                  // height: 48,
                  padding: '6px 12px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  color: '#1A914B',
                  border: '1px solid #1A914B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  '&:hover': { backgroundColor: '#F3FBF6', borderColor: '#1A914B' },
                  '&:hover .arrow-icon': { transform: 'translateX(4px)' },
                }}
              >
              Login as Delivery Man 
                <ArrowForwardIcon
                  className="arrow-icon"
                  sx={{ fontSize: 20, transition: 'transform 0.25s ease' }}
                />
              </Button>
            </Link> */}
          </Box>


        </Grid>
      </Grid>
    </Box>
  );
};

export default DeliveryPartnerSection;