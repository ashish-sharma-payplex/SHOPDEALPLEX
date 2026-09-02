import MainApi from "../../../MainApi";
import { useQuery } from "react-query";
import { parcel_category_api } from "../../../ApiRoutes";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";

const getParcelCategory = async () => {
  const { data } = await MainApi.get(parcel_category_api, {
    // headers: {
    //   moduleId: 4,
    //   longitude: 73.7178875,
    //   latitude: 18.5958986,
    //   localizationKey: "en",
    //   zoneId: 15,
    // },
  });

  // console.log("parcel categories ", data);
  return data;
};


export default function useGetParcelCategory() {
  return useQuery("parcel-category", getParcelCategory, {
    enabled: false,
    onError: onSingleErrorResponse,
  });
}
