import React, { useEffect, useState } from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { alpha, Grid, InputAdornment, useTheme, Box, Typography } from "@mui/material";
import CustomTextFieldWithFormik from "../form-fields/CustomTextFieldWithFormik";
import { useTranslation } from "react-i18next";
import WorkIcon from "@mui/icons-material/Work";
import RoomIcon from "@mui/icons-material/Room";
import CustomSelectWithFormik from "components/custom-select/CustomSelectWithFormik";
import PaidIcon from "@mui/icons-material/Paid";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useSelector } from "react-redux";
import CustomMultiSelect from "components/custom-multi-select/CustomMultiSelect";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export const checkTaxiModule = (value, moduleOption) => {
	const moduleObj = moduleOption?.find(item => item.value === value);
	return moduleObj?.type === "rental";
}

const RestaurantDetailsForm = ({
	RestaurantJoinFormik,
	restaurantNameHandler,
	restaurantAddressHandler,
	restaurantvatHandler,
	zoneOption,
	zoneHandler,
	moduleHandler,
	moduleOption,
	handleTimeTypeChangeHandler,
	currentTab,
	handleCurrentTab,
	tabs,
	selectedLanguage,
	minDeliveryTimeHandler,
	maxDeliveryTimeHandler,
	pickupZoneHandler,
}) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const [address, setAddress] = React.useState("");
	const timeType = [
		{ label: "Minute", value: "minute" },
		{ label: "Hour", value: "hour" },
		{ label: "Day", value: "day" },
	];
	useEffect(() => {
		setAddress(
			RestaurantJoinFormik.values.restaurant_address[selectedLanguage]
		);
	}, [RestaurantJoinFormik.values.restaurant_address[selectedLanguage]]);
	const { selectedModule } = useSelector((state) => state.utilsData);
	const [moduleType, SetModuleType] = useState("");
	useEffect(() => {
		SetModuleType(selectedModule?.module_type);
	}, [selectedModule]);

	return (
		<CustomStackFullWidth
			alignItems="center"
			sx={{
				backgroundColor: "rgb(255, 255, 255)",  // Light background color from the image
				borderRadius: "8px",
				p: 2,
			}}
		>
			<Grid container spacing={{ xs: "0", md: "3" }}>
				<CustomStackFullWidth spacing={4}>
					{/* Adding the header styling similar to the image */}
					<Box sx={{
						width: '100%',
					}}>

						<Box sx={{
							display: 'flex',
							width: '100%',
							borderBottom: '1px solid #e0e0e0',
							pb: 1,
						}}>
							<Typography
								fontSize="18px"
								fontWeight="500"
								textAlign="left"
							>
								{t("Seller Information")}
							</Typography>
						</Box>
					</Box>

					<CustomStackFullWidth
						sx={{
							padding: { xs: "0px", md: "0px" },
							borderRadius: "10px",
							gap: "20px",
						}}
					>
						<Grid container spacing={3}>
							<Grid item xs={12}>
								<CustomTextFieldWithFormik
									backgroundColor="white" // White background from image
									required="true"
									type="text"
									label={t("Vendor Name")}
									placeholder={t("Vendor name")}
									value={
										RestaurantJoinFormik.values.restaurant_name[
										selectedLanguage
										]
									}
									touched={
										RestaurantJoinFormik.touched.restaurant_name
									}
									errors={
										RestaurantJoinFormik.errors.restaurant_name
									}
									onChangeHandler={restaurantNameHandler}
									fontSize="12px"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: '4px',
											backgroundColor: 'white',
											border: '1px solid rgb(253, 122, 0)',
										},
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: ' rgb(253, 122, 0)',
										},
										'& .MuiFormLabel-root': {
											color: ' rgb(253, 122, 0)',
											fontWeight: 'medium',
										},
									}}
									startIcon={
										<InputAdornment position="start">
											<WorkIcon
												sx={{
													color: "rgb(253, 122, 0)",
													fontSize: "18px",
												}}
											/>
										</InputAdornment>
									}
								/>
							</Grid>
							<Grid item xs={12} sm={12} md={12}>
								<CustomTextFieldWithFormik
									backgroundColor="white"
									placeholder={t("Vendor address")}
									required="true"
									type="text"
									label={t("Vendor Address")}
									touched={
										RestaurantJoinFormik.touched
											.restaurant_address
									}
									errors={
										RestaurantJoinFormik.errors
											.restaurant_address
									}
									value={
										RestaurantJoinFormik.values
											.restaurant_address[selectedLanguage]
									}
									onChangeHandler={restaurantAddressHandler}
									fontSize="12px"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: '4px',
											backgroundColor: 'white',
											border: '1px solid rgb(0, 0, 0)',
										},
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: '#E0E0E0',
										},
										'& .MuiFormLabel-root': {
											color: '#424242',
											fontWeight: 'medium',
										},
									}}
									startIcon={
										<InputAdornment position="start">
											<RoomIcon
												sx={{
													color: "rgb(253, 122, 0)",
													fontSize: "18px",
												}}
											/>
										</InputAdornment>
									}
								/>
							</Grid>
						</Grid>

						<CustomStackFullWidth gap={{ xs: "20px", md: "30px" }}>
							<Grid item xs={12} sm={12} md={12}>
								<CustomSelectWithFormik
									selectFieldData={zoneOption}
									inputLabel={t("Business Zone")}
									passSelectedValue={zoneHandler}
									touched={RestaurantJoinFormik.touched.zoneId}
									errors={RestaurantJoinFormik.errors.zoneId}
									fieldProps={RestaurantJoinFormik.getFieldProps(
										"zoneId"
									)}
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: '4px',
											backgroundColor: 'white',
											border: '1px solid #E0E0E0',
										},
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: '#E0E0E0',
										},
										'& .MuiFormLabel-root': {
											color: '#424242',
											fontWeight: 'medium',
										},
									}}
									startIcon={
										<RoomIcon
											sx={{
												color: "rgb(253, 122, 0)",
												fontSize: "18px",
											}}
										/>
									}
								/>
							</Grid>

							{RestaurantJoinFormik.values.zoneId && (
								<Grid item xs={12} sm={12} md={12}>
									<CustomSelectWithFormik
										selectFieldData={moduleOption}
										inputLabel={t("Business Module")}
										passSelectedValue={moduleHandler}
										touched={
											RestaurantJoinFormik.touched.module_id
										}
										errors={
											RestaurantJoinFormik.errors.module_id
										}
										fieldProps={RestaurantJoinFormik.getFieldProps(
											"module_id"
										)}
										sx={{
											'& .MuiOutlinedInput-root': {
												borderRadius: '4px',
												backgroundColor: 'white',
												border: '1px solid rgb(0, 0, 0)',
											},
											'& .MuiOutlinedInput-notchedOutline': {
												borderColor: 'rg(0,0,0)',
											},
											'& .MuiFormLabel-root': {
												color: 'rgb(0,0,0)',
												fontWeight: 'medium',
											},
										}}
										startIcon={
											<RoomIcon
												sx={{
													color: "rgb(253, 122, 0)",
													fontSize: "18px",
												}}
											/>
										}
									/>
								</Grid>
							)}
							{checkTaxiModule(RestaurantJoinFormik?.values?.module_id, moduleOption) && (
								<Grid item xs={8} sm={6} md={4}>
									<CustomMultiSelect
										zoneOption={zoneOption}
										label="Pickup Area"
										placeholder={RestaurantJoinFormik.values.pickup_zone_id.length < 1
											? "Select Pickup Area"
											: ""}
										handleChange={pickupZoneHandler}
										icon={
											<LocationOnIcon
												sx={{
													color: "rgb(253, 122, 0)",
													fontSize: "16px",
												}}
											/>
										}
										sx={{
											'& .MuiOutlinedInput-root': {
												borderRadius: '4px',
												backgroundColor: 'white',
												border: '1px solid rgb(0, 0, 0)',
											},
											'& .MuiOutlinedInput-notchedOutline': {
												borderColor: '#E0E0E0',
											},
											'& .MuiFormLabel-root': {
												color: '#424242',
												fontWeight: 'medium',
											},
										}}
									/>
								</Grid>
							)}

							<Grid item xs={12} sm={12} md={12}>
								<CustomTextFieldWithFormik
									required="true"
									type="number"
									label={t("GST")}
									placeholder={t("GST")}
									maxLength={100}
									touched={RestaurantJoinFormik.touched.vat}
									errors={RestaurantJoinFormik.errors.vat}
									fieldProps={RestaurantJoinFormik.getFieldProps(
										"vat"
									)}
									onChangeHandler={restaurantNameHandler}
									value={RestaurantJoinFormik.values.vat}
									fontSize="12px"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: '4px',
											backgroundColor: 'white',
											border: '1px solid #E0E0E0',
										},
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: '#E0E0E0',
										},
										'& .MuiFormLabel-root': {
											color: '#424242',
											fontWeight: 'medium',
										},
									}}
									startIcon={
										<InputAdornment position="start">
											<PaidIcon
												sx={{
													color: "rgb(253, 122, 0)",
													fontSize: "18px",
												}}
											/>
										</InputAdornment>
									}
								/>
							</Grid>
							<Grid
								container
								spacing={2}
							>
								<Grid item md={4} xs={12}>
									<CustomTextFieldWithFormik
										placeholder={checkTaxiModule(RestaurantJoinFormik?.values?.module_id, moduleOption) ? t("Min Pickup Time") : t("Min Delivery Time")}
										required="true"
										type="number"
										name="min_delivery_time"
										label={checkTaxiModule(RestaurantJoinFormik?.values?.module_id, moduleOption) ? t("Minimum Pickup Time") : t("Minimum Delivery Time")}
										touched={
											RestaurantJoinFormik.touched
												.min_delivery_time
										}
										errors={
											RestaurantJoinFormik.errors
												.min_delivery_time
										}
										fieldProps={RestaurantJoinFormik.getFieldProps(
											"min_delivery_time"
										)}
										onChangeHandler={minDeliveryTimeHandler}
										value={
											RestaurantJoinFormik.values
												.min_delivery_time
										}
										fontSize="12px"
										sx={{
											'& .MuiOutlinedInput-root': {
												borderRadius: '4px',
												backgroundColor: 'white',
												border: '1px solid #E0E0E0',
											},
											'& .MuiOutlinedInput-notchedOutline': {
												borderColor: '#E0E0E0',
											},
											'& .MuiFormLabel-root': {
												color: '#424242',
												fontWeight: 'medium',
											},
										}}
										startIcon={
											<InputAdornment position="start">
												<LocalShippingIcon
													sx={{
														color: "rgb(253, 122, 0)",
														fontSize: "18px",
													}}
												/>
											</InputAdornment>
										}
									/>
								</Grid>
								<Grid item md={4} xs={12}>
									<CustomTextFieldWithFormik
										placeholder={checkTaxiModule(RestaurantJoinFormik?.values?.module_id, moduleOption) ? t("Max Pickup Time") : t("Max Delivery Time")}
										required="true"
										type="number"
										name="max_delivery_time"
										label={checkTaxiModule(RestaurantJoinFormik?.values?.module_id, moduleOption) ? t("Maximum Pickup Time") : t("Maximum Delivery Time")}
										touched={
											RestaurantJoinFormik.touched
												.max_delivery_time
										}
										errors={
											RestaurantJoinFormik.errors
												.max_delivery_time
										}
										fieldProps={RestaurantJoinFormik.getFieldProps(
											"max_delivery_time"
										)}
										onChangeHandler={maxDeliveryTimeHandler}
										value={
											RestaurantJoinFormik.values
												.max_delivery_time
										}
										fontSize="12px"
										sx={{
											'& .MuiOutlinedInput-root': {
												borderRadius: '4px',
												backgroundColor: 'white',
												border: '1px solid #E0E0E0',
											},
											'& .MuiOutlinedInput-notchedOutline': {
												borderColor: '#E0E0E0',
											},
											'& .MuiFormLabel-root': {
												color: '#424242',
												fontWeight: 'medium',
											},
										}}
										startIcon={
											<InputAdornment position="start">
												<LocalShippingIcon
													sx={{
														color: "rgb(253, 122, 0)",
														fontSize: "18px",
													}}
												/>
											</InputAdornment>
										}
									/>
								</Grid>
								<Grid item xs={12} sm={12} md={4}>
									<CustomSelectWithFormik
										selectFieldData={timeType}
										inputLabel={t("Duration type")}
										passSelectedValue={
											handleTimeTypeChangeHandler
										}
										touched={
											RestaurantJoinFormik.touched
												.delivery_time_type
										}
										errors={
											RestaurantJoinFormik.errors
												.delivery_time_type
										}
										fieldProps={RestaurantJoinFormik.getFieldProps(
											"delivery_time_type"
										)}
										sx={{
											'& .MuiOutlinedInput-root': {
												borderRadius: '4px',
												backgroundColor: 'white',
												border: '1px solid #E0E0E0',
											},
											'& .MuiOutlinedInput-notchedOutline': {
												borderColor: '#E0E0E0',
											},
											'& .MuiFormLabel-root': {
												color: '#424242',
												fontWeight: 'medium',
											},
										}}
									/>
								</Grid>
							</Grid>
						</CustomStackFullWidth>

						{/* Add the bottom note styling and button styling */}
						<Typography variant="body2" sx={{ color: 'rgb(0,0,0)', mt: 2, mb: 4 }}>
							In order to process your registration, we ask you to provide the following information. Please note that all fields marked with an asterisk (*) are required.
						</Typography>

					</CustomStackFullWidth>
				</CustomStackFullWidth>
			</Grid>
		</CustomStackFullWidth>
	);
};
export default RestaurantDetailsForm;