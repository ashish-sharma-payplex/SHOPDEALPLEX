import {
  Box,
  Button,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CustomContainer from "../../container";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Mob from "../imgs/Mobile.png";
import foo from "../imgs/cards/foodcard.jpg";
import par from "../imgs/cards/parcelcard.jpg";
import pha from "../imgs/cards/pharmacycard.jpg";
import rent from "../imgs/cards/rentalcard.jpg";
import travel from "../imgs/cards/travelcard.jpg";
import gro from "../imgs/cards/grocerycard.jpg";
import Appbg from "../imgs/appbg.png";
import Cross from "../imgs/crossmob.png";
// ================= STYLES ================= //
const Wrapper = styled(Box)(({ theme }) => ({
  backgroundImage: `url(${Appbg.src})`, 
  backgroundSize: "cover",             
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  width: "100%",
  padding: "60px 20px",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "row",
  margin:0,
  gap: "20px",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    textAlign: "center",
    padding: "40px 15px", // reduce padding for smaller screens
  },
}));


const CustomButton = styled(Button)(({ theme }) => ({
  borderRadius: "10px",
  padding: "10px 12px",
  fontSize: "16px",
  fontWeight: 700,
  background: "#000",
  color: "#fff",
  textTransform: "none",
  [theme.breakpoints.down("md")]: {
    fontSize: "14px",
  },
}));

const MobileImageContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: "400px",
  marginRight:"150px",
  height: "350px",
  borderRadius: "10px",
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  transition: "height 0.5s ease-in-out",
  [theme.breakpoints.down("md")]: {
    marginTop: "30px",
  },
}));

const MobileImage = styled("img")({
  width: "60%",
    zIndex: 1,
  transition: "transform 0.5s ease-in-out",
                 // slightly reduce transparency
  filter: "brightness(2) drop-shadow(0px 8px 20px rgba(0,0,0,0.2))",  
});

const ImageOverlay = styled(Box)(`
  position: absolute;
  top: 22%;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 280px;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`);

const CrossImage = styled("img")(({ theme }) => ({
  position: "absolute",
  width: "400px",
  height: "auto",
  zIndex: 0,
  right: "-150px",
  bottom: "-30px",
  opacity: 1,
    filter:"drop-shadow(0px 10px 25px rgba(0,0,0,0.4))",  

  [theme.breakpoints.down("md")]: {
    width: "80px",
    right: "-20px",
    bottom: "-20px",
  },
  [theme.breakpoints.down("sm")]: {
    width: "60px",
    right: "-15px",
    bottom: "-15px",
  },
}));

const StyledSlider = styled(Slider)`
  width: 100%;
  height: 100%;

  .slick-list {
    overflow: visible;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .slick-track {
    display: flex;
    align-items: center;
  }
  .slick-slide {
    display: flex !important;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease-in-out;
  }
  .slick-slide img {
    width: 100px;
    height: 130px;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    opacity: 0.3;
    transform: scale(0.6);
    transition: all 0.4s ease-in-out;
  }
  .slick-center img {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    filter: brightness(1.15) drop-shadow(0 8px 15px rgba(0,0,0,0.3));
  }
  .slick-prev, .slick-next, .slick-dots {
    display: none !important;
  }
`;

// ================= COMPONENT ================= //
const AppDownloadSection = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();

  const goToApp = (url) => {
    window.open(url);
  };

  const cardImages = [
    { src: gro.src, alt: "grocery" },
    { src: foo.src, alt: "Food" },
    { src: par.src, alt: "Parcel" },
    { src: pha.src, alt: "Pharmacy" },
    { src: rent.src, alt: "Rental" },
    { src: travel.src, alt: "Travel" },
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 0,
    centerMode: true,
    centerPadding: "0px",
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    focusOnSelect: true,
    cssEase: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  };

  return (
    <CustomContainer>
      <Wrapper>
        {/* LEFT CONTENT */}
        <Box
          sx={{
            flex: 1,
            color: "#fff",
            textAlign: isSmall ? "center" : "left",
            marginLeft:"70px",
          }}
        >
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{ color: "#fff", mb: 1 }}
          >
            Your Local Marketplace
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: "#f5f5f5", mb: 2 }}
          >
            Reimagined
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Discover amazing deals, support local businesses, and
            enjoy lightning-fast delivery<br></br> with our revolutionary marketplace app.
          </Typography>

          {/* App Store Buttons */}
           <Box
            sx={{
              display: "flex",
              gap: "15px",
              mt: 2,
              flexWrap: "wrap",
              justifyContent: isSmall ? "center" : "start",
            }}
          >
            <CustomButton
              onClick={() => goToApp("https://play.google.com/store/apps/details?id=com.dealplex.dealplex_user")}
              sx={{
                backgroundImage:
                  "url('https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "180px",
                height: "50px",
                color: "transparent",
              }}
            >
              Download on Play Store
            </CustomButton>

            <CustomButton
              onClick={() => goToApp("https://play.google.com/store/apps/details?id=com.dealplex.dealplex_user")}
              sx={{
                backgroundImage:
                  "url('https://upload.wikimedia.org/wikipedia/commons/9/91/Download_on_the_App_Store_RGB_blk.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "180px",
                height: "50px",
                color: "transparent",
              }}
            >
              Download on Apple Store
            </CustomButton>
          </Box>

          {/* Stats Section */}
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" ,mt:"20px" }}>
            <Box>
              <Typography fontWeight="bold">100+</Typography>
              <Typography fontSize="14px">Active Users</Typography>
            </Box>
            <Box>
              <Typography fontWeight="bold">500+</Typography>
              <Typography fontSize="14px">Products</Typography>
            </Box>
            <Box>
              <Typography fontWeight="bold">100+</Typography>
              <Typography fontSize="14px">Sellers</Typography>
            </Box>
            <Box>
              <Typography fontWeight="bold">50+</Typography>
              <Typography fontSize="14px">Delivery Partners</Typography>
            </Box>
          </Box>
        </Box>

        {/* RIGHT PHONE WITH ANIMATION */}
        <MobileImageContainer>
          <CrossImage src={Cross.src} alt="Cross decoration" />
          <MobileImage src={Mob.src} alt="App Preview" />
          <ImageOverlay>
            <StyledSlider {...settings}>
              {cardImages.map((card, index) => (
                <Box key={index}>
                  <img src={card.src} alt={card.alt} />
                </Box>
              ))}
            </StyledSlider>
          </ImageOverlay>
        </MobileImageContainer>
      </Wrapper>
    </CustomContainer>
  );
};

export default AppDownloadSection;
