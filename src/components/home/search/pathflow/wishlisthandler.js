import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useQueryClient } from "react-query";

import { useAddToWishlist } from "api-manage/hooks/react-query/wish-list/useAddWishList";
import { useWishListDelete } from "api-manage/hooks/react-query/wish-list/useWishListDelete";

import { addWishList, removeWishListItem } from "redux/slices/wishList";
import { not_logged_in_message } from "utils/toasterMessages";

import { useWishlistSelector } from "api-manage/hooks/usegetwishlistselector";

const useWishlistHandler = (t) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  /* 🔥 Redux wishlist */
  const wishListState = useSelector((state) => state.wishList);

  /* 🔥 React Query selector */
  const { combinedWishlist } = useWishlistSelector();

  const { mutate: addFavoriteMutation } = useAddToWishlist();
  const { mutate: deleteFavoriteMutation } = useWishListDelete();

  /* ================= REDUX ARRAY ================= */

  const getReduxWishlistArray = () => {
    if (!wishListState) return [];

    if (Array.isArray(wishListState.wishLists)) {
      return wishListState.wishLists;
    }

    if (Array.isArray(wishListState.wishLists?.item)) {
      return wishListState.wishLists.item;
    }

    if (Array.isArray(wishListState.wishLists?.data)) {
      return wishListState.wishLists.data;
    }

    return [];
  };

  /* ================= SELECTOR ARRAY ================= */

  const getSelectorWishlistArray = () => {
    if (!combinedWishlist) return [];

    return [
      ...(combinedWishlist.item || []),
      ...(combinedWishlist.store || []),
      ...(combinedWishlist.vehicles || []),
      ...(combinedWishlist.providers || []),
    ];
  };

  /* ================= FINAL ARRAY ================= */

  const getWishListArray = () => {
    const reduxArray = getReduxWishlistArray();

    if (reduxArray.length > 0) return reduxArray;

    return getSelectorWishlistArray();
  };

  /* ================= CHECK ================= */

  const isWishlisted = (item) => {
    const wishArray = getWishListArray();
    const itemId = item?.id;

    return wishArray.some(
      (wishlistItem) =>
        Number(
          wishlistItem?.id ??
          wishlistItem?.product_id ??
          wishlistItem?.vehicle_id ??
          wishlistItem?.provider_id
        ) === Number(itemId)
    );
  };

  /* ================= ADD ================= */

  const addToWishlist = (item, e) => {
    e?.stopPropagation?.();

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    if (!token) {
      toast.error(t(not_logged_in_message));
      return;
    }

    const itemId = item?.id;

    addFavoriteMutation(itemId, {
      onSuccess: (response) => {
        /* 🔥 Update Redux instantly */
        dispatch(addWishList(item));

        /* 🔥 Refetch wishlist APIs */
        queryClient.invalidateQueries("wishList");
        queryClient.invalidateQueries("rentalWishList");

        toast.success(response?.message || "Added to wishlist");
      },

      onError: (error) => {
        toast.error(
  error?.response?.data?.message || "Failed to add to wishlist"
);
      }
    });
  }
  /* ================= REMOVE ================= */

  const removeFromWishlist = (item, e) => {
    e?.stopPropagation?.();

    const itemId = item?.id;

    deleteFavoriteMutation(itemId, {
      onSuccess: (res) => {
        /* 🔥 Update Redux instantly */
        dispatch(removeWishListItem(itemId));

        /* 🔥 Refetch wishlist APIs */
        queryClient.invalidateQueries("wishList");
        queryClient.invalidateQueries("rentalWishList");

        toast.success(res?.message || "Removed from wishlist");
      },

     onError: (error) => {
  toast.error(
    error?.response?.data?.message || "Failed to remove from wishlist"
  );
}
    });
  }
  return {
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
  };
};

export default useWishlistHandler;