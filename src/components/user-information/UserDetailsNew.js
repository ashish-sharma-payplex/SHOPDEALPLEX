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
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { CustomTypographyEllipsis } from "styled-components/CustomTypographies.style";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ProfileTabPopover from "components/profile/ProfileTabPopover";
import { CustomDateFormat } from "components/date-and-time-formators/CustomDateFormat";

const UserDetailsNew = ({
  data,
  page,
  deleteUserHandler,
  isLoadingDelete,
  setAccountDeleteStatus,
  accountDeleteStatus,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [openPopover, setOpenPopover] = useState(false);
  const anchorRef = useRef(null);

  const defaultUserImage = "/default-user.png";

  const userImage =
    data?.image_full_url && data?.image_full_url !== ""
      ? data.image_full_url
      : defaultUserImage;

  return (
    <>
      <Stack
        direction="column"
        alignItems="center"
        spacing={1.5}
        position="relative"
        sx={{ width: "220px", margin: "0 auto" }}   // ✅ SAME WIDTH
      >
        {/* PROFILE IMAGE */}
        <Stack
          width={{ xs: page === "inbox" ? "36px" : "72px", md: "104px" }}
          height={{ xs: page === "inbox" ? "36px" : "72px", md: "104px" }}
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
          <CustomImageContainer
            src={userImage}
            borderRadius="50%"
            objectfit="cover"
            width="90%"
            height="90%"
          />
        </Stack>

        {/* NAME + DATE */}
        <Stack alignItems="center">
          <CustomTypographyEllipsis
            fontWeight="600"
            fontSize="18px"
            textAlign="center"
          >
            {data ? (
              `${data?.f_name} ${data?.l_name || ""}`
            ) : (
              <Skeleton variant="text" width="120px" height="30px" />
            )}
          </CustomTypographyEllipsis>

          <Typography
            variant="body"
            color={theme.palette.neutral[400]}
            textAlign="center"
          >
            {t("Join")} {CustomDateFormat(data?.created_at)}
          </Typography>
        </Stack>

        {/* MOBILE MENU ICON */}
        {isSmall && (
          <Stack position="absolute" top="0" right="0">
            <IconButton
              ref={anchorRef}
              onClick={() => setOpenPopover(true)}
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

export default UserDetailsNew;
