import React, { useState, useEffect, useCallback } from "react";
import AddressReselect from "../header/top-navbar/address-reselect/AddressReselect";
import { Modal, Backdrop, Box } from "@mui/material";
import { toast } from "react-hot-toast";

/**
 * LocationModal component wraps AddressReselect to show a popup modal
 * asking the user for their location if no valid location is found in localStorage.
 * The modal will show only once per session.
 * The rest of the screen is locked (overlay) until the user adds the location.
 * Uses MUI Modal component with Backdrop for consistent backdrop handling like MapModal.js
 * Backdrop automatically disappears when a valid location is set.
 */
const LocationModal = () => {
  const [showModal, setShowModal] = useState(false);

  // Function to check if location is valid
  const isValidLocation = useCallback((loc) => {
    if (!loc || typeof loc !== "string") return false;
    return !loc.includes("0,0") && !loc.includes("lat:'0'") && !loc.includes("lan:'0'");
  }, []);

  // Function to check if a valid location exists
  const hasValidLocation = useCallback(() => {
    if (typeof window === "undefined") return false;
    const storedLocation = localStorage.getItem("location");
    return isValidLocation(storedLocation);
  }, [isValidLocation]);

  // Function to safely close modal
  const handleCloseModal = useCallback(() => {
    // Only close if valid location is found
    if (hasValidLocation()) {
      setShowModal(false);
    }
  }, [hasValidLocation]);

  // Monitor location changes and auto-close when valid location is set
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkLocation = () => {
        const storedLocation = localStorage.getItem("location");
        if (isValidLocation(storedLocation)) {
          setShowModal(false);
        }
      };

      // Check location on mount and when localStorage changes
      checkLocation();
      
      // Set up interval to check for location changes
      const interval = setInterval(checkLocation, 1000);
      
      // Also listen for storage events
      const handleStorageChange = (e) => {
        if (e.key === 'location') {
          checkLocation();
        }
      };
      
      // Listen for custom location update event
      const handleLocationUpdate = () => {
        checkLocation();
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('locationUpdated', handleLocationUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('locationUpdated', handleLocationUpdate);
      };
    }
  }, [isValidLocation]);

  useEffect(() => {
    // Delay showing modal and toast until after full page load event
    const handleLoad = () => {
      const sessionKey = "locationModalShown";
      const modalShown = sessionStorage.getItem(sessionKey);
      
      if (!hasValidLocation() && !modalShown) {
        setShowModal(true);
        sessionStorage.setItem(sessionKey, "true");
        toast("Please add your location to continue.", { icon: "⚠️" });
      }
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, [hasValidLocation]);

  const handleModalClose = (event, reason) => {
    // Completely prevent closing on backdrop click or escape key
    // Only allow closing when valid location is selected
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return;
    }
    
    // Check if valid location exists before allowing close
    if (hasValidLocation()) {
      setShowModal(false);
    }
  };

  return (
    <Modal
      open={showModal}
      onClose={handleModalClose}
      closeAfterTransition
      disableEscapeKeyDown
      disableBackdropClick
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: { zIndex: (theme) => theme.zIndex.modal - 1 }
      }}
    >
      <Box
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90vw", sm: "400px" },
          zIndex: 1400,
        }}
      >
        <AddressReselect
          location={typeof window !== "undefined" ? localStorage.getItem("location") : null}
          setOpenDrawer={handleCloseModal}
          forceSelection={true} // Force selection mode
        />
      </Box>
    </Modal>
  );
};

export default LocationModal;
