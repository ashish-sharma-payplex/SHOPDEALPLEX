import React from "react";
import { Box, Button } from "@mui/material";
import { Tab } from "@mui/material";
import { CustomTab } from "./tabs.style";
import { setCurrentTab } from "../../redux/slices/utils";
import { useDispatch } from "react-redux";

const TabsTypeOne = (props) => {
  const { currentTab, tabs, t, width, onNextPage } = props;
  const dispatch = useDispatch();

  const handleChange = (event, newValue) => {
    dispatch(setCurrentTab(newValue));
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <CustomTab
        indicatorColor="secondary"
        value={currentTab}
        onChange={handleChange}
        width={width ? width : "25px !important"}
      >
        {tabs &&
          tabs.length > 0 &&
          tabs.map((item, index) => {
            return (
              <Tab
                sx={{ textTransform: "capitalize" }}
                key={index}
                label={t(item?.title)}
                value={item?.title}
              ></Tab>
            );
          })}
      </CustomTab>
      
    </Box>
  );
};

TabsTypeOne.propTypes = {};

export default TabsTypeOne;
