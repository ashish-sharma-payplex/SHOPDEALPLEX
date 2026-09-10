import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomModal from "components/modal";
import SignIn from "components/auth/sign-in";
import SignUp from "components/auth/sign-up/SignUp";
import AddUserInfo from "components/auth/AddUserInfo";
import ExitingUser from "components/auth/ExitingUser";
import { useTheme } from "@mui/styles";
import { useSignIn } from "api-manage/hooks/react-query/auth/useSignIn";
import {
  onErrorResponse,
  onSingleErrorResponse,
} from "api-manage/api-error-response/ErrorResponses";
import { getGuestId } from "helper-functions/getToken";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useWishListGet } from "api-manage/hooks/react-query/wish-list/useWishListGet";
import { loginSuccessFull } from "utils/toasterMessages";
import { setWishList } from "redux/slices/wishList";
import { useUpdateUserInfo } from "api-manage/hooks/react-query/auth/useUpdateUserInfo";
import { ProfileApi } from "api-manage/another-formated-api/profileApi";
import { useQuery } from "react-query";
import { setUser } from "redux/slices/profileInfo";
import { auth } from "firebase";
import PhoneInputForm from "components/auth/sign-in/social-login/PhoneInputForm";
import { toast } from "react-hot-toast";
import { t } from "i18next";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";

export const setUpRecaptcha = () => {
  if (document.getElementById("recaptcha-container")) {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            // console.log("Recaptcha verified", response);
          },
          "expired-callback": () => {
            window.recaptchaVerifier?.reset();
          },
        },
        auth,
      );
    } else {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  }
};

const AuthModal = ({ modalFor, open, handleClose, setModalFor }) => {
  const { configData } = useSelector((state) => state.configData);
  const [loginInfo, setLoginInfo] = useState({});
  const loginInfoRef = useRef({});
  const [userInfo, setUserInfo] = useState(null);
  const theme = useTheme();
  const { userInfo: fbUserInfo, jwtToken: fbJwtToken } = useSelector(
    (state) => state.fbCredentialsStore,
  );
  const [jwtToken, setJwtToken] = useState(null);
  const [medium, setMedium] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const user = medium === "google" ? userInfo : fbUserInfo;
  const jwt = medium === "google" ? jwtToken : fbJwtToken;
  const dispatch = useDispatch();
  const recaptchaWrapperRef = useRef(null);
  const { mutate, isLoading } = useUpdateUserInfo();
  const { mutate: loginMutation, isLoading: loginIsLoading } = useSignIn();

  const updateLoginInfo = (data) => {
    loginInfoRef.current = data;
    setLoginInfo(data);
  };

  const userOnSuccessHandler = (res) => {
    dispatch(setUser(res?.data));
  };

  const { refetch: profileRefatch } = useQuery(
    ["profile-info"],
    ProfileApi.profileInfo,
    {
      enabled: false,
      onSuccess: userOnSuccessHandler,
      onError: onSingleErrorResponse,
    },
  );

  let zoneid = undefined;
  const moduleType = getCurrentModuleType();

  if (typeof window !== "undefined") {
    zoneid = localStorage.getItem("zoneid");
  }

  const onSuccessHandler = (res) => {
    dispatch(setWishList(res));
  };
  const { refetch } = useWishListGet(onSuccessHandler);

  const handleSuccess = async (value) => {
    localStorage.setItem("token", value);
    toast.success(t(loginSuccessFull));
    if (zoneid) {
      if (moduleType === "rental") {
        await refetch();
      } else {
        await refetch();
      }
    }
    await profileRefatch();
    handleClose?.();
  };

  const handleRegistrationOnSuccess = (token) => {
    handleSuccess(token).then();
    handleClose();
  };

  const handleUpdateUserInfo = (values) => {
    mutate(values, {
      onSuccess: (res) => {
        handleSuccess(res?.token);
      },
      onError: onErrorResponse,
    });
  };

  const handleSubmitExistingUser = (value) => {
    const currentLoginInfo = loginInfoRef.current;
    // console.log("loginInfo from ref:", currentLoginInfo);

    let tempValues = {};

    if (currentLoginInfo?.is_email) {
      tempValues = {
        verified: value,
        login_type: currentLoginInfo?.login_type,
        email: userInfo?.email,
        guest_id: getGuestId(),
        token: jwtToken?.credential,
        unique_id: jwtToken?.clientId,
        medium: medium,
      };
    } else {
      const phoneOrEmail = currentLoginInfo?.phone || currentLoginInfo?.email;
      const isPhone = phoneOrEmail && phoneOrEmail.startsWith("+");

      tempValues = {
        verified: value,
        login_type: currentLoginInfo?.login_type || "otp",
        ...(isPhone ? { phone: phoneOrEmail } : { email: phoneOrEmail }),
        guest_id: getGuestId(),
      };
    }

    // console.log("Sending to API:", tempValues);

    loginMutation(tempValues, {
      onSuccess: (res) => {
        if (res?.is_personal_info === 0) {
          setModalFor("user_info");
        } else {
          handleSuccess(res?.token);
        }
      },
      onError: onErrorResponse,
    });
  };

  useEffect(() => {
  setUpRecaptcha();
  return () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };
}, []);

  const sendOTP = (response, setOtpData, setMainToken, phone) => {
    const phoneNumber = phone;
    if (!phoneNumber) {
      // console.error("Invalid phone number");
      return;
    }
    if (!window.recaptchaVerifier) {
      setUpRecaptcha();
    }
    const appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        setVerificationId(confirmationResult.verificationId);
        setOtpData({ type: phone });
        setMainToken(response);
      })
      .catch((error) => {
        // console.log("Error in sending OTP", error);
      });
  };

  const renderModalContent = () => {
    switch (modalFor) {
      case "sign-in":
        return (
          <SignIn
            handleClose={handleClose}
            configData={configData}
            setModalFor={setModalFor}
            setJwtToken={setJwtToken}
            setUserInfo={setUserInfo}
            handleSuccess={handleSuccess}
            setMedium={setMedium}
            zoneid={zoneid}
            setLoginInfo={updateLoginInfo}
            loginMutation={loginMutation}
            loginIsLoading={loginIsLoading}
            verificationId={verificationId}
            sendOTP={sendOTP}
            modalFor={modalFor}
          />
        );
      case "phone_modal":
        return (
          <>
            {user && jwt?.clientId && (
              <PhoneInputForm
                userInfo={user}
                jwtToken={jwt}
                configData={configData}
                medium={medium}
                handleRegistrationOnSuccess={handleRegistrationOnSuccess}
                setModalFor={setModalFor}
              />
            )}
          </>
        );
      case "user_info":
        return (
          <AddUserInfo
            formSubmitHandler={handleUpdateUserInfo}
            loginInfo={loginInfo}
            isLoading={isLoading}
            userInfo={userInfo}
          />
        );
      case "is_exist_user":
        return (
          <ExitingUser
            loginInfo={loginInfo}
            formSubmitHandler={handleSubmitExistingUser}
            isLoading={isLoading}
            setModalFor={setModalFor}
            userInfo={user}
            jwtToken={jwt}
            medium={medium}
            loginIsLoading={loginIsLoading}
            handleClose={handleClose}
          />
        );
      default:
        return (
          <SignUp
            configData={configData}
            setModalFor={setModalFor}
            verificationId={verificationId}
            sendOTP={sendOTP}
            handleClose={handleClose}
            loginMutation={loginMutation}
          />
        );
    }
  };

  return (
    <CustomModal handleClose={handleClose} openModal={open}>
      <div ref={recaptchaWrapperRef}>
        <div id="recaptcha-container"></div>
      </div>
      {renderModalContent()}
    </CustomModal>
  );
};

export default AuthModal;
