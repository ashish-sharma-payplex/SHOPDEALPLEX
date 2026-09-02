/* eslint-disable react-hooks/exhaustive-deps */
import { Skeleton, Box, Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  CustomStackFullWidth,
  CustomBoxFullWidth,
} from "styled-components/CustomStyles.style";
import { HomeComponentsWrapper } from "../HomePageComponents";
import H2 from "components/typographies/H2";
import CustomImageContainer from "components/CustomImageContainer";
import SpecialOfferCardShimmer from "components/Shimmer/SpecialOfferCardSimmer";
import NearbyStoreCard from "components/cards/NearbyStoreCard";
import ClosedNow from "components/closed-now";
import Menus from "../best-reviewed-items/Menus";

import {
  useGetPopularStoreWithoutInfiniteScroll,
} from "api-manage/hooks/react-query/store/useGetPopularStore";
import useGetNewArrivalStores from "api-manage/hooks/react-query/store/useGetNewArrivalStores";

import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { ModuleTypes } from "helper-functions/moduleTypes";
import { setNewArrivalStores } from "redux/slices/storedData";
import { foodNewArrivalsettings, settings } from "./sliderSettings";

const menus = ["Popular", "Top Rated", "New"];

const NewArrivalStores = () => {
  const { t } = useTranslation();
  const sliderRef = useRef(null);
  const dispatch = useDispatch();

  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [storeData, setStoreData] = useState([]);
  const [sliderKey, setSliderKey] = useState(0);

  const { configData } = useSelector((state) => state.configData);
  const moduleId = JSON.parse(window.localStorage.getItem("module"))?.id;
  const { newArrivalStores } = useSelector((state) => state.storedData);

  const {
    data: popularData,
    refetch: refetchPopular,
    isLoading: isLoadingPopular,
  } = useGetPopularStoreWithoutInfiniteScroll({ type: "all", queryKey: "navbar-stores" });

  const {
    data: newArrivalData,
    refetch: refetchNewArrival,
    isLoading: isLoadingNew,
  } = useGetNewArrivalStores({ type: "all" });

  // Fetch popular stores once
  useEffect(() => {
    refetchPopular();
  }, []);

  useEffect(() => {
    if (newArrivalStores.length === 0) {
      refetchNewArrival();
    }
  }, [newArrivalStores]);

  useEffect(() => {
    if (newArrivalData?.stores?.length > 0) {
      dispatch(setNewArrivalStores(newArrivalData.stores));
      setSliderKey((prev) => prev + 1); // Force re-render slider on data update
      setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.slickGoTo(0); // Reset slider to first slide with delay
        }
      }, 100);
    }
  }, [newArrivalData]);

  useEffect(() => {
    if (popularData?.stores?.length > 0) {
      setStoreData(popularData.stores);
    }
  }, [popularData]);

  const handleMenuClick = (index) => {
    setSelectedMenuIndex(index);
    if (index === 0) {
      setStoreData(popularData?.stores);
    } else if (index === 1) {
      const sortedByRating = [...popularData?.stores].sort((a, b) => b.avg_rating - a.avg_rating);
      setStoreData(sortedByRating);
    } else {
      const sortedByDate = [...popularData?.stores].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setStoreData(sortedByDate);
    }
  };

  return (
    <HomeComponentsWrapper sx={{ pt: 2 }}>
      {getCurrentModuleType() === ModuleTypes.FOOD ? (
        <>
          <CustomStackFullWidth
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            px={{ xs: 1, sm: 2 }}
          >
            {isLoadingNew ? (
              <Skeleton variant="text" width="140px" />
            ) : (
              <H2 text={t("New Arrival Restaurants")} color="#d72a00" />
            )}
          </CustomStackFullWidth>

          <CustomBoxFullWidth sx={{ px: 1, py: 2 }}>
          {isLoadingNew ? (
            <Slider {...foodNewArrivalsettings}>
              {[...Array(6)].map((_, i) => (
                <SpecialOfferCardShimmer key={i} width={280} />
              ))}
            </Slider>
          ) : newArrivalStores && newArrivalStores.length > 0 ? (
            newArrivalStores.length > 4 ? (
              <Slider key={sliderKey} {...foodNewArrivalsettings} ref={sliderRef}>
                {newArrivalStores.map((item, idx) => (
                  <Box key={idx} px={2} mx={1} /* added margin for gap */>
                    <Link
                      href={{
                        pathname: "/store/[id]",
                        query: {
                          id: item.id,
                          module_id: moduleId,
                          module_type: getCurrentModuleType(),
                          store_zone_id: item.store_zone_id || item.zone_id,
                        },
                      }}
                    >
                      <Box sx={{ borderRadius: 2, overflow: "hidden", position: "relative" }}>
                        <CustomImageContainer
                          src={item.logo_full_url}
                          alt={item.title}
                          height="180px"
                          width="100%"
                          borderRadius="10px"
                          objectfit="cover"
                        />
                        <ClosedNow active={item.active} open={item.open} />
                      </Box>
                    </Link>
                  </Box>
                ))}
              </Slider>
            ) : (
              <Box sx={{ display: "flex", gap: 2 }}>
                {newArrivalStores.map((item, idx) => (
                  <Box key={idx} flex="1 0 21%">
                    <Link
                      href={{
                        pathname: "/store/[id]",
                        query: {
                          id: item.id,
                          module_id: moduleId,
                          module_type: getCurrentModuleType(),
                          store_zone_id: item.store_zone_id || item.zone_id,
                        },
                      }}
                    >
                      <Box sx={{ borderRadius: 2, overflow: "hidden", position: "relative" }}>
                        <CustomImageContainer
                          src={item.logo_full_url}
                          alt={item.title}
                          height="180px"
                          width="100%"
                          borderRadius="10px"
                          objectfit="cover"
                        />
                        <ClosedNow active={item.active} open={item.open} />
                      </Box>
                    </Link>
                  </Box>
                ))}
              </Box>
            )
          ) : (
            <Box>{t("No stores available")}</Box>
          )}
          </CustomBoxFullWidth>
        </>
      ) : (
        <>
          <CustomStackFullWidth
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            px={5}
          >
            {isLoadingPopular ? (
              <Skeleton variant="text" width="120px" />
            ) : (
              <H2 text={t("Best Store Nearby")} color="#d72a00" />
            )}
            <Menus
              menus={menus}
              selectedMenuIndex={selectedMenuIndex}
              setSelectedMenuIndex={handleMenuClick}
            />
          </CustomStackFullWidth>

          <CustomBoxFullWidth sx={{ px: 2, py: 2 }}>
            {isLoadingPopular ? (
              <Slider {...settings}>
                {[...Array(6)].map((_, i) => (
                  <SpecialOfferCardShimmer key={i} width={280} />
                ))}
              </Slider>
            ) : (
              <Slider {...settings} ref={sliderRef}>
                {storeData?.map((item, idx) => (
                  <NearbyStoreCard
                    key={idx}
                    item={item}
                    configData={configData}
                  />
                ))}
              </Slider>
            )}
          </CustomBoxFullWidth>
        </>
      )}
    </HomeComponentsWrapper>
  );
};

export default NewArrivalStores;
