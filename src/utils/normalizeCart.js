export const normalizeCartList = (cartList = []) => {
  return cartList.map((item) => {
    // ✅ Already nested structure hai (cart API ka format)
    if (item?.product?.id) {
      return {
        ...item,
        quantity: Number(item?.quantity || 1),
        price: Number(item?.price || 0),
        food_variations: Array.isArray(item?.food_variations)
          ? item.food_variations.map((v) => ({
              ...v,
              values_to_show:
                v.values_to_show?.map((val) => ({
                  ...val,
                  isSelected: Boolean(val.isSelected),
                  optionPrice: Number(val.optionPrice || 0),
                })) || [],
            }))
          : [],
        product: {
          ...item?.product,
          addons:
            item?.product?.addons?.map((a) => ({
              ...a,
              isChecked: Boolean(a.isChecked),
              quantity: Number(a.quantity || 0),
              price: Number(a.price || 0),
            })) || [],
        },
      };
    }

    // ✅ Flat structure hai (buyNowItemList ka format) — product object banao
    return {
      ...item,
      quantity: Number(item?.quantity || 1),
      price: Number(
        item?.variation?.[0]?.price ??
          item?.selectedOption?.[0]?.price ??
          item?.price ??
          0,
      ),
      food_variations: Array.isArray(item?.food_variations)
        ? item.food_variations.map((v) => ({
            ...v,
            values_to_show:
              v.values_to_show?.map((val) => ({
                ...val,
                isSelected: Boolean(val.isSelected),
                optionPrice: Number(val.optionPrice || 0),
              })) || [],
          }))
        : [],
      product: {
        id: item?.id,
        name: item?.name,
        image_full_url: item?.image_full_url,
        price: Number(
          item?.variation?.[0]?.price ??
            item?.selectedOption?.[0]?.price ??
            item?.price ??
            0,
        ),
        discount: item?.discount ?? 0,
        discount_type: item?.discount_type ?? "percent",
        tax: item?.tax ?? 0,
        unit_type: item?.unit_type ?? "",
        store_id: item?.store_id,
        addons: [],
        // existing product fields bhi preserve karo agar hain
        ...(item?.product || {}),
      },
    };
  });
};
