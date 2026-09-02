const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shopdealplex.in";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dealplex.in";

const ZONE_ID = [15];

// Give every outbound fetch a hard timeout so a slow/hanging backend for one
// module (e.g. grocery/pharmacy) can't silently starve the whole sitemap.
const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function normalizeCategoryList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

function sanitizeCategories(list, label) {
  const valid = [];
  for (const cat of list) {
    if (
      cat &&
      cat.id != null &&
      typeof cat.name === "string" &&
      cat.name.trim()
    ) {
      valid.push(cat);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[sitemap] Skipping malformed ${label} category:`, cat);
    }
  }
  return valid;
}

function safeBase64(str) {
  return Buffer.from(String(str ?? "")).toString("base64");
}

function safeISODate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// ✅ FIX (this turn): the sitemap only ever linked to TOP-LEVEL categories
// from `/api/v1/categories`. In this app's data model, products are tagged
// to LEAF/child categories only — a parent category (e.g. "All Medicines")
// has zero products of its own; its children (e.g. "Fever & Pain Relief")
// do. The app's own internal navigation (categorySubcat.js →
// navigateToSubcategory) always sends BOTH `id` (parent) AND
// `subcategory_id` (child) together, and the product grid
// (cardLoader.js → fetchProductPage) picks `subid` over `catid` for exactly
// this reason. Sitemap links never carried `subcategory_id`, so every
// sitemap category click landed on a parent category with 0 products →
// "No products found" — for Grocery/Food/Pharmacy alike, not just Pharmacy.
//
// Fix: for every top-level category, fetch its children via
// `/api/v1/categories/childes/{parentId}` and generate one URL per LEAF
// category (parent id + subcategory_id). If a category genuinely has no
// children (a flat/leaf top-level category), keep the old parent-only link
// as a safe fallback — some smaller modules may have products directly on
// top-level categories.
async function fetchChildCategories(parentId, moduleIdHeader, commonHeaders) {
  try {
    const res = await fetchWithTimeout(
      `${BASE_URL}/api/v1/categories/childes/${parentId}`,
      {
        method: "GET",
        headers: { ...commonHeaders, moduleId: moduleIdHeader },
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return sanitizeCategories(
      normalizeCategoryList(data),
      `child-of-${parentId}`,
    );
  } catch {
    return [];
  }
}

async function expandToLeafCategories(
  parentCategories,
  moduleIdHeader,
  commonHeaders,
) {
  const childResults = await Promise.allSettled(
    parentCategories.map((parent) =>
      fetchChildCategories(parent.id, moduleIdHeader, commonHeaders),
    ),
  );

  const leaves = [];
  parentCategories.forEach((parent, i) => {
    const children =
      childResults[i].status === "fulfilled" ? childResults[i].value : [];

    if (children.length > 0) {
      children.forEach((child) => {
        leaves.push({
          id: parent.id,
          subcategoryId: child.id,
          name: child.name,
        });
      });
    } else {
      // No children found — treat this parent as a leaf itself (fallback).
      leaves.push({ id: parent.id, subcategoryId: null, name: parent.name });
    }
  });

  return leaves;
}

function categoryUrlBlock(leafCategories, moduleId, moduleName) {
  return leafCategories
    .map(
      (cat) => `
  <url>
    <loc>${SITE_URL}/home?search=category&amp;id=${cat.id}${
        cat.subcategoryId ? `&amp;subcategory_id=${cat.subcategoryId}` : ""
      }&amp;module_id=${moduleId}&amp;module=${moduleName}&amp;zone_id=%5B15%5D&amp;name=${safeBase64(
        cat.name,
      )}&amp;data_type=category</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    )
    .join("");
}

function generateSiteMap(
  vehicles = [],
  groceryCategories = [],
  foodCategories = [],
  pharmacyCategories = [],
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Main Pages -->
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${SITE_URL}/home</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Module Pages -->
  <url>
    <loc>${SITE_URL}/home?module=grocery</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${SITE_URL}/home?module=food</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${SITE_URL}/home?module=pharmacy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${SITE_URL}/home?module=ecommerce</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${SITE_URL}/home?module=parcel</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${SITE_URL}/home?module=rental</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Grocery Categories — Dynamic (${groceryCategories.length} categories) -->
  ${categoryUrlBlock(groceryCategories, 2, "grocery")}

  <!-- Food Categories — Dynamic (${foodCategories.length} categories) -->
  ${categoryUrlBlock(foodCategories, 5, "food")}

  <!-- Pharmacy Categories — Dynamic (${
    pharmacyCategories.length
  } categories) -->
  ${categoryUrlBlock(pharmacyCategories, 3, "pharmacy")}

  <!-- Vehicle Pages — Dynamic (${vehicles.length} vehicles) -->
  ${vehicles
    .map(
      (vehicle) => `
  <url>
    <loc>${SITE_URL}/rental/vehicle-details/${vehicle.id}${
        vehicle.name ? `?name=${safeBase64(vehicle.name)}` : ""
      }</loc>
    <lastmod>${safeISODate(vehicle.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    )
    .join("")}

</urlset>`;
}

function SiteMap() {}

export const getServerSideProps = async ({ res }) => {
  //  Disabling TLS certificate validation for every outbound request from
  // this process is a real security risk (it defeats protection against
  // man-in-the-middle attacks) and should only ever be a temporary workaround
  // for a specific self-signed backend cert — not left on globally. Remove
  // this once the API has a valid certificate, or scope it to a single
  // request via an https.Agent instead of a process-wide env flag.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const commonHeaders = {
    "Content-Type": "application/json",
    zoneId: JSON.stringify(ZONE_ID),
    latitude: "18.5204",
    longitude: "73.8567",
  };

  const [vehiclesRes, groceryRes, foodRes, pharmacyRes] =
    await Promise.allSettled([
      fetchWithTimeout(
        `${BASE_URL}/api/v1/rental/vehicle/search?limit=500&offset=0`,
        {
          method: "GET",
          headers: {
            ...commonHeaders,
            "X-software-id": "33571750",
            moduleId: "9",
          },
        },
      ),
      fetchWithTimeout(`${BASE_URL}/api/v1/categories`, {
        method: "GET",
        headers: { ...commonHeaders, moduleId: "2" },
      }),
      fetchWithTimeout(`${BASE_URL}/api/v1/categories`, {
        method: "GET",
        headers: { ...commonHeaders, moduleId: "5" },
      }),
      fetchWithTimeout(`${BASE_URL}/api/v1/categories`, {
        method: "GET",
        headers: { ...commonHeaders, moduleId: "3" },
      }),
    ]);

  let vehicles = [];
  let groceryCategories = [];
  let foodCategories = [];
  let pharmacyCategories = [];

  // ✅ FIX: restored real logging. This is the single most important change —
  // without it, a failing grocery/pharmacy fetch is completely invisible.
  if (vehiclesRes.status === "fulfilled" && vehiclesRes.value.ok) {
    const data = await vehiclesRes.value.json();
    vehicles = Array.isArray(data?.vehicles) ? data.vehicles : [];
    console.log(`[sitemap] Vehicles fetched: ${vehicles.length}`);
  } else {
    console.warn(
      "[sitemap] Vehicles fetch failed:",
      vehiclesRes.status === "fulfilled"
        ? `HTTP ${vehiclesRes.value.status}`
        : vehiclesRes.reason,
    );
  }

  if (groceryRes.status === "fulfilled" && groceryRes.value.ok) {
    const data = await groceryRes.value.json();
    groceryCategories = sanitizeCategories(
      normalizeCategoryList(data),
      "grocery",
    );
    console.log(
      `[sitemap] Grocery categories fetched: ${groceryCategories.length}`,
    );
  } else {
    console.warn(
      "[sitemap] Grocery categories fetch failed:",
      groceryRes.status === "fulfilled"
        ? `HTTP ${groceryRes.value.status}`
        : groceryRes.reason,
    );
  }

  if (foodRes.status === "fulfilled" && foodRes.value.ok) {
    const data = await foodRes.value.json();
    foodCategories = sanitizeCategories(normalizeCategoryList(data), "food");
    console.log(`[sitemap] Food categories fetched: ${foodCategories.length}`);
  } else {
    console.warn(
      "[sitemap] Food categories fetch failed:",
      foodRes.status === "fulfilled"
        ? `HTTP ${foodRes.value.status}`
        : foodRes.reason,
    );
  }

  if (pharmacyRes.status === "fulfilled" && pharmacyRes.value.ok) {
    const data = await pharmacyRes.value.json();
    pharmacyCategories = sanitizeCategories(
      normalizeCategoryList(data),
      "pharmacy",
    );
    console.log(
      `[sitemap] Pharmacy categories fetched: ${pharmacyCategories.length}`,
    );
  } else {
    console.warn(
      "[sitemap] Pharmacy categories fetch failed:",
      pharmacyRes.status === "fulfilled"
        ? `HTTP ${pharmacyRes.value.status}`
        : pharmacyRes.reason,
    );
  }

  // ✅ FIX: expand each module's top-level categories into their LEAF
  // (child) categories — see the big comment above categoryUrlBlock for why.
  // Wrapped in try/catch per module so a childes-API hiccup for one module
  // degrades to parent-only links for that module instead of failing the
  // whole sitemap.
  let groceryLeafCategories = [];
  let foodLeafCategories = [];
  let pharmacyLeafCategories = [];

  try {
    groceryLeafCategories = await expandToLeafCategories(
      groceryCategories,
      "2",
      commonHeaders,
    );
    console.log(
      `[sitemap] Grocery leaf categories expanded: ${groceryLeafCategories.length}`,
    );
  } catch (err) {
    console.error(
      "[sitemap] Grocery leaf expansion failed, using parents:",
      err,
    );
    groceryLeafCategories = groceryCategories.map((c) => ({
      id: c.id,
      subcategoryId: null,
      name: c.name,
    }));
  }

  try {
    foodLeafCategories = await expandToLeafCategories(
      foodCategories,
      "5",
      commonHeaders,
    );
    console.log(
      `[sitemap] Food leaf categories expanded: ${foodLeafCategories.length}`,
    );
  } catch (err) {
    console.error("[sitemap] Food leaf expansion failed, using parents:", err);
    foodLeafCategories = foodCategories.map((c) => ({
      id: c.id,
      subcategoryId: null,
      name: c.name,
    }));
  }

  try {
    pharmacyLeafCategories = await expandToLeafCategories(
      pharmacyCategories,
      "3",
      commonHeaders,
    );
    console.log(
      `[sitemap] Pharmacy leaf categories expanded: ${pharmacyLeafCategories.length}`,
    );
  } catch (err) {
    console.error(
      "[sitemap] Pharmacy leaf expansion failed, using parents:",
      err,
    );
    pharmacyLeafCategories = pharmacyCategories.map((c) => ({
      id: c.id,
      subcategoryId: null,
      name: c.name,
    }));
  }

  let sitemap;
  try {
    sitemap = generateSiteMap(
      vehicles,
      groceryLeafCategories,
      foodLeafCategories,
      pharmacyLeafCategories,
    );
  } catch (err) {
    // ✅ FIX: generateSiteMap previously had no safety net at all — one bad
    // record anywhere could crash the entire route with a 500. Now we log it
    // and still return whatever we can (main + module pages) instead of
    // nothing.
    console.error("[sitemap] generateSiteMap threw, serving fallback:", err);
    sitemap = generateSiteMap([], [], [], []);
  }

  res.setHeader("Content-Type", "text/xml");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate",
  );
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default SiteMap;
