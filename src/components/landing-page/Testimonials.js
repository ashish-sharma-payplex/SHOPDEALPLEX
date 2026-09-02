import { Typography, useTheme, Avatar, Box, } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import reve from "../landing-page/imgs/Reviewer.png"

const Testimonials = ({ landingPageData, loading = false, error = null }) => {
    const theme = useTheme();

    // Static fallback reviews with correct image path
    const staticReviews = [
        {
            image: reve.src,
            comment: 'Great service and quality products!',
            customer_name: 'Happy Customer'
        },
        {
            image: reve.src,
            comment: 'Fast delivery and excellent support.',
            customer_name: 'Satisfied Client'
        }
    ];

    // Get reviews from backend or use static ones
    const reviews = Array.isArray(landingPageData?.testimonial_list) 
        ? landingPageData.testimonial_list.map(review => ({
            image: review?.reviewer_image 
                   ? `${landingPageData?.base_urls?.reviewer_image_url}/${review.reviewer_image}`
                   : reve.src,
            comment: review?.review || '',
            customer_name: review?.name || 'Customer',
            designation: review?.designation || ''
          }))
        : staticReviews;

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: Math.min(3, reviews.length),
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(2, reviews.length)
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    };

    return (
        <Box sx={{ 
            py: 2,
            backgroundColor: theme.palette.background.paper
        }}>
            <Typography variant="h5" align="center" fontWeight="bold"
            
            sx={{ mb: 4 ,
                color:"#d72a00",
                textTransform: "uppercase",
                letterSpacing: "1px",

            }}>
                Customer Testimonials
            </Typography>
            
            <Slider {...settings}>
                {reviews.map((review, i) => (
                    <Box key={i} sx={{ px: 2, textAlign: 'center' }}>
                        <Box sx={{
                            bgcolor: 'rgb(255, 243, 224)',
                            p: 4,
                            borderRadius: 2,
                            height: '100%'
                        }}>
                            <Avatar 
                                src={review.image} 
                                sx={{ 
                                    width: 80, 
                                    height: 80,
                                    margin: '0 auto 16px'
                                }} 
                            />
                            <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                            &quot;{review.comment}&quot;
                            </Typography>

                            <Typography variant="subtitle1">
                                {review.customer_name}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Slider>
        </Box>
    );
};

export default Testimonials;
