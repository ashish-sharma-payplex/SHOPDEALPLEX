import { alpha } from "@mui/system";
import H1 from "components/typographies/H1";
import { CustomButton } from "styled-components/CustomStyles.style";
import { useTranslation } from "react-i18next";
import UserInfo from "./UserInfo";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import {Typography} from "@mui/material";
import IdentityInfo from "./IdentityInfo";
import AccountInfo from "./AccountInfo";
import DeliverymanFormWrapper from "./DeliverymanFormWrapper";
import { useFormik } from "formik";
import { useState } from "react";
import { usePostDeliveryManRegisterInfo } from "api-manage/hooks/react-query/deliveryman-registration/useRegisterDeliveryMan";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import toast from "react-hot-toast";
import deliveryManValidationSchema from "./validation/delivery-validation-schema";
import { useRouter } from "next/router";
import {
  ActonButtonsSection,
  FormSection,
  RegistrationCardWrapper,
  TitleTopSection,
} from "./CustomStylesDeliveryman";
import { objectToFormData } from "helper-functions/objectToFormData";
import { FORM_TITLE } from "./constants";
import useScrollToTop from "api-manage/hooks/custom-hooks/useScrollToTop";
import bkg from "../auth/asset/suba.jpg"


const DeliveryManComponent = ({ configData }) => {
  useScrollToTop();
  const router = useRouter();
  const { t } = useTranslation();
  const [image, setImage] = useState("");
  const [identityImage, setIdentityImage] = useState("");
  const { mutate: registerDeliveryman, isLoading } =
    usePostDeliveryManRegisterInfo();
  const deliveryManFormik = useFormik({
    initialValues: {
      f_name: "",
      l_name: "",
      email: "",
      earning: "",
      zone_id: "",
      vehicle_id: "",
      identity_type: "",
      identity_number: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: deliveryManValidationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const { confirm_password, ...modifiedValues } = values;
        registerDeliveryman(objectToFormData(modifiedValues), {
          onSuccess: (res) => {
            toast.success(res.message, {
              id: res.message,
            });
            helpers.resetForm();
            setImage("");
            setIdentityImage("");
            router.push("/home");
          },
          onError: onErrorResponse,
        });
      } catch (err) {
        // console.error(err);
      }
    },
  });
  const handleFieldChange = (field, value) => {
    deliveryManFormik.setFieldValue(field, value);
  };

  const handleReset = () => {
    deliveryManFormik.resetForm();
    setImage("");
    setIdentityImage("");
  };
  return (
    <>
   <CustomStackFullWidth
        sx={{
          border: `1px solid rgb(255, 255, 255)`,
          padding: { xs: "1rem", md: "60px" },
          backgroundImage: `url(${bkg.src})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          paddingBottom:"20px",
        }}
      > 
      <TitleTopSection>
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
                    Delivery Man Registration
                  </Typography>
      </TitleTopSection>

      <form onSubmit={deliveryManFormik.handleSubmit} >
        <RegistrationCardWrapper sx={{background:"rgb(255, 255, 255)"}}>
          <FormSection>
            <DeliverymanFormWrapper
              title={FORM_TITLE.userInfo}
              component={
                <UserInfo
                  {...{
                    deliveryManFormik,
                    image,
                    setImage,
                  }}
                  handleFieldChange={handleFieldChange}
                />
              }
            />
            <DeliverymanFormWrapper
              title={FORM_TITLE.identityInfo}
              component={
                <IdentityInfo
                  {...{
                    deliveryManFormik,
                    identityImage,
                    setIdentityImage,
                  }}
                  handleFieldChange={handleFieldChange}
                />
              }
            />
            <DeliverymanFormWrapper
              title={FORM_TITLE.accountInfo}
              component={
                <AccountInfo
                  configData={configData}
                  {...{
                    deliveryManFormik,
                  }}
                  handleFieldChange={handleFieldChange}
                />
              }
            />
          </FormSection>

          <ActonButtonsSection>
            <CustomButton
              onClick={handleReset}
              disabled={isLoading}
              sx={{
                bgcolor: (theme) => alpha(theme.palette.neutral[200], 0.4),
                color: (theme) => theme.palette.primary.dark,
                px: "30px",
                borderRadius: "5px",
              }}
            >
              {t("Reset")}
            </CustomButton>
            <CustomButton
              type="submit"
              disabled={isLoading}
              sx={{
                background: "#FF6600",
                color: (theme) => theme.palette.whiteContainer.main,
                px: "30px",
                borderRadius: "5px",
                fontWeight: "500",
                fontSize: "14px",
                "&:hover": {
                  background: (theme) => theme.palette.primary.dark, // set hover color here
                },
              }}
            >
              {t(isLoading ? "Submitting..." : "Submit Information")}
            </CustomButton>
          </ActonButtonsSection>
        </RegistrationCardWrapper>
      </form>
      </CustomStackFullWidth>
    </>
  );
};
export default DeliveryManComponent;
