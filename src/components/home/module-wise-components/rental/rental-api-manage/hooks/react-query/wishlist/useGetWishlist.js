import { useQuery } from "react-query";
import MainApi from "api-manage/MainApi";
import { wishlist_api } from "api-manage/ApiRoutes";

export const WishList = async () => {
  const zone = JSON.parse(localStorage.getItem("zoneid"));
  const token = localStorage.getItem("token");

  const finalZoneId = zone ?? ["0"];

  try {
    const response = await fetch("https://dealplex.in/api/v1/rental/user/wish-list", {
      headers: {
        "Content-Type": "application/json",
        moduleId: "9",
        zoneId: JSON.stringify(finalZoneId),
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    // console.error("Failed to fetch wishlist:", error);
    return null;
  }
};

export const useGetWishList = (onSuccessHandler) => {
  
  // ✅ YEH LINE ADD KARO - token define karo
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery(
    "get-rental-wishlist",
    async () => {
      const data = await WishList();
      return data;
    },
    {
      enabled: !!token,  // ab token defined hai, error nahi aayega
      retry: false,
      onSuccess: (data) => {
        if (onSuccessHandler) {
          onSuccessHandler(data);
        }
      },
    }
  );
};