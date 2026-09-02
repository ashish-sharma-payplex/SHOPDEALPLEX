import { 
  Box, 
  Button, 
  Typography, 
  useMediaQuery, 
  useTheme,
  Chip,
  Stack,
  IconButton,
  Fade,
  Slide
} from "@mui/material"; 
import React, { useState, useEffect } from "react"; 
import { styled, keyframes } from "@mui/material/styles";
import CustomImageContainer from "../CustomImageContainer"; 
import CustomContainer from "../container"; 
import Delivery from "./imgs/discountt.png";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import TimerIcon from '@mui/icons-material/Timer';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px #FF6600; }
  50% { box-shadow: 0 0 20px #FF6600, 0 0 30px #FF6600; }
  100% { box-shadow: 0 0 5px #FF6600; }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled Components
const BannerContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg,
    rgba(255, 102, 0, 0.05) 0%,
    rgba(215, 42, 0, 0.05) 25%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 102, 0, 0.05) 75%,
    rgba(215, 42, 0, 0.05) 100%)`,
  borderRadius: "20px",
  position: "relative",
  overflow: "hidden",
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  maxWidth: "1300px",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop:"-30px",
  marginBottom:"30px",
  boxShadow: "0 10px 30px rgba(255, 102, 0, 0.1)",
  border: "1px solid rgba(255, 102, 0, 0.1)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 15px 40px rgba(255, 102, 0, 0.15)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: `linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent)`,
    transition: "left 0.5s",
  },
  "&:hover::before": {
    left: "100%",
  },
}));

const FloatingIcon = styled(Box)(({ delay = 0 }) => ({
  animation: `${float} 3s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const PulsingChip = styled(Chip)(({ theme }) => ({
  animation: `${pulse} 2s ease-in-out infinite`,
  background: "linear-gradient(45deg, #FF6600, #d72a00)",
  color: "white",
  fontWeight: "bold",
  "& .MuiChip-icon": {
    color: "white",
  },
}));

const GlowingButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #FF6600, #d72a00)",
  borderRadius: "25px",
  padding: "12px 30px",
  fontSize: "16px",
  fontWeight: "bold",
  textTransform: "none",
  position: "relative",
  overflow: "hidden",
  animation: `${glow} 2s ease-in-out infinite alternate`,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: `linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.3), 
      transparent)`,
    animation: `${shimmer} 2s infinite`,
  },
  "&:hover": {
    background: "linear-gradient(45deg, #e55a00, #c02400)",
    transform: "scale(1.05)",
  },
}));

const CountdownTimer = ({ initialTime = 3600 }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "rgba(215, 42, 0, 0.1)",
        borderRadius: "15px",
        padding: "8px 16px",
      }}
    >
      <TimerIcon sx={{ color: "#d72a00", mr: 1 }} />
      <Typography
        variant="h6"
        sx={{
          color: "#d72a00",
          fontWeight: "bold",
          fontFamily: "monospace",
        }}
      >
        {formatTime(timeLeft)}
      </Typography>
    </Box>
  );
};

const DiscountBanner = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <CustomContainer>
      <Fade in={isVisible} timeout={1000}>
        <BannerContainer
          sx={{
            display: "flex",
            flexDirection: isSmall ? "column" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            position: "relative",
          }}
        >
          {/* Floating Background Elements */}
          <FloatingIcon
            delay={0}
            sx={{
              position: "absolute",
              top: "20px",
              right: "20px",
              opacity: 0.1,
            }}
          >
            <LocalOfferIcon sx={{ fontSize: 60, color: "#FF6600" }} />
          </FloatingIcon>
          
          <FloatingIcon
            delay={1}
            sx={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              opacity: 0.1,
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 50, color: "#d72a00" }} />
          </FloatingIcon>

          {/* Left Section - Text Content */}
          <Slide direction="right" in={isVisible} timeout={1200}>
            <Box
              sx={{
                flex: 1,
                textAlign: isSmall ? "center" : "left",
                pr: isSmall ? 0 : 4,
              }}
            >
              {/* Discount Badge */}
              <Box sx={{ mb: 2 }}>
                <PulsingChip
                  icon={<FlashOnIcon />}
                  label="LIMITED TIME OFFER"
                  size="small"
                  sx={{ mb: 1 }}
                />
              </Box>

              {/* Main Heading */}
              <Typography
                variant={isSmall ? "h4" : "h3"}
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  background: "linear-gradient(45deg, #d72a00, #FF6600)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  lineHeight: 1.2,
                }}
              >
                Special Discount Offer!
              </Typography>

              {/* Subtitle */}
              <Typography
                variant={isSmall ? "h6" : "h5"}
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: "#333",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Save up to{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#d72a00",
                    fontSize: "1.2em",
                    fontWeight: 800,
                  }}
                >
                  50%
                </Box>{" "}
                on your first purchase
              </Typography>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  mb: 3,
                  lineHeight: 1.6,
                  maxWidth: "400px",
                }}
              >
                 Grab the best deals on our premium products. Limited-time offer, so hurry up and make your purchase today! Don&apos;t miss out on huge savings.
              </Typography>

              {/* Features */}
              <Stack
                direction={isSmall ? "column" : "row"}
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#FF6600",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Free Shipping
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#FF6600",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Premium Quality
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#FF6600",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    24/7 Support
                  </Typography>
                </Box>
              </Stack>

              {/* Countdown Timer */}
              <Box sx={{ mb: 3 }}>
                {/* <Typography
                  variant="body2"
                  sx={{ color: "#666", mb: 1, fontWeight: 500 }}
                >
                  Offer ends in:
                </Typography> */}
                {/* <CountdownTimer /> */}
              </Box>

              {/* CTA Button */}
              <GlowingButton
                variant="contained"
                size="large"
                startIcon={<LocalOfferIcon />}
                onClick={() => {
                  window.location.href = "/home";
                }}
                sx={{
                  minWidth: "200px",
                }}
              >
                Shop Now & Save!
              </GlowingButton>
            </Box>
          </Slide>

          {/* Right Section - Image */}
          <Slide direction="left" in={isVisible} timeout={1400}>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                position: "relative",
                mt: isSmall ? 4 : 0,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  "&:hover": {
                    "& .image-container": {
                      transform: "scale(1.05) rotate(2deg)",
                    },
                  },
                }}
              >
                <CustomImageContainer
                  className="image-container"
                  src={Delivery.src}
                  alt="Discount Banner"
                  width={isSmall ? "300px" : "400px"}
                  height={isSmall ? "200px" : "300px"}
                  objectFit="contain"
                  borderRadius="15px"
                  sx={{
                    transition: "all 0.3s ease-in-out",
                    filter: "drop-shadow(0 10px 20px rgba(255, 102, 0, 0.2))",
                  }}
                />
                
                {/* Floating Discount Badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(45deg, #d72a00, #FF6600)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "18px",
                    animation: `${pulse} 2s ease-in-out infinite`,
                    boxShadow: "0 5px 15px rgba(215, 42, 0, 0.3)",
                  }}
                >
                  50%
                  <br />
                  OFF
                </Box>
              </Box>
            </Box>
          </Slide>
        </BannerContainer>
      </Fade>
    </CustomContainer>
  );
};

export default DiscountBanner;