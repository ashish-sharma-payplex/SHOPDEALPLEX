import { Stack, Box, Typography, Button, Divider } from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import Fade from '@mui/material/Fade';
import { useRouter } from 'next/router';

// Gradient CTA Button
const GradientButton = (props) => (
  <Button
    sx={{
      background: "linear-gradient(to right, #FFD600, #FF8C00)",
      color: "#1A1A1A",
      padding: "14px 28px",
      fontWeight: "bold",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "background 0.3s",
      "&:hover": {
        background: "linear-gradient(to right, #FFB700, #FF6900)",
      },
      // Mobile responsive
      width: "100%",
    }}
    {...props}
  />
);

// Checklist Item
const CheckItem = ({ text }) => (
  <Stack direction="row" alignItems="center" spacing={1} mb={1.2}>
    <CheckCircleIcon sx={{ color: "#00C851" }} />
    <Typography variant="body1">{text}</Typography>
  </Stack>
);

// Reusable Promo Section
const PromoSection = ({
  badge,
  title,
  description,
  checklist,
  buttonText,
  stats,
  reverse = false,
  redirectLink,
  imageSrc1,
  imageSrc2,
  
}) => {
  const router = useRouter();

  const redirectHandler = () => {
    if (redirectLink.startsWith('http://') || redirectLink.startsWith('https://')) {
      window.open(redirectLink, '_blank');
    } else {
      router.push({
        pathname: redirectLink,
        query: { active: "active" },
      });
    }
  };

  return (
    <Stack
      direction={{ xs: "column", md: reverse ? "row-reverse" : "row" }}
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
       style={{ padding: '40px' }} // Add padding here
      sx={{
        px: { xs: 4, md: 12 },
        py: 2,
        background: "linear-gradient(135deg, rgba(255, 212, 59, 0.05) 0%, rgba(255, 122, 0, 0.05) 100%)",
        borderRadius: "20px",
        margin: { xs: "10px 0", md: "20px 0" },
      }}
    >
      {/* Left Content */}
      <Box maxWidth="400px" sx={{ textAlign: { xs: "center", md: "left" } }}>
        <Typography
          variant="overline"
          sx={{
            background: "#FFD43B55",
            px: 2,
            py: 0.5,
            borderRadius: "20px",
            fontWeight: "bold",
          }}
        >
          {badge}
        </Typography>

        <Typography variant="h6" fontWeight="bold" mt={2} mb={2}>
          {title}
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={3}>
          {description}
        </Typography>

        {/* Checklist */}
        {checklist.map((item, idx) => (
          <CheckItem key={idx} text={item} />
        ))}

        {/* CTA Button */}
       <GradientButton
          sx={{
            mt: 3,
            background: 'linear-gradient(to right, #ffd600, #ff8c00)',
            border: 'none',
            color: '#1a1a1a',
            padding: '10px 15px',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'background 0.3s',
            width: 'fit-content',
            '&:hover': {
              background: 'linear-gradient(to right, #ff8c00, #ffd600)', // Reverse gradient on hover
            },
          }}
          onClick={redirectHandler}
        >
          {buttonText}
        </GradientButton>

      </Box>

      {/* Stat Card */}
      <Box
        sx={{
          background: "linear-gradient(to bottom, #CAF2A2, #F9B876)",
          borderRadius: "20px",
          padding: "20px",
          color: "#030202ff",
          textAlign: "center",
          // boxShadow: "0px 12px 24px rgba(255, 140, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          maxWidth: 400,
          maxHeight:400,
          height:'100%',
          width: '100%',
        }}
      >
        {/* First Image */}
        {imageSrc1 && (
          <Box>
            <img
              src={imageSrc1}
              alt="Image Slot 1"
              style={{
                width: '100%',
                maxWidth: '200px',
                maxHeight: '200px',
                marginBottom: '15px',
              }}
            />
          </Box>
        )}

        {/* Second Image */}
        {imageSrc2 && (
          <Box>
            <img
              src={imageSrc2}
              alt="Image Slot 2"
              style={{
                width: '100%',
                maxWidth: '150px',
                maxHeight: '150px',
                marginBottom: '15px',
              }}
            />
          </Box>
        )}

        <Typography variant="h7" fontWeight="bold" mb={1}>
          {stats.heading}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {stats.value}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, mb: 3 }}>
          {stats.subtext}
        </Typography>

        <Stack direction="row" justifyContent="space-between" mt={1} spacing={2} width="100%">
          {stats.bottom.map((item, idx) => (
            <Box textAlign="center" key={idx} flex={1}>
              <Typography variant="h6" fontWeight="bold">
                {item.value}
              </Typography>
              <Typography variant="body2">{item.label}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};

export default function BusinessPromos() {
  return (
    <Stack spacing="1px">
      {/* Seller Section */}
      <Fade in={true} timeout={500}>
        <div style={{ marginTop: '20px' }}>
          <PromoSection
            badge="For Business Owners"
            title="Become a Seller"
            description="Join thousands of successful sellers on our platform. Reach new customers, grow your business, and increase your revenue with our powerful seller tools."
            checklist={[
              "Zero setup fees and transparent pricing",
              "Access to 100+ potential customers",
              "Dedicated seller support team",
              "Advanced analytics and insights",
            ]}
            buttonText="Start Selling Today"
            stats={{
              heading: "Average Seller Growth",
              value: "300%",
              subtext: "Revenue increase in first 6 months",
              bottom: [
                { value: "24/7", label: "Support" },
                { value: "5%", label: "Commission" },
              ],
            }}
            imageSrc1="/pikachu.png"       // Seller first image
   
            redirectLink="https://dealplex.in/vendor/apply"
          />
        </div>
      </Fade>

     

      {/* Deliveryman Section */}
      <Fade in={true} timeout={700}>
        <div style={{ marginBottom: '20px' }}>
          <PromoSection
            badge="For Delivery Partners"
            title="Become a Deliveryman"
            description="Earn money on your own schedule by joining our network of delivery partners. Get flexible hours, reliable support, and instant payouts."
            checklist={[
              "Flexible working hours",
              "Instant payout after each delivery",
              "24/7 driver support",
              "Bonuses for top performers",
            ]}
            buttonText="Start Delivering Today"
            stats={{
              heading: "Average Weekly Earnings",
              value: "Rs.5000+",
              subtext: "Earn more with peak time bonuses",
              bottom: [
                { value: "Instant", label: "Payouts" },
                { value: "100+", label: "Orders Delivered" },
              ],
            }}
            reverse
            imageSrc1="/manD.png"          // Delivery first image
            redirectLink="https://dealplex.in/deliveryman/apply"
          />
        </div>
      </Fade>
    </Stack>
  );
}
