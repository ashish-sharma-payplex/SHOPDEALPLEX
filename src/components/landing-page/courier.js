"use client";
import { useState } from "react";
import Link from "next/link";
import LuggageIcon from "@mui/icons-material/Luggage";
import DevicesIcon from "@mui/icons-material/Devices";

import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  Stack,
  Paper,
  Modal,
  TextField,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import Image from "next/image";
import parcelmini from "../../../public/deal images/parcelmini.png";

export default function CourierService() {
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");

  const services = [
    {
      icon: <DescriptionIcon sx={{ color: "#1a914b" }} />,
      title: "Documents",
      desc: "Important paper & files",
      time: "2–4 hours",
      link: "/home?module=parcel",
    },
    {
      icon: <LuggageIcon sx={{ color: "#1a914b" }} />,
      title: "Luggage",
      desc: "Travel bags & personal items",
      time: "Same Day",
      link: "/home?module=parcel",
    },
    {
      icon: <DevicesIcon sx={{ color: "#1a914b" }} />,
      title: "Electronics",
      desc: "Secure delivery for gadgets",
      time: "2–3 Days",
      link: "/home?module=parcel",
    },
  ];

  return (
    <Box
      sx={{
        py: 3,
        px: { xs: 2, sm: 4, md: 8 },
        maxWidth: "1320px",
        mx: "auto",
      }}
    >
      {/* HEADER (Aligned Left — matches Food Module) */}
     <Typography
  sx={{ 
    mb: 3, 
    textAlign: "left",
    letterSpacing: "0.5px",
      fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1rem", md: "1.5rem" },
  }}
>
  Parcel Services
</Typography>


      {/* Removed subtitle */}

      {/* SERVICES SECTION — Matches spacing + layout from FoodSessionModule5 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 6,
          // p: { xs: 2, sm: 4 },
          width:"100%",
          backgroundColor: "#ffffff",
        }}
      >
       <Grid container spacing={3} justifyContent="flex-start" mb={3}>

          {services.map((item, i) => (
            <Grid item key={i} xs={12} sm={6} md={4}>
              <Link href={item.link} style={{ textDecoration: "none" }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: "16px !important",
                    py: 2,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "0.3s",
                    border: "1px solid #E3E8EE",
                    backgroundColor:"#ffffff",
                    "&:hover": {
                      borderColor: "#c6c7c9",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  {/* LEFT */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        bgcolor: "rgba(46, 125, 50, 0.1)",
                        borderRadius: "12px",
                        p: 1.2,
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ mb: 1 }}
                        color={"#253D4E"}
                      
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>

                  {/* RIGHT */}
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Delivery in
                    </Typography>
                    <Typography variant="body2" fontWeight={700}    color={"#253D4E"}>
                      {item.time}
                    </Typography>
                  </Box>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* DELIVERY SECTION */}
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography fontSize={{sx:"0.8rem",md:"1.1rem"}} fontWeight={700} gutterBottom>
            Seamless Delivery. Every Time.
          </Typography>

          <Typography fontSize={{sx:"0.6rem",md:"0.9rem"}} mb={3}>
            Forget shipping worries—we’ve got you covered. Our smart, reliable
            system ensures your items arrive safely, on time, and within budget.
          </Typography>

          <Stack spacing={2} mb={3}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircleIcon sx={{ color: "#1a914b" }} />
              <Typography>Real-time tracking (GPS)</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircleIcon sx={{ color: "#1a914b" }} />
              <Typography>Convenient doorstep pickup</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircleIcon sx={{ color: "#1a914b" }} />
              <Typography>Secure, tamper-proof packaging</Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Link href="/home?module=parcel" passHref>
             <Button
  variant="contained"
  size="large"
  sx={{
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 600,
    color:"#ffffff",
    backgroundColor: "#1a914b",
   
    // 👇 MOBILE ONLY size reduce
    px: { xs: 2.5, sm: 4 },
    py: { xs: 0.8, sm: 1.2 },
    fontSize: { xs: "0.85rem", sm: "1rem" },
  }}
>
  Send Parcel
</Button>

            </Link>
          </Stack>
        </Grid>

        <Grid
  item
  xs={12}
  md={6}
  sx={{
    mt: { xs: -2, md: 0 }, // ✅ mobile me upar ka space kam
  }}
>
  <Box sx={{ textAlign: "center" }}>
    <Image
      src={parcelmini}
      alt="Dealplex Logistics Illustration"
      width={800}   // base width
      height={600}  // base height
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
      sizes="(max-width: 1000px) 100vw, 50vw" // ✅ responsive sizing
    />
  </Box>
</Grid>



      </Grid>

      {/* MODAL */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#fff",
            boxShadow: 24,
            borderRadius: 5,
            p: 4,
            width: "90%",
            maxWidth: 480,
          }}
        >
          <Typography variant="h5" fontWeight={700} align="center" color="error" gutterBottom>
            Track Your Products
          </Typography>

          <Stack spacing={3}>
            <TextField
              label="Order ID"
              fullWidth
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />

            <TextField
              label="Phone Number"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1, fontWeight: 600 }}>+91</Typography>
                ),
              }}
              inputProps={{ maxLength: 10 }}
            />

            <Button
              variant="contained"
              color="warning"
              size="large"
              sx={{ borderRadius: "10px", fontWeight: 600 }}
            >
              Track Now
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
