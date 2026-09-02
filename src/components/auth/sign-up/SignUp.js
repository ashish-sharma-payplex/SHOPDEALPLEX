import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Link,
  InputLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import { getImageUrl } from "utils/CustomFunctions";
import CustomImageContainer from "../../CustomImageContainer";
import AuthHeader from "../AuthHeader";
import SignUpForm from "./SignUpForm";
import AcceptTermsAndConditions from "../AcceptTermsAndConditions";
import OtpForm from "./OtpForm";
import CustomModal from "../../modal";
import { t } from "i18next";
import { useTheme } from "@mui/material/styles";
import SinUp from "../asset/testing2.webp";
import { useFormik } from "formik";
import SignUpValidation from "./SignUpValidation";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { getGuestId } from "helper-functions/getToken";
import { useSignUp } from "api-manage/hooks/react-query/auth/useSignUp";
import { useFireBaseOtpVerify } from "api-manage/hooks/react-query/forgot-password/useFIreBaseOtpVerify";
import { useVerifyPhone } from "api-manage/hooks/react-query/forgot-password/useVerifyPhone";
import useGetProfile from "api-manage/hooks/react-query/profile/useGetProfile";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { getLoginUserCheck } from "components/auth/sign-in/loginHepler";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { setUser } from "redux/slices/profileInfo";
import { setSignInModalOpen, setWelcomeModal } from "redux/slices/utils";
import toast from "react-hot-toast";
import HomeIcon from "@mui/icons-material/Home";
import { useMediaQuery } from "@mui/material"; // Import useMediaQuery for responsiveness
import { signup_successfull } from "utils/toasterMessages";

const SignUp = (props) => {
  const { configData, setModalFor, sendOTP, handleClose, loginMutation } = props;
  const dispatch = useDispatch();
  const theme = useTheme();
  const [openModuleSelection, setOpenModuleSelection] = useState(false);
  const [otpData, setOtpData] = useState({ type: "" });
  const [mainToken, setMainToken] = useState(null);
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);   
  const [verificationId, setVerificationId] = useState(null);
  const [loginValue, setLoginValue] = useState(null);
  const guestId = getGuestId();

  const router = useRouter();

  const signUpFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      ref_code: "",
      tandc: false,
    },
    validationSchema: SignUpValidation(),
    onSubmit: async (values) => {
      try {
        formSubmitHandler(values);
      } catch (err) { }
    },
  });

  useEffect(() => {
    if (otpData?.type !== "") {
      setOpenOtpModal(true);
    }
  }, [otpData]);

  const userOnSuccessHandler = (res) => {
    dispatch(setUser(res));
  };

  const { refetch: profileRefetch } = useGetProfile(userOnSuccessHandler);

const handleTokenAfterSignUp = async (response) => {
  // console.log("handleTokenAfterSignUp response:", response);

  // ✅ Save token if exists
  if (response?.token) {
    localStorage.setItem("token", response.token);
  }

  // ✅ Success toast
  toast.success(t(signup_successfull));

  // ✅ Fetch profile if token exists
  if (response?.token) {
    try {
      await profileRefetch();
    } catch (err) {
      // console.error("Profile fetch failed:", err);
    }
  }

  // ✅ FORCE Sign In screen
  dispatch(setModalFor("sign-in"));
  dispatch(setSignInModalOpen(true));
};




  const { mutate, isLoading } = useSignUp();

  const formSubmitHandler = (values) => {
    let moduleData = localStorage.getItem("module");
    if (!moduleData) {
      const defaultModule = { id: "default_module_id", module_type: "default" };
      localStorage.setItem("module", JSON.stringify(defaultModule));
      moduleData = JSON.stringify(defaultModule);
    }

    const signUpData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
      confirm_password: values.confirm_password,
      ref_code: values.ref_code,
      guest_id: getGuestId(),
      module: JSON.parse(moduleData),
    };

    setLoginValue(signUpData);

 mutate(signUpData, {
  onSuccess: async (response) => {
    // console.log("✅ Mutation success response:", response);

    // ✅ Call centralized handleTokenAfterSignUp
    await handleTokenAfterSignUp(response);
  },
  onError: (error) => {
    // console.error("❌ Mutation error:", error);

    // ✅ Email / Phone already used errors show
    const errorsArray = error?.response?.data?.errors || [];
    if (errorsArray.length > 0) {
      errorsArray.forEach((err) => {
        if (err?.message) {
          toast.error(err.message);
          // console.log("⚠️ Signup error toast:", err.message);
        }
      });
    } else {
      toast.error("Something went wrong!");
    }
  }
});



  };

  const handleSignIn = () => {
    setModalFor("sign-in");
  };

  const handleClick = () => {
    window.open("/terms-and-conditions");
  };

  // Media query to hide the image on mobile screens and add padding to the image on tablet/laptop screens
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isLaptopOrTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  return (


    <Box
      sx={{
        width: "100%",
        minHeight: "90vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1100px",   // 🔒 Laptop size lock
          height: "500px",      // 🔒 Fixed height
          display: "flex",
          backgroundColor: "#fff",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
      {/* LEFT SIDE — FORM */}
      <Box
        sx={{
          width: "55%",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >

        <AuthHeader configData={configData} />

        {/* Close Icon positioned at top-right */}
        {/* <IconButton
  onClick={handleClose}
  sx={{
    zIndex: 99,
    position: "absolute",
    top: 16, // Adjusted to position the icon closer to the top
    right: 16, // Adjusted to position the icon slightly to the left from the right edge
    backgroundColor: theme.palette.neutral[100],
    borderRadius: "50%",
  }}
>
  <CloseIcon />
</IconButton> */}

        <Typography
          sx={{
            fontWeight: 500, // Thoda bold kiya taaki heading achhi lage
            fontSize: { xs: "0.7rem", md: "0.9rem" }, // Mobile: 0.7, Laptop: 0.9
            fontFamily: "Montserrat",
            textAlign: "center",
            pb: 1, // Bottom padding thoda kam kiya taaki niche wali field se gap kam ho
            mt: -2, // Negative margin se ye upar shift ho jayega
            // Alternatve agar margin kaam na kare: transform: "translateY(-10px)"
          }}
        >
          CREATE ACCOUNT
        </Typography>

        <Box component="form" noValidate onSubmit={signUpFormik.handleSubmit}>
          <SignUpForm
            configData={configData}
            handleOnChange={(value) =>
              signUpFormik.setFieldValue("phone", `+${value}`)
            }
            passwordHandler={(value) =>
              signUpFormik.setFieldValue("password", value)
            }
            fNameHandler={(value) =>
              signUpFormik.setFieldValue("name", value)
            }
            lNameHandler={(value) =>
              signUpFormik.setFieldValue("l_name", value)
            }
            emailHandler={(value) =>
              signUpFormik.setFieldValue("email", value)
            }
            confirmPasswordHandler={(value) =>
              signUpFormik.setFieldValue("confirm_password", value)
            }
            ReferCodeHandler={(value) =>
              signUpFormik.setFieldValue("ref_code", value)
            }
            signUpFormik={signUpFormik}
          />

          <AcceptTermsAndConditions
            handleCheckbox={(e) =>
              signUpFormik.setFieldValue("tandc", e.target.checked)
            }
            handleClick={handleClick}
            formikType={signUpFormik}
          />

          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            loading={isLoading}
            disabled={!signUpFormik.values.tandc}
            sx={{
              mb: 2,
              backgroundColor: "#1A914B",
              borderRadius: "8px",
              py: 0.8,
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 300,
              fontFamily: "Montserrat",
            }}
            id="recaptcha-container"
          >
            {t("Sign Up")}
          </LoadingButton>

          <Typography
            sx={{
              color: "#666",
              fontSize: "13px",
              fontFamily: "Montserrat",
              textAlign: "center",
            }}
          >
            {t("Already have an account?")}{" "}
            <Link
              onClick={handleSignIn}
              sx={{
                color: "#35BF03",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {t("Sign In")}
            </Link>
          </Typography>
        </Box>
      </Box>
      <IconButton
        onClick={handleClose}
        sx={{
          zIndex: 99,
          position: "absolute",
          top: 16, // Adjusted to position the icon closer to the top
          right: 16, // Adjusted to position the icon slightly to the left from the right edge
          backgroundColor: theme.palette.neutral[100],
          borderRadius: "50%",
        }}
      >
        <CloseIcon />
      </IconButton>
      {/* RIGHT SIDE — IMAGE */}
      <Box
        sx={{
          width: "45%",
          height:"92%",
          marginTop:"10px",
          backgroundImage: `url(${SinUp.src})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          flexShrink: 0,          // 🔒 Prevent shrinking
        }}
      />
</Box>
    </Box>

  );
};

export default React.memo(SignUp);
