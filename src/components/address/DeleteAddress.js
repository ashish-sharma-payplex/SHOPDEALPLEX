import React from "react";
import { Button, Paper, Typography } from "@mui/material"; // ✅ Removed Image
import { useTranslation } from "react-i18next";
import useDeleteAddress from "../../api-manage/hooks/react-query/address/useDeleteAddress";
import CustomModal from "../modal";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import toast from "react-hot-toast";
import { onSingleErrorResponse } from "../../api-manage/api-error-response/ErrorResponses";
import LoadingButton from "@mui/lab/LoadingButton";
import mapMarker from "./assets/mapMarker.png";
import Image from "next/image"; // ✅ Correct import

const DeleteAddress = ({ open, handleClose, addressId, refetch }) => {
  const { t } = useTranslation();
  const { mutate: deleteMutation, isLoading } = useDeleteAddress();

  const deleteAddress = () => {
    deleteMutation(addressId, {
      onSuccess: () => {
        toast.success(t("Address deleted successfully."));
        refetch?.();
        handleClose?.();
      },
      onError: onSingleErrorResponse,
    });
  };

  return (
    <div>
      <CustomModal openModal={open} handleClose={handleClose}>
        <Paper sx={{ textAlign: "center", padding: "2rem" }}>
          <CustomStackFullWidth
            alignItems="center"
            justifyContent="center"
            spacing={3}
          >
            {/* ✅ Correct Image tag */}
            <Image
              src={mapMarker?.src || mapMarker}
              alt={t("map-image")}
              width={60}
              height={60}
            />

            <Typography fontWeight="bold" variant="h6">
              {t("Are you sure you want to delete this address?")}
            </Typography>

            <CustomStackFullWidth
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={2}
            >
              <Button
                sx={{
                  backgroundColor: (theme) => theme.palette.neutral[300],
                  color: (theme) => theme.palette.neutral[1000],
                  width: "120px",
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.neutral[400],
                  },
                }}
                onClick={handleClose}
              >
                {t("Cancel")}
              </Button>

              <LoadingButton
                loading={isLoading}
                sx={{
                  background: (theme) => theme.palette.error.light,
                  color: "white",
                  width: "120px",
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.error.dark,
                  },
                }}
                onClick={deleteAddress}
              >
                {t("Delete")}
              </LoadingButton>
            </CustomStackFullWidth>
          </CustomStackFullWidth>
        </Paper>
      </CustomModal>
    </div>
  );
};

export default DeleteAddress;
