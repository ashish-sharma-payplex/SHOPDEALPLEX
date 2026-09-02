import * as React from "react";
import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import { CustomBoxFullWidth } from "../styled-components/CustomStyles.style";
import { useTranslation } from "react-i18next";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Chip, Stack, Typography } from "@mui/material";

const ItemSelectWithChip = (props) => {
  const { showingTitle, title, data, handleChange, isOpen, onToggle } = props;
  const [selected, setSelected] = useState(null);
  const { t } = useTranslation();
  const onToggleRef = useRef(onToggle);

  useEffect(() => {
    if (!isOpen) return undefined;

    let active = false;
    let baselineScrollY = window.scrollY;

    const armTimer = setTimeout(() => {
      baselineScrollY = window.scrollY;
      active = true;
    }, 150);

    const handleScroll = () => {
      if (!active) return;
      if (Math.abs(window.scrollY - baselineScrollY) > 4) {
        onToggleRef.current?.();
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      clearTimeout(armTimer);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [isOpen]);

  const handleClick = () => {
    onToggle(); // Toggle the dropdown open state passed from parent
  };

  const handleClickItem = (value) => {
    setSelected(value); // Update the selected value
    onToggle(); // Close the dropdown after selection
    handleChange?.(value); // Pass the selected value to the parent
  };

  const handleDelete = () => {
    setSelected(null); // Reset the selected value
    handleChange?.(null); // Reset the value in the parent component
  };

  return (
    <CustomBoxFullWidth sx={{ position: "relative", width: "100%", my: 3 }}>
      {/* Title Section with Gradient Line */}
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        spacing={2}
        mt={4}
        mb={2.5}
      >
        <Typography
          fontSize="18px"
          fontWeight={600}
          color="#000"
          whiteSpace="nowrap"
        >
          {t(showingTitle)} {/* Display only showingTitle */}
        </Typography>
        <Stack
          flex={1}
          height="3px"
          sx={{
            background:
              "linear-gradient(to right, #e0e0e0 0%, #e0e0e0 60%, rgba(224,224,224,0) 100%)",
          }}
        />
      </Stack>

      {/* Button for Dropdown */}
      <Button
        id="fade-button"
        aria-controls={isOpen ? "dropdown-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen ? "true" : undefined}
        onClick={handleClick}
        fullWidth
        sx={{
          border: "1px solid #e0e0e0",
          padding: "13px 16px",
          color: "#3f3f3f",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textTransform: "capitalize",
          background: "#fff",
          borderRadius: "10px",
        }}
      >
        {t(title)} {/* Display showingTitle in the button as well */}
        {isOpen ? (
          <KeyboardArrowDownIcon
            sx={{ fontSize: "30px", verticalAlign: "middle" }}
          />
        ) : (
          <KeyboardArrowRightIcon
            sx={{ fontSize: "30px", verticalAlign: "middle" }}
          />
        )}
      </Button>

      {/* Dropdown List */}
      {isOpen && (
        <div
          id="dropdown-menu"
          style={{
            position: "absolute", // Position the dropdown within the parent
            top: "100%", // Place it below the button
            left: 0,
            right: 0,
            width: "100%", // Ensure dropdown takes full width
            border: "1px solid #e0e0e0",
            backgroundColor: "#fff",
            zIndex: 2,
            maxHeight: "200px",
            overflowY: "auto", // Allow scrolling if the list is too long
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
          }}
        >
          {data?.map((item, index) => (
            <React.Fragment key={index}>
              <div
                onClick={() => handleClickItem(item)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f0f0f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fff")
                }
              >
                {t(item)}
              </div>

              {/* Divider (skip last item) */}
              {index !== data.length - 1 && (
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#e0e0e0",
                    margin: "0 10px",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Selected Item Chip */}
      {selected && (
        <Chip
          sx={{
            mt: "10px",
            ml: "15px",
            backgroundColor: "#f5f5f5",
            color: "#3f3f3f",
            borderRadius: "16px",
          }}
          label={t(selected)}
          onDelete={handleDelete} // Allow deleting the selected value
        />
      )}
    </CustomBoxFullWidth>
  );
};

export default ItemSelectWithChip;
