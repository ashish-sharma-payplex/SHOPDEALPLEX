import React from "react";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { CATEGORIES, GREEN } from "components/travel-hooks/my-trips/constants";

const Sidebar = ({ selectedCategory, onCategorySelect, onSelect }) => {
  return (
    <>
      <Box sx={{ p: 2.5, pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarMonthIcon sx={{ fontSize: 24, color: GREEN }} />
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--mb-text-strong)",
            }}
          >
            My Trips
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ p: 0 }}>
        {CATEGORIES.map((category) => (
          <ListItem
            key={category.label}
            disablePadding
            onClick={() => {
              onCategorySelect(category.label);
              if (onSelect) onSelect();
            }}
            sx={{
              bgcolor:
                selectedCategory === category.label
                  ? "var(--mb-brand-soft-bg)"
                  : "transparent",
            }}
          >
            <ListItemButton
              sx={{
                py: 1.5,
                px: 2,
                borderLeft:
                  selectedCategory === category.label
                    ? `3px solid ${GREEN}`
                    : "3px solid transparent",
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: "var(--mb-surface-subtle)" },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color:
                    selectedCategory === category.label
                      ? GREEN
                      : "var(--mb-text-faint)",
                }}
              >
                {category.icon}
              </ListItemIcon>
              <ListItemText
                primary={category.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: selectedCategory === category.label ? 700 : 500,
                  color:
                    selectedCategory === category.label
                      ? GREEN
                      : "var(--mb-text-body)",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default Sidebar;
