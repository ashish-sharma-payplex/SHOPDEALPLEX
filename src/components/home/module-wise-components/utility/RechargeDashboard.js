import React, { useState, useEffect, useRef } from "react";
import { Box, Grid, Typography, useMediaQuery, Skeleton } from "@mui/material";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";
import { getToken } from "helper-functions/getToken";
import { toast } from "react-hot-toast";
import useGetBbpsServices from "api-manage/hooks/react-query/utility/usegetbbpsservices";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import UtilityLayout from "./UtilityLayout";
import { useQueryClient } from "react-query";
import MainApi from "api-manage/MainApi";
import { bbps_billers_api } from "api-manage/UtilityApi";
import { getToken as getAuthToken } from "helper-functions/getToken";

const serviceImageMap = {
  "education-fees": "/utility/educationfees.svg",
  electricity: "/utility/Electricbill.svg",
  "loan-repayment": "/utility/loanrepayment.svg",
  gas: "/utility/gas-pipe.svg",
  water: "/utility/water.svg",
  "mobile-postpaid": "/utility/mobilepostpaid.svg",
  "housing-society": "/utility/housing.svg",
  "broadband-postpaid": "/utility/broadband.svg",
  insurance: "/utility/insurance.svg",
  "landline-postpaid": "/utility/device-landline-phone.svg",
  fastag: "/utility/fastag.svg",
  "cable-tv": "/utility/Postpaid.svg",
  "municipal-taxes": "/utility/muncipal.svg",
  "life-insurance": "/utility/lifeinsurance.svg",
  dth: "/utility/DTHrecharge.svg",
  "credit-card": "/utility/cards.svg",
  "hospital-and-pathology": "/utility/pathology.svg",
  "municipal-services": "/utility/muncipal.svg",
  "lpg-gas": "/utility/LPG.svg",
  "clubs-and-associations": "/utility/club&association.svg",
  subscription: "/utility/subcription.svg",
  "health-insurance": "/utility/healthinsurance.svg",
  "mobile-prepaid": "/utility/recharge.svg",
  "recurring-deposit": "/utility/recharge.svg",
  hospital: "/utility/hospital.svg",
  rental: "/utility/rental.svg",
  b2b: "/utility/b2b.svg",
  "metro-recharge": "/utility/train-front.svg",
  "ncmc-recharge": "/utility/recharge.svg",
  donation: "/utility/donation.svg",
  "national-pension-system": "/utility/recharge.svg",
  "prepaid-meter": "/utility/prepaid.svg",
  "agent-collection": "/utility/agentcollection.svg",
  echallan: "/utility/eChallan.svg",
  "ev-recharge": "/utility/EVrecharge.svg",
};

const MAIN_COUNT = 17;
const LIMIT = 10;
const noShadowToast = { style: { boxShadow: "none" } };

// ✅ Actual fetcher function — hook nahi, plain async function
const fetchBillers = async ({ pageParam = 0, queryKey }) => {
  const [, slug] = queryKey;
  const token = getAuthToken();
  const response = await MainApi.get(bbps_billers_api, {
    params: { catval: slug, offset: pageParam, limit: LIMIT },
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });
  return {
    records: response?.data?.data?.records || [],
    nextOffset: response?.data?.data?.pagination?.next_offset ?? null,
    isLastPage: response?.data?.data?.pagination?.is_last_page ?? true,
  };
};

// ─── Skeleton Grid ────────────────────────────────────────────────────────────
const SkeletonGrid = () => (
  <>
    {Array.from({ length: MAIN_COUNT }).map((_, i) => (
      <Grid
        key={i}
        item
        xs={4}
        sm={4}
        md={2}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 120,
            height: 110,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.3,
          }}
        >
          <Skeleton variant="circular" width={40} height={40} animation="wave" />
          <Skeleton variant="rounded" width={60} height={12} animation="wave" />
          <Skeleton variant="rounded" width={48} height={12} animation="wave" />
        </Box>
      </Grid>
    ))}
  </>
);


// Custom order — API slug ke hisaab se
const CUSTOM_ORDER = [
  "mobile-prepaid",
  "fastag",
  "cable-tv",
  "dth",
  "metro-recharge",
  "ncmc-recharge",
  "electricity",
  "credit-card",
  "lpg-gas",
  "mobile-postpaid",
  "ev-recharge",
  "broadband-postpaid",
  "loan-repayment",
  "gas",
  "landline-postpaid",
  "water",
  "education-fees",
  "prepaid-meter",
  "municipal-taxes",
  "housing-society",
  "clubs-and-associations",
  "rental",
  "insurance",
  "life-insurance",
  "health-insurance",
  "hospital",
  "hospital-and-pathology",
  "donation",
  "subscription",
  "echallan",
  "b2b",
  "agent-collection",
  "municipal-services",
  "recurring-deposit",
  "national-pension-system",
];


// ─── Inner Content ────────────────────────────────────────────────────────────
export const RechargeDashboardContent = ({ onNavigate }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isMounted, setIsMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(false);

  const noTokenTimerFired = useRef(false);
  const pollRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;
    const checkToken = () => {
      const token = getToken();
      if (token) {
        clearInterval(pollRef.current);
        setHasToken(true);
        return;
      }
      if (!noTokenTimerFired.current) {
        noTokenTimerFired.current = true;
        setTimeout(() => {
          if (!getToken()) {
            toast.error("Please login to continue", noShadowToast);
            dispatch(setModalFor("sign-in"));
            dispatch(setSignInModalOpen(true));
          }
        }, 3000);
      }
    };
    checkToken();
    pollRef.current = setInterval(checkToken, 500);
    return () => clearInterval(pollRef.current);
  }, [isMounted]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setMobileDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: servicesData, isLoading } = useGetBbpsServices(hasToken);

 const activeServices = (servicesData || [])
  .filter((s) => s.status === "ACTIVE")
  .map((s) => ({
    name: s.name,
    slug: s.slug,
    img: serviceImageMap[s.slug] || "/utility/recharge.svg",
  }))
  .sort((a, b) => {
    const ai = CUSTOM_ORDER.indexOf(a.slug);
    const bi = CUSTOM_ORDER.indexOf(b.slug);
    const aIndex = ai === -1 ? 999 : ai;
    const bIndex = bi === -1 ? 999 : bi;
    return aIndex - bIndex;
  });

  const mainServices = activeServices.slice(0, MAIN_COUNT);
  const extraServices = activeServices.slice(MAIN_COUNT);
  const showSkeleton = !isMounted || !hasToken || isLoading || activeServices.length === 0;

  // ✅ Prefetch helper — fetchBillers direct use karo, hook nahi
 const prefetchBillers = (slug) => {
  queryClient.prefetchInfiniteQuery(
    ["bbps-billers", slug],
    fetchBillers,
    { staleTime: 0 }  // ✅
  );
};

  const handleServiceClick = (slug) => {
    prefetchBillers(slug); // navigate se pehle prefetch
    router.push(`/utility/${slug}`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const mobileSidebarItems = [
    { name: "Help & Support", icon: "/utility/helpsupport.svg", key: "help" },
    { name: "My Transactions", icon: "/utility/mytransactions.svg", key: "transactions" },
  ];

  const renderItem = (item, index) => (
    <Grid
      item
      xs={4}
      sm={4}
      md={2}
      key={index}
      sx={{ display: "flex", justifyContent: "center" }}
    >
      <Box
        onClick={() => handleServiceClick(item.slug)}
        onMouseEnter={() => prefetchBillers(item.slug)} // ✅ hover pe prefetch
        sx={{
          width: "100%",
          maxWidth: 120,
          height: 110,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          cursor: "pointer",
          borderRadius: "8px",
          transition: "background 0.15s",
          "&:hover": { background: "#f3f4f6" },
        }}
      >
        <Box
          component="img"
          src={item.img}
          alt={item.name}
          sx={{ height: 55, mb: 1.3, objectFit: "contain" }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: isMobile ? "12px" : "14px",
            lineHeight: 1.2,
          }}
        >
          {(() => {
            const words = item.name.split(" ");
            if (words.length === 1) return words[0];
            if (words.length === 2)
              return (
                <>
                  <span style={{ display: "block" }}>{words[0]}</span>
                  <span style={{ display: "block" }}>{words[1]}</span>
                </>
              );
            return (
              <>
                <span style={{ display: "block" }}>{words[0]}</span>
                <span style={{ display: "block" }}>{words.slice(1).join(" ")}</span>
              </>
            );
          })()}
        </Typography>
      </Box>
    </Grid>
  );

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        border: "1px solid #E3E8EE",
        borderRadius: "8px",
        p: { xs: 1.5, sm: 3 },
      }}
    >
      {/* ── Mobile dropdown ── */}
      {isMobile && (
        <Box
          ref={dropdownRef}
          sx={{ display: "flex", justifyContent: "flex-end", mb: 2, position: "relative" }}
        >
          <Box
            onClick={() => setMobileDropdown((prev) => !prev)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              background: "#fff",
              border: "1px solid #E3E8EE",
              borderRadius: "8px",
              px: 1.4,
              py: 0.8,
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <Box component="img" src="/utility/home.svg" alt="Home" sx={{ width: 18, height: 18, objectFit: "contain" }} />
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#292D32" }}>Home</Typography>
            {mobileDropdown
              ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: "#292D32" }} />
              : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "#292D32" }} />
            }
          </Box>

          {mobileDropdown && (
            <Box
              sx={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "#fff",
                border: "1px solid #E3E8EE",
                borderRadius: "10px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                overflow: "hidden",
                minWidth: 175,
                zIndex: 10,
              }}
            >
              {mobileSidebarItems.map((item, i) => (
                <Box
                  key={i}
                  onClick={() => { setMobileDropdown(false); onNavigate(item.key); }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    px: 1.5,
                    py: 1.2,
                    cursor: "pointer",
                    borderBottom: i === 0 ? "1px solid #f3f4f6" : "none",
                    "&:hover": { background: "#f9fafb" },
                    transition: "0.15s",
                  }}
                >
                  <Box component="img" src={item.icon} alt={item.name} sx={{ width: 18, height: 18, objectFit: "contain" }} />
                  <Typography sx={{ fontSize: 13, color: "#292D32" }}>{item.name}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography fontWeight={600}>Recharges & Bill Payments</Typography>
        <img src="/BharatConnect.png" style={{ height: 36 }} />
      </Box>

      <Grid container spacing={3}>
        {showSkeleton ? (
          <SkeletonGrid />
        ) : (
          <>
            {mainServices.map(renderItem)}
            {!showMore
              ? extraServices.length > 0 && (
                <Grid item xs={4} sm={4} md={2}>
                  <Box onClick={() => setShowMore(true)} sx={{ textAlign: "center", cursor: "pointer", mt: 3 }}>
                    <Box component="img" src="/utility/viewmore.svg" sx={{ height: 40 }} />
                    <Typography>View More</Typography>
                  </Box>
                </Grid>
              )
              : extraServices.map(renderItem)}
          </>
        )}
      </Grid>
    </Box>
  );
};

const RechargeDashboard = ({ activeKey, onNavigate }) => (
  <UtilityLayout activeKey={activeKey || "home"} onNavigate={onNavigate || (() => {})}>
    <RechargeDashboardContent onNavigate={onNavigate || (() => {})} />
  </UtilityLayout>
);

export default RechargeDashboard;