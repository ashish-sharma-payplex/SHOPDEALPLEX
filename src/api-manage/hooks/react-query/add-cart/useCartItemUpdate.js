import { useMutation } from "react-query";
import { getToken, getGuestId } from "helper-functions/getToken";

const BASE_URL = "https://dealplex.in";

// 🔥 We define getApiContext right here
const getApiContext = () => {
  try {
    const rawModule = localStorage.getItem("module");
    const rawZone = localStorage.getItem("zoneid");

    const moduleObj = rawModule ? JSON.parse(rawModule) : null;
    const zoneObj = rawZone ? JSON.parse(rawZone) : null;

    return {
      token: getToken(),
      guest_id: getGuestId(),
      moduleId: moduleObj?.id,
      zoneId: zoneObj?.[0],
    };
  } catch (err) {
    // console.warn("⚠ getApiContext error:", err);

    return {
      token: getToken(),
      guest_id: getGuestId(),
      moduleId: undefined,
      zoneId: undefined,
    };
  }
};

const useCartItemUpdate = () => {
  return useMutation(async ({ cartItem, price, quantity }) => {
    const ctx = getApiContext(); // ✅ Same behavior as Redux

    // Required headers for backend routing
    const headers = {
      moduleId: String(ctx.moduleId),
      zoneId: JSON.stringify([ctx.zoneId]),
    };

    if (ctx.token) headers.Authorization = `Bearer ${ctx.token}`;

    // Create variation signature (same as add-to-cart)
    const variant = JSON.stringify(
      cartItem?.selectedOption ||
      cartItem?.variation ||
      []
    );

    // Build form data (Laravel-compatible)
    const fd = new FormData();
    fd.append("cart_id", cartItem.cartItemId);
    fd.append("price", Number(price));
    fd.append("quantity", Number(quantity));
    fd.append("variant", variant);

    if (!ctx.token && ctx.guest_id) {
      fd.append("guest_id", String(ctx.guest_id));
    }

    // console.log("📤 UPDATE PAYLOAD:", Object.fromEntries(fd.entries()));
    // console.log("📤 HEADERS:", headers);

    const res = await fetch(`${BASE_URL}/api/v1/customer/cart/update`, {
      method: "POST",
      headers,
      body: fd,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      // console.error("❌ Update API Error:", data);
      throw new Error(data?.message || "Cart item not found or already removed.");
    }

    // console.log("📥 Update Success:", data);
    return data;
  });
};

export default useCartItemUpdate;
