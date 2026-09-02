import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useDispatch } from "react-redux";
import { setLogoutUser } from "redux/slices/profileInfo";
import { setAuthToken } from "redux/slices/authSlice";
import { clearTravelUser } from "components/travel-config/userConfig";

const GREEN = "#16a34a";

const RIGHT_ITEMS = [
  { label: "Offers", icon: <LocalOfferOutlinedIcon sx={{ fontSize: 17 }} /> },
  { label: "Support", icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 17 }} /> },
  { label: "My Trips", icon: <LuggageOutlinedIcon sx={{ fontSize: 17 }} /> },
];

const CATEGORIES = [
  { label: "Flights", img: "/navbaricons/flightslogo.svg", path: "/flights" },
  { label: "Hotels", img: "/navbaricons/hotelslogo.svg", path: "/hotels" },
  { label: "Buses", img: "/navbaricons/buseslogo.svg", path: "/buses" },
];

// ✅ In pages pe CATEGORIES kabhi nahi dikhega — inke apne CategoryTabs
// already hain (duplicate avoid karne ke liye).
const FULLY_HIDDEN_PATHS = [ ];

// ✅ In pages pe CATEGORIES sirf scroll hone par dikhega (jaise pehle
// poora StickyNavbar scroll pe dikhta tha).
const SCROLL_ONLY_PATHS = [
  "/hotels",
  "/flights",
  // "/flights/listing",
  "/buses",
  "/buses/results",
];

const StickyNavbar = ({
  scrolled,
  token,
  userName,
  userImage,
  onLoginClick,
  onProfileClick,
}) => {
  const [drawerOpen, setDrawer] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isLoggedIn = Boolean(token);

  // 1️⃣ Fully hidden check
  const isFullyHidden = FULLY_HIDDEN_PATHS.some((p) =>
    location.pathname.startsWith(p),
  );

  // 2️⃣ Scroll-only check
  const isScrollOnly = SCROLL_ONLY_PATHS.includes(location.pathname);

  // 3️⃣ Final visibility:
  //    - fully hidden pages → kabhi nahi
  //    - scroll-only pages → sirf `scrolled` true hone par
  //    - baaki sab pages → hamesha (scroll ho ya na ho)
  const showCategories = isFullyHidden ? false : isScrollOnly ? scrolled : true;

  // Mobile drawer ke liye — sirf fully-hidden pages pe categories list hide
  const hideCategoriesInDrawer = isFullyHidden;

  const handleRightItemClick = (label) => {
    if (label === "My Trips") navigate("/my-trips");
  };

  const handleLogout = () => {
    dispatch(setLogoutUser(null));
    dispatch(setAuthToken(null));
    if (typeof window !== "undefined") localStorage.removeItem("token");
    clearTravelUser();
    setDrawer(false);
  };

  const Avatar = ({  fontSize = 12 }) =>
    userImage ? (
      <Box
        component="img"
        src={userImage}
        alt={userName || "User"}
        sx={{
          width: "40px",
          height: "35px",
          borderRadius: "50%",
          objectFit: "contain",
        }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    ) : (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          bgcolor: GREEN,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize,
        }}
      >
        {(userName || "U").charAt(0).toUpperCase()}
      </Box>
    );

  return (
    <>
      <Box
        role="banner"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1150,
          bgcolor: "#ffffff",
          borderBottom: "1px solid #e0e0e0",
          // boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Box
          sx={{
            maxWidth: 1260,
            mx: "auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: { xs: 2, md: 4 },
            minHeight: { xs: 56, md: 60 },
          }}
        >
          <Box
            component="a"
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              mr: { xs: "auto", md: 2 },
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src="/navbaricons/dealplexlogo.svg"
              alt="Dealplex"
              sx={{ height: { xs: 28, md: 32 }, objectFit: "contain" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </Box>

          {!isMobile && showCategories && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {CATEGORIES.map((cat) => {
                const isActive = location.pathname === cat.path;
                return (
                  <Box
                    key={cat.label}
                    onClick={() => navigate(cat.path)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.6,
                      px: 1.6,
                      py: 0.8,
                      cursor: "pointer",
                      borderRadius: "8px",
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <Box
                      component="img"
                      src={cat.img}
                      alt={cat.label}
                      sx={{ width: 20, height: 20, objectFit: "contain" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? GREEN : "#444",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                ml: "auto",
              }}
            >
              {RIGHT_ITEMS.map((item) => (
                <Box
                  key={item.label}
                  onClick={() => handleRightItemClick(item.label)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.3,
                    py: 0.8,
                    cursor: "pointer",
                    borderRadius: "8px",
                    transition: "background 0.15s",
                    "&:hover": { bgcolor: "#f5f5f5" },
                  }}
                >
                  <Box sx={{ color: "#555" }}>{item.icon}</Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#333",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              ))}

              {mounted &&
                (!isLoggedIn ? (
                  <Button
                    variant="outlined"
                    startIcon={<PersonOutlinedIcon sx={{ fontSize: 17 }} />}
                    onClick={onLoginClick}
                    sx={{
                      ml: 1,
                      borderRadius: "8px",
                      borderColor: GREEN,
                      color: GREEN,
                      fontWeight: 600,
                      fontSize: 12.5,
                      textTransform: "none",
                      px: 1.8,
                      py: 0.7,
                      whiteSpace: "nowrap",
                      "&:hover": {
                        borderColor: "#15803d",
                        bgcolor: "#f0fdf4",
                      },
                    }}
                  >
                    Login / Signup
                  </Button>
                ) : (
                  <Box
                    onClick={onProfileClick}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.7,
                      ml: 1,
                      cursor: "pointer",
                      px: 1,
                      py: 0.5,
                      borderRadius: "8px",
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <Avatar size={26} fontSize={12} />
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#333",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {userName || "Account"}
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}

          {isMobile && (
            <IconButton
              onClick={() => setDrawer(true)}
              sx={{ color: "#333" }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawer(false)}
        sx={{ zIndex: 1400 }}
      >
        <Box sx={{ width: 260, pt: 2 }}>
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Box
              component="img"
              src="/navbaricons/dealplexlogo.svg"
              alt="Dealplex"
              sx={{ height: 34, objectFit: "contain" }}
            />
          </Box>
          <Divider />

          {!hideCategoriesInDrawer && (
            <List dense>
              {CATEGORIES.map((cat) => {
                const isActive = location.pathname === cat.path;
                return (
                  <ListItem key={cat.label} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(cat.path);
                        setDrawer(false);
                      }}
                      sx={{
                        gap: 1.5,
                        bgcolor: isActive ? "#f0fdf4" : "transparent",
                      }}
                    >
                      <Box
                        component="img"
                        src={cat.img}
                        alt={cat.label}
                        sx={{ width: 26, height: 26, objectFit: "contain" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <ListItemText
                        primary={cat.label}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? GREEN : "#333",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}

          <Divider />

          <List dense>
            {RIGHT_ITEMS.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  onClick={() => {
                    handleRightItemClick(item.label);
                    setDrawer(false);
                  }}
                  sx={{ gap: 1.5 }}
                >
                  <Box sx={{ color: "#555" }}>{item.icon}</Box>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#333",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider />

          {mounted && (
            <Box sx={{ px: 2, py: 2 }}>
              {!isLoggedIn ? (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PersonOutlinedIcon />}
                  onClick={() => {
                    onLoginClick?.();
                    setDrawer(false);
                  }}
                  sx={{
                    borderRadius: "8px",
                    borderColor: GREEN,
                    color: GREEN,
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#15803d",
                      bgcolor: "#f0fdf4",
                    },
                  }}
                >
                  Login / Signup
                </Button>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar size={32} fontSize={13} />
                    <Typography
                      sx={{ fontSize: 14, fontWeight: 600, color: "#333" }}
                    >
                      {userName || "Account"}
                    </Typography>
                  </Box>
                  <IconButton onClick={handleLogout} title="Logout">
                    <LogoutOutlinedIcon sx={{ fontSize: 20, color: "#888" }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default StickyNavbar;