import React, { useState } from "react";
import { Box } from "@mui/system";
import {
  Divider,
  ListItemIcon,
  MenuItem,
  MenuList,
  Grid,
  ListItemText,
  Typography,
} from "@mui/material";

import { useTranslation } from "react-i18next";
import LogoutIcon from "@mui/icons-material/Logout";
import CustomDialogConfirm from "../../../custom-dialog/confirm/CustomDialogConfirm";
import { useDispatch, useSelector } from "react-redux";
import { setLogoutUser, setUser } from "redux/slices/profileInfo";
import toast from "react-hot-toast";
import { logoutSuccessFull } from "utils/toasterMessages";

import { menuData } from "./menuData";
import { useRouter } from "next/router";
import { setWelcomeModal } from "redux/slices/utils";
import useMediaQuery from "@mui/material/useMediaQuery";

import { getToken } from "helper-functions/getToken";
import useGetUserInfo from "api-manage/hooks/react-query/user/useGetUserInfo";
import { useDeleteProfile } from "api-manage/hooks/react-query/profile/useDeleteProfile";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import UserDetailsNew from "components/user-information/UserDetailsNew";

// ====== DELETE ACCOUNT MODAL ======
import DeleteAccount from "components/user-information/DeleteAccount";
import CustomModal from "components/modal";
import { setAuthToken } from "redux/slices/authSlice";
import styles from "styles/profilemenu.module.css";

const Menu = ({ onClose, cartListRefetch, openCartDrawer }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();

  const [openModal, setOpenModal] = useState(false); // Logout confirm
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  // ====== DELETE ACCOUNT STATES ======
  const [accountDeleteStatus, setAccountDeleteStatus] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  const { configData, modules } = useSelector((state) => state.configData);
  const isMobile = useMediaQuery("(max-width:768px)");
  const userToken = getToken();

  // ====== FETCH USER ======
  const handleSuccess = (res) => dispatch(setUser(res));
  const { data } = useGetUserInfo(handleSuccess);

  // ====== DELETE ACCOUNT HANDLERS ======
  const onSuccessHandlerForUserDelete = (res) => {
    if (res?.errors) {
      setAccountDeleteStatus(false);
    } else {
      localStorage.removeItem("token");
      toast.success(t("Account has been deleted"));
      dispatch(setUser(null));
      router.push("/");
    }
  };

  const { mutate, isLoading: isLoadingDelete } = useDeleteProfile(
    onSuccessHandlerForUserDelete,
  );

  const deleteUserHandler = () => mutate();

  // ====== LOGOUT ======
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    dispatch(setWelcomeModal(false));

    setTimeout(() => {
      cartListRefetch?.();
      dispatch(setLogoutUser(null));
      dispatch(setAuthToken(null)); // ✅ Redux auth token bhi clear karo
      localStorage.removeItem("token");
      onClose?.();
      toast.success(t(logoutSuccessFull));
      router.replace("/");
      setOpenModal(false);
      setIsLogoutLoading(false);
    }, 500);
  };

  const handleClick = (item) => {
    // Track Order → direct page
    if (item.name === "track-order") {
      router.push("/track-order");
      scrollToTop();
      return;
    }

    if (item.name === "wishlist") {
      router.push("/wishlist"); // Directly go to the wishlist page
      scrollToTop();
      return;
    }

    if (item.name === "cart") {
      if (openCartDrawer) {
        openCartDrawer(); // open drawer
        onClose?.(); // close popover
      }
      scrollToTop();
      return;
    }

    // console.log("Menu Items:", menuItems);

    // All other profile options
    router.push({
      pathname: "/profile",
      query: { page: item.name },
    });
    scrollToTop();
  };
  const menuItems = menuData(isMobile);

  return (
    <Box display="flex">
      <Box className={styles.menuContainer}>
        {/* USER DETAILS */}
        {userToken && (
          <Grid mb={2} mt={1}>
            <UserDetailsNew
              data={data}
              page={null}
              deleteUserHandler={deleteUserHandler}
              setAccountDeleteStatus={setAccountDeleteStatus}
              accountDeleteStatus={accountDeleteStatus}
              isLoadingDelete={isLoadingDelete}
            />
          </Grid>
        )}

        {/* MENU LIST */}
        <MenuList>
          {menuItems.map((item) => {
            // Define isActive inside map callback
            const isActive = router.query.page === item.name;

            // Your hide logic
            const shouldHide =
              (configData?.customer_wallet_status === 0 && item.id === 5) ||
              (configData?.loyalty_point_status === 0 && item.id === 6) ||
              (configData?.ref_earning_status === 0 && item.id === 7) ||
              (!modules?.find((m) => m?.module_type === "rental") &&
                item.id === 4) ||
              (modules?.find((m) => m?.module_type === "rental")?.status ===
                0 &&
                item.id === 4);

            if (shouldHide) return null;

            return (
              <MenuItem
                key={item.id}
                onClick={() => handleClick(item)}
                className={`${styles.menuItem} ${
                  isActive ? styles.menuItemActive : ""
                }`}
              >
                <ListItemIcon
                  className={`${styles.iconWrap} ${
                    isActive ? styles.iconWrapActive : ""
                  }`}
                >
                  {React.cloneElement(item.icon, { fontSize: "small" })}
                </ListItemIcon>

                <ListItemText
                  className={`${styles.itemText} ${
                    isActive ? styles.itemTextActive : ""
                  }`}
                  primary={t(item.name.replace("-", " "))}
                />
              </MenuItem>
            );
          })}

          {/* LOGOUT BUTTON */}
          <Divider className={styles.menuDivider} />

          <MenuItem
            className={styles.logoutItem}
            onClick={() => {
              setOpenModal(true);
              setIsLogoutLoading(false);
            }}
          >
            <ListItemIcon sx={{ minWidth: "25px !important" }}>
              <LogoutIcon fontSize="small" className={styles.logoutIcon} />
            </ListItemIcon>

            <ListItemText
              primary={
                <Typography variant="body1" className={styles.logoutText}>
                  {t("Logout")}
                </Typography>
              }
            />
          </MenuItem>
        </MenuList>

        {/* ===== DELETE ACCOUNT MODAL ===== */}
        <CustomModal
          openModal={deleteModal}
          handleClose={() => setDeleteModal(false)}
        >
          <DeleteAccount
            isLoading={isLoadingDelete}
            handleClose={() => setDeleteModal(false)}
            deleteUserHandler={deleteUserHandler}
            accountDeleteStatus={accountDeleteStatus}
          />
        </CustomModal>

        {/* LOGOUT CONFIRM DIALOG */}
        <CustomDialogConfirm
          isLoading={isLogoutLoading}
          dialogTexts={t("Are you sure you want to logout?")}
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSuccess={handleLogout}
        />
      </Box>
    </Box>
  );
};

export default Menu;
