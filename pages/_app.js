// pages/_app.js
import "../src/styles/globals.css";
import "../src/styles/nprogress.css";
import "../src/styles/smooth-scroll.css";
import foodStyles from "../src/styles/Food.module.css";
import navbarStyles from "../src/styles/navbar.module.css";
import footerStyles from "../src/styles/footer.module.css";

import Head from "next/head";
import Script from "next/script";

import { CacheProvider } from "@emotion/react";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import createEmotionCache from "../src/utils/create-emotion-cache";
import { store } from "redux/store";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "theme";

import CssBaseline from "@mui/material/CssBaseline";
import { RTL } from "components/rtl";
import { Toaster } from "react-hot-toast";

import { getServerSideProps } from "./index";
import { SettingsConsumer, SettingsProvider } from "contexts/settings-context";

import "../src/language/i18n";

import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import nProgress from "nprogress";
import Router, { useRouter } from "next/router";

import { persistStore } from "redux-persist";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import useScrollRestoration from "api-manage/hooks/custom-hooks/useSCrollRestoration";

import { useGetWishList } from "../src/components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/wishlist/useGetWishlist";

import LocationModal from "../src/components/location/LocationModal";

import { setWishList } from "../src/redux/slices/wishList";
import DynamicFavicon from "../src/components/favicon/DynamicFavicon";

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

export const currentVersion = process.env.NEXT_PUBLIC_SITE_VERSION;

const clientSideEmotionCache = createEmotionCache();

// Paths jaha LocationModal show NAHI hona chahiye
const LOCATION_MODAL_HIDDEN_PATHS = [
  "/about-us",
  "/privacy-policy",
  "/refund-policy",
  "/contactus",
  "/terms-and-conditions",
];

function WishlistLoader({ children }) {
  const dispatch = useDispatch();
  const { refetch: getWishlist } = useGetWishList();

  useEffect(() => {
    getWishlist().then((res) => {
      if (res?.data) {
        dispatch(setWishList(res.data));
        // console.log("✅ Global wishlist loaded:", res.data);
      }
    });
  }, []);

  return children;
}

function MyApp(props) {
  const {
    Component,
    emotionCache = clientSideEmotionCache,
    pageProps,
    configData,
  } = props;

  const getLayout = Component.getLayout ?? ((page) => page);

  const { t } = useTranslation();
  const router = useRouter();

  const shouldShowLocationModal = !LOCATION_MODAL_HIDDEN_PATHS.includes(
    router.pathname,
  );

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 2,
      },
    },
  });

  let persistor = persistStore(store);

  useEffect(() => {
    const storedVersion = localStorage.getItem("appVersion");

    if (storedVersion !== currentVersion) {
      const cartKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("cart_"),
      );

      const preservedCartData = {};

      cartKeys.forEach((key) => {
        preservedCartData[key] = localStorage.getItem(key);
      });

      localStorage.clear();

      Object.keys(preservedCartData).forEach((key) => {
        localStorage.setItem(key, preservedCartData[key]);
      });

      localStorage.setItem("appVersion", currentVersion);
    }

    const storedModule = localStorage.getItem("module");

    if (!storedModule) {
      const defaultModule = {
        id: 5,
        module_type: "default",
      };

      localStorage.setItem("module", JSON.stringify(defaultModule));
    }
  }, []);

  // 1. Existing route change scroll to top
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    Router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      Router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  // 2. GA4 Page View Tracking on Route Change
  useEffect(() => {
    const handleGA4RouteChange = (url) => {
      if (window.gtag) {
        window.gtag("config", "G-8LLYXQ2JT4", {
          page_path: url,
        });
      }
    };

    // Track on initial load
    handleGA4RouteChange(router.pathname);

    // Track on subsequent SPA route changes
    router.events.on("routeChangeComplete", handleGA4RouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleGA4RouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    const handlePixelTracking = () => {
      if (window.fbq) {
        window.fbq("track", "PageView");
      }
    };

    Router.events.on("routeChangeComplete", handlePixelTracking);

    return () => {
      Router.events.off("routeChangeComplete", handlePixelTracking);
    };
  }, []);

  useScrollRestoration();

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        {/* Facebook Pixel Noscript */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1859577851400056&ev=PageView&noscript=1"
          />
        </noscript>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1703414094131256&ev=PageView&noscript=1"
          />
        </noscript>
        {/* GTM noscript REMOVED — ab _document.js ke body mein hai */}
      </Head>

      {/* Facebook Pixel Script */}
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {
              if(f.fbq)return;
              n=f.fbq=function(){
                n.callMethod ?
                n.callMethod.apply(n,arguments) :
                n.queue.push(arguments)
              };
              if(!f._fbq)f._fbq=n;
              n.push=n;
              n.loaded=!0;
              n.version='2.0';
              n.queue=[];
              t=b.createElement(e);
              t.async=!0;
              t.src=v;
              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
            }(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1859577851400056');
            fbq('init', '1703414094131256');
            fbq('track', 'PageView');
          `,
        }}
      />

      {/* GTM Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NJJGM8XM');
          `,
        }}
      />

      {/* GA4 — G-8LLYXQ2JT4 */}
      <Script
        id="ga4-gtag"
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-8LLYXQ2JT4"
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8LLYXQ2JT4');
          `,
        }}
      />
      <Script
        id="adsense-script"
        async
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4665396560054617"
        crossOrigin="anonymous"
      />
      <QueryClientProvider client={queryClient}>
        <ReduxProvider store={store}>
          <WishlistLoader>
            <DynamicFavicon />
            <SettingsProvider>
              <SettingsConsumer>
                {(value) => (
                  <ThemeProvider
                    theme={createTheme({
                      direction: value?.settings?.direction,
                      responsiveFontSizes: value?.settings?.responsiveFontSizes,
                      mode: value?.settings?.theme,
                    })}
                  >
                    <RTL direction={value?.settings?.direction}>
                      <div
                        className={`${navbarStyles.navbarThemeVars} ${footerStyles.footerThemeVars} ${foodStyles.foodThemeVars}`}
                      >
                        <CssBaseline />

                        {getLayout(<Component {...pageProps} />)}

                        {shouldShowLocationModal && <LocationModal />}

                        <Toaster />
                      </div>
                    </RTL>
                  </ThemeProvider>
                )}
              </SettingsConsumer>
            </SettingsProvider>
          </WishlistLoader>
        </ReduxProvider>

        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </CacheProvider>
  );
}

export default MyApp;

export { getServerSideProps };
