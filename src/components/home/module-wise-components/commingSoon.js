import React from "react";
import { Box, Typography, Container, useMediaQuery, useTheme } from "@mui/material";

export default function ComingSoonPage() {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm")); // For mobile
    const isMd = useMediaQuery(theme.breakpoints.between("sm", "md")); // For tablet
    const isLg = useMediaQuery(theme.breakpoints.up("lg")); // For desktop

    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
                textAlign: "center",
                padding: isXs ? 2 : isMd ? 4 : 6,
            }}
        >
            {/* Main Heading */}
            <Typography
                variant={isLg ? "h2" : isMd ? "h3" : "h4"}
                color="primary"
                sx={{ fontWeight: 700, mb: 2, mt: 40 }}
            >
                Coming Soon
            </Typography>

            {/* Sub Heading */}
            <Typography
                variant={isLg ? "h6" : "body1"}
                color="textSecondary"
                sx={{ marginBottom: 4 }}
            >
                We are working hard to bring you something amazing. Stay tuned!
            </Typography>

            {/* Image or Illustration */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "400px",
                    mb: 4,
                    background: `url('https://via.placeholder.com/400') no-repeat center center`,
                    backgroundSize: "cover",
                    height: isLg ? "400px" : isMd ? "300px" : "200px",
                }}
            />

            {/* Footer
            <Box sx={{ marginTop: 4 }}>
                <Typography variant="body2" color="textSecondary">
                    © {new Date().getFullYear()} Your Company. All rights reserved.
                </Typography>
            </Box> */}
        </Container>
    );
}
