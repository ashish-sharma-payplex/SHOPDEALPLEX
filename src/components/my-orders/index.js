import React, { useEffect, useState } from "react";
import NavigationButtons from "./NavigationButtons";
import { useTranslation } from "react-i18next";
import useGetMyOrdersList from "../../api-manage/hooks/react-query/order/useGetMyOrdersList";
import { useDispatch, useSelector } from "react-redux";
import {
	CustomBoxFullWidth,
	CustomPaperBigCard,
	CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import { Grid, Skeleton, useMediaQuery, TextField, InputAdornment } from "@mui/material";
import CustomEmptyResult from "../custom-empty-result";
import nodata from "../loyalty-points/assets/Search.svg";
import Order, { CustomPaper } from "./order";
import CustomPagination from "../custom-pagination";

import { setCurrentTab, setOrderType } from "redux/slices/utils";
import { useTheme } from "@mui/material/styles";
import { toast } from "react-hot-toast";
import useGetTrackOrderData from "../../api-manage/hooks/react-query/order/useGetTrackOrderData";
import TabsTypeOne from "../custom-tabs/TabsTypeOne";
import active from "./assets/active_image.png";
import past from "./assets/past_image.png";
import { Stack } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";

const CustomShimmerCard = ({ isXs }) => {
	const theme = useTheme();
	const isSmall = useMediaQuery(theme.breakpoints.down("md"));
	return (
		<CustomBoxFullWidth>
			<Grid container spacing={3}>
				{[...Array(6)].map((item, index) => {
					return (
						<Grid
							item
							xs={12}
							sm={isXs ? 12 : 6}
							md={12}
							lg={12}
							key={index}
						>
							<CustomPaper>
								<Stack
									direction={{ xs: "column", md: "row" }}
									justifyContent="space-between"
								>
									<Stack
										direction="row"
										spacing={1.5}
										alignItems="center"
										width="100%"
									>
										<Skeleton
											variant="rectangular"
											width={isSmall ? "100px" : "90px"}
											height={isSmall ? "100px" : "72px"}
										/>
										<Stack width="100%" spacing={0.5}>
											<Skeleton
												variant="text"
												width="200px"
												height={
													isSmall ? "15px" : "20px"
												}
											/>
											<Skeleton
												variant="text"
												width="130px"
												height={
													isSmall ? "15px" : "20px"
												}
											/>
											<Skeleton
												variant="text"
												width="130px"
												height={
													isSmall ? "15px" : "20px"
												}
											/>
											{isSmall && (
												<Stack
													direction="row"
													spacing={1}
													alignItems="center"
													justifyContent="space-between"
												>
													<Skeleton
														variant="text"
														width="100px"
														height="20px"
													/>
													<Skeleton
														variant="text"
														width="100px"
														height="35px"
													/>
												</Stack>
											)}
										</Stack>
									</Stack>
									{!isSmall && (
										<Stack
											direction="row"
											spacing={1}
											alignItems="center"
										>
											<Skeleton
												variant="text"
												width="130px"
												height="40px"
											/>
											<Skeleton
												variant="text"
												width="130px"
												height="60px"
											/>
										</Stack>
									)}
								</Stack>
							</CustomPaper>
						</Grid>
					);
				})}
			</Grid>
		</CustomBoxFullWidth>
	);
};

const MyOrders = (props) => {
	const tabsData = [
		{
			title: "Active orders ",
			img: active,
		},
		{
			title: "History",
			img: past,
		},
	];

	const theme = useTheme();
	const { configData } = props;
	const { t } = useTranslation();
	const isXs = useMediaQuery("(max-width:600px)");
	const { orderType, currentTab } = useSelector((state) => state.utilsData);

	const [offset, setOffSet] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const dispatch = useDispatch();
	const isSmall = useMediaQuery(theme.breakpoints.down("md"));
	const orderTypeValue = orderType === 0 ? "running-orders" : "list";

	const { data, refetch, isFetching } = useGetMyOrdersList({
		orderType: orderTypeValue,
		offset: offset,
		limit: 5,
		searchTerm: searchTerm,
	});
	// console.log("==========================");
	// console.log(data);
	// console.log("==========================");	

	const handleNextPage = () => {
		setOffSet((prev) => prev + 1);
	};

	const deleteOrder = async (orderId) => {
		try {
			// Assuming there is an API or mutation hook to delete order, replace with actual implementation
			// await deleteOrderApi(orderId);
			toast.success("Order deleted successfully");
			refetch();
		} catch (error) {
			toast.error("Failed to delete order");
		}
	};

	useEffect(() => {
		refetch();
		dispatch(setOrderType(orderType === 0 ? 0 : 1));
	}, [orderType, offset]);

	useEffect(() => {
		if (currentTab) {
			setOffSet(1);
			dispatch(setOrderType(currentTab === "Active orders " ? 0 : 1));
		}
	}, [currentTab]);

	useEffect(() => {
		if (isFetching) {
			// toast.loading(t("Getting Order List..."));
		} else {
			toast.dismiss();
		}
	}, [isFetching]);
	const filteredOrders = data?.orders?.filter((order) => {
		const searchLower = searchTerm.toLowerCase();
		return (
			order?.id?.toString().endsWith(searchTerm) ||
			order?.restaurant_name?.toLowerCase().includes(searchLower) ||
			order?.order_status?.toLowerCase().includes(searchLower) ||
			order?.total_amount?.toString().includes(searchLower) ||
			order?.items?.[0]?.name?.toLowerCase().includes(searchLower)
		);
	});



	const handleInnerContent = () => {
		if (data) {
			if (filteredOrders.length === 0) {
				return (
					<CustomEmptyResult
						image={nodata}
						label={searchTerm ? "No matching orders found" : "No Orders Found"}
						width="128px"
						height="128px"
					/>
				);
			} else {
				return (
					<Grid container spacing={2}>
						{filteredOrders.map((order, index) => (
							<Grid
								item
								xs={12}
								sm={isXs ? 12 : 6}
								md={12}
								lg={12}
								key={order?.id}
							>
								<Order
									index={index}
									order={order}
									t={t}
									configData={configData}
									dispatch={dispatch}
									onDelete={() => deleteOrder(order.id)}
								/>
							</Grid>
						))}
					</Grid>
				);
			}
		} else {
			return <CustomShimmerCard isXs={isXs} />;
		}
	};
	return (
		<CustomStackFullWidth
			spacing={2}
			sx={{
				minHeight: "80vh",
				padding: isSmall
					? "10px 10px 10px 0px"
					: "20px 20px 20px 0px",
			}}
		>
			<TabsTypeOne
				tabs={tabsData}
				currentTab={currentTab}
				t={t}
				width="fit-content"
				onNextPage={handleNextPage}
				sx={{ marginBottom: 2, marginLeft: 2 }} // Adding margin bottom to create space between tabs and content
			/>

			{/*<NavigationButtons t={t} setOffset={setOffSet} />*/}
			<TextField
				fullWidth
				variant="outlined"
				placeholder={t("Search orders...")}
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon />
						</InputAdornment>
					),
				}}
				sx={{ mb: 2 }}
			/>
			<CustomStackFullWidth spacing={3}>
				{handleInnerContent()}
			</CustomStackFullWidth>
			{data?.total_size > 5 && (
				<CustomStackFullWidth
					sx={{ justifyContent: "center", mb: 0 }}
					direction="row"
				>
					<CustomPagination
						total_size={data?.total_size}
						page_limit={5}
						offset={offset}
						setOffset={setOffSet}
					/>
				</CustomStackFullWidth>
			)}
		</CustomStackFullWidth>
	);
};

export default MyOrders;
