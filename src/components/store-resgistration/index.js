import React, { useEffect, useState } from "react";
import CustomContainer from "components/container";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { NoSsr, Typography, CssBaseline } from "@mui/material";
import { t } from "i18next";
import StoreStepper from "components/store-resgistration/StoreStepper";
import StoreRegistrationForm from "components/store-resgistration/StoreRegistrationForm";
import BusinessPlan from "components/store-resgistration/BusinessPlan";
import PaymentSelect from "components/store-resgistration/PaymentSelect";
import SuccessStoreRegistration from "components/store-resgistration/SuccessStoreRegistration";
// import Breadcrumb from "components/custom-component/Breadcrumb";
import { useDispatch, useSelector } from "react-redux";
import { usePostStoreRegistration } from "api-manage/hooks/react-query/store-registration/usePostStoreRegistration";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { usePostBusiness } from "api-manage/hooks/react-query/store-registration/usePostBusiness";
import { setActiveStep, setAllData } from "redux/slices/storeRegistrationData";
import useScrollToTop from "api-manage/hooks/custom-hooks/useScrollToTop";
import bkg from "../auth/asset/suba.jpg";
import HomeIcon from "@mui/icons-material/Home";
import { useRouter } from "next/router";
import { useTheme, useMediaQuery } from "@mui/material";

const StoreRegistration = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [resData, setResData] = useState({});
  const { flag, active } = router.query;
  const { allData, activeStep } = useSelector((state) => state.storeRegData);
  const [formValues, setFormValues] = useState({});
  const { mutate, isLoading: regIsloading } = usePostStoreRegistration();
  const { mutate: businessMutate, isLoading } = usePostBusiness();
  const theme = useTheme();
  const isSmallSize = useMediaQuery(theme.breakpoints.down("sm"));

  const forceScrollToTop = () => {
    // console.log("Scrolling to top"); // Added log for debugging
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to top when the component mounts
    forceScrollToTop();
    
    // Additional scroll to top after a delay to ensure component is fully rendered
    const timeoutId = setTimeout(() => {
      forceScrollToTop();
    }, 200);
    
    // One more scroll to top after component is fully loaded
    const finalTimeoutId = setTimeout(() => {
      forceScrollToTop();
    }, 500);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(finalTimeoutId);
    };
  }, []);

  useEffect(() => {
    // Scroll to top when active query parameter changes
    if (active === "active") {
      forceScrollToTop();
      
      const timer = setTimeout(() => {
        forceScrollToTop();
      }, 100);
      
      const finalTimer = setTimeout(() => {
        forceScrollToTop();
      }, 300);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(finalTimer);
      };
    }
  }, [active]);

  const formSubmit = (value) => {
    const tempData = { ...formValues, value };
    mutate(tempData, {
      onSuccess: (res) => {
        forceScrollToTop(); // Scroll to top after successful submission
        dispatch(setAllData({ ...allData, res }));
        setResData(res);
        if (res?.type === "commission") {
          const currentQuery = router.query;
          const updatedQuery = { ...currentQuery, flag: "success", active: "" };

          router.replace(
            {
              pathname: router.pathname,
              query: updatedQuery,
            },
            undefined,
            { shallow: true }
          );
          dispatch(setAllData(null));
        } else {
          dispatch(setActiveStep(2));
        }
      },
      onError: onErrorResponse,
    });
  };

  const submitBusiness = (values) => {
    dispatch(setAllData({ ...allData, values }));
    businessMutate(values, {
      onSuccess: (res) => {
        forceScrollToTop(); // Scroll to top after successful submission
        if (res) {
          if (res?.redirect_link && res?.payment !== "free_trial") {
            const redirect_url = `${res?.redirect_link}`;
            dispatch(setActiveStep(3));
            dispatch(setAllData(null));
            router.push(redirect_url);
          } else {
            const currentQuery = router.query;
            const updatedQuery = {
              ...currentQuery,
              flag: "success",
              active: "",
            };
            router.replace(
              {
                pathname: router.pathname,
                query: updatedQuery,
              },
              undefined,
              { shallow: true }
            );
            dispatch(setActiveStep(3));
            dispatch(setAllData(null));
          }
        }
      },
      onError: onErrorResponse,
    });
  };

  useEffect(() => {
    if (flag === "success") {
      dispatch(setActiveStep(3));
    }
  }, [flag]);

  useEffect(() => {
    if (active === "active") {
      dispatch(setActiveStep(0));
    }
  }, [active]);

  const handleActiveStep = () => {
    if (activeStep === 0) {
      return (
        <StoreRegistrationForm
          setActiveStep={setActiveStep}
          setFormValues={setFormValues}
        />
      );
    } else if (activeStep === 1) {
      return (
        <BusinessPlan
          setActiveStep={setActiveStep}
          formSubmit={formSubmit}
          isLoading={regIsloading}
        />
      );
    } else if (
      (activeStep === 3 && flag === "success") ||
      (activeStep === 3 && flag === "fail")
    ) {
      return <SuccessStoreRegistration flag={flag} />;
    } else if (activeStep === 2) {
      return (
        <PaymentSelect
          isLoading={isLoading}
          resData={resData}
          submitBusiness={submitBusiness}
        />
      );
    }
  };

  return (
    <>
      <CssBaseline />
      <NoSsr>
        <CustomContainer>
          <CustomStackFullWidth
            justify="center"
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "100vh",
              backgroundImage: `url(${bkg.src})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              padding: isSmallSize ? "20px" : "50px", // Adjust padding for small screens
              borderRadius: "12px",
              marginBottom: isSmallSize ? "0" : "0", // Avoid bottom gap
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              textAlign="center"
              mb={1}
              sx={{
                color: "#d72a00",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {t("Vendor Application")}
            </Typography>
            <StoreStepper flag={flag} activeStep={activeStep} />
            {/* <Breadcrumb
              sx={{ marginTop: "20px" }}
              items={[
                {
                  label: t("Vendor Application"),
                  href: null,
                  icon: <HomeIcon fontSize="small" />,
                },
              ]}
            /> */}
            {handleActiveStep()}
          </CustomStackFullWidth>
        </CustomContainer>
      </NoSsr>
    </>
  );
};

export default StoreRegistration;
