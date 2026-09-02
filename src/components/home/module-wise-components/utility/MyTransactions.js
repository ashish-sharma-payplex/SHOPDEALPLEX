import React, { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Modal from "@mui/material/Modal";
import { useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import useGetBbpsTransactions from "api-manage/hooks/react-query/utility/useGetBbpsTransactions";
import TransactionPopup from "./TransactionPopup";
import { useRouter } from "next/router";

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

const statusMap = {
  SUCCESS: "Success",
  FAILURE: "Failed",
  FAILED: "Failed",
  PENDING: "Pending",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  return (
    d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    ", " +
    d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );
};

const mapTransaction = (tx) => {
  const mapped = {
    id: tx.id,
    service: tx.service_name,
    logo: serviceImageMap[tx.service_category] || "/utility/recharge.svg",
    date: formatDate(tx.created_at),
    dateTime: formatDateTime(tx.created_at),
    transactionId: tx.payment?.payment_reference || tx.client_request_id || "—",
    status: statusMap[tx.status] || "Pending",
    rawStatus: tx.status,
    amount: `₹${Number(tx.amount).toLocaleString("en-IN")}`,
    method: tx.payment?.method || "—",
    txnRefId: tx.txn_reference_id || "—",
    payment: tx.payment,
    serviceNumber: tx.service_number || tx.consumer_number || tx.biller_id || "—",
    providerName: tx.provider_name || tx.biller_name || "—",
    reason: tx.status !== "SUCCESS" ? tx.reason : null,
    client_request_id: tx.client_request_id || "—",
    payerName: tx.payment?.payer_name || "—",
    refund: tx.refund || null,
  };

  // ── DEBUG ──
  // console.log(  "My Transactions Refund",`[mapTransaction] id=${tx.id} | refund=`, tx.refund, '| mapped.refund=', mapped.refund);

  return mapped;
};

const statusConfig = {
  Success: { bg: "#E8F5E9", color: "#2E7D32", dot: "#4CAF50" },
  Pending: { bg: "#FFF8E1", color: "#E65100", dot: "#FFA726" },
  Failed: { bg: "#FFEBEE", color: "#C62828", dot: "#EF5350" },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.Pending;
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.7, background: cfg.bg, borderRadius: "20px", px: 1.5, py: 0.5 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: cfg.color, lineHeight: 1 }}>
        {status}
      </Typography>
    </Box>
  );
};

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell sx={{ pl: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Skeleton variant="circular" width={36} height={36} animation="wave" />
        <Box>
          <Skeleton variant="rounded" width={120} height={13} animation="wave" sx={{ mb: 0.6 }} />
          <Skeleton variant="rounded" width={60} height={11} animation="wave" />
        </Box>
      </Box>
    </TableCell>
    <TableCell><Skeleton variant="rounded" width={90} height={13} animation="wave" /></TableCell>
    <TableCell><Skeleton variant="rounded" width={180} height={13} animation="wave" /></TableCell>
    <TableCell>
      <Skeleton variant="rounded" width={70} height={24} animation="wave" sx={{ borderRadius: "20px" }} />
    </TableCell>
    <TableCell><Skeleton variant="rounded" width={60} height={13} animation="wave" /></TableCell>
    <TableCell><Skeleton variant="rounded" width={80} height={13} animation="wave" /></TableCell>
  </TableRow>
);

const MobileCardSkeleton = () => (
  <Box sx={{ border: "1px solid #E3E8EE", borderRadius: "10px", p: 2, mb: 1.5, background: "#fff" }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
        <Skeleton variant="circular" width={34} height={34} animation="wave" />
        <Box>
          <Skeleton variant="rounded" width={110} height={14} animation="wave" sx={{ mb: 0.6 }} />
          <Skeleton variant="rounded" width={70} height={12} animation="wave" />
        </Box>
      </Box>
      <Box sx={{ textAlign: "right" }}>
        <Skeleton variant="rounded" width={60} height={16} animation="wave" sx={{ mb: 0.6 }} />
        <Skeleton variant="rounded" width={70} height={22} animation="wave" sx={{ borderRadius: "20px" }} />
      </Box>
    </Box>
    <Divider sx={{ my: 1 }} />
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Skeleton variant="rounded" width={160} height={12} animation="wave" />
      <Skeleton variant="rounded" width={70} height={12} animation="wave" />
    </Box>
  </Box>
);

const MobileTransactionCard = ({ tx, onViewDetails }) => (
  <Box sx={{ border: "1px solid #E3E8EE", borderRadius: "10px", p: 2, mb: 1.5, background: "#fff" }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box
          component="img"
          src={tx.logo}
          alt={tx.service}
          sx={{ width: 34, height: 34, objectFit: "contain", borderRadius: "50%", border: "1px solid #eee", p: 0.3 }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{tx.service}</Typography>
          <Typography sx={{ fontSize: 12, color: "#888", mt: 0.2 }}>{tx.date}</Typography>
        </Box>
      </Box>
      <Box sx={{ textAlign: "right" }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", mb: 0.4 }}>{tx.amount}</Typography>
        <StatusBadge status={tx.status} />
      </Box>
    </Box>
    <Divider sx={{ my: 1 }} />
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography sx={{ fontSize: 11, color: "#999", fontFamily: "monospace", wordBreak: "break-all" }}>
        {tx.transactionId}
      </Typography>
      <Typography
        onClick={() => onViewDetails(tx)}
        sx={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", cursor: "pointer", ml: 1, flexShrink: 0, "&:hover": { textDecoration: "underline" } }}
      >
        View Details
      </Typography>
    </Box>
  </Box>
);

const FILTER_OPTIONS = [
  { value: "ALL", label: "All", dotColor: null },
  { value: "SUCCESS", label: "Success", dotColor: "#4CAF50" },
  { value: "PENDING", label: "Pending", dotColor: "#FFA726" },
  { value: "FAILURE", label: "Failed", dotColor: "#EF5350" },
];

const FILTER_ACTIVE_COLORS = {
  SUCCESS: "#2E7D32",
  PENDING: "#E65100",
  FAILURE: "#C62828",
  ALL: "#1a1a1a",
};

export const MyTransactionsContent = ({ onNeedHelp }) => {
  const isMobile = useMediaQuery("(max-width:600px)", { noSsr: true });
  const isTablet = useMediaQuery("(max-width:960px)", { noSsr: true });
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState([]);
  const [showShimmer, setShowShimmer] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const sentinelRef = useRef(null);
  const shimmerTimerRef = useRef(null);
  const filterRef = useRef(null);

  const { data, isLoading, isFetching } = useGetBbpsTransactions({
    page: currentPage,
    per_page: 10,
  });

 const handleNeedHelp = onNeedHelp ?? (() => router.push("/utility?section=help"));

  useEffect(() => {
    if (data?.data) {
      const mapped = data.data.map(mapTransaction);
      setAllTransactions((prev) =>
        currentPage === 1 ? mapped : [...prev, ...mapped]
      );
      setShowShimmer(false);
      setHasInitiallyLoaded(true);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      if (shimmerTimerRef.current) clearTimeout(shimmerTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasMore = data?.pagination?.has_more || false;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isFetching && !isLoading && !showShimmer) {
          setShowShimmer(true);
          shimmerTimerRef.current = setTimeout(() => {
            setCurrentPage((prev) => prev + 1);
          }, 2000);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetching, isLoading, showShimmer]);

  const filtered = allTransactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      tx.service.toLowerCase().includes(q) ||
      tx.transactionId.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || tx.rawStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleViewDetails = (tx) => { setSelectedTx(tx); setPopupOpen(true); };
  const handleClosePopup = () => { setPopupOpen(false); setSelectedTx(null); };
  const isFilterActive = statusFilter !== "ALL";

  // ── No transactions at all (not a filter result) ──
  const hasNoTransactions = hasInitiallyLoaded && !isLoading && allTransactions.length === 0;

  return (
    <>
      <Modal
        open={popupOpen}
        onClose={handleClosePopup}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2, sm: 4 } }}
      >
        <Box
          sx={{
            width: "100%", maxWidth: 500, maxHeight: "90vh",
            overflowY: "auto", overflowX: "hidden", outline: "none", pb: 5,
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none", scrollbarWidth: "none",
          }}
        >
          {selectedTx && <TransactionPopup tx={selectedTx} onNeedHelp={handleNeedHelp}  />}
        </Box>
      </Modal>

      <Box sx={{ border: "1px solid #E3E8EE", borderRadius: "12px", background: "#fff" }}>

        {/* ── Top Header — always visible ── */}
        <Box
          sx={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: { xs: 1.5, sm: 2 },
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 20, sm: 22 }, color: "#1a1a1a", lineHeight: 1.2 }}>
              Transactions
            </Typography>
            <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: "#888", mt: 0.5 }}>
              All your payments, organized and accessible anytime
            </Typography>
          </Box>
         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
      
        <img src="/BharatConnect.png" style={{ height: 36 }} />
      </Box>
        </Box>

        <Divider sx={{ borderColor: "#F0F0F0" }} />

        {/* ── Loading skeleton ── */}
        {isLoading && (
          <>
            {/* Section header skeleton */}
            <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.2, sm: 1.5 } }}>
              <Skeleton variant="rounded" width={140} height={16} animation="wave" />
            </Box>
            {!isMobile ? (
              <TableContainer>
                <Table>
                  <TableBody>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <TableRowSkeleton key={`init-${i}`} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <MobileCardSkeleton key={`init-${i}`} />
                ))}
              </Box>
            )}
          </>
        )}

        {/* ── Empty State — no transactions at all ── */}
        {hasNoTransactions && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
              px: 2,
            }}
          >
            <Box
              component="img"
              src="/utility/noTransactions.svg"
              alt="No Transactions"
              sx={{ width: 180, height: 180, mb: 2.5 }}
            />
            <Typography
              sx={{ fontWeight: 700, fontSize: 16, color: "#111827" }}
            >
              No Transactions Found
            </Typography>
            <Typography
              sx={{
                fontSize: 13.5,
                color: "#6b7280",
                textAlign: "center",
                maxWidth: 240,
                lineHeight: 1.6,
                mt: 0.8,
              }}
            >
              Pay a bill or recharge to start seeing your transaction history here.
            </Typography>
          </Box>
        )}

        {/* ── Section Header + Filter + Table — only when transactions exist ── */}
        {!isLoading && !hasNoTransactions && (
          <>
            {/* ── Section Header with Filter ── */}
            <Box
              sx={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                px: { xs: 2, sm: 3 }, py: { xs: 1.2, sm: 1.5 },
                overflow: "visible", position: "relative", zIndex: 10,
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: { xs: 14, sm: 15 }, color: "#1a1a1a" }}>
                Payments History
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                {searchOpen && (
                  <InputBase
                    autoFocus
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      border: "1px solid #E3E8EE", borderRadius: "8px",
                      px: 1.5, py: 0.4, fontSize: 13, mr: 0.5,
                      width: { xs: 130, sm: 200 }, background: "#fafafa",
                    }}
                  />
                )}

                <IconButton
                  size="small"
                  onClick={() => { setSearchOpen((p) => !p); if (searchOpen) setSearchQuery(""); }}
                  sx={{ color: "#1a1a1a", width: 32, height: 32, "&:hover": { background: "#f5f5f5" } }}
                >
                  <SearchIcon sx={{ fontSize: 20 }} />
                </IconButton>

                {/* ── Filter Button + Dropdown ── */}
                <Box ref={filterRef} sx={{ position: "relative" }}>
                  <IconButton
                    size="small"
                    onClick={() => setFilterOpen((p) => !p)}
                    sx={{
                      width: 32, height: 32,
                      color: isFilterActive || filterOpen ? "#2E7D32" : "#1a1a1a",
                      background: isFilterActive || filterOpen ? "#E8F5E9" : "transparent",
                      "&:hover": { background: isFilterActive ? "#d4edda" : "#f5f5f5" },
                      transition: "all 0.2s",
                    }}
                  >
                    <TuneIcon sx={{ fontSize: 20 }} />
                  </IconButton>

                  {isFilterActive && (
                    <Box
                      sx={{
                        position: "absolute", top: 4, right: 4,
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#2E7D32", border: "1.5px solid #fff", pointerEvents: "none",
                      }}
                    />
                  )}

                  {filterOpen && (
                    <Box
                      sx={{
                        position: "fixed",
                        top: (() => {
                          const el = filterRef.current;
                          if (!el) return 0;
                          return el.getBoundingClientRect().bottom + 6;
                        })(),
                        right: (() => {
                          const el = filterRef.current;
                          if (!el) return 0;
                          return window.innerWidth - el.getBoundingClientRect().right;
                        })(),
                        zIndex: 9999,
                        background: "#fff",
                        border: "1px solid #E3E8EE",
                        borderRadius: "10px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                        minWidth: 175,
                        overflow: "hidden",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11, fontWeight: 600, color: "#9ca3af",
                          textTransform: "uppercase", letterSpacing: 0.5,
                          px: 2, py: 1.2, borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        Filter by Status
                      </Typography>

                      {FILTER_OPTIONS.map((opt) => {
                        const isActive = statusFilter === opt.value;
                        return (
                          <Box
                            key={opt.value}
                            onClick={() => { setStatusFilter(opt.value); setFilterOpen(false); }}
                            sx={{
                              px: 2, py: 1.1, cursor: "pointer",
                              display: "flex", alignItems: "center", gap: 1.2,
                              background: isActive ? "#f0fdf4" : "transparent",
                              "&:hover": { background: isActive ? "#f0fdf4" : "#f9fafb" },
                              transition: "background 0.15s",
                            }}
                          >
                            {opt.dotColor ? (
                              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: opt.dotColor, flexShrink: 0 }} />
                            ) : (
                              <Box sx={{ width: 8, height: 8, borderRadius: "50%", border: "1.5px solid #d1d5db", flexShrink: 0 }} />
                            )}
                            <Typography
                              sx={{
                                fontSize: 13.5, flex: 1,
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? FILTER_ACTIVE_COLORS[opt.value] : "#374151",
                              }}
                            >
                              {opt.label}
                            </Typography>
                            {isActive && (
                              <Typography sx={{ fontSize: 13, color: "#2E7D32", fontWeight: 700 }}>✓</Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* ── Desktop / Tablet Table ── */}
            {!isMobile ? (
              <TableContainer>
                <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                  <colgroup>
                    <col style={{ width: "26%" }} />
                    <col style={{ width: "12%" }} />
                    {!isTablet && <col style={{ width: "22%" }} />}
                    <col style={{ width: isTablet ? "22%" : "14%" }} />
                    <col style={{ width: isTablet ? "20%" : "14%" }} />
                    <col style={{ width: isTablet ? "26%" : "12%" }} />
                  </colgroup>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#999", fontSize: 12, fontWeight: 500, py: 1.2, pl: 3, borderBottom: "1px solid #F0F0F0", background: "#fff" }}>
                        Service
                      </TableCell>
                      <TableCell sx={{ color: "#999", fontSize: 12, fontWeight: 500, py: 1.2, borderBottom: "1px solid #F0F0F0", background: "#fff" }}>
                        Date
                      </TableCell>
                      {!isTablet && (
                        <TableCell sx={{ color: "#999", fontSize: 12, fontWeight: 500, py: 1.2, borderBottom: "1px solid #F0F0F0", background: "#fff" }}>
                          Transaction ID
                        </TableCell>
                      )}
                      <TableCell sx={{ color: "#999", fontSize: 12, fontWeight: 500, py: 1.2, borderBottom: "1px solid #F0F0F0", background: "#fff" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          Status <ArrowDownwardIcon sx={{ fontSize: 13, color: "#999" }} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#999", fontSize: 12, fontWeight: 500, py: 1.2, borderBottom: "1px solid #F0F0F0", background: "#fff" }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ color: "#999", fontSize: 12, fontWeight: 500, py: 1.2, pr: 3, borderBottom: "1px solid #F0F0F0", background: "#fff" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filtered.map((tx) => (
                      <TableRow
                        key={tx.id}
                        sx={{
                          "&:last-child td": { borderBottom: 0 },
                          "& td": { borderBottom: "1px solid #F7F7F7", py: 1.8 },
                          "&:hover": { background: "#fafafa" },
                          transition: "background 0.15s",
                        }}
                      >
                        <TableCell sx={{ pl: 3 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box
                              component="img"
                              src={tx.logo}
                              alt={tx.service}
                              sx={{ width: 36, height: 36, objectFit: "contain", borderRadius: "50%", border: "1px solid #eee", p: 0.4, flexShrink: 0, background: "#fafafa" }}
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {tx.service}
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: "#bbb", mt: 0.2 }}>{tx.method}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, color: "#555", whiteSpace: "nowrap" }}>{tx.date}</Typography>
                        </TableCell>
                        {!isTablet && (
                          <TableCell>
                            <Typography sx={{ fontSize: 12, color: "#555", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {tx.transactionId}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell><StatusBadge status={tx.status} /></TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{tx.amount}</Typography>
                        </TableCell>
                        <TableCell sx={{ pr: 3 }}>
                          <Typography
                            onClick={() => handleViewDetails(tx)}
                            sx={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                          >
                            View Details
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Shimmer */}
                    {showShimmer && Array.from({ length: 2 }).map((_, i) => (
                      <TableRowSkeleton key={`shimmer-${i}`} />
                    ))}

                    {/* Filter se koi match nahi */}
                    {!showShimmer && filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={isTablet ? 5 : 6} align="center" sx={{ py: 6, borderBottom: 0 }}>
                          <Typography sx={{ color: "#bbb", fontSize: 14 }}>No results for current filters.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              /* ── Mobile Cards ── */
              <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
                {filtered.map((tx) => (
                  <MobileTransactionCard key={tx.id} tx={tx} onViewDetails={handleViewDetails} />
                ))}

                {showShimmer && Array.from({ length: 2 }).map((_, i) => (
                  <MobileCardSkeleton key={`shimmer-${i}`} />
                ))}

                {!showShimmer && filtered.length === 0 && (
                  <Typography sx={{ color: "#bbb", fontSize: 14, textAlign: "center", py: 5 }}>
                    No results for current filters.
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}

        <Box ref={sentinelRef} sx={{ height: 1 }} />
      </Box>
    </>
  );
};

export default MyTransactionsContent;