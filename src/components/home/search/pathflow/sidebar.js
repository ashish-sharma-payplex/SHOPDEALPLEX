import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Box,
} from "@mui/material";
import MainApi from "../../../../api-manage/MainApi";
import { categories_Childes_api } from "../../../../api-manage/ApiRoutes";

const Sidebar = ({ catid, module_id, onSubCategorySelect }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [activeSubcategory, setActiveSubcategory] = useState("all");  // Set "All" as default active
  const [loading, setLoading] = useState(true);

  // console.log("📥 Sidebar Props:", {
  //   catid,
  //   module_id,
  // });

  // ✅ Fetch subcategories using MODULE only
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);

        const res = await MainApi.get(
          `${categories_Childes_api}/${catid}`,
          {
            headers: {
              moduleId: String(module_id),
            },
          }
        );

        const allOption = {
          id: "all",
          name: "All",
          image_full_url: "",
        };

        setSubCategories([allOption, ...(res?.data || [])]);
      } catch (error) {
        // console.error("❌ Error fetching subcategories:", error);
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };

    if (catid && module_id) {
      fetchSubcategories();
    }
  }, [catid, module_id]);

  // ✅ Handle subcategory selection
  const handleSubCategoryClick = (subCategoryId) => {
    // console.log("🟢 Subcategory clicked:", subCategoryId);

    setActiveSubcategory(subCategoryId);

    if (onSubCategorySelect) {
      onSubCategorySelect(subCategoryId);
      // console.log("📤 Sent subcategory to parent:", subCategoryId);
    }
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 250 },
        padding: 2,

        // mobile horizontal scroll
        overflowX: { xs: "auto", md: "visible" },
        overflowY: { xs: "hidden", md: "auto" },
      }}
    >

      <List
        sx={{
          display: { xs: "flex", md: "block" },
          flexDirection: { xs: "row", md: "column" },
          flexWrap: { xs: "nowrap", md: "nowrap" },
          overflowX: { xs: "auto", md: "visible" },
          padding: 0,
        }}
      >

        {!loading && subCategories.length > 0 ? (

          subCategories.map(({ id, name, image_full_url }) => {
            const isSelected = activeSubcategory === id;  // Highlight the selected subcategory

            return (
              <ListItem
                button
                key={id}
                selected={isSelected}
                onClick={() => handleSubCategoryClick(id)}
                sx={{
                  flex: { xs: "0 0 33.33%", md: "unset" }, // 👈 3 at a time
                  maxWidth: { xs: "33.33%", md: "100%" },
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                }}
              >




                <ListItemIcon>
                  <Avatar
                    src={image_full_url || "/path/to/default-avatar.jpg"}  // Optional fallback for "All"
                    alt={name}
                    sx={{
                      backgroundColor: "#FFFAE6", textAlign: "center", // 👈 center text
                    }}
                  />
                </ListItemIcon>

                <ListItemText
                  primary={name}
                  sx={{
                    textAlign: "Left",
                    width: "100%",
                    "& .MuiListItemText-primary": {
                      fontSize: "0.8rem",
                      whiteSpace: "normal",
                    },
                  }}
                />


              </ListItem>
            );
          })
        ) : !loading ? (
          <ListItem>
            <ListItemText primary="⚠️ No subcategories available" />
          </ListItem>
        ) : null}

      </List>

      <Divider />
    </Box>
  );
};

export default React.memo(Sidebar);
