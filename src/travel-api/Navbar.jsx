import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
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
  { label: "Offers", icon: <LocalOfferOutlinedIcon sx={{ fontSize: 18 }} /> },
  { label: "Support", icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 18 }} /> },
  {
    label: "My Trips",
    icon: <LuggageOutlinedIcon sx={{ fontSize: 18 }} />,
    subtitle: "Manage Booking",
  },
];

const CATEGORIES = [
  { label: "Flights", img: "/navbaricons/flightslogo.svg", path: "/flights" },
  { label: "Hotels", img: "/navbaricons/hotelslogo.svg", path: "/hotels" },
  { label: "Buses", img: "/navbaricons/buseslogo.svg", path: "/buses" },
];

/**
 * @param {boolean}  scrolled       - hides this bar once the page scrolls (StickyNavbar takes over)
 * @param {string}   token          - Redux `state.auth.token` — same as rest of site
 * @param {string}   userName       - derived from `state.profileInfo.profileInfo`
 * @param {string}   userImage      - derived from `state.profileInfo.profileInfo`
 * @param {function} onLoginClick   - opens the shared <AuthModal/>
 * @param {function} onProfileClick - opens the shared <AccountPopover/> (desktop)
 */
const Navbar = ({
  scrolled,
  token,
  userName,
  userImage,
  onLoginClick,
  onProfileClick,
}) => {
  const [drawerOpen, setDrawer] = useState(false);

  // ✅ HYDRATION FIX — server render aur first client-paint mein auth-dependent
  // UI (login button vs profile) ko hide rakhte hain. Server ko token/userImage
  // ka pata nahi hota (cookie/localStorage server pe access nahi), toh agar hum
  // seedha isLoggedIn ke basis pe render karein, server "Login" bhejega aur
  // client turant "Profile" render karega — React ismein mismatch dekh ke
  // poori tree crash kar deta hai (blank white screen). mounted=true tabhi
  // hota hai jab browser mein useEffect chal chuka ho — tab tak dono taraf
  // same (null) render hota hai, koi mismatch nahi.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isLoggedIn = Boolean(token);

  // Hotels page pe CategoryTabs already hai — duplicate mat dikha
  const hideCategories =
    location.pathname.startsWith("/hotels/results") ||
    location.pathname.startsWith("/hotels/details");

  const handleRightItemClick = (label) => {
    if (label === "My Trips") navigate("/my-trips");
  };

  // ✅ Same logout behaviour as the main site's account-popover Menu.js
  const handleLogout = () => {
    dispatch(setLogoutUser(null));
    dispatch(setAuthToken(null));
    if (typeof window !== "undefined") localStorage.removeItem("token");
    clearTravelUser();
    setDrawer(false);
  };

 
  const Avatar = () =>
    userImage ? (
      <Box
        component="img"
        src={userImage}
        alt={userName || "User"}
        sx={{
          width: "26px",
          height: "26px",
          borderRadius: "50%",
          objectFit: "cover",
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
          fontSize:"12px",
        }}
      >
        {(userName || "U").charAt(0).toUpperCase()}
      </Box>
    );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          bgcolor: "#ffffff",
          color: "#1a1a1a",
          transform: scrolled ? "translateY(-100%)" : "translateY(0)",
          opacity: scrolled ? 0 : 1,
          visibility: scrolled ? "hidden" : "visible",
          transition:
            "transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease",
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{ px: { xs: 2, md: 4 }, minHeight: "64px !important", gap: 1 }}
        >
          {/* Logo */}
          <Box
            component="a"
            href="/home"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              mr: 2,
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src="/navbaricons/dealplexlogo.svg"
              alt="Dealplex"
              sx={{ height: 38, objectFit: "contain" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </Box>

          {/* Desktop Right Side */}
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
                    gap: 0.6,
                    px: 1.5,
                    py: 0.8,
                    cursor: "pointer",
                    borderRadius: "8px",
                    transition: "background 0.15s",
                    "&:hover": { bgcolor: "#f5f5f5" },
                  }}
                >
                  <Box sx={{ color: "#555" }}>{item.icon}</Box>
                  <Box>
                    {item.subtitle && (
                      <Typography
                        sx={{
                          fontSize: 10,
                          color: GREEN,
                          fontWeight: 600,
                          lineHeight: 1,
                          mb: 0.1,
                        }}
                      >
                        {item.subtitle}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#333",
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {/* ✅ Login/Signup — real shopdealplex auth. Mount hone tak
                  kuch bhi render nahi karte (hydration-safe). */}
              {mounted &&
                (!isLoggedIn ? (
                  <Button
                    variant="outlined"
                    startIcon={<PersonOutlinedIcon sx={{ fontSize: 18 }} />}
                    onClick={onLoginClick}
                    sx={{
                      ml: 1,
                      borderRadius: "8px",
                      borderColor: GREEN,
                      color: GREEN,
                      fontWeight: 600,
                      fontSize: 13,
                      textTransform: "none",
                      px: 2,
                      py: 0.8,
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
                      gap: 0.8,
                      ml: 1,
                      cursor: "pointer",
                      px: 1,
                      py: 0.6,
                      borderRadius: "8px",
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <Avatar size={30} fontSize={13} />
                    <Typography
                      sx={{
                        fontSize: 13.5,
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

          {/* Mobile Hamburger */}
          {isMobile && (
            <IconButton
              onClick={() => setDrawer(true)}
              sx={{ ml: "auto", color: "#333" }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
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

          {/* Mobile Categories — hotels results/details pe hide */}
          {!hideCategories && (
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

          {/* ✅ Login/Signup or logged-in user — real shopdealplex auth.
              Mount hone tak kuch bhi render nahi karte (hydration-safe). */}
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

export default Navbar;