// pages\my-travel-trips\index.jsx
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  Typography,
  Drawer,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MenuIcon from "@mui/icons-material/Menu";
import SortIcon from "@mui/icons-material/Sort";
import CloseIcon from "@mui/icons-material/Close";

import { GREEN, CATEGORIES, STATUS_FILTERS, STATUS_MAP, HOTEL_STATUS_MAP, STATIC_DATA } from "components/travel-hooks/my-trips/constants";
import { flattenOrders } from "components/travel-hooks/my-trips/flattenOrders";

import FlightCard from "./FlightCard";
import FlightCardSkeleton from "./FlightCardSkeleton";
import StaticCard from "./StaticCard";
import BookingDetailsDialog from "./BookingDetailsDialog";
import CancelTicketDialog from "./CancelTicketDialog";
import CancellationCard from "./CancellationCard";
import BusBooking from "./BusBooking";
import Sidebar from "./sidebar";

import HotelCard from "./HotelCard";
import HotelCardSkeleton from "./HotelCardSkeleton";
import HotelBookingDetailsDialog from "./HotelBookingDetailsDialog";
// ✅ NAYA — Hotel "Cancelled" tab ke liye card
import HotelCancellationCard from "./HotelCancellationCard";

import { useSelector, useDispatch } from "react-redux";
import { setConfigData } from "src/redux/slices/configData";
import { useGetConfigData } from "src/api-manage/hooks/useGetConfigData";
import Router from "next/router";
import {
  getBookingDetails,
  getMyTrips,
  getCancellations,
  getHotelBookings,
  getHotelBookingDetails,
} from "components/travel-hooks/my-trips/MyTripsApi";

import { getUserId } from "components/travel-config/userConfig";
import SecondNavBar from "components/header/second-navbar/SecondNavbar";
import FooterMiddle from "components/footer/footer-middle/FooterMiddle";
import { getBusCancellations } from "travel-api/busApi";
import BusCancellationCard from "./BusCancellationCard";
// ✅ NAYA — Hotel cancellations list API
import { getHotelCancellations } from "travel-api/hotelApi";

const BATCH_SIZE = 8;
const HOTEL_PAGE_SIZE = 5;

const MyTrips = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const dispatch = useDispatch();
  const { configData } = useSelector((state) => state.configData);
  const { data: dataConfig, refetch: refetchConfig } = useGetConfigData();

  const [selectedCategory, setSelectedCategory] = useState("Flights");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [flightBookings, setFlightBookings] = useState([]);

  const [cancellations, setCancellations] = useState([]);
  const [cancellationsLoading, setCancellationsLoading] = useState(false);

  const [busCancellations, setBusCancellations] = useState([]);
  const [busCancellationsLoading, setBusCancellationsLoading] = useState(false);

  const [hotelBookings, setHotelBookings] = useState([]);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelPage, setHotelPage] = useState(1);
  const [hotelHasMore, setHotelHasMore] = useState(false);
  const [hotelLoadingMore, setHotelLoadingMore] = useState(false);

  // ✅ NAYA — Hotel cancellations ke liye state
  const [hotelCancellations, setHotelCancellations] = useState([]);
  const [hotelCancellationsLoading, setHotelCancellationsLoading] = useState(false);

  const [hotelDetailsOpen, setHotelDetailsOpen] = useState(false);
  const [hotelDetailsData, setHotelDetailsData] = useState(null);
  const [hotelDetailsLoadingId, setHotelDetailsLoadingId] = useState(null);

  const [selectedBookings, setSelectedBookings] = useState([]);
  const [openDetails, setOpenDetails] = useState(false);
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);

  const [cancelBooking, setCancelBooking] = useState(null);
  const [openCancel, setOpenCancel] = useState(false);

  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false);

  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const [userReady, setUserReady] = useState(false);

  const sentinelRef = useRef(null);
  const hotelSentinelRef = useRef(null);

  useEffect(() => {
    refetchConfig();
  }, [refetchConfig]);

  useEffect(() => {
    if (dataConfig) {
      if (dataConfig.length === 0) {
        Router.push("/404");
      } else if (dataConfig?.maintenance_mode) {
        Router.push("/maintainance");
      } else {
        dispatch(setConfigData(dataConfig));
      }
    }
  }, [dataConfig, dispatch]);

  const fetchFlightBookings = async (status = null) => {
    try {
      setLoading(true);

      let page = 1;
      let allResults = [];
      let hasNext = true;

      while (hasNext) {
        const response = await getMyTrips(page, 20, status);
        allResults = allResults.concat(response.results || []);
        hasNext = Boolean(response.next);
        page += 1;
      }

      const mapped = flattenOrders(allResults);
      setFlightBookings(mapped);
    } catch (error) {
      // console.log("Flight Booking Error :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCancellations = async () => {
    try {
      setCancellationsLoading(true);

      let page = 1;
      let allResults = [];
      let hasNext = true;

      while (hasNext) {
        const response = await getCancellations(page, 20);
        allResults = allResults.concat(response.results || []);
        hasNext = Boolean(response.next);
        page += 1;
      }

      setCancellations(allResults);
    } catch (error) {
      // console.log("Cancellations Error :", error);
    } finally {
      setCancellationsLoading(false);
    }
  };

  const fetchBusCancellations = async () => {
    try {
      setBusCancellationsLoading(true);

      let page = 1;
      let allResults = [];
      let hasNext = true;

      while (hasNext) {
        const response = await getBusCancellations(page, 20);
        allResults = allResults.concat(response.results || []);
        hasNext = Boolean(response.next);
        page += 1;
      }

      setBusCancellations(allResults);
    } catch (error) {
      // console.log("Bus Cancellations Error :", error);
    } finally {
      setBusCancellationsLoading(false);
    }
  };

  const fetchHotelBookings = async (page = 1, append = false) => {
    try {
      if (append) {
        setHotelLoadingMore(true);
      } else {
        setHotelLoading(true);
      }

      const response = await getHotelBookings({ page, pageSize: HOTEL_PAGE_SIZE });
      const results = response.results || [];

      setHotelBookings((prev) => (append ? [...prev, ...results] : results));
      setHotelHasMore(Boolean(response.next));
      setHotelPage(page);
    } catch (error) {
      // console.log("Hotel Booking Error :", error);
    } finally {
      setHotelLoading(false);
      setHotelLoadingMore(false);
    }
  };

  // ✅ NAYA — Hotel cancellations list fetch (My Trips > Hotels > Cancelled tab)
  const fetchHotelCancellations = async () => {
    try {
      setHotelCancellationsLoading(true);

      let page = 1;
      let allResults = [];
      let hasNext = true;

      while (hasNext) {
        const response = await getHotelCancellations({ page, pageSize: 20 });
        allResults = allResults.concat(response.results || []);
        hasNext = Boolean(response.next);
        page += 1;
      }

      setHotelCancellations(allResults);
    } catch (error) {
      // console.log("Hotel Cancellations Error :", error);
    } finally {
      setHotelCancellationsLoading(false);
    }
  };

  const handleOpenHotelDetails = async (booking) => {
    if (!booking?.booking_id) return;

    try {
      setHotelDetailsLoadingId(booking.booking_id);
      setHotelDetailsOpen(true);

      const response = await getHotelBookingDetails(booking.booking_id);
      setHotelDetailsData(response);
    } catch (error) {
      // console.log("Hotel Details Error :", error);
    } finally {
      setHotelDetailsLoadingId(null);
    }
  };

  const handleCloseHotelDetails = () => {
    setHotelDetailsOpen(false);
    setHotelDetailsData(null);
  };

  const handleHotelCancelSuccess = () => {
    fetchHotelBookings(1, false);
  };

  useEffect(() => {
    let didSet = false;

    const tryDetect = () => {
      const uid = getUserId();
      if (uid && !didSet) {
        didSet = true;
        setUserReady(true);
      }
    };

    tryDetect();

    const handleUserUpdate = () => tryDetect();
    window.addEventListener("TRAVEL_USER_UPDATED", handleUserUpdate);

    return () => {
      window.removeEventListener("TRAVEL_USER_UPDATED", handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    if (!userReady) return;
    if (selectedCategory !== "Flights") return;

    if (selectedStatus === "Cancelled") {
      fetchCancellations();
    } else {
      const apiStatus = selectedStatus === "All" ? null : STATUS_MAP[selectedStatus];
      fetchFlightBookings(apiStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userReady, selectedStatus, selectedCategory]);

  useEffect(() => {
    if (!userReady) return;
    if (selectedCategory !== "Bus" || selectedStatus !== "Cancelled") return;
    fetchBusCancellations();
  }, [userReady, selectedCategory, selectedStatus]);

  useEffect(() => {
    if (!userReady) return;
    if (selectedCategory !== "Hotels") return;

    fetchHotelBookings(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userReady, selectedCategory]);

  // ✅ NAYA — Hotels "Cancelled" tab select hone par cancellations fetch
  useEffect(() => {
    if (!userReady) return;
    if (selectedCategory !== "Hotels" || selectedStatus !== "Cancelled") return;
    fetchHotelCancellations();
  }, [userReady, selectedCategory, selectedStatus]);

  const groupedCancellations = useMemo(() => {
    const map = new Map();
    cancellations.forEach((item) => {
      if (!map.has(item.order_id)) map.set(item.order_id, []);
      map.get(item.order_id).push(item);
    });
    return Array.from(map.entries()).map(([orderId, requests]) => ({ orderId, requests }));
  }, [cancellations]);

  // ✅ NAYA — Hotels ke liye client-side status filter.
  // "All" → sab dikhao. Baaki statuses → hotel_booking_status field
  // ko HOTEL_STATUS_MAP se match karke filter karo. Ye sirf display
  // ke liye hai — backend pagination (hotelPage/hotelHasMore) isse
  // affect nahi hota, wo pehle jaisa hi chalta rahega.
  const displayedHotelBookings = useMemo(() => {
    if (selectedStatus === "All") return hotelBookings;
    const targetStatus = HOTEL_STATUS_MAP[selectedStatus];
    if (!targetStatus) return hotelBookings;
    return hotelBookings.filter((b) => b.hotel_booking_status === targetStatus);
  }, [hotelBookings, selectedStatus]);

  const filteredData =
    selectedCategory === "Flights"
      ? selectedStatus === "Cancelled"
        ? []
        : flightBookings
      : selectedCategory === "Hotels"
        ? hotelBookings
        : selectedStatus === "All"
          ? STATIC_DATA[selectedCategory] || []
          : STATIC_DATA[selectedCategory]?.filter((item) => item.status === selectedStatus) || [];

  const visibleData =
    selectedCategory === "Flights" ? filteredData.slice(0, visibleCount) : filteredData;

  const hasMore =
    selectedCategory === "Flights" &&
    selectedStatus !== "Cancelled" &&
    visibleCount < filteredData.length;

  const isCancelledView = selectedCategory === "Flights" && selectedStatus === "Cancelled";
  const isBusCancelledView = selectedCategory === "Bus" && selectedStatus === "Cancelled";

  // ✅ UPDATED — "Cancelled" status pe ab alag branch (isHotelCancelledView) chalega
  const isHotelsView = selectedCategory === "Hotels" && selectedStatus !== "Cancelled";
  const isHotelCancelledView = selectedCategory === "Hotels" && selectedStatus === "Cancelled";

  const handleCategorySelect = (label) => {
    setSelectedCategory(label);
    setSelectedStatus("All");
    setVisibleCount(BATCH_SIZE);
  };

  const handleSortSelect = (status) => {
    setSelectedStatus(status);
    setVisibleCount(BATCH_SIZE);
    setSortDrawerOpen(false);
  };

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + BATCH_SIZE);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    if (selectedCategory !== "Flights" || selectedStatus === "Cancelled") return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, selectedCategory, selectedStatus, filteredData.length]);

  const loadMoreHotels = useCallback(() => {
    if (hotelLoadingMore || !hotelHasMore) return;
    fetchHotelBookings(hotelPage + 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelLoadingMore, hotelHasMore, hotelPage]);

  useEffect(() => {
    if (selectedCategory !== "Hotels") return;
    const node = hotelSentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreHotels();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMoreHotels, selectedCategory, hotelBookings.length]);

  const handleOpenDetails = async (booking) => {
    const journeysWithId = (booking?.journeys || []).filter((j) => j.booking_id);

    if (journeysWithId.length === 0) return;

    try {
      setDetailsLoadingId(booking.order_id);

      const responses = await Promise.all(
        journeysWithId.map((journey) => getBookingDetails(journey.booking_id))
      );

      const bookingsData = responses.map((response, idx) => ({
        ...response.data,
        journey_type: journeysWithId[idx].journey_type,
      }));

      setSelectedBookings(bookingsData);
      setOpenDetails(true);
    } catch (error) {
      // console.log(error);
    } finally {
      setDetailsLoadingId(null);
    }
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedBookings([]);
  };

  const handleOpenCancel = (booking) => {
    setCancelBooking(booking);
    setOpenCancel(true);
  };

  const handleCloseCancel = () => {
    setOpenCancel(false);
    setCancelBooking(null);
  };

  const handleCancelSuccess = () => {
    handleCloseCancel();
    if (selectedStatus === "Cancelled") {
      fetchCancellations();
    } else {
      const apiStatus = selectedStatus === "All" ? null : STATUS_MAP[selectedStatus];
      fetchFlightBookings(apiStatus);
    }
  };

  return (
    <>
      {/* <SecondNavBar sx={{ boxShadow: "none" }} configData={configData} /> */}

      <Box sx={{ minHeight: "100vh", py: 3, mt: "60px" }}>
        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 1.5, sm: 2, md: 4 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
              mb: 3,
              justifyContent: { xs: "space-between", md: "flex-end" },
              flexWrap: "wrap",
            }}
          >
            {isMobile && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<MenuIcon />}
                onClick={() => setDrawerOpen(true)}
                sx={{
                  borderColor: GREEN,
                  color: GREEN,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  "&:hover": { bgcolor: "#f0fdf4" },
                }}
              >
                Categories
              </Button>
            )}

            {!isMobile && (
              <Box sx={{ display: "flex", gap: { xs: 0.8, sm: 2 }, flexWrap: "wrap" }}>
                {STATUS_FILTERS.map((status) => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? "contained" : "outlined"}
                    onClick={() => {
                      setSelectedStatus(status);
                      setVisibleCount(BATCH_SIZE);
                    }}
                    sx={{
                      borderRadius: "20px",
                      fontWeight: 600,
                      fontSize: 13,
                      textTransform: "none",
                      px: 2.5,
                      py: 1,
                      minWidth: 0,
                      ...(selectedStatus === status
                        ? { bgcolor: GREEN, color: "#fff", borderColor: GREEN, "&:hover": { bgcolor: "#15803d" } }
                        : { borderColor: "#ddd", color: "#666", "&:hover": { borderColor: GREEN, color: GREEN } }),
                    }}
                  >
                    {status}
                  </Button>
                ))}
              </Box>
            )}

            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<SortIcon />}
                onClick={() => setSortDrawerOpen(true)}
                sx={{
                  borderColor: GREEN,
                  color: GREEN,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: "10px",
                  px: 2,
                  "&:hover": { borderColor: GREEN, bgcolor: "#f0fdf4" },
                }}
              >
                Sort
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 3, minHeight: "calc(100vh - 150px)", alignItems: "flex-start" }}>
            {!isMobile && (
              <Paper
                elevation={0}
                sx={{
                  width: 200,
                  bgcolor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e8e8e8",
                  flexShrink: 0,
                  height: "fit-content",
                  position: "sticky",
                  top: 24,
                  overflow: "hidden",
                }}
              >
                <Sidebar selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} />
              </Paper>
            )}

            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{ sx: { width: 260, borderRadius: "0 16px 16px 0" } }}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
                <IconButton onClick={() => setDrawerOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Sidebar
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                onSelect={() => setDrawerOpen(false)}
              />
            </Drawer>

            <Drawer
              anchor="right"
              open={sortDrawerOpen}
              onClose={() => setSortDrawerOpen(false)}
              PaperProps={{ sx: { width: 220 } }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #eee",
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Sort</Typography>
                <IconButton onClick={() => setSortDrawerOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <List sx={{ p: 0 }}>
                {STATUS_FILTERS.map((status) => (
                  <ListItem key={status} disablePadding>
                    <ListItemButton
                      onClick={() => handleSortSelect(status)}
                      sx={{ py: 1.8, bgcolor: selectedStatus === status ? "#f0fdf4" : "transparent" }}
                    >
                      <ListItemText
                        primary={status}
                        primaryTypographyProps={{
                          fontWeight: selectedStatus === status ? 700 : 500,
                          color: selectedStatus === status ? GREEN : "#333",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Drawer>

            <Paper
              elevation={0}
              sx={{
                flex: 1,
                bgcolor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e8e8e8",
                p: { xs: 2, sm: 3, md: 4 },
                minHeight: "600px",
                minWidth: 0,
              }}
            >
              {isMobile && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    pb: 1.5,
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <CalendarMonthIcon sx={{ fontSize: 18, color: GREEN }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>
                    {selectedCategory}
                  </Typography>
                </Box>
              )}

              {selectedCategory === "Bus" ? (
                isBusCancelledView ? (
                  busCancellationsLoading ? (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <FlightCardSkeleton key={`bus-cancel-skel-${i}`} />
                      ))}
                    </Box>
                  ) : busCancellations.length > 0 ? (
                    <Box
                      sx={{
                        columnCount: { xs: 1, sm: 2 },
                        columnGap: "16px",
                      }}
                    >
                      {busCancellations.map((item) => (
                        <Box
                          key={item.id}
                          sx={{
                            breakInside: "avoid",
                            WebkitColumnBreakInside: "avoid",
                            mb: 2,
                          }}
                        >
                          <BusCancellationCard booking={item} />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "500px",
                        textAlign: "center",
                        px: 2,
                      }}
                    >
                      <Box sx={{ mb: 3, fontSize: 80, opacity: 0.3 }}>📅</Box>
                      <Typography sx={{ fontSize: { xs: 18, sm: 24 }, fontWeight: 700, color: "#1a1a1a", mb: 1 }}>
                        No Cancelled Bookings
                      </Typography>
                      <Typography sx={{ color: "#666", fontSize: 14 }}>
                        Looks like you don't have any bus cancellation requests yet.
                      </Typography>
                    </Box>
                  )
                ) : (
                  <BusBooking selectedStatus={selectedStatus} />
                )
              ) : isCancelledView ? (
                cancellationsLoading ? (
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <FlightCardSkeleton key={`cancel-skel-${i}`} />
                    ))}
                  </Box>
                ) : groupedCancellations.length > 0 ? (
                  <Box
                    sx={{
                      columnCount: { xs: 1, sm: 2 },
                      columnGap: "16px",
                    }}
                  >
                    {groupedCancellations.map(({ orderId, requests }) => (
                      <Box
                        key={orderId}
                        sx={{
                          breakInside: "avoid",
                          WebkitColumnBreakInside: "avoid",
                          mb: 2,
                        }}
                      >
                        <CancellationCard orderId={orderId} requests={requests} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "500px",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <Box sx={{ mb: 3, fontSize: 80, opacity: 0.3 }}>📅</Box>
                    <Typography sx={{ fontSize: { xs: 18, sm: 24 }, fontWeight: 700, color: "#1a1a1a", mb: 1 }}>
                      No Cancelled Bookings
                    </Typography>
                    <Typography sx={{ color: "#666", fontSize: 14 }}>
                      Looks like you don't have any cancellation requests yet.
                    </Typography>
                  </Box>
                )
              ) : isHotelCancelledView ? (
                // ✅ NAYA — Hotels > Cancelled tab
                hotelCancellationsLoading ? (
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <FlightCardSkeleton key={`hotel-cancel-skel-${i}`} />
                    ))}
                  </Box>
                ) : hotelCancellations.length > 0 ? (
                  <Box sx={{ columnCount: { xs: 1, sm: 2 }, columnGap: "16px" }}>
                    {hotelCancellations.map((item) => (
                      <Box
                        key={item.changeRequestId}
                        sx={{ breakInside: "avoid", WebkitColumnBreakInside: "avoid", mb: 2 }}
                      >
                        <HotelCancellationCard booking={item} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "500px",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <Box sx={{ mb: 3, fontSize: 80, opacity: 0.3 }}>📅</Box>
                    <Typography sx={{ fontSize: { xs: 18, sm: 24 }, fontWeight: 700, color: "#1a1a1a", mb: 1 }}>
                      No Cancelled Bookings
                    </Typography>
                    <Typography sx={{ color: "#666", fontSize: 14 }}>
                      Looks like you don't have any hotel cancellation requests yet.
                    </Typography>
                  </Box>
                )
              ) : isHotelsView ? (
                hotelLoading && hotelBookings.length === 0 ? (
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    {Array.from({ length: BATCH_SIZE }).map((_, i) => (
                      <HotelCardSkeleton key={`hotel-initial-skel-${i}`} />
                    ))}
                  </Box>
                ) : displayedHotelBookings.length > 0 ? (
                  <>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                      {displayedHotelBookings.map((booking) => (
                        <HotelCard
                          key={booking.booking_id}
                          booking={booking}
                          onViewDetails={handleOpenHotelDetails}
                          onCancelSuccess={handleHotelCancelSuccess}
                        />
                      ))}

                      {hotelLoadingMore &&
                        Array.from({ length: 2 }).map((_, i) => (
                          <HotelCardSkeleton key={`hotel-more-skel-${i}`} />
                        ))}
                    </Box>

                    {hotelHasMore && (
                      <Box
                        ref={hotelSentinelRef}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: 60,
                          mt: 2,
                        }}
                      >
                        {hotelLoadingMore && (
                          <Typography sx={{ fontSize: 13, color: "#888" }}>Loading more...</Typography>
                        )}
                      </Box>
                    )}

                    {!hotelHasMore && hotelBookings.length > HOTEL_PAGE_SIZE && (
                      <Typography sx={{ textAlign: "center", fontSize: 12.5, color: "#999", mt: 3 }}>
                        You've reached the end — all {hotelBookings.length} bookings shown.
                      </Typography>
                    )}
                  </>
                ) : hotelBookings.length > 0 ? (
                  // ✅ NAYA — raw data hai lekin selected status ka koi match nahi mila
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "500px",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <Box sx={{ mb: 3, fontSize: 80, opacity: 0.3 }}>🏨</Box>
                    <Typography sx={{ fontSize: { xs: 18, sm: 24 }, fontWeight: 700, color: "#1a1a1a", mb: 1 }}>
                      No {selectedStatus} Hotel Bookings
                    </Typography>
                    <Typography sx={{ color: "#666", fontSize: 14 }}>
                      Looks like you don't have any {selectedStatus.toLowerCase()} hotel bookings yet.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "500px",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <Box sx={{ mb: 3, fontSize: 80, opacity: 0.3 }}>🏨</Box>
                    <Typography sx={{ fontSize: { xs: 18, sm: 24 }, fontWeight: 700, color: "#1a1a1a", mb: 1 }}>
                      No Hotel Bookings
                    </Typography>
                    <Typography sx={{ color: "#666", fontSize: 14 }}>
                      Looks like you don't have any hotel bookings yet.
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 3, bgcolor: GREEN, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#15803d" } }}
                    >
                      Book your next stay
                    </Button>
                  </Box>
                )
              ) : selectedCategory === "Flights" && loading ? (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  {Array.from({ length: BATCH_SIZE }).map((_, i) => (
                    <FlightCardSkeleton key={`initial-skel-${i}`} />
                  ))}
                </Box>
              ) : filteredData.length > 0 ? (
                selectedCategory === "Flights" ? (
                  <>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                      {visibleData.map((booking) => (
                        <FlightCard
                          key={`${booking.order_id}-${booking.booking_id}`}
                          booking={booking}
                          onViewDetails={handleOpenDetails}
                          detailsLoading={detailsLoadingId === booking.booking_id}
                        />
                      ))}

                      {loadingMore &&
                        Array.from({ length: 2 }).map((_, i) => <FlightCardSkeleton key={`skel-${i}`} />)}
                    </Box>

                    {hasMore && (
                      <Box
                        ref={sentinelRef}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: 60,
                          mt: 2,
                        }}
                      >
                        {loadingMore && (
                          <Typography sx={{ fontSize: 13, color: "#888" }}>
                            Loading more...
                          </Typography>
                        )}
                      </Box>
                    )}

                    {!hasMore && filteredData.length > BATCH_SIZE && (
                      <Typography
                        sx={{ textAlign: "center", fontSize: 12.5, color: "#999", mt: 3 }}
                      >
                        You've reached the end — all {filteredData.length} bookings shown.
                      </Typography>
                    )}
                  </>
                ) : (
                  <Box>
                    {filteredData.map((booking) => (
                      <StaticCard key={booking.id} booking={booking} selectedCategory={selectedCategory} />
                    ))}
                  </Box>
                )
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "500px",
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  <Box sx={{ mb: 3, fontSize: 80, opacity: 0.3 }}>📅</Box>
                  <Typography sx={{ fontSize: { xs: 18, sm: 24 }, fontWeight: 700, color: "#1a1a1a", mb: 1 }}>
                    No {selectedStatus === "All" ? "" : selectedStatus + " "}Bookings
                  </Typography>
                  <Typography sx={{ color: "#666", fontSize: 14 }}>
                    Looks like you don't have any{" "}
                    {selectedStatus === "All" ? "" : selectedStatus.toLowerCase() + " "}
                    {selectedCategory.toLowerCase()} bookings yet.
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 3, bgcolor: GREEN, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#15803d" } }}
                  >
                    Book your next trip
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      <BookingDetailsDialog open={openDetails} bookings={selectedBookings} onClose={handleCloseDetails} />

      <HotelBookingDetailsDialog
        open={hotelDetailsOpen}
        loading={!!hotelDetailsLoadingId}
        data={hotelDetailsData}
        onClose={handleCloseHotelDetails}
      />

      <CancelTicketDialog
        open={openCancel}
        booking={cancelBooking}
        onClose={handleCloseCancel}
        onSuccess={handleCancelSuccess}
      />

      {/* <FooterMiddle configData={configData} /> */}
    </>
  );
};

export default MyTrips;