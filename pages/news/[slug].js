import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, Typography, Container, Grid, CircularProgress } from "@mui/material";

const NewsPost = () => {
  const router = useRouter();
  const { slug } = router.query; // Get 'slug' from the query params

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return; // Don't fetch until slug is available

    const fetchNews = async () => {
      setLoading(true);
      try {
        // Fetch data for a specific news post using the slug
        const response = await fetch(`https://dealplex.in/api/v1/news/${slug}`);
        const data = await response.json();
        // console.log("API Response:", data);

        if (data.status === "success" && data.data) {
          // Map the data to match the required structure
          const mappedNews = {
            id: data.data.id,
            title: data.data.title || "Untitled News", // Fallback for missing title
            short_description: data.data.short_description || "No description available.", // Fallback for missing description
            slug: data.data.slug,
            thumbnail: data.data.thumbnail || "/default-thumbnail.png", // Fallback for missing thumbnail
            publisher_name: data.data.publisher_name || "Unknown Publisher", // Default value for publisher
            publish_time: data.data.published_at,
            reading_time: data.data.reading_time || "N/A", // Default to 'N/A' if missing
            gallery_images: data.data.gallery_images || [], // Ensure gallery_images exist
            content: data.data.content || "No content available.", // Default content if missing
          };

          setNews(mappedNews); // Set the mapped data to state
        } else {
          setError(true); // Handle unsuccessful response
        }
      } catch (error) {
        // console.error("Error fetching news:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [slug]); // Re-fetch whenever the slug changes

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }} align="center">
        <CircularProgress />
        <Typography variant="h4" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  if (error || !news) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          News post not found
        </Typography>
        <Typography variant="body1" align="center">
          The news post you are looking for does not exist or an error occurred.
        </Typography>
      </Container>
    );
  }

  // Fix: Format the date properly using a check
  const formattedDate = new Date(news.publish_time);
  const displayDate = isNaN(formattedDate) ? "Unknown Date" : formattedDate.toLocaleDateString();

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {news.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {news.publisher_name} • {news.publish_time} • {news.reading_time} min read
        </Typography>
        <Box
          component="img"
          src={news.thumbnail}
          alt={news.title}
          sx={{
            width: "100%",
            height: "auto",
            borderRadius: 2,
            mb: 4,
            objectFit: "cover",
          }}
        />
        <Typography variant="body1" paragraph>
          {news.short_description}
        </Typography>
        <Typography variant="body2" paragraph>
          {news.content}
        </Typography>

        {/* Gallery Images */}
        {news.gallery_images && news.gallery_images.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Image Gallery
            </Typography>
            <Grid container spacing={2}>
              {news.gallery_images.map((image, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box
                    component="img"
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    sx={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 2,
                      objectFit: "cover",
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </>
  );
};

export default NewsPost;
