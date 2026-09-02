import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";
import useCreateBbpsTicket from "api-manage/hooks/react-query/utility/useGetBbpsCreate";
import TicketSuccessCard from "./TicketSuccessCard";
import { dispositions } from "../Help_Support/DispositionConstants";

const theme = createTheme({
  palette: {
    primary: { main: "#2E7D32" },
    secondary: { main: "#FF6F00" },
    background: { paper: "#FFFFFF" },
  },
  typography: {
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2E7D32",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontSize: "16px",
          fontWeight: 600,
          padding: "12px 24px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        },
      },
    },
  },
});


// ─── Custom Disposition Dropdown ──────────────────────────────────────────────
const DispositionDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selectedDisp = dispositions.find((d) => d.code === value);
  const isActive = open || !!selectedDisp;

  const filtered = dispositions.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Box ref={ref} sx={{ position: "relative", mb: 2 }}>
      {/* Trigger Box */}
      <Box
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          position: "relative",
          border: `1px solid ${open ? "#2E7D32" : "#c4c4c4"}`,
          borderRadius: "8px",
          px: 1.75,
          py: 1,
          minHeight: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          cursor: "pointer",
          transition: "border-color 0.2s",
          "&:hover": { borderColor: "#2E7D32" },
        }}
      >
        {/* Floating Label */}
        <Typography
          component="label"
          sx={{
            position: "absolute",
            left: "12px",
            top: isActive ? "-9px" : "50%",
            transform: isActive
              ? "translateY(0) scale(0.75)"
              : "translateY(-50%) scale(1)",
            transformOrigin: "left center",
            background: "#fff",
            px: "4px",
            color: open ? "#2E7D32" : "#6b7280",
            fontSize: "1rem",
            pointerEvents: "none",
            transition: "all 0.2s ease",
            lineHeight: 1,
            zIndex: 1,
          }}
        >
          Select Disposition{" "}
          <Typography
            component="span"
            sx={{ color: "#ef4444", fontSize: "inherit" }}
          >
            *
          </Typography>
        </Typography>

        {/* Selected Value Text */}
        <Typography
          fontSize={14}
          color={selectedDisp ? "#111" : "transparent"}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            pr: 1,
            mt: "2px",
          }}
        >
          {selectedDisp ? selectedDisp.name : "placeholder"}
        </Typography>

        {/* Edit / Select Badge */}
        <Typography
          sx={{ fontSize: 12, color: "#16a34a", fontWeight: 600, flexShrink: 0 }}
        >
          {selectedDisp ? "" : ""}
        </Typography>
      </Box>

      {/* Dropdown */}
      {open && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 10,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            mt: 0.5,
            overflow: "hidden",
          }}
        >
          {/* Search */}
          <Box sx={{ p: 1, borderBottom: "1px solid #f3f4f6" }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder="Search disposition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: 13,
                },
              }}
            />
          </Box>

          {/* Options */}
          <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: "#9ca3af", px: 2, py: 2 }}>
                No dispositions found
              </Typography>
            ) : (
              filtered.map((d) => (
                <Box
                  key={d.code}
                  onClick={() => {
                    onChange(d.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  sx={{
                    px: 2,
                    py: 1.2,
                    cursor: "pointer",
                    background: value === d.code ? "#f0fdf4" : "transparent",
                    "&:hover": { background: "#f9fafb" },
                  }}
                >
                  <Typography fontSize={13}>{d.name}</Typography>
                </Box>
              ))
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RaiseTicket({ onBack }) {
  const [form, setForm] = useState({
    transactionId: "",
    amount: "",
    mobileNo: "",
    serviceType: "",
    disposition: "",
    description: "",
  });
  const [charCount, setCharCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);

  const { mutate: createTicket, isLoading } = useCreateBbpsTicket();

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "description") setCharCount(value.length);
    if (field === "serviceType")
      setForm((prev) => ({ ...prev, serviceType: value, disposition: "" }));
  };

  const handleDispositionChange = (code) => {
    setForm((prev) => ({ ...prev, disposition: code }));
  };

  const handleSubmit = () => {
    if (!form.transactionId.trim()) {
      toast.error("Transaction ID is required.");
      return;
    }
    if (!form.disposition) {
      toast.error("Please select a disposition.");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    createTicket(
      {
        txnReferenceId: form.transactionId,
        disposition: form.disposition,
        description: form.description,
      },
      {
        onSuccess: (data) => {
          // console.log("Full API Response:", JSON.stringify(data, null, 2));

          setTicketData({
            ticketId:
              data?.ticketId ||
              data?.data?.ticketId ||
              data?.result?.ticketId ||
              "—",
            status: data?.status || data?.data?.status || "Pending Review",
            service: data?.service || data?.data?.service || "—",
            issue:
              dispositions.find((d) => d.code === form.disposition)?.name || "—",
            transactionId: form.transactionId,
          });

          setModalOpen(true);
          toast.success("Ticket submitted successfully!");
        },
        onError: (error) => {
          // console.log("Error response:", error?.response);
          const data = error?.response?.data;

          if (error?.response?.status === 409) {
            setTicketData({
              ticketId: data?.bbps?.existing_ticket_id || "—",
              status: "Already Exists",
              service: "—",
              issue:
                dispositions.find((d) => d.code === form.disposition)?.name ||
                "—",
              transactionId: form.transactionId,
              message:
                data?.bbps?.compliance_reason ||
                data?.message ||
                "Ticket already exists.",
            });
            setModalOpen(true);
            return;
          }

          const message =
            data?.message ||
            data?.error ||
            error?.message ||
            "Something went wrong.";
          toast.error(message);
        },
      }
    );
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTicketData(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          border: "1px solid #e7e7e7",
          borderRadius: "8px",
          p: 3,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            {onBack && (
              <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon fontSize="small" />}
                sx={{
                  mb: 1,
                  px: 0,
                  color: "#667085",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  textTransform: "none",
                  "&:hover": { background: "transparent", color: "#101828" },
                }}
              >
                Back to Help
              </Button>
            )}
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Raise a Ticket
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Describe your issue and we'll look into it
            </Typography>
          </Box>

          {/* Logo */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                 
                  <img src="/BharatConnect.png" style={{ height: 36 }} />
                </Box>
        </Box>

        <Grid container spacing={3}>
          {/* LEFT COLUMN */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: "22px", mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Transaction Details
              </Typography>
              <TextField
                fullWidth
                label={
                  <span>
                    Transaction ID <span style={{ color: "red" }}>*</span>
                  </span>
                }
                placeholder="e.g. TXN8821093412"
                value={form.transactionId}
                onChange={handleChange("transactionId")}
                sx={{ mb: 2 }}
                size="small"
              />
            </Paper>

            <Paper sx={{ p: "22px" }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Issue Details
              </Typography>

              <DispositionDropdown
                value={form.disposition}
                onChange={handleDispositionChange}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label={
                  <span>
                    Description <span style={{ color: "red" }}>*</span>
                  </span>
                }
                placeholder="Describe the issue in detail..."
                value={form.description}
                onChange={handleChange("description")}
                inputProps={{ maxLength: 500 }}
                sx={{ mb: 0.5 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                textAlign="right"
                mb={2}
              >
                {charCount} / 500
              </Typography>
            </Paper>

            <Button
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.5,
                bgcolor: "#2E7D32",
                "&:hover": { bgcolor: "#1B5E20" },
              }}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : (
                "Submit Ticket"
              )}
            </Button>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography
                variant="overline"
                fontWeight={700}
                color="text.secondary"
                letterSpacing={1}
              >
                What to Expect
              </Typography>

              <Box
                sx={{ mt: 2, display: "flex", gap: 2, alignItems: "flex-start" }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: "#FFF8E1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <AccessTimeIcon sx={{ color: "#FF8F00", fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    24–48 hour resolution
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Most issues resolved within 2 business days
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{ mt: 2, display: "flex", gap: 2, alignItems: "flex-start" }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: "#E8F5E9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <SecurityIcon sx={{ color: "#2E7D32", fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Your money is safe
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    All funds are secured. Refunds processed promptly
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography
                variant="overline"
                fontWeight={700}
                color="text.secondary"
                letterSpacing={1}
              >
                Tips for Faster Resolution
              </Typography>
              <List dense sx={{ mt: 1 }}>
                {[
                  "Keep your Transaction ID ready",
                  // "Attach screenshots if possible",
                  // "Mention the exact date & time",
                  "Describe the issue clearly",
                ].map((tip) => (
                  <ListItem key={tip} disableGutters sx={{ py: 0.3 }}>
                    <ListItemIcon sx={{ minWidth: 20 }}>
                      <FiberManualRecordIcon
                        sx={{ fontSize: 7, color: "#555" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={tip}
                      primaryTypographyProps={{
                        variant: "body2",
                        color: "text.secondary",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* SUCCESS / ERROR POPUP MODAL */}
      {modalOpen && ticketData && (
        <Box
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
          onClick={handleCloseModal}
        >
          <Box onClick={(e) => e.stopPropagation()}>
            <TicketSuccessCard
              ticketData={ticketData}
              onViewTickets={() => {
                handleCloseModal();
                onBack && onBack();
              }}
            />
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
}