import React from "react";
import { Grid } from "@mui/material";
import { Box } from "@mui/material";
import H1 from "../typographies/H1";
import H3 from "../typographies/H3";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import { Skeleton } from "@mui/material";
import { isObjectEmpty } from "../../utils/CustomFunctions";
import CustomContainer from "../container";
import Abt from "./assets/abtus.png";
import IM1 from "./assets/img1.jpg";
import IM2 from "./assets/img2.jpg";
import IM3 from "./assets/img3.jpg";
import IM4 from "./assets/img4.jpg";


const ConvexShape = (props) => (
  <Box
    {...props}
    sx={{
      position: "absolute",
      bottom: -50,
      left: 0,
      width: "100%",
      height: 100,
      backgroundColor: "rgb(252, 185, 41)",
      borderTopLeftRadius: "50% 100px",
      borderTopRightRadius: "50% 100px",
      boxShadow: "0 30px 0 0 rgb(252, 185, 41)",
      zIndex: 1,
    }}
  />
);

export const PolicyShimmer = () => (
  <CustomStackFullWidth>
    <Skeleton variant="text" width="100%" height="20px" />
    <Skeleton variant="text" width="70%" height="20px" />
    <Skeleton variant="text" width="50%" height="20px" />
  </CustomStackFullWidth>
);
const PolicyPage = (props) => {
  const { title, data, isFetching } = props;
  return (
    <CustomContainer >
      <Box sx={{ minHeight: "80vh", marginLeft: "30px" }}>
        <Grid container item md={12} xs={12} spacing={3} mt="1rem"  >
          <Grid
            item
            md={12}
            xs={12}
            alignItems="center"
            justifyContent="center"
           
          >
            {/* <H1 text={title} sx={{ fontSize: "34px" , marginTop:"30px"}} /> */}
           
          </Grid>
          <Grid item md={12} xs={12} sx={{ paddingBottom: "50px" }}>
            <Box>
              {isFetching ? (
                <PolicyShimmer />
              ) : (
                data &&
                !isObjectEmpty(data) && (
                  <div dangerouslySetInnerHTML={{ __html: data }}></div>
                )
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </CustomContainer>
  );
};

export default PolicyPage;
