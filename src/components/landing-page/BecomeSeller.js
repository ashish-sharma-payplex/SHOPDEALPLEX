import React from 'react';
import { Box, Typography, Button, useMediaQuery, useTheme } from '@mui/material';
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import Image from 'next/image';
import Link from 'next/link';

const BusinessOwnerSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Box
      sx={{
        maxWidth: '1200px',
        margin: '0 auto',
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 4, md: 4 },
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 4, md: 6 },
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* ================= Content Section ================= */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left',
          alignItems: 'flex-start',
        }}
      >
        {/* Badge */}
        {/* <Box
          sx={{
            backgroundColor: '#C4E1C1',
            px: 2,
            py: 0.5,
            borderRadius: '20px',
            mb: 2,
            fontWeight: 600,
            color: '#2E7D32',
            fontSize: '0.85rem',
            maxWidth: 'fit-content',
          }}
        >
          For Business Owners
        </Box> */}

        {/* Title */}
        <Typography sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: isMobile ? "18px" : "24px",
          color: "#1A1A1A",
          lineHeight: 1

        }}>
          Become a Vendor
        </Typography>


        {/* ⭐ MOBILE IMAGE (Between heading & text) */}
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            width: '100%',
            my: 2,
          }}
        >
          <Image
            src="/sellerimagehere.png"
            alt="Vendor"
            title="Vendor"
            width={500}
            height={400}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
            }}
            quality={100}
          />
        </Box>

        {/* Description */}
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: isMobile ? "14px" : "16px",
            color: "#808080",
            padding: "14px 0px"
          }}
        >
          Join thousands of successful sellers on our platform. Reach new customers,
          grow your business, and increase your revenue with our powerful seller tools.
        </Typography>


        {/* Feature List */}


        <Box
          sx={{
            mb: 1,
            width: "100%",
            maxWidth: 450,
          }}
        >
          {[
            "Zero setup fees and transparent pricing",
            "Access to 100+ potential customers",
            "Dedicated seller support team",
            "Advanced analytics and insights",
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                mb: 1.5,
              }}
            >
              {/* Round Green Tick Icon */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: "#1A914B",
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
                  color: "#1A1A1A",
                  fontWeight: 600,
                  fontSize: { xs: "16px", md: "18px" },
                }}
              >
                {item}
              </Typography>
            </Box>
          ))}
        </Box>


        {/* CTA Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2,
            alignItems: 'center',
            flexWrap: { xs: 'nowrap', sm: 'wrap' }, // mobile: single line
          }}
        >
          {/* Button 1 */}
          <Link href="https://dealplex.in/vendor/apply" passHref>
            <Button
              variant="contained"
              sx={{
                 fontFamily: "Inter, sans-serif",
                flex: 1,
                padding: '8px 12px',
                fontSize: { xs: '14px', sm: '1rem' },
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: '#1A914B',
                color: "#ffffff",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                '&:hover': { backgroundColor: '#1C5B27' },
                '&:hover .arrow-icon': { transform: 'translateX(4px)' },
              }}
            >
              Register as Vendor
              <ArrowForwardIcon
                className="arrow-icon"
                sx={{ fontSize: 18, transition: 'transform 0.25s ease' }}
              />
            </Button>
          </Link>

          {/* Button 2 */}
          <Link href="https://dealplex.in/login/vendor" passHref>
            <Button
              variant="outlined"
              sx={{
                flex: 1, 
                 fontFamily: "Inter, sans-serif",
                padding: '8px 12px',
                fontSize: { xs: '14px', sm: '1rem' },
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                color: '#1A914B',
                border: '1px solid #1A914B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                '&:hover': { backgroundColor: '#F3FBF6', borderColor: '#1A914B' },
                '&:hover .arrow-icon': { transform: 'translateX(4px)' },
              }}
            >
              Login as Vendor
              <ArrowForwardIcon
                className="arrow-icon"
                sx={{ fontSize: 18, transition: 'transform 0.25s ease' }}
              />
            </Button>
          </Link>
        </Box>
      </Box>

      {/* ================= Desktop Image Section ================= */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: { xs: 260, sm: 340, md: 440 },
          }}
        >
          <Image
            src="/Group.png"
            alt="Business Owner Illustration"
            width={500}
            height={400}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
            }}
            quality={100}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default BusinessOwnerSection;
