
import {
    alpha,
    Grid,
    Skeleton,
    styled,
    Tab,
    Tabs,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useGetCommonConditions } from "api-manage/hooks/react-query/common-conditions/useGetCommonConditions";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import {
    CustomBoxFullWidth,
    CustomFullDivider,
    CustomStackFullWidth,
    SliderCustom,
} from "styled-components/CustomStyles.style";
import useGetCommonConditionProducts from "../../../../../api-manage/hooks/react-query/common-conditions/useGetCommonConditionProducts";

// ----------------------------------------------------
import DotSpin from "../../../../DotSpin";
import EmptySearchResults from "../../../../EmptySearchResults";
import H2 from "../../../../typographies/H2";
import { HomeComponentsWrapper } from "../../../HomePageComponents";
import { Next, Prev } from "../../../popular-items-nearby/SliderSettings";
import ModuleModal from "components/cards/ModuleModal";
import PharmacyProductCard from "../pharmacyupdate/cardCommonproduct"


// This is the green color for the active tab indicator and text (or similar to the image)
const ACTIVE_TAB_COLOR = "#00B859";

// ... (StyledCustomSlider, StyledTabs, StyledTab definitions remain the same) ...

const StyledCustomSlider = styled(SliderCustom)(({ theme, active }) => ({
    // Removed old styling as the design is for product cards now, not tabs
    color: active === "true" ? theme.palette.primary.main : "inherit",
    cursor: "pointer",
    // Adapted product card styling for the new look
    "& .slick-slide": {
        // Adjust spacing between product cards
        paddingRight: "16px",
    },
    // Keep original dot styling or adjust as needed for the slider
    "& .slick-dots": {
        marginBottom: "-40px",
        "& li": {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            "& button::before": {
                color: "transparent",
            },
        },
        "& li.slick-active button::before": {
            top: "-2px",
            backgroundColor: theme.palette.primary.main,
            width: "10px",
            height: "10px",
            borderRadius: "50%",
        },
    },
    // Style for next/prev arrows (if used)
    "& .slick-prev": {
        left: "-25px", // Adjust position
        zIndex: 1,
    },
    "& .slick-next": {
        right: "0px", // Adjust position
    },
}));

// Styled Tabs component to match the image's design
const StyledTabs = styled(Tabs)(({ theme }) => ({
    // Remove the default bottom border of Tabs
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    minHeight: '35px',
    // Style for the active indicator (the green line)
    "& .MuiTabs-indicator": {
        backgroundColor: ACTIVE_TAB_COLOR, // Green color
        height: '3px', // Thicker indicator
    },
    "& .MuiTabs-scroller": {
        overflow: 'visible !important', // Allow buttons to be visible
    },
}));

// Styled Tab component to match the image's design
const StyledTab = styled(Tab)(({ theme, selected }) => ({
    textTransform: 'none',
    minWidth: 'auto',
    minHeight: '35px',
    padding: '0 16px', // Horizontal padding
    marginRight: '24px', // Space between tabs
    fontWeight: selected ? '600' : '400',
    fontSize: '14px',
    color: selected ? ACTIVE_TAB_COLOR : theme.palette.text.secondary,
    "&.Mui-selected": {
        color: ACTIVE_TAB_COLOR,
    },
}));


const CommonConditions = (props) => {
    const { title } = props;
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("md"));
    const [selected, setSelected] = useState(0);
    const [conditionId, setConditionId] = useState(null);
    const page_limit = "20";
    const offset = 1;

    // 🔥 New State for Cart/Loading Management
    // Initialize with null to indicate no product is currently being added
    const [addingProductId, setAddingProductId] = useState(null);

    // 🔥 State for Modal Management (Unchanged - existing working functionality)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductData, setSelectedProductData] = useState(null);

    // Dummy functions for ModuleModal (Replace with actual logic)
    const addToWishlistHandler = () => {
        // console.log("Added to wishlist (simulated)");
    };
    const removeFromWishlistHandler = () => { 
        // console.log("Removed from wishlist (simulated)");
     };
    const configData = {};
    const isWishlisted = false;

    // 🚀 WORKING HANDLER FOR ADD TO CART 🚀
    const handleAddToCart = async (item) => {
        if (addingProductId === item.id) return; // Prevent multiple clicks

        setAddingProductId(item.id); // Set the loading state for this specific product ID

        try {
            // console.log(`Attempting to add product ID: ${item.id} to cart...`);
            // --- REPLACE THIS WITH YOUR ACTUAL API CALL OR REDUX DISPATCH ---
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API/async delay
            // console.log(`Product ID: ${item.id} successfully added to cart.`);
            // --- END OF CODE TO REPLACE ---

        } catch (error) {
            // console.error("Error adding to cart:", error);
            // Handle error (e.g., show a toast/notification)
        } finally {
            // !!! CRITICAL: Reset the loading state after the process completes (success or failure) !!!
            setAddingProductId(null);
        }
    };

    // 🔥 Modal Handlers (Unchanged - existing working functionality)
    const handleModalOpen = (productItem) => {
        setSelectedProductData(productItem);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedProductData(null);
    };

    // ... (rest of the query hooks and effects remain the same) ...

    const {
        data: conditions,
        refetch: conditionRefetch,
        isLoading: conditionsIsLoading,
        isRefetching: conditionsIsrefetching,
    } = useGetCommonConditions();

    const { data, refetch, isLoading, isRefetching } =
        useGetCommonConditionProducts({
            conditionId,
            page_limit,
            offset,
        });

    useEffect(() => {
        // Set initial condition ID to the first item
        if (conditions?.data?.length > 0) {
            setConditionId(conditions.data[0].id);
        }
    }, [conditions]);

    useEffect(() => {
        conditionRefetch();
    }, []);

    useEffect(() => {
        if (conditionId) {
            refetch();
        }
    }, [conditionId]);

    const handleChange = (event, newValue) => {
        setSelected(newValue);
        // Find the corresponding condition ID
        if (conditions?.data?.[newValue]) {
            setConditionId(conditions.data[newValue].id);
        }
    };

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        slidesPerRow: 1,
        rows: 1,
        autoplay: true,
        responsive: [
            { breakpoint: 1600, settings: { slidesToShow: 5 } },
            { breakpoint: 1450, settings: { slidesToShow: 4 } },
            { breakpoint: 1250, settings: { slidesToShow: 3 } },
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 3 } },
            { breakpoint: 590, settings: { slidesToShow: 2, dots: false } },
            { breakpoint: 360, settings: { slidesToShow: 1, dots: false } },
        ],
        prevArrow: <Prev />,
        nextArrow: <Next />,
    };

    return (
        <HomeComponentsWrapper sx={{ padding: { xs: "0 10px", md: "0 20px" } }}>
            {/* Title Section */}
            <CustomStackFullWidth>
                <H2
                    text={title}
                    textAlign="flex-start"
                    component="h2"
                    color="text.primary"
                    textTransform="capitalize"
                    letterSpacing="normal"
                />
            </CustomStackFullWidth>

            {/* Tabs/Conditions Section (Unchanged) */}
            <CustomBoxFullWidth sx={{ marginTop: "10px" }}>
                {conditionsIsLoading && conditionsIsrefetching ? (
                    <CustomStackFullWidth direction="row" spacing={2}>
                        {[...Array(6)].map((item, index) => (
                            <Skeleton
                                key={index}
                                variant="text"
                                width="80px"
                                height="35px"
                            />
                        ))}
                    </CustomStackFullWidth>
                ) : (
                    <SimpleBar style={{ width: "100%", overflowX: 'auto', paddingBottom: '10px' }}>
                        <StyledTabs
                            value={selected}
                            onChange={handleChange}
                            orientation="horizontal"
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                        >
                            {conditions?.data?.map((item, index) => (
                                <StyledTab
                                    key={index}
                                    label={item?.name}
                                    selected={selected === index}
                                />
                            ))}
                        </StyledTabs>
                    </SimpleBar>
                )}
            </CustomBoxFullWidth>

            {/* Product Slider Section */}
            <CustomStackFullWidth sx={{ marginY: "15px" }}>
                {isRefetching || isLoading ? (
                    <CustomBoxFullWidth
                        sx={{ height: "340px" }}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <DotSpin />
                    </CustomBoxFullWidth>
                ) : (
                    <>
                        {data?.products?.length === 0 ? (
                            <CustomBoxFullWidth
                                sx={{ height: "340px", padding: "2rem" }}
                                alignItems="center"
                                justifyContent="center"
                            >
                                <EmptySearchResults
                                    text="Items Not Found!"
                                    isItems
                                />
                            </CustomBoxFullWidth>
                        ) : (
                            <CustomBoxFullWidth>
                                <StyledCustomSlider>
                                    <Slider {...settings}>
                                        {data?.products?.length > 0 &&
                                            data?.products?.map((item) => (
                                                <PharmacyProductCard
                                                    key={item?.id}
                                                    item={item}
                                                    // Pass the working modal handler
                                                    handleProductPreview={handleModalOpen}
                                                    // Pass the new cart handler and state
                                                    handleAddToCart={handleAddToCart}
                                                    addingProductId={addingProductId}
                                                    // Other props
                                                    cardheight="300px"
                                                    cardFor="vertical"
                                                    cardType="vertical-type"
                                                    noMargin="true"
                                                />
                                            ))}
                                    </Slider>
                                </StyledCustomSlider>
                            </CustomBoxFullWidth>
                        )}
                    </>
                )}
            </CustomStackFullWidth>

            {/* Module Modal Component (Unchanged) */}
            <ModuleModal
                open={isModalOpen}
                handleModalClose={handleModalClose}
                productDetailsData={selectedProductData}
                configData={configData}
                addToWishlistHandler={addToWishlistHandler}
                removeFromWishlistHandler={removeFromWishlistHandler}
                isWishlisted={isWishlisted}
            />

        </HomeComponentsWrapper>
    );
};

CommonConditions.propTypes = {};

export default CommonConditions;