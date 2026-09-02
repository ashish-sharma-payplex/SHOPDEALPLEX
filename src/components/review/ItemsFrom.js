import { useFormik } from "formik";
import { useState } from "react";

import { Box, Grid, Stack } from "@mui/material";
import {
  CustomColouredTypography,
  CustomStackFullWidth,
  CustomTypographyBold,
  CustomTypographyGray,
} from "../../styled-components/CustomStyles.style";

import LoadingButton from "@mui/lab/LoadingButton";
import { useTranslation } from "react-i18next";
import CustomTextFieldWithFormik from "../form-fields/CustomTextFieldWithFormik";

import Divider from "@mui/material/Divider";
import { useSelector } from "react-redux";
import CustomImageContainer from "../CustomImageContainer";

import toast from "react-hot-toast";

import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { useSubmitItemReview } from "api-manage/hooks/react-query/review/useSubmitItemReview";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import CustomRatings from "../search/CustomRatings";
import { useRouter } from "next/router";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const ItemForm = ({ data }) => {
  const { t } = useTranslation();
  const { configData } = useSelector((state) => state.configData);
  const itemImage = configData?.base_urls?.item_image_url;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const router = useRouter();

  // ✅ Actual API shape: data.review is either null, or an object
  // like { id, rating, comment, ... } when the item is already reviewed.
  const isAlreadyReviewed = Boolean(data?.review);
  const existingRating = data?.review?.rating ?? "";
  const existingComment = data?.review?.comment ?? "";

  const { mutate, isLoading, error } = useSubmitItemReview();
  const formik = useFormik({
    initialValues: {
      rating: isAlreadyReviewed ? existingRating : "",
      comment: isAlreadyReviewed ? existingComment : "",
    },
    onSubmit: async (values, helpers) => {
      try {
        if (!isAlreadyReviewed) {
          handleFormsubmit(values);
        }
      } catch (err) {}
    },
  });
  const handleChangeRatings = (value) => {
    formik.setFieldValue("rating", value);
  };
  const handleFormsubmit = (values) => {
    const formData = {
      ...values,
      delivery_man_id: null,
      item_id: data?.item_id,
      order_id: data?.order_id,
    };
    mutate(formData, {
      onSuccess: (response) => {
        toast.success(response?.message || t("Review submitted successfully"));
        setIsSubmitted(true);
        setShowThankYou(true);

        // Let the "Thank You" animation play before navigating away
        setTimeout(() => {
          router.push("/home");
        }, 1800);
      },
      onError: onErrorResponse,
    });
  };

  const languageDirection = localStorage.getItem("direction");
  return (
    <CustomStackFullWidth sx={{ position: "relative" }}>
      {/* ---------- Thank You success overlay ---------- */}
      {showThankYou && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            borderRadius: "16px",
            backgroundColor: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(2px)",
            animation: "itemform-fade-in 0.25s ease",
            "@keyframes itemform-fade-in": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
            "@keyframes itemform-pop-in": {
              "0%": { transform: "scale(0)", opacity: 0 },
              "60%": { transform: "scale(1.15)", opacity: 1 },
              "100%": { transform: "scale(1)", opacity: 1 },
            },
            "@keyframes itemform-ring-pulse": {
              "0%": { transform: "scale(0.9)", opacity: 0.6 },
              "100%": { transform: "scale(1.6)", opacity: 0 },
            },
          }}
        >
          <Box sx={{ position: "relative", width: 72, height: 72 }}>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                backgroundColor: "success.main",
                opacity: 0.35,
                animation: "itemform-ring-pulse 1.1s ease-out infinite",
              }}
            />
            <CheckCircleRoundedIcon
              sx={{
                position: "relative",
                width: 72,
                height: 72,
                color: "success.main",
                animation: "itemform-pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </Box>
          <CustomTypographyBold sx={{ fontSize: "16px", textAlign: "center" }}>
            {t("Thank you for your review!")}
          </CustomTypographyBold>
          <CustomTypographyGray sx={{ fontSize: "12.5px", textAlign: "center" }}>
            {t("Your feedback helps others shop better")}
          </CustomTypographyGray>
        </Box>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <CustomStackFullWidth
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
                gap={languageDirection === "rtl" ? "1rem" : "0rem"}
              >
                <CustomImageContainer
                  src={data?.image_full_url}
                  width="100px"
                  height="90px"
                />
                <Stack>
                  <CustomTypographyBold>
                    {data?.item_details?.name}
                  </CustomTypographyBold>
                  <CustomTypographyBold>
                    {getAmountWithSign(data?.item_details?.price)}
                  </CustomTypographyBold>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CustomTypographyGray sx={{ fontSize: "18px" }}>
                  {t("Quantity")}
                </CustomTypographyGray>
                <CustomTypographyGray sx={{ fontSize: "18px" }}>
                  :
                </CustomTypographyGray>
                <CustomColouredTypography
                  color="primary.main"
                  sx={{ fontSize: "18px" }}
                >
                  {data?.quantity}
                </CustomColouredTypography>
              </Stack>
            </CustomStackFullWidth>
          </Grid>
          <Grid item xs={12} md={12}>
            <Divider sx={{ width: "100%" }} />
          </Grid>
          <Grid item xs={12} md={12} align="center">
            <Stack alignItems="center">
              <CustomTypographyGray sx={{ fontSize: "18px" }}>
                {isAlreadyReviewed ? t("Your rating") : t("Rate the item")}
              </CustomTypographyGray>
              <CustomRatings
                handleChangeRatings={handleChangeRatings}
                ratingValue={formik.values.rating}
                fontSize={"2rem"}
                readOnly={isAlreadyReviewed}
                color="#FFB400"
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={12} align="center">
            <Stack
              alignItems="center"
              spacing={1}
              sx={{
                ".MuiInputBase-input": { height: "1.3em !important" },
                "& textarea": { resize: "none !important" },
              }}
            >
              <CustomTypographyGray sx={{ fontSize: "18px" }}>
                {isAlreadyReviewed ? t("Your review") : t("Share your opinion")}
              </CustomTypographyGray>

              <CustomTextFieldWithFormik
                type="textarea"
                label={t("Comment")}
                touched={formik.touched.comment}
                errors={formik.errors.comment}
                fieldProps={formik.getFieldProps("comment")}
                multiline
                rows={4}
                disabled={isAlreadyReviewed}
                value={formik.values.comment}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={12} mt="1rem">
            <LoadingButton
              fullWidth
              variant="contained"
              type="submit"
              loading={isLoading}
              disabled={isSubmitted || isAlreadyReviewed}
            >
              {isAlreadyReviewed ? t("Already Reviewed") : (isSubmitted ? t("Submitted") : t("Submit"))}
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
    </CustomStackFullWidth>
  );
};

ItemForm.propTypes = {};

export default ItemForm;