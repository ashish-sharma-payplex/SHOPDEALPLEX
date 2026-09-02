import {
  alpha,
  Skeleton,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { getModuleId } from "helper-functions/getModuleId";
import Link from "next/link";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import { textWithEllipsis } from "styled-components/TextWithEllipsis";
import CustomImageContainer from "components/CustomImageContainer";
const btoaSafe = (str) =>
  typeof window !== "undefined"
    ? window.btoa(str)
    : Buffer.from(str).toString("base64");


export const Card = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "200px",
  width: "200px",
  borderRadius: "8px",
  padding: "10px",
  "&:hover": {
    boxShadow: "0px 15px 25px rgba(88, 110, 125, 0.1)",
    border: "0px",
  },
  [theme.breakpoints.down("md")]: {
    height: "110px",
    width: "110px",
  },
}));
const Wrapper = styled(Box)(({ theme }) => ({
  cursor: "pointer",
  width: "150px",
  height: "150x",
  borderRadius:"10px",
  backgroundColor: theme.palette.background.default,
  transition: "all ease 0.5s",
  "&:hover": {
    boxShadow: "0px 10px 20px rgba(1, 138, 230, 0.76)",
    img: {
      transform: "scale(1.1)",
    },
    
  },
  [theme.breakpoints.down("md")]: {
    width: "100px",
    height: "140px",
    boxShadow: "0px 10px 20px rgba(30, 141, 214, 0.6)",
  },
  [theme.breakpoints.down("sm")]: {
    boxShadow: "0px 10px 20px rgba(44, 127, 182, 0.44)",
  },
}));
const FeaturedItemCard = (props) => {
  const { image, title, id, onlyshimmer, slug } = props;
  const [hover, setHover] = useState(false);
  const classes = textWithEllipsis();
  return (
    <>
      {onlyshimmer ? (
        <Stack
       
          alignItems="center"
          justifyContent="center"
          spacing={1}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          sx={{
            cursor: "pointer",
            padding: ".5rem",
            border: (theme) =>
              `4px solid rgb(252, 185, 41)`,
            borderRadius: "10px",
            margin: "10px",
            "&:hover": {
              boxShadow: "0px 10px 20px rgba(88, 110, 125, 0.1)",
              border: "0px",
            },
          }}
        >
          <Card
            sx={{
              height: { xs: "80px", md: "150px" },
              width: { xs: "80px", md: "180px" },
            }}
          >
            <Skeleton
              width="100%"
              height="100%"
              variant="rectangle"
              sx={{ borderRadius: "10px" }}
            />
          </Card>
          <Skeleton width="70px" variant="text" />
        </Stack>
      ) : (
        <Link
          href={{
            pathname: "/home",
            query: {
              search: "category",
              id: id,
              module_id: `${getModuleId()}`,
              name: btoaSafe(title),
              data_type: "category",
            },
          }}
        >
          <Wrapper>
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            sx={{
              padding: ".5rem",
              cursor: "pointer",
              height: { xs: "130px", md: "155px" },
              width: { xs: "100px", md: "150px" },
              backgroundColor: "rgb(255, 243, 224)",
              border: (theme) =>
                `3px solid rgb(252, 185, 41)`,
              borderRadius: "10px",
              "&:hover": {
                boxShadow: "0px 10px 20px 0px rgba(88, 110, 125, 0.10)",
                border: "0px",
                img: {
                  transform: "scale(1.04)",
                },
              },
              div: {
                borderRadius: "8px",
                overflow: "hidden",
              },
            }}
          >
            <Stack
              sx={{
                position: "relative",
                height: { xs: "95px", md: "110px" },
                width: "100%",
              }}
            >
              
              <CustomImageContainer
                src={image}
                alt={title}
                height="100%"
                width="100%"
                objectFit="cover"
                loading="loading"
              />
              
            </Stack>
            <Tooltip
              title={title}
              placement="bottom"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: (theme) => theme.palette.toolTipColor,
                    "& .MuiTooltip-arrow": {
                      color: (theme) => theme.palette.toolTipColor,
                    },
                  },
                },
              }}
            >
              <CustomBoxFullWidth sx={{ px: "10px" }}>
                <Typography
                  textAlign="center"
                  fontWeight="bold"
                  className={classes.singleLineEllipsis}
                  maxHeight="20px"
                  color="rgb(63, 63, 63)"
                  textTransform= "uppercase"
                  component="h4"
                >
                  {title}
                </Typography>
              </CustomBoxFullWidth>
            </Tooltip>
          </Stack>
          </Wrapper>
        </Link>
      )}
    </>
  );
};

export default FeaturedItemCard;
