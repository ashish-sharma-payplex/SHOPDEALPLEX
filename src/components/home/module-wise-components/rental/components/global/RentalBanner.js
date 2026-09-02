import { Skeleton } from "@mui/material";
import Slider from "react-slick";
import { getLanguage } from "helper-functions/getLanguage";
import {
  CustomBoxFullWidth,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import { RTL } from "components/rtl";
import { HomeComponentsWrapper } from "../../../../HomePageComponents";
import { Box } from "@mui/system";
import { useGetVehicleBannerList } from "../../rental-api-manage/hooks/react-query/banner/useGetVehicleBannerList";
import Link from "next/link";
import CustomImageContainer from "components/CustomImageContainer";

const RentalBanner = () => {
  const lanDirection = getLanguage() ? getLanguage() : "ltr";
  const {
    data: bannerLists,
    isFetching,
    isLoading,
  } = useGetVehicleBannerList();

  const settings = {
    dots: true,
    infinite: bannerLists?.banners.length > 3,
    slidesToShow: 3,
    cssEase: "ease-in-out",
    autoplay: true,
    speed: 800,
    autoplaySpeed: 4000,
    variableHeight: true,
    initialSlide: 0,
    centerMode: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          infinite: bannerLists?.banners.length > 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          infinite: bannerLists?.banners.length > 1,
        },
      },
    ],
  };

  return (
    <HomeComponentsWrapper
      sx={{
        mt: { xs: "50px", md: "80px" },
        mb: "35px",
        ".slick-slide": {
          padding: "0 10px",
        },
      }}
    >
      <CustomStackFullWidth
        alignItems="center"
        justifyContent="center"
        mb={3}
        spacing={1}
      >
        <CustomBoxFullWidth
          sx={{
            ".slick-dots": {
              mt: 0,
            },
            ".slick-track ": {
              marginLeft: "0px",
              marginRight: "0px",
            },
          }}
        >
          {isLoading ? (
            <Slider {...settings}>
              {[...Array(4)].map((item, index) => {
                return (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    height={133}
                    width={400}
                  />
                );
              })}
            </Slider>
          ) : (
            <Slider {...settings}>
              {bannerLists?.banners?.map((item, index) => {
                const commonStyles = {
                  img: {
                    borderRadius: "20px",
                    objectFit: "cover",
                  },
                };

                const imageElement = (
                  <CustomImageContainer
                    src={item?.image_full_url || ""}
                    sx={commonStyles}
                    width={400}
                    maxWidth="100%"
                    height={133}
                  />
                );

                return item?.type === "store_wise" ? (
                  <Link key={index} href={`/rental/provider-details/${item?.provider_id}`}>
                    <Box sx={commonStyles}>{imageElement}</Box>
                  </Link>
                ) : item?.link ? (
                  <Link key={index} href={item?.link || ""}>
                    <Box sx={commonStyles}>{imageElement}</Box>
                  </Link>
                ) : (
                  <Box key={index} sx={commonStyles}>
                    {imageElement}
                  </Box>
                );
              })}
            </Slider>
          )}
        </CustomBoxFullWidth>
      </CustomStackFullWidth>
    </HomeComponentsWrapper>
  );
};

export default RentalBanner;
