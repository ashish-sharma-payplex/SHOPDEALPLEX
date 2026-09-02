import MainApi from "../../../MainApi";
import { data_limit, my_orders_api, popular_items } from "../../../ApiRoutes";
import { useQuery } from "react-query";
import {
	onErrorResponse,
	
	onSingleErrorResponse,
} from "../../../api-error-response/ErrorResponses";

const getData = async (pageParams) => {
	const { orderType, offset, limit = data_limit, searchTerm } = pageParams;
	const actualLimit = searchTerm ? 10000 : limit;
	const actualOffset = searchTerm ? 1 : offset;
	// console.log("===================");
	// console.log(orderType);
	// console.log("===================");
	
	const { data } = await MainApi.get(
		`${my_orders_api}/${orderType}?limit=${actualLimit}&offset=${actualOffset}${searchTerm ? `&search=${searchTerm}` : ''}`
	);
	return data;
};

export default function useGetMyOrdersList(pageParams) {
	return useQuery(
		["my-orders-list", pageParams?.orderType, pageParams?.limit, pageParams?.searchTerm],
		() => getData(pageParams),
		{
			staleTime: 60000,
			cacheTime: 50000,
			enabled: true,
			onError: onSingleErrorResponse,
		}
	);
}
