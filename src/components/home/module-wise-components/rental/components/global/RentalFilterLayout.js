import React, { useEffect, useRef } from "react";
import RentalCarFilterSection from "../rentalfilter/RentalCarFilterSection";
import CustomContainer from "components/container";
import { Box } from "@mui/material";
import { useRouter } from "next/router";

const RentalFilterLayout = ({ isSticky, topContent, api_endpoint }) => {
  const router = useRouter();
  const sectionRef = useRef(null);
  const categoryId = router.query?.categoryId || null;
  const allCategory = router.query?.all_category || null;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      {topContent}
      <Box ref={sectionRef} />
      <CustomContainer>
        <RentalCarFilterSection
          isSticky={isSticky}
          api_endpoint={api_endpoint}
          categoryId={categoryId}
          allCategory={allCategory}
        />
      </CustomContainer>
    </Box>
  );
};

export default RentalFilterLayout;
