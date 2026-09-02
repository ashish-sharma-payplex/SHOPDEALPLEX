import { useTheme } from "@emotion/react";
import {
  Grid,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Box, Stack, styled } from "@mui/system";

import { useRouter } from "next/router";
import { getModuleId } from "helper-functions/getModuleId";
import CustomImageContainer from "../CustomImageContainer";
import Link from "next/link";

const btoaSafe = (str) =>
  typeof window !== "undefined"
    ? window.btoa(str)
    : Buffer.from(str).toString("base64");


const FeatureImageBox = styled(Stack)(({ theme }) => ({
  width: "100%",
  paddingTop: "10px",
  borderRadius: "50%",
  cursor: "pointer",
  transition: "border-radius 0.5s ease",
  "&:hover": {
    borderRadius: "50px",
  },
}));
const FoodCategoryCard = (props) => {
  const {
    categoryImage,
    name,
    id,
    categoryImageUrl,
    height,
    onlyshimmer,
    slug,
    onClick, // add onClick prop
  } = props;
  const theme = useTheme();
  const router = useRouter();
  const handleCategoryClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push({
        pathname: "/home",
        query: {
          search: "category",
          id: id,
          module_id: `${getModuleId()}`,
          name: btoaSafe(name || ""),
          data_type: "category",
        },
      });
    }
  };

  return (
    <Box sx={{ overflow: "hidden", cursor: "pointer" }} onClick={handleCategoryClick}>
      {onlyshimmer ? (
        <FeatureImageBox
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            <Box
              sx={{
                width: { xs: "56px", md: "120px" },
                height: { xs: "56px", md: "120px" },
                transition: `${theme.transitions.create(
                  ["background-color", "transform"],
                  {
                    duration: theme.transitions.duration.standard,
                  }
                )}`,
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <Skeleton variant="circular" width="100%" height="100%" />
            </Box>
            <Skeleton variant="text" width="40px" />
          </FeatureImageBox>
        ) : (
          <FeatureImageBox
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            <Box
              sx={{
                border: "3px solid rgb(252, 185, 41)",
                borderRadius: "10px",
                transition: "all ease 0.5s",
                "&:hover": {
                  boxShadow: "0px 10px 20px rgba(255, 173, 49, 0.7)",
                  img: {
                    transform: "scale(1.05)",
                  },
                },
              }}
            >
              <Box
                sx={{
                  overflow: "hidden",
                  aspectRatio: "1",
                  img: {
                    aspectRatio: "1",
                  },
                }}
              >
                <CustomImageContainer
                  src={categoryImageUrl}
                  alt={name}
                  height="120px"
                  maxWidth="120px"
                  width="100%"
                  objectFit="cover"
                  smMb="5px"
                  smHeight="56px "
                  smMaxWidth="56px"
                  cursor="pointer"
                  loading="loading"
                />
              </Box>
            </Box>
            <Tooltip
              title={name}
              placement="bottom"
              arrow={false}
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: (theme) => theme.palette.toolTipColor,
                  },
                },
              }}
            >
              <Typography
                sx={{
                  color: "rgb(63, 63, 63)",
                  textTransform: "uppercase",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: "1",
                  WebkitBoxOrient: "vertical",
                  transition: "all ease 0.3s",
                  "&:hover": {
                    color: "#FF6600",
                  },
                }}
                fontSize={{ xs: "13px", sm: "14px", md: "16px" }}
                fontWeight="500"
                component="h5"
              >
                {name}
              </Typography>
            </Tooltip>
          </FeatureImageBox>
        )}
      </Box>
  );
};

FoodCategoryCard.propTypes = {};

export default FoodCategoryCard;

