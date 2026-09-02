// pages\utility\index.js
import { useEffect, useState } from "react";
import { Box, styled } from "@mui/material";
import { CustomStackFullWidth } from "../../src/styled-components/CustomStyles.style";
import HeaderComponent from "../../src/components/header";
import FooterComponent from "../../src/components/footer";
import UtilityLayout from "../../src/components/home/module-wise-components/utility/UtilityLayout";
import { RechargeDashboardContent } from "../../src/components/home/module-wise-components/utility/RechargeDashboard";
import { MyTransactionsContent } from "../../src/components/home/module-wise-components/utility/MyTransactions";
import HelpSupportHomeScreen from "../../src/components/home/module-wise-components/utility/Help_Support/HelpSupportHomeScreen";
import FAQSection from "../../src/components/home/module-wise-components/utility/Help_Support/FAQSection";
import TicketSuccessCard from "../../src/components/home/module-wise-components/utility/Help_Support/TicketSuccessCard";
import PaymentSuccess from "../../src/components/home/module-wise-components/utility/PaymentSuccess";
import TicketList from "../../src/components/home/module-wise-components/utility/Help_Support/TicketList";
import HeroUtilityBanner from "../../src/components/home/module-wise-components/utility/UtilityHeroBanner";
import { useRouter } from "next/router";
import SEO from "../../src/components/seo";
import { getImageUrl } from "utils/CustomFunctions";

const PromoBanners = () => {
  const router = useRouter();

  const handleBannerClick = (slug) => {
    router.push(`/utility/${slug}`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
        gap: 2,
        mt: 2,
        width: "100%",
      }}
    >
      {[
        { src: "/utility/utilitybottombanner1.svg", slug: "mobile-prepaid" },
        { src: "/utility/utilitybottombanner2.svg", slug: "credit-card" },
        { src: "/utility/utilitybottombanner3.svg", slug: "electricity" },
      ].map((banner, i) => (
        <Box
          key={i}
          onClick={() => handleBannerClick(banner.slug)}
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            cursor: "pointer",
            transition: "transform 0.2s",
            "&:hover": { transform: "translateY(-2px)" },
          }}
        >
          <Box
            component="img"
            src={banner.src}
            alt={`Banner ${i + 1}`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

const MainLayoutRoot = styled("div")({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
});

const Index = ({ configData }) => {
  const [activeSection, setActiveSection] = useState("home");
  const router = useRouter();

  useEffect(() => {
    if (router.isReady && router.query.section) {
      setActiveSection(router.query.section);
    }
  }, [router.isReady, router.query.section]);

  return (
    <MainLayoutRoot>
      <SEO
  title="Safe & Secure Online Payments | UPI, Cards & Wallets "
  description="Pay securely on Dealplex using UPI, credit/debit cards, net banking, wallets & cash on delivery. Instant payment confirmation. Shop with confidence."
  keywords="secure online payment, UPI payment india, pay by UPI, phonepe payment, google pay checkout, paytm payment, credit card payment online, debit card payment, net banking india, cash on delivery, wallet payment india, safe payment gateway, instant payment confirmation, online transaction india, payment options india, buy now pay later india, EMI payment option, dealplex payment, secure checkout, digital payment india"
  // image="https://shopdealplex.com/icons/favIcon.png" 
  businessName="Dealplex"  
/>

      <header style={{ display: "flex", alignItems: "center" }}>
        <HeaderComponent />
      </header>

      <CustomStackFullWidth
        sx={{
          width: "100%",
          px: "5%",
          alignItems: "center !important",
          justifyContent: "center !important",
          alignContent: "center !important",
          bgcolor: "#ffffff",
          mb: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: "1280px",
            width: "100%",
            marginTop: { xs: "80px", sm: "160px" },
          }}
        >
          {/* <Box sx={{mb:2}}>
            <HeroUtilityBanner/>
          </Box> */}

          <UtilityLayout
            activeKey={activeSection}
            onNavigate={setActiveSection}
          >
            {activeSection === "home" && (
              <>
                <RechargeDashboardContent onNavigate={setActiveSection} />
              </>
            )}

            {activeSection === "transactions" && (
              <MyTransactionsContent
                onNeedHelp={() => setActiveSection("help")}
              />
            )}

            {activeSection === "help" && (
              <>
                <HelpSupportHomeScreen />
                {/* <TicketSuccessCard/> */}
              </>
            )}
          </UtilityLayout>

          {activeSection === "home" && <PromoBanners />}
        </Box>
      </CustomStackFullWidth>

      <footer
        style={{
          width: "100%",
          backgroundColor: "#F8F8F8",
          display: "flex",
          justifyContent: "center",
          padding: "20px 0",
        }}
      >
        <Box>
          <FooterComponent />
        </Box>
      </footer>
    </MainLayoutRoot>
  );
};

export default Index;