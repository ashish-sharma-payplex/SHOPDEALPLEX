import React from "react";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import { Box, Stack } from "@mui/system";
import { alpha, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const CategoryInformation = (props) => {
  const { categories } = props;  // No tags prop anymore
  const { t } = useTranslation();
  
  return (
    <CustomStackFullWidth spacing={1.5}>
      {categories?.length > 0 && (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography fontSize={{ xs: "14px", md: "16px" }}>
            {t("Category:")}
          </Typography>
          {categories?.map((item, index) => {
            return (
              <Typography
                fontSize="12px"
                color="customColor.textGray"
                key={index}
              >
                {item?.name}
                {categories?.length > 1 &&
                  categories?.length - 1 === index &&
                  ", "}
              </Typography>
            );
          })}
        </Stack>
      )}
    </CustomStackFullWidth>
  );
};

CategoryInformation.propTypes = {};

export default CategoryInformation;
