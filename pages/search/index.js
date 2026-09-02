// pages\search\index.js
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "../../src/components/layout/MainLayout";
import SEO from "../../src/components/seo";
import { useRouter } from "next/router";
import { Grid, Typography, Box, CircularProgress, Container } from "@mui/material";
import { useTranslation } from "react-i18next";

import ProductCard from "../../src/components/home/search/pathflow/productcard";
import StoreCard from "../../src/components/cards/StoreCard";
import useCombinedSearch from "../../src/api-manage/hooks/react-query/search/useCombinedSearch";
import { CustomStackFullWidth } from "../../src/styled-components/CustomStyles.style";
import H1 from "../../src/components/typographies/H1";
import { setIncrementToCartItem, setDecrementToCartItem, fetchCartFromApi } from "redux/slices/cart";
import Perticular from "../../src/components/home/module-wise-components/Grocerysubcomponent/PerticularProduct"; // Import Perticular
import FoodPopup from "components/home/module-wise-components/food/foodUpdateComp/popUpFood"; // Import FoodPopup

const SearchPage = ({ configData }) => {
  const router = useRouter();
  const { search } = router.query;
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openFoodPopup, setOpenFoodPopup] = useState(false);
  const [openPerticularPopup, setOpenPerticularPopup] = useState(false); // Keep Perticular state for grocery or pharmacy

  const dispatch = useDispatch();

  useEffect(() => {
    if (search) {
      setSearchValue(search);
    }
  }, [search]);

  const { allItems, allStores, refetch, isLoading, isError } = useCombinedSearch({
    searchValue,
    offset: 0,
    page_limit: 20,
  });

  useEffect(() => {
    if (searchValue) {
      refetch();
    }
  }, [searchValue, refetch]);

  // Handle product click to open Perticular or FoodPopup modal based on module_type
  const handleProductClick = (product) => {
    const moduleType = product?.module_type; // ✅ correct — .module hata diya

    setSelectedProduct(product);

    if (moduleType === "food") {
      setOpenFoodPopup(true);
    } else if (moduleType === "grocery" || moduleType === "pharmacy") {
      setOpenPerticularPopup(true);
    }
  };

  const handleCloseModal = () => {
    setOpenFoodPopup(false);
    setOpenPerticularPopup(false);
    setSelectedProduct(null); // Reset selected product when closing modal
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <Typography variant="h6" align="center">
          {t("Error loading search results")}
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <CssBaseline />
      <SEO
        title={configData ? `Search Results for ${searchValue}` : "Loading..."}
        image={`${configData?.base_urls?.business_logo_url}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
        noIndex={true} // ✅ search result pages ko index na karo (SEO ke liye, root wala concern yahan is tarah handle hota hai)
      />
      <MainLayout configData={configData}>
        <Container sx={{ mt: 5, my: 5 }}>
          <CustomStackFullWidth spacing={1} sx={{ mt: 3 }}>
            {allItems.length > 0 && (
              <>
                <Typography variant="h5" sx={{ my: 4 }}>
                  {t(`${t("Search Results for")} "${searchValue}"`)}
                </Typography>
                <Grid container spacing={2}>
                  {allItems.map((item, index) => (
                    <Grid item xs={6} sm={3} md={2.5} lg={2} key={`item-${item.id}-${index}`}>
                      <ProductCard
                        product={item}
                        onClick={() => handleProductClick(item)}
                        handleProductClick={handleProductClick}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* {allStores.length > 0 && (
              <>
                <Typography variant="h5" sx={{ mt: 2 }}>
                  {t("Stores")}
                </Typography>
                <Grid container spacing={2}>
                  {allStores.map((store, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={`store-${store.id}-${index}`}>
                      <StoreCard store={store} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )} */}

            {allItems.length === 0 && allStores.length === 0 && searchValue && (
              <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                {t("No results found for")} &quot;{searchValue}&quot;
              </Typography>
            )}
          </CustomStackFullWidth>
        </Container>
      </MainLayout>

      {/* FOOD POPUP */}
      {openFoodPopup && selectedProduct && (
        <FoodPopup open={openFoodPopup} onClose={handleCloseModal} product={selectedProduct} />
      )}

      {/* GROCERY / PHARMACY POPUP (Perticular) */}
      {openPerticularPopup && selectedProduct && (
        <Perticular open={openPerticularPopup} onClose={handleCloseModal} product={selectedProduct} />
      )}
    </>
  );
};

export default SearchPage;

// 🔧 FIX: Yeh ab pages/index.js ka getServerSideProps IMPORT/REUSE nahi kar raha.
// Root (`pages/index.js`) wala getServerSideProps me ek check tha:
//   if (query.search || query.id || query.zone_id || ...) redirect to "/"
// Woh check sirf ROOT page ke liye tha (taaki filtered URL root pe na khule).
// Lekin search page usi function ko import kar raha tha, isliye "/search?search=..."
// pe jaate hi query.search truthy hone ki wajah se turant "/" pe redirect ho jaata tha.
// Ab search page ka apna alag getServerSideProps hai — koi redirect check nahi,
// sirf config fetch karta hai.
export const getServerSideProps = async (context) => {
  const { req, res } = context;
  const language = req.cookies?.languageSetting;

  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const configRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`, {
      method: "GET",
      headers: {
        "X-software-id": 33571750,
        "X-server": "server",
        "X-localization": language,
        origin: process.env.NEXT_CLIENT_HOST_URL,
      },
    });

    if (!configRes.ok) throw new Error(`Config fetch failed: ${configRes.status}`);

    const config = await configRes.json();

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate");

    return {
      props: {
        configData: config,
      },
    };
  } catch (error) {
    // console.error("Error fetching config for search page:", error);
    return {
      props: {
        configData: null,
      },
    };
  }
};