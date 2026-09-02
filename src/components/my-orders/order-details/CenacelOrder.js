import React, { useState } from "react";

import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { t } from "i18next";
import DialogContent from "@mui/material/DialogContent";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import Radio from "@mui/material/Radio";
import DialogActions from "@mui/material/DialogActions";
import { Button, Stack } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import { WrapperForCustomDialogConfirm } from "../../custom-dialog/confirm/CustomDialogConfirm.style";
import { CustomStackFullWidth } from "../../../styled-components/CustomStyles.style";

const CancelOrder = ({
  cancelReason,
  orderLoading,
  setCancelReason,
  cancelReasonsData,
  setModalOpen,
  handleOnSuccess,
}) => {
  const [value, setValue] = useState();
  const handleChange = (event) => {
    setCancelReason(event.target.value);
  };
  const onClose = () => {
    setModalOpen(false);
  };

  return (
    <WrapperForCustomDialogConfirm width="22rem">
      <CustomStackFullWidth spacing={0}>
        <DialogTitle id="alert-dialog-title" sx={{ padding: "2px 24px" }}>
          <Typography textAlign="center" fontSize={"22px"} color={"#000000"}>
            {t("Order Cancellation")}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: "10px 24px" }}>
          <CustomStackFullWidth>
            <FormControl component="fieldset">
              <Typography fontWeight="500" fontSize={"17px"} paddingY=".5rem">
                {t("Please choose a reason")}
              </Typography>
              <RadioGroup
                aria-label="gender"
                name="gender1"
                value={cancelReason}
                onChange={handleChange}
              >
                {cancelReasonsData &&
                  cancelReasonsData?.data?.length > 0 &&
                  cancelReasonsData?.data?.map((reason) => {
                    return (
                      <FormControlLabel
                        key={reason?.id}
                        value={reason.reason}
                        checked={
                          reason.reason == cancelReason ? cancelReason : false
                        }
                        editable={true}
                        control={<Radio />}
                        label={reason.reason}
                      />
                    );
                  })}
              </RadioGroup>
            </FormControl>
          </CustomStackFullWidth>
        </DialogContent>
        <DialogActions sx={{ paddingX: "20px" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            width="100%"
            spacing={2}
          >
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                width: "100%",
                backgroundColor: (theme) => theme.palette.neutral[300],
                color: (theme) => theme.palette.neutral[1000],

                "&:hover": {
                  backgroundColor: (theme) => theme.palette.neutral[400],
                },
              }}
            >
              {t("Back")}
            </Button>
            <LoadingButton
              loading={orderLoading}
              onClick={handleOnSuccess}
              variant="contained"
              sx={{ width: "100%",backgroundColor:"#1A914B" }}

            >
              {t("Submit")}
            </LoadingButton>
          </Stack>
        </DialogActions>
      </CustomStackFullWidth>
    </WrapperForCustomDialogConfirm>
  );
};

export default CancelOrder;
