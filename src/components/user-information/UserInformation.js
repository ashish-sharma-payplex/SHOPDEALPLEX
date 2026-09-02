import { Box, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Stack } from "@mui/system";
import { useDeleteProfile } from "api-manage/hooks/react-query/profile/useDeleteProfile";
import { getToken } from "helper-functions/getToken";
import { t } from "i18next";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setWalletAmount } from "redux/slices/cart";
import { setUser } from "redux/slices/profileInfo";
import {
  CustomStackFullWidth,
  UserInfoGrid,
} from "styled-components/CustomStyles.style";
import useGetUserInfo from "../../api-manage/hooks/react-query/user/useGetUserInfo";
import PushNotificationLayout from "../PushNotificationLayout";
import CustomContainer from "../container";
import BodySection from "./BodySection";
import UserDashBoard from "./UserDashBoard";
import useScrollToTop from "api-manage/hooks/custom-hooks/useScrollToTop";
import NewLeftMenu from "src/components/header/second-navbar/account-popover/NewLeftMenu";

const UserInformation = ({ page, configData, orderId }) => {
  const theme = useTheme();
  useScrollToTop();

  const [accountDeleteStatus, setAccountDeleteStatus] = useState(true);
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSuccess = (res) => {
    localStorage.setItem("wallet_amount", res?.wallet_balance);
    dispatch(setWalletAmount(res?.wallet_balance));
    dispatch(setUser(res));
  };

  const userToken = getToken();
  const { data, refetch, isLoading } = useGetUserInfo(handleSuccess);

  const onSuccessHandlerForUserDelete = (res) => {
    if (res?.errors) {
      setAccountDeleteStatus(false);
    } else {
      localStorage.removeItem("token");
      toast.success(t("Account has been deleted"));
      dispatch(setUser(null));
      router.push("/", undefined, { shallow: true });
    }
  };

  const { mutate, isLoading: isLoadingDelete } =
    useDeleteProfile(onSuccessHandlerForUserDelete);

  const deleteUserHandler = () => {
    mutate();
  };

  //   const StyledGrid = styled(Grid)(() => ({
  //   '&::before': {
  //     backgroundColor: '#fff',
  //   },
  //   '&::after': {
  //     backgroundColor: '#fff',
  //   },
  // }));


  return (
    <PushNotificationLayout>
      {/* <StyledGrid>  */}
      <CustomStackFullWidth sx={{
         maxWidth:"1280px",
          mx:"auto",
          mb: { xs:2, sm:3, md:4 },
        }}>
        <Box sx={{
          width: "100%",
          px: { xs: 1, sm: 2, md: 3 }, 
          boxSizing: "border-box",
          my: { xs: 0, sm: 0, md: 6 }
        }}>

          <Grid
            container
            gap="2px"


          >

            <UserInfoGrid
              userToken={userToken}
              container
              item
              xs={12}
              sm={12}
              md={12}
              page={page}

            >
              {/* {!userToken && (
              <Grid item xs={12} justifyContent="center" alignSelf="center">
                <Typography fontSize="16px" textAlign="center">
                  {t("Order Details")}
                </Typography>
              </Grid>
            )} */}

              <CustomContainer
                sx={{
                  px: { xs: 1.5, sm: 2, md: 4 }, // left & right spacing
                }}
              >

                <Stack
                  direction={{ xs: "column", sm: "column", md: "row" }}
                  sx={{
                    columnGap: { xs: 0, md: 5 }, // 8px on desktop
                    rowGap: 1,                   // vertical gap
                  }}
                >


                  {userToken && !isSmall && (
                    <Box sx={{ width: 260, flexShrink: 0 }}>
                      <NewLeftMenu
                        onClose={() => { }}
                        cartListRefetch={refetch}
                        openCartDrawer={null}
                      />
                    </Box>
                  )}


                  <Box sx={{ flex: 1 }}>
                    <BodySection
                      page={page}
                      configData={configData}
                      orderId={orderId}
                      userToken={userToken}
                      deleteUserHandler={deleteUserHandler}
                      accountDeleteStatus={accountDeleteStatus}
                      setAccountDeleteStatus={setAccountDeleteStatus}
                      isLoadingDelete={isLoadingDelete}
                    />
                    {/* </Grid> */}
                  </Box>
                </Stack>

              </CustomContainer>
            </UserInfoGrid>

            {/* 📱 MOBILE DASHBOARD (unchanged behaviour) */}
            {/* {isSmall && page === "profile-settings" && userToken && (
            <Grid item xs={12}>
              <CustomContainer>
                <UserDashBoard data={data} isLoading={isLoading} />
              </CustomContainer>
            </Grid>
          )} */}
          </Grid>
        </Box>
      </CustomStackFullWidth>
      {/* </StyledGrid> */}
    </PushNotificationLayout>
  );
};

export default UserInformation;
