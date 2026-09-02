import { useMutation, useQueryClient } from "react-query";
  import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import MainApi from "api-manage/MainApi";
import { toggle_review_status_api } from "api-manage/ApiRoutes";

const toggleReviewStatus = async (data) => {
  const { orderId, isReviewed } = data;
  const formData = new FormData();
  formData.append("order_id", orderId);
  formData.append("is_reviewed", isReviewed ? 1 : 0);

  const response = await MainApi.post(toggle_review_status_api, formData);
  return response.data;
};

export const useToggleReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation("toggle-review-status", toggleReviewStatus, {
    onSuccess: (data, variables) => {
      // Invalidate and refetch the orders list
      queryClient.invalidateQueries("my-orders-list");
      // console.log(`Order ${variables.orderId} review status updated to ${variables.isReviewed}`);
    },
    onError: onErrorResponse,
  });
};
