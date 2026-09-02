import React, { useEffect, useState } from "react";

import {
	CustomListItem,
	CustomStackFullWidth,
} from "../../../styled-components/CustomStyles.style";
import ListItemText from "@mui/material/ListItemText";
import { Typography, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import Radio from "@mui/material/Radio";
import DeleteIcon from "@mui/icons-material/Delete";

import CustomAlert from "../../alert/CustomAlert";

import { useTheme } from "@mui/material/styles";

import { Stack } from "@mui/system";

import { CustomTypographyEllipsis } from "../../../styled-components/CustomTypographies.style";

import useDeleteAddress from "../../../api-manage/hooks/react-query/address/useDeleteAddress";
import toast from "react-hot-toast";
import { onErrorResponse } from "../../../api-manage/api-error-response/ErrorResponses";

const AddressSelectionList = (props) => {
	const theme = useTheme();
	const {
		data,
		allAddress,
		handleLatLng,
		t,
		address,
		isRefetching,
		refetch,
		configData,
		setSelectedAddress,
		renderOnNavbar,
	} = props;

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [addressToDelete, setAddressToDelete] = useState(null);
	const [localAddresses, setLocalAddresses] = useState([]);

	const { mutate: deleteAddress, isLoading: isDeleting } = useDeleteAddress();

const truncateText = (text, limit = 50) => {
    if (!text) return "";
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

	const handleDeleteClick = (item, event) => {
		event.stopPropagation();
		setAddressToDelete(item);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (addressToDelete) {
			deleteAddress(addressToDelete.id, {
				onSuccess: (response) => {
  toast.success(t("Address deleted successfully"));

  // ✅ UI se turant hata do
  setLocalAddresses((prev) =>
    prev.filter((item) => item.id !== addressToDelete.id)
  );

  // optional refetch (background sync)
  refetch?.();

  setDeleteDialogOpen(false);
  setAddressToDelete(null);
},
				onError: (error) => {
					onErrorResponse(error);
					setDeleteDialogOpen(false);
					setAddressToDelete(null);
				},
			});
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setAddressToDelete(null);
	};

	// Helper to get icon based on address_type
	const getAddressIcon = (type) => {
		switch (type?.toLowerCase()) {
			case "home":
				return "/icons/home.svg";
			case "work":
				return "/icons/work.svg";
			default:
				return "/icons/map.svg";
		}
	};

useEffect(() => {
  if (data?.addresses) {
    setLocalAddresses(data.addresses);
  }
}, [data]);

	return (
		<>
			<Stack
				sx={{
					border: `1px solid ${theme.palette.grey[200]}`,
				}}>
				{data &&
					allAddress?.length > 0 &&
					localAddresses?.map((item, index) => (
						<Stack key={item.id} >
							<CustomListItem

								onClick={() => handleLatLng(item)}
								alignItems="flex-start"
								selected={item.id === address?.id}
								cursor="pointer"
								sx={{
									borderRadius: "12px",
									padding: "12px",
									borderBottom: index !== data.addresses.length - 1 ? `1px dotted ${theme.palette.grey[300]}` : "none",
								}}
							>
								<CustomStackFullWidth
									direction="row"
									alignItems="flex-start"
									justifyContent="space-between"
								>
									<Stack direction="row" spacing={1.5} alignItems="flex-start">
										<img
											src={getAddressIcon(item.address_type)}
											alt={item.address_type}
											width={22}
											height={22}
											style={{ marginTop: "3px" }}
										/>

										<Stack>
											<Typography
												fontSize="14px"
												fontWeight={600}
												textTransform="capitalize"
											>
												{t(item.address_type)}
											</Typography>

											<CustomTypographyEllipsis
												sx={{
													fontSize: "12px",
													color: theme.palette.neutral[600],
													maxWidth:
														renderOnNavbar === "true" ? "220px" : "100%",
												}}
											>
											{truncateText(item.address)}
											</CustomTypographyEllipsis>
										</Stack>
									</Stack>

									<IconButton
										onClick={(event) => handleDeleteClick(item, event)}
										disabled={isDeleting}
										size="small"
										sx={{
											color: theme.palette.error.main,
											"&:hover": {
												backgroundColor: theme.palette.error.light,
											},
										}}
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</CustomStackFullWidth>
							</CustomListItem>
						</Stack>
					))}
				{!isRefetching && allAddress?.length === 0 && (
					<CustomAlert
						type="info"
						text={t("No saved addresses found to select.")}
					/>
				)}
				{/*{!data && <CustomCheckOutShimmer />}*/}
			</Stack>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				aria-labelledby="delete-dialog-title"
				aria-describedby="delete-dialog-description"
			>
				<DialogTitle id="delete-dialog-title">
					{t("Delete Address")}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="delete-dialog-description">
						{t("Are you sure you want to delete this address? This action cannot be undone.")}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} disabled={isDeleting}>
						{t("Cancel")}
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						disabled={isDeleting}
						color="error"
						variant="contained"
					>
						{isDeleting ? t("Deleting...") : t("Delete")}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

AddressSelectionList.propTypes = {};

export default AddressSelectionList;
