/* eslint-disable react-hooks/exhaustive-deps */
import { alpha, useTheme, Box, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import usePopularProductsInStore from "../../../api-manage/hooks/react-query/product-details/usePopularProductsInStore";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { ModuleTypes } from "helper-functions/moduleTypes";
import {
  CustomBoxFullWidth,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import H1 from "../../typographies/H1";
import useGetCommonConditionStore from "../../../api-manage/hooks/react-query/common-conditions/useGetCommonConditionStore";
import CustomImageContainer from "../../CustomImageContainer";
import { getGuestId } from "helper-functions/getToken";
import { getItemDataForAddToCart } from "../../product-details/product-details-section/helperFunction";
import { useDispatch, useSelector } from "react-redux";
import { setCartList } from "redux/slices/cart";
import toast from "react-hot-toast";
import useAddCartItem from "../../../api-manage/hooks/react-query/add-cart/useAddCartItem";

const PopularInTheStore = ({ id, storeShare }) => {
  const theme = useTheme();
  const offset = 1;
  const limit = 10;
  const dispatch = useDispatch();
  const [addingProductId, setAddingProductId] = useState(null);
  const { configData } = useSelector((state) => state.configData);
  const addCartMutation = useAddCartItem();

  const getBG = () => {
    if (getCurrentModuleType()) {
      switch (getCurrentModuleType()) {
        case ModuleTypes.GROCERY:
          return {
            bgColor: alpha(theme.palette.primary.main, 0.2),
            title: "Recommended for you",
          };
        case ModuleTypes.PHARMACY:
          return {
            bgColor: alpha(theme.palette.info.custom1, 0.1),
            title: "Common Conditions!",
          };
        case ModuleTypes.ECOMMERCE:
          return {
            bgColor: alpha(theme.palette.info.blue, 0.1),
            title: "Recommended for you",
          };
        case ModuleTypes.FOOD:
          return {
            bgColor: alpha(theme.palette.moduleTheme.food, 0.1),
            title: "Recommended for you",
          };
      }
    } else {
      switch (storeShare?.moduleType) {
        case ModuleTypes.GROCERY:
          return {
            bgColor: alpha(theme.palette.primary.main, 0.2),
            title: "Popular in this store!",
          };
        case ModuleTypes.PHARMACY:
          return {
            bgColor: alpha(theme.palette.info.custom1, 0.2),
            title: "Common Conditions!",
          };
        case ModuleTypes.ECOMMERCE:
          return {
            bgColor: alpha(theme.palette.info.blue, 0.1),
            title: "Popular in this store!",
          };
        case ModuleTypes.FOOD:
          return {
            bgColor: alpha(theme.palette.moduleTheme.food, 0.1),
            title: "Popular in this Restaurant!",
          };
      }
    }
  };

  const { data, refetch, isLoading } = usePopularProductsInStore({
    id,
    ...storeShare,
  });
  const {
    data: commonConditionitems,
    refetch: refetchCommonCondition,
    isLoading: isLoddingCondition,
  } = useGetCommonConditionStore({
    id,
    ...storeShare,
    offset,
    limit,
  });

  useEffect(() => {
    refetchCommonCondition();
    refetch();
  }, []);

  const formatPrice = (price) => `₹${price}`;

  const getOldPrice = (price, discount) => {
    if (!discount || discount === 0) return null;
    return formatPrice(price + discount);
  };

  const getDiscountText = (discount, price) => {
    if (!discount || discount === 0) return null;
    if (discount < 1 && price) {
      return `${Math.round(discount * 100)}% OFF`;
    }
    return `${Math.round((discount / (price + discount)) * 100)}% OFF`;
  };

  const handleAddToCart = (product) => {
    setAddingProductId(product.id);
    const guestId = getGuestId();
    const itemData = getItemDataForAddToCart(product, 1, product.price, guestId);
    addCartMutation.mutate(itemData, {
      onSuccess: (res) => {
        setAddingProductId(null);
        if (res && res.length > 0) {
          dispatch(setCartList(res.map(item => ({
            ...item.item,
            cartItemId: item.id,
            quantity: item.quantity,
            totalPrice: item.price,
            selectedOption: [],
          }))));
        }
      },
      onError: (err) => {
        setAddingProductId(null);
        toast.error('Failed to add to cart');
      }
    });
  };

  const renderProductCard = (product, index) => {
    const oldPrice = getOldPrice(product.price, product.discount);
    const discountText = getDiscountText(product.discount, product.price);
    return (
      <Box
        key={index}
        sx={{
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          p: 2,
          height: 350,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          cursor: "pointer",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.13)" },
          border: "1px solid #e0e0e0",
        }}
      >
        {discountText && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              bgcolor: "#ff6600",
              color: "#fff",
              px: 1.5,
              py: 0.5,
              borderRadius: "8px",
              fontSize: 12,
              fontWeight: 600,
              zIndex: 2,
            }}
          >
            {discountText}
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
            mt: 1,
          }}
        >
          <CustomImageContainer
            src={product.image_full_url || product.imageSrc}
            alt={product.name}
            height="150px"
            width="150px"
            objectFit="contain"
            sx={{
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              borderRadius: "12px",
              background: "#f9f9f9",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 0.3, minHeight: 18 }}
        >
          {product.module_type
            ? product.module_type.replace(/_/g, " ")
            : "Category"}
        </Typography>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{
            mb: 0.5,
            minHeight: 40,
            cursor: "pointer",
            "&:hover": {
              color: "#ff6600",
            },
          }}
        >
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.unit_type || ""}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          {oldPrice && (
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{ textDecoration: "line-through", mr: 1 }}
            >
              {oldPrice}
            </Typography>
          )}
          <Typography variant="h6" fontWeight={700} color="primary.main">
            {formatPrice(product.price)}
          </Typography>
        </Box>
        <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end" }}>
          <Box
            component="button"
            onClick={() => handleAddToCart(product)}
            disabled={addingProductId === product.id}
            sx={{
              border: "1.5px solid #ff5722",
              color: "#ff5722",
              borderRadius: "8px",
              px: 3,
              py: 0.5,
              fontWeight: 600,
              fontSize: 16,
              background: "none",
              cursor: "pointer",
              transition: "background 0.2s",
              "&:hover": {
                background: "#ff5722",
                color: "#fff",
              },
              opacity: addingProductId === product.id ? 0.6 : 1,
            }}
          >
            {addingProductId === product.id ? "Adding..." : "ADD"}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <CustomBoxFullWidth>
      {getCurrentModuleType() === "pharmacy" ? (
        <>
          {commonConditionitems?.products?.length > 0 && (
            <Box
              sx={{
                backgroundColor: getBG()?.bgColor,
                padding: "20px 20px 20px 20px",
                borderRadius: "4px",
                marginTop: "12px",
              }}
            >
              <CustomStackFullWidth spacing={2.2}>
                <H1 textAlign="start" text={getBG()?.title} />
                {!isLoading && (
                  <Grid container spacing={3} justifyContent="center">
                    {commonConditionitems?.products?.map((item, index) =>
                      renderProductCard(item, index)
                    )}
                  </Grid>
                )}
              </CustomStackFullWidth>
            </Box>
          )}
        </>
      ) : (
        <>
          {data?.items?.length > 0 && (
            <Box
              sx={{
                backgroundColor: getBG()?.bgColor,
                padding: "20px 20px 8px 20px",
                borderRadius: "4px",
                marginTop: "12px",
              }}
            >
              <CustomStackFullWidth spacing={2.2}>
                <H1 textAlign="start" text={getBG()?.title} />
                {!isLoading && (
                  <Grid container spacing={3} justifyContent="center">
                    {data?.items?.map((item, index) =>
                      renderProductCard(item, index)
                    )}
                  </Grid>
                )}
              </CustomStackFullWidth>
            </Box>
          )}
        </>
      )}
    </CustomBoxFullWidth>
  );
};

PopularInTheStore.propTypes = {};

export default PopularInTheStore;
