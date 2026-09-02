import H2 from "components/typographies/H2";
import H4 from "components/typographies/H4";
import React from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton } from "@mui/material";
const TripModalContent = ({
  content,
  title = "Edit Trip Type",
  onCloseModal,
}) => {
  return (
    <>
      <CustomStackFullWidth
        sx={{
          p: "10px",
          position: "relative",
          backgroundColor: "#ffffff",
          borderRadius: "12px !important",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <H2 text={title} sx={{ mb: "0px" }} />

          <IconButton
            onClick={onCloseModal}
            sx={{ position: "absolute", top: 0, right: 0 }}
          >
            <CloseIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </Box>
        {content}
      </CustomStackFullWidth>
    </>
  );
};

export default TripModalContent;
