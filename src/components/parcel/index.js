import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import ParcelHero from "./ParcelHero";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import ParcelCategory from "./parcel-category/ParcelCategory";
import TopBanner from "../home/top-banner";
import SearchWithTitle from "../home/SearchWithTitle";
import CustomContainer from "../container";
import { useRouter } from "next/router";

const PercelComponents = () => {
  const router = useRouter();
  const page = router.query.page;
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalImages, setTotalImages] = useState(0);

  useEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Additional scroll to top after a delay to ensure component is fully rendered
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);

    // One more scroll to top after component is fully loaded
    const finalTimeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(finalTimeoutId);
    };
  }, [page]);

  useEffect(() => {
    const checkImages = () => {
      const images = document.querySelectorAll('img');
      const total = images.length;

      if (total === 0) {
        setImagesLoaded(true);
        return;
      }

      setTotalImages(total);
      let loaded = 0;

      const handleLoad = () => {
        loaded += 1;
        setLoadedCount(loaded);
        if (loaded === total) {
          setImagesLoaded(true);
        }
      };

      const handleError = () => {
        loaded += 1;
        setLoadedCount(loaded);
        if (loaded === total) {
          setImagesLoaded(true);
        }
      };

      images.forEach(img => {
        if (img.complete) {
          handleLoad();
        } else {
          img.addEventListener('load', handleLoad);
          img.addEventListener('error', handleError);
        }
      });

      return () => {
        images.forEach(img => {
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
        });
      };
    };

    // Check images after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(checkImages, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  let zoneid = undefined;
  if (typeof window !== "undefined") {
    zoneid = localStorage.getItem("zoneid");
  }
  let token = undefined;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  if (!imagesLoaded) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          width: '100%',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          margin: '20px 0'
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ color: '#1976d2', mb: 2 }}
        />
        <Typography variant="h6" color="primary" gutterBottom>
          Loading Parcel Items...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalImages > 0 ? `${Math.round((loadedCount / totalImages) * 100)}% Complete` : 'Preparing your parcel experience...'}
        </Typography>
      </Box>
    );
  }

  return (
    <CustomStackFullWidth>
      <CustomStackFullWidth sx={{ position: "relative" }}>
        <TopBanner />
        <CustomStackFullWidth
          alignItems="center"
          justifyContent="center"
          sx={{
            position: "absolute", 
            top: 0,
            height: "100%",
          }}
        >
          <SearchWithTitle zoneid={zoneid} token={token} />
        </CustomStackFullWidth>
        <ParcelHero />
      </CustomStackFullWidth>
      <CustomContainer>
        <ParcelCategory />
      </CustomContainer>
    </CustomStackFullWidth>
  );
};

export default PercelComponents;
