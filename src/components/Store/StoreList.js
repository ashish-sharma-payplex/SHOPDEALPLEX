import React from "react";
import { Box } from "@mui/system";
import { Card, Grid } from "@mui/material";

import { useSelector } from "react-redux";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import GroupButtons from "../GroupButtons";

import useMediaQuery from "@mui/material/useMediaQuery";
import StoreCard from "../cards/StoreCard";

const StoreList = ({ storeType, type, setType, data }) => {
  const { selectedModule } = useSelector((state) => state.utilsData);
  const matchesXs = useMediaQuery("(max-width:470px)");
  const { configData } = useSelector((state) => state.configData);
  const store_image_url = `${configData?.base_urls?.store_image_url}`;
  return (
    <Box marginTop="20px" minHeight="36vh">
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        justifyContent="flex-start"
        // alignItems="center"
      >
        {selectedModule?.module_type === "food" && (
          <Grid item xs={12} sm={12} md={12} align="center">
            <CustomStackFullWidth alignItems="center" justifyContent="center">
              <GroupButtons setType={setType} type={type} />
            </CustomStackFullWidth>
          </Grid>
        )}

        {data?.map((store) => {
          return (
            <Grid key={store?.id} item xs={matchesXs ? 12 : 6} sm={6} md={3}>
              <StoreCard item={store} imageUrl={store?.cover_photo_full_url} />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default StoreList;
