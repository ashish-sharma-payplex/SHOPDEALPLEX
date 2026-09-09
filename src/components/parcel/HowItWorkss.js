import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import styles from "styles/Parcel.module.css";

const StepCard = ({ icon, step, title, description, isDark }) => (
  <Box sx={{ textAlign: "center", padding: "20px" }}>
    <Box
      sx={{
        backgroundColor: isDark ? "#1f2937" : "#F8FAFC",
        borderRadius: "12px",
        padding: "14px",
        marginBottom: 1.5,
        display: "inline-block",
      }}
    >
      {icon}
    </Box>

    <Typography
      className={isDark ? styles.textSecondaryDark : undefined}
      color={isDark ? undefined : "#777E90"}
      fontFamily={"Inter"}
      fontSize={{ xs: "0.7rem", md: "1rem" }}
      sx={{ mt: 1, mb: 1.5 }}
      fontweight={600}
    >
      {`Step ${step}`}
    </Typography>

    <Typography
      // variant="h5"
      className={isDark ? styles.textPrimaryDark : undefined}
      color={isDark ? undefined : "#204945"}
      fontFamily={"Inter"}
      sx={{
        fontWeight: 600,
        mb: 1,
        fontSize: { xs: "0.8rem", sm: "0.9rem", md: "20px" },
      }}
    >
      {title}
    </Typography>

    <Typography
      variant="body2"
      className={isDark ? styles.textSecondaryDark : undefined}
      sx={{
        width: "80%",
        margin: "0 auto",
        lineHeight: 1.5,
        color: isDark ? undefined : "#777E90",
        fontSize: { xs: "0.85rem", sm: "0.9rem", md: "16px" },
        fontWeight: 400,
        fontFamily: "Inter",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {description}
    </Typography>
  </Box>
);

const DeliverySteps = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: { xs: "16px", sm: "24px" },
        mb: 6,
        mt: -6,
        // border:"1px solid red"
      }}
    >
      {/* === Upper Two Lines === */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h4"
          fontFamily={"Inter"}
          fontWeight={500}
          className={isDark ? styles.textPrimaryDark : undefined}
          color={isDark ? undefined : "#000000"}
          mb={1}
        >
          How It Works
        </Typography>
        <Typography
          fontSize={"20px"}
          fontFamily={"Inter"}
          fontWeight={500}
          className={isDark ? styles.textSecondaryDark : undefined}
          color={isDark ? undefined : "#767676"}
        >
          Book your parcel in just 3 quick steps — fast, easy, and hassle-free
        </Typography>
      </Box>

      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ marginTop: 4 }}
        direction={{ xs: "column", sm: "row" }}
      >
        {/* STEP 1 */}
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <StepCard
            isDark={isDark}
            icon={
              <img
                src="/step1.svg"
                alt="Browse & Select"
                title="Browse & Select"
                style={{ width: 50, height: 50, objectFit: "contain" }}
              />
            }
            step="1"
            title="Browse & Select"
            description="Choose your parcel type and the most suitable vehicle for your delivery."
          />
        </Grid>

        {/* STEP 2 */}
        <Grid
          item
          xs={12}
          sm={4}
          sx={{
            display: "flex",
            justifyContent: "center",
            paddingLeft: { sm: "32px", xs: 0 },
            position: "relative",

            "&::before": {
              content: '""',
              position: "absolute",
              left: { sm: "8px", xs: "0" },
              top: "10%",
              height: "80%",
              width: "1px",
              backgroundImage: `
                repeating-linear-gradient(
                  to bottom,
                  #c2c2a3 0px,
                  #c2c2a3 14px,
                  transparent 14px,
                  transparent 24px
                )
              `,
            },
          }}
        >
          <StepCard
            icon={
              <img
                src="/step2.svg"
                alt="Schedule & Confirm"
                title="Schedule & Confirm"
                style={{ width: 50, height: 50, objectFit: "contain" }}
              />
            }
            isDark={isDark}
            step="2"
            title="Schedule & Confirm"
            description="Add pickup and drop locations, review transparent pricing, and confirm your booking instantly.."
          />
        </Grid>

        {/* STEP 3 */}
        <Grid
          item
          xs={12}
          sm={4}
          sx={{
            display: "flex",
            justifyContent: "center",
            paddingLeft: { sm: "32px", xs: 0 },
            position: "relative",

            "&::before": {
              content: '""',
              position: "absolute",
              left: { sm: "8px", xs: "0" },
              top: "10%",
              height: "80%",
              width: "1px",
              backgroundImage: `
                repeating-linear-gradient(
                  to bottom,
                  #c2c2a3 0px,
                  #c2c2a3 14px,
                  transparent 14px,
                  transparent 24px
                )
              `,
            },
          }}
        >
          <StepCard
            icon={
              <img
                src="/step3.png"
                alt="Track & Receive"
                title="Track & Receive"
                style={{ width: 50, height: 50, objectFit: "contain" }}
              />
            }
            isDark={isDark}
            step="3"
            title="Track & Receive"
            description="Follow your delivery in real-time until it safely reaches the destination."
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeliverySteps;
