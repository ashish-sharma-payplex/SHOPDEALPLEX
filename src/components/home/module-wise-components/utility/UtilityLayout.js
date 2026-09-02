import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";

const sidebarItems = [
  { name: "Home", icon: "/utility/home.svg", key: "home" },
  { name: "Help & Support", icon: "/utility/helpsupport.svg", key: "help" },
  { name: "My Transactions", icon: "/utility/mytransactions.svg", key: "transactions" },
];

const UtilityLayout = ({ children, activeKey, onNavigate }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const router = useRouter();

  const handleNavigate = (key) => {
    if (onNavigate) {
      // index.js pe hai — direct state switch
      onNavigate(key);
    } else {
      // sub-pages pe hai — /utility pe redirect karo with section
      router.push(`/utility?section=${key}`);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2, gap: 2 }}>
      {!isMobile && (
        <Box
          sx={{
            width: 220,
            height: "350px" ,
            flexShrink: 0,
            alignSelf: "flex-start",
            position: "sticky",
            top: 0,
            p: 1,
            border: "1px solid #E3E8EE",
            borderRadius: "8px",
          }}
        >
          <Box sx={{ background: "#fff", borderRadius: "12px", p: 1 }}>
            {sidebarItems.map((item, i) => {
              const isActive = activeKey === item.key;
              return (
                <Box
                  key={i}
                  onClick={() => handleNavigate(item.key)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.2,
                    borderRadius: "8px",
                    mb: 1,
                    background: isActive ? "#eeeeee" : "transparent",
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
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {item.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Box>
  );
};

export default UtilityLayout;