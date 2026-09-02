import CustomContainer from "components/container";
import { Box, Stack } from "@mui/system";
import { alpha, Button, Radio, Select, Typography, useTheme } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import DateTimePicker from "components/home/module-wise-components/rental/components/global/DateTimePicker";
import React, { useEffect, useRef, useState } from "react";
import { CustomTextField } from "styled-components/CustomStyles.style";
import RentalSearchLocation from "components/home/module-wise-components/rental/components/global/search/RentalSearchLocation";
import useGetAutocompletePlace from "api-manage/hooks/react-query/google-api/usePlaceAutoComplete";
import { useDispatch, useSelector } from "react-redux";
import useGetPlaceDetails from "api-manage/hooks/react-query/google-api/useGetPlaceDetails";
import { useRouter } from "next/router";
import { setRentalSearch } from "redux/slices/rentalSearch";
import useGetDistance from "api-manage/hooks/react-query/google-api/useGetDistance";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { usePathname } from "next/navigation";
import dayjs from "dayjs";
import { t } from "i18next";
import { toast, Toaster } from "react-hot-toast";
import { updateDestinationLocations } from "components/home/module-wise-components/rental/components/utils/bookingHepler";
import MapModal from "components/Map/MapModal";

const TaxiSearchPanel = ({
	isSticky,
	height,
	position,
	mt,
	top = "auto",
	bottom = 0,
	showSearch = true,
}) => {
	const theme = useTheme();
	const router = useRouter();
	const pathname = usePathname();
	const dispatch = useDispatch();
	const mode = "driving";
	const [openMap, setOpenMap] = useState(false);
	const { configData } = useSelector((state) => state.configData);
	const { rentalSearch } = useSelector((state) => state?.rentalSearch);
	const [open, setOpen] = useState(false);
	const [tripType, setTripType] = useState("distance_wise");
	const [duration, setDuration] = useState(rentalSearch?.duration || "");
	const [selectedDate, setSelectedDate] = useState(dayjs());
	const [locations, setLocations] = useState({
		...configData?.default_location,
	});
	const [searchKey, setSearchKey] = useState("");
	const [placeId, setPlaceId] = useState("");
	const [predictions, setPredictions] = useState([]);
	const [isFocused, setIsFocused] = useState(false);
	const [expand, setExpand] = useState(false);
	const [showArrowButton, setShowArrowButton] = useState(false);
	const [bothInfoOpen, setBothInfoOpen] = useState(false);
	const [searchConfirmOpen, setSearchConfirmOpen] = useState(false);
	const [destinationError, setDestinationError] = useState(""); // ✅ India validation error
	const formControlRef = useRef(null);
	const inputRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				formControlRef.current &&
				!formControlRef.current.contains(event.target)
			) {
				if (tripType === "hourly" || rentalSearch?.tripType === "hourly") {
					if (inputRef.current && !inputRef.current.contains(event.target)) {
						setOpen(false);
					}
				} else {
					if (tripType === "distance_wise" || tripType === "both") {
						setOpen(false);
					}
				}
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [tripType]);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 100) {
				setShowArrowButton(true);
			} else {
				setShowArrowButton(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const pickup_location =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("currentLatLng"))
			: null;
	const location_name =
		typeof window !== "undefined"
			? window.localStorage.getItem("location")
			: false;

	const { data: places } = useGetAutocompletePlace(searchKey, !!searchKey);
	const { data: placeDetails } = useGetPlaceDetails(placeId, !!placeId);
	const { data: distanceData, refetch } = useGetDistance(
		pickup_location,
		locations,
		mode
	);

	useEffect(() => {
		if (places) setPredictions(places.predictions);
	}, [places]);

	// ✅ India validation added
	useEffect(() => {
		if (!placeDetails?.result?.geometry?.location) return;

		const country = placeDetails.result.address_components?.find(
			(item) => item.types.includes("country")
		);

		if (country?.short_name !== "IN") {
			setDestinationError("Service is only available within India");
			return;
		}

		setDestinationError("");

		const lat = placeDetails.result.geometry.location.lat;
		const lng = placeDetails.result.geometry.location.lng;
		const address = placeDetails.result.formatted_address;

		setLocations({ lat, lng, location_name: address });

		dispatch(
			setRentalSearch({
				...rentalSearch,
				destination_location: { lat, lng, location_name: address },
			})
		);
	}, [placeDetails]);

	useEffect(() => {
		if (!pickup_location || !locations?.lat) return;
		refetch();
	}, [locations]);

	const handleLocationChange = (field, value) => {
		if (!value) return;
		setPlaceId(value.place_id);
		setSearchKey(value.description);
	};

	const handleSearchChange = (event) => {
		const value = event.target.value;

		if (value.length === 1 && value === " ") {
			toast.error("Destination cannot start with space");
			return;
		}

		if (!value.trim() && value.length > 0) {
			toast.error("Please enter a valid destination");
			return;
		}

		setDestinationError(""); // ✅ type karte waqt error clear
		setSearchKey(value);
	};

	useEffect(() => {
		if (!locations?.lat || !locations?.lng) return;
		dispatch(
			setRentalSearch({
				...rentalSearch,
				destination_location: locations,
			})
		);
	}, [locations]);

	useEffect(() => {
		if (
			rentalSearch?.distanceData?.destination_addresses &&
			router.pathname !== "/home"
		) {
			setSearchKey(rentalSearch.distanceData.destination_addresses[0]);
			setDuration(rentalSearch.duration);
		}
	}, [rentalSearch, router.pathname]);

	const handleFocus = () => {
		setIsFocused(true);
	};

	const handleDateChange = (newValue) => {
		setSelectedDate(newValue);
	};

	useEffect(() => {
		dispatch(setRentalSearch({ ...rentalSearch, selectedDate }));
	}, [selectedDate]);

	const handleTripTypeChange = (e) => {
		setTripType(e.target.value);
	};

	useEffect(() => {
		dispatch(setRentalSearch({ ...rentalSearch, tripType }));
	}, [tripType]);

	const handleOpen = () => setOpen(true);

	const handleDurationChange = (e) => {
		setDuration(e.target.value);
	};

	useEffect(() => {
		dispatch(setRentalSearch({ ...rentalSearch, duration }));
	}, [duration]);

	// ✅ Actual search logic
	const proceedSearch = () => {
		updateDestinationLocations(locations);

		dispatch(
			setRentalSearch({
				selectedDate,
				destination_location: {
					lat: locations.lat,
					lng: locations.lng,
					location_name: locations.location_name,
				},
				pickup_location: {
					lat: pickup_location?.lat,
					lng: pickup_location?.lng,
					location_name: location_name,
				},
				tripType,
				duration,
				distanceData,
			})
		);

		router.push({
			pathname: "/rental/vehicle-search",
			query: { from: "from_search" },
		});
	};

	// ✅ Search click — validations only, then popup
	const handleSearchClick = (event) => {

		// ✅ India validation check sabse pehle
		if (destinationError) {
			toast.error(destinationError);
			return;
		}

		if (/^\s+/.test(searchKey)) {
			toast.error("Destination cannot start with space. Please enter a valid address.");
			return;
		}

		if (!searchKey.trim()) {
			toast.error("Please add a valid destination address!");
			return;
		}

		if (/\s{4,}/.test(searchKey)) {
			toast.error("Please search a valid destination!");
			return;
		}

		if (!selectedDate) {
			toast.error("Please Select the Date!");
			return;
		}

		if (!tripType) {
			toast.error("Please Select a Trip Type!");
			return;
		}

		if (tripType === "hourly") {
			if (!duration || isNaN(duration) || Number(duration) <= 0) {
				toast.error(
					!duration
						? "Please Add Duration!"
						: isNaN(duration)
							? "Duration must be a valid number!"
							: "Please Add a Valid Duration!"
				);
				return;
			}
		}

		// ✅ Sab theek hai — confirm popup dikhao
		setSearchConfirmOpen(true);
	};

	useEffect(() => {
		if (router.pathname === "/home") {
			setTripType("distance_wise");
			setDuration("");
			dispatch(setRentalSearch(null));
		}
	}, [router.pathname]);

	const handleClick = (e, type) => {
		e.stopPropagation();
		if (type === "distance_wise") {
			setTripType("distance_wise");
			if (rentalSearch) {
				dispatch(setRentalSearch({ ...rentalSearch, tripType: "distance_wise" }));
			}
			setOpen(false);
		}
		if (type === "hourly") {
			setTripType("hourly");
			if (rentalSearch) {
				dispatch(setRentalSearch({ ...rentalSearch, tripType: "hourly" }));
			}
			setOpen(true);
		}
		if (type === "both") {
			setTripType("both");
			if (rentalSearch) {
				dispatch(setRentalSearch({ ...rentalSearch, tripType: "both" }));
			}
			setOpen(false);
			setBothInfoOpen(true);
		}
	};

	const pickLocationFormAddress = (value) => {
		setSearchKey(value?.address);
		setLocations({
			lat: value.latitude,
			lng: value.longitude,
			location_name: value?.address,
		});
	};

	const isSearchPage = router.pathname === "/vehicle-search";

	const handleLocation = (location, locationName) => {
		setLocations({
			lat: location.lat,
			lng: location.lng,
			location_name: locationName,
		});
	};

	return (
		<>
			<Toaster position="top-center" toastOptions={{
				style: {
					boxShadow: "none",
					WebkitBoxShadow: "none",
					MozBoxShadow: "none",
				},
			}} />

			<CustomContainer sx={{ position: "relative" }}>
				{pathname !== "/home" && showArrowButton && (
					<Box
						sx={{
							position: "absolute",
							width: "100%",
							display: { xs: "flex", sm: "none" },
							justifyContent: "center",
							textAlign: "center",
							bottom: "-38px",
							left: "50%",
							zIndex: 1000,
							transform: "translate(-50%, -50%)",
						}}
					>
						<Button
							onClick={() => setExpand(!expand)}
							variant="contained"
							sx={{
								"&:hover": { backgroundColor: theme.palette.background.paper },
								backgroundColor: theme.palette.background.paper,
								borderRadius: "50%",
								width: "34px",
								height: "34px",
								minWidth: "unset",
								padding: 0,
							}}
						>
							<KeyboardArrowDownIcon
								sx={{
									color: theme.palette.primary.main,
									transform: expand ? "rotate(180deg)" : "rotate(0deg)",
								}}
							/>
						</Button>
					</Box>
				)}

				<Box
					p={"15px"}
					sx={{
						width: "100%",
						mt: mt,
						height: height,
						position: position,
						top: top,
						zIndex: 50,
						boxShadow: (theme) => ({
							xs: "none",
							md: `0px 15px 30px 0px ${alpha(
								theme.palette.neutral[1000],
								theme.palette.mode === "dark" ? 0 : 0.1
							)}`,
						}),
						bottom: bottom,
						left: !showSearch && "0%",
						right: !showSearch && "0%",
						marginTop:
							isSearchPage && !isSticky
								? { xs: "-120px", sm: "-180px" }
								: "-42px",
						maxWidth: {
							xs: "100%",
							sm: isSticky ? { xs: "fit-content", md: "100%" } : "fit-content",
						},
						marginInline: "auto",
						backgroundColor: theme.palette.background.paper,
						borderRadius: "15px",
						borderTopLeftRadius: isSticky ? "0px" : "15px",
						borderTopRightRadius: isSticky ? "0px" : "15px",
					}}
				>
					<Stack
						direction="row"
						flexWrap={{ xs: "wrap", md: "nowrap" }}
						gap={2}
						justifyContent={!showSearch && "center"}
						sx={{
							"> *": {
								flexBasis: { xs: "100%", sm: "48%", md: "auto" },
							},
						}}
					>
						{/* ✅ India error props pass kiye */}
						<RentalSearchLocation
							key={router.pathname}
							setOpenMap={setOpenMap}
							fromHome
							getCurrentLocation={pickLocationFormAddress}
							pickLocationFormAddress={pickLocationFormAddress}
							predictions={predictions}
							handleChange={(event, value) =>
								handleLocationChange("destination", value)
							}
							HandleChangeForSearch={handleSearchChange}
							label={t("Destination")}
							height="53px"
							onFocus={handleFocus}
							disabled={!locations.pickup}
							value={{ description: searchKey }}
							width={isSticky ? "70%" : 500}
							isFocused={isFocused}
							focusedField="destination"
							error={Boolean(destinationError)}
							helperText={destinationError}
							endIcon={
								<NearMeOutlinedIcon
									sx={{
										color: (theme) =>
											alpha(theme.palette.neutral[400], 0.5),
									}}
								/>
							}
						/>

						<DateTimePicker
							value={dayjs(rentalSearch?.selectedDate)}
							handleDateChange={handleDateChange}
							label="Pickup Time"
							sx={{
								display: pathname !== "/home" && {
									xs:
										(!showArrowButton && "flex") || expand
											? "flex"
											: "none" || showArrowButton
												? "none"
												: "flex",
									sm: "flex",
								},
								"& .MuiOutlinedInput-root": {
									"&.Mui-focused fieldset": {
										border: "1px solid",
										borderColor: (theme) =>
											alpha(theme.palette.primary.main, 0.4),
									},
								},
							}}
						/>

						<FormControl
							ref={formControlRef}
							sx={{
								display: pathname !== "/home" && {
									xs:
										(!showArrowButton && "flex") || expand
											? "flex"
											: "none" || showArrowButton
												? "none"
												: "flex",
									sm: "flex",
								},
								width: 300,
								"& .MuiInputLabel-root": { top: "2px" },
								"& .MuiOutlinedInput-root": {
									"& fieldset>legend": { fontSize: "25px" },
									"&.Mui-focused fieldset": {
										border: "1px solid",
										borderColor: (theme) => theme.palette.primary.main,
									},
								},
							}}
						>
							<InputLabel id="demo-checkbox-label">
								{t("Trip Type")}
							</InputLabel>
							<Select
								labelId="demo-checkbox-label"
								id="demo-checkbox"
								value={
									rentalSearch?.tripType
										? rentalSearch.tripType === "both"
											? t("Both")
											: t(rentalSearch.tripType.replaceAll("_", " "))
										: tripType === "both"
											? t("Both")
											: t(tripType?.replaceAll("_", " "))
								}
								sx={{ textTransform: "capitalize" }}
								onChange={handleTripTypeChange}
								open={open}
								onOpen={handleOpen}
								input={<OutlinedInput label="Tag" />}
								renderValue={(selected) => selected}
							>
								<MenuItem
									value="distance_wise"
									onClick={(e) => handleClick(e, "distance_wise")}
								>
									<Radio
										checked={
											rentalSearch?.tripType === "distance_wise" ||
											!rentalSearch?.tripType
										}
									/>
									<ListItemText primary={t("Distance Wise")} />
								</MenuItem>

								<MenuItem
									value="hourly"
									onClick={(e) => handleClick(e, "hourly")}
								>
									<Radio checked={rentalSearch?.tripType === "hourly"} />
									<ListItemText primary={t("Hourly")} />
								</MenuItem>

								<MenuItem
									value="both"
									onClick={(e) => handleClick(e, "both")}
								>
									<Radio checked={rentalSearch?.tripType === "both"} />
									<ListItemText primary={t("Both")} />
								</MenuItem>

								{rentalSearch?.tripType === "hourly" && (
									<Box ref={inputRef} sx={{ px: "10px", mt: "20px", pb: "10px" }}>
										<CustomTextField
											label={t("Duration")}
											value={duration}
											onChange={handleDurationChange}
											sx={{ width: "100%" }}
										/>
									</Box>
								)}
							</Select>
						</FormControl>

						{showSearch && (
							<Button
								variant="contained"
								onClick={handleSearchClick}
								sx={{
									background: "#1A914B",
									"&:hover": { backgroundColor: "#166b39" },
								}}
							>
								{t("Search")}
							</Button>
						)}
					</Stack>
				</Box>

				{openMap && (
					<MapModal
						handleLocation={handleLocation}
						open={openMap}
						handleClose={() => setOpenMap(false)}
						toparcel="1"
						fromReceiver="1"
					/>
				)}

				{/* ✅ Both Trip Type Info Popup */}
				{bothInfoOpen && (
					<Box
						sx={{
							position: "fixed",
							top: 0, left: 0, right: 0, bottom: 0,
							backgroundColor: "rgba(0,0,0,0.4)",
							zIndex: 9999,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
						onClick={() => setBothInfoOpen(false)}
					>
						<Box
							sx={{
								backgroundColor: "white",
								borderRadius: "12px",
								padding: "24px",
								maxWidth: "360px",
								width: "90%",
								textAlign: "center",
								boxShadow: "none",
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<Typography variant="h6" fontWeight={600} mb={1}>
								{t("Both Trip Types Selected")}
							</Typography>

							<Typography variant="body2" color="text.secondary" mb={2} sx={{ lineHeight: 1.8 }}>
								{t("New vehicles will be added based on the trip type of already added vehicles in your cart.")}
							</Typography>

							<Box
								sx={{
									backgroundColor: "#f5f5f5",
									borderRadius: "8px",
									padding: "12px",
									mb: 3,
									textAlign: "left",
								}}
							>
								<Typography variant="body2" mb={1}>
									<strong>{t("Distance Wise")}</strong> — {t("Fare calculated by distance traveled")}
								</Typography>
								<Typography variant="body2">
									<strong>{t("Hourly")}</strong> — {t("Fare calculated by hours booked")}
								</Typography>
							</Box>

							<Button
								variant="contained"
								fullWidth
								onClick={() => setBothInfoOpen(false)}
								sx={{
									backgroundColor: "#1A914B",
									"&:hover": { backgroundColor: "#166b39" },
									boxShadow: "none",
								}}
							>
								{t("Got it")}
							</Button>
						</Box>
					</Box>
				)}

				{/* ✅ Search Confirm Popup */}
				{searchConfirmOpen && (
					<Box
						sx={{
							position: "fixed",
							top: 0, left: 0, right: 0, bottom: 0,
							backgroundColor: "rgba(0,0,0,0.4)",
							zIndex: 9999,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
						onClick={() => setSearchConfirmOpen(false)}
					>
						<Box
							sx={{
								backgroundColor: "white",
								borderRadius: "12px",
								padding: "24px",
								maxWidth: "360px",
								width: "90%",
								textAlign: "center",
								boxShadow: "none",
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<Typography variant="h6" fontWeight={600} mb={1}>
								{t("Update Destination?")}
							</Typography>

							<Typography variant="body2" color="text.secondary" mb={3} sx={{ lineHeight: 1.8 }} >
								{t("The new destination")} <strong>"{searchKey}"</strong> {t("will be applied to all vehicles in your cart.")}
							</Typography>

							<Stack direction="row" spacing={2} justifyContent="center">
								<Button
									variant="outlined"
									onClick={() => setSearchConfirmOpen(false)}
									sx={{
										borderColor: "#ccc",
										color: "text.secondary",
										boxShadow: "none",
										"&:hover": { borderColor: "#aaa", boxShadow: "none" },
									}}
								>
									{t("Cancel")}
								</Button>

								<Button
									variant="contained"
									onClick={() => {
										setSearchConfirmOpen(false);
										proceedSearch();
									}}
									sx={{
										backgroundColor: "#1A914B",
										"&:hover": { backgroundColor: "#166b39" },
										boxShadow: "none",
									}}
								>
									{t("Continue")}
								</Button>
							</Stack>
						</Box>
					</Box>
				)}
			</CustomContainer>
		</>
	);
};

export default TaxiSearchPanel;