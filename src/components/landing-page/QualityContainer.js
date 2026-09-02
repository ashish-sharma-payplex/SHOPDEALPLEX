import { styled, Typography, useTheme, useMediaQuery, Grid, Fade } from "@mui/material";
import { Box } from "@mui/system";
import CustomImageContainer from "../CustomImageContainer";
import DollarSignHighlighter from "../DollarSignHighlighter";
import CustomContainer from "../container";
import Reve from "./imgs/qua.gif";
import Food from "./imgs/grocery.gif";
import Fast from "./imgs/fast.gif";
import { Shield, CleanHands, LocalShipping } from "@mui/icons-material";



const Card = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
    borderRadius: "15px",
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.1)",
    padding: theme.spacing(3),
    margin: theme.spacing(1),
    width: "100%",
    maxWidth: "280px",
    minHeight: "200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    transition: 'all 0.4s ease',
    '&:hover': {
        transform: 'scale(1.05) translateY(-5px)',
        background: 'linear-gradient(135deg, rgba(255, 145, 0, 0.96) 0%, rgba(255, 165, 0, 0.9) 100%)',
        color: theme.palette.primary.contrastText,
        boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.25)',
        '& .MuiTypography-root': {
            color: theme.palette.primary.contrastText
        }
    }
}));

const QualityCard = ({ title, content, img, icon }) => (
    <Card>
        <CustomImageContainer
            src={img}
            alt={title}
            width="60px"
            height="60px"
            borderRadius="50%"
            margin="auto"
            objectFit="cover"
        />
        <Box display="flex" alignItems="center" justifyContent="center" mt="10px">
            {icon}
            <Typography variant="h6" fontWeight="600" ml={1}>
                {title}
            </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" mt={1}>
            {content}
        </Typography>
    </Card>
);

const QualityContainer = ({ isSmall, landingPageData }) => {
    const theme = useTheme();

    const staticQualities = [
        {
            title: "Food Safety",
            content: "Prepared with Care, Served with Confidence.",
            img: Reve.src,
            // icon: <Shield color="primary" />,
        },
        {
            title: "Hygiene",
            content: "Clean Hands, Clean Kitchens, Clean Conscience.",
            img: Food.src,
            // icon: <CleanHands color="primary" />,
        },
        {
            title: "Fast Delivery",
            content: "Hot & Fresh, Right on Time.",
            img: Fast.src,
            // icon: <LocalShipping color="primary" />,
        },
    ];

    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));  // Detect medium screens (1024px)

    return (
        <CustomContainer sx={{ position: "relative", marginTop: "20px" }}>
            {/* Heading Section */}
            <Typography
                variant="h5"
                fontWeight="bold"
                textAlign="center"
                sx={{
                    opacity: ".9",
                    color: "#d72a00",
                    marginBottom: "20px",
                    marginTop: "20px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                }}
            >
                <DollarSignHighlighter theme={theme} text="Quality You Can Trust" />
            </Typography>

            <Box sx={{ position: "relative", padding: isMediumScreen ? "0" : "2%" }}>
                {/* Corner Images */}
                {/* <ImageContainer
                    sx={{
                        top: isMediumScreen ? "50%" : "70%",
                        left: isMediumScreen ? "70%" : "85%",
                        width: isMediumScreen ? "120px" : "200px",
                        height: isMediumScreen ? "120px" : "200px",
                    }}
                >
                    <CustomImageContainer
                        src={Cherry.src}
                        alt="Corner Image 1"
                        width="100%"
                        height="100%"
                        objectFit="cover"
                    />
                </ImageContainer>

                <ImageContainer
                    sx={{
                        top: isMediumScreen ? "50%" : "70%",
                        right: isMediumScreen ? "10%" : "20%",
                        width: isMediumScreen ? "160px" : "300px",
                        height: isMediumScreen ? "120px" : "200px",
                    }}
                >
                    <CustomImageContainer
                        src={Gobi.src}
                        alt="Corner Image 2"
                        width="100%"
                        height="100%"
                        objectFit="cover"
                    />
                </ImageContainer>

                <ImageContainer
                    sx={{
                        bottom: isMediumScreen ? "-10px" : "-20px",
                        left: isMediumScreen ? "70%" : "85%",
                        width: isMediumScreen ? "120px" : "200px",
                        height: isMediumScreen ? "120px" : "200px",
                    }}
                >
                    <CustomImageContainer
                        src={Palak.src}
                        alt="Corner Image 3"
                        width="100%"
                        height="100%"
                        objectFit="cover"
                    />
                </ImageContainer>

                <ImageContainer
                    sx={{
                        bottom: isMediumScreen ? "-10px" : "-20px",
                        right: isMediumScreen ? "10%" : "-20px",
                        width: isMediumScreen ? "120px" : "200px",
                        height: isMediumScreen ? "120px" : "200px",
                    }}
                >
                    <CustomImageContainer
                        src={Apple.src}
                        alt="Corner Image 4"
                        width="100%"
                        height="100%"
                        objectFit="cover"
                    />
                </ImageContainer> */}

                {/* Responsive Grid Layout for Cards */}
                <Grid container spacing={3} justifyContent="center" sx={{
                    background: 'linear-gradient(135deg, rgba(245, 245, 245, 0.5) 0%, rgba(255, 255, 255, 0.5) 100%)',
                    borderRadius: '20px',
                    padding: '20px',
                    margin: '20px 0',
                }}>
                    {staticQualities.map((quality, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Fade in={true} timeout={500 + index * 200}>
                                <div>
                                    <QualityCard
                                        title={quality.title}
                                        content={quality.content}
                                        img={quality.img}
                                        icon={quality.icon}
                                    />
                                </div>
                            </Fade>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </CustomContainer>
    );
};

export default QualityContainer;
