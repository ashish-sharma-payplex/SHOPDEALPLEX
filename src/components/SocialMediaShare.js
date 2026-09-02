import React, { useState } from "react";
import { Modal, Box, Stack, Typography, IconButton } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import CopyAllIcon from "@mui/icons-material/CopyAll";

const SocialShareModal = ({ open, handleClose, currentUrl }) => {
  const [copyMessage, setCopyMessage] = useState(""); // State for copy message

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setCopyMessage("Link copied!"); // Set the message to be shown
        setTimeout(() => setCopyMessage(""), 2000); // Clear the message after 2 seconds
      })
      .catch(err => console.error("Error copying to clipboard: ", err));
  };

  const handleShare = (platform) => {
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(currentUrl)}`;
        break;
      case "instagram":
        shareUrl = `https://www.instagram.com/?url=${encodeURIComponent(currentUrl)}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, "_blank");
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        bgcolor: "white", p: 3, borderRadius: 2, boxShadow: 3, maxWidth: 400, width: '100%'
      }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          Link of the Restaurant
        </Typography>

        {/* Display Current URL with Copy Icon */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" sx={{ wordWrap: "break-word", maxWidth: "80%" }}>
            {currentUrl}
          </Typography>
          <IconButton onClick={handleCopy} sx={{ ml: 1 }}>
            <CopyAllIcon />
          </IconButton>
        </Box>

        {/* Display Copy Message with animation and theme-based color */}
        {copyMessage && (
          <Box sx={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            background: "rgba(0, 123, 255, 0.7)", // Change to your theme color
            color: "#fff", 
            borderRadius: "5px", padding: "12px 24px", fontSize: "16px", 
            zIndex: 10, animation: "fadeInOut 2s ease-out"
          }}>
            {copyMessage}
          </Box>
        )}

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
          {/* Social Media Icons */}
          <IconButton onClick={() => handleShare("facebook")}>
            <FacebookIcon sx={{ fontSize: 30, color: "#3b5998" }} />
          </IconButton>
          <IconButton onClick={() => handleShare("twitter")}>
            <TwitterIcon sx={{ fontSize: 30, color: "#00acee" }} />
          </IconButton>
          <IconButton onClick={() => handleShare("whatsapp")}>
            <WhatsAppIcon sx={{ fontSize: 30, color: "#25d366" }} />
          </IconButton>
          <IconButton onClick={() => handleShare("instagram")}>
            <InstagramIcon sx={{ fontSize: 30, color: "#e4405f" }} />
          </IconButton>
        </Stack>
      </Box>
    </Modal>
  );
};

export default SocialShareModal;
