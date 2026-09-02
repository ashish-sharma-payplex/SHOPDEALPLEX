import React from "react";
import PropTypes from "prop-types";
import CustomModal from "../../modal";
import { Paper, Typography } from "@mui/material";
import { getAmountWithSign } from "../../../helper-functions/CardHelpers";
import { CustomStackFullWidth } from "../../../styled-components/CustomStyles.style";
import Form from "./Form";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CustomImageContainer from "components/CustomImageContainer";
// import loyaltyImg from "/loyaltyStar.png"

const LoyaltyModal = (props) => {
  const {
    openModal,
    handleClose,
    t,
    theme,
    configData,
    loyalitydata,
    refetch,
    profileRefetch,
  } = props;

  const point = t("points");

  return (
    <CustomModal openModal={openModal} handleClose={handleClose}>
      <Paper
        sx={{
          p: 3,
          borderRadius: "12px",
          width: { xs: "100%", sm: "420px" },
          position: "relative",
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: theme.palette.neutral[100],
            boxShadow: 1,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <CustomStackFullWidth
          spacing={2}
          alignItems={{ xs: "center", md: "flex-start" }}
          textAlign={{ xs: "center", md: "left" }}
        >
          {/* Image */}
          <CustomImageContainer
            src={"/loyaltyStar.png"}
            width="86px"
            height="86px"
            alt="loyalty"
            sx={{
              alignSelf: { xs: "center", md: "flex-start" },
            }}
          />

          <Typography
            fontWeight={600}
            fontSize="15px"
            color={theme.palette.neutral[900]}
          >
            {t("Points will be converted to currency and sent to your wallet")}
          </Typography>

          <Typography
            fontWeight={700}
            fontSize="14px"
            color="success.main"
          >
            {`${configData?.loyalty_point_exchange_rate} ${point} = ${getAmountWithSign(
              1
            )}`}
          </Typography>

          <Form
            loyalitydata={loyalitydata}
            configData={configData}
            handleClose={handleClose}
            refetch={refetch}
            profileRefetch={profileRefetch}
            t={t}
          />
        </CustomStackFullWidth>
      </Paper>
    </CustomModal>
  );
};

LoyaltyModal.propTypes = {
  openModal: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default LoyaltyModal;
