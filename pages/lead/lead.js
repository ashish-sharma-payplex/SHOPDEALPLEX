import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  AppBar,
  Toolbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Paper,
  useTheme
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Star
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF9900",
    },
    secondary: {
      main: "#d72a00",
    },
    background: {
      default: "#ffffff",
    },
    text: {
      primary: "#1f2937",
      secondary: "#4b5563",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
});

const Lead = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const leadershipPrinciples = [
    {
      id: 1,
      title: "Start with a Founder's Fire",
      description: "Leaders act like owners — not renters. They hold themselves responsible for every outcome, win or lose. They never say \"that's not my job,\" because they believe everything is their problem if it affects the mission."
    },
    {
      id: 2,
      title: "Step Up, Don't Look Away",
      description: "True leaders don't pass the blame. They reflect inward when things break and shine the spotlight outward when things go right. Ownership is personal — not positional."
    },
    {
      id: 3,
      title: "Make Others See What You See",
      description: "Vision means nothing if it stays in your head. Great leaders speak with clarity and conviction. They give direction, feedback, and context in ways that make sense — and make people believe."
    },
    {
      id: 4,
      title: "Tune In Before You Talk",
      description: "You don't earn trust by being the smartest in the room. You earn it by listening first. Leaders stay curious, knowing that the right idea can come from any level, if you're open enough to hear it."
    },
    {
      id: 5,
      title: "See the Levers of Change — and Pull Them",
      description: "Optimism isn't naïve — it's necessary. Leaders believe that things can be better and back it up with learning, collaboration, and consistent action."
    },
    {
      id: 6,
      title: "Be the First Mover",
      description: "Ideas are fragile until someone makes them real. Leaders take the first step — whether that's suggesting a change, trying something new, or challenging the status quo."
    },
    {
      id: 7,
      title: "Refuse to Stand Still",
      description: "In a world that's always changing, stasis is decay. Leaders build momentum and push past complacency. They resist routines that limit ambition."
    },
    {
      id: 8,
      title: "Charge the Room with Energy",
      description: "Great leaders don't just work hard — they spark others to do the same. They energise through belief, positivity, and passion for what's possible."
    },
    {
      id: 9,
      title: "Connect the Dots and Point North",
      description: "Leadership is alignment. Leaders help everyone understand where we're going — and why. They chase shared wins, not siloed victories."
    },
    {
      id: 10,
      title: "Don't Let Problems Fester",
      description: "Every unresolved issue creates silent damage. Leaders act fast, uncover root causes, and build a culture that faces hard truths early."
    },
    {
      id: 11,
      title: "Keep It Moving When It Gets Tough",
      description: "Tough times don't need heroes — they need problem-solvers. Leaders admit what went wrong, learn quickly, and lead the next move forward with clarity."
    },
    {
      id: 12,
      title: "Decide with Purpose, Not Paralysis",
      description: "Indecision is still a decision. Leaders act with urgency, knowing which calls are reversible — and which demand more caution. Either way, they keep the machine moving."
    },
    {
      id: 13,
      title: "Focus on the Work, Not the Ego",
      description: "Leaders don't get distracted by pleasing everyone. They challenge assumptions, debate productively, and stay glued to outcomes, not opinions."
    },
    {
      id: 14,
      title: "Hire for the Future, Not the Shortcut",
      description: "Smart leaders hire people who raise the team's game — not just lighten their load. If you're afraid to be replaced by someone you hired, you're not leading."
    },
    {
      id: 15,
      title: "Guard What Matters Most",
      description: "Culture isn't written — it's lived. Leaders protect values by calling out what's off. Every ignored behavior becomes the new standard."
    },
    {
      id: 16,
      title: "Stay a Student, Always",
      description: "The best leaders never arrive — they evolve. They seek feedback, stay curious, and learn faster than the world is changing around them."
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <>
        <Box sx={{ bgcolor: 'background.default' }}>
          <Box sx={{ bgcolor: '#33ad63', color: 'white', py: 8,mt:2,borderRadius:"14px" }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ mb: 2 ,color:"#ffffff"}}>
                  Leadership Principles
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto',color:"#ffffff" }}>
                  These principles define how we work, lead, and grow together at Shopdealplex. They guide our decisions and actions every day.
                </Typography>
              </Box>
            </Container>
          </Box>

          <Container maxWidth="lg" sx={{ mt: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h4" sx={{ color: 'text.primary' }}>
                What Makes a Great Leader?
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              At Shopdealplex, we believe leadership isn&apos;t about titles — it&apos;s about mindset and action. Our leadership principles reflect the behaviors and values we expect from each other, at every level of our organization.
            </Typography>

            </Box>
          </Container>

          <Container maxWidth="lg" sx={{ mt: 6, mb: 12 }}>
            <Grid container spacing={4}>
              {leadershipPrinciples.map((principle) => (
                <Grid item xs={12} md={6} key={principle.id}>
                  <Accordion
                    expanded={expanded === `panel${principle.id}`}
                    onChange={handleChange(`panel${principle.id}`)}
                    sx={{
                      border: 1,
                      borderColor: 'grey.200',
                      borderRadius: 2,
                      mb: 2,
                      '&:before': { display: 'none' },
                      boxShadow: 1,
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        expanded === `panel${principle.id}` ? (
                          <KeyboardArrowDown sx={{ color: '#1A914B' }} />
                        ) : (
                          <KeyboardArrowRight sx={{ color: 'grey.500' }} />
                        )
                      }
                      sx={{ p: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: '#1A914B',
                            color: '#ffffff',
                            width: 32,
                            height: 32,
                            mr: 1.5,
                            fontSize: '0.875rem',
                          }}
                        >
                          {principle.id}
                        </Avatar>
                        <Typography variant="h6">{principle.title}</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Typography variant="h6" sx={{ color: 'text.secondary', pl: 5.5 }}>
                        {principle.description}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </Container>

          <Container maxWidth="lg" sx={{ my: 12 }}>
            <Paper
              sx={{
                background: '#1A914B',
                borderRadius: 2,
                color: 'white',
                p: 6,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                Join our leadership journey
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                  We&apos;re looking for leaders who embody these principles and can help take our mission forward.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'white',
                  color: '#1A914B',
                  borderRadius: 50,
                  px: 3,
                  '&:hover': { bgcolor: 'grey.100' },
                }}
                href="https://hrms.dealplex.in/career/1/en"
              >
                View Careers
              </Button>
            </Paper>
          </Container>
        </Box>
      </>
    </ThemeProvider>
  );
};

export default Lead;
