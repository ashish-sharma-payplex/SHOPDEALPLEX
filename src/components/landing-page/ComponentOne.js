import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Grid,
  Button,
  useMediaQuery,
  useTheme,
  Typography,
  CircularProgress,
  Fade,
} from "@mui/material";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import CustomContainer from "../container";
import CustomImageContainer from "../CustomImageContainer";
import useGetModule from "../../api-manage/hooks/react-query/useGetModule";
// import Gro from "./imgs/grocery.jpg";
// import phar from "./imgs/pharmacy.jpg";
// import foo from "./imgs/food.jpg";
// import rent from "./imgs/car.jpg";
import DummyImage from "./imgs/dummyimage.png"
import Travels from "./imgs/travels.png"
import Handyman from "./imgs/handyman.png"



const ComponentOne = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const { data: moduleData, refetch } = useGetModule();
  const [loading, setLoading] = useState(false);
  const [loadingModule, setLoadingModule] = useState(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    refetch(); // fetch module data on mount
  }, []);

  const TRAVELS_EXTERNAL_LINK = "https://travelmytrip.com/flight/";
  const HANDYMAN_EXTERNAL_LINK = "https://agent.dealplex.in/";
  const routes = {
    Grocery: "/home?module=grocery",
    Pharmacy: "/home?module=pharmacy",
    Food: "/home?module=food",
    Parcel: "/home?module=parcel",  
    Rental: "/home?module=rental",
    Travels: TRAVELS_EXTERNAL_LINK,
    Handyman: HANDYMAN_EXTERNAL_LINK,
  };

  const handleOrderNow = (name) => {
    // console.log("Order Now Clicked:", name);
    const normalized = name && name.trim().toLowerCase();
    const routeKey = Object.keys(routes).find(
      key => key.toLowerCase() === normalized
    );
    
    if (routeKey && routes[routeKey]) {
      const route = routes[routeKey];
      setLoading(true);
      setLoadingModule(name);
      
      if (route.startsWith("http")) {
        window.open(route, "_blank");
        setTimeout(() => {
          setLoading(false);
          setLoadingModule(null);
        }, 1000);
      } else {
        router.push(route).then(() => {
          setLoading(false);
          setLoadingModule(null);
        }).catch(() => {
          setLoading(false);
          setLoadingModule(null);
        });
      }
    } else {
      // console.warn("No route defined for", name);
    }
  };

  // Pastel background colors for cards
  const pastelColors = [
    '#FDF1AD', // orange
    '#FEDD9E', // peach
    '#dcf0fa', // blue
    '#ffffb7', // yellow
    '#cdc6ff', // pink
    '#C2E9BF', // gray
    '#F5E1CC', // light orange
  ];

  const categoryCount ={
    grocery:"From Fresh fruits to home needs...",
    food:"Italian, indian, mexican and much more...",
    pharmacy:"OTC to medical  machines...",
    rental:"Bike rides, car rentals, and more...",
    parcel:"All types of parcel services",
    travels:"Book flight, bus and hotels",
    handyman:"For all your household needs",
  }

  // Dummy image for the first card
  // const dummyImage = 'https://via.placeholder.com/400x180?text=Category+Image';

  // All modules for the right section (including the original first one)
  const rightModules = moduleData || [];

  // Add Travels card to rightModules if not present
  const travelsModule = {
    module_name: 'Travels',
    icon_full_url: Travels.src , // Use a suitable icon URL or local asset
    item_count: '',
  };

  const handyman ={
    module_name:"Handyman",
    icon_full_url: Handyman.src,
    item_count:"",
  };
  // Filter out existing Travels and Handyman modules from rightModules
  const filteredModules = rightModules.filter(
    m => m.module_name !== 'Travels' && m.module_name !== 'Handyman'
  );

  // Add Travels and Handyman modules at the end if not present
  const modulesWithTravels = [
    ...filteredModules,
    ...(rightModules.some(m => m.module_name === 'Travels') ? [] : [travelsModule]),
    ...(rightModules.some(m => m.module_name === 'Handyman') ? [] : [handyman]),
  ];

  return (
    <CustomContainer>
      <CustomStackFullWidth>
        <Box
          sx={{
            width: '100%',
            background: '#fff',
            paddingTop: '2.5rem',
            paddingBottom: '3rem',
            marginTop: '1px',
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            mb={1}
            sx={{
              color: '#d72a00',
              textTransform: 'none',
              letterSpacing: '1px',
            }}
          >
            Popular Categories
          </Typography>

          <Grid container spacing={3} justifyContent="center" px={2} alignItems="stretch">
            {/* First (large) card with dummy image, spans two rows */}
            <Grid item xs={12} md={4} lg={4} sx={{ display: 'flex' }}>
              <Box
                sx={{
                  height: '100%',
                  minHeight: 570,
                  background: pastelColors[0],
                  borderRadius: '22px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  position: 'relative',
                  overflow: 'hidden',
                  p: 0,
                  width: '100%',
                }}
              >
                {/* <Typography
                  variant="h6"
                  fontWeight={600}
                  textAlign="center"
                  sx={{ mt: 4, mb: 1, zIndex: 2 }}
                >
                  From Groceries to Getaways, All in One Place
                </Typography> */}
                <Typography
                  variant="body1"
                  color="#d72a00"
                  textAlign="center"
                  sx={{ mb: 2, zIndex: 2 }}
                >
                  {/* item count can go here if needed */}
                </Typography>
                {/* Dummy/placeholder image at the bottom */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '90%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <CustomImageContainer
                    src={DummyImage.src}
                    alt="Category Placeholder"
                    height="120%"
                    width="100%"
                    objectFit="cover"
                    sx={{ borderRadius: 0 }}
                  />
                </Box>
              </Box>
            </Grid>
            {/* Right section: modules with more functionality */}
            <Grid item xs={12} md={8} lg={8}>
              <Grid container spacing={3}>
                {modulesWithTravels.slice(0, showMore ? modulesWithTravels.length : 5).map((module, idx) => (
                  <Grid item xs={12} sm={4} key={idx}>
                    <Box
                      sx={{
                        height: { xs: 180, sm: 200 },
                        minHeight: "260px",
                        background: pastelColors[(idx + 1) % pastelColors.length],
                        borderRadius: '22px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        p: 0,
                      }}
                    >
                      {/* Circular image with dashed border */}
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          border: '2.5px dashed #e0e0e0',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mt: 3,
                          mb: 2,
                        }}
                      >
                        <CustomImageContainer
                          src={module.icon_full_url}
                          alt={module.module_name}
                          height="100px"
                          width="100px"
                          objectFit="contain"
                          onClick={() => handleOrderNow(module.module_name)}
                        />
                      </Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        textAlign="center"
                        sx={{ mb: 0.5 }}
                      >
                        {module.module_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        textAlign="center"
                        sx={{ mb: 2 }}
                      >
                        {categoryCount[module.module_name?.toLowerCase()] || (module.item_count ? `${module.item_count} items` : '')}
                      </Typography>
                      {/* Button with loader */}
                      <Button
                        variant="contained"
                        disabled={loading && loadingModule === module.module_name}
                        sx={{
                          padding: '5px 18px',
                          fontWeight: 'bold',
                          borderRadius: '8px',
                          background: 'linear-gradient(180deg, #bca500 0%, #ff6600 100%)',
                          color: 'white',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.10)',
                          '&:hover': { backgroundColor: '#f06102' },
                          '&:disabled': {
                            background: 'linear-gradient(180deg, #ccc 0%, #999 100%)',
                            color: '#666',
                          },
                          minWidth: '120px',
                          minHeight: '36px',
                        }}
                        onClick={() => handleOrderNow(module.module_name)}
                      >
                        {loading && loadingModule === module.module_name ? (
                          <CircularProgress size={20} sx={{ color: 'white' }} />
                        ) : (
                          module.module_name
                        )}
                      </Button>
                    </Box>
                  </Grid>
                ))}
                {modulesWithTravels.length > 4 && !showMore && (
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        height: { xs: 180, sm: 200 },
                        minHeight: "250px",
                        background: pastelColors[0],
                        borderRadius: '22px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        p: 0,
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowMore(true)}
                    >
                      <Typography variant="h6" fontWeight={600} textAlign="center">
                        More
                      </Typography>
                      <Typography variant="body2" color="text.primary" textAlign="center" sx={{ mb: 2 }}>
                        Show all modules
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{
                          padding: '5px 18px',
                          fontWeight: 'bold',
                          borderRadius: '8px',
                          background: 'linear-gradient(180deg, #bca500 0%, #ff6600 100%)',
                          color: 'white',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.10)',
                          '&:hover': { backgroundColor: '#f06102' },
                          minWidth: '120px',
                          minHeight: '36px',
                        }}
                        onClick={() => setShowMore(true)}
                      >
                        More
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </CustomStackFullWidth>
    </CustomContainer>
  );
};

export default ComponentOne;
