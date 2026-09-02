import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import * as Yup from "yup"
import { useFormik } from "formik";
import ValidationSechemaProfile from "./Validation";
import IconButton from "@mui/material/IconButton";
import toast from "react-hot-toast";
import { useDeleteProfile } from "api-manage/hooks/react-query/profile/useDeleteProfile";
import { useRouter } from "next/router";
import ImageUploaderWithPreview from "../../single-file-uploader-with-preview/ImageUploaderWithPreview";
import useUpdateProfile from "../../../api-manage/hooks/react-query/profile/useUpdateProfile";
import {
  onErrorResponse,
  onSingleErrorResponse,
} from "api-manage/api-error-response/ErrorResponses";
import { setUser } from "redux/slices/profileInfo";
import { useDispatch } from "react-redux";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CustomAlert from "../../alert/CustomAlert";
import FormSubmitButton from "../FormSubmitButton";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import VerifiedIcon from "components/profile/VerifiedIcon";
import CustomModal from "components/modal";
import OtpForm from "components/auth/sign-up/OtpForm";
import { auth } from "firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useFireBaseOtpVerify } from "api-manage/hooks/react-query/forgot-password/useFIreBaseOtpVerify";
import CircularProgress from "@mui/material/CircularProgress";

export const BackIconButton = styled(IconButton)(({ theme }) => ({
  // padding: "10px",
  borderRadius: "4px",
  justifyContent: "center",
  fontSize: "13px",
  color: theme.palette.primary.main,
}));
export const ResetButton = styled(Button)(({ theme }) => ({
  borderRadius: "5px",
  borderColor: theme.palette.neutral[400],
  color: theme.palette.neutral[400],
  marginRight: "5px",
  paddingInline: "30px",
}));

export const convertValuesToFormData = (values, resData, verificationId) => {
  const { name, phone, email, image, button_type, reset_token, password } =
    values;
  let formData = new FormData();
  if (values?.reset_token) {
    formData.append("name", name ?? resData?.name);
    // formData.append('l_name', l_name ?? resData?.l_name)
    formData.append(
      "phone",
      resData?.verification_on === "email"
        ? resData?.phone
        : phone ?? resData?.phone
    );
    formData.append("email", email ?? resData?.email);
    formData.append("image", image ?? resData?.image ?? resData?.image);
    formData.append("button_type", button_type ?? resData?.button_type);
    formData.append("otp", reset_token ? reset_token : null);
    formData.append(
      "verification_medium",
      reset_token ? resData?.verification_medium : null
    );
    formData.append(
      "verification_on",
      reset_token ? resData?.verification_on : null
    );
    formData.append("session_info", verificationId);
  } else {
    formData.append("name", name ?? resData?.name);
    formData.append("phone", phone ?? resData?.phone);
    formData.append("email", email ?? resData?.email);
    formData.append("image", image ?? resData?.image ?? resData?.image);
    if (button_type) {
      formData.append("button_type", button_type);
    } else if (resData?.button_type) {
      formData.append("button_type", resData.button_type);
    }

    formData.append("password", password ?? resData?.password);
  }
  return formData;
};
const BasicInformationForm = ({
  data,
  configData,
  t,
  refetch,
  setEditProfile,
  formSubmit,
  handleCloseEmail,
  handleClosePhone,
  handleClick,
}) => {

  const fileInputRef = useRef(null);

  const handleReportClick = (type) => {
    // console.log("===== VERIFY CLICK =====");
    // console.log("Verification Type:", type);

    if (type === "email") {
      // console.log("Email to verify:", profileFormik.values.email);
      // console.log("Is Email Already Verified:", data?.is_email_verified);
    }

    if (type === "phone") {
      // console.log("Phone to verify:", profileFormik.values.phone);
      // console.log("Is Phone Already Verified:", data?.is_phone_verified);
    }

    // console.log("Formik Values:", profileFormik.values);
    // console.log("Res Data (last API):", resData);
    // console.log("Verification Id:", verificationId);
    // console.log("========================");
  };


  const [openModal, setOpenModal] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [openEmail, setOpenEmail] = React.useState(false);
  const [phoneVerified, setPhoneVerified] = useState(
    data?.is_phone_verified === 1
  );
  const [verificationId, setVerificationId] = useState(null);
  const [resData, setResData] = React.useState([]);
  const [loginValue, setLoginValue] = useState(null);
  const recaptchaWrapperRef = useRef(null);
  const imageContainerRef = useRef();
  const { f_name, l_name, phone, email, image_full_url } = data;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState({
    phone: false,
    email: false,
  });




  const customerImageUrl = configData?.base_urls?.customer_image_url;
  const dispatch = useDispatch();
  const profileFormik = useFormik({
    initialValues: {
      name: f_name ? `${f_name} ${l_name ? l_name : ""}` : "",
      email: email ? email : "",
      phone: phone ? phone : "",
      image: image_full_url ? image_full_url : "",  // ✅
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string().required("Phone is required"),
      image: Yup.mixed().required("Profile image is required"), // ✅ Add this
      password: Yup.string(),
      confirm_password: Yup.string(),
    }),
    onSubmit: async (values) => {
      formSubmitOnSuccess(values);
    },
  });

  const { mutate: fireBaseOtpMutation, isLoading: fireIsLoading } =
    useFireBaseOtpVerify();
  const setUpRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-update",
        {
          size: "invisible",
          callback: (response) => {
            // console.log("Recaptcha verified", response);
          },
          "expired-callback": () => {
            window.recaptchaVerifier?.reset();
          },
        },
        auth
      );
    } else {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
      // setUpRecaptcha()
    }
  };

  useEffect(() => {
    setUpRecaptcha();
    return () => {
      if (recaptchaWrapperRef.current) {
        //recaptchaWrapperRef.current.clear(); // Clear Recaptcha when component unmounts
        recaptchaWrapperRef.current = null;
      }
    };
  }, []);
  const sendOTP = (response, values) => {
    const phoneNumber = values?.phone;
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
        setOpen(true);
      })
      .catch((error) => {
        toast.error(error.message);
        // console.log("Error in sending OTP", error);
      });
  };
  const { mutate: profileUpdateByMutate, isLoading } = useUpdateProfile();
  const formSubmitOnSuccess = (values) => {
    const onSuccessHandler = (response) => {
      // console.log("errroooorrrrr");
      if (response) {
        setResData({
          ...resData,
          ...response,
          name: values?.name,
          // l_name: l_name,
          phone: values?.phone,
          email: values?.email,
          image: values?.image,
          button_type: values?.button_type,
        });
        if (response?.otp_send) {
          if (response?.verification_on === "phone") {
            setVerifyLoading((prev) => ({ ...prev, phone: false }));
            if (configData?.firebase_otp_verification === 1) {
              sendOTP(response, values);
            } else {
              setOpen(true);
            }
          } else {
            setVerifyLoading((prev) => ({ ...prev, email: false }));
            setOpenEmail(true);
          }
        } else {
          setOpenEmail(false);
          setOpen(false);
          toast.success(response?.message);
          refetch();
          handleClick();
        }
      }
    };

    const formData = convertValuesToFormData(values, resData, verificationId);
    profileUpdateByMutate(formData, {
      onSuccess: onSuccessHandler,
      onError: (error) => {
        setVerifyLoading({ phone: false, email: false });

        let backendMessage = "Something went wrong"; // fallback

        if (
          error?.response?.data?.errors &&
          Array.isArray(error.response.data.errors)
        ) {
          const imageError = error.response.data.errors.find(
            (err) => err.code === "image"
          );
          if (imageError && imageError.message) {
            backendMessage = imageError.message;
          }
        } else if (error?.response?.data?.message) {
          backendMessage = error.response.data.message;
        }

        toast.error(backendMessage);

        profileFormik.setFieldTouched("image", true);
        profileFormik.setFieldError("image", backendMessage);
      }



    });
  };
  const singleFileUploadHandlerForImage = (value) => {
    profileFormik.setFieldValue("image", value.currentTarget.files[0]);
  };
  const imageOnchangeHandlerForImage = (value) => {
    profileFormik.setFieldValue("image", value);
  };
  const router = useRouter();
  const onSuccessHandlerForUserDelete = (res) => {
    if (res?.errors) {
      toast.error(res?.errors?.[0]?.message);
    } else {
      localStorage.removeItem("token");
      toast.success(t("Account has been deleted"));
      dispatch(setUser(null));
      router.push("/", undefined, { shallow: true });
    }
    setOpenModal(false);
  };
  const { mutate, isLoading: isLoadingDelete } = useDeleteProfile(
    onSuccessHandlerForUserDelete
  );
  const deleteUserHandler = () => {
    mutate();
  };
  const handleReset = () => {
    profileFormik.setFieldValue("name", "");
    profileFormik.setFieldValue("l_name", "");
    profileFormik.setFieldValue("email", "");
    profileFormik.setFieldValue("password", "");
  };
  const handleVerified = (type) => {
    if (type === "email") {
      formSubmitOnSuccess({ ...profileFormik?.values, button_type: "email" });
    } else {
      formSubmitOnSuccess({ ...profileFormik?.values, button_type: "phone" });
    }
  };
  return (
    <>
      <Grid item md={12} xs={12}>
        <div ref={recaptchaWrapperRef}>
          <div id="recaptcha-update"></div>
        </div>

        {/* Header with Back Arrow */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ marginBottom: "20px" }}
        >
          <IconButton
            onClick={() => setEditProfile(false)}
            sx={{ padding: "0px", color: "black" }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="700" fontSize="18px">
            {t("Edit Personal Details")}
          </Typography>
        </Stack>
      </Grid>

      <form noValidate onSubmit={profileFormik.handleSubmit} style={{ width: "100%" }}>
        <Grid
          container
          spacing={{ xs: 2, sm: 2, md: 3 }}
          sx={{ padding: { xs: "0px", md: "0px 20px" } }}
        >
          {/* Centered Profile Image with Camera Icon */}
          <Grid item xs={12} textAlign="center">

            <Stack alignItems="center" spacing={1}>

              {/* IMAGE + ICON FIXED BOX */}
              <Box
                sx={{
                  position: "relative",
                  width: "120px",
                  height: "120px",
                }}
              >
                <ImageUploaderWithPreview
                  file={profileFormik.values.image}
                  onChange={singleFileUploadHandlerForImage}
                  imageOnChange={imageOnchangeHandlerForImage}
                  width="120px"
                  borderRadius="50%"
                />

                {/* Camera Icon */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    backgroundColor: "#009846",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid white",
                    cursor: "pointer",
                    zIndex: 2
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AddAPhotoIcon sx={{ color: "white", fontSize: "16px" }} />
                </Box>
              </Box>

              {/* ERROR MESSAGE */}
              {profileFormik.touched.image && profileFormik.errors.image && (
                <Typography fontSize="12px" color="error.main">
                  {profileFormik.errors.image}
                </Typography>
              )}

            </Stack>

            {/* USER NAME */}
            <Typography fontWeight="700" fontSize="18px" color="#2D3748" mb={3}mt={1}>
              {profileFormik.values.name || "User Name"}
            </Typography>

          </Grid>

          {/* User Name Field (Full Width) */}
          <Grid item xs={12}>
            <Typography variant="body2" fontWeight="600" mb={1}>{t("User Name*")}</Typography>
            <TextField
              sx={{ width: "100%" }}
              InputProps={{ style: { height: "45px", borderRadius: "8px" } }}
              name="name"
              placeholder={t("Enter User Name")}
              value={profileFormik.values.name}
              onChange={profileFormik.handleChange}
              error={profileFormik.touched.name && Boolean(profileFormik.errors.name)}
              helperText={profileFormik.touched.name && profileFormik.errors.name}
            />
          </Grid>

          {/* Email Field */}
          <Grid item md={6} xs={12}>
            <Typography variant="body2" fontWeight="600" mb={1}>{t("Email Id*")}</Typography>
            <Stack position="relative">
              <TextField
                sx={{ width: "100%" }}
                InputProps={{ style: { height: "45px", borderRadius: "8px" } }}
                name="email"
                placeholder={t("Enter Email id")}
                value={profileFormik.values.email}
                onChange={profileFormik.handleChange}
                error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                helperText={profileFormik.touched.email && profileFormik.errors.email}
              />
              <Box sx={{ position: "absolute", right: "10px", top: "10px" }}>
                {verifyLoading.email ? (
                  <CircularProgress size={20} />
                ) : data?.is_email_verified === 1 &&
                  email === profileFormik?.values.email ? (
                  <VerifiedIcon sx={{ color: "#009846" }} />
                ) : (
                  <ReportProblemIcon
                    sx={{ color: "error.main", cursor: "pointer" }}
                    onClick={() => {
                      setVerifyLoading((prev) => ({ ...prev, email: true }));
                      handleVerified("email");
                    }}
                  />
                )}
              </Box>

            </Stack>
          </Grid>

          {/* Phone Field */}
          <Grid item md={6} xs={12}>
            <Typography variant="body2" fontWeight="600" mb={1}>{t("Phone Number*")}</Typography>
            <Stack position="relative">
              <TextField
                name="phone"
                disabled={data?.is_phone_verified === 1}
                placeholder={t("Enter Phone Number")}
                sx={{ width: "100%" }}
                InputProps={{
                  style: { height: "45px", borderRadius: "8px" },
                  inputMode: "numeric"
                }}
                value={profileFormik.values.phone}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, "");
                  profileFormik.setFieldValue("phone", val);
                }}
              />
              <Box sx={{ position: "absolute", right: "10px", top: "10px" }}>
                {verifyLoading.phone ? (
                  <CircularProgress size={20} />
                ) : data?.is_phone_verified === 1 ? (
                  <VerifiedIcon sx={{ color: "#009846" }} />
                ) : (
                  <ReportProblemIcon
                    sx={{ color: "error.main", cursor: "pointer" }}
                    onClick={() => {
                      setVerifyLoading((prev) => ({ ...prev, phone: true }));
                      handleVerified("phone");
                    }}
                  />
                )}
              </Box>

            </Stack>
          </Grid>

          {/* Password Fields */}
          {configData?.centralize_login?.manual_login_status === 1 && (
            <>
              <Grid item md={6} xs={12}>
                <Typography variant="body2" fontWeight="600" mb={1}>{t("Password*")}</Typography>
                <TextField
                  sx={{ width: "100%" }}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={profileFormik.values.password}
                  onChange={profileFormik.handleChange}
                  InputProps={{
                    style: { height: "45px", borderRadius: "8px" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Typography variant="body2" fontWeight="600" mb={1}>{t("Confirm Password*")}</Typography>
                <TextField
                  sx={{ width: "100%" }}
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={profileFormik.values.confirm_password}
                  onChange={profileFormik.handleChange}
                  InputProps={{
                    style: { height: "45px", borderRadius: "8px" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setConfirmShowPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </>
          )}

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Stack
              direction="row"
              justifyContent="space-between"
              mt={4}
              mb={2}
              spacing={2} // same spacing as before
            >
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  borderColor: "#009846",
                  color: "#009846",
                  borderRadius: "8px",
                  padding: {
                    xs: "6px 18px", // ✅ mobile
                    sm: "6px 18px", // ✅ tablet
                    md: "8px 40px", // ✅ laptop (original)
                  },
                  fontSize: {
                    xs: "13px",
                    sm: "13px",
                    md: "14px",
                  },
                  textTransform: "none",
                  fontWeight: "600",
                }}
              >
                {t("Reset")}
              </Button>

              <Button
                variant="contained"
                type="submit"
                disabled={isLoading}
                sx={{
                  backgroundColor: "#009846",
                  color: "white",
                  borderRadius: "8px",
                  padding: {
                    xs: "6px 18px", // ✅ mobile
                    sm: "6px 18px", // ✅ tablet
                    md: "8px 40px", // ✅ laptop (original)
                  },
                  fontSize: {
                    xs: "13px",
                    sm: "13px",
                    md: "14px",
                  },
                  textTransform: "none",
                  fontWeight: "600",
                  "&:hover": { backgroundColor: "#007a38" },
                }}
              >
                {isLoading ? t("Updating...") : t("Update Profile")}
              </Button>
            </Stack>
          </Grid>


        </Grid>
      </form>

      {/* Modals are kept exactly as original */}
      {open && (
        <CustomModal openModal={open} handleClose={() => setOpen(false)} setModalOpen={setOpen}>
          <OtpForm
            data={profileFormik.values.phone}  // ✅ correct
            handleClose={() => setOpen(false)}
            formSubmitHandler={formSubmitOnSuccess}
            loginValue={resData}
            reSendOtp={formSubmitOnSuccess}
          />
        </CustomModal>
      )}
      {openEmail && (
        <CustomModal handleClose={() => setOpenEmail(false)} openModal={openEmail} setModalOpen={setOpenEmail}>
          <OtpForm
            data={profileFormik?.values.email}
            handleClose={() => setOpenEmail(false)}
            formSubmitHandler={formSubmitOnSuccess}
            loginValue={resData}
            reSendOtp={formSubmitOnSuccess}
          />
        </CustomModal>
      )}
    </>
  );
};
export default BasicInformationForm;
