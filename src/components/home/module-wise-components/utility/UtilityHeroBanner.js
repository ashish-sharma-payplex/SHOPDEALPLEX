import React from "react";
import { Box, Typography, Button, useMediaQuery } from "@mui/material";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import GetAppIcon from "@mui/icons-material/GetApp";

const UtilityHeroBanner = ({ onViewServices, onDownload }) => {
    const isMobile = useMediaQuery("(max-width:600px)");
    const isTablet = useMediaQuery("(max-width:960px)");

    return (
        <Box
            sx={{
                width: "100%",
                position: "relative",
                overflow: "hidden",
                minHeight: { xs: "420px", sm: "480px", md: "520px" },
                display: "flex",
                alignItems: "center",
                bgcolor: "#ffffff",
            }}
        >
            {/* ── Left Background Strip ── */}
            {/* ── Left Background Strip ── */}
            <Box
                component="img"
                src="/utility/leftbgstrip.svg"
                alt=""
                sx={{
                    position: "absolute",
                    top: { xs: "-40px", sm: "-60px", md: "-80px" }, // ← yeh change karo
                    left: "45px",
                    height: "100%",
                    width: { xs: "55%", sm: "50%", md: "38%" },
                    objectFit: "contain",
                    objectPosition: "left center",
                    zIndex: 0,
                    pointerEvents: "none",
                }}
            />

            {/* ── Right Background Strip ── */}
            <Box
                component="img"
                src="/utility/rightbgstrip.svg"
                alt=""
                sx={{
                    position: "absolute",
                    right: "60px",
                    top: 0,
                    height: "100%",
                    width: { xs: "55%", sm: "55%", md: "43%" },
                    top: { xs: "-40px", sm: "-60px", md: "-43px" },
                    objectFit: "contain",
                    objectPosition: "right center",
                    zIndex: 0,
                    pointerEvents: "none",
                }}
            />

            {/* ── Main Content Row ── */}
            <Box
                sx={{
                    position: "relative",
                    zIndex: 2,
                    width: "100%",
                    maxWidth: "1280px",
                    mx: "auto",
                    px: { xs: 2, sm: 4, md: 6 },
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: { xs: 3, md: 0 },
                    py: { xs: 4, md: 0 },
                }}
            >
                {/* ── LEFT: Text Content ── */}
                <Box
                    sx={{
                        flex: "0 0 auto",
                        width: { xs: "100%", md: "46%" },
                        textAlign: { xs: "center", md: "left" },
                    }}
                >
                    {/* Smart Payments Tag */}
                    <Typography
                        sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "11px", sm: "12px" },
                            fontWeight: 600,
                            color: "#2e7d32",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            mb: 1.5,
                        }}
                    >
                        Smart Payments
                    </Typography>

                    {/* Main Heading */}
                    
                    <Typography
                        component="h1"
                        sx={{
                            fontFamily: "'Urbanist', sans-serif",
                            fontWeight: 700,
                            fontSize: { xs: "2rem", sm: "2.6rem", md: "3rem", lg: "3.2rem" },
                            lineHeight: 1.15,
                            color: "#0d1117",
                            mb: 1.5,
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                position: "relative",
                                display: "inline-block",
                                "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    bottom: "-6px",
                                    left: "-1%",
                                    width: "108%",
                                    height: { xs: "10px", md: "14px" },
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 18' preserveAspectRatio='none'%3E%3Cpath d='M0,13 C10,8 30,6 60,7 C100,8 150,5 200,6 C250,7 300,5 340,4 C360,3.5 375,3 385,2.5 C392,2 398,1.5 400,1 L400,10 C395,11 385,13 370,13.5 C350,14 300,15 250,14 C200,13 150,15 100,14 C70,13.5 40,15 10,16 Z' fill='%23f59e0b' opacity='0.95'/%3E%3Cpath d='M0,11 C30,9 80,7 140,8 C200,9 280,6 360,4 C375,3.5 390,2.5 400,1.5 L400,4 C385,5 360,6.5 300,8 C240,9.5 160,11 80,12 C50,12.5 20,13 0,13 Z' fill='%23fbbf24' opacity='0.4'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: "no-repeat",
                                    backgroundSize: "100% 100%",
                                    zIndex: -1,
                                },
                            }}
                        >
                            Recharge &amp; Pay Bills
                        </Box>
                        <br />
                        in Seconds
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.88rem", sm: "0.95rem", md: "1rem" },
                            color: "#4b5563",
                            lineHeight: 1.7,
                            mb: { xs: 3, md: 4 },
                            maxWidth: { xs: "100%", md: "420px" },
                            mx: { xs: "auto", md: 0 },
                        }}
                    >
                        From mobile and DTH to electricity and broadband — handle all your
                        payments quickly, safely, and without any hassle.
                    </Typography>

                    {/* Buttons */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 2,
                            alignItems: { xs: "center", md: "flex-start" },
                            justifyContent: { xs: "center", md: "flex-start" },
                        }}
                    >
                        <Button
                            variant="contained"
                            endIcon={<NorthEastIcon fontSize="small" />}
                            onClick={onViewServices}
                            sx={{
                                bgcolor: "#2e7d32",
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 600,
                                borderRadius: "8px",
                                textTransform: "none",
                                fontSize: { xs: "0.88rem", sm: "0.95rem" },
                                px: { xs: 3, sm: 3.5 },
                                py: 1.4,
                                width: { xs: "100%", sm: "auto" },
                                maxWidth: { xs: 280, sm: "none" },
                                boxShadow: "0 4px 14px rgba(46,125,50,0.3)",
                                "&:hover": {
                                    bgcolor: "#1b5e20",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 6px 20px rgba(46,125,50,0.4)",
                                },
                                transition: "all 0.2s ease",
                            }}
                        >
                            View all Services
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<GetAppIcon fontSize="small" />}
                            onClick={onDownload}
                            sx={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 600,
                                borderRadius: "8px",
                                textTransform: "none",
                                fontSize: { xs: "0.88rem", sm: "0.95rem" },
                                px: { xs: 3, sm: 3.5 },
                                py: 1.4,
                                width: { xs: "100%", sm: "auto" },
                                maxWidth: { xs: 280, sm: "none" },
                                borderColor: "#d1d5db",
                                color: "#0d1117",
                                "&:hover": {
                                    borderColor: "#9ca3af",
                                    backgroundColor: "#f9fafb",
                                    transform: "translateY(-1px)",
                                },
                                transition: "all 0.2s ease",
                            }}
                        >
                            Download Now
                        </Button>
                    </Box>
                </Box>

                {/* ── RIGHT: Phones Image ── */}
                {!isMobile && (
                    <Box
                        sx={{
                            flex: "0 0 auto",
                            width: { sm: "100%", md: "50%" },
                            display: "flex",
                            justifyContent: { sm: "center", md: "flex-end" },
                            alignItems: "center",
                            position: "relative",
                            mt: { sm: "40px", md: "60px" }
                        }}
                    >
                        <Box
                            component="img"
                            src="/utility/rightmobiles.svg"
                            alt="Recharge & Bill Payment App"
                            sx={{
                                width: "100%",
                                maxWidth: { sm: "420px", md: "520px", lg: "580px" },
                                objectFit: "contain",
                                display: "block",
                                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.12))",
                            }}
                        />
                    </Box>
                )}

                {/* Mobile — show phones below text but smaller */}
                {isMobile && (
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Box
                            component="img"
                            src="/utility/rightmobiles.svg"
                            alt="Recharge & Bill Payment App"
                            sx={{
                                width: "90%",
                                maxWidth: "320px",
                                objectFit: "contain",
                                filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.10))",
                            }}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default UtilityHeroBanner;