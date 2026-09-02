import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, Divider, Grid } from '@mui/material';
import { useRouter } from 'next/router';

const Blogsession = () => {
  const [promoData, setPromoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4); // To show only 4 cards initially
  const router = useRouter();

  useEffect(() => {
    // Fetch blog data from API
    const fetchBlogData = async () => {
      try {
        const response = await fetch('https://dealplex.in/api/v1/blogs');
        const data = await response.json();

        // console.log("API Response Data:", data); // Log the API response to check the structure

        // Check if the response has the data array and set it to state
        if (data.status === "success" && Array.isArray(data.data)) {
          setPromoData(data.data); // Set the API blog data
        } else {
          // console.error("Expected 'data' array but got:", data);
          setPromoData([]); // Fallback to empty array if data is not in the expected format
        }

        setLoading(false);
      } catch (error) {
        // console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 4); // Load 4 more cards when clicked
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(45deg, #e1caf9ff, #88d7f1ff)', // Gradient background
        padding: 3,
        minHeight: '90vh',
        width:'100%'
      }}
    >
      <Grid container spacing={3} > {/* Increased spacing between the cards */}
        {promoData.slice(0, visibleCount).map((promo, index) => (
          <Grid item xs={12} sm={6} md={4} key={promo.id}> 
            <Box
sx={{
  background: "#fff",
  border: "none",
  borderRadius: 0,
  boxShadow: "none",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  cursor: "pointer",
  transition: "0.25s",

  "&:hover": {
    transform: "translateY(-3px)",
  },
}}
            >
              {/* Image */}
              <Box
                component="img"
                src={promo.thumbnail}  // Using the 'thumbnail' field
                alt={promo.title}
sx={{
  width: "100%",
  height: "220px",
  objectFit: "cover",
  marginBottom: 2,
}}
              />
              {/* Title */}
              <Typography
  sx={{
    fontSize: "30px",
    fontWeight: 500,
    lineHeight: 1.35,
    color: "#1d1d1f",
    mb: 1,
  }}
>
  {promo.title}
</Typography> sx={{color:'black'}}
              
              {/* <Stack direction="row" spacing={2} mt="auto">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => router.push(`/blog/${promo.slug}`)} // Using 'id' for routing
                >
                  Read More
                </Button>
              </Stack> */}
              <Typography
  sx={{
    color: "#888",
    fontSize: "15px",
    mb: 2,
  }}
>
  {promo.publisher_name} |{" "}
  {new Date(promo.published_at).toLocaleDateString()}
</Typography>

<Typography
  sx={{
    color: "#888",
    fontSize: "15px",
    mb: 2,
  }}
>
  {promo.reading_time} min read
</Typography>

<Button
  variant="text"
  sx={{
    color: "rgb(26,145,75)",
    padding: 0,
    justifyContent: "flex-start",
    textTransform: "none",
    fontWeight: 600,
    width: "fit-content",
  }}
  onClick={() => router.push(`/blog/${promo.slug}`)}
>
  Read More
</Button>

            </Box>
          </Grid>
        ))}
      </Grid>

      {/* See More Button BELOW all cards */}
      <Box sx={{ textAlign: 'center', marginTop: 4 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => router.push('/blog')} // Navigate to /blogs page
        >
          See More
        </Button>
      </Box>
    </Box>
  );
};

export default Blogsession;
