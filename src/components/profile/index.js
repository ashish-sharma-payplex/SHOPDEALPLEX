import React, { useEffect } from "react";
import { useRouter } from "next/router";
import useGetUserInfo from "../../api-manage/hooks/react-query/user/useGetUserInfo";
import BasicInformation from "./basic-information";
import { setWalletAmount } from "redux/slices/cart";
import { setUser } from "redux/slices/profileInfo";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

const Profile = (props) => {
  const {
    configData,
    setEditProfile,
    editProfile,
    setAddAddress,
    addAddress,
    editAddress,
    addressRefetch,
    setEditAddress,
  } = props;
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Log the props to check incoming data
  // console.log("Profile Component Props:", props);

  const handleSuccess = (res) => {
    // console.log("API Success Response:", res);
    if (res) {
      localStorage.setItem("wallet_amount", res?.wallet_balance);
      dispatch(setWalletAmount(res?.wallet_balance));
      dispatch(setUser(res));
    } else {
      // console.error("No response data in handleSuccess");
    }
  };

  const { data, refetch } = useGetUserInfo(handleSuccess);

  // Log the data received from the hook
  useEffect(() => {
    // console.log("User Info Data from useGetUserInfo:", data);
  }, [data]);

  return (
    <>
      <BasicInformation
        data={data}
        refetch={refetch}
        configData={configData}
        t={t}
        editProfile={editProfile}
        setEditProfile={setEditProfile}
        addAddress={addAddress}
        setAddAddress={setAddAddress}
        editAddress={editAddress}
        addressRefetch={addressRefetch}
        setEditAddress={setEditAddress}
      />
    </>
  );
};

Profile.propTypes = {};

export default Profile;
