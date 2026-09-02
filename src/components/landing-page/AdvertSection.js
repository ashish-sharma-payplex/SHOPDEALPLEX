import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import CustomImageContainer from "../CustomImageContainer";
import CustomContainer from "../container";
import Sale from "./imgs/Sale.jpg";
import { useDispatch, useSelector } from "react-redux";
import { setPopularItemsNearby } from "../../redux/slices/storedData";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import useGetPopularItemsNearby from "../../api-manage/hooks/react-query/useGetPopularItemsNearby";
import useGetItemOrStore from "../../api-manage/hooks/react-query/search/useGetItemOrStore";
import { removeSpecialCharacters } from "../../utils/CustomFunctions";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import ParcelProductCard from "../cards/ParcelProductCard";
import useGetParcelCategory from "../../api-manage/hooks/react-query/percel/usePercelCategory";
import { setParcelCategories } from "redux/slices/parcelCategoryData";

const categoriesByModule = {
  grocery: ["all", "Food", "Stationary", "Bath", "Makeup", "Laundry"],
  pharmacy: ["all", "Medicine", "Devices", "First Aid", "Ayurvedic"],
  food: ["all", "Pizza", "Burger", "Dessert", "Chinese"],
  parcel: ["all", "Documents", "Clothing", "Electronics"],
  rental: ["all", "Car", "Bike", "Truck"],
};

const getValidImageUrl = (product) => {
  const possibleUrls = [
    product?.image?.url,
    product?.image,
    product?.image_full_url,
    product?.images?.[0]?.url
  ];
  return possibleUrls.find(url => 
    url && (url.startsWith('http') || url.startsWith('/'))
  );
};

const AdvertSection = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md")); // Added for the 1024px breakpoint
  const router = useRouter();
  const footerRef = useRef(null);
  const dispatch = useDispatch();

  const currentModule = getCurrentModuleType();
  const categories = categoriesByModule[currentModule] || ["all"];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const { popularItemsNearby } = useSelector((state) => state.storedData);

  // Use the search hook for backend search based on selected tab keyword
  const {
    data: searchData,
    refetch: refetchSearch,
    isRefetching: isRefetchingSearch,
  } = useGetItemOrStore({
    key: removeSpecialCharacters(selectedCategory === "all" ? "" : selectedCategory),
    moduleType: getCurrentModuleType(),
  });

  // On initial load, fetch popular items nearby
  const popularItemsQuery = useGetPopularItemsNearby({ offset: 1, type: "all" });
  const { data: popularData, refetch: refetchPopular, isFetching: isFetchingPopular } = popularItemsQuery;

  // Fetch parcel categories if current module is parcel
  const {
    data: parcelData,
    refetch: refetchParcel,
    isLoading: isParcelLoading,
  } = useGetParcelCategory();

  useEffect(() => {
    if (popularItemsNearby.products.length === 0 && popularData) {
      dispatch(setPopularItemsNearby(popularData));
    }
  }, [popularData]);

  useEffect(() => {
    if (currentModule === "parcel") {
      refetchParcel();
    }
  }, [currentModule, refetchParcel]);

  // Update Redux store when search data changes
  useEffect(() => {
    if (selectedCategory === "all") {
      // Show popular items for "all"
      if (popularData) {
        dispatch(setPopularItemsNearby(popularData));
      }
    } else {
      if (searchData) {
        // Use items from search data
        const searchProducts = { products: searchData?.items || [] };
        dispatch(setPopularItemsNearby(searchProducts));
      }
    }
  }, [searchData, popularData, selectedCategory]);

  // Debounce refetch on selectedCategory change
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (selectedCategory === "all") {
        refetchPopular();
      } else {
        refetchSearch();
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [selectedCategory]);

  return (
    <CustomContainer>
      <Box
       sx={{ display: "flex",
         flexDirection: "row",
        justifyContent: "space-between",
         paddingLeft:"0px",
         gap: "5px",
        //  background:"#fcc312",
         marginTop:"15px",
         }}>

        {/* Left Image Section - Hidden on Medium and smaller screens */}
        {!isMedium && (
          <Box sx={{ flex: 1 }}>
            <CustomImageContainer
              src={Sale.src}
              alt="Discount Banner"
              width="100%"
              marginTop="50px"
              height={isSmall ? "100px" : "450px"}
              objectFit="cover"
                
            />
          </Box>
        )}

        {/* Content Section */}
        <Box sx={{ flex: 1.5 }}>
          <Typography variant="h6" fontWeight="bold" color="primary" textAlign="center"  mb={3} textTransform="uppercase">
            Our Featured Products
          </Typography>

          {/* Category Navigation */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: "20px", padding: "0px",  background: "rgb(252, 220, 41)", marginBottom: "20px" }}>
            {categories.map((item, i) => (
              <Button 
                key={i} 
                variant="text" 
                sx={{ 
                  textTransform: "uppercase",
                  fontWeight: selectedCategory === item ? "bold" : "normal"
                }} 
                onClick={() => {
                  setSelectedCategory(item);
                }}
              >
                {item}
              </Button>
            ))}
          </Box>

          {/* Product Cards - Now showing 4 cards */}
          <Box sx={{
            display: "flex",
            gap: "15px",
            justifyContent: "space-between",
            minHeight: "300px",
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            backgroundColor:"white",
          }}>
            {currentModule === "parcel" ? (
              isParcelLoading ? (
                <Box>Loading...</Box>
              ) : parcelData && parcelData.length > 0 ? (
                parcelData
                  .filter(parcel =>
                    selectedCategory === "all" ||
                    parcel.name.toLowerCase().includes(selectedCategory.toLowerCase())
                  )
                  .slice(0, 4)
                  .map((parcel, index) => (
                    <ParcelProductCard
                      key={index}
                      item={parcel}
                      currentModule="parcel"
                      onClick={() => {
                        dispatch(setParcelCategories(parcel));
                        router.push("/parcel-delivery-info", undefined, { shallow: true });
                      }}
                    />
                  ))
              ) : (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>No parcel services found</Typography>
                </Box>
              )
            ) : (
              isRefetchingSearch || isFetchingPopular ? (
                <Box>Loading...</Box>
              ) : popularItemsNearby.products.length === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>No products found for this category</Typography>
                </Box>
              ) : (
                popularItemsNearby.products.slice(0, 4).map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: { xs: "10rem", sm: "11rem", md: "12rem" },
                      height: "350px",
                      borderRadius: "10px",
                      boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.1)",
                      flex: "1 1 auto",
                      minWidth: "10rem",
                      maxWidth: "12rem",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    {/* Rest of the card content remains the same */}
                    <Box sx={{ position: 'relative', width: '100%', height: '180px' }}>
                      <CustomImageContainer
                        src={getValidImageUrl(item)}
                        alt={item.name}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                        borderRadius="10px 10px 0 0"
                        sx={{
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.03)"
                          },
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                        onError={(e) => {
                          e.target.src = '/default-product.png';
                        }}
                      />
                      {!getValidImageUrl(item) && (
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'grey.200',
                          borderRadius: '10px 10px 0 0'
                        }}>
                          <Typography variant="body2">No Image Available</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ padding: "14px" }}>
                      <Typography variant="h5" fontWeight="600">{item.name}</Typography>
                      <Box sx={{ position: 'relative' }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={2}
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minHeight: '2.5em',
                            '&:hover + .full-description': {
                              opacity: 1,
                              visibility: 'visible'
                            }
                          }}
                        >
                          {item.description || "No description available"}
                        </Typography>
                        <Box
                          className="full-description"
                          sx={{
                            position: 'absolute',
                            bottom: '100%',
                            left: 0,
                            right: 0,
                            bgcolor: 'background.paper',
                            p: 2,
                            boxShadow: 2,
                            borderRadius: 1,
                            zIndex: 1,
                            opacity: 0,
                            visibility: 'hidden',
                            transition: 'all 0.2s ease',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <Typography variant="body2">
                            {item.description || "No description available"}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        sx={{ marginTop: "10px", backgroundColor: "#FF6600", "&:hover": { backgroundColor: "#f06102" } }}
                        onClick={() => router.push(`/home?module=${currentModule}`)}
                      >
                        Buy Now
                      </Button>
                    </Box>
                  </Box>
                ))
              )
            )}
          </Box>
        </Box>
      </Box>
    </CustomContainer>
  );
};

export default AdvertSection;
