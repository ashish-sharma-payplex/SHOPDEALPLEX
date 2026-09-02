import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useEffect, useState, useMemo } from "react";
import { useAddStoreToWishlist } from "api-manage/hooks/react-query/wish-list/useAddStoreToWishLists";
import { useWishListStoreDelete } from "api-manage/hooks/react-query/wish-list/useWishListStoreDelete";
import { addWishListStore, removeWishListStore } from "redux/slices/wishList";
import { not_logged_in_message } from "utils/toasterMessages";

const useStoreWishlistHandler = (t) => {
  const dispatch = useDispatch();
  const { wishLists } = useSelector((state) => state.wishList);
  
  const [wishlistedStores, setWishlistedStores] = useState([]);

  const { mutate: addFavoriteMutation } = useAddStoreToWishlist();
  const { mutate: deleteFavoriteMutation } = useWishListStoreDelete();

  // ===================== Sync local state with Redux =====================
  useEffect(() => {
    // console.log("🔹 Redux wishLists state changed:", wishLists);

    if (wishLists?.store) {
      setWishlistedStores(wishLists.store);
      // console.log("✅ Local wishlistedStores updated:", wishLists.store);
    } else {
      setWishlistedStores([]);
      // console.log("⚠️ Local wishlistedStores cleared (empty array)");
    }
  }, [wishLists]);

  // ===================== Combine Stores (optional for rental stores, etc.) =====================
  const combinedStores = useMemo(() => {
    const stores = wishLists?.store || [];
    // console.log("📦 Combined stores:", stores);
    return stores;
  }, [wishLists]);

  // ===================== CHECK IF STORE IS WISHLISTED =====================
  const isStoreWishlisted = (storeItem) => {
    const storeId = storeItem?.id ?? storeItem?.store_id;
    // console.log(`🔍 Checking wishlist status for storeId ${storeId}...`);

    const result = wishlistedStores.some(
      (item) => Number(item?.id ?? item?.store_id) === Number(storeId)
    );
    
    // console.log(`🔍 Store ${storeId} is ${result ? "in" : "not in"} the wishlist.`);
    return result;
  };

  // ===================== ADD STORE TO WISHLIST =====================
  const addStoreToWishlist = (storeItem, e) => {
    // console.log("🟢 Attempting to add store to wishlist:", storeItem);
    
    e?.stopPropagation?.();
    // console.log("🔹 Event propagation stopped for add action.");

    const token = localStorage.getItem("token");
    // console.log("🛡️ Token check for wishlist add:", token);

    if (!token) {
      toast.error(t(not_logged_in_message));
      // console.log("❌ User not logged in, cannot add to wishlist");
      return;
    }

    if (isStoreWishlisted(storeItem)) {
      toast.error("Store is already in wishlist");
      // console.log(`⚠️ Store ${storeItem.id} is already in wishlist`);
      return;
    }

    // console.log(`✨ Adding store ${storeItem.id} to wishlist via API...`);
    addFavoriteMutation(storeItem.id, {
      onSuccess: (response) => {
        // console.log("✅ Add to wishlist success response:", response);
        dispatch(addWishListStore(storeItem));
        // console.log("📝 Redux state updated with new wishlist store:", storeItem);
        toast.success(response?.message || "Added to wishlist");
      },
      onError: (error) => {
        // console.error("❌ Add to wishlist error:", error);
        toast.error(error?.response?.data?.message || "Failed to add to wishlist");
      },
    });
  };

  // ===================== REMOVE STORE FROM WISHLIST =====================
  const removeStoreFromWishlist = (storeItem, e) => {
    console.log("🔴 Attempting to remove store from wishlist:", storeItem);
    
    e?.stopPropagation?.();
    // console.log("🔹 Event propagation stopped for remove action.");

    deleteFavoriteMutation(storeItem.id, {
      onSuccess: (res) => {
        // console.log("✅ Remove from wishlist success response:", res);
        dispatch(removeWishListStore(storeItem.id));
        // console.log(`📝 Redux state updated, store ${storeItem.id} removed`);
        toast.success(res?.message || "Removed from wishlist");
      },
      onError: (error) => {
        // console.error("❌ Remove from wishlist error:", error);
        toast.error(
          error?.response?.data?.message || "Failed to remove from wishlist"
        );
      },
    });
  };

  // ===================== DEBUGGING HELPER =====================
  const debugWishlistedStores = () => {
    // console.log("💡 Current local wishlistedStores array:", wishlistedStores);
  };

  return {
    isStoreWishlisted,
    addStoreToWishlist,
    removeStoreFromWishlist,
    wishlistedStores, // Expose for debugging in components
    combinedStores, // Expose combined stores if needed
    debugWishlistedStores, // Optional helper for live console checks
  };
};

export default useStoreWishlistHandler;