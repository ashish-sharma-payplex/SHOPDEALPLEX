import React from "react";
import { Box, Typography } from "@mui/material";

const GREEN = "#16a34a";
const FONT = "'Inter', sans-serif";

function Divider() {
  return (
    <Box sx={{ borderBottom: "1px solid #e5e7eb", my: { xs: 2.5, md: 3 } }} />
  );
}

function SectionHeading({ children }) {
  return (
    <Typography
      sx={{
        fontSize: { xs: "1.1rem", md: "1.2rem" },
        fontWeight: 700,
        color: "#111827",
        mb: 1,
        textAlign: "left",
        fontFamily: FONT,
      }}
    >
      {children}
    </Typography>
  );
}

function BodyText({ children, sx = {} }) {
  return (
    <Typography
      sx={{
        fontSize: { xs: "0.84rem", md: "0.875rem" },
        color: "#4b5563",
        lineHeight: 1.75,
        textAlign: "left",
        fontFamily: FONT,
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

function BulletItem({ bold, children }) {
  return (
    <Box
      component="li"
      sx={{
        fontSize: { xs: "0.84rem", md: "0.875rem" },
        color: "#4b5563",
        lineHeight: 1.75,
        mb: 0.4,
        pl: 0.5,
        textAlign: "left",
        fontFamily: FONT,
      }}
    >
      {bold && (
        <Box
          component="span"
          sx={{ fontWeight: 700, color: "#111827", fontFamily: FONT }}
        >
          {bold}{" "}
        </Box>
      )}
      {children}
    </Box>
  );
}

export default function HotelSEOContent() {
  return (
    <Box
       sx={{
        background: "#fff",
        textAlign: "left",
        maxWidth: 1300,
        mx: "auto",
      }}
    >
      {/* Background SVG Banner — top pe city skyline image */}
      <Box
        sx={{
          width: "100%",
          lineHeight: 0,
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src="/seocontentbg.svg"
          alt=""
          sx={{
            width: "100%",
            height: { xs: "80px", md: "110px" },
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ p: { xs: "20px 16px", md: "32px 40px" } }}>
        {/* Section 1 — Main Title */}
        <Typography
          sx={{
            fontSize: { xs: "1.15rem", md: "1.3rem" },
            fontWeight: 700,
            color: "#111827",
            mb: 1.2,
            lineHeight: 1.35,
            textAlign: "left",
            fontFamily: FONT,
          }}
        >
          Book Hotels Online with Dealplex for Your Next Trip
        </Typography>

        <BodyText>
          Looking for the perfect hotel for your next trip?{" "}
          <Box component="span" sx={{ color: GREEN, fontWeight: 600, fontFamily: FONT }}>
            Dealplex
          </Box>{" "}
          makes hotel booking simple, fast, and stress-free so you can focus on
          planning your journey, not managing logistics. Whether you're travelling
          for business, leisure, or a quick weekend getaway, Dealplex offers a
          wide range of hotels to suit every budget and travel style.
        </BodyText>

        <BodyText sx={{ mt: 0.5 }}>
          With transparent pricing, detailed property information, verified
          reviews, and a smooth booking experience, finding the right stay has
          never been easier.
        </BodyText>

        <Divider />

        {/* Section 2 */}
        <SectionHeading>Explore Hotel Options on Dealplex</SectionHeading>
        <BodyText sx={{ mb: 0.8 }}>
          Dealplex brings you carefully curated stays to match every travel need:
        </BodyText>
        <Box component="ul" sx={{ m: 0, pl: "22px", textAlign: "left" }}>
          <BulletItem bold="Luxury Hotels">
            Experience premium comfort with world-class amenities, elegant
            interiors, spas, pools, and fine dining.
          </BulletItem>
          <BulletItem bold="Business Hotels">
            Conveniently located near business hubs, offering high-speed Wi-Fi,
            workspaces, and meeting facilities.
          </BulletItem>
          <BulletItem bold="Family-Friendly">
            Stays Spacious rooms, kid-friendly amenities, and comfortable setups
            ideal for family vacations.
          </BulletItem>
          <BulletItem bold="Budget Hotels & Affordable Stays">
            Clean, comfortable, and cost-effective options with essential
            amenities for value-conscious travellers.
          </BulletItem>
        </Box>

        <Divider />

        {/* Section 3 */}
        <SectionHeading>Why Book Hotels with Dealplex?</SectionHeading>
        <Box component="ul" sx={{ m: 0, pl: "22px", textAlign: "left" }}>
          <BulletItem bold="Wide Range of Choices">
            Choose from thousands of hotels across India, from luxury resorts to
            budget stays and serviced apartments—perfect for short trips or long
            stays.
          </BulletItem>
          <BulletItem bold="Smooth & Hassle-Free Booking">
            Our easy-to-use platform lets you filter hotels by price, location,
            guest ratings, and amenities. With real-time availability and clear
            pricing, booking your stay takes just a few clicks.
          </BulletItem>
          <BulletItem bold="Strong Network, Local Expertise">
            Whether you're travelling within your city or exploring new
            destinations, Dealplex combines extensive coverage with local insights
            to help you choose the best stay.
          </BulletItem>
          <BulletItem bold="Best Deals & Exclusive Savings">
            Unlock special offers, seasonal discounts, cashback deals, and
            value-added benefits like free meals or airport transfers on selected
            hotels.
          </BulletItem>
          <BulletItem bold="Verified Guest Reviews">
            Make confident decisions with genuine reviews from verified guests,
            covering cleanliness, service quality, and overall experience.
          </BulletItem>
          <BulletItem bold="Match Your Vibe">
            Whether it's a romantic escape, business trip, family vacation, or
            adventure break, Dealplex helps you discover stays that perfectly
            match your travel mood.
          </BulletItem>
        </Box>

        <Divider />

        {/* Section 4 */}
        <SectionHeading>How to Book Your Hotel on Dealplex</SectionHeading>
        <BodyText sx={{ mb: 0.8 }}>
          Booking your stay is quick and simple:
        </BodyText>
        <Box component="ul" sx={{ m: 0, pl: "22px", textAlign: "left" }}>
          <BulletItem bold="Search:">
            Enter your destination, travel dates, and guest details
          </BulletItem>
          <BulletItem bold="Compare:">
            Filter hotels by price, ratings, location, or amenities
          </BulletItem>
          <BulletItem bold="Select:">
            Choose the hotel that fits your needs
          </BulletItem>
          <BulletItem bold="Book:">
            Add guest details and complete the payment
          </BulletItem>
          <BulletItem bold="Confirm:">
            Receive instant booking confirmation via email
          </BulletItem>
        </Box>
      </Box>
    </Box>
  );
}