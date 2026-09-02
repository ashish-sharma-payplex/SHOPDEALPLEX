import React from "react";
import { Box, Collapse, useMediaQuery } from "@mui/material";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { useTheme } from "@mui/material/styles";

const CategoryNavbar = ({
  selectedCategory,
  setSelectedCategory,
  router,
  categoryRoutes,

  // NEW — controlled by TopHeaderBar
  openCategoryMenu,
  setOpenCategoryMenu,

  // ✅ Travels ke liye special handler
  onTravelsClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // <600px
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600–900px

  const categories = [
    { name: "Home", icon: "/icons/home.svg" },
    { name: "Grocery", icon: "/icons/grosary.svg" },
    { name: "Pharmacy", icon: "/icons/pharma.svg" },
    { name: "Food", icon: "/icons/food.svg" },
    { name: "Travels", icon: "/icons/travel.svg" },
    { name: "Parcel", icon: "/icons/parcel.svg" },
    { name: "Rental", icon: "/icons/rent.svg" },
    // { name: "Handyman", icon: "/icons/handi.svg" },
    { name: "Utility", icon: "/icons/utility.svg" },
  ];

  // Dynamic sizing
  const fontSize = isMobile ? "12px" : isTablet ? "14px" : "15px";
  const activeFontSize = isMobile ? "14px" : isTablet ? "15px" : "17px";
  const iconSize = isMobile ? "12px" : "14px";

  // ✅ Single place jaha decide hota hai ki category click pe kya karna hai
  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat.name);

    if (cat.name === "Travels") {
      // Travels ke liye alag flow — query param wale user data ke saath external redirect
      onTravelsClick?.();
    } else {
     const route = categoryRoutes[cat.name];
if (route) {
  router.push(route, undefined, { shallow: true });
} else {
  // console.warn(`⚠️ No route defined for category: ${cat.name}`);
}
    }

    if (isMobile) setOpenCategoryMenu(false); // auto-close menu
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#fff",
        borderBottom: "1px solid #ececec",
        padding: isMobile ? "0px" : "10px 30px",
      }}
    >
      {/* ------------------------------------------------------
           MOBILE — Only show dropdown when toggled ON
         ------------------------------------------------------ */}
      <Collapse in={!isMobile || openCategoryMenu} timeout={300}>
        <CustomStackFullWidth
          direction={isMobile ? "column" : "row"}
          alignItems="flex-start"
          justifyContent="flex-start"
          sx={{ width: "100%", padding: isMobile ? "8px 15px" : 0 }}
        >
          <ul
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              listStyle: "none",
              gap: isMobile ? "14px" : "25px",
              margin: 0,
              padding: 0,
              width: "100%",
            }}
          >
            {categories.map((cat) => (
              <li
                key={cat.name}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  transition: "0.3s",
                  color: selectedCategory === cat.name ? "green" : "black",
                  fontSize:
                    selectedCategory === cat.name ? activeFontSize : fontSize,
                  fontWeight: selectedCategory === cat.name ? "600" : "400",
                  padding: isMobile ? "6px 0" : 0,
                }}
              >
                <img
                  src={cat.icon}
                  alt={cat.name}
                  style={{
                    width: iconSize,
                    height: iconSize,
                    marginRight: "2px",
                    filter:
                      selectedCategory === cat.name
                        ? "brightness(0) saturate(100%) invert(46%) sepia(99%) saturate(406%) hue-rotate(86deg)"
                        : "none",
                  }}
                />
                {cat.name}
              </li>
            ))}
          </ul>
        </CustomStackFullWidth>
      </Collapse>
    </Box>
  );
};

export default CategoryNavbar;