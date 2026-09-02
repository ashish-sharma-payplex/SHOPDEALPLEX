import { useState, useEffect, useRef } from "react";

const banners = [
  {
    id: 1,
    type: "large",
    image: "/Banner1.webp",
    imageAlt: "Grocery Products",
    link: "/home?module=grocery",
  },
  {
    id: 2,
    type: "small",
    image: "/Banner2.webp",
    imageAlt: "Tasty Food",
    link: "/home?module=food",
  },
  {
    id: 3,
    type: "small",
    image: "/Banner3.webp",
    imageAlt: "Medicine",
    link: "/home?module=pharmacy",
  },
  {
    id: 4,
    type: "small",
    image: "/Banner4.webp",
    imageAlt: "Home Repair",
    link: "#",
  },
];

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .banner-wrapper {
    padding: 0px 48px;
    background: #fff;
  }

  /* ✅ Mobile ke liye padding */
  @media (max-width: 640px) {
  .banner-wrapper {
    padding: 0; /* 👈 remove side padding */
  }

  .banner-carousel-outer {
    display: flex;
    justify-content: center; /* 👈 center the banner */
  }

  .carousel-slide {
    width: 100%;
    max-width: 100%;
  }
}

  /* ✅ MAIN GRID */
  .banner-grid {
    display: grid;
    grid-template-columns: 1.23fr 1fr;
    gap: 16px;
    align-items: stretch;
  }

  /* ✅ LEFT BIG BANNER */
  .banner-large {
    grid-row: 1 / 3;
    height: 100%;
    display: flex;
    border-radius: 16px;
    overflow: hidden;
  }

  .banner-large img {
    width: 100%;
    height: 100%;
    object-fit: contain;       /* 👈 NO gap, NO stretch */
    object-position: center;
    display: block;
  }

  /* ✅ RIGHT TOP */
  .banner-small {
    height: 100%;
    display: flex;
    border-radius: 16px;
    overflow: hidden;
  }

  .banner-small img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
  }

  /* ✅ RIGHT BOTTOM (2 boxes) */
  .bottom-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    height: 100%;
  }

  .bottom-row a {
    height: 100%;
    display: flex;
    border-radius: 16px;
    overflow: hidden;
  }

  .bottom-row img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
  }

  /* ✅ MOBILE CAROUSEL */
  .banner-carousel-outer { 
    display: none; 
    position: relative; 
    overflow: hidden; 
  }

  .banner-carousel-track {
    display: flex;
    transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .carousel-slide {
    min-width: 100%;
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    display: block;
    flex-shrink: 0;
  }

  .carousel-slide img {
    width: 100%;
    height: 100%;
    object-fit:contain;
    display: block;
  }

  /* ✅ DOTS */
  .dots {
    display: flex;
    justify-content: center;
    gap: 7px;
    margin-top: 12px;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ccc;
    transition: all 0.2s;
    cursor: pointer;
  }

  .dot.active {
    background: #1a4a1a;
    width: 20px;
    border-radius: 4px;
  }

  /* ✅ MOBILE VIEW */
  @media (max-width: 640px) {
    .banner-grid { display: none; }
    .banner-carousel-outer { display: block; }
  }
`;

export default function BannerSection() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % banners.length);
    }, 3200);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (i) => {
    setCurrent(i);
    startTimer();
  };

  const largeBanner = banners[0];
  const topSmall = banners[1];
  const bottomSmall1 = banners[2];
  const bottomSmall2 = banners[3];

  return (
    <>
      <style>{styles}</style>

      <div className="banner-wrapper">
        {/* ── DESKTOP / TABLET GRID ── */}
        <div className="banner-grid">
          <a
            href={largeBanner.link}
            className="banner-large"
            rel="noopener noreferrer"
          >
            <img
              src={largeBanner.image}
              alt={largeBanner.imageAlt}
              onError={(e) => (e.target.style.display = "none")}
            />
          </a>

          <a
            href={topSmall.link}
            className="banner-small"
            rel="noopener noreferrer"
          >
            <img
              src={topSmall.image}
              alt={topSmall.imageAlt}
              onError={(e) => (e.target.style.display = "none")}
            />
          </a>

          <div className="bottom-row">
            <a href={bottomSmall1.link} rel="noopener noreferrer">
              <img
                src={bottomSmall1.image}
                alt={bottomSmall1.imageAlt}
                onError={(e) => (e.target.style.display = "none")}
              />
            </a>
            <a href={bottomSmall2.link} rel="noopener noreferrer">
              <img
                src={bottomSmall2.image}
                alt={bottomSmall2.imageAlt}
                onError={(e) => (e.target.style.display = "none")}
              />
            </a>
          </div>
        </div>

        {/* ── MOBILE CAROUSEL ── */}
        <div className="banner-carousel-outer">
          <a
            href={largeBanner.link}
            className="carousel-slide"
            rel="noopener noreferrer"
          >
            <img
              src={largeBanner.image}
              alt={largeBanner.imageAlt}
              onError={(e) => (e.target.style.display = "none")}
            />
          </a>
        </div>
      </div>
    </>
  );
}
