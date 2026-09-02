/* =====================================================
   GET CART LIST MODULE WISE
===================================================== */

export const getCartListModuleWise = (cartList) => {
  // Safety check
  if (!Array.isArray(cartList) || cartList.length === 0) {
    return [];
  }

  /* ============================================
     READ CURRENT MODULE FROM LOCALSTORAGE
  ============================================ */
  let currentModuleType = null;

  try {
    const moduleData = JSON.parse(localStorage.getItem("module"));
    currentModuleType = moduleData?.module_type;
  } catch (error) {
    // console.error("❌ Failed to parse module from localStorage", error);
  }

  /* ============================================
     FALLBACK: RETURN ALL ITEMS IF MODULE NOT FOUND
  ============================================ */
  if (!currentModuleType) {
    // console.warn("⚠️ No active module found, returning full cart list");
    return cartList;
  }

  /* ============================================
     FILTER CART ITEMS BY MODULE TYPE
  ============================================ */
  const filteredCart = cartList.filter((item) => {
    const isMatch =
      String(item?.module_type) === String(currentModuleType);

    if (!isMatch) {
      // console.debug(
      //   item?.module_type,
      //   currentModuleType
      // );
    }

    return isMatch;
  });

  /* ============================================
     DEBUG LOG
  ============================================ */


  return filteredCart;
};
