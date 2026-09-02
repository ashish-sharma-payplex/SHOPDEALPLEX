import { useState, useRef } from "react";
import { Button, Skeleton } from "@mui/material";
import Slider from "react-slick";
import { getLanguage } from "helper-functions/getLanguage";
import {
  CustomBoxFullWidth,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import { HomeComponentsWrapper } from "../../../../HomePageComponents";
import { Box } from "@mui/system";
import H2 from "components/typographies/H2";
import { useTranslation } from "react-i18next";
import {
  NextFood,
  PrevFood,
} from "components/home/best-reviewed-items/SliderSettings";
import RentalCategory from "components/home/module-wise-components/rental/components/global/RentalCategory";
import { useGetCategoryVehicleLists } from "../../rental-api-manage/hooks/react-query/category/useGetCategoryLists";
import { useRouter } from "next/router";


const VehicleCategories = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isHover, setIsHover] = useState(false);
  const sliderRef = useRef(null); // Ref for the slider
  const { data: categories, isFetching ,isLoading} = useGetCategoryVehicleLists();

  const handleSeeAllClick = () => {
    router.push({
      pathname: "/rental/vehicle-search/index.js",
      query: { all_category: 1 },
    });
  };

  const settings = {
    dots: false,
    infinite: false,
    slidesToShow: 4.5,
    cssEase: "ease-in-out",
    autoplay: false,
    speed: 800,
    autoplaySpeed: 4000,
    variableHeight: true,
    swipeToSlide: true,
    prevArrow: <PrevFood />,
    nextArrow: <NextFood />,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          swipeToSlide: true,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          swipeToSlide: true,
        },
      },
    ],
  };

  return (
    <>
      {isLoading ? (
        <HomeComponentsWrapper
          sx={{
            mb: "63px",
            cursor: "pointer",
            ".slick-slide": {
              padding: "10px",
              ".MuiBox-root": {
                overflow: "visible",
              },
            },
          }}
        >
          <CustomStackFullWidth
            alignItems="center"
            justyfyContent="center"
            mb={3}
            spacing={1}
          >
            <CustomStackFullWidth
              alignItems="center"
              justifyContent="space-between"
              direction="row"
            >
              <Skeleton variant="text" width="110px" />
              <Skeleton width="100px" variant="80px" />
            </CustomStackFullWidth>

            <CustomBoxFullWidth>
              <Slider {...settings}>
                {[...Array(4)].map((item, index) => {
                  return (
                    <Box key={index}>
                      <RentalCategory onlyshimmer={true} />
                    </Box>
                  );
                })}
              </Slider>
            </CustomBoxFullWidth>
          </CustomStackFullWidth>
        </HomeComponentsWrapper>
      ) : categories?.vehicles?.length > 0 ? (
        <HomeComponentsWrapper
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          sx={{
            mb: "63px",
            cursor: "pointer",
            ".slick-slide": {
              padding: "10px",
              ".MuiBox-root": {
                overflow: "visible",
              },
            },
          }}
        >
          <CustomStackFullWidth
            alignItems="center"
            justyfyContent="center"
            mb={3}
            spacing={1}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            <CustomStackFullWidth
              alignItems="center"
              justifyContent="space-between"
              direction="row"
              marginTop="-50px"
            >
              <H2 text={t("Vehicle Categories")} component="h2" color= "#d72a00"
          textTransform="uppercase"
          letterSpacing= "1px" marginLeft="20px" marginTop="80px"/>
              <Button
                variant="text"
                onClick={handleSeeAllClick}
                sx={{
                  transition: "all ease 0.5s",
                  textTransform: "capitalize",
                  "&:hover": {
                    letterSpacing: "0.3em",
                  },
                }}
              >
                {t("See all")}
              </Button>
            </CustomStackFullWidth>

            <CustomBoxFullWidth
              sx={{
                ".slick-track ": {
                  marginLeft: "0px",
                  marginRight: "0px",
                },
              }}
            >
              <Slider ref={sliderRef} {...settings}>
                {categories?.vehicles?.map((item, index) => (
                  <Box key={index}>
                    <RentalCategory data={item} onlyshimmer={false} />
                  </Box>
                ))}
              </Slider>
            </CustomBoxFullWidth>
          </CustomStackFullWidth>
        </HomeComponentsWrapper>
      ) : null}
    </>
  );
};

export default VehicleCategories;
