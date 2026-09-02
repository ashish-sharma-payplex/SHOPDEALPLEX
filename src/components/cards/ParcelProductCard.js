import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import CustomImageContainer from "../CustomImageContainer";


const getValidImageUrl = (product) => {
  const possibleUrls = [
    product?.image?.url,
    product?.image,
    product?.image_full_url,
    product?.images?.[0]?.url
  ];
  return possibleUrls.find(url =>
    url && (url.startsWith('http') || url.startsWith('/'))
  );
};

const ParcelProductCard = ({ item, currentModule, onClick }) => {
  const router = useRouter();

  return (
    <Box
      sx={{
        width: { xs: "10rem", sm: "11rem", md: "12rem" },
        height: "350px",
        borderRadius: "10px",
        boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.1)",
        flex: "1 1 auto",
        minWidth: "10rem",
        maxWidth: "12rem",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: onClick ? "pointer" : "default"
      }}
      onClick={onClick}
    >
      {/* Image Section */}
      <Box sx={{ position: 'relative', width: '100%', height: '180px' }}>
        <CustomImageContainer
          src={getValidImageUrl(item)}
          alt={item.name}
          width="100%"
          height="100%"
          objectFit="cover"
          borderRadius="10px 10px 0 0"
          sx={{
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.03)"
            },
            position: 'absolute',
            top: 0,
            left: 0
          }}
          onError={(e) => {
            e.target.src = '/default-product.png';
          }}
        />
        {!getValidImageUrl(item) && (
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.200',
            borderRadius: '10px 10px 0 0'
          }}>
            <Typography variant="body2">No Image Available</Typography>
          </Box>
        )}
      </Box>

      {/* Content Section */}
      <Box sx={{ padding: "14px" }}>
        <Typography variant="h5" fontWeight="600">{item.name}</Typography>
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            mt={2}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: '2.5em',
              '&:hover + .full-description': {
                opacity: 1,
                visibility: 'visible'
              }
            }}
          >
            {item.description || "No description available"}
          </Typography>
          <Box
            className="full-description"
            sx={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              bgcolor: 'background.paper',
              p: 2,
              boxShadow: 2,
              borderRadius: 1,
              zIndex: 1,
              opacity: 0,
              visibility: 'hidden',
              transition: 'all 0.2s ease',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="body2">
              {item.description || "No description available"}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          sx={{ marginTop: "10px", backgroundColor: "#FF6600", "&:hover": { backgroundColor: "#f06102" } }}
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) {
              onClick();
            } else if (currentModule === "parcel") {
              router.push("/parcel-delivery-info", undefined, { shallow: true });
            } else {
              router.push(`/home?module=${currentModule}`);
            }
          }}
        >
          Buy Now
        </Button>
      </Box>
    </Box>
  );
};

export default ParcelProductCard;
