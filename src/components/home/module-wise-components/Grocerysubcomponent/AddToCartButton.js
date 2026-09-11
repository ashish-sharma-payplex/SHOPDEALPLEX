// components/AddToCartButton.js

import React from "react";
import { Button, Box, Typography } from "@mui/material";

// AddToCartButton handles Add, Increment, and Decrement actions
const AddToCartButton = ({
  item,
  cartItem,
  addingProductId,
  onAdd,
  onIncrement,
  onDecrement,
}) => {
  if (!cartItem) {
    return (
      <Button
        variant="outlined"
        size="small"
        disabled={addingProductId === item.id}
        onClick={(e) => {
          e.stopPropagation();
          onAdd(item);
        }}
        sx={{
          borderRadius: "4px",
          fontSize: "13px",
          minWidth: "58px",
          color: "var(--grocery-accent-green)",
          border: "1.8px solid var(--grocery-accent-green)",
        }}
        x
      >
        {addingProductId === item.id ? "..." : "ADD"}
      </Button>
    );
  }

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100px",
        height: "34px",
        border: "1.8px solid var(--grocery-accent-green)",
        borderRadius: "6px",
      }}
    >
      <Box
        onClick={() => onDecrement(cartItem)}
        sx={{ px: 1, cursor: "pointer", fontSize: "18px" }}
      >
        −
      </Box>

      <Typography fontWeight={600}>{cartItem.quantity}</Typography>

      <Box
        onClick={() => onIncrement(cartItem)}
        sx={{ px: 1, cursor: "pointer", fontSize: "18px" }}
      >
        +
      </Box>
    </Box>
  );
};

export default AddToCartButton;
