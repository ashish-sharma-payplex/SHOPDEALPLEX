import React, { useEffect, useReducer, useState } from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import CustomImageContainer from "../CustomImageContainer";
import { Stack } from "@mui/system";
import { IconButton, Typography } from "@mui/material";
import deleteIcon from "../../assets/delete.png";
import CartIcon from "../added-cart-view/assets/CartIcon";
import { useTheme } from "@emotion/react";
import { CustomIconButton } from "styled-components/CustomButtons.style";
import CustomDivider from "../CustomDivider";
import { useDispatch, useSelector } from "react-redux";
import { getCartListModuleWise } from "helper-functions/getCartListModuleWise";
import { setCart, setCartList } from "redux/slices/cart";
import toast from "react-hot-toast";
import {
  ACTION,
  initialState,
  reducer,
} from "../product-details/product-details-section/states";
import { getModuleId } from "helper-functions/getModuleId";
import { useRouter } from "next/router";
import { t } from "i18next";
import CustomDialogConfirm from "../custom-dialog/confirm/CustomDialogConfirm";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import FoodDetailModal from "../food-details/foodDetail-modal/FoodDetailModal";
import ModuleModal from "../cards/ModuleModal";
import { addWishList, removeWishListItem } from "redux/slices/wishList";
import { not_logged_in_message } from "utils/toasterMessages";
import { useAddToWishlist } from "api-manage/hooks/react-query/wish-list/useAddWishList";
import { useWishListDelete } from "api-manage/hooks/react-query/wish-list/useWishListDelete";
import AmountWithDiscountedAmount from "../AmountWithDiscountedAmount";
import CustomModal from "../modal";
import { getGuestId } from "helper-functions/getToken";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import useAddCartItem from "../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import Loading from "../custom-loading/Loading";

const WishListCard = ({ item }) => {
  const theme = useTheme();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const reduxDispatch = useDispatch();
  const [openModal, setOpenModal] = React.useState(false);
  const [openItemModal, setOpenItemModal] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { configData } = useSelector((state) => state.configData);
  const imageBaseUrl = configData?.base_urls?.item_image_url;
  const { cartList: aliasCartList } = useSelector((state) => state.cart);
  const cartList = getCartListModuleWise(aliasCartList);
  const { mutate: addFavoriteMutation } = useAddToWishlist();
  const { wishLists } = useSelector((state) => state.wishList);
  const { mutate } = useWishListDelete();
  const router = useRouter();
  const { mutate: addToMutate, isLoading } = useAddCartItem();
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const [pendingAddItem, setPendingAddItem] = React.useState(null);

  const handleClose = () => {
    setOpenItemModal(false);
  };
  const handleCloseCart = () => {
    dispatch({ type: ACTION.setOpenModal, payload: false });
  };

  useEffect(() => {
    if (item) {
      dispatch({
        type: ACTION.setModalData,
        payload: {
          ...item,
          quantity: 1,
          price: item?.price,
          totalPrice: item?.price,
        },
      });
    }
  }, [item]);
  const handleSuccess = (res) => {
    if (res) {
      // Only add one product with quantity 1 regardless of duplicates in response
      const firstItem = res[0];
      if (firstItem) {
        const product = {
          ...firstItem?.item,
          cartItemId: firstItem?.id,
          quantity: 1,
          totalPrice: firstItem?.price,
          selectedOption: [],
          module_type: item?.module_type || "food",
          food_variations: item?.food_variations || [],
          isFromWishlist: true,
          wishlistItemId: firstItem?.id,
        };
        reduxDispatch(setCart(product));
        toast.success(t("Item added to cart"));
        // Close the modal after successful addition
        setOpenItemModal(false);
      }
    }
  };
  const addToCartHandler = (itemToAdd) => {
    const itemObject = {
      guest_id: getGuestId(),
      model: itemToAdd?.available_date_starts ? "ItemCampaign" : "Item",
      add_on_ids: [],
      add_on_qtys: [],
      item_id: itemToAdd?.id,
      price: itemToAdd?.price,
      quantity: 1,
      variation: [],
    };
    addToMutate(itemObject, {
      onSuccess: (res) => {
        handleSuccess(res);
        // Invalidate or refetch cart queries here to update UI immediately
        // Assuming react-query's queryClient is available via context or import
        if (typeof window !== "undefined") {
          import("react-query").then(({ queryClient }) => {
            if (queryClient && typeof queryClient.invalidateQueries === "function") {
              queryClient.invalidateQueries("cart");
            }
          });
        }
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || "";
        if (
          errorMessage.includes("You have item from another store in cart") ||
          errorMessage.includes("reset")
        ) {
          setPendingAddItem(itemToAdd);
          setShowResetConfirm(true);
        } else {
          onErrorResponse(error);
        }
      },
    });
  };
  const addToCart = (e) => {
    e.stopPropagation();
    // Always open product details modal instead of direct add to cart
    if (item?.module_type === "ecommerce") {
      setOpenItemModal(true);
    } else {
      setOpenItemModal(true);
    }
  };
  const handleClick = () => {
    // Always open product details modal for both ecommerce and food items
    setOpenItemModal(true);
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
          reduxDispatch(addWishList(item));
          setIsWishlisted(true);
          toast.success(response?.message || t("Item added to wishlist"));
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || t("Failed to add item to wishlist"));
        },
      });
    } else toast.error(t(not_logged_in_message));
  };
  const removeFromWishlistHandler = (e) => {
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
  const handleDelete = (e) => {
    e.stopPropagation();
    setOpenModal(true);
  };
  return (
    <>
      <CustomStackFullWidth
        direction="row"
        sx={{ marginTop: "1rem", cursor: "pointer" }}
        gap="10px"
        onClick={handleClick}
      >
        <CustomImageContainer
          src={item?.image_full_url}
          width="60px"
          height="60px"
          borderRadius="5px"
        />
        <Stack width="0px" flexGrow="1" justifyContent="center" spacing={0.5}>
          <Typography fontWeight="500" fontSize="14px">
            {item?.name}
          </Typography>
          <AmountWithDiscountedAmount item={item} />
          <Typography fontWeight="500" fontSize="16px"></Typography>
        </Stack>
        <Stack direction="row" gap="20px" alignSelf="center">
          <CustomIconButton onClick={(e) => addToCart(e)}>
            {isLoading ? (
              <Loading />
            ) : (
              <CartIcon
                width="18px"
                height="18px"
                color={theme.palette.primary.dark}
              />
            )}
          </CustomIconButton>
          <IconButton onClick={(e) => handleDelete(e)}>
            <CustomImageContainer
              src={deleteIcon.src}
              width="18px"
              height="18px"
            />
          </IconButton>
        </Stack>
      </CustomStackFullWidth>
      <CustomDivider paddingTop="1rem" width="100%" />
      {openItemModal && getCurrentModuleType() === "food" ? (
        <FoodDetailModal
          product={item}
          imageBaseUrl={imageBaseUrl}
          open={openItemModal}
          handleModalClose={handleClose}
          //setOpen={openItemModal}
          addToWishlistHandler={addToWishlistHandler}
          removeFromWishlistHandler={removeFromWishlistHandler}
          isWishlisted={isWishlisted}
        />
      ) : (
        <ModuleModal
          open={openItemModal}
          handleModalClose={handleClose}
          configData={configData}
          productDetailsData={item}
          addToWishlistHandler={addToWishlistHandler}
          removeFromWishlistHandler={removeFromWishlistHandler}
          isWishlisted={isWishlisted}
        />
      )}
      <CustomDialogConfirm
        dialogTexts={t("Are you sure you want to  delete this item?")}
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={removeFromWishlistHandler}
      />
      <CustomDialogConfirm
        dialogTexts={t("You have item from another store in cart. If you continue, your all previous item from cart will be removed and this one will be added.")}
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onSuccess={() => {
          if (pendingAddItem) {
            reduxDispatch(setCart([])); // Clear the cart
            addToCartHandler(pendingAddItem); // Add the new item
            setShowResetConfirm(false);
            setPendingAddItem(null);
          }
        }}
      />
    </>
  );
};

export default WishListCard;
