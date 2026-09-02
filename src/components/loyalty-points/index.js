/* eslint-disable react-hooks/exhaustive-deps */
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaidIcon from "@mui/icons-material/Paid";
import {
	Button,
	Grid,
	Popover,
	Typography,
	alpha,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { Stack } from "@mui/system";
import { t } from "i18next";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import useGetLoyaltyPointTransactionsList from "../../api-manage/hooks/react-query/loyalty-points/useGetLoyaltyPointTransactionList";
import useGetProfile from "../../api-manage/hooks/react-query/profile/useGetProfile";
import { setUser } from "../../redux/slices/profileInfo";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import TransactionHistory from "../transaction-history";
import HowToUse from "../wallet/HowToUse";
import TransactionHistoryMobile from "../wallet/TransactionHistoryMobile";
import WalletBoxComponent from "../wallet/WalletBoxComponent";
import trophy from "./assets/loyaltyimg.png";
import LoyaltyModal from "./loyalty-modal";

const LoyaltyPoints = (props) => {
	const { configData } = props;
	const [offset, setOffset] = useState(1);
	const [openModal, setOpenModal] = useState(false);
	const theme = useTheme();
	const isSmall = useMediaQuery(theme.breakpoints.down("md"));
	const dispatch = useDispatch();
	const [openPopover, setOpenPopover] = useState(false);
	const anchorRef = useRef(null);
	const userOnSuccessHandler = (res) => {
		dispatch(setUser(res));
	};
	const { data: userData, refetch: profileRefetch } =
		useGetProfile(userOnSuccessHandler);
	let pageParams = { offset: offset };
	const { data, refetch, isLoading, isFetching } =
		useGetLoyaltyPointTransactionsList(pageParams);
	useEffect(() => {
		fetchData();
	}, []);
	useEffect(() => {
		refetch();
	}, [offset]);

	const fetchData = async () => {
		await profileRefetch();
		await refetch();
	};
	const handleConvertCurrency = () => {
		setOpenModal(true);
	};

	const steps = [
		{
			label: "Convert your loyalty point to wallet money.",
		},
		{
			label: "Minimum 200 points required to convert into currency",
		},
	];
	return (
		<CustomStackFullWidth
			my={{ xs: "1rem", md: "2rem" }}
			alignItems="center"
			justifyContent="space-between"
			sx={{ height: "100%", minHeight: "60vh", alignItems: "center" }}
		>
			<Grid

				container
				pl={{ xs: "2px", md: "15px" }}
				pr={{ xs: "2px", md: "15px" }}
				spacing={{ xs: 2, md: 0 }}   // space between stacked items on mobile
				direction={{ xs: "column", md: "column" }}  // ✅ mobile = column, desktop = row
			>
				{/* LEFT SECTION */}
				<Grid
					item
					xs={12}
					md={4.5}
					align="left"
					borderRight={{
						xs: "none",
						// md: `2px solid ${alpha(theme.palette.neutral[400], 0.3)}`,
					}}
					mb={{ xs: 3, md: 0 }}
				>
					<Stack spacing={{ xs: 2, md: 3 }}>
						{isSmall && (
							<Stack direction="row" justifyContent="space-between">
								<Typography
									textTransform="capitalize"
									fontWeight="700"
									fontSize="16px"
								>
									{t("Loyalty point")}
								</Typography>
								<InfoOutlinedIcon onClick={() => setOpenPopover(true)} />
							</Stack>
						)}
						<WalletBoxComponent
							balance={userData?.loyalty_point}
							title={t("Total points")}
							image={trophy}
							//   handleConvertCurrency={handleConvertCurrency}
							isSmall={isSmall}
							fullWidth={true}
						/>

						{/* Updated Button */}
						<Stack mt={0} width="100%">
							<Button
								variant="text"
								onClick={handleConvertCurrency}
								sx={{
									width: "100%",
									color: (theme) => theme.palette.primary.main,
									fontWeight: 700,
									fontSize: "14px",
									textTransform: "none",
									textDecoration: "underline",
									paddingY: "8px",
									borderRadius: 0.8,
									boxShadow: "none",
									border: "1px solid #D9E1EC",
									"&:hover": {
										backgroundColor: "transparent",
										textDecoration: "underline",
										boxShadow: "none",
									},
								}}
							>
								{t("Convert To Currency Now")}
							</Button>
						</Stack>

						{!isSmall && <HowToUse steps={steps} />}
					</Stack>
				</Grid>


				{/* RIGHT SECTION */}
				<Grid
					item
					xs={12}
					md={7.5}
					paddingLeft={{ xs: 0, sm: "30px", md: "60px" }}
				>
					{isSmall ? (
						<TransactionHistoryMobile
							data={data}
							isLoading={isLoading}
							page="loyalty"
							isFetching={isFetching}
							offset={offset}
							setOffset={setOffset}
						/>
					) : (
						<TransactionHistory
							data={data}
							isLoading={isLoading}
							page="loyalty"
							isFetching={isFetching}
							offset={offset}
							setOffset={setOffset}
						/>
					)}
				</Grid>
			</Grid>


			{openModal && (
				<LoyaltyModal
					configData={configData}
					theme={theme}
					t={t}
					openModal={openModal}
					handleClose={() => setOpenModal(false)}
					loyalitydata={userData?.loyalty_point}
					refetch={refetch}
					profileRefetch={profileRefetch}
				/>
			)}
			<Popover
				disableScrollLock={true}
				anchorEl={anchorRef}
				onClose={() => setOpenPopover(false)}
				anchorOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
				keepMounted
				open={openPopover}
				PaperProps={{
					sx: {
						borderRadius: "0px",
						top: "244px !important",
						padding: "20px",
					},
				}}
				transitionDuration={2}
			>
				<Stack>
					<HowToUse steps={steps} />
				</Stack>
			</Popover>
		</CustomStackFullWidth>
	);
};

export default LoyaltyPoints;
