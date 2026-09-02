import React, { useEffect, useState } from "react";
import SecondNavBar from "../src/components/header/second-navbar/SecondNavbar";
import FooterMiddle from "../src/components/footer/footer-middle/FooterMiddle";
import { useSelector, useDispatch } from "react-redux";
import { setConfigData } from "src/redux/slices/configData";
import { useGetConfigData } from "src/api-manage/hooks/useGetConfigData";
import Router from "next/router";
import { Box, Typography, CircularProgress } from "@mui/material";
import Head from "next/head";

function getLabel(loc) {
  try {
    const url = new URL(loc);
    const params = url.searchParams;

    if (params.get("name")) {
      try {
        return atob(params.get("name"));
      } catch {
        return params.get("name");
      }
    }
    if (params.get("module")) {
      const m = params.get("module");
      return m.charAt(0).toUpperCase() + m.slice(1);
    }

    const pathname = url.pathname;
    if (pathname.includes("vehicle-details"))
      return `Vehicle #${pathname.split("/").pop()}`;
    if (pathname === "/" || pathname === "") return "Dealplex Home";

    return pathname
      .replace(/^\//, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return loc;
  }
}

// ✅ FIX: the old version matched module_id with loc.includes("module_id=2"),
// which is a plain substring check against the raw URL string. It happens to
// work today only because 2/3/5 are single digits with no other numeric
// param that could produce that exact substring — but it's fragile (e.g. a
// future module_id=25 would also match "module_id=2" first and get
// mis-bucketed under Grocery). Parsing the actual query param is correct
// regardless of how many modules get added later.
function categorizeUrls(urls) {
  const result = {
    "Main Pages": [],
    "Module Pages": [],
    "Grocery Categories": [],
    "Food Categories": [],
    "Pharmacy Categories": [],
    "Vehicle Pages": [],
  };

  urls.forEach((url) => {
    let params;
    let pathname = "";
    try {
      const parsed = new URL(url.loc);
      params = parsed.searchParams;
      pathname = parsed.pathname;
    } catch {
      result["Main Pages"].push(url);
      return;
    }

    const moduleId = params.get("module_id");

    if (moduleId === "2") result["Grocery Categories"].push(url);
    else if (moduleId === "5") result["Food Categories"].push(url);
    else if (moduleId === "3") result["Pharmacy Categories"].push(url);
    else if (pathname.includes("rental/vehicle-details"))
      result["Vehicle Pages"].push(url);
    else if (params.get("module")) result["Module Pages"].push(url);
    else result["Main Pages"].push(url);
  });

  return result;
}

// XML ke andar production URL hoti hai (e.g. https://shopdealplex.in/...)
// Dev mein usse localhost se replace kar do taaki links locally kaam karein
function toLocalUrl(loc) {
  if (process.env.NODE_ENV !== "development") return loc;

  const localOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  try {
    const url = new URL(loc);
    // Sirf origin replace karo, path + query intact rakho
    return localOrigin + url.pathname + url.search + url.hash;
  } catch {
    return loc;
  }
}

const SitemapPage = () => {
  const dispatch = useDispatch();
  const { configData } = useSelector((state) => state.configData);
  const { data: dataConfig, refetch: refetchConfig } = useGetConfigData();

  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Config data fetch
  useEffect(() => {
    refetchConfig();
  }, [refetchConfig]);

  useEffect(() => {
    if (dataConfig) {
      if (dataConfig.length === 0) {
        Router.push("/404");
      } else if (dataConfig?.maintenance_mode) {
        Router.push("/maintainance");
      } else {
        dispatch(setConfigData(dataConfig));
      }
    }
  }, [dataConfig, dispatch]);

  // Sitemap XML fetch
  useEffect(() => {
    fetch("/sitemap.xml")
      .then((res) => {
        if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
        return res.text();
      })
      .then((xmlText) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");

        // Parse error check
        const parseError = xml.querySelector("parsererror");
        if (parseError) throw new Error("Invalid XML in sitemap");

        const urlNodes = Array.from(xml.querySelectorAll("url"));

        const urls = urlNodes.map((node) => {
          const rawLoc = node.querySelector("loc")?.textContent || "";
          return {
            loc: toLocalUrl(rawLoc), // dev mein localhost, prod mein original
          };
        });

        setSections(categorizeUrls(urls));
        setLoading(false);
      })
      .catch((err) => {
        // ✅ FIX: this was commented out, so a broken sitemap.xml failed
        // completely silently in the browser console too.
        console.error("❌ Sitemap load error:", err.message);
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Head>
        <title>Sitemap — Dealplex</title>
      </Head>

      <SecondNavBar sx={{ boxShadow: "none" }} configData={configData} />

      <Box
        sx={{
          width: "100%",
          px: { xs: 2, sm: 4, md: 6, lg: 10 },
          py: { xs: 3, md: 5 },
        }}
      >
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ mb: 1, color: "#062f15" }}
        >
          Sitemap
        </Typography>

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress sx={{ color: "#1A914B" }} />
          </Box>
        )}

        {/* Error state */}
        {error && !loading && (
          <Box sx={{ mt: 4 }}>
            <Typography color="error" fontSize="0.95rem">
              ⚠️ Sitemap load nahi hua. Check karo ki <code>/sitemap.xml</code>{" "}
              accessible hai.
            </Typography>
            {process.env.NODE_ENV === "development" && (
              <Typography fontSize="0.85rem" sx={{ mt: 1, color: "#666" }}>
                Dev tip: Browser mein{" "}
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#0066c0" }}
                >
                  http://localhost:3000/sitemap.xml
                </a>{" "}
                open karo aur dekho response aa raha hai ya nahi.
              </Typography>
            )}
          </Box>
        )}

        {/* Sitemap sections */}
        {!loading &&
          !error &&
          sections &&
          Object.entries(sections).map(([section, urls]) => {
            if (!urls.length) return null;
            return (
              <Box key={section} sx={{ mb: 5 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ mb: 1.5, color: "#1a1a1a", fontSize: "1.1rem" }}
                >
                  {section}
                  {/* Dev mein count bhi dikhao for quick check */}
                  {process.env.NODE_ENV === "development" && (
                    <Typography
                      component="span"
                      sx={{ ml: 1, fontSize: "0.78rem", color: "#888" }}
                    >
                      ({urls.length})
                    </Typography>
                  )}
                </Typography>

                <Box sx={{ lineHeight: 2 }}>
                  {urls.map((url, i) => (
                    <React.Fragment key={i}>
                      <Typography
                        component="a"
                        href={url.loc}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          fontSize: "0.88rem",
                          color: "#0066c0",
                          textDecoration: "none",
                          "&:hover": {
                            textDecoration: "underline",
                            color: "#c45500",
                          },
                        }}
                      >
                        {getLabel(url.loc)}
                      </Typography>
                      {i < urls.length - 1 && (
                        <Typography
                          component="span"
                          sx={{ mx: 0.8, color: "#999", fontSize: "0.85rem" }}
                        >
                          |
                        </Typography>
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            );
          })}
      </Box>

      <FooterMiddle configData={configData} />
    </>
  );
};

export default SitemapPage;
