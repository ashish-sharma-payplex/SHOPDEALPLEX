const buildHeadersWithModule9 = () => {
  if (typeof window === "undefined") return null;

  try {
    const zoneRaw = localStorage.getItem("zoneid");
    const latLngRaw = localStorage.getItem("currentLatLng");
    const token = localStorage.getItem("token");

    if (!zoneRaw || !latLngRaw) {
      // console.warn("Zone or location missing");
      return null;
    }

    const zoneId = JSON.parse(zoneRaw);
    const { lat, lng } = JSON.parse(latLngRaw);

    return {
      moduleId: "9", // ✅ YOUR REQUIRED MODULE
      zoneId: JSON.stringify(zoneId),
      latitude: lat,
      longitude: lng,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

  } catch (error) {
    // console.error("Header build failed:", error);
    return null;
  }
};