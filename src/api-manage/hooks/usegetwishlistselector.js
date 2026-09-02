import { useEffect, useMemo } from "react";
import { useWishListGet } from "./react-query/wish-list/useWishListGet";
import { useGetWishList } from "./react-query/rental-wishlist/useGetWishlist";

export const useWishlistSelector = () => {
  const {
    data: normalData,
    isFetching: normalFetching,
    error: normalError,
  } = useWishListGet();

  const {
    data: rentalData,
    isFetching: rentalFetching,
    error: rentalError,
  } = useGetWishList();

  // ✅ 401 ko silently handle karo — ye expected hai guest/expired session ke liye
  useEffect(() => {
    if (normalError && normalError?.response?.status !== 401) {
      // console.error("❌ Normal wishlist query error:", normalError);
    }
    if (rentalError && rentalError?.response?.status !== 401) {
      // console.error("❌ Rental wishlist query error:", rentalError);
    }
  }, [normalError, rentalError]);

  const normalWishlist = useMemo(() => {
    const items = normalData?.item || [];
    const stores = normalData?.store || [];
    return { items, stores };
  }, [normalData]);

  const rentalWishlist = useMemo(() => {
    const vehicles = rentalData?.vehicles || [];
    const providers = rentalData?.providers || [];
    return { vehicles, providers };
  }, [rentalData]);

  const combinedWishlist = useMemo(() => {
    return {
      item: normalWishlist.items,
      store: normalWishlist.stores,
      vehicles: rentalWishlist.vehicles,
      providers: rentalWishlist.providers,
    };
  }, [normalWishlist, rentalWishlist]);

  // ✅ Real loading state, used to drive skeletons instead of a fake timer
  const isFetching = normalFetching || rentalFetching;

  return { normalWishlist, rentalWishlist, combinedWishlist, isFetching };
};
