import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { Grid, Skeleton, Button } from "@mui/material";

import useGetPopularItemsNearby from "../../../api-manage/hooks/react-query/useGetPopularItemsNearby";
import { setPopularItemsNearby } from "redux/slices/storedData";

import ProductCard from "../../cards/ProductCard";
import ProductCardSimmer from "../../Shimmer/ProductCardSimmer";
import H2 from "../../typographies/H2";
import Subtitle1 from "../../typographies/Subtitle1";

import { CustomBoxFullWidth, CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { HomeComponentsWrapper } from "../HomePageComponents";

const PopularItemsNearby = ({ title, subTitle }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { popularItemsNearby } = useSelector((state) => state.storedData);
  const [showAll, setShowAll] = useState(false);

  const limit = 2;
  const offset = 1;

  const { data, refetch, isLoading, isFetching } = useGetPopularItemsNearby({ offset, type: "all" });

  useEffect(() => {
    if ((popularItemsNearby.products?.length ?? 0) === 0) refetch();
  }, []);

  useEffect(() => {
    if (data && data.products) dispatch(setPopularItemsNearby(data));
  }, [data]);

  const displayedProducts = showAll ? popularItemsNearby?.products : popularItemsNearby?.products?.slice(0, 10);

  return (
    <HomeComponentsWrapper>
      {popularItemsNearby?.products?.length > 0 && (
        <CustomStackFullWidth alignItems="center" spacing={1} mt={{ xs: "10px", md: "16px" }} padding="10px">
          {isFetching ? <Skeleton width="110px" /> : <H2 text={title} component="h2" color="#d72a00" textTransform="uppercase" letterSpacing="1px" />}
          {isFetching ? <Skeleton width="310px" /> : <Subtitle1 text={t(subTitle)} component="p" color="black" textTransform="uppercase" letterSpacing="1px" />}

          <CustomBoxFullWidth>
            <Grid container spacing={2}>
              {isFetching
                ? [...Array(15)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={2.4} key={index}>
                      <ProductCardSimmer />
                    </Grid>
                  ))
                : displayedProducts?.map((item) => (
                    <Grid item xs={12} sm={6} md={2.4} key={item.id}>
                      <ProductCard
                        item={item}
                        cardheight="340px"
                        cardFor="vertical"
                        cardType="vertical-type"
                        sx={{
                          "&:hover": {
                            backgroundColor: "#008000",
                          },
                        }}
                      />
                    </Grid>
                  ))}
            </Grid>
            {popularItemsNearby?.products?.length > 10 && (
              <Button onClick={() => setShowAll(!showAll)} variant="outlined" sx={{ mt: 2, backgroundColor:"#368633ff", color:"white", float:"right" }}>
                {showAll ? 'Show Less' : 'See All'}
              </Button>
            )}
          </CustomBoxFullWidth>
        </CustomStackFullWidth>
      )}
    </HomeComponentsWrapper>
  );
};

export default PopularItemsNearby;
