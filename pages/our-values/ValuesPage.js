import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
} from "@mui/material";
import TrackChangesIcon from "@mui/icons-material/TrackChanges"; // Mission
import VisibilityIcon from "@mui/icons-material/Visibility";     // Vision
import DiamondIcon from "@mui/icons-material/Diamond";           // Values
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#e91e63",
    },
    secondary: {
      main: "#f44336",
    },
    background: {
      default: "#ffffff",
    },
    text: {
      primary: "#1f2937",
      secondary: "#4b5563",
    },
    mission: {
      main: "#0ea5e9",
    },
    vision: {
      main: "#f43f5e",
    },
    values: {
      main: "#f97316",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
      color: "#ffffff",
    },
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
});

const ValuesPage = () => {
  const cards = [
    {
      id: 1,
      title: "MISSION",
      description:
        "Our mission is to empower individuals and organizations by delivering innovative, reliable, and user-centric solutions that enhance productivity and growth.",
      color: "mission.main",
      icon: <TrackChangesIcon sx={{ fontSize: 36, color: "white" }} />,
      image: "linear-gradient(45deg, #ff9248, #f6de4b)",
    },
    {
      id: 2,
      title: "VISION",
      description:
        "We envision a world where technology seamlessly supports every aspect of life, enabling people to achieve more, connect deeper, and live smarter.",
      color: "vision.main",
      icon: <VisibilityIcon sx={{ fontSize: 36, color: "white" }} />,
      image: "linear-gradient(45deg, #ffb38a, #fb7185)",
    },
    {
      id: 3,
      title: "VALUES",
      description:
        "Integrity, innovation, and inclusivity are at the core of everything we do. We are committed to excellence, customer success, and responsible leadership.",
      color: "values.main",
      icon: <DiamondIcon sx={{ fontSize: 36, color: "white" }} />,
      image: "linear-gradient(45deg, #f97316, #fdba74)",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", pb: 3 }}>
        {/* Header Section */}
        <Box sx={{ bgcolor: "background.paper", py: 4, boxShadow: 1,mt:2,borderRadius:"12px" }}>
          <Container maxWidth="lg">
            <Typography variant="h4" color="text.primary" sx={{ mb: 1 }}>
              Company Mission, Vision and Values
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Learn what drives our company forward.
            </Typography>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 6 }}>
          <Grid container spacing={4}>
            {cards.map((card) => (
              <Grid item xs={12} md={4} key={card.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 5,
                    overflow: "visible",
                    boxShadow: 2,
                    position: "relative",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-4px)",
                      transition: "all 0.3s ease-in-out",
                    },
                  }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 160,
                      background: card.image,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                      borderRadius:5,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: 1,
                        mb: 5,
                      }}
                    >
                      {card.title}
                    </Typography>

                    <Avatar
                      sx={{
                        position: "absolute",
                        bottom: "-28px",
                        bgcolor: card.color,
                        width: 56,
                        height: 56,
                        boxShadow: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {card.icon}
                    </Avatar>
                  </CardMedia>

                  <CardContent
                    sx={{ pt: 5, px: 3, pb: 3, flexGrow: 1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        textAlign: "center",
                        mt: 1,
                      }}
                    >
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Footer */}
        <Container maxWidth="lg" sx={{ mt: 6 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: 1,
              borderColor: "grey.200",
              pt: 2,
            }}
          >
            
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ValuesPage;
