import React, { useEffect, useState, useMemo } from "react";
import useGetCoupons from "../../api-manage/hooks/react-query/useGetCoupons";
import { Box, Stack } from "@mui/system";
import { Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import CustomEmptyResult from "../custom-empty-result";
import nodataimage from "../../../public/static/nodata.png";
import Coupon from "./Coupon";
import CustomShimmerCard from "./Shimmer";
import { t } from "i18next";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { useGetCouponLists } from "api-manage/hooks/react-query/useCouponsLists";
import moment from "moment";
import { Select, MenuItem } from "@mui/material";


const Coupons = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // only mobile
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // sm–md

  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [copy, setCopy] = useState(null);
  const [filterType, setFilterType] = useState("all"); // all | latest | expiring | expired

  const {
    data: rentalCouponData,
    refetch: rentalCouponRefetch,
    isLoading: isRentalCouponLoading,
    isFetching: isRentalCouponFetching,
  } = useGetCouponLists();

  const { data, refetch, isLoading, isFetching } = useGetCoupons();

  const isRentalModule = getCurrentModuleType() === "rental";

  useEffect(() => {
    if (isRentalModule) {
      rentalCouponRefetch();
    } else {
      refetch();
    }
  }, []);

  const couponData = isRentalModule ? rentalCouponData ?? [] : data ?? [];
  const isCouponLoading = isRentalModule ? isRentalCouponLoading : isLoading;
  const isCouponFetching = isRentalModule ? isRentalCouponFetching : isFetching;

  // ✅ Filtered & Sorted Coupons
  const filteredCoupons = useMemo(() => {
    if (!couponData.length) return [];
    const now = moment();
    let list = [...couponData];

    if (filterType === "all") {
      list.sort((a, b) => new Date(a.expire_date) - new Date(b.expire_date));
    }

    if (filterType === "latest") {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (filterType === "expiring") {
      list = list.filter((c) => {
        const daysLeft = moment(c.expire_date).diff(now, "days");
        return daysLeft >= 0 && daysLeft <= 3;
      });
    }

    if (filterType === "expired") {
      list = list.filter((c) => moment(c.expire_date).isBefore(now));
    }

    return list;
  }, [couponData, filterType]);

  // ✅ Filter counts
  const counts = useMemo(() => {
    const now = moment();
    const total = couponData.length;
    const expired = couponData.filter((c) => moment(c.expire_date).isBefore(now)).length;
    const expiringSoon = couponData.filter((c) => {
      const daysLeft = moment(c.expire_date).diff(now, "days");
      return daysLeft >= 0 && daysLeft <= 3;
    }).length;
    const latest = total;
    return { total, expired, expiringSoon, latest };
  }, [couponData]);

  const filterButtons = [
    { key: "all", label: `All (${counts.total})` },
    { key: "latest", label: `Latest (${counts.latest})` },
    { key: "expiring", label: `Expiring Soon (${counts.expiringSoon})` },
    { key: "expired", label: `Expired (${counts.expired})` },
  ];


  useEffect(() => {
  // console.log("All coupons:", couponData);
  // console.log("Filtered coupons:", filteredCoupons);
}, [couponData, filteredCoupons]);

  return (
    <Box
      mt={{ xs: "1rem", md: "2rem" }}
      minHeight="auto"
      paddingLeft={{ xs: "10px", sm: "20px", md: "25px" }}
      paddingRight={{ xs: "10px", sm: "20px", md: "40px" }}
    >
      {/* HEADER + FILTERS */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center" sx={{
          minHeight: "unset",
          height: "auto",
          pb: { xs: 0, md: 2 },
        }}
        spacing={{ xs: 1, md: 2 }}
      >
        <Typography fontWeight="700" fontSize="16px" noWrap>
          {t("Coupons")}
        </Typography>
        {isSmall ? (
          /* 📱 Mobile + Tablet */
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ width: "auto" }}
          >
            <Typography
              fontSize="14px"
              fontWeight={600}
              color="text.secondary"
              noWrap
              sx={{ flexShrink: 0 }}
            >
              Sort:
            </Typography>

            <Select
              size="small"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{
                width: 120,           // ✅ fixed width
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                fontSize: 13,
              }}
            >
              {filterButtons.map((item) => (
                <MenuItem
                  key={item.key}
                  value={item.key}
                  sx={{
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </Stack>


        ) : (
          /* 💻 Desktop */
          <Stack direction="row" spacing={1}>
            {filterButtons.map((item) => (
              <Box
                key={item.key}
                onClick={() => setFilterType(item.key)}
                sx={{
                  px: 2,
                  py: "6px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: filterType === item.key ? "#1A914B" : "#e0e0e0",
                  backgroundColor: filterType === item.key ? "#e9f7ef" : "#fff",
                  color: filterType === item.key ? "#1A914B" : "#555",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Box>
            ))}
          </Stack>
        )}


      </Stack>

      {/* COUPONS GRID */}
      <Grid container spacing={2}>
        {filteredCoupons.map((coupon, index) => {
          const isExpired = moment(coupon.expire_date).isBefore(moment());
          const daysLeft = moment(coupon.expire_date).diff(moment(), "days");

          return (
            <Grid item sm={6} xs={12} md={4} key={coupon.id}>
              <Coupon
                coupon={coupon}
                index={index}
                setCopy={setCopy}
                isExpired={isExpired}
                isExpiringSoon={daysLeft <= 3 && daysLeft >= 0}
              />
            </Grid>
          );
        })}

        {!isCouponFetching && couponData.length === 0 && (
          <CustomEmptyResult label="No Coupon Found" image={nodataimage} />
        )}

        {(isCouponLoading || isCouponFetching) && <CustomShimmerCard />}
      </Grid>
    </Box>
  );
};

export default Coupons;
