import Head from "next/head";
import PropTypes from "prop-types";
import { useRouter } from "next/router";

const SEO = ({
  title,
  description,
  keywords,
  image,
  businessName,
  configData,
  noIndex = false,
  canonical,
  robots,
  schema,
}) => {
  const router = useRouter();
  const siteName = businessName || "Dealplex";
  const siteUrl = "https://shopdealplex.in"; // ✅ FIXED: .com → .in

  const cleanPath = router.asPath.split("?")[0];
  const url = canonical || `${siteUrl}${cleanPath}`;

  const fullTitle = title
    ? title.includes(siteName)
      ? title
      : `${title} | ${siteName}`
    : siteName;

  const robotsContent = noIndex ? "noindex, nofollow" : robots || "index, follow";

  // ✅ FAVICON FIX — favicon URL, configData se (agar hai) ya fallback static
  // path se. Google search results me chhota site-icon isi <link rel="icon">
  // tag se pick hota hai — pehle ye tag hi missing tha, isliye generic globe
  // icon dikh raha tha.
  const faviconUrl = configData?.fav_icon_full_url || "/icons/favicon.png";

  return (
    <Head>
      <title>{fullTitle}</title>

      <meta name="robots" content={robotsContent} />

      {/* ✅ FAVICON FIX — in 3 tags se hi Google/browsers favicon crawl karte hain */}
      <link rel="icon" href={faviconUrl} />
      <link rel="shortcut icon" href={faviconUrl} />
      <link rel="apple-touch-icon" href={faviconUrl} />

      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || siteName} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteName} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={url} />
      {image && <meta name="twitter:image" content={image} />}

      <meta itemProp="name" content={title || siteName} />
      <meta itemProp="description" content={description} />
      {image && <meta itemProp="image" content={image} />}

      <meta
        name="google-site-verification"
        content="avkLkjpZ9AlGSJIV0bV7cGZZlS5eZ1u10h1sL86USSQ"
      />

      {!noIndex && <link rel="canonical" href={url} />}

      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: typeof schema === "string" ? schema : JSON.stringify(schema),
          }}
        />
      )}
    </Head>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  businessName: PropTypes.string,
  configData: PropTypes.object,
  noIndex: PropTypes.bool,
  canonical: PropTypes.string,
  robots: PropTypes.string,
  schema: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default SEO;