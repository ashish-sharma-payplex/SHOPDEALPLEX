import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Box,
    Card,
    Typography,
    Divider,
    Button,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import {
    GoogleMap,
    useJsApiLoader,
    MarkerF,
    DirectionsService,
    DirectionsRenderer,
} from "@react-google-maps/api";
import { grayMapStyle } from "../mapColor.js";
import useParcelCancelReasons from "api-manage/hooks/react-query/percel/useParcelCancelReasons";
import useParcelCancelBooking from "api-manage/hooks/react-query/percel/useParcelCancelBooking";
import toast from "react-hot-toast";

// ✅ Vehicle type ke hisaab se Google Maps icon
const getVehicleIcon = (vehicleType) => {
    const type = vehicleType?.toLowerCase();
    const iconMap = {
        truck: "https://maps.google.com/mapfiles/ms/icons/truck.png",
        bike: "https://maps.google.com/mapfiles/ms/icons/motorcycling.png",
        scooter: "https://maps.google.com/mapfiles/ms/icons/motorcycling.png",
        car: "https://maps.google.com/mapfiles/ms/icons/cabs.png",
        auto: "https://maps.google.com/mapfiles/ms/icons/taxi.png",
    };
    return {
        url: iconMap[type] || "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        scaledSize: new window.google.maps.Size(44, 44),
    };
};

const LiveTrackingLayout = ({
    data,
    bookingId,
    parcelId,        // ✅ NEW PROP
    amount,
    payment,
    fetchDriverLocation,
}) => {
    const driver = data?.driver_details;
    const vehicle = data?.vehicle_details;
    const location = data?.driver_live_location;
    const pickup = data?.pickup_location;

    // ✅ Map States
    const [driverLivePos, setDriverLivePos] = useState({
        lat: parseFloat(location?.latitude),
        lng: parseFloat(location?.longitude),
    });
    const [directions, setDirections] = useState(null);
    const [directionsFetched, setDirectionsFetched] = useState(false);
    const [arrivalTime, setArrivalTime] = useState(null);
    const pollingRef = useRef(null);

    // ✅ Cancel States — BookingStatusCard se liya
    const [openCancelPopup, setOpenCancelPopup] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [isCancelled, setIsCancelled] = useState(false);

    // ✅ Cancel Hooks
    const cancelBookingMutation = useParcelCancelBooking(parcelId);
    const { data: cancelReasons = [], isLoading: reasonsLoading } =
        useParcelCancelReasons(openCancelPopup);

    // ✅ Cancel Handlers
    const handleCancelClick = () => {
        setOpenCancelPopup(true);
    };

    const handleReasonChange = (event) => {
        setSelectedReason(event.target.value);
    };

    const handleConfirmCancel = () => {
        if (!selectedReason) {
            toast.error("Please select a cancellation reason");
            return;
        }
        if (!parcelId) {
            toast.error("Parcel ID is missing. Cannot cancel booking.");
            return;
        }
        cancelBookingMutation.mutate(
            { parcel_id: parcelId, reason: selectedReason },
            {
                onSuccess: () => {
                    setOpenCancelPopup(false);
                    setIsCancelled(true);
                    toast.success("Booking cancelled successfully!");
                },
                onError: () => {
                    toast.error("Failed to cancel booking. Please try again.");
                },
            }
        );
    };

    // ✅ Pickup Position
    const pickupPos = useMemo(
        () => ({
            lat: parseFloat(pickup?.latitude),
            lng: parseFloat(pickup?.longitude),
        }),
        [pickup?.latitude, pickup?.longitude]
    );

    // ✅ Map Center
    const mapCenter = useMemo(
        () => ({
            lat: (driverLivePos.lat + pickupPos.lat) / 2,
            lng: (driverLivePos.lng + pickupPos.lng) / 2,
        }),
        [driverLivePos, pickupPos]
    );

    const mapOptions = useMemo(
        () => ({
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            styles: grayMapStyle,
        }),
        []
    );

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    });

    // ✅ Auto Bounds Fit
    const onLoad = useCallback(
        (mapInstance) => {
            if (window.google) {
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(driverLivePos);
                bounds.extend(pickupPos);
                mapInstance.fitBounds(bounds, { padding: 80 });
            }
        },
        [driverLivePos, pickupPos]
    );

    // ✅ Directions Callback
    const directionsCallback = useCallback((result, status) => {
        if (status === "OK") {
            setDirections(result);
            setDirectionsFetched(true);
            const leg = result.routes[0].legs[0];
            setArrivalTime({
                duration: leg.duration.text,
                distance: leg.distance.text,
            });
        }
    }, []);

    // ✅ Live Polling — cancel ho gaya toh polling band
    useEffect(() => {
        if (!fetchDriverLocation || isCancelled) return;

        pollingRef.current = setInterval(async () => {
            try {
                const newLocation = await fetchDriverLocation();
                if (newLocation?.latitude && newLocation?.longitude) {
                    const newPos = {
                        lat: parseFloat(newLocation.latitude),
                        lng: parseFloat(newLocation.longitude),
                    };
                    setDriverLivePos(newPos);
                    setDirectionsFetched(false);
                }
            } catch (err) {
                // console.error("Driver location fetch failed:", err);
            }
        }, 10000);

        return () => clearInterval(pollingRef.current);
    }, [fetchDriverLocation, isCancelled]); // ✅ isCancelled change hone par polling band

    // ================= CANCELLED SCREEN =================
    if (isCancelled) {
        return (
            <Box textAlign="center" sx={{ mt: 10, px: 3 }}>
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "#f8d7da",
                        mx: "auto",
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#721c24",
                        fontSize: 36,
                        fontWeight: "bold",
                    }}
                >
                    &#10060;
                </Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                    Your order has been cancelled!
                </Typography>
                <Typography color="text.secondary" mb={3}>
                    Your booking #{bookingId} has been cancelled. Feel free to rebook
                    whenever you're ready.
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => (window.location.href = "/home?module=parcel")}
                    sx={{ borderColor: "#4caf50", color: "#4caf50" }}
                >
                    Go Back
                </Button>
            </Box>
        );
    }

    // ================= MAIN TRACKING LAYOUT =================
    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f8fafd",
                    p: 3,
                    boxSizing: "border-box",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        width: "100%",
                        gap: 2,
                        alignItems: "stretch",
                        boxSizing: "border-box",
                    }}
                >
                    {/* ================= LEFT SECTION (40%) ================= */}
                    <Card
                        elevation={0}
                        sx={{
                            flex: "0 0 40%",
                            borderRadius: "24px",
                            p: 3,
                            border: "1px solid #f0f0f0",
                            bgcolor: (theme) => theme.palette.background.paper,
                            display: "flex",
                            flexDirection: "column",
                            boxSizing: "border-box",
                        }}
                    >
                        {/* 1. Image */}
                        <Box sx={{ mb: 2 }}>
                            <Box
                                component="img"
                                src="/driverPickup.png"
                                sx={{
                                    width: "100%",
                                    height: "auto",
                                    borderRadius: "20px",
                                    display: "block",
                                }}
                            />
                        </Box>

                        {/* 2. Arrival Time */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                background: "linear-gradient(to right, #c8f5dc, #f0fdf6)",
                                px: 2,
                                py: 1,
                                borderRadius: "10px",
                                mb: 3,
                                width: "100%",
                            }}
                        >
                            <Typography
                                sx={{ color: "#1f8f4a", fontSize: "14px", fontWeight: 600 }}
                            >
                                {arrivalTime
                                    ? `Arriving in ${arrivalTime.duration} • ${arrivalTime.distance}`
                                    : "Calculating..."}
                            </Typography>
                        </Box>

                        {/* 3. Heading */}
                        <Typography
                            sx={{
                                fontSize: "19px",
                                fontWeight: 900,
                                color: "#0a1f44",
                                lineHeight: 1.2,
                                mb: 4,
                            }}
                        >
                            Your driver partner is on their way to the Pickup location!
                        </Typography>

                        {/* 4. Driver & Vehicle Info */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 3,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Box
                                    component="img"
                                    src="/parcelScooter.png"
                                    sx={{ width: 60, height: "auto" }}
                                />
                                <Box>
                                    <Typography
                                        sx={{
                                            color: "#7e8ba0",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {vehicle?.vehicle_type} • {driver?.driver_name}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: "#1d443a",
                                            fontWeight: 800,
                                            fontSize: "19px",
                                            mt: 0.2,
                                        }}
                                    >
                                        {vehicle?.vehicle_no}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton sx={{ color: "#1f8f4a", p: 0 }}>
                                <CallOutlinedIcon sx={{ fontSize: 28 }} />
                            </IconButton>
                        </Box>

                        <Divider
                            sx={{ borderStyle: "dashed", borderColor: "#e0e4eb", mb: 2 }}
                        />

                        {/* 5. Order Details */}
                        <Box
                            sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                        >
                            <Typography sx={{ fontWeight: 700, fontSize: "16px" }}>
                                Order Details
                            </Typography>
                            <ExpandMoreIcon />
                        </Box>
                        <Typography sx={{ color: "#7e8ba0", fontSize: "14px", mb: 2 }}>
                            Order ID : #{bookingId}
                        </Typography>

                        <Divider
                            sx={{ borderStyle: "dashed", borderColor: "#e0e4eb", mb: 2 }}
                        />

                        {/* 6. Payment */}
                        <Box
                            sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}
                        >
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: "15px" }}>
                                    {payment}
                                </Typography>
                                <Typography sx={{ color: "#7e8ba0", fontSize: "12px" }}>
                                    Payment Method
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "16px" }}>
                                    ₹{amount}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "#1f8f4a",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    View Breakup
                                </Typography>
                            </Box>
                        </Box>

                        {/* 7. Cancel Button — ✅ onClick added */}
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleCancelClick}   // ✅ Cancel popup open
                            sx={{
                                py: 1.5,
                                color: "#ff4d4f",
                                borderColor: "#ff7675",
                                borderRadius: "12px",
                                textTransform: "none",
                                fontWeight: 700,
                                borderWidth: "1.5px",
                                mt: "auto",
                            }}
                        >
                            Cancel Booking
                        </Button>
                    </Card>

                    {/* ================= RIGHT SECTION (60%) ================= */}
                    {/* ================= RIGHT SECTION (60%) ================= */}
                    <Box
                        sx={{
                            flex: "0 0 60%",
                            borderRadius: "24px",
                            overflow: "hidden",
                            border: "1px solid #f0f0f0",
                            minHeight: "500px",
                            position: "relative", // IMPORTANT
                        }}
                    >
                        {/* ✅ Overlay (top message) */}
                        <Box
                            sx={{
                                position: "absolute",
                                top: 16,
                                left: "50%",
                                transform: "translateX(-50%)",
                                bgcolor: (theme) => theme.palette.background.paper,
                                px: 2,
                                py: 1,
                                borderRadius: "10px",
                                boxShadow: 2,
                                fontWeight: 600,
                                zIndex: 10,
                            }}
                        >
                            Driver is on the way to pickup
                        </Box>

                        {/* ✅ Map */}
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "100%" }}
                                center={mapCenter}
                                zoom={14}
                                onLoad={onLoad}
                                options={mapOptions}
                            >
                                {/* 🚛 Driver Marker */}
                                <MarkerF
                                    position={driverLivePos}
                                    icon={getVehicleIcon(vehicle?.vehicle_type)}
                                    title={`Driver: ${driver?.driver_name} • ${vehicle?.vehicle_no}`}
                                />

                                {/* 📦 Pickup Marker */}
                                <MarkerF
                                    position={pickupPos}
                                    icon={{
                                        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                        scaledSize: new window.google.maps.Size(44, 44),
                                    }}
                                    title={`Pickup: ${pickup?.pickup_location}`}
                                />

                                {/* 🛣️ Directions Fetch */}
                                {!directionsFetched && (
                                    <DirectionsService
                                        options={{
                                            origin: driverLivePos,
                                            destination: pickupPos,
                                            travelMode: "DRIVING",
                                        }}
                                        callback={directionsCallback}
                                    />
                                )}

                                {/* 🗺️ Route Render */}
                                {directions && (
                                    <DirectionsRenderer
                                        directions={directions}
                                        options={{
                                            suppressMarkers: true,
                                            polylineOptions: {
                                                strokeColor: "#1f8f4a",
                                                strokeWeight: 5,
                                                strokeOpacity: 0.8,
                                            },
                                        }}
                                    />
                                )}
                            </GoogleMap>
                        ) : (
                            <Box
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    minHeight: "500px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "#f0f4f8",
                                }}
                            >
                                <CircularProgress sx={{ color: "#1f8f4a" }} />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box >

            {/* ✅ Cancel Popup Dialog — BookingStatusCard se same */}
            < Dialog
                open={openCancelPopup}
                onClose={() => setOpenCancelPopup(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Select Cancel Reason</DialogTitle>
                <DialogContent>
                    {reasonsLoading ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        <RadioGroup value={selectedReason} onChange={handleReasonChange}>
                            {cancelReasons.map((item) => (
                                <FormControlLabel
                                    key={item.id || item.reason}
                                    value={item.reason}
                                    control={<Radio />}
                                    label={item.reason}
                                />
                            ))}
                        </RadioGroup>
                    )}
                    <Button
                        onClick={handleConfirmCancel}
                        variant="contained"
                        color="error"
                        disabled={cancelBookingMutation.isLoading}
                        sx={{ mt: 2 }}
                        fullWidth
                    >
                        {cancelBookingMutation.isLoading ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                </DialogContent>
            </Dialog >
        </>
    );
};

export default LiveTrackingLayout;