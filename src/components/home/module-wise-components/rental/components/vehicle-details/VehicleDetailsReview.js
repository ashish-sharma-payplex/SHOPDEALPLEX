// src/components/module-wise-components/rental/components/vehicle-details/VehicleDetailsReview.js

import React from "react";
import RentalCardWrapper from "../global/RentalCardWrapper";
import { Box } from "@mui/material";
import DetailsAndReviews from "components/product-details/details-and-reviews/DetailsAndReviews";

/**
 * Simple wrapper for DetailsAndReviews
 * Keeps same props shape as original.
 */
const VehicleDetailsReview = ({ vehicleDetails }) => {
  return (
    <Box sx={{ mt: "40px" }}>
      {/* <DetailsAndReviews
        description={vehicleDetails?.description}
        reviews={vehicleDetails?.reviews}
        productId={vehicleDetails?.id}
        showBackground={false}
        tabsData={["Vehicle Details", "Reviews"]}
      /> */}
    </Box>
  );
};

export default VehicleDetailsReview;
