import React, { useRef, useState } from "react";
import { Stack } from "@mui/system";
import CustomImageContainer from "../CustomImageContainer";
import {
  alpha,
  IconButton,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CustomDateFormat } from "../date-and-time-formators/CustomDateFormat";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { CustomTypographyEllipsis } from "styled-components/CustomTypographies.style";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ProfileTabPopover from "../profile/ProfileTabPopover";
import { getImageUrl } from "utils/CustomFunctions";

const UserDetails = ({
  data,
  page,
  deleteUserHandler,
  isLoadingDelete,
  setAccountDeleteStatus,
  accountDeleteStatus,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { configData } = useSelector((state) => state.configData);
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [openPopover, setOpenPopover] = useState(false);
  const anchorRef = useRef(null);
  const handleOpenPopover = () => {
    setOpenPopover(true);
  };


  const defaultUserImage = "/default-user.png";

  const userImage =
    data?.image_full_url && data?.image_full_url !== ""
      ? data.image_full_url
      : defaultUserImage;

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2.5}
        position="relative"
      >
        <Stack
          width={{ xs: page === "inbox" ? "40px" : "80px", md: "120px" }} // pehle 50/100/140
          height={{ xs: page === "inbox" ? "40px" : "80px", md: "120px" }}
          sx={{
            border: "2px solid",
            borderColor: (theme) => theme.palette.neutral[100],
            borderRadius: "50%",
            backgroundColor: alpha(theme.palette.primary.dark, 0.3),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* <CustomImageContainer
            src={userImage}
            borderRadius="50%"
            objectfit="cover"
            width="90%"
            height="90%"
          /> */}
        </Stack>


        <Stack justifyContent="start" width="150px">
          <CustomTypographyEllipsis fontWeight="600" fontSize="18px">
            {data ? (
              `${data?.f_name} ${data?.l_name ? data?.l_name : ""}`
            ) : (
              <Skeleton variant="text" width="200px" height="30px" />
            )}
          </CustomTypographyEllipsis>
          <Typography variant="body" color={theme.palette.neutral[400]}>
            {t("Join")} {CustomDateFormat(data?.created_at)}
          </Typography>
        </Stack>
        {isSmall && (
          <Stack position="absolute" top="0px" left="unset" right="10px">
            <IconButton
              ref={anchorRef}
              onClick={() => handleOpenPopover()}
              sx={{
                backgroundColor: (theme) => theme.palette.neutral[100],
                padding: "3px",
                borderRadius: "2px",
              }}
            >
              <GridViewRoundedIcon color="primary" />
            </IconButton>
          </Stack>
        )}
      </Stack>
      <ProfileTabPopover
        anchorEl={anchorRef.current}
        onClose={() => setOpenPopover(false)}
        open={openPopover}
        page={page}
        deleteUserHandler={deleteUserHandler}
        setAccountDeleteStatus={setAccountDeleteStatus}
        accountDeleteStatus={accountDeleteStatus}
        isLoadingDelete={isLoadingDelete}
      />
    </>
  );
};

export default UserDetails;
