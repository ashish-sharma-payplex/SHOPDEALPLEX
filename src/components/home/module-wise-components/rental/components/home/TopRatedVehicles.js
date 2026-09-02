"use client";

import { useState } from "react";
import {
	Box,
	Typography,
	Grid,
	Container,
	Link,
	CircularProgress,
	Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import CarCard from "components/home/module-wise-components/rental/components/global/CarCard";
import { useGetTopRatedVehicleLists } from "../../rental-api-manage/hooks/top-rated/useGetTopRatedVehicleLists";

const TopRatedVehicles = () => {
	const { t } = useTranslation();
	const router = useRouter();

	const { data: topRatedVehicles, isLoading, isError } =
		useGetTopRatedVehicleLists();

	const vehicles = topRatedVehicles?.vehicles || [];

	const handleViewAllClick = () => {
		router.push({
			pathname: "/rental/vehicle-search",
			query: { top_rated: 1 },
		});
	};

	return (
		<Container maxWidth="lg" sx={{ py: 6 }}>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 4,
				}}
			>
				<Typography variant="h5" sx={{ fontWeight: 600, color: "#3c4043" }}>
					{t("Top Rated Vehicles")}
				</Typography>

				<Link
					component="button"
					onClick={handleViewAllClick}
					underline="none"
					sx={{
						color: "#4caf50",
						fontWeight: 500,
						border: "none",
						background: "none",
						cursor: "pointer",
					}}
				>
					View All →
				</Link>
			</Box>

			{/* Loading */}
			{isLoading && (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress />
				</Box>
			)}

			{/* Error */}
			{isError && !isLoading && (
				<Alert severity="error">
					Failed to load top rated vehicles. Please try again.
				</Alert>
			)}

			{/* Empty */}
			{!isLoading && vehicles.length === 0 && !isError && (
				<Alert severity="info">No top rated vehicles found.</Alert>
			)}

			{/* Vehicles Grid */}
			<Grid container spacing={3}>
				{vehicles.map((item) => (
					<Grid item xs={12} sm={6} md={4} key={item.id}>
						<CarCard data={item} />
					</Grid>
				))}
			</Grid>
		</Container>
	);
};

export default TopRatedVehicles;
