import { useTheme } from "@emotion/react";
import { LoadingButton } from "@mui/lab";
import { InputBase, Paper } from "@mui/material";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { onErrorResponse } from "../../../api-manage/api-error-response/ErrorResponses";
import { usePostNewsletterEmail } from "../../../api-manage/hooks/react-query/newsletter/usePostNewsletterEmail";
import { getCurrentModuleType } from "../../../helper-functions/getCurrentModuleType";
import { ModuleTypes } from "../../../helper-functions/moduleTypes";

const Subscribe = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const { t } = useTranslation();
  const { mutate, isLoading } = usePostNewsletterEmail();
  const theme = useTheme();

  const handleSuccess = () => {
    toast.success(t("Subscribed Successfully"), {
      id: "subscribed-toaster",
    });
    setEmailAddress("");
  };

  const handleSubmit = () => {
    // console.log("Subscribe button clicked, email:", emailAddress);
    const regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    if (regex.test(emailAddress) === true) {
      mutate(
        { email: emailAddress },
        {
          onSuccess: handleSuccess,
          onError: (error) => {
            onErrorResponse(error);
            toast.error(t("Subscription failed. Please try again."), {
              id: "subscribed-error",
            });
          },
        }
      );
    } else {
      toast.error(t("Please insert a valid email."), {
        id: "subscribed-email-error",
      });
    }
  };
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 1,
        p: getCurrentModuleType() === ModuleTypes.FOOD ? "0px" : "5px",
        display: "flex",
        alignItems: "center",
        backgroundColor: "white",
        width: { xs: "100%" },
        mr: "auto",
      }}
    >
      <InputBase
        sx={{
          ml: 1.5,
          mr: 1.5,
          flex: 1,
          color: "black",
          align: "center",
          height: "48px",
        }}
        value={emailAddress} 
        type="email"
        name="email"
        placeholder={t("Your Email")}
        onChange={(e) => setEmailAddress(e.target.value)}
      />
      <LoadingButton
        loading={isLoading}
        sx={{
          width: "100px",
          borderRadius: "5px",
          background: theme.palette.primary.main,
          color: "#ffffff",
          marginRight: "3px",
        }}
        variant="contained"
        type="button"
        aria-label="search"
        onClick={() => handleSubmit()}
      >
        {t("Subscribe")}
      </LoadingButton>
    </Paper>
  );
};

export default Subscribe;
              