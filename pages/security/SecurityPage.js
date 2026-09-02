import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "../../src/components/layout/MainLayout";
import SEO from "../../src/components/seo";
import { getImageUrl } from "utils/CustomFunctions";
import { Box, Typography, Grid, Container, Button } from "@mui/material";
import SecurityImg from "./assets/lock1.jpg";
import TeamImg from "./assets/lock2.jpg";
import Router, { useRouter } from 'next/router';
import DealplexReport from "../report";


// Security Header Component
const SecurityHeader = () => {
  const { t } = useTranslation();
  const router = useRouter();

  
  return (
    <Box 
      sx={{ 
        py: 8,
        background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)',
        borderRadius: { xs: 0, md: 2 },
        mb: 6,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h2" 
              component="h1"
              sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                color: '#333'
              }}
            >
              {t("Help keep Shopdealplex safe for the community")}
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                mb: 3,
                fontWeight: 'normal'
              }}
            >
              {t("By disclosing security issues to us")}
            </Typography>
            <Button 
              variant="contained" 
               onClick={() => router.push('/report')}
              sx={{ 
                bgcolor: '#1A914B', 
                color: 'white', 
                px: 4, 
                py: 1.5, 
                borderRadius: 3,
                '&:hover': {
                  bgcolor: '#00B868'
                }
              }}
            >
              {t("Report a Vulnerability")}
            </Button>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={TeamImg.src}
              alt="Security at Shopdealplex"
              sx={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Security Section Component
const SecuritySection = ({ title, content, index, withImage }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const isEven = index % 2 === 0;
  
  return (
    <Box 
      sx={{ 
        pt: 4,
        mb: 4,
        borderRadius: 2,
        background: isEven ? 'white' : 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
        boxShadow: isEven ? 0 : 1
      }}
    >
      <Container>
        <Grid container spacing={4} alignItems="center" direction={isEven || !withImage ? "row" : "row-reverse"}>
          <Grid item xs={12} md={withImage ? 6 : 12}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <Box 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: '#1A914B', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2,
                  fontWeight: 'bold'
                }}
              >
                {index < 10 ? `0${index}` : index}
              </Box>
              <Typography 
                variant="h5" 
                component="h2"
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  color: '#333'
                }}
              >
                {t(title)}
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3,
                color: 'text.secondary',
                fontSize: '1rem',
                lineHeight: 1.7
              }}
            >
              {t(content)}
            </Typography>
            {title === "Submit Your Findings" && (
              <Button 
                variant="contained" 
               onClick={() => router.push('/report')}
                sx={{ 
                  bgcolor: '#1A914B', 
                  color: 'white', 
                  px: 3, 
                  py: 1,
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: '#00B868'
                  }
                }}
              >
                {t("Visit Dealplex Report Page")}
              </Button>
            )}
          </Grid>
          {withImage && (
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src={SecurityImg.src}
                alt="Security Team"
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3
                }}
              />
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

// Security Content
const SECURITY_SECTIONS = [
  {
    id: 1,
    title: "Our Commitment to Security",
    content: "We take security seriously at Shopdealplex. If you are a security researcher or expert, and believe you've identified security-related issues with Shopdealplex's website or apps, we would appreciate you disclosing it to us responsibly.",
    withImage: true
  },
  {
    id: 2,
    title: "Responsible Disclosure",
    content: "Our team is committed to addressing all security issues in a responsible and timely manner, and ask the security community to give us the opportunity to do so before disclosing them publicly.",
    withImage: false
  },
  {
    id: 3,
    title: "Submit Your Findings",
    content: "Please submit a bug to us on our HackerOne page, along with a detailed description of the issue and steps to reproduce it, if any. We trust the security community to make every effort to protect our users data and privacy.",
    withImage: false
  },
  
];

const SecurityPage = ({ configData, landingPageData }) => {
  const { t } = useTranslation();
  const router = useRouter(); 

  useEffect(() => {
    // Any initialization logic can go here
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <CssBaseline />
      <SEO
        title={t("Security - Shopdealplex")}
        description={t("Help keep Shopdealplex safe for the community by disclosing security issues to us")}
        image={`${getImageUrl(
          { value: configData?.logo_storage },
          "business_logo_url",
          configData
        )}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
      />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <SecurityHeader />
        
        {SECURITY_SECTIONS.map((section, index) => (
          <SecuritySection 
            key={section.id}
            title={section.title}
            content={section.content}
            index={index + 1}
            withImage={section.withImage}
          />
        ))}
        
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 6,
            mt: 4,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontWeight: 'bold',
              mb: 2
            }}
          >
            {t("Ready to help improve our security?")}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              color: 'text.secondary',
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            {t("Submit the bugs to us on our HackerOne page, along with a detailed description of the issue and steps to reproduce it.")}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => Router.push('/report')}
            size="large"
            sx={{ 
              bgcolor: '#1A914B', 
              color: 'white', 
              px: 4, 
              py: 1.5, 
              borderRadius: 3,
              '&:hover': {
                bgcolor: '#00B868'
              }
            }}
          >
            {t("Visit Dealplex Report")}
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default SecurityPage;