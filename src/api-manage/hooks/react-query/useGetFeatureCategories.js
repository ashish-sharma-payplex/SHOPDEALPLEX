import MainApi from "../../MainApi";
import { categories_details_api } from "../../ApiRoutes";
import { useQuery } from "react-query";
import { onSingleErrorResponse } from "../../api-error-response/ErrorResponses";

const getData = async (pageParams) => {
  const { categoryId, page_limit, offset, type } = pageParams;
  let url = "";
  if (categoryId === null || categoryId === undefined) {
    // Fetch all featured items without categoryId in URL
    url = `${categories_details_api}?limit=${page_limit}&offset=${offset}&type=${type}`;
  } else {
    url = `${categories_details_api}/${categoryId}?limit=${page_limit}&offset=${offset}&type=${type}`;
  }
  const { data } = await MainApi.get(url);
  return data;
};

export default function useGetFeatureCategoriesProducts(pageParams) {
  return useQuery(["categories-details", pageParams], () => getData(pageParams), {
    enabled: false,
    onError: onSingleErrorResponse,
  });
}
