/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    turbo: {},
    workerThreads: false,
    cpus: 1,
  },

  images: {
    domains: [
      "dealplex.in",
      "shopdealplex.in",
      "dealplex-admin.s3.ap-south-1.amazonaws.com",
    ],
    // ✅ NAYA — modern formats use honge (WebP/AVIF), image size/performance improve karega
    formats: ["image/avif", "image/webp"],
  },

  // ✅ NAYA — production build mein saare console.log/info/warn hata do,
  // sirf console.error rakho (crash/error tracking ke liye zaroori hai)
  // Development (npm run dev) mein sab logs normal dikhenge, koi asar nahi
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  // ✅ NAYA — gzip/brotli compression on (agar host already nahi kar raha)
  compress: true,

  async headers() {
    return [
      // ✅ hashed static JS/CSS files, safe long-term cache
      // (naam hamesha unique hash ke sath hota hai, naya build = naya naam)
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ✅ NAYA — images bhi long-term cache ho sakti hain safely
      // (agar image change ho, naya URL/filename use karna, warna purani hi dikhegi)
      {
        source: "/_next/image:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ✅ BADLA — pehle "no-store, no-cache" tha jo HAR page ko
      // har baar fresh download karwata tha (performance ke liye bura).
      // Ab "must-revalidate" ke sath thoda cache allow kiya hai —
      // browser cache karega, lekin server se hamesha check karega
      // ki naya version hai ya nahi. Isse purana/missing chunk wala
      // crash bhi nahi hoga, aur baar baar full re-download bhi nahi hoga.
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },

      // ✅ /home wale filtered URLs
      {
        source: "/home",
        has: [{ type: "query", key: "data_type" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/home",
        has: [{ type: "query", key: "search" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/home",
        has: [{ type: "query", key: "id" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/home",
        has: [{ type: "query", key: "zone_id" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/home",
        has: [{ type: "query", key: "name" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // ✅ Root "/" wale filtered URLs
      {
        source: "/",
        has: [{ type: "query", key: "data_type" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/",
        has: [{ type: "query", key: "search" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/",
        has: [{ type: "query", key: "id" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  async redirects() {
    return [
      // ✅ Root page pe filtered URLs aayein toh "/" pe redirect
      {
        source: "/",
        has: [{ type: "query", key: "data_type" }],
        destination: "/",
        permanent: false,
      },
      {
        source: "/",
        has: [{ type: "query", key: "search" }],
        destination: "/",
        permanent: false,
      },
      {
        source: "/",
        has: [{ type: "query", key: "id" }],
        destination: "/",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
