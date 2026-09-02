import React, { useEffect, useState } from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { alpha, Grid, Stack, Typography, useTheme } from "@mui/material";
import CustomDivider from "components/CustomDivider";
import RestaurantDetailsForm, { checkTaxiModule } from "components/store-resgistration/RestaurantDetailsForm";
import ValidationSchemaForRestaurant from "components/store-resgistration/ValidationSchemaForRestaurant";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import MapForRestaurantJoin from "components/store-resgistration/MapForRestaurantJoin";
import ImageSection from "components/store-resgistration/ImageSection";
import OwnerForm from "components/store-resgistration/OwnerForm";
import AccountInfo from "components/store-resgistration/AccountInfo";
import { useQuery } from "react-query";
import { GoogleApi } from "api-manage/hooks/react-query/googleApi";
import { useDispatch, useSelector } from "react-redux";
import { getZoneWiseModule } from "components/store-resgistration/helper";
import { setAllData } from "redux/slices/storeRegistrationData";
import { SaveButton } from "components/profile/basic-information/Profile.style";
import { useRouter } from "next/router";
import useGetModule from "api-manage/hooks/react-query/useGetModule";
import { toast } from "react-hot-toast";
import { formatPhoneNumber } from "utils/CustomFunctions";
import useGetZoneList from "api-manage/hooks/react-query/zone-list/zone-list";
import { all } from "axios";
export const generateInitialValues = (languages, allData) => {
	// console.log({ allData });

	const initialValues = {
		restaurant_name: {},
		restaurant_address: {},
		vat: allData?.vat || "",
		min_delivery_time: allData?.min_delivery_time || "",
		max_delivery_time: allData?.max_delivery_time || "",
		logo: allData?.logo ? allData?.logo : "",
		cover_photo: allData?.cover_photo ? allData?.cover_photo : "",
		f_name: allData?.f_name || "",
		l_name: allData?.l_name || "",
		phone: allData?.phone || "",
		email: allData?.email || "",
		password: allData?.password || "",
		confirm_password: allData?.confirm_password || "",
		lat: allData?.lat || "",
		lng: allData?.lng || "",
		zoneId: allData?.zoneId || "",
		module_id: allData?.module_id || "",
		delivery_time_type: allData?.delivery_time_type || "",
	pickup_zone_id: Array.isArray(allData?.pickup_zone_id) ? allData.pickup_zone_id : [],
	};

	// Set initial values for each language
	languages?.forEach((lang) => {
		initialValues.restaurant_name[lang.key] =
			allData?.restaurant_name?.[lang.key] || "";
		initialValues.restaurant_address[lang.key] =
			allData?.restaurant_address?.[lang.key] || "";
	});

	return initialValues;
};

const StoreRegistrationForm = ({ setActiveStep, setFormValues }) => {
	const router = useRouter();
	const theme = useTheme();
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { modules, configData } = useSelector((state) => state.configData);
	const [polygonPaths, setPolygonPaths] = useState([]);
	const [currentTab, setCurrentTab] = useState(0);
	const [selectedLanguage, setSelectedLanguage] = React.useState("en");
	const [selectedZone, setSelectedZone] = React.useState(null);
	const [inZone, setInZone] = React.useState(null);
	const { allData, activeStep } = useSelector((state) => state.storeRegData);
	const { data, refetch } = useGetModule();
	const initialValues = generateInitialValues(configData?.language, allData);


	const RestaurantJoinFormik = useFormik({
		initialValues,
		validationSchema: ValidationSchemaForRestaurant(),
		onSubmit: async (values, helpers) => {
			try {
				if (checkTaxiModule(values?.module_id, moduleOption)) {

					if (values?.pickup_zone_id?.length === 0) {
						toast.error(t("Please select a pick up zone"));
					} else {
						formSubmitOnSuccess(values);
					}
				} else {
					if (inZone) {
						formSubmitOnSuccess(values);
					} else {
						toast.error(t("Please select a zone"));
					}
				}

			} catch (err) { }
		},
	});
	let currentLatLng = undefined;
	if (typeof window !== "undefined") {
		currentLatLng = JSON.parse(
			window.localStorage.getItem("currentLatLng")
		);
	}
	const {
		data: zoneList,
		isLoading: zoneListLoading,

		refetch: zoneListRefetch,
	} = useGetZoneList();
	useEffect(() => {
		zoneListRefetch(); // Fetches data when the component mounts
	}, []);
	useEffect(() => {
		if (RestaurantJoinFormik?.values?.zoneId) {
			const filterZone = zoneList?.find(
				(item) => item?.id === RestaurantJoinFormik?.values?.zoneId
			);
			function convertGeoJSONToCoordinates(geoJSON) {
				const coords = geoJSON?.coordinates[0];
				return coords?.map((coord) => ({
					lat: coord[1],
					lng: coord[0],
				}));
			}
			const format = convertGeoJSONToCoordinates(filterZone?.coordinates);
			setPolygonPaths(format);
		}
	}, [RestaurantJoinFormik?.values?.zoneId, activeStep]);

	useEffect(() => {
		// Scroll to top when the component mounts
		window.scrollTo({
			top: 0,
			left: 0,
			behavior: "smooth",
		});
	}, []);
	const formSubmitOnSuccess = (values) => {
		setFormValues(values);

		dispatch(setActiveStep(1));
		window.scrollTo({
			top: 0,
			left: 0,
			behavior: "smooth",
		});
		dispatch(setAllData(values));

		//formSubmit(values)
	};

	const fNameHandler = (value) => {
		RestaurantJoinFormik.setFieldValue("f_name", value);
	};
	const restaurantNameHandler = (value) => {
		RestaurantJoinFormik.setFieldValue("restaurant_name", {
			...RestaurantJoinFormik.values.restaurant_name,
			[selectedLanguage]: value,
		});
	};
	const restaurantVatHandler = (value) => {
		RestaurantJoinFormik.setFieldValue("vat", value);
	};
	const restaurantAddressHandler = (value) => {
		RestaurantJoinFormik.setFieldValue("restaurant_address", {
			...RestaurantJoinFormik.values.restaurant_address,
			[selectedLanguage]: value,
		});
	};
	const minDeliveryTimeHandler = (value) => {
		RestaurantJoinFormik.setFieldValue("min_delivery_time", value);
	};
	const maxDeliveryTimeHandler = (value) => {
		if (RestaurantJoinFormik?.values?.min_delivery_time < value) {
			RestaurantJoinFormik.setFieldValue("max_delivery_time", value);
		} else
			toast.error(
				"Please enter max delivery time greater than min delivery time"
			);
	};
	const handleTimeTypeChangeHandler = (value) => {
		RestaurantJoinFormik.setFieldValue("delivery_time_type", value);
	};
	const lNameHandler = (value) => {
		RestaurantJoinFormik.setFieldValue("l_name", value);
	};
	const phoneHandler = (values) => {
		RestaurantJoinFormik.setFieldValue("phone", formatPhoneNumber(values));
	};
	const emailHandler = (value) => {
		RestaurantJoinFormik.setFieldValue("email", value);
	};
	const passwordHandler = (value) => {
		RestaurantJoinFormik.setFieldValue("password", value);
	};
	const singleFileUploadHandlerForImage = (value) => {
		RestaurantJoinFormik.setFieldValue(
			"logo",
			value.currentTarget.files[0]
		);
	};
	const imageOnchangeHandlerForImage = (value) => {
		RestaurantJoinFormik.setFieldValue("logo", value);
	};
	const singleFileUploadHandlerForCoverPhoto = (value) => {
		RestaurantJoinFormik.setFieldValue(
			"cover_photo",
			value.currentTarget.files[0]
		);
	};
	const imageOnchangeHandlerForCoverPhoto = (value) => {
		RestaurantJoinFormik.setFieldValue("cover_photo", value);
	};
	const zoneHandler = (value) => {
		//console.log("moduleHandler value:", value); // Log the actual value
		RestaurantJoinFormik.setFieldValue("zoneId", value);
	};
	const moduleHandler = (value) => {
		RestaurantJoinFormik.setFieldValue("module_id", value);
	};

const pickupZoneHandler = (value) => {
		if (Array.isArray(value)) {
			const pickupZoneId = value.map(item => item.value);
			RestaurantJoinFormik.setFieldValue("pickup_zone_id", pickupZoneId);
		} else {
			RestaurantJoinFormik.setFieldValue("pickup_zone_id", []);
		}
	};
	const handleLocation = (value) => {
		RestaurantJoinFormik.setFieldValue("lng", value?.lat);
		RestaurantJoinFormik.setFieldValue("lat", value?.lng);
	};



	const { data: zoneData } = useQuery(
		["zoneId"],
		async () =>
			GoogleApi.getZoneId(currentLatLng ?? configData?.default_location),
		{
			retry: 1,
		}
	);

	useEffect(() => {
		if (
			RestaurantJoinFormik?.values?.min_delivery_time &&
			RestaurantJoinFormik?.values?.max_delivery_time
		) {
			const timeout = setTimeout(() => {
				if (
					RestaurantJoinFormik.values.min_delivery_time >
					RestaurantJoinFormik.values.max_delivery_time
				) {
					toast.error(
						"Minimum delivery time should be less than maximum delivery time"
					);
				}
			}, 500); // delay in milliseconds (e.g., 1000ms = 1 second)

			return () => clearTimeout(timeout); // cleanup timeout when dependencies change
		}
	}, [
		RestaurantJoinFormik?.values?.max_delivery_time,
		RestaurantJoinFormik?.values?.min_delivery_time,
	]);

	let zoneOption = [];
	zoneList?.forEach((zone) => {
		let obj = {

			value: zone.id,
			label: zone.name,
		};
		zoneOption.push(obj);
	});

	let moduleOption = [];
	const zoneWiseModules = getZoneWiseModule(
		data,
		RestaurantJoinFormik?.values?.zoneId
	);

	if (zoneWiseModules?.length > 0) {
		zoneWiseModules.forEach((module) => {
			if (module.module_type !== "parcel") {
				moduleOption.push({
					label: module.module_name,
					value: module.id,
					type: module.module_type
				});
			}
		});
		// Check if moduleOption remains empty after filtering out "parcel"
		if (moduleOption.length === 0) {
			moduleOption.push({
				label: "No result found",
			});
		}
	} else {
		moduleOption.push({
			label: "No result found",
		});
	}



	let tabs = [];
	configData?.language?.forEach((lan) => {
		let obj = {
			name: lan?.key,
			value: lan?.value,
		};
		tabs?.push(obj);
	});
	const handleCurrentTab = (value, item) => {
		setSelectedLanguage(item?.name);
		setCurrentTab(value);
	};
	useEffect(() => {
		if (zoneData?.data?.zone_data && currentLatLng) {
			refetch();
		}
	}, [zoneData?.data?.zone_data]);
	useEffect(() => {
		if (!currentLatLng && zoneData?.data) {
			localStorage.setItem(
				"currentLatLng",
				JSON.stringify(configData?.default_location)
			);
			localStorage.setItem("zoneid", zoneData?.data?.zone_id);
		}
	}, [configData?.default_location, zoneData?.data]);
	return (

		<CustomStackFullWidth
			sx={{
				background: "rgb(255, 255, 255)",
				padding: "10px",
				border: "1px solid black",
				width: "100%",
				marginLeft: "10px",
				marginRight: "20px",
				marginTop: "20px",

			}}>
			<form noValidate onSubmit={RestaurantJoinFormik.handleSubmit}>
				<Stack
					sx={{
						backgroundColor: "linear-gradient(135deg, #F7E14A 0%,rgba(255, 145, 0, 0.96) 100%)",
						// backgroundColor: (theme) => alpha(theme.palette.neutral[400], 0.1),
						padding: "2rem",
						borderRadius: "8px",
						cursor: "pointer",
					}}
				>

					<Grid container spacing={3}>
						<Grid item xs={12} md={6}>
							<RestaurantDetailsForm sx={{
								marginRight: "60px",
							}}
								RestaurantJoinFormik={RestaurantJoinFormik}
								restaurantNameHandler={
									restaurantNameHandler
								}
								restaurantAddressHandler={
									restaurantAddressHandler
								}
								restaurantvatHandler={restaurantVatHandler}
								minDeliveryTimeHandler={
									minDeliveryTimeHandler
								}
								maxDeliveryTimeHandler={
									maxDeliveryTimeHandler
								}
								zoneOption={zoneOption}
								zoneHandler={zoneHandler}
								moduleHandler={moduleHandler}
								moduleOption={moduleOption}
								handleTimeTypeChangeHandler={
									handleTimeTypeChangeHandler
								}
								currentTab={currentTab}
								handleCurrentTab={handleCurrentTab}
								tabs={tabs}
								selectedLanguage={selectedLanguage}
								pickupZoneHandler={pickupZoneHandler}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<MapForRestaurantJoin
								RestaurantJoinFormik={
									RestaurantJoinFormik
								}
								zoneData={zoneData}
								polygonPaths={polygonPaths}
								inZoom="9"
								handleLocation={handleLocation}
								restaurantAddressHandler={
									restaurantAddressHandler
								}
								zoneId={
									RestaurantJoinFormik?.values?.zoneId
								}
								setInZone={setInZone}
							/>
							<ImageSection
								singleFileUploadHandlerForImage={
									singleFileUploadHandlerForImage
								}
								imageOnchangeHandlerForImage={
									imageOnchangeHandlerForImage
								}
								singleFileUploadHandlerForCoverPhoto={
									singleFileUploadHandlerForCoverPhoto
								}
								imageOnchangeHandlerForCoverPhoto={
									imageOnchangeHandlerForCoverPhoto
								}
								RestaurantJoinFormik={
									RestaurantJoinFormik
								}
							/>
						</Grid>
					</Grid>
				</Stack>

				<OwnerForm
					RestaurantJoinFormik={RestaurantJoinFormik}
					fNameHandler={fNameHandler}
					lNameHandler={lNameHandler}
					phoneHandler={phoneHandler}
				/>


				<AccountInfo
					RestaurantJoinFormik={RestaurantJoinFormik}
					emailHandler={emailHandler}
					passwordHandler={passwordHandler}
				/>
				<Grid item md={12} xs={12} mt="1rem" align="end">
					<SaveButton
						variant="contained"
						type="submit"
						sx={{
							px: 4,
							py: 1.5,
							backgroundColor: '#FF6600',
							color: 'white',
							borderRadius: '4px',
							cursor: 'pointer',

						}}
					>
						{t("Next")}
					</SaveButton>
				</Grid>
			</form>
		</CustomStackFullWidth>
	);
};

export default StoreRegistrationForm;
