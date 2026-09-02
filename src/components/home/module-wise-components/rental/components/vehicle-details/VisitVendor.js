/* -------------------------------------------------------------------------- */
/*                                 VENDOR CARD                                 */
/* -------------------------------------------------------------------------- */

const VendorCard = ({ vehicleDetails }) => {
  const theme = useTheme();

  return (
    <RentalCardWrapper
      padding="18px"
      borderRadius="14px"
      sx={{
        border: "1px solid #E5E7EB",
        boxShadow:
          "0px 6px 20px rgba(0,0,0,0.04)",
      }}
    >

      {/* Top Row */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">

        {/* Left Side → Logo + Name + Rating */}
        <Stack direction="row" spacing={1.8} alignItems="center">

          {/* Logo Circle */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              overflow: "hidden",
            }}
          >
            <CustomImageContainer
              src={vehicleDetails?.provider?.logo_full_url}
              alt={vehicleDetails?.provider?.name || "Provider Logo"}
              title={vehicleDetails?.provider?.name || "Provider Logo"}
              width="48px"
              height="48px"
              objectfit="cover"
            />
          </Box>

          {/* Text */}
          <Box>
            <Typography fontSize="16px" fontWeight="700">
              {vehicleDetails?.provider?.name}
            </Typography>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <StarIcon sx={{ fontSize: 16, color: "#FFA500" }} />
              <Typography fontSize="14px" fontWeight="600">
                {vehicleDetails?.provider?.avg_rating}
              </Typography>
              <Typography fontSize="13px" color="#6B7280">
                ({vehicleDetails?.provider?.rating_count} Reviews)
              </Typography>
            </Stack>
          </Box>

        </Stack>

        {/* Wishlist Icon */}
        <IconButton
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: "50%",
            padding: "6px",
          }}
        >
          <FavoriteBorderIcon sx={{ color: "#444" }} />
        </IconButton>

      </Stack>

      {/* Middle Stats */}
      <Grid container spacing={2} mt={2} mb={2}>
        <Grid item xs={6}>
          <Typography fontSize="13px" color="#6B7280">
            Response Time
          </Typography>
          <Typography fontSize="15px" fontWeight="600">
            Within 1 hour
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography fontSize="13px" color="#6B7280">
            Total Vehicle
          </Typography>
          <Typography fontSize="15px" fontWeight="600">
            45+ Cars
          </Typography>
        </Grid>
      </Grid>

      {/* Visit Vendor Button */}
      <Box
        sx={{
          width: "100%",
          border: "1px solid #16A34A",
          color: "#16A34A",
          fontWeight: 600,
          textAlign: "center",
          padding: "10px",
          borderRadius: "8px",
          cursor: "pointer",
          "&:hover": {
            background: "#16A34A",
            color: "#fff",
          },
        }}
        onClick={() =>
          (window.location.href = `/rental/provider-details/${vehicleDetails?.provider?.id}`)
        }
      >
        Visit Vendor
      </Box>

    </RentalCardWrapper>
  );
};
