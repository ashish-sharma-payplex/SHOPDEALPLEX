import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import SEO from "../../src/components/seo";
import { getImageUrl } from "utils/CustomFunctions";
import { Box, Typography, Grid, Container, Skeleton } from "@mui/material";
import Link from "next/link";

// News Card Component
const NewsCard = ({ news }) => {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        height: "100%",
        transition: "transform 0.3s",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 3,
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          paddingTop: "66%", // 3:2 Aspect ratio
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={news.thumbnail}
          alt={news.title}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            mt: 1,
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          {news.title}
        </Typography>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: "medium", fontSize: "0.75rem" }}
        >
          {news.publisher_name} • {news.published_at}{" "}
          <span style={{ marginLeft: "8px" }}>{news.reading_time} min read</span>
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            fontSize: "1rem",
            lineHeight: "1.5",
            maxHeight: "100px", // Restrict height if text is too long
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {news.short_description}
        </Typography>
      </Box>
    </Box>
  );
};

// News Card Skeleton
const NewsCardSkeleton = () => {
  return (
    <Box sx={{ borderRadius: 2, height: "auto" }}>
      <Skeleton variant="rectangular" width="100%" height={0} sx={{ paddingTop: "66%", borderRadius: 2 }} />
      <Box sx={{ p: 2 }}>
        <Skeleton width="40%" height={20} />
        <Skeleton width="90%" height={28} sx={{ mt: 1 }} />
        <Skeleton width="100%" height={20} sx={{ mt: 1 }} />
        <Skeleton width="80%" height={20} />
      </Box>
    </Box>
  );
};

// News Header
const NewsHeader = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ py: 6, textAlign: "center", borderBottom: "1px solid", borderColor: "divider", mb: 6 }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: "bold", mb: 2, fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" } }}>
        {t("News")}
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ maxWidth: "800px", mx: "auto", px: 2, fontWeight: "normal" }}>
        {t("Explore our latest news and updates, and stay informed about what's happening around the world.")}
      </Typography>
    </Box>
  );
};

const NewsPage = ({ configData, landingPageData }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [newsList, setNewsList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null); // Reset error state before fetching new data
      try {
        const response = await fetch("https://dealplex.in/api/v1/news");
        
        if (!response.ok) {
          throw new Error("Failed to fetch news.");
        }

        const data = await response.json();
        
        // Check if data exists and map it correctly
        const mappedNews = data.data?.map((newsItem) => ({
          id: newsItem.id,
          title: newsItem.title,
          short_description: newsItem.short_description,
          slug: newsItem.slug,
          thumbnail: newsItem.thumbnail,
          publisher_name: newsItem.publisher_name,
          published_at: newsItem.published_at,
          reading_time: newsItem.reading_time || "N/A",
        }));

        setNewsList(mappedNews || []); // Default to empty array if no data
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <>
      <CssBaseline />
      <SEO
        title={t("News")}
        description={t("Explore our latest news and updates")}
        image={`${getImageUrl({ value: configData?.logo_storage }, "business_logo_url", configData)}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
      />
      <Container maxWidth="lg" marginBottom="100px">
        <NewsHeader />

        {/* Error Message */}
        {error && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="error">
              {t("An error occurred while fetching news:")} {error}
            </Typography>
          </Box>
        )}

        <Grid container spacing={4}>
          {loading ? (
            Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                <NewsCardSkeleton />
              </Grid>
            ))
          ) : newsList.length > 0 ? (
            newsList.map((newsItem) => (
              <Grid item xs={12} sm={6} md={4} key={newsItem.id}>
                <Link href={`/news/${newsItem.slug}`} passHref legacyBehavior>
                  <a style={{ textDecoration: "none" }}>
                    <NewsCard news={newsItem} />
                  </a>
                </Link>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6">{t("No news found.")}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default NewsPage;
