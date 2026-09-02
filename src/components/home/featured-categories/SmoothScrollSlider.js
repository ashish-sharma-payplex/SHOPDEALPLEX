import React, { useEffect, useRef, useState } from "react";
import { styled, Box, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useGetFeaturedCategories } from "api-manage/hooks/react-query/all-category/all-categorys";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { ModuleTypes } from "helper-functions/moduleTypes";
import { setFeaturedCategories } from "redux/slices/storedData";
import FoodCategoryCard from "../../cards/FoodCategoryCard";
import PharmacyCategoryCard from "../../cards/PharmacyCategoryCard";
import ShopCategoryCard from "../../cards/ShopCategoryCard";
import FeaturedItemCard from "./card";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const ScrollContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  overflow: "hidden",
  position: "relative",
  "&:hover .scroll-content": {
    animationPlayState: "paused",
  },
}));

const ScrollContent = styled(Box)(({ theme, direction = "left" }) => ({
  display: "flex",
  gap: "20px",
  padding: "10px 0",
  animation: `scroll-${direction} 30s linear infinite`,
  "&:hover": {
    animationPlayState: "paused",
  },
}));

const CategoryItem = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  minWidth: "150px",
  [theme.breakpoints.down("md")]: {
    minWidth: "120px",
  },
  [theme.breakpoints.down("sm")]: {
    minWidth: "100px",
  },
}));

const NavigationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
  marginTop: "20px",
  padding: "10px 0",
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  width: "40px",
  height: "40px",
  backgroundColor: theme.palette.primary.main,
  color: "white",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  "&:disabled": {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[500],
  },
}));

const SmoothScrollSlider = ({ configData, onCategorySelect }) => {
  const { featuredCategories } = useSelector((state) => state.storedData);
  const { data, refetch, isFetched, isFetching, isLoading, isRefetching } =
    useGetFeaturedCategories();
  const dispatch = useDispatch();
  const [isPaused, setIsPaused] = useState(false);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (data) {
      dispatch(setFeaturedCategories(data?.data));
    }
  }, [data]);

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      setIsManualScrolling(true);
      scrollRef.current.scrollLeft -= 300;
      // Resume auto-scroll after 3 seconds of no manual interaction
      setTimeout(() => {
        setIsManualScrolling(false);
      }, 3000);
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      setIsManualScrolling(true);
      scrollRef.current.scrollLeft += 300;
      // Resume auto-scroll after 3 seconds of no manual interaction
      setTimeout(() => {
        setIsManualScrolling(false);
      }, 4000);
    }
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const renderCategoryItem = (item, index) => {
    const isSelected = selectedCategoryId === item?.id;
    switch (getCurrentModuleType()) {
      case ModuleTypes.GROCERY:
        return (
          <CategoryItem key={index}>
            <FeaturedItemCard
              image={item?.image_full_url}
              title={item?.name}
              id={item?.id}
              slug={item?.slug}
              isSelected={isSelected}
              onClick={() => handleCategoryClick(item?.id)}
            />
          </CategoryItem>
        );
      case ModuleTypes.PHARMACY:
        return (
          <CategoryItem key={index}>
            <PharmacyCategoryCard
              image={item?.image_full_url}
              title={item?.name}
              slug={item?.slug}
              id={item?.id}
              isSelected={isSelected}
              onClick={() => handleCategoryClick(item?.id)}
            />
          </CategoryItem>
        );
      case ModuleTypes.ECOMMERCE:
        return (
          <CategoryItem key={index}>
            <ShopCategoryCard
              imageUrl={item?.image_full_url}
              item={item}
              isSelected={isSelected}
              onClick={() => handleCategoryClick(item?.id)}
            />
          </CategoryItem>
        );
      case ModuleTypes.FOOD:
        return (
          <CategoryItem key={index}>
            <FoodCategoryCard
              key={item?.id}
              id={item?.id}
              categoryImage={item?.image}
              name={item?.name}
              slug={item?.slug}
              categoryImageUrl={item?.image_full_url}
              height="40px"
              isSelected={isSelected}
              onClick={() => handleCategoryClick(item?.id)}
            />
          </CategoryItem>
        );
      default:
        return null;
    }
  };

  const renderShimmerItem = (index) => {
    switch (getCurrentModuleType()) {
      case ModuleTypes.GROCERY:
        return (
          <CategoryItem key={index}>
            <FeaturedItemCard onlyshimmer />
          </CategoryItem>
        );
      case ModuleTypes.PHARMACY:
        return (
          <CategoryItem key={index}>
            <PharmacyCategoryCard onlyshimmer />
          </CategoryItem>
        );
      case ModuleTypes.ECOMMERCE:
        return (
          <CategoryItem key={index}>
            <ShopCategoryCard onlyshimmer />
          </CategoryItem>
        );
      case ModuleTypes.FOOD:
        return (
          <CategoryItem key={index}>
            <FoodCategoryCard onlyshimmer />
          </CategoryItem>
        );
      default:
        return null;
    }
  };

  if (isFetching) {
    return (
      <Box>
        <ScrollContainer
          className="scroll-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={scrollRef}
        >
          <ScrollContent
            direction="left"
            className="scroll-content"
            sx={{
              animationPlayState: (isPaused || isManualScrolling) ? "paused" : "running"
            }}
          >
            {[...Array(8)].map((_, index) => renderShimmerItem(index))}
            {[...Array(8)].map((_, index) => renderShimmerItem(index))}
          </ScrollContent>
        </ScrollContainer>
        <NavigationContainer>
          <NavigationButton onClick={handleScrollLeft}>
            <ChevronLeftIcon />
          </NavigationButton>
          <NavigationButton onClick={handleScrollRight}>
            <ChevronRightIcon />
          </NavigationButton>
        </NavigationContainer>
      </Box>
    );
  }

  if (!featuredCategories || featuredCategories.length === 0) {
    return null;
  }

  return (
    <Box>
      <ScrollContainer
        className="scroll-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={scrollRef}
      >
        <ScrollContent
          direction="left"
          className="scroll-content"
          sx={{
            animationPlayState: (isPaused || isManualScrolling) ? "paused" : "running"
          }}
        >
          {/* First set of items */}
          {featuredCategories.map((item, index) => renderCategoryItem(item, index))}
          {/* Duplicate set for seamless loop */}
          {featuredCategories.map((item, index) => renderCategoryItem(item, `duplicate-${index}`))}
        </ScrollContent>
      </ScrollContainer>
      <NavigationContainer>
        <NavigationButton onClick={handleScrollLeft}>
          <ChevronLeftIcon />
        </NavigationButton>
        <NavigationButton onClick={handleScrollRight}>
          <ChevronRightIcon />
        </NavigationButton>
      </NavigationContainer>
    </Box>
  );
};

export default SmoothScrollSlider; 