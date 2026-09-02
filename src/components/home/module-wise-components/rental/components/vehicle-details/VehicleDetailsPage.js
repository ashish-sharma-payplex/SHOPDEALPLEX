// src/components/module-wise-components/rental/components/vehicle-details/VehicleDetailsPage.js

import { Grid, Box } from "@mui/material";
import CustomContainer from "components/container";
import VehicleDetailsReview from "./VehicleDetailsReview";
import VehicleDetailsTopSection from "./VehicleDetailsTopSection";
import { useRouter } from "next/router";
import { useGetVehicleDetails } from "../../rental-api-manage/hooks/react-query/details/useGetVehicleDetails";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Stack } from "@mui/system";
import useScrollToTop from "api-manage/hooks/custom-hooks/useScrollToTop";

const VehicleDetailsPage = () => {
	useScrollToTop();
	const router = useRouter();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const { id, from } = router.query;
	const { cartList } = useSelector((state) => state.cart);
	const rentalSearch = useSelector((state) => state?.rentalSearch?.rentalSearch);
	const [selectedPricing, setSelectedPricing] = useState("hourly");
	const [typeWisePrice, setTypeWisePrice] = useState(null);

	const { data: vehicleDetails } = useGetVehicleDetails(id);

	const handleSelect = (type) => {
		if (!rentalSearch?.tripType) {
			setSelectedPricing(type);
			setTypeWisePrice(
				type === "distance_wise"
					? vehicleDetails?.distance_price
					: vehicleDetails?.hourly_price
			);
		}
	};

	const isProductExist = () =>
		cartList?.carts?.find((item) => item.vehicle?.id === vehicleDetails?.id);

	useEffect(() => {
		if (vehicleDetails) {
			if (isProductExist()) {
				const rentalType = cartList?.user_data?.rental_type;
				setSelectedPricing(rentalType);
				setTypeWisePrice(
					rentalType === "hourly"
						? vehicleDetails?.hourly_price
						: vehicleDetails?.distance_price
				);
			} else if (rentalSearch) {
				setSelectedPricing(rentalSearch?.tripType);
			} else {
				setSelectedPricing(null);
			}
		}
	}, [rentalSearch?.tripType, cartList, from, vehicleDetails]);

	if (!vehicleDetails) return null;

	return (
		<CustomContainer>

			{/* TRUE CENTERED PAGE WRAPPER */}
			<Box
				sx={{
					maxWidth: "1200px",
					margin: "0 auto",
					paddingX: { xs: "12px", md: "20px" },
				}}
			>

				<Grid container spacing={3} sx={{ mt: { xs: "10px", md: "24px" } }}>

					<Grid item xs={12}>
						<Stack spacing={3}>
							
							{/* TOP SECTION */}
							<VehicleDetailsTopSection
								vehicleDetails={vehicleDetails}
								handleSelect={handleSelect}
								selectedPricing={selectedPricing}
								tripHours={rentalSearch?.duration}
								typeWisePrice={typeWisePrice}
								userData={cartList?.carts?.length > 0 && cartList?.user_data}
								from={from}
							/>

							{/* DETAILS + REVIEWS */}
							<VehicleDetailsReview
								vehicleDetails={vehicleDetails}
								borderRadius="10px"
							/>

						</Stack>
					</Grid>

				</Grid>

			</Box>

		</CustomContainer>
	);
};

export default VehicleDetailsPage;
