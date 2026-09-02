import DeleteIcon from "@mui/icons-material/Delete";
import {
  alpha,
  Card,
  CardMedia,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { borderRadius, Box, fontSize, fontWeight, Stack, style } from "@mui/system";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  setCart,
  setDecrementToCartItem,
  setIncrementToCartItem,
  setRemoveItemFromCart,
} from "redux/slices/cart";
import { setCartList } from "redux/slices/cart";
import { CustomButtonPrimary } from "styled-components/CustomButtons.style";
import {
  CustomBoxFullWidth,
  CustomSpan,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import { textWithEllipsis } from "styled-components/TextWithEllipsis";
import CustomImageContainer from "../CustomImageContainer";
import FoodDetailModal from "../food-details/foodDetail-modal/FoodDetailModal";
import {
  ACTION,
  initialState,
  reducer,
} from "../product-details/product-details-section/states";
import CustomBadge from "./CustomBadge";

import FavoriteIcon from "@mui/icons-material/Favorite";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { useAddToWishlist } from "api-manage/hooks/react-query/wish-list/useAddWishList";
import { useWishListDelete } from "api-manage/hooks/react-query/wish-list/useWishListDelete";
import { getCartListModuleWise } from "helper-functions/getCartListModuleWise";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { getLanguage } from "helper-functions/getLanguage";
import { getModuleId } from "helper-functions/getModuleId";
import { getGuestId } from "helper-functions/getToken";
import { ModuleTypes } from "helper-functions/moduleTypes";
import {
  not_logged_in_message,
  out_of_limits,
  out_of_stock,
} from "utils/toasterMessages";
import useAddCartItem from "../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import useCartItemUpdate from "../../api-manage/hooks/react-query/add-cart/useCartItemUpdate";
import useDeleteCartItem from "../../api-manage/hooks/react-query/add-cart/useDeleteCartItem";
import { addWishList, removeWishListItem } from "../../redux/slices/wishList";
import AmountWithDiscountedAmount from "../AmountWithDiscountedAmount";
import CustomDialogConfirm from "../custom-dialog/confirm/CustomDialogConfirm";
import CustomMultipleRatings from "../CustomMultipleRatings";
import GetLocationAlert from "../GetLocationAlert";
import { HeartWrapper } from "../home/stores-with-filter/cards-grid/StoresInfoCard";
import CustomLinearProgressbar from "../linear-progressbar";
import CustomModal from "../modal";
import CartClearModal from "../product-details/product-details-section/CartClearModal";
import {
  getItemDataForAddToCart,
  getPriceAfterQuantityChange,
} from "../product-details/product-details-section/helperFunction";
import Body2 from "../typographies/Body2";
import H3 from "../typographies/H3";
import AddWithIncrementDecrement from "./AddWithIncrementDecrement";
import { CustomOverLay } from "./Card.style";
import ModuleModal from "./ModuleModal";
import ProductsUnavailable from "./ProductsUnavailable";
import QuickView, { PrimaryToolTip } from "./QuickView";
import SpecialCard, { FoodHalalHaram, FoodVegNonVegFlag } from "./SpecialCard";
import useGetItemDetails from "../../api-manage/hooks/react-query/items/useGetItemDetails";

export const CardWrapper = styled(Card)(
  ({
    theme,
    cardheight,
    horizontalcard,
    wishlistcard,
    nomargin,
    cardType,
    cardFor,
    cardWidth,
    pharmaCommon,
  }) => ({
    cursor: "pointer",
    backgroundColor: "#fff",
    borderRadius: "12px !important",
    border: `1px solid ${theme.palette.divider}`,
    overflow: "hidden",
    transition: "all 0.25s ease-in-out",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    alignContent: "center",
    

    // Padding and container spacing
    padding: horizontalcard !== "true" ? "" : "",
    paddingLeft: "0px",
    paddingRight: "0px",

    // Consistent width
    maxWidth:
      cardFor === "list-view"
        ? "100%"
        : horizontalcard === "true"
        ? "420px"
        : "260px",
    width:
      cardType === "vertical-type" || cardType === "list-view"
        ? "100%"
        : horizontalcard === "true"
        ? "420px"
        : "260px",

    // Compact height
    height: cardheight || "220px",

    // Margin handling
    margin:
      wishlistcard === "true"
        ? "0"
        : nomargin === "true"
        ? "0"
        : "0",
    marginBottom: pharmaCommon ? "20px !important" : undefined,

    // Highlight border for food module
    border:
      getCurrentModuleType() === ModuleTypes.FOOD
        ? `1px solid ${alpha(theme.palette.moduleTheme.food, 0.2)}`
        : `1px solid ${theme.palette.divider}`,

    "&:hover": {
      boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
      transform: "translateY(-2px)",
      img: {
        transform: "scale(1.04)",
        transition: "transform 0.3s ease",
      },
    },

    "&:hover .MuiTypography-subtitle1, &:hover .name": {},

    // Responsive Design
    [theme.breakpoints.down("sm")]: {
      height: "200px",
      width: "100%",
      margin: wishlistcard === "true" || nomargin === "true" ? "0" : ".4rem",
    },

    // Font Size adjustments
    ".MuiTypography-root": {
      fontSize: "12px",
      lineHeight: 1.3,
    },

    ".MuiTypography-h6": {
      fontSize: "12px",
      fontWeight: 500,
    },

    ".price": {
      fontSize: "12px",
      fontWeight: 600,
    },
  })
);

export const CustomCardMedia = styled(CardMedia)(
  ({ theme, horizontalcard, loveItem }) => ({
    position: "relative",
    margin: "px",
    padding:
      loveItem === "true"
        ? "px"
        : horizontalcard === "true"
        ? "0rem"
        : "0rem",
    display: "flex",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: "8px",

    // Reduced image section height
    height: horizontalcard === "true" ? "180px" : "120px",
    width: horizontalcard === "true" ? "200px" : "100%",
    backgroundColor:
      horizontalcard === "true" ? "rgba(223, 143, 14, 1)" : "transparent",

    ".MuiBox-root": {
      overflow: "hidden",
      borderRadius: "6px",
    },

    img: {
      height: "100%",
      width: "100%",
      objectFit: "contain",
      transition: "transform 0.3s ease",
    },

    [theme.breakpoints.down("sm")]: {
      height: horizontalcard === "true" ? "120px" : "110px",
      width: horizontalcard === "true" ? "160px" : "100%",
    },
  })
);

export const CustomCardButton = styled(CustomButtonPrimary)(
  ({ theme, disabled }) => ({
    marginTop: "6px",
    padding: "4px 10px",
    fontSize: "12px",
    borderRadius: "8px",
    background: disabled
      ? alpha(theme.palette.secondary.light, 0.3)
      : theme.palette.secondary.light,
    "&:hover": {
      background: theme.palette.secondary.main,
    },
  })
);


  const ProductCard = (props) => {
    const {
      loveItem,
      item,
      cardheight,
      horizontalcard,
      changed_bg,
      wishlistcard,
      deleteWishlistItem,
      cardFor,
      noMargin,
      cardType,
      specialCard,
      cardWidth,
      sold,
      stock,
      pharmaCommon,
      noRecommended,
    } = props;
    const [state, dispatch] = useReducer(reducer, initialState);
    const [openModal, setOpenModal] = React.useState(false);
    const [openLocationAlert, setOpenLocationAlert] = useState(false);
    const { configData } = useSelector((state) => state.configData);
    const imageBaseUrl = configData?.base_urls?.item_image_url;
    const router = useRouter();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
    const reduxDispatch = useDispatch();
    const { cartList: aliasCartList } = useSelector((state) => state.cart);
    const cartList = getCartListModuleWise(aliasCartList);
    const classes = textWithEllipsis();
    const { t } = useTranslation();
    const p_off = t("%");
    const { wishLists } = useSelector((state) => state.wishList);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const { mutate: addFavoriteMutation } = useAddToWishlist();
    const { mutate } = useWishListDelete();
    const [isProductExist, setIsProductExist] = useState(false);
    const [count, setCount] = useState(0);
    const { mutate: addToMutate, isLoading } = useAddCartItem();
    const { mutate: updateMutate, isLoading: updateLoading } =
      useCartItemUpdate();
    const { mutate: cartItemRemoveMutate } = useDeleteCartItem();

    const { data: fullItemDetails, isLoading: fullItemLoading } = useGetItemDetails({
      itemId: item?.id,
      moduleId: item?.module_id,
      enabled: cardFor === "list-view" && !!item?.id,
    });

    const displayItem = cardFor === "list-view" ? fullItemDetails || item : item;
  useEffect(() => {
    const isInCart = getItemFromCartlist();
    if (isInCart) {
      setIsProductExist(true);
      setCount(isInCart?.quantity);
    } else {
      setIsProductExist(false);
    }
  }, [aliasCartList]);

  const getItemFromCartlist = () => {
    const cartList = getCartListModuleWise(aliasCartList);
    return cartList?.find((things) => things.id === item?.id);
  };
  useEffect(() => {
    wishlistItemExistHandler();
  }, [wishLists]);
  const wishlistItemExistHandler = () => {
    if (wishLists?.item?.find((wishItem) => wishItem.id === item?.id)) {
      setIsWishlisted(true);
    } else {
      setIsWishlisted(false);
    }
  };

  useEffect(() => {}, [state.clearCartModal]);
  const handleClearCartModalOpen = () =>
    dispatch({ type: ACTION.setClearCartModal, payload: true });
  const handleCloseForClearCart = (value) => {
    if (value === "add-item") {
      const itemObject = {
        guest_id: getGuestId(),
        model: state.modalData[0]?.available_date_starts
          ? "ItemCampaign"
          : "Item",
        add_on_ids: [],
        add_on_qtys: [],
        item_id: state.modalData[0]?.id,
        price: state?.modalData[0]?.price,
        quantity: state?.modalData[0]?.quantity,
        variation: [],
      };
      addToMutate(itemObject, {
        onSuccess: handleSuccess,
        onError: onErrorResponse,
      });
    } else {
      dispatch({ type: ACTION.setClearCartModal, payload: false });
    }
  };
  
    const handleBadge = () => {
      const offerRibbonStyle = {
        borderRadius:'0 !important',
        mx:'0 !important',
        px:'0important',
        position: 'absolute',
        top: '0',
        left: '6px',
        background: 'linear-gradient(135deg, #ff5f6d, #ffc371)', // gradient color
        color: '#fff',
        fontWeight: '800 !important',
        // fontSize: '1px !important', // Adjusted font size to be smaller
       
        
        padding: '8px 3px', // Adjusted padding to fit the smaller text
        width: '25px',
        textAlign: 'center',
        clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 80% 85%, 70% 100%, 60% 85%, 50% 100%, 40% 85%, 30% 100%, 20% 85%, 10% 100%, 0 85%)', // No top radius applied
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
        zIndex: 10,
         '& .MuiTypography-root': {
    fontSize: '10px !important',  // Added specific targeting for Typography component
    fontWeight:'700',
  },
      };

      if (Number.parseInt(item?.store_discount) === 0) {
        if (Number.parseInt(item?.discount) > 0) {
          if (item?.discount_type === "percent") {
            return (
              <Box sx={offerRibbonStyle}>
                <Typography>{`${item?.discount}${p_off}`}</Typography>
              </Box>
            );
          } else {
            return (
              <Box sx={offerRibbonStyle}>
                <Typography>{getAmountWithSign(item?.discount, item?.discount % 1 ? true : false)}</Typography>
              </Box>
            );
          }
        }
      } else {
        if (Number.parseInt(item?.store_discount) > 0) {
          return (
            <Box sx={offerRibbonStyle}>
              <Typography>{`${item?.store_discount}${p_off}`}</Typography>
            </Box>
          );
        }
      }
    };

      const handleClick = () => {
        if (item?.module_type === "ecommerce") {
          router.push({
            pathname: "/product/[id]",
            query: {
              id: `${item?.slug ? item?.slug : item?.id}`,
              module_id: `${getModuleId()}`,
            },
          });
        } else {
          dispatch({ type: ACTION.setOpenModal, payload: true });
        }
      };

      useEffect(() => {
        if (displayItem) {
          dispatch({
            type: ACTION.setModalData,
            payload: {
              ...displayItem,
              quantity: 1,
              price: displayItem?.price || item?.price,
              totalPrice: (displayItem?.price || item?.price),
            },
          });
        }
      }, [displayItem, item]);
      const isInCart = cartList?.find((things) => things.id === item?.id);
      const handleSuccess = (res) => {
        if (res) {
          let product = {};
          res?.forEach((item) => {
            product = {
              ...item?.item,
              cartItemId: item?.id,
              quantity: item?.quantity,
              totalPrice: item?.price,
              selectedOption: [],
            };
          });
          reduxDispatch(setCart(product));
          toast.success(t("Item added to cart"));
          dispatch({ type: ACTION.setClearCartModal, payload: false });
        }
      };

  const addToCartHandler = () => {
    const currentModuleType = getCurrentModuleType();
    if (currentModuleType === "pharmacy") {
      // For pharmacy, allow adding items without prompt
      if (!isInCart) {
        const itemObject = {
          guest_id: getGuestId(),
          model: state.modalData[0]?.available_date_starts
            ? "ItemCampaign"
            : "Item",
          add_on_ids: [],
          add_on_qtys: [],
          item_id: state.modalData[0]?.id,
          price: state?.modalData[0]?.price,
          quantity: state?.modalData[0]?.quantity,
          variation: [],
        };
        addToMutate(itemObject, {
          onSuccess: handleSuccess,
          onError: onErrorResponse,
        });
      }
      return;
    }

    if (cartList.length > 0) {
      const isStoreExist = cartList.find(
        (item) => item?.store_id === state?.modalData[0]?.store_id
      );

      if (isStoreExist) {
        if (!isInCart) {
          const itemObject = {
            guest_id: getGuestId(),
            model: state.modalData[0]?.available_date_starts
              ? "ItemCampaign"
              : "Item",
            add_on_ids: [],
            add_on_qtys: [],
            item_id: state.modalData[0]?.id,
            price: state?.modalData[0]?.price,
            quantity: state?.modalData[0]?.quantity,
            variation: [],
          };
          addToMutate(itemObject, {
            onSuccess: handleSuccess,
            onError: onErrorResponse,
          });
        }
      } else {
        if (!isInCart) {
          const itemObject = {
            guest_id: getGuestId(),
            model: state.modalData[0]?.available_date_starts
              ? "ItemCampaign"
              : "Item",
            add_on_ids: [],
            add_on_qtys: [],
            item_id: state.modalData[0]?.id,
            price: state?.modalData[0]?.price,
            quantity: state?.modalData[0]?.quantity,
            variation: [],
          };
          addToMutate(itemObject, {
            onSuccess: handleSuccess,
            onError: onErrorResponse,
          });
        }
      }
    } else {
      if (!isInCart) {
        const itemObject = {
          guest_id: getGuestId(),
          model: state.modalData[0]?.available_date_starts
            ? "ItemCampaign"
            : "Item",
          add_on_ids: [],
          add_on_qtys: [],
          item_id: state?.modalData[0]?.id,
          price: state?.modalData[0]?.price,
          quantity: state?.modalData[0]?.quantity,
          variation: [],
        };
        addToMutate(itemObject, {
          onSuccess: handleSuccess,
          onError: onErrorResponse,
        });
      }
    }
  };

  const addToCart = (e) => {
    if (item?.module_type === "ecommerce") {
      if (item?.variations.length > 0) {
        router.push({
          pathname: "/product/[id]",
          query: {
            id: `${item?.slug ? item?.slug : item?.id}`,
            module_id: `${getModuleId()}`,
          },
        });
      } else {
        e.stopPropagation();
        addToCartHandler();
      }
    } else {
      if (item?.module_type === "food") {
        if (item?.food_variations?.length > 0) {
          dispatch({ type: ACTION.setOpenModal, payload: true });
        } else {
          e.stopPropagation();
          addToCartHandler();
        }
      } else if (item?.variations?.length > 0) {
        dispatch({ type: ACTION.setOpenModal, payload: true });
      } else {
        e.stopPropagation();
        addToCartHandler();
      }
    }
  };

  const quickViewHandleClick = (e) => {
    e.stopPropagation();
    dispatch({ type: ACTION.setOpenModal, payload: true });
  };
  const cartUpdateHandleSuccess = (res) => {
    if (res) {
      res?.forEach((item) => {
        if (isInCart?.cartItemId === item?.id) {
          const product = {
            ...item?.item,
            cartItemId: item?.id,
            totalPrice: item?.price,
            quantity: item?.quantity,
            food_variations: item?.item?.food_variations,
            selectedAddons: item?.item?.addons,
            itemBasePrice: item?.item?.price,
            selectedOption: item?.variation,
          };

          reduxDispatch(setIncrementToCartItem(product)); // Dispatch the single product
        }
      });
    }
  };
  const cartUpdateHandleSuccessDecrement = (res) => {
    if (res) {
      res?.forEach((item) => {
        const product = {
          ...item?.item,
          cartItemId: item?.id,
          totalPrice: item?.price,
          quantity: item?.quantity,
          food_variations: item?.item?.food_variations,
          selectedAddons: item?.item?.addons,
          itemBasePrice: item?.item?.price,
          selectedOption: item?.variation,
        };
        reduxDispatch(setDecrementToCartItem(product));
      });
    }
  };
  const handleIncrement = () => {
    const isExisted = getItemFromCartlist();
    const updateQuantity = isInCart?.quantity + 1;
    const itemObject = getItemDataForAddToCart(
      isInCart,
      updateQuantity,
      getPriceAfterQuantityChange(isInCart, updateQuantity),
      getGuestId()
    );
    if (isExisted) {
      if (getCurrentModuleType() === "food") {
        if (item?.maximum_cart_quantity) {
          if (item?.maximum_cart_quantity <= isExisted?.quantity) {
            toast.error(t(out_of_limits));
          } else {
            updateMutate(itemObject, {
              onSuccess: cartUpdateHandleSuccess,
              onError: onErrorResponse,
            });
          }
        } else {
          updateMutate(itemObject, {
            onSuccess: cartUpdateHandleSuccess,
            onError: onErrorResponse,
          });
        }
      } else {
        if (isExisted?.quantity + 1 <= item?.stock) {
          if (item?.maximum_cart_quantity) {
            if (item?.maximum_cart_quantity <= isExisted?.quantity) {
              toast.error(t(out_of_limits));
            } else {
              updateMutate(itemObject, {
                onSuccess: cartUpdateHandleSuccess,
                onError: onErrorResponse,
              });
            }
          } else {
            updateMutate(itemObject, {
              onSuccess: cartUpdateHandleSuccess,
              onError: onErrorResponse,
            });
            reduxDispatch(setIncrementToCartItem(isInCart));
          }
        } else {
          toast.error(t(out_of_stock));
        }
      }
    }
  };
  const handleClose = () => {
    dispatch({ type: ACTION.setOpenModal, payload: false });
  };

  const handleSuccessRemoveItem = () => {
    reduxDispatch(setRemoveItemFromCart(isInCart));
    toast.success(t("Removed from cart."));
  };
  const handleDecrement = () => {
    const updateQuantity = isInCart?.quantity - 1;

    const isExisted = getItemFromCartlist();
    if (isExisted?.quantity === 1) {
      const cartIdAndGuestId = {
        cart_id: isInCart?.cartItemId,
        guestId: getGuestId(),
      };
      cartItemRemoveMutate(cartIdAndGuestId, {
        onSuccess: handleSuccessRemoveItem,
        onError: onErrorResponse,
      });
    } else {
      const itemObject = getItemDataForAddToCart(
        isInCart,
        updateQuantity,
        getPriceAfterQuantityChange(isInCart, updateQuantity),
        getGuestId()
      );
      updateMutate(itemObject, {
        onSuccess: cartUpdateHandleSuccessDecrement,
        onError: onErrorResponse,
      });
    }
  };
  const lanDirection = getLanguage() ? getLanguage() : "ltr";
  const popularCardUi = () => {
    return (
      <CustomStackFullWidth
        justifyContent="center"
        alignItems="flex-start"

        sx={{ position: "relative", padding: "13px 16px 16px 13px", background:" rgb(255, 243, 224)" }}
      >
        {isWishlisted && (
          <Box
            sx={{
              color: "primary.main",
              position: "absolute",
              top: 20,
              right: 10,
            }}
          >
            <FavoriteIcon sx={{ fontSize: "15px" }} />
          </Box>
        )}
        <PrimaryToolTip text={item?.name} placement="bottom" arrow="false">
          <Typography
            variant={horizontalcard === "true" ? "subtitle2" : "h6"}
            marginBottom="4px"
            sx={{
              lineHeight: "45px",
              textAlign: lanDirection === "rtl" && "end",
              color:red,
              fontSize: { xs: "13px", sm: "inherit" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical",
              height: "36px",
              mt: "5px",
              width: "210px",
              [theme.breakpoints.down("sm")]: {
                width: "146px",
              },
            }}
            className="name"
            component="h3"
          >
            {item?.name}
          </Typography>
        </PrimaryToolTip>
        <Stack mt="5px">
          <Typography fontSize="10px" component="h4">
            {t("start from")}
          </Typography>
          <Typography
            fontSize={{ xs: "14px", md: "16px" }}
            fontWeight="600"
            color={theme.palette.text.primary}
            component="h4"
          >
            {getAmountWithSign(item?.price)}
          </Typography>
        </Stack>
        <CustomStackFullWidth
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
          mb="3px"
          paddingRight="3px"
        >
          <Typography
            mt="4px"
            color="text.secondary"
            variant={isSmall ? "body2" : "body1"}
          >
            {item?.unit_type}
          </Typography>
          <AddWithIncrementDecrement
            onHover={state.isTransformed}
            addToCartHandler={addToCart}
            isProductExist={isProductExist}
            handleIncrement={handleIncrement}
            handleDecrement={handleDecrement}
            count={count}
            isLoading={isLoading}
            updateLoading={updateLoading}
          />
        </CustomStackFullWidth>
      </CustomStackFullWidth>
    );
  };

  const listViewCardUi = () => {
    return (
      <CustomStackFullWidth
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={1}
        p="1rem"
      >
        {isWishlisted && (
          <Box
            sx={{
              color: "primary.main",
              position: "absolute",
              top: 20,
              right: 10,
            }}
          >
            <FavoriteIcon sx={{ fontSize: "15px" }} />
          </Box>
        )}

        <PrimaryToolTip text={displayItem?.name} placement="bottom" arrow="false">
          <H3 text={displayItem?.name} component="h3" />
        </PrimaryToolTip>
        <CustomBoxFullWidth>
          {displayItem?.module_type === "pharmacy" ? (
            <Typography
              className={classes.singleLineEllipsis}
              variant="body2"
              color="text.secondary"
              sx={{ wordBreak: "break-word" }}
              component="h4"
            >
              {displayItem?.generic_name?.[0] || displayItem?.generic_name}
            </Typography>
          ) : (
            <Body2 text={displayItem?.store_name || displayItem?.store?.name} component="h4" />
          )}
        </CustomBoxFullWidth>
        {displayItem?.unit_type ? (
          <Typography
            sx={{
              color: (theme) => theme.palette.customColor.textGray,
            }}
          >
            {displayItem?.unit_type}
          </Typography>
        ) : (
          <Typography
            sx={{
              color: (theme) => theme.palette.customColor.textGray,
            }}
          >
            {t("No unit type")}
          </Typography>
        )}

       <CustomStackFullWidth
  direction="column"
  spacing={0.5}
  alignItems="flex-start"
  sx={{ width: "100%" }}
>
  <AmountWithDiscountedAmount item={item} />

  {/* <Button
    variant="outlined"
    color="primary"
    onClick={() => handleAddToCart(item)}
    sx={{
      minHeight: '24px',
      padding: '4px 10px',
      fontSize: '0.75rem',
      mt: '4px',
      alignSelf: 'flex-start',
    }}
  >
    Add
  </Button> */}
</CustomStackFullWidth>

      </CustomStackFullWidth>
    );
  };
  const foodHorizontalCardUi = () => {
    return (
      <CustomStackFullWidth
        justifyContent="center"
        alignItems="flex-start"
        sx={{ position: "relative", padding: "13px 16px 16px 13px",background:" rgb(255, 243, 224)"
        }}
      >
        {isWishlisted && (
          <Box
            sx={{
              color: "primary.main",
              position: "absolute",
              top: 20,
              right: 10,
              background:"#FF6600",
            }}
          >
            <FavoriteIcon sx={{ fontSize: "15px" }} />
          </Box>
        )}
        {/* <CustomStackFullWidth> */}
        <CustomStackFullWidth
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          spacing={0.8}
        >
          <PrimaryToolTip text={item?.name} placement="bottom" arrow="false">
        <Typography
          variant={horizontalcard === "true" ? "subtitle2" : "h6"}
          marginBottom="4px"
          sx={{
            color: (theme) => theme.palette.text.custom,
            fontSize: { xs: "13px", sm: "inherit" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            lineHeight: "1.2", // Adjust this value to control line height
            mt: "5px",
            "&:hover": {
              color: "#FF6600",
            },
          }}
          className="name"
          component="h3"
        >
          {item?.name}
        </Typography>
          </PrimaryToolTip>
          {configData?.toggle_veg_non_veg ? (
            <FoodVegNonVegFlag veg={item?.veg === 0 ? "false" : "true"} />
          ) : null}
        </CustomStackFullWidth>
        <Typography
          color="text.secondary"
          variant={isSmall ? "body2" : "body1"}
          component="h4"
        >
          {item?.store_name}
        </Typography>
        {item?.unit_type && (
          <Typography
            color="text.secondary"
            variant={isSmall ? "body2" : "body1"}
            component="h4"
          >
            {item?.unit_type}
          </Typography>
        )}
        {/* </CustomStackFullWidth> */}
        <CustomStackFullWidth
          direction="row"
          alignItems="flex-start"
          // justifyContent="space-between"
          spacing={13}
          mb="3px"
          mt="10px"
        >
          <AmountWithDiscountedAmount item={item} />
        </CustomStackFullWidth>
        <CustomStackFullWidth
          alignItems="flex-end"
          sx={{ paddingRight: "6px" }}
        >
          <Box>
            <AddWithIncrementDecrement
              onHover={state.isTransformed}
              addToCartHandler={addToCart}
              isProductExist={isProductExist}
              handleIncrement={handleIncrement}
              handleDecrement={handleDecrement}
              count={count}
              isLoading={isLoading}
              updateLoading={updateLoading}
            />
          </Box>
        </CustomStackFullWidth>
      </CustomStackFullWidth>
    );
  };

  // Move the useState and useAddCartItem hook to the top of the component
  const [addingProductId, setAddingProductId] = useState(null);
  const addCartMutation = useAddCartItem();

// const handleAddToCart = (item) => {
//   setAddingProductId(item?.id); // Set the ID of the product being added to the cart
//   const guestId = getGuestId(); // Retrieve the guest ID (likely used for anonymous users)
//   const itemData = getItemDataForAddToCart(item, 1, item?.price, guestId); // Prepare data for the API call

//   // Log cartList before optimistic update
//   console.log('Cart before optimistic update:', cartList);

//   // Optimistically update the cart by immediately adding the item to the cart in the UI
//   const optimisticCart = [
//     ...cartList, // Assuming cartList is the current state of the cart
//     { 
//       ...item, 
//       cartItemId: item?.id, 
//       quantity: 1, 
//       totalPrice: item?.price,
//       selectedOption: [],
//     }
//   ];
//   console.log('Optimistic Cart:', optimisticCart);

//   dispatch(setCartList(optimisticCart)); // Optimistically update the Redux store

//   // Log cartList after dispatching action
//   console.log('Cart after optimistic update:', optimisticCart);

//   // Trigger the API call to add the item to the cart
//   addCartMutation.mutate(itemData, {
//     onSuccess: (res) => {
//       setAddingProductId(null); // Clear the addingProductId once the item has been added
//       if (res && res.length > 0) {
//         // Log response from API
//         console.log('API response for adding to cart:', res);

//         // Update the Redux store with the new cart items
//         dispatch(
//           setCartList(
//             res.map((item) => ({
//               ...item.item,
//               cartItemId: item.id,
//               quantity: item.quantity,
//               totalPrice: item.price,
//               selectedOption: [],
//             }))
//           )
//         );
//         toast.success(`${item.name} added to cart`); // Show success notification
//       }
//     },
//     onError: () => {
//       setAddingProductId(null); // Clear addingProductId on error
//       toast.error('Failed to add to cart'); // Show error notification

//       // Rollback to previous cart state if the mutation fails
//       dispatch(setCartList(cartList)); // Restore old cart state if error occurs
//     },
//   });
// };

const handleAddToCart = (item) => {
  setAddingProductId(item?.id); // Set the ID of the product being added to the cart
  const guestId = getGuestId(); // Retrieve the guest ID (likely used for anonymous users)
  const itemData = getItemDataForAddToCart(item, 1, item?.price, guestId); // Prepare data for the API call

  // Log cartList before optimistic update
  // console.log('Cart before optimistic update:', aliasCartList);

  // Optimistically update the cart by immediately adding the item to the cart in the UI
  const optimisticCart = [
    ...aliasCartList, // Copy the current cartList state
    { 
      ...item, 
      cartItemId: item?.id, 
      quantity: 1, 
      totalPrice: item?.price,
      selectedOption: [],
    }
  ];
  // console.log('Optimistic Cart:', optimisticCart);

  // Optimistically update the Redux store
  dispatch(setCartList(optimisticCart));

  // Log cartList after dispatching action
  // console.log('Cart after optimistic update:', optimisticCart);

  // Trigger the API call to add the item to the cart
  addCartMutation.mutate(itemData, {
    onSuccess: (res) => {
      setAddingProductId(null); // Clear the addingProductId once the item has been added
      if (res && res.length > 0) {
        // Log response from API
        // console.log('API response for adding to cart:', res);

        // Update the Redux store with the new cart items (from the API response)
        dispatch(
          setCartList(
            res.map((item) => ({
              ...item.item,
              cartItemId: item.id,
              quantity: item.quantity,
              totalPrice: item.price,
              selectedOption: [],
            }))
          )
        );
        toast.success(`${item.name} added to cart`); // Show success notification
      }
    },
    onError: () => {
      setAddingProductId(null); // Clear addingProductId on error
      toast.error('Failed to add to cart'); // Show error notification

      // Rollback to previous cart state if the mutation fails
      dispatch(setCartList(aliasCartList)); // Restore old cart state if error occurs
    },
  });
};
// Define the verticalCardUi function
const verticalCardUi = () => {
  return (
    <CustomStackFullWidth
      justifyContent="center"
      alignItems=""
      spacing={0.6}
      p={item?.module_type === 'pharmacy' ? '5px 16px 16px 16px' : '1rem'}
    >
      {item?.module_type === 'pharmacy' ? (
        <Typography
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '1',
            WebkitBoxOrient: 'vertical',
            width: '100%',
            paddingTop: '3px',
            maxWidth: '200px',
            wordWrap: 'break-word',
          }}
          variant="body2"
          color="#93A2AE"
          textAlign="center"
          component="h4"
        >
          {item?.generic_name[0]}
        </Typography>
      ) : (
        <Body2 text={item?.store_name} component="h4" />
      )}

      <PrimaryToolTip text={item?.name} placement="bottom" arrow="false">
        <Typography
          className={classes.singleLineEllipsis}
          fontSize={{ xs: '12px', md: '14px' }}
          fontWeight="500"
          component="h3"
        >
          {item?.name}
        </Typography>
      </PrimaryToolTip>

      <CustomStackFullWidth justifyContent="center" alignItems="" spacing={0.5}>
        {cardType === 'vertical-type' ? (
          <Typography>{item?.unit_type}</Typography>
        ) : (
          <CustomMultipleRatings rating={4.5} withCount />
        )}

        {/* Add button in front of old and new price */}
      <CustomStackFullWidth
  direction="column"
  spacing={0.5}
  alignItems="flex-start"
  sx={{ width: "100%" }}
>
  <AmountWithDiscountedAmount item={item} />

  {/* <Button
    variant="outlined"
    color="primary"
    onClick={() => handleAddToCart(item)}
    sx={{
      minHeight: '24px',
      padding: '4px 10px',
      fontSize: '0.75rem',
      mt: '4px',
      alignSelf: 'flex-start',
    }}
  >
    Add
  </Button> */}
</CustomStackFullWidth>

      </CustomStackFullWidth>
    </CustomStackFullWidth>
  );
};



  const verticalCardFlashUi = () => {
    return (
      <CustomStackFullWidth
        justifyContent="center"
        alignItems="center"
        spacing={1.5}
        // p="1rem"
        p="0 4px"
      >
        <Body2 text={item?.store_name} />
        <PrimaryToolTip text={item?.name} placement="bottom" arrow="false">
          <H3 text={item?.name} component="h3" />
        </PrimaryToolTip>
        <CustomStackFullWidth
          justifyContent="center"
          alignItems="center"
          spacing={0.5}
        >
          {cardType === "vertical-type" ? (
            <Typography>{item?.unit_type}</Typography>
          ) : (
            <CustomMultipleRatings rating={4.5} withCount />
          )}

          {stock === 0 ? (
            <Typography
              variant="h5"
              display="flex"
              alignItems="center"
              flexWrap="wrap"
              gap="5px"
              sx={{
                fontSize: { xs: "13px", sm: "18px" },
                color: alpha(theme.palette.error.deepLight, 0.7),
              }}
            >
              {t("Out of Stock")}
            </Typography>
          ) : (
            <AmountWithDiscountedAmount item={item} />
          )}
          <CustomStackFullWidth mt="100px" spacing={1}>
            <CustomLinearProgressbar value={(sold / stock) * 100} height={3} />
            <CustomStackFullWidth
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                fontSize="11px"
                fontWeight="bold"
                lineHeight="16px"
                variant="body2"
              >
                <CustomSpan>{t("Sold")}</CustomSpan> : {sold} {t("items")}
              </Typography>
              <Typography
                fontSize="11px"
                fontWeight="bold"
                lineHeight="16px"
                variant="body2"
              >
                <CustomSpan>{t("Available")}</CustomSpan> : {stock} {t("items")}
              </Typography>
            </CustomStackFullWidth>
          </CustomStackFullWidth>
        </CustomStackFullWidth>
      </CustomStackFullWidth>
    );
  };
  const verticalCardFlashSliderUi = () => {
    return (
      <CustomStackFullWidth
        justifyContent="center"
        alignItems="center"
        spacing={1.5}
        p="1rem"
      >
        <Body2 text={item?.store_name} component="h4" />
        <PrimaryToolTip text={item?.name} placement="bottom" arrow="false">
          <H3 text={item?.name} component="h3" />
        </PrimaryToolTip>
        <CustomStackFullWidth
          justifyContent="center"
          alignItems="center"
          spacing={0.5}
        >
          {cardType === "vertical-type" ? (
            <Typography>{item?.unit_type}</Typography>
          ) : (
            <CustomMultipleRatings rating={4.5} withCount />
          )}
          <AmountWithDiscountedAmount item={item} />
        </CustomStackFullWidth>
      </CustomStackFullWidth>
    );
  };

  const addToWishlistHandler = (e) => {
    e.stopPropagation();
    let token = undefined;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("token");
    }
    if (token) {
      addFavoriteMutation(item?.id, {
        onSuccess: (response) => {
          if (response) {
            reduxDispatch(addWishList(item));
            setIsWishlisted(true);
            toast.success(response?.message);
          }
        },
        onError: (error) => {
          toast.error(error.response.data.message);
        },
      });
    } else toast.error(t(not_logged_in_message));
  };
  const removeFromWishlistHandler = (e) => {
    e.stopPropagation();
    const onSuccessHandlerForDelete = (res) => {
      reduxDispatch(removeWishListItem(item?.id));
      setIsWishlisted(false);
      toast.success(res.message, {
        id: "wishlist",
      });
    };
    mutate(item?.id, {
      onSuccess: onSuccessHandlerForDelete,
      onError: (error) => {
        toast.error(error.response.data.message);
      },
    });
  };

  const handleHoverOnCartIcon = (value) => {
    dispatch({ type: ACTION.setIsTransformed, payload: value });
  };

  return (
    <Stack sx={{ position: "relative" }}>
      {state.openModal && getCurrentModuleType() === "food" && item ? (
        <FoodDetailModal
          product={item}
          imageBaseUrl={imageBaseUrl}
          open={state.openModal}
          handleModalClose={handleClose}
          setOpen={(value) =>
            dispatch({ type: ACTION.setOpenModal, payload: value })
          }
          addToWishlistHandler={addToWishlistHandler}
          removeFromWishlistHandler={removeFromWishlistHandler}
          isWishlisted={isWishlisted}
        />
      ) : (
        <>
          {/* {cardFor === "flashSale" ? (
            <>
              {stock !== 0 && (
                <ModuleModal
                  open={state.openModal}
                  handleModalClose={handleClose}
                  configData={configData}
                  productDetailsData={item}
                  addToWishlistHandler={addToWishlistHandler}
                  removeFromWishlistHandler={removeFromWishlistHandler}
                  isWishlisted={isWishlisted}
                />
              )}
            </>
          ) : (
            displayItem && (
              <ModuleModal
                open={state.openModal}
                handleModalClose={handleClose}
                configData={configData}
                productDetailsData={displayItem}
                addToWishlistHandler={addToWishlistHandler}
                removeFromWishlistHandler={removeFromWishlistHandler}
                isWishlisted={isWishlisted}
              />
            )
          )} */}
        </>
      )}
      {wishlistcard === "true" && (
        <HeartWrapper onClick={() => setOpenModal(true)} top="5px" right="5px">
          <DeleteIcon style={{ color: theme.palette.error.light }} />
        </HeartWrapper>
      )}

      {specialCard === "true" ? (
        <SpecialCard
          item={item}
          imageBaseUrl={imageBaseUrl}
          quickViewHandleClick={quickViewHandleClick}
          addToCart={addToCart}
          handleBadge={handleBadge}
          addToCartHandler={addToCart}
          isProductExist={isProductExist}
          handleIncrement={handleIncrement}
          handleDecrement={handleDecrement}
          count={count}
          handleClick={handleClick}
          isLoading={isLoading}
          updateLoading={updateLoading}
          setOpenLocationAlert={setOpenLocationAlert}
          noRecommended={noRecommended}
          configData={configData}
        />
      ) : (
        <CardWrapper
          cardFor={cardFor}
          cardType={cardType}
          nomargin={noMargin ? "true" : "false"}
          cardheight={cardheight}
          horizontalcard={horizontalcard}
          wishlistcard={wishlistcard}
          cardWidth={cardWidth}
          pharmaCommon={pharmaCommon}
          onClick={() => handleClick()}
          onMouseEnter={() =>
            dispatch({
              type: ACTION.setIsTransformed,
              payload: true,
            })
          }
          onMouseDown={() =>
            dispatch({
              type: ACTION.setIsTransformed,
              payload: true,
            })
          }
          onMouseLeave={() =>
            dispatch({
              type: ACTION.setIsTransformed,
              payload: false,
            })
          }
        >
          <CustomStackFullWidth
            direction={{
              xs: horizontalcard === "true" ? "row" : "column",
              sm: horizontalcard === "true" ? "row" : "column",
            }}
            justifyContent="flex-start"
            height="100%"
            sx={{
              backgroundColor:
                horizontalcard === "true" &&
                changed_bg === "true" &&
                "rgb(255, 243, 224)",
              position: "relative",
            }}
          >
            <CustomCardMedia
              horizontalcard={horizontalcard}
              loveItem={loveItem}
            >
              {item?.module?.module_type === "pharmacy" && (
                <Stack
                  width="100%"
                  alignItems="center"
                  justifyContent="center"
                  padding={{
                    xs: "3px 3px 8px 3px",
                    md: "3px 3px 3px 3px",
                  }}
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#B3B3B399" : "#EDEDED99",
                    color: theme.palette.neutral[1000],
                    fontSize: "12px",
                    zIndex: "999",
                  }}
                  component="h4"
                >
                  {item?.store_name}
                </Stack>
              )}
              {handleBadge()}
              <CustomImageContainer
                src={item?.image_full_url}
                alt={item?.title}
                height="100%"
                width="100%"
                objectfit="cover"
                borderRadius="3px"
              />
              {item?.module?.module_type === "food" && (
                <ProductsUnavailable product={item} />
              )}
              {item?.halal_tag_status && item?.is_halal ? (
                <FoodHalalHaram width={30} />
              ) : (
                ""
              )}
              {/* <CustomOverLay hover={state.isTransformed} border_radius="5px" >
                <QuickView
                  quickViewHandleClick={quickViewHandleClick}
                  addToWishlistHandler={addToWishlistHandler}
                  removeFromWishlistHandler={removeFromWishlistHandler}
                  isWishlisted={isWishlisted}
                  isProductExist={isProductExist}
                  addToCartHandler={addToCart}
                  showAddtocart={cardFor === "vertical" && !isProductExist}
                  isLoading={isLoading}
                  openLocationAlert={openLocationAlert}
                  setOpenLocationAlert={setOpenLocationAlert}
                />
              </CustomOverLay> */}
              {cardFor === "vertical" && isProductExist && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 10,
                    bottom: 0,
                    zIndex: 999,
                  }}
                >
                  {/* <AddWithIncrementDecrement
                    verticalCard
                    onHover={state.isTransformed}
                    addToCartHandler={addToCart}
                    isProductExist={isProductExist}
                    handleIncrement={handleIncrement}
                    handleDecrement={handleDecrement}
                    setIsHover={handleHoverOnCartIcon}
                    count={count}
                    updateLoading={updateLoading}
                  /> */}
                </Box>
              )}
            </CustomCardMedia>
            <CustomStackFullWidth justifyContent="center">
              {cardFor === "popular items" && popularCardUi()}
              {cardFor === "vertical" && verticalCardUi()}
              {cardFor === "flashSale" && verticalCardFlashUi()}
              {cardFor === "flashSaleSlider" && verticalCardFlashSliderUi()}
              {cardFor === "food horizontal card" && foodHorizontalCardUi()}
              {cardFor === "list-view" && listViewCardUi()}
            </CustomStackFullWidth>
          </CustomStackFullWidth>
        </CardWrapper>
      )}

      <CustomModal openModal={state.clearCartModal} handleClose={handleClose}>
        <CartClearModal
          handleClose={handleCloseForClearCart}
          dispatchRedux={reduxDispatch}
          addToCard={addToCartHandler}
        />
      </CustomModal>
      <CustomDialogConfirm
        dialogTexts={t("Are you sure you want to  delete this item?")}
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => deleteWishlistItem(item?.id)}
      />
      <CustomModal
        openModal={openLocationAlert}
        handleClose={() => setOpenLocationAlert(false)}
      >
        <GetLocationAlert setOpenAlert={setOpenLocationAlert} />
      </CustomModal>
    </Stack>
  );
};

ProductCard.propTypes = {};

export default ProductCard;
