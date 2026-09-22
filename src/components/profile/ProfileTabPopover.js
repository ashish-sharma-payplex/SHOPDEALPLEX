import React, { useState } from "react";
import { alpha, IconButton, MenuItem, MenuList, Popover } from "@mui/material";
import { menuData } from "../header/second-navbar/account-popover/menuData";
import { useSelector } from "react-redux";
import { t } from "i18next";
import { Stack, styled } from "@mui/system";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useRouter } from "next/router";
import CustomDialogConfirm from "../custom-dialog/confirm/CustomDialogConfirm";
import CustomModal from "../modal";
import DeleteAccount from "../user-information/DeleteAccount";
import styles from "styles/profilemenu.module.css";

// Styled MenuItem with dynamic background for active menu
const StyledMenuItem = styled(MenuItem)(({ theme, page, menu }) => ({
  minHeight: "30px",
  height: "38px",
  lineHeight: "30px",
  borderRadius: "5px",
  fontSize: "12px",
  color: "#e8eaec",
  backgroundColor: page === menu?.name ? "#ffffff" : "transparent",
  "& span": {
    color: page === menu?.name ? "#111827" : "#e8eaec",
    fontWeight: page === menu?.name ? 600 : 500,
  },
  "&:hover": {
    backgroundColor:
      page === menu?.name ? "#ffffff" : "rgba(52, 164, 44, 0.12)",
  },
}));

const ProfileTabPopover = (props) => {
  const {
    deleteUserHandler,
    isLoadingDelete,
    accountDeleteStatus,
    setAccountDeleteStatus,
    anchorEl,
    onClose,
    open,
    page,
    ...other
  } = props;
  const { configData } = useSelector((state) => state.configData);
  const [openModal, setOpenModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    setDeleteModal(false);
    setAccountDeleteStatus(true);
  };

  const handleOpenDeleteModal = () => {
    onClose();
    setOpenModal(false);
    setDeleteModal(true);
  };

  const handleClick = (item) => {
    if (item?.path) {
      router.push(item.path);
    } else {
      // For items with no path like 'cart', you can handle it differently if needed.
      // console.log("No path specified for item", item);
    }
    onClose();
  };

  const isMobile = window.innerWidth <= 768; // Example check, use your logic to check if mobile or not
  const menuItems = menuData(isMobile); // Get the dynamic menu data based on screen size

  return (
    <Popover
      disableScrollLock={true}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          width: 235,
          top: "56px !important",
          left: "157px !important",
          borderRadius: "0px",
          backgroundColor: "#111827",
          border: "1px solid #2d3748",
        },
      }}
      transitionDuration={2}
      {...other}
    >
      <Stack paddingRight="10px" alignItems="flex-end">
        <IconButton className={styles.closeButton} onClick={onClose}>
          <CloseRoundedIcon sx={{ width: "15px", height: "15px" }} />
        </IconButton>
      </Stack>
      <MenuList
        sx={{
          paddingInlineStart: "15px",
          paddingInlineEnd: "24px",
          paddingBottom: "50px",
        }}
      >
        {menuItems?.map((menu, index) => {
          // Conditional logic to hide certain menu items based on config status
          if (
            (configData?.customer_wallet_status === 0 && menu?.id === 4) ||
            (configData?.loyalty_point_status === 0 && menu?.id === 5) ||
            (configData?.ref_earning_status === 0 && menu?.id === 6)
          ) {
            return null;
          } else {
            return (
              <StyledMenuItem
                key={index}
                sx={{ textTransform: "capitalize" }}
                page={page}
                menu={menu}
                onClick={() => handleClick(menu)}
              >
                {t(menu?.name?.replace("-", " "))}
              </StyledMenuItem>
            );
          }
        })}
        {/* Delete Account option */}
        <StyledMenuItem
          page={page}
          menu={{ name: "delete" }}
          onClick={handleOpenDeleteModal}
        >
          {t("Delete Your Account")}
        </StyledMenuItem>
      </MenuList>
      <CustomModal openModal={deleteModal} handleClose={handleClose}>
        <DeleteAccount
          isLoading={isLoadingDelete}
          handleClose={handleClose}
          deleteUserHandler={deleteUserHandler}
          accountDeleteStatus={accountDeleteStatus}
        />
      </CustomModal>
    </Popover>
  );
};

export default ProfileTabPopover;
