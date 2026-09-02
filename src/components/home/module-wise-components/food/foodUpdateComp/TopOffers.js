"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Button,
    IconButton,
    Alert,
    Skeleton, 
    Grid, 
    useTheme, 
    useMediaQuery, 
    Link, // 🚀 ADDED: Link for redirection
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; 
import FavoriteIcon from '@mui/icons-material/Favorite'; 

// 💡 ADDED API IMPORTS
import MainApi from "api-manage/MainApi"; 
import { zoneId_api } from "api-manage/ApiRoutes"; 


// =======================================================================
// ⭐ WISHLIST IMPORTS & HANDLER ⭐
// =======================================================================
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useAddToWishlist } from "api-manage/hooks/react-query/wish-list/useAddWishList";
import { useWishListDelete } from "api-manage/hooks/react-query/wish-list/useWishListDelete";
import { addWishList, removeWishListItem } from "redux/slices/wishList";
import { not_logged_in_message } from "utils/toasterMessages";
import { useTranslation } from "react-i18next";

// -----------------------------------------------------------------------
// 🎯 useWishlistHandler (Unchanged)
// -----------------------------------------------------------------------
const useWishlistHandler = (item) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { wishLists } = useSelector((state) => state.wishList);
    const { mutate: addFavoriteMutation } = useAddToWishlist();
    const { mutate: deleteFavoriteMutation } = useWishListDelete();
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Check if item exists in wishlist
    useEffect(() => {
        if (wishLists?.item?.find((wishItem) => wishItem.id === item?.id)) {
            setIsWishlisted(true);
        } else {
            setIsWishlisted(false);
        }
    }, [wishLists, item?.id]);

    // Add to wishlist
    const addToWishlist = (e) => {
        e?.stopPropagation?.();
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
            toast.error(t(not_logged_in_message));
            return;
        }

        addFavoriteMutation(item?.id, {
            onSuccess: (response) => {
                if (response) {
                    dispatch(addWishList(item));
                    toast.success(response?.message);
                }
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Failed to add to wishlist");
            }
        });
    };

    // Remove from wishlist
    const removeFromWishlist = (e) => {
        e?.stopPropagation?.();
        deleteFavoriteMutation(item?.id, {
            onSuccess: (res) => {
                dispatch(removeWishListItem(item?.id));
                toast.success(res?.message || "Removed from wishlist");
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Failed to remove from wishlist");
            }
        });
    };

    return {
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
    };
};
// -----------------------------------------------------------------------


// --- API & Styling Constants (Unchanged) ---
const API_ENDPOINT = 'https://dealplex.in/api/v1/stores/top-offer-near-me';

const USER_LAT = 18.5204; // Static fallback for distance calc
const USER_LON = 73.8567; // Static fallback for distance calc

// Slider Constants
const CARD_MIN_WIDTH = 370; // Default for desktop
const CARD_MIN_WIDTH_MOBILE = 'calc(100vw - 100px)'; 
const MOBILE_IMAGE_WIDTH = 80;
const MOBILE_IMAGE_HEIGHT = 100;

const SPACING = 24; 
const AUTO_SCROLL_INTERVAL = 3000;
const PRELOAD_COUNT = 3; 

const GREEN_COLOR = '#2e7d32'; 
const RED_COLOR = '#d32f2f';

// --- Haversine Distance Calculation Function (Unchanged) ---
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; 
    return parseFloat(distance.toFixed(1));
};

// --- Helper Functions (renderStars - Unchanged) ---
const renderStars = (rating) => {
    const normalizedRating = Math.round(rating);
    return [...Array(5)].map((_, i) => (
      <StarIcon 
        key={i} 
        sx={{ 
          color: i < normalizedRating ? '#ffb400' : 'grey.300', 
          fontSize: 16,
          mr: 0.1, 
        }} 
      />
    ));
};

// -------------------------------------------------------------------
// 🚀 UPDATED: Truncation Function to use `maxWords = 13` for mobile
// -------------------------------------------------------------------
const truncateAddressByWords = (text, maxWords = 3) => {
    if (!text) return '';
    const words = text.split(/\s+/); 
    
    // Use the maxWords passed (13 for mobile, 3 for desktop)
    if (words.length <= maxWords) {
        return text;
    }

    const truncatedText = words.slice(0, maxWords).join(' ');
    return truncatedText + '...'; // Show ellipsis after the 13th word
};

// -------------------------------------------------------------------
// 💡 OfferCardSkeleton (Unchanged)
// -------------------------------------------------------------------
const OfferCardSkeleton = () => (
    <Card 
        sx={{ 
            borderRadius: '8px !Important', 
            minWidth: { xs: CARD_MIN_WIDTH_MOBILE, sm: CARD_MIN_WIDTH }, 
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
            display: 'flex', 
            flexDirection: 'row', 
            flexShrink: 0, 
        }}
    >
        {/* Image/Placeholder Skeleton */}
        <Box 
            sx={{ 
                width: { xs: MOBILE_IMAGE_WIDTH, sm: 120 }, 
                height: { xs: MOBILE_IMAGE_HEIGHT, sm: 140 }, 
                m: 2, 
                flexShrink: 0 
            }}
        >
            <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 1 }} />
        </Box>

        {/* Content Skeleton */}
        <CardContent sx={{ flexGrow: 1, py: 1.5, pl: 0, pr: 2 }}>
            <Skeleton variant="text" width="70%" sx={{ fontSize: '1rem', mb: 1 }} />

            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Skeleton variant="rectangular" width={70} height={16} sx={{ borderRadius: '4px' }} />
                <Skeleton variant="text" width="20%" height={16} />
            </Stack>

            <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
            
            <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}> 
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" width="60%" height={16} />
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" width="50%" height={16} />
            </Stack>
            
            <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 4, mt: 0.5 }} />
        </CardContent>
    </Card>
);

/**
 * Component for rendering an individual offer/store card. 
 */
const OfferCard = React.memo(({ store, isMobileView }) => {
    const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlistHandler(store);

    const handleWishlistClick = (e) => {
        if (isWishlisted) {
            removeFromWishlist(e);
        } else {
            addToWishlist(e);
        }
    };
    
    const name = store.name;
    const rating = store.avg_rating || 0;
    const reviews = store.reviews_count || 0;
    const address = store.address;
    
    // 🚀 LOGIC UPDATED: Set max words to 13 for mobile view, otherwise use the default (3).
    const MAX_WORDS = isMobileView ? 13 : 3;
    const displayedAddress = truncateAddressByWords(address, MAX_WORDS);

    const discountValue = store.discount?.discount; 
    const discountType = store.discount?.discount_type;
    const isOpen = store.open === 1;

    const storeLat = parseFloat(store.latitude);
    const storeLon = parseFloat(store.longitude);
    
    let distanceKm = 'N/A';
    if (!isNaN(storeLat) && !isNaN(storeLon)) {
        distanceKm = calculateDistanceKm(USER_LAT, USER_LON, storeLat, storeLon);
    }
    
    // 🚀 NEW: Function to generate Google Maps URL
    const getGoogleMapsUrl = () => {
        if (storeLat && storeLon) {
            // Option 1: Use coordinates for precise location
            return `https://www.google.com/maps/search/?api=1&query=${storeLat},${storeLon}`;
        }
        // Option 2: Fallback to address search
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    };

    const mapsUrl = getGoogleMapsUrl();
    
    return (
      <Card 
        sx={{ 
          borderRadius: '8px !Important', 
          border: '1px solid #e0e0e0',
          stroke:1,
          minWidth: CARD_MIN_WIDTH, 
          '@media (max-width: 600px)': {
              minWidth: CARD_MIN_WIDTH_MOBILE, 
          },
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
          display: 'flex', 
          flexDirection: 'row', 
          position: 'relative', 
          flexShrink: 0, 
          overflow: 'hidden', 
        }}
      >
        {/* === LEFT SECTION: Image/Placeholder Column (Unchanged) === */}
        <Box 
          sx={{ 
            width: { xs: MOBILE_IMAGE_WIDTH, sm: 120 }, 
            height: { xs: MOBILE_IMAGE_HEIGHT, sm: 140 }, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 1, 
            flexShrink: 0, 
            position: 'relative', 
            m: 2, 
            overflow: 'hidden',
          }} 
        >
          {store.cover_photo_full_url ? (
                <Box
                  component="img"
                  src={store.cover_photo_full_url}
                  alt={name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
             <Typography variant="caption" sx={{ p: 1 }}>
                 [Image Not Found]
             </Typography>
            )}

          <IconButton
            size="small"
            onClick={handleWishlistClick}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              p: 0.5,
              zIndex: 3,
            }}
          >
            {isWishlisted ? (
                <FavoriteIcon sx={{ color: RED_COLOR, fontSize: 18 }} />
            ) : (
                <FavoriteBorderIcon sx={{ color: 'grey.700', fontSize: 18 }} />
            )}
          </IconButton>
        </Box>

        {/* === RIGHT SECTION: Content Column === */}
        <CardContent sx={{ flexGrow: 1, py: 1.5, pl: 0, pr: 2 }}>
          
          <Typography variant="subtitle1" component="div" fontWeight="bold" sx={{ fontSize: '1rem', mb: 1 }}>
            {name}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
            <Box sx={{ display: 'flex' }}>
              {renderStars(rating)}
            </Box>
            <Typography variant="body2" color="text.secondary">
              ({reviews})
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
            <Box 
              sx={{ 
                width: 8, height: 8, borderRadius: '50%', 
                backgroundColor: isOpen ? GREEN_COLOR : RED_COLOR,
                ml: 4/8, mr: 0.5 
              }} 
            />
            <Typography 
                variant="body2" fontWeight="medium" 
                color={isOpen ? GREEN_COLOR : RED_COLOR} 
                sx={{ml: '-4px'}}
            >
              {isOpen ? 'Open Now' : 'Closed'}
            </Typography>
          </Stack>
          
          {/* 🚀 WRAPPED IN LINK: Address link for Google Maps redirection */}
          <Link 
            href={mapsUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            underline="none"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 0.5 }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5} marginLeft="-4px"> 
              <LocationOnIcon sx={{ fontSize: 16, color: 'grey.600', mr: 0 }} /> 
              <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                      // Apply hover effect to mimic clickable link
                      '&:hover': { 
                          textDecoration: 'underline', 
                          color: 'primary.main',
                      }
                  }}
              >
                {displayedAddress}
              </Typography>
            </Stack>
          </Link>

          <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5} marginLeft="-4px">
            <LocationOnIcon sx={{ fontSize: 16, color: GREEN_COLOR, mr: 0 }} /> 
            <Typography variant="body2" fontWeight="bold" color={GREEN_COLOR}>
                {distanceKm} km from you
            </Typography>
          </Stack>

          {discountValue && discountType && (
            <Box
              sx={{ 
                backgroundColor: RED_COLOR, color: 'white', 
                borderRadius: "22px !Important", px: 1.2, py: 0.3 , fontWeight: 'bold',
                display: 'inline-block', whiteSpace: 'nowrap',
                mt: 0.5, 
                mb: 0,   
              }}
            >
              <Typography variant="caption" fontWeight="bold" sx={{lineHeight: 1,fontSize:'0.7rem'}}>
                {discountValue}{discountType === 'percent' ? '%' : ''} OFF
              </Typography>
            </Box>
          )}

        </CardContent>
      </Card>
    );
});

// -------------------------------------------------------------------
// --- Main Component with Fetch & Drag/Slider Logic (Unchanged) ---
// -------------------------------------------------------------------

const TopOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoneIds, setZoneIds] = useState([]); 
    
    const sliderRef = useRef(null); 
    const isDragging = useRef(false); 
    const startX = useRef(0); 
    const scrollLeft = useRef(0); 
    const [currentIndex, setCurrentIndex] = useState(0); 

    const theme = useTheme();
    const isMobileView = useMediaQuery(theme.breakpoints.down('sm')); 

    // --------------------------- Fetch Zone-ID Logic (Unchanged) ---------------------------
    const fetchZoneId = async () => {
        try {
            const storedLatLng = localStorage.getItem("currentLatLng");
            if (!storedLatLng) throw new Error("Location not selected");

            const { lat, lng } = JSON.parse(storedLatLng);
            if (!lat || !lng) throw new Error("Invalid lat/lng");

            const res = await MainApi.get(zoneId_api, { params: { lat, lng } });
            const data = res.data;

            const zones = data?.zone_ids || data?.data?.zone_ids || data?.zone_id || data?.data?.zone_id;

            if (!zones) throw new Error("Zone not found");

            const zoneArray = Array.isArray(zones) ? zones : [zones];

            localStorage.setItem("zoneid", JSON.stringify(zoneArray));
            setZoneIds(zoneArray);

        } catch (err) {
            // console.error("❌ ZONE FETCH FAILED, falling back:", err);
            // Fallback to static zone IDs on failure
            setZoneIds([15, 17]);
        }
    };
    
    useEffect(() => {
        const cached = localStorage.getItem("zoneid");
        if (cached) {
            setZoneIds(JSON.parse(cached));
        } else {
            fetchZoneId();
        }
    }, []);

    // --------------------------- fetchData Logic (Unchanged) ---------------------------
   const fetchData = async () => {
    if (zoneIds.length === 0) return;


        try {
            setLoading(true);
            setError(null);

            const dynamicHeaders = {
                zoneId: JSON.stringify(zoneIds),
                'moduleId': '5',
                'Content-Type': 'application/json',
            };

            const response = await fetch(API_ENDPOINT, {
                method: 'GET',
                headers: dynamicHeaders 
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.stores) {
                const originalStores = data.stores;
                setOffers([...originalStores, ...originalStores.slice(0, PRELOAD_COUNT)]); 
            } else {
                throw new Error("API response is missing 'stores' data.");
            }
            
        } catch (err) {
            // console.error("Error fetching top offers:", err);
            setError(`Failed to load offers. ${err.message}.`);
        } finally {
            setLoading(false);
        }
    };
    
   useEffect(() => {
    if (zoneIds.length > 0) {
        fetchData();
    }
}, [zoneIds]);



    // --- Drag Handlers (Unchanged) ---
    const handleMouseDown = (e) => {
        if (!sliderRef.current) return;
        isDragging.current = true;
        sliderRef.current.style.cursor = 'grabbing';
        sliderRef.current.style.userSelect = 'none';
        startX.current = e.pageX - sliderRef.current.offsetLeft;
        scrollLeft.current = sliderRef.current.scrollLeft;
    };

    const handleMouseLeave = () => {
        if (isDragging.current) {
            handleMouseUp();
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (sliderRef.current) {
            sliderRef.current.style.cursor = 'grab';
            sliderRef.current.style.userSelect = 'auto'; 
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current || !sliderRef.current) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX.current) * 1.5; 
        sliderRef.current.scrollLeft = scrollLeft.current - walk;
    };
    
    // --- Auto Scroll Logic (Unchanged) ---
    useEffect(() => {
        if (offers.length <= PRELOAD_COUNT || loading) return; 
        
        const ORIGINAL_COUNT = offers.length - PRELOAD_COUNT; 
        let interval;

        const loopScroll = () => {
            if (!sliderRef.current) return;

            const slider = sliderRef.current;
            const firstCardElement = slider.children[0]?.firstChild; 
            
            const cardWidth = firstCardElement ? firstCardElement.offsetWidth : CARD_MIN_WIDTH;
            const scrollStep = cardWidth + SPACING;
            
            const isApproachingEnd = currentIndex >= ORIGINAL_COUNT;

            if (isApproachingEnd) {
                slider.scrollLeft = 0; 
                setCurrentIndex(0); 
            } else {
                slider.scrollBy({
                    left: scrollStep,
                    behavior: 'smooth'
                });
                setCurrentIndex(prev => prev + 1);
            }
        };


        if (!isDragging.current) {
             interval = setInterval(loopScroll, AUTO_SCROLL_INTERVAL);
        }

        return () => clearInterval(interval);
    }, [offers.length, currentIndex, loading]);

    
    // --- Loading, Error, No Offers States (Unchanged) ---
    if (loading) {
        const skeletonCount = isMobileView ? 1 : 3; 
        return (
            <Box sx={{ p: 4 }}>
                {/* Skeleton Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
                    <Skeleton variant="text" width={200} height={35} />
                    <Skeleton variant="text" width={80} height={35} />
                </Stack>

                {/* Skeleton Slider */}
                <Box sx={{ display: 'flex', gap: `${SPACING}px`, overflowX: 'hidden' }}>
                    {Array.from({ length: skeletonCount }).map((_, index) => (
                        <OfferCardSkeleton key={index} />
                    ))}
                </Box>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
    }
    
   if (offers.length === 0) {
  return (
    <Alert severity="info" sx={{ m: 4 }}>
      No top offers found near you.
    </Alert>
  );
}


    // --- Render Component ---
    return (
        <Box sx={{ p: 4 }}>
        
        <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={3}
            flexWrap="wrap" 
        >
            <Box mb={{ xs: 2, sm: 0 }}>
            <Typography variant="h5" fontWeight="bold">
                Top Offer near me
            </Typography>
            </Box>
            <Button
            variant="text"
            endIcon={<ArrowForwardIcon />}
            sx={{ color: GREEN_COLOR, textTransform: 'none', fontWeight: 'bold' }}
            >
            Explore All
            </Button>
        </Stack>
        
        <Box 
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}

            sx={{
                display: 'flex',
                gap: `${SPACING}px`,
                overflowX: 'auto', 
                
                scrollSnapType: 'x mandatory', 
                scrollBehavior: 'smooth', 
                
                WebkitOverflowScrolling: 'touch', 
                cursor: 'grab', 
                pb: 2, 
                
                px: { xs: 0, sm: 0 }, 
                
                '&::-webkit-scrollbar': { display: 'none' }, 
                msOverflowStyle: 'none', 
                scrollbarWidth: 'none', 
            }}
        >
            {offers.map((store, index) => (
            <Box 
                key={`${store.id}-${index}`} 
                sx={{ 
                    scrollSnapAlign: 'start',
                    
                    '&:first-of-type': { 
                        scrollMarginLeft: { xs: '0px', sm: 0 }, 
                    },
                }}
            > 
                <OfferCard store={store} isMobileView={isMobileView} /> 
            </Box>
            ))}
        </Box>
        </Box>
    );
};

export default TopOffers;