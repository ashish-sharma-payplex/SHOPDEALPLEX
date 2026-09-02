// ORIGINAL FILE PATH: src/components/wishlist/WishLists.js
// Replace the file at this path in your project with the content below

import React, { useState, useEffect, useRef } from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import Banner from "./wishlistcomponent/banner";
import Navbar from "./wishlistcomponent/subnavbar";
import CardLoader from "./wishlistcomponent/cardloader";
import { useWishlistSelector } from "api-manage/hooks/usegetwishlistselector";
import { useDispatch, useSelector } from "react-redux";
import {
  setWishListProviders,
  setWishListVehicles,
} from "redux/slices/wishList";

const WishLists = () => {
  const { combinedWishlist, isFetching } = useWishlistSelector();
  const dispatch = useDispatch();

  const [activeCategory, setActiveCategory] = useState("Grocery");
  const [selectedTab, setSelectedTab] = useState("items");

  // ✅ FIX (hydration-safe loading state):
  // The previous version used `isFetching` directly, but that query's
  // `enabled` flag depends on `localStorage.getItem("token")`, which is
  // always unavailable on the server (SSR) but available on the client's
  // very first render. That made the server-rendered HTML (real cards)
  // and the client's first paint (skeleton) disagree — causing a React
  // hydration mismatch error.
  //
  // Fix: only trust the live `isFetching` value *after* the component has
  // mounted on the client. Before that, we always render the skeleton,
  // which matches what the server rendered on the very first paint too
  // (Next.js SSR output for this page always shows the skeleton state).
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const showSkeleton = !hasMounted || isFetching;

  // ✅ Redux wishList state — yahan se instant remove reflect hoga
  const { wishLists } = useSelector((state) => state.wishList);

  useEffect(() => {
    if (combinedWishlist?.vehicles) {
      dispatch(setWishListVehicles(combinedWishlist.vehicles));
    }
    if (combinedWishlist?.providers) {
      dispatch(setWishListProviders(combinedWishlist.providers));
    }
  }, [combinedWishlist, dispatch]);

  // ✅ Redux is now the single source of truth for ALL categories — same
  // pattern as Rental vehicles/providers, which already updated instantly.
  // Previously Grocery/Pharmacy/Food items read from combinedWishlist.item
  // (the raw React Query fetch result), so the UI sat empty until that
  // network request resolved. Redux is updated synchronously on every
  // add/remove (see wishlisthandler.js / storewishlisthandler.js) and is
  // populated globally on app load (see pages/_app.js), so reading from it
  // directly makes items/stores appear exactly as fast as vehicles do.
  const getFinalData = () => {
    if (!activeCategory) return [];

    // Rental — Redux vehicles/providers se
    if (activeCategory === "Rental") {
      if (selectedTab === "vehicles") return wishLists?.vehicles || [];
      if (selectedTab === "providers") return wishLists?.providers || [];
      return [];
    }

    // Food > Restaurants tab — Redux store list, filtered to food module only
    if (activeCategory === "Food" && selectedTab === "restaurants") {
      return (wishLists?.store || []).filter(
        (store) =>
          (
            store?.module?.module_type ||
            store?.module_type ||
            ""
          ).toLowerCase() === "food",
      );
    }

    // Grocery / Pharmacy / Food > Items — Redux item list, filtered by module
    return (wishLists?.item || []).filter((item) => {
      if (activeCategory === "Food")
        return item.module_type?.toLowerCase() === "food";
      return item.module_type?.toLowerCase() === activeCategory.toLowerCase();
    });
  };

  const finalData = getFinalData();

  return (
    <CustomStackFullWidth
      alignItems="flex-start"
      justifyContent="space-between"
      height="auto"
      sx={{
        padding: "1.25rem",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      <Banner />

      <Navbar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      <CardLoader
        activeCategory={activeCategory}
        selectedSubCategory={selectedTab}
        wishLists={finalData}
        isLoading={showSkeleton}
      />
    </CustomStackFullWidth>
  );
};

export default WishLists;
