import React, { useState } from "react";
import { styled, Typography, Stack, Box, Button } from "@mui/material";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from "react-i18next";
import DeleteAddress from "../DeleteAddress";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

// Poore section ka main rectangular box
const MainAddressWrapper = styled(Box)(({ theme }) => ({
  border: `1px solid #e2e8f0`,
  borderRadius: "12px",
  padding: "24px",
  backgroundColor: "#fff",
  position: "relative",
  width: "100%",
}));

const AddressText = styled(Typography)(({ theme }) => ({
  fontSize: "13px",
  color: "#64748b", // Subtle grey color
  lineHeight: "1.5",
  fontWeight: "400",
  maxWidth: "500px"
}));

const AddressCard = (props) => {
  const {
    item,
    refetch,
    setEditAddress,
    setAddAddress,
    isLast // Yeh prop check karega ki last item hai ya nahi (divider ke liye)
  } = props;

  const { address_type, address, id } = item;
  const { t } = useTranslation();
  const [openDelete, setOpenDelete] = useState(false);

  const getIcon = () => {
    if (address_type?.toLowerCase() === "home") {
      return <HomeOutlinedIcon sx={{ fontSize: "24px", color: "#475569" }} />;
    }
    return <BusinessOutlinedIcon sx={{ fontSize: "24px", color: "#475569" }} />;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ py: 2 }}>
        {/* Left Side Icon */}
        <Box sx={{ mt: 0.5 }}>
          {getIcon()}
        </Box>

        {/* Right Side Content */}
        <Stack spacing={0.2} flex={1}>
          <Typography
            variant="body1"
            fontWeight="600"
            sx={{ textTransform: "capitalize", color: "#1e293b" }}
          >
            {t(address_type)}
          </Typography>

          <AddressText>
            {address}
          </AddressText>
        </Stack>
       <Stack direction="row" spacing={1}>
          {/* EDIT */}
          <IconButton
            onClick={() => {
              setEditAddress(item);
              setAddAddress(true);
            }}
          >
            <EditIcon sx={{ fontSize: "20px", color: "#1A914B" }} />
          </IconButton>

          {/* DELETE */}
          <IconButton onClick={() => setOpenDelete(true)}>
            <DeleteIcon sx={{ fontSize: "20px", color: "red" }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Dashed divider: Sirf tab dikhega jab niche aur items honge */}
      {!isLast && (
        <Box
          sx={{
            borderBottom: "1px dashed #e2e8f0",
            width: "100%",
            my: 1
          }}
        />
      )}

      {openDelete && (
        <DeleteAddress
          open={openDelete}
          handleClose={() => setOpenDelete(false)}
          addressId={id}
          refetch={refetch}
        />
      )}
    </Box>
  );
};

// Parent Component ya Section jahan ye cards render honge
export const MyAddressSection = ({ addressList, setAddAddress }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" fontWeight="700" sx={{ mb: 2, color: "#1e293b" }}>
        My Address
      </Typography>

      <MainAddressWrapper>
        {/* Add Address Button Top Right par */}
        <Button
          startIcon={<AddIcon />}
          onClick={() => setAddAddress(true)}
          sx={{
            position: "absolute",
            top: 15,
            right: 20,
            color: "#008543", // Green color as per image
            textTransform: "none",
            fontWeight: "700",
            fontSize: "15px",


            '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
          }}
        >
          Add Address
        </Button>

        {/* Address List Mapping */}
        {addressList?.map((item, index) => (
          <AddressCard
            key={item.id}
            item={item}
            isLast={index === addressList.length - 1}
          />
        ))}
      </MainAddressWrapper>
    </Box>
  );
};

export default AddressCard;