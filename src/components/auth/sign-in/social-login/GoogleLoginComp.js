import jwt_decode from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { google_client_id } from "utils/staticCredential";
import { Stack, styled } from "@mui/system";
import CustomImageContainer from "components/CustomImageContainer";
import { alpha, Typography, useMediaQuery, useTheme } from "@mui/material";
import googleLatest from "../../asset/Google_Logo.png";
import { t } from "i18next";
import { getGuestId } from "helper-functions/getToken";

// Custom styled button with rounded background for Google logo
export const CustomGoogleButton = styled(Stack)(({ theme, width, height }) => ({
  width: width,
  // backgroundColor: alpha(theme.palette.neutral[400], 0.1),
  height: height ?? "45px",
  justifyContent: "center",
  borderRadius: "5px",
  padding: "10px",
  color: theme.palette.neutral[600],
  border: "1px",
  borderColor: alpha(theme.palette.primary.main, 0.6),
  alignItems: "center",
  cursor: "pointer",
}));

const GoogleLoginComp = (props) => {
  const {
    handleSuccess,
    socialLength,
    state,
    setJwtToken,
    setUserInfo,
    setModalFor,
    setMedium,
    loginMutation,
    setLoginInfo,
  } = props;
  const theme = useTheme();
  const [loginValue, setLoginValue] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [otpData, setOtpData] = useState({ phone: "" });
  const buttonDiv = useRef(null);
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [buttonWidth, setButtonWidth] = useState(isSmall ? "300px" : "350px"); // Default width
  const clientId = google_client_id;

  // Update button size based on socialLength
  useEffect(() => {
    switch (socialLength) {
      case 1:
        setButtonWidth("300px");
        break;
      case 2:
        setButtonWidth("147px");
        break;
      case 3:
        setButtonWidth("50px");
        break;
      default:
        setButtonWidth("350px !important");
    }
    if (state?.status === "social") {
      setButtonWidth("306px !important");
    }
  }, [socialLength, state?.status]);

  const handleToken = (token) => {
    if (token) {
      handleSuccess(token);
    } else {
      setMedium("google");
      setModalFor("phone_modal");
      setOpenModal(true);
    }
  };

  useEffect(() => {
    if (otpData?.phone !== "") {
      setOpenOtpModal(true);
    }
  }, [otpData]);

  const handlePostRequestOnSuccess = (response) => {
    const res = response;
    if (response?.is_exist_user === null && response?.is_personal_info === 1) {
      handleToken(response?.token);
    } else if (response?.is_personal_info === 0) {
      setLoginInfo({ ...res, email: response?.email, is_email: true });
      setModalFor("user_info");
    } else {
      setMedium("google");
      setLoginInfo({ ...res, email: response?.email, is_email: true });
      setModalFor("is_exist_user");
    }
  };

  const handleCallBackResponse = (res) => {
    const userObj = jwt_decode(res.credential);

    setJwtToken(res);
    setUserInfo(userObj);
    const tempValue = {
      email: res?.email ?? userObj.email,
      token: res?.token ?? res.credential,
      unique_id: res?.unique_id ?? res?.clientId,
      medium: res?.medium ?? "google",
      login_type: res?.login_type ?? "social",
      guest_id: loginValue?.guest_id ?? getGuestId(),
    };
    setLoginValue(tempValue);
    loginMutation(tempValue, {
      onSuccess: (res) =>
        handlePostRequestOnSuccess({
          ...res,
          email: userObj.email,
        }),
      onError: (error) => {
        error?.response?.data?.errors?.forEach((item) =>
          item.code === "email" ? handleToken() : toast.error(item.message)
        );
      },
    });

    const handleRegistrationOnSuccess = (token) => {
      setOpenModal(false);
      handleSuccess(token);
    };
  };

  useEffect(() => {
    // Initialize Google button
    if (typeof window !== undefined) {
      window?.google?.accounts?.id?.initialize({
        client_id: clientId,
        callback: handleCallBackResponse,
      });
      window?.google?.accounts?.id?.renderButton(buttonDiv.current, {
        theme: "outline",
        size: "large", // Set button size to 'large' for better scaling
        logo_alignment: "left",
      });
    }
  }, []);

  const handleView = () => {
    return (
      <CustomGoogleButton direction="row" spacing={1} width="100%" height="50px">
        {/* Custom image container with circular background */}
        <div
          style={{
            backgroundColor: "#E8F4ED", // Set background color
            borderRadius: "50%", // Make it circular
            padding: "8px", // Optional padding to make the circle larger around the logo
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CustomImageContainer
            src={googleLatest.src}
            alt="Google"
            height="24px"
            width="24px"
            objectFit="cover"
          />
        </div>
        <Typography fontSize="14px" fontWeight="600">
          {/* Optionally, hide the text */}
        </Typography>
      </CustomGoogleButton>
    );
  };

  return (
    <Stack
      width={socialLength === 3 && state?.status !== "social" ? "45px" : "100%"}
      maxWidth="355px"
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          transform: "scale(0.9)", // Adjust scale here
          transformOrigin: "center center", // Center the scaling
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            filter: "opacity(0)",
            zIndex: 9999,
          }}
        >
          <div ref={buttonDiv} />
        </div>
        {handleView()}
      </div>
    </Stack>
  );
};

export default GoogleLoginComp;
