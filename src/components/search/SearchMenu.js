import React, { useEffect, useState } from "react";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import { Grid, Skeleton, styled, useMediaQuery, useTheme } from "@mui/material";
import H1 from "../typographies/H1";
import HighToLow from "../../sort/HighToLow";
import { Box } from "@mui/system";
import WindowIcon from "@mui/icons-material/Window";
import Body2 from "../typographies/Body2";
import ViewListIcon from "@mui/icons-material/ViewList";
import Filter from "../home/stores/Filter";
import Funnel from "../svg-components/Funnel";
import { t } from "i18next";
import NewSortBy from "components/search/NewSortBy";

const ViewWrapper = styled(Box)(({ theme, active }) => ({
	display: "flex",
	direction: "row",
	alignItems: "center",
	justifyContent: "center",
	height: "100%",
	gap: "5px",
	cursor: "pointer",
	color:
		active === "true"
			? "#FF6600"
			: theme.palette.neutral[500],
}));

const SearchMenu = (props) => {
	const {
		currentView,
		setCurrentView,
		handleSortBy,
		sortBy,
		totalDataCount,
		currentTab,
		tabs,
		isRefetching,
		setOpenSideDrawer,
		priceRange,
		filterDataAndFunctions,
		filterData,
		setFilterData,
		setIsClicked,
		isFetchingNextPage,
		minMax,
		setMinMax,
		handleSortByNew,
		newSort,
	} = props;
	const total = 1000;
	const [showView, setShowView] = useState(true);
	const theme = useTheme();
	const isSmallSize = useMediaQuery(theme.breakpoints.down("sm"));
	useEffect(() => {
		if (currentTab === 0) {
			setShowView(true);
		} else {
			setShowView(false);
		}
	}, [currentTab]);
	const found = t("Found");
	const textHandler = () => {
		return `${totalDataCount ?? 0} ${tabs[currentTab]?.value} ${found}`;
	};

	return (
		<CustomBoxFullWidth sx={{ marginBottom: "20px" }}>
  <Grid container alignItems="center" justifyContent="space-between">
    {/* Left Section — Title */}
    <Grid item xs={12} md={6}>
      {isFetchingNextPage ? (
        <Skeleton variant="text" width="150px" />
      ) : (
        <H1
          marginLeft="20px"
          color="#d72a00"
          textTransform="capitalize"
          textAlign="start"
          text={textHandler()}
        />
      )}
    </Grid>

    {/* Right Section — Sort + Filter Controls */}
    <Grid
      item
      xs={12}
      md={6}
      container
      alignItems="center"
      justifyContent="flex-end"
      spacing={1.5}
      sx={{
        pr: { xs: 1, sm: 2, md: 3 }, // adds right margin so it's not stuck to the edge
      }}
    >
      {/* Sort By Options */}
      {!isSmallSize && showView && (
        <Grid item>
          <HighToLow handleSortBy={handleSortBy} sortBy={sortBy} />
        </Grid>
      )}

      {/* Additional Sort (NewSortBy) for Tab 1 */}
      {!isSmallSize && currentTab === 1 && (
        <Grid item>
          <NewSortBy handleSortBy={handleSortByNew} newSort={newSort} />
        </Grid>
      )}

      {/* Filter Section */}
      <Grid
        item
        sx={{
          position: "relative",
          mr: { xs: 1, sm: 2, md: 3 }, // slight spacing between Sort and Filter
        }}
      >
        {isSmallSize ? (
          <Box
            onClick={() => setOpenSideDrawer(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              border: (theme) => `1px solid ${theme.palette.primary.main}`,
              borderRadius: { xs: "3px", sm: "8px" },
              padding: "5px 10px",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: (theme) => theme.palette.primary.secondary,
              },
            }}
          >
            <Funnel />
          </Box>
        ) : (
          <Box
            sx={{
              position: "relative",
              display: "inline-block",
              width: "auto",
            }}
          >
            <Filter
              minMax={minMax}
              setMinMax={setMinMax}
              border
              priceRange={priceRange}
              filterDataAndFunctions={filterDataAndFunctions}
              filterData={filterData}
              setFilterData={setFilterData}
              currentTab={currentTab}
              
            />
          </Box>
        )}
      </Grid>
    </Grid>
  </Grid>
</CustomBoxFullWidth>

	);
};

SearchMenu.propTypes = {};

export default SearchMenu;
