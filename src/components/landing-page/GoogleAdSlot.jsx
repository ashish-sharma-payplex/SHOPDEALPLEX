import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

const ADSENSE_CLIENT = "ca-pub-4665396560054617";

const GoogleAdSlot = ({
  slot = "9266006103",
  format = "auto",
  fullWidthResponsive = true,
}) => {
  const insRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("Adsense error:", err);
      }
    }, 200);

    const el = insRef.current;
    if (!el) return () => clearTimeout(timer);

    const observer = new MutationObserver(() => {
      const adStatus = el.getAttribute("data-ad-status");

      if (adStatus === "filled") {
        setStatus("filled");
      } else if (adStatus === "unfilled") {
        setStatus("unfilled");
      }
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });

    const fallback = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "unfilled" : prev));
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  if (status === "unfilled") {
    return null;
  }

  return (
    <Box>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={
          fullWidthResponsive ? "true" : "false"
        }
      />
    </Box>
  );
};

export default GoogleAdSlot;