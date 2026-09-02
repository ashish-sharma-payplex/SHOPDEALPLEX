import React from "react";
import { Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

const StepProgress = ({ activeStep, onStepClick }) => {
  const steps = ["Parcel Details", "Pickup & Drop Details", "Checkout"];

  return (
    <Box display="flex" justifyContent="center" alignItems="center" sx={{
      py: 1.5,
      mt: 0,
      width: "100%",
      // overflowX: { xs: "auto", sm: "visible" },
    }}>

      <Box
        display="flex"
        alignItems="center"
        sx={{
          flexDirection: "row",
          justifyContent: "center",
          gap: {xs:0,sm:4}, // clean spacing between steps
          width: "100%",
        }}
      >
        {steps.map((label, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;

          const color = isActive ? "#2e7d32" : isCompleted ? "#000" : "#ccc";

          return (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              onClick={() => {
                // ✅ only go back allowed
                if (index < activeStep) {
                  onStepClick(index);
                }
              }}
              sx={{
                cursor: isCompleted ? "pointer" : "default", // 👈 UX
              }}
            >
              {/* STEP */}
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  flexDirection: { xs: "column", sm: "row" }, // 📱 mobile = column, 💻 = row
                }}
              >
                {/* ✅ COMPLETED STEP */}
                {isCompleted ? (
                  <Box
                    sx={{
                      width: 35,
                      height: 35,
                      borderRadius: "50%",
                      backgroundColor: "#e6f4ea",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckIcon
                      sx={{
                        color: "#1f8f4a",
                        fontSize: 20,
                      }}
                    />
                  </Box>
                ) : (
                  /* 🔵 ACTIVE / INACTIVE STEP */
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: `6px solid ${color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                      }}
                    />
                  </Box>
                )}

                <Typography
                  sx={{
                    ml: { xs: 0, sm: 1.5 },
                    mt: { xs: 1, sm: 0 }, // mobile me niche aa jayega
                    fontWeight: 500,
                    color: color,
                    textAlign: "center",
                    whiteSpace: "nowrap", // ek line me rakhega
                  }}
                >
                  {label}
                </Typography>
              </Box>

              {/* ARROWS */}
              {index !== steps.length - 1 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    ml: { xs: 0, sm: 2 },
                    mr: { xs: 1, sm: 0 },
                    mt: { xs: -1, sm: 0 },
                  }}
                >
                  {/* Arrow 1 */}
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderTop: `2px solid ${color}`,
                      borderRight: `2px solid ${color}`,
                      transform: "rotate(45deg)",
                      mr: "-2px",
                    }}
                  />

                  {/* Arrow 2 */}
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderTop: `2px solid ${color}`,
                      borderRight: `2px solid ${color}`,
                      transform: "rotate(45deg)",
                    }}
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default StepProgress;
