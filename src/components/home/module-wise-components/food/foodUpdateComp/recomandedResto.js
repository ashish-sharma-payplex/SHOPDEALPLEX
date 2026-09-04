import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardMedia,
    CardContent,
    Stack,
    Button,
    IconButton,
    Grid,
    Skeleton, // Skeleton Component
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { useRouter } from "next/router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import useStoreWishlistHandler from 'components/home/search/pathflow/storewishlisthandler';


import { useTranslation } from 'react-i18next';


import Link from "next/link";
// 👇 Swiper Imports (Ensure these are available)
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';

const GREEN_COLOR = 'var(--food-offer-green)';

// --- Restaurant Card Content Component (Unchanged) ---
const RestaurantCard = ({ restaurant, isStoreWishlisted,
  addStoreToWishlist,
  removeStoreFromWishlist, }) => {






    // ... inside RecommendedRestaurant component


    // const handleWishlistClick = (e) => {
    //     e.stopPropagation();
    //     if (isWishlisted) {
    //         removeFromWishlist(e);
    //     } else {
    //         addToWishlist(e);
    //     }
    // };

    return (

    <Card
        sx={{
            width: '100%',
                    borderRadius: "10px !important",
                    border:"1px solid var(--border-image)",
                    boxShadow: 1,   
                    height: '100%',
                    cursor: 'pointer',
        }}
    >

        <Box sx={{ position: 'relative' }}>
             <Link
    href={`/restaurant/${restaurant.id}`}
    scroll={true}
    onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
            window.location.href = e.target.closest("a").href;
        }, 500);
    }}
    style={{ textDecoration: 'none' }}
>
            <CardMedia
                component="img"
                height="220"
                image={restaurant.image}
                alt={restaurant.name}
                title={restaurant.name}
                sx={{
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    objectFit: 'cover',
                }}
            />
            </Link>
            
            {/* Wishlist Icon */}
         <Box
    sx={{
        position: "absolute",
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 5,
        transition: "all 0.2s ease",
        "&:hover": {
            transform: "scale(1.05)",
        },
    }}
    onClick={(e) => {
        e.stopPropagation();
        if (isStoreWishlisted(restaurant)) {
            removeStoreFromWishlist(restaurant, e);
        } else {
            addStoreToWishlist(restaurant, e);
        }
    }}
>
    {isStoreWishlisted(restaurant) ? (
        <FavoriteIcon sx={{ color: "var(--danger)", fontSize: 20 }} />
    ) : (
        <FavoriteBorderIcon sx={{ color: "var(--wishlist-inactive)", fontSize: 20 }} />
    )}
</Box>
        </Box>

        <CardContent sx={{ pb: 3, pt: 1.5, px: 1.5 }}>
             <Link
    href={`/restaurant/${restaurant.id}`}
    scroll={true}
    onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
            window.location.href = e.target.closest("a").href;
        }, 500);
    }}
    style={{ textDecoration: 'none' }}
>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold" noWrap sx={{ fontSize: '1.1rem' }}>
                    {restaurant.name}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'var(--brand-green-soft)',
                        color: GREEN_COLOR,
                        borderRadius: 1,
                        px: 0.75,
                        py: 0.25,
                        flexShrink: 0,
                    }}
                >
                    <StarIcon sx={{ color: GREEN_COLOR, fontSize: 14, mr: 0.2 }} />
                    <Typography variant="body2" fontWeight="bold" >
                        {restaurant.rating}
                    </Typography>
                </Box>
            </Stack>

            <Typography variant="body2" color="text.secondary" mt={0.5} noWrap>
                {restaurant.meta_description}
            </Typography>

            <Grid container spacing={0} mt={1}>
                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" ml={0.5} fontWeight="medium">
                            {restaurant.deliveryTime}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="body2" color={GREEN_COLOR} fontWeight="bold">
                        Starts at {restaurant.startsAtPrice}
                    </Typography>
                </Grid>
            </Grid>

            <Typography variant="caption" color={GREEN_COLOR} fontWeight="bold" mt={1.5} display="block">
                {restaurant.offer}
            </Typography>
            </Link>
        </CardContent>
    </Card>

    );
};
// --- End of Restaurant Card Content Component ---

// 👇 Restaurant Card Skeleton Component (Unchanged)
const RestaurantCardSkeleton = () => (
    <Card sx={{
        width: '100%',
        borderRadius: "8px !important",
        boxShadow: 3,
        height: 440,
        m:1
    }}>
        <Skeleton variant="rectangular" height={220} sx={{ borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />

        <CardContent sx={{ pb: 3, pt: 1.5, px: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Skeleton variant="text" sx={{ fontSize: '1.2rem', width: '60%' }} />
                <Skeleton variant="rectangular" width={40} height={20} sx={{ borderRadius: 1 }} />
            </Stack>
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: '80%', mt: 0.5 }} />

            <Grid container spacing={0} mt={1}>
                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="rectangular" width={16} height={16} sx={{ mr: 0.5 }} />
                        <Skeleton variant="text" sx={{ fontSize: '0.8rem', width: '70%' }} />
                    </Box>
                </Grid>
                <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Skeleton variant="text" sx={{ fontSize: '0.9rem', width: '70%' }} />
                </Grid>
            </Grid>
            <Skeleton variant="text" sx={{ fontSize: '0.9rem', width: '50%', mt: 1.5 }} />
        </CardContent>
    </Card>
);
// 👆 End of Restaurant Card Skeleton Component


const RecommendedRestaurant = () => {
    const { t } = useTranslation();
const { addStoreToWishlist, removeStoreFromWishlist, isStoreWishlisted } = useStoreWishlistHandler(t);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const theme = useTheme();
    // Check if screen is Tablet/Mobile for Font Size reduction and margin adjustment
    const isMobileView = useMediaQuery(theme.breakpoints.down('md'));
const getSlidesPerView = () => {
    if (isMobileView) return 1.1;

    return 3; // 🔥 always 3 for laptop/desktop
};
    // -----------------------------
    // Swiper Settings (Responsive)
    // -----------------------------
  const shouldSlide = restaurants.length > 3;

const swiperSettings = {
    modules: [Autoplay, FreeMode],

    loop: shouldSlide,
    autoplay: shouldSlide
        ? {
              delay: 3500,
              disableOnInteraction: false,
          }
        : false,

    centeredSlides: false,
    watchOverflow: true,

    breakpoints: {
        // Mobile
        0: {
            slidesPerView: 1.1,
            spaceBetween: 10,
        },

        // Tablet
        [theme.breakpoints.values.sm]: {
            slidesPerView: 2,
            spaceBetween: 16,
        },

        // Laptop/Desktop 🔥 (FIXED 3 CARDS)
        [theme.breakpoints.values.md]: {
            slidesPerView: 3,
            spaceBetween: 24,
        },
    },
};
    const router = useRouter();
const getLatLngFromStorage = () => {
  const currentLatLng = localStorage.getItem('currentLatLng');
  if (currentLatLng) {
    try {
      const parsedLatLng = JSON.parse(currentLatLng); // Parse the stored JSON string
      return {
        lat: parsedLatLng.lat,
        long: parsedLatLng.lng
      };
    } catch (error) {
    //   console.error('Error parsing lat/lng from localStorage:', error);
      return { lat: null, long: null }; // Return null if parsing fails
    }
  } else {
   
    return { lat: null, long: null }; // Return null if data is not found
  }
};
    const handleCardClick = (restaurant) => {
        // Navigate to detail page
        router.push(`/restaurant/${restaurant.id}`);
    };
    useEffect(() => {
        const fetchRecommendedStores = async () => {
            try {
                 const zone = JSON.parse(localStorage.getItem("zoneid"));


 const { lat, long } = getLatLngFromStorage();

  // Determine the final zone ID (use [0] if no zone is available)
  const finalZoneId = zone ?? ["0"];

                // API call logic remains the same
                const response = await fetch('https://dealplex.in/api/v1/stores/popular', {
                    method: 'GET',
                    headers: {
                        zoneId: JSON.stringify(finalZoneId),
        latitude:lat,
        longitude:long,
                        'ModuleId': '5',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const recommendedStores = data.stores.filter(store => store.is_recommended);

                const mappedStores = recommendedStores.map(store => {
                    const metaDescription = store.translations?.find(t => t.key === "meta_description")?.value || "No description available";

                    return {
                        id: store.id,
                        name: store.name,
                        image: store.logo_full_url || 'https://via.placeholder.com/300x200?text=Restaurant',
                        meta_description: metaDescription,
                        rating: store.avg_rating,
                        deliveryTime: store.delivery_time || 'Unknown',
                        startsAtPrice: store.minimum_order ? `₹${store.minimum_order}` : '₹0',
                        offer: 'Special offer available',
                    };
                });

                setRestaurants(mappedStores);
                setLoading(false);

            } catch (err) {
                setError("Failed to load recommended restaurants.");
                setLoading(false);
            }
        };

        fetchRecommendedStores();
    }, []);

    // Define mobile/desktop font sizes for titles
    const titleFontSize = isMobileView ? 'h6' : 'h5'; // h6 for mobile/tablet, h5 for desktop
    const subtitleFontSize = isMobileView ? 'caption' : 'body2'; // caption for mobile/tablet, body2 for desktop

    // 👇 LOADING RENDER LOGIC (Includes Header Skeletons)
    if (loading) {
        // Show 4 skeletons for consistency matching the max view
        const skeletonCount = 4;

        return (
            <Box sx={{ p: 3 }}>
                {/* Header Skeletons */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        {/* Title Skeleton */}
                        <Skeleton variant="text" sx={{ fontSize: titleFontSize === 'h6' ? '1.25rem' : '2rem', width: isMobileView ? 200 : 250 }} />
                        {/* Subtitle Skeleton */}
                        <Skeleton variant="text" sx={{ fontSize: subtitleFontSize === 'caption' ? '0.75rem' : '1rem', width: isMobileView ? 150 : 200 }} />
                    </Box>
                    {/* Explore All Button Skeleton */}
                    <Skeleton variant="rectangular" width={isMobileView ? 80 : 120} height={36} sx={{ borderRadius: 1 }} />
                </Stack>

                {/* Slider Skeleton */}
                <Box sx={{ mx: isMobileView ? -3 : 0 }}>
                    <Swiper {...swiperSettings}>
                        {Array.from({ length: skeletonCount }).map((_, index) => (
                            <SwiperSlide key={`skel-${index}`}>
                                {/* Use padding inside the slide for mobile margins */}
                                <Box sx={{ p: isMobileView ? 1 : 0 }}>
                                    <RestaurantCardSkeleton />
                                </Box>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>
            </Box>
        );
    }
    // 👆 END OF LOADING RENDER LOGIC

    if (error) {
        return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
    }

    if (restaurants.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant={titleFontSize} fontWeight="bold" mb={2}>
                    Recommended Restaurants
                </Typography>
                <Typography variant={subtitleFontSize} color="text.secondary">
                    No recommended restaurants available at the moment.
                </Typography>
            </Box>
        );
    }

    // 👇 FINAL RENDER LOGIC 
    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    {/* Recommended Restaurants (Responsive Font) */}
                    <Typography variant={titleFontSize} fontWeight="bold">
                        Recommended Restaurants
                    </Typography>
                    {/* Top rated restaurants curated for you (Responsive Font) */}
                    <Typography variant={subtitleFontSize} color="text.secondary">
                        Top rated restaurants curated for you
                    </Typography>
                </Box>
                <Button
                    component="a"
                    href="/restaurant?view=all"
                    variant="text"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        color: GREEN_COLOR,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: isMobileView ? '0.75rem' : '0.875rem',
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setTimeout(() => {
                            window.location.href = e.target.closest("a").href;
                        }, 500);
                    }}
                >
                    Explore All
                </Button>

            </Stack>

            {/* Swiper Slider Container. Use negative margin on mobile for full width. */}
            <Box sx={{ mx: isMobileView ? -3 : 0 }}>
                <Swiper {...swiperSettings}>
                    {restaurants.map((restaurant) => (
                        <SwiperSlide key={restaurant.id}>
                            <Box sx={{ p: isMobileView ? 1 : 0 }}>
                            <RestaurantCard
                                   restaurant={restaurant}
                                    isStoreWishlisted={isStoreWishlisted}
                                    addStoreToWishlist={addStoreToWishlist}
                                    removeStoreFromWishlist={removeStoreFromWishlist}
                            />
                            </Box>
                        </SwiperSlide>
                        ))}
                </Swiper>
            </Box>
        </Box>
    );
};

export default RecommendedRestaurant;