import React, { useState, useEffect } from "react";
import {
  CustomPaperBigCard,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import ProfileTab from "./ProfileTab";
import Divider from "@mui/material/Divider";
import ProfileBody from "./ProfileBody";
import Address from "../address";
import { menuData } from "../header/second-navbar/account-popover/menuData";
import Router, { useRouter } from "next/router";
import { useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import useGetAddressList from "../../api-manage/hooks/react-query/address/useGetAddressList";

const ProfileCard = styled(CustomPaperBigCard)(({ theme }) => ({
  // optional: add radius or shadow if needed
}));

const BodySection = ({
  page,
  configData,
  orderId,
  userToken,
  deleteUserHandler,
  isLoadingDelete,
  accountDeleteStatus,
  setAccountDeleteStatus,
}) => {
  const router = useRouter();

  // Default page if undefined
  const currentPage = page || router.query.page || "profile-settings";

  const [editProfile, setEditProfile] = useState(false);
  const [addAddress, setAddAddress] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const { data, isLoading, refetch } = useGetAddressList();

  const [activePage, setActivePage] = useState(currentPage);

  // Update active page if router query changes
  useEffect(() => {
    if (router.query.page) {
      setActivePage(router.query.page);
    }
  }, [router.query.page]);

  const handleActivePage = (item) => {
    setActivePage(item.name); // highlight selected
    Router.push(
      {
        pathname: "/profile",
        query: { page: item?.name },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <CustomStackFullWidth spacing={2}  sx={{ border: "1px solid #D9E1EC",
          borderRadius: "14px",
          padding: "16px 12px",
          backgroundColor: "#fff",
		   }}>
      {/* Main Profile Card */}
      <CustomPaperBigCard
	 
        padding={page === "my-orders" || page === "inbox" ? "0px" : "10px"}
        noboxshadow={
          isSmall
            ? page === "my-orders" || page === "inbox" || page === "wallet" || page === "coupons" || page === "loyalty-points" || page === "referral-code" || page === "settings" || page === "profile-settings"
              ? "true"
              : ""
            : "true"
        }
        backgroundcolor={
          isSmall &&
          (page === "my-orders" || page === "inbox" || page === "wallet" || page === "coupons" || page === "loyalty-points" || page === "referral-code" || page === "settings" || page === "profile-settings")
        }
      >
        {/* PROFILE TABS */}
        {/* {!isSmall && userToken && (
          <ProfileTab
            deleteUserHandler={deleteUserHandler}
            isLoadingDelete={isLoadingDelete}
            accountDeleteStatus={accountDeleteStatus}
            setAccountDeleteStatus={setAccountDeleteStatus}
            page={activePage}
            menuData={menuData}
            handlePage={handleActivePage}
            setEditProfile={setEditProfile}
          />
        )}
        {!isSmall && <Divider />} */}

        {/* Profile Body */}
        <ProfileBody
          page={activePage}
          configData={configData}
          orderId={orderId}
          editProfile={editProfile}
          setEditProfile={setEditProfile}
          addAddress={addAddress}
          setAddAddress={setAddAddress}
          editAddress={editAddress}
          refetch={refetch}
          setEditAddress={setEditAddress}
        />
      </CustomPaperBigCard>

      {/* Address Section */}
      {activePage === "profile-settings" && !editProfile && !addAddress && (
        <CustomPaperBigCard padding="10px" noboxshadow={isSmall ? "" : "true"}>
          <Address
            configData={configData}
            addAddress={addAddress}
            setAddAddress={setAddAddress}
            setEditAddress={setEditAddress}
            data={data}
            refetch={refetch}
            isLoading={isLoading}
          />
        </CustomPaperBigCard>
      )}
    </CustomStackFullWidth>
  );
};

export default BodySection;
