import React, { useEffect } from "react";
import { Drawer, styled, useMediaQuery, useTheme, Box, Grid, Typography, Divider } from "@mui/material";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import useGetBrandsList from "api-manage/hooks/react-query/brands/useGetBrandsList";
import BrandCheckBox from "components/multiple-checkbox-with-title/brands-checkbox";
import { useTranslation } from "react-i18next";
import MultipleCheckboxWithTitle from "../../multiple-checkbox-with-title";
import { useDispatch, useSelector } from "react-redux";
import { useGetCategories } from "api-manage/hooks/react-query/all-category/all-categorys";
import { setCategories } from "redux/slices/storedData";
import { setBrands } from "redux/slices/brands";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { height } from "@mui/system";

const CustomPaperBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
  borderRadius: "10px",
  padding: "1rem",
  color: theme.palette.text.primary,
}));

const SearchFilter = (props) => {
  const {
    open,
    onClose,
    isFetching,
    searchValue,
    id,
    brand_id,
    sideDrawer,
    selectedBrandsHandler,
    selectedCategoriesHandler,
    currentTab,
    fromNav,
    linkRouteTo,
  } = props;

  const theme = useTheme();
  const { t } = useTranslation();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"), { noSsr: true });
  
  // Redux state
  const { categories } = useSelector((state) => state.storedData);
  const { brands } = useSelector((state) => state.brands);

  const dispatch = useDispatch();
  const handleSuccess = (response) => {
    dispatch(setBrands(response));
  };

  const { data: categoriesData, refetch } = useGetCategories();
  const { data: brandsData, refetch: brandRefetch } = useGetBrandsList(handleSuccess);

  useEffect(() => {
    if (categories.length === 0) {
      refetch();
    }
  }, []);

  useEffect(() => {
    if (!brands) {
      brandRefetch();
    }
  }, []);

  useEffect(() => {
    if (categoriesData?.data) {
      dispatch(setCategories(categoriesData?.data));
    }
  }, [categoriesData]);

  const content = (
    <CustomStackFullWidth sx={{ padding: !sideDrawer && "1rem", mt:"0.8rem"}} spacing={3}>
      {/* Categories Section */}
      {categories?.length > 0 && (
        <CustomPaperBox sx={{ height: 800, top:20, position: "sticky", overflowY: "auto" }}>
           <Typography variant="h6" sx={{marginLeft:2, marginBottom:"-20px"}}>CATEGORIES</Typography>
          <MultipleCheckboxWithTitle
            data={categories}
            searchValue={searchValue}
            id={id}
            showAll
            selectedCategoriesHandler={selectedCategoriesHandler}
            fromNav={fromNav}
          />
        </CustomPaperBox>
      )}

      {/* Brands Section */}
      {brands && currentTab !== 1 && getCurrentModuleType() === "ecommerce" && (
        <CustomPaperBox>
          <Typography variant="h6" gutterBottom>
            Brands
          </Typography>
          <BrandCheckBox
            linkRouteTo={linkRouteTo}
            title="Brands"
            cId={id}
            data={brands}
            id={brand_id}
            searchValue={searchValue}
            showAll
            selectedBrandsHandler={selectedBrandsHandler}
          />
        </CustomPaperBox>
      )}

      {/* Placeholder for additional filters (e.g., Tags) */}
      {/*<MultipleCheckboxWithTitle title="Brands" data={Dummy} showAll />*/}
      {/*<TagsCheckbox title="Popular Tags" data={Dummy} showAll />*/}
    </CustomStackFullWidth>
  );

  // Full-width or Drawer layout based on screen size
  if (lgUp) {
    return (
      <Box sx={{ width: "100%", py: "3px", height: "100%" }}>
        {content}
      </Box>
    );
  }

  if (sideDrawer) {
    return (
      <Box sx={{ width: "100%", py: "3px", height: "100%" }}>
        {content}
      </Box>
    );
  }

  // Mobile Drawer view
  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          width: 280,
          padding: "1rem",
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

SearchFilter.propTypes = {};

export default SearchFilter;
