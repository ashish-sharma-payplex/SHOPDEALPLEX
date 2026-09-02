import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  FormControl,
  useMediaQuery,
  useTheme,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useGetBbpsTicketList from "../../../../../api-manage/hooks/react-query/utility/useGetBbpsTicketList";
import TicketStatusCard from "./TicketStatusCard";
import useGetBbpsTicketStatus from "api-manage/hooks/react-query/utility/usGetBbpsTicketStatus";
import { DISPOSITION_MAP } from "../Help_Support/DispositionConstants";
import RaiseTicket from "./RaiseTicketContent";

// ─── Status Badge Config ──────────────────────────────────────────────────────
const STATUS_STYLES = {
  ASSIGNED: { bg: "#d1fae5", color: "#065f46", label: "Assigned" },
  REFUNDED: { bg: "#dcfce7", color: "#166534", label: "Refunded" },
  REFUND_INITIATED: { bg: "#e0f2fe", color: "#0369a1", label: "Refund Initiated" },
  RESOLVED: { bg: "#fef9c3", color: "#854d0e", label: "Resolved" },
  REJECTED: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
  CLOSED: { bg: "#f3f4f6", color: "#374151", label: "Closed" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${min}`;
};

const formatAmount = (amount) => {
  if (amount == null) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

// ─── Shared MenuProps ─────────────────────────────────────────────────────────
const dropdownMenuProps = {
  disablePortal: false,
  disableScrollLock: true,
  PaperProps: {
    sx: {
      borderRadius: "8px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      mt: 0.5,
      "& .MuiMenuItem-root": {
        fontSize: 13.5,
        "&:hover": { bgcolor: "#f0fdf4" },
        "&.Mui-selected": {
          bgcolor: "#dcfce7",
          "&:hover": { bgcolor: "#bbf7d0" },
        },
      },
    },
  },
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "left",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function MyTickets({ onBack }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Category");
  const [status, setStatus] = useState("All Status");
  const [serviceName, setServiceName] = useState("");
  const [issueName, setIssueName] = useState("");
  const [showRaiseTicket, setShowRaiseTicket] = useState(false);

  // ── Popup state ──
  const [popupOpen, setPopupOpen] = useState(false);
  const [statusData, setStatusData] = useState(null);

  const { data: apiResponse, isLoading, isError, error, refetch } = useGetBbpsTicketList();
  const { mutate: fetchTicketStatus, isLoading: statusLoading } = useGetBbpsTicketStatus();

  const tickets = apiResponse?.data?.tickets ?? apiResponse?.tickets ?? [];

  const serviceNames = [
    "All Category",
    ...Array.from(new Set(tickets.map((t) => t.transaction?.service_name).filter(Boolean))),
  ];
  const statusOptions = [
    "All Status",
    ...Array.from(new Set(tickets.map((t) => t.ticket_status).filter(Boolean))),
  ];

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const svcName = t.transaction?.service_name ?? "";
    const matchSearch =
      t.ticket_id.toLowerCase().includes(q) ||
      svcName.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q);
    const matchCategory = category === "All Category" || svcName === category;
    const matchStatus = status === "All Status" || t.ticket_status === status;
    return matchSearch && matchCategory && matchStatus;
  });

  const getStatusStyle = (statusKey) =>
    STATUS_STYLES[statusKey] ?? { bg: "#f3f4f6", color: "#374151", label: statusKey };

  // ── Row click handler ──
  const handleRowClick = (ticket) => {
    setStatusData(null);
    setServiceName(ticket.transaction?.service_name ?? "—");
    setIssueName(DISPOSITION_MAP[ticket.disposition] ?? ticket.disposition ?? "—");
    setPopupOpen(true);
    fetchTicketStatus(
      { ticketId: ticket.ticket_id },
      {
        onSuccess: (data) => setStatusData(data),
        onError: () => setPopupOpen(false),
      }
    );
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setStatusData(null);
  };

  if (showRaiseTicket) {
    return <RaiseTicket onBack={() => setShowRaiseTicket(false)} />;
  }

  // ── No tickets at all (not a filter result) ──
  const hasNoTickets = !isLoading && !isError && tickets.length === 0;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, minHeight: "100vh", bgcolor: "#f5f6fa" }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 2px 20px rgba(0,0,0,0.07)",
          maxWidth: 960,
          mx: "auto",
        }}
      >
        {/* ── Header — always visible ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            px: { xs: 2, sm: 3.5 },
            pt: { xs: 2.5, sm: 3 },
            pb: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {onBack && (
              <IconButton
                onClick={onBack}
                size="small"
                sx={{ color: "#374151", "&:hover": { bgcolor: "#f3f4f6" }, mr: 0.5 }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Box>
              <Typography variant="h6" fontWeight={700} color="#111827" letterSpacing="-0.2px">
                My Tickets
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.3}>
                All raised tickets will appear here
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowRaiseTicket(true)}
            sx={{
              bgcolor: "#1A914B",
              borderRadius: 1,
              fontWeight: 600,
              fontSize: 14,
              px: 2.5,
              py: 1.2,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#16a34a", boxShadow: "none" },
            }}
          >
            New Ticket
          </Button>
        </Box>

        {/* ── Loading ── */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} sx={{ color: "#22c55e" }} />
          </Box>
        )}

        {/* ── Error ── */}
        {isError && !isLoading && (
          <Box sx={{ px: 3, pb: 3 }}>
            <Alert
              severity="error"
              sx={{ borderRadius: 2 }}
              action={
                <Button
                  color="error"
                  size="small"
                  onClick={() => refetch()}
                  sx={{ fontWeight: 600, textTransform: "none" }}
                >
                  Retry
                </Button>
              }
            >
              {error?.response?.data?.message ?? error?.message ?? "Something went wrong."}
            </Alert>
          </Box>
        )}

        {/* ── Empty State — no tickets at all ── */}
        {hasNoTickets && (
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
              src="/utility/noTickets.svg"
              alt="No Tickets"
              sx={{ width: 180, height: 180, opacity: 0.85, mb: 2.5 }}
            />
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="#111827"
              fontSize={16}
            >
              No Tickets Found
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              fontSize={13.5}
              textAlign="center"
              maxWidth={230}
              lineHeight={1.6}
              mt={0.8}
            >
              No support tickets yet. Any issues you raise will appear here.
            </Typography>
          </Box>
        )}

        {/* ── Toolbar + Table — only when tickets exist ── */}
        {!isLoading && !isError && !hasNoTickets && (
          <>
            {/* ── Toolbar ── */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                px: { xs: 2, sm: 3.5 },
                pb: 2.5,
                mt: 3,
              }}
            >
              <TextField
                placeholder="Search"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#9ca3af", fontSize: 22 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  minWidth: 160,
                  maxWidth: 320,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    fontSize: 14,
                    "& fieldset": { borderColor: "#e5e7eb" },
                    "&:hover fieldset": { borderColor: "#22c55e" },
                    "&.Mui-focused fieldset": { borderColor: "#22c55e" },
                  },
                }}
              />

              <Box sx={{ display: "flex", gap: 1.25, ml: "auto", flexWrap: "wrap" }}>
                {[
                  { value: category, setter: setCategory, options: serviceNames },
                  { value: status, setter: setStatus, options: statusOptions },
                ].map(({ value, setter, options }, i) => (
                  <FormControl key={i} size="small">
                    <Select
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      MenuProps={dropdownMenuProps}
                      sx={{
                        borderRadius: 1,
                        fontSize: 13.5,
                        fontWeight: 500,
                        color: "#374151",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#22c55e" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#22c55e" },
                      }}
                    >
                      {options.map((o) => (
                        <MenuItem key={o} value={o} sx={{ fontSize: 13.5 }}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
              </Box>
            </Box>

            {/* ── Table ── */}
            <TableContainer>
              <Table sx={{ minWidth: isMobile ? 520 : "100%" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f9fafb", borderTop: "1px solid #f0f0f0" }}>
                    {["Ticket ID", "Service", "Deposition", "Amount", "Created"].map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          fontWeight: 600,
                          fontSize: 12,
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
                          py: 1.5,
                          px: { xs: 1.5, sm: 2.5 },
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: 12,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        py: 1.5,
                        px: { xs: 1.5, sm: 2.5 },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        Status <ArrowDownwardIcon sx={{ fontSize: 13, opacity: 0.5 }} />
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 5, color: "#9ca3af", fontSize: 14 }}
                      >
                        No results for current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((ticket) => {
                      const style = getStatusStyle(ticket.ticket_status);
                      return (
                        <TableRow
                          key={ticket.ticket_id}
                          onClick={() => handleRowClick(ticket)}
                          sx={{
                            borderBottom: "1px solid #f3f4f6",
                            "&:last-child td": { border: 0 },
                            "&:hover": { bgcolor: "#f0fdf4" },
                            transition: "background 0.13s",
                            cursor: "pointer",
                          }}
                        >
                          <TableCell
                            sx={{ fontWeight: 700, color: "#111827", px: { xs: 1.5, sm: 2.5 }, py: 2 }}
                          >
                            {ticket.ticket_id}
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: 14, color: "#374151", px: { xs: 1.5, sm: 2.5 }, py: 2, lineHeight: 1.4 }}
                          >
                            {ticket.transaction?.service_name ?? "—"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 14,
                              color: "#6b7280",
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              px: { xs: 1.5, sm: 2.5 },
                              py: 2,
                            }}
                          >
                            {ticket.description}
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 600, color: "#111827", px: { xs: 1.5, sm: 2.5 }, py: 2 }}
                          >
                            {formatAmount(ticket.transaction?.amount)}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 13,
                              color: "#6b7280",
                              px: { xs: 1.5, sm: 2.5 },
                              py: 2,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDate(ticket.created_at)}
                          </TableCell>
                          <TableCell sx={{ px: { xs: 1.5, sm: 2.5 }, py: 2 }}>
                            <Chip
                              label={style.label}
                              size="small"
                              sx={{
                                bgcolor: style.bg,
                                color: style.color,
                                fontWeight: 600,
                                fontSize: 12.5,
                                borderRadius: 10,
                                height: 26,
                                "& .MuiChip-label": { px: 1.5 },
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>

      {/* ── Popup Overlay ── */}
      {popupOpen && (
        <Box
          onClick={handleClosePopup}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box onClick={(e) => e.stopPropagation()}>
            <TicketStatusCard
              data={statusData}
              isLoading={statusLoading}
              onClose={handleClosePopup}
              serviceName={serviceName}
              issueName={issueName}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}