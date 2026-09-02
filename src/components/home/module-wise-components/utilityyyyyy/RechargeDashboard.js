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

const serviceImageMap = {
  "education-fees": "/utility/educationfees.svg",
  electricity: "/utility/ElectricBill.svg",
  "loan-repayment": "/utility/loanrepayment.svg",
  gas: "/utility/gas-pipe.svg",
  water: "/utility/water.svg",
  "mobile-postpaid": "/utility/postpaid.svg",
  "housing-society": "/utility/housing.svg",
  "broadband-postpaid": "/utility/broadband.svg",
  insurance: "/utility/insurance.svg",
  "landline-postpaid": "/utility/device-landline-phone.svg",
  fastag: "/utility/fastag.svg",
  "cable-tv": "/utility/postpaid.svg",
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
const noShadowToast = { style: { boxShadow: "none" } };

// ─── Skeleton Grid ────────────────────────────────────────────────────────────
const SkeletonGrid = () => (
  <>
    {Array.from({ length: MAIN_COUNT }).map((_, i) => (
      <Grid
        key={i}
        item
        xs={6}
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
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            animation="wave"
          />
          <Skeleton variant="rounded" width={60} height={12} animation="wave" />
          <Skeleton variant="rounded" width={48} height={12} animation="wave" />
        </Box>
      </Grid>
    ))}
  </>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RechargeDashboard = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const dispatch = useDispatch();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(false);

  const noTokenTimerFired = useRef(false);
  const pollRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Close mobile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMobileDropdown(false);
      }
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
    }));

  const mainServices = activeServices.slice(0, MAIN_COUNT);
  const extraServices = activeServices.slice(MAIN_COUNT);

  const showSkeleton =
    !isMounted || !hasToken || isLoading || activeServices.length === 0;

  const handleServiceClick = (slug) => {
    router.push(`/utility/${slug}`);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const sidebarItems = [
    { name: "Home", icon: "/utility/home.svg" },
    { name: "Help & Support", icon: "/utility/helpsupport.svg" },
    { name: "My Transactions", icon: "/utility/mytransactions.svg" },
  ];

  const renderItem = (item, index) => (
    <Grid
      item
      xs={6}
      sm={4}
      md={2}
      key={index}
      sx={{ display: "flex", justifyContent: "center" }}
    >
      <Box
        onClick={() => handleServiceClick(item.slug)}
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
          sx={{ height: 50, mb: 1.3, objectFit: "contain" }}
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
            if (words.length === 2) {
              return (
                <>
                  <span style={{ display: "block" }}>{words[0]}</span>
                  <span style={{ display: "block" }}>{words[1]}</span>
                </>
              );
            }
            return (
              <>
                <span style={{ display: "block" }}>{words[0]}</span>
                <span style={{ display: "block" }}>
                  {words.slice(1).join(" ")}
                </span>
              </>
            );
          })()}
        </Typography>
      </Box>
    </Grid>
  );

  return (
    /*
     * IMPORTANT: For `position: sticky` to work on the sidebar,
     * this parent Box must NOT have overflow: hidden or overflow: auto.
     * Keep it as default (overflow: visible).
     */
    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2, gap: 2 }}>
      {/* ── LEFT SIDEBAR — Desktop/Tablet ──
                sticky + top: 0  →  sidebar sticks to top of viewport as user scrolls.
                alignSelf: flex-start  →  required so sticky works inside a flex container.
            */}
      {!isMobile && (
        <Box
          sx={{
            width: 240,
            flexShrink: 0,
            alignSelf: "flex-start",
            position: "sticky",
            top: 0,
            p: 2,
            border: "1px solid #E3E8EE",
            borderRadius: "8px",
          }}
        >
          <Box sx={{ background: "#fff", borderRadius: "12px", p: 1 }}>
            {sidebarItems.map((item, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.2,
                  borderRadius: "8px",
                  mb: 1,
                  background: i === 0 ? "#eeeeee" : "transparent",
                  cursor: "pointer",
                  transition: "0.2s",
                  "&:hover": { background: "#f3f3f3" },
                }}
              >
                <Box
                  component="img"
                  src={item.icon}
                  alt={item.name}
                  sx={{ width: 22, height: 22, objectFit: "contain" }}
                />
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    color: "#292D32",
                    fontWeight: i === 0 ? 500 : 400,
                  }}
                >
                  {item.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ── RIGHT CONTENT ── */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          border: "1px solid #E3E8EE",
          borderRadius: "8px",
          p: { xs: 1.5, sm: 3 },
        }}
      >
        {/* ── Mobile dropdown — inside right box, top-right, NOT fixed/sticky ── */}
        {isMobile && (
          <Box
            ref={dropdownRef}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: 2,
              position: "relative",
            }}
          >
            {/* Trigger: Home icon + arrow */}
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
              <Box
                component="img"
                src="/utility/home.svg"
                alt="Home"
                sx={{ width: 18, height: 18, objectFit: "contain" }}
              />
              <Typography
                sx={{ fontSize: 13, fontWeight: 500, color: "#292D32" }}
              >
                Home
              </Typography>
              {mobileDropdown ? (
                <KeyboardArrowUpIcon sx={{ fontSize: 18, color: "#292D32" }} />
              ) : (
                <KeyboardArrowDownIcon
                  sx={{ fontSize: 18, color: "#292D32" }}
                />
              )}
            </Box>

            {/* Dropdown items */}
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
                {sidebarItems.slice(1).map((item, i) => (
                  <Box
                    key={i}
                    onClick={() => setMobileDropdown(false)}
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
                    <Box
                      component="img"
                      src={item.icon}
                      alt={item.name}
                      sx={{ width: 18, height: 18, objectFit: "contain" }}
                    />
                    <Typography sx={{ fontSize: 13, color: "#292D32" }}>
                      {item.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography fontWeight={600}>Recharges & Bill Payments</Typography>
          <img src="/BharatConnect.png" style={{ height: 28 }} />
        </Box>

        <Grid container spacing={3}>
          {showSkeleton ? (
            <SkeletonGrid />
          ) : (
            <>
              {mainServices.map(renderItem)}
              {!showMore
                ? extraServices.length > 0 && (
                    <Grid item xs={6} sm={4} md={2}>
                      <Box
                        onClick={() => setShowMore(true)}
                        sx={{ textAlign: "center", cursor: "pointer", mt: 3 }}
                      >
                        <Box
                          component="img"
                          src="/utility/viewmore.svg"
                          sx={{ height: 40 }}
                        />
                        <Typography>View More</Typography>
                      </Box>
                    </Grid>
                  )
                : extraServices.map(renderItem)}
            </>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default RechargeDashboard;
