// import { useTranslation } from "react-i18next";
// import React, { useEffect, useState } from "react";
// import CssBaseline from "@mui/material/CssBaseline";
// import SEO from "../../src/components/seo";
// import { getImageUrl } from "utils/CustomFunctions";
// import { Box, Typography, Grid, Container, Skeleton } from "@mui/material";
// import Link from "next/link";

// // Story Card Component
// // const StoryCard = ({ story }) => {
// //   return (
// //     <Box
// //       sx={{
// //         position: "relative",
// //         overflow: "hidden",
// //         borderRadius: 2,
// //         height: "100%",
// //         transition: "transform 0.3s",
// //         cursor: "pointer",
// //         "&:hover": {
// //           transform: "translateY(-8px)",
// //           boxShadow: 3,
// //         },
// //         border: "2px solid #E7E7E7",  
// //       }}
// //     >
// //       <Box
// //         sx={{
// //           width: "100%",
// //           paddingTop: "66%", // 3:2 Aspect ratio
// //           position: "relative",
// //           overflow: "hidden",
// //         }}
// //       >
// //         <Box
// //           component="img"
// //           src={story.thumbnail} // Using 'thumbnail' field
// //           alt={story.title}
// //           sx={{
// //             position: "absolute",
// //             top: 0,
// //             left: 0,
// //             width: "100%",
// //             height: "100%",
// //             objectFit: "cover",
// //           }}
// //         />
// //       </Box>
// //       <Box sx={{ p: 2 }}>
// //         <Typography
// //           variant="h6"
// //           component="h2"
// //           sx={{
// //             mt: 1,
// //             fontWeight: "bold",
// //             fontSize: "1.2rem",
// //           }}
// //         >
// //           {story.title}
// //         </Typography>
// //         <Typography
// //           variant="overline"
// //           color="text.secondary"
// //           sx={{ fontWeight: "medium", fontSize: "0.75rem" }}
// //         >
// //           {story.publisher_name} • {story.publish_time}{" "}
// //           <span style={{ marginLeft: "8px" }}>{story.reading_time}</span>
// //         </Typography>
// //         {/* <Typography
// //           variant="body2"
// //           color="text.secondary"
// //           sx={{
// //             mt: 1,
// //             fontSize: "1rem", // Ensure it's readable
// //             lineHeight: "1.5",
// //             maxHeight: "100px", // Restrict height if text is too long
// //             overflow: "hidden",
// //             textOverflow: "ellipsis",
// //           }}
// //         >
// //           {story.short_description}
// //         </Typography> */}

// // <Typography
// //   variant="body2"
// //   color="text.secondary"
// //   sx={{
// //     mt: 1,
// //     fontSize: "1rem",
// //     lineHeight: "1.5",
// //   }}
// // >
// //   {/* {story.short_description.substring(0,100)}{" "} */}
// //   {story.short_description.split("dark")[0]}dark...{" "}

// //   <Link href={`/blog/${story.slug}`} passHref legacyBehavior>
// //     <a
// // style={{
// //   color: "#1A914B",
// //   fontSize: "1rem",
// //   fontWeight: "inherit",
// //   lineHeight: "inherit",
// //   textDecoration: "underline",
// //   cursor: "pointer",
// //   transition: "color 0.3s",
// // }}
// //       onMouseEnter={(e) => {
// //         e.target.style.color = "rgb(16, 110, 55)";
// //       }}
// //       onMouseLeave={(e) => {
// //         e.target.style.color = "rgb(26, 145, 75)";
// //       }}
// //     >
// //       Read More
// //     </a>
// //   </Link>
// // </Typography>


// //       </Box>
// //     </Box>
// //   );
// // };



// const StoryCard = ({ story }) => {
//   const formattedDate = new Date(story.publish_time).toLocaleDateString(
//     "en-US",
//     {
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     }
//   );

//   return (
//     <Box
// sx={{
//   width: "384px",
//   maxWidth: "100%",
//   height: "500px",
//   display: "flex",
//   flexDirection: "column",
//   background: "#fff",
//   transition: "0.3s",
//   cursor: "pointer",

//   "&:hover": {
//     transform: "translateY(-4px)",
//   },
// }}
//     >
//       {/* IMAGE */}

//       <Box
//         component="img"
//         src={story.thumbnail}
//         alt={story.title}
// sx={{
//   width: "100%",
//   height: "255px",
//   objectFit: "cover",
// }}
//       />

//       {/* CONTENT */}

// <Box
// sx={{
// paddingTop:"18px",
// }}

//       >
//         {/* CATEGORY */}

//         <Typography
// sx={{
// fontSize:"15px",
// color:"#777777",
// fontWeight:400,
// mb:"12px"
// }}
//         >
//           Technology
//         </Typography>

//         {/* TITLE */}

//         <Typography
// sx={{
// fontSize:"18px",
// fontWeight:600,
// lineHeight:"28px",
// color:"#202124",

// display:"-webkit-box",
// WebkitLineClamp:2,
// WebkitBoxOrient:"vertical",
// overflow:"hidden",

// minHeight:"56px",

// mb:"22px"
// }}
//         >
//           {story.title}
//         </Typography>

//         {/* AUTHOR */}

//         <Typography
//   sx={{
// fontSize:"14px",
// color:"#7F7F7F",
// mb:"4px"
// }}
//         >
//           {story.publisher_name} | {formattedDate}
//         </Typography>

//         {/* READ TIME */}

//         <Typography
// sx={{
// fontSize:"14px",
// color:"#7F7F7F"
// }}
//         >
//           {story.reading_time} min read
//         </Typography>

//         {/* DESCRIPTION */}

//         {/* <Typography
//           sx={{
//             fontSize: "16px",
//             lineHeight: 1.7,
//             color: "#666",
//           }}
//         >
//           {story.short_description.substring(0, 100)}...
//         </Typography> */}
//       </Box>
//     </Box>
//   );
// };

// // Story Card Loading Skeleton
// const StoryCardSkeleton = () => {
//   return (
//     <Box sx={{ borderRadius: 2, height: "auto" }}>
//       <Skeleton
//         variant="rectangular"
//         width="100%"
//         height={0}
//         sx={{ paddingTop: "66%", borderRadius: 2 }}
//       />
//       <Box sx={{ p: 2 }}>
//         <Skeleton width="40%" height={20} />
//         <Skeleton width="90%" height={28} sx={{ mt: 1 }} />
//         <Skeleton width="100%" height={20} sx={{ mt: 1 }} />
//         <Skeleton width="80%" height={20} />
//       </Box>
//     </Box>
//   );
// };

// // Stories Header Component
// // const StoriesHeader = () => {
// //   const { t } = useTranslation();

// //   return (
// //     <Box
// //       sx={{
// //         py: 6,
// //         textAlign: "center",
// //         borderBottom: "1px solid",
// //         borderColor: "divider",
// //         mb: 6,
// //       }}
// //     >
// //       <Typography
// //         variant="h2"
// //         component="h1"
// //         sx={{
// //           fontWeight: "bold",
// //           mb: 2,
// //           fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
// //         }}
// //       >
// //         {t("Stories")}
// //       </Typography>
// //       <Typography
// //         variant="h6"
// //         color="text.secondary"
// //         sx={{
// //           maxWidth: "800px",
// //           mx: "auto",
// //           px: 2,
// //           fontWeight: "normal",
// //         }}
// //       >
// //         {t(
// //           "Explore our latest stories about innovation, athletes, design, and our impact on communities around the world."
// //         )}
// //       </Typography>
// //     </Box>
// //   );
// // };

// const BlogPage = ({ configData, landingPageData }) => {
//   const { t } = useTranslation();
//   const [loading, setLoading] = useState(true);
//   const [stories, setStories] = useState([]);

//   useEffect(() => {
//     // Simulate API fetch
//     const fetchStories = async () => {
//       setLoading(true);
//       try {
//         // Fetch from your API endpoint
//         const response = await fetch("https://dealplex.in/api/v1/blogs");
//         const data = await response.json();
//         console.log(
//           "id:::::::::::::::::::::::::::::::::::::::::::::::::::::::",
//           data,
//         );

//         // Map the API data to match the expected structure
//         const mappedStories = data.data.map((story) => ({
//           id: story.id,
//           title: story.title,
//           short_description: story.short_description,
//           slug: story.slug,
//           thumbnail: story.thumbnail,
//           publisher_name: story.publisher_name,
//           publish_time: story.published_at,
//           reading_time: story.reading_time || "N/A", // Default to 'N/A' if missing
//         }));

//         setStories(mappedStories);
//       } catch (error) {
//         console.error("Error fetching stories:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStories();
//   }, []);

//   return (
//     <>
//       <CssBaseline />
//       <SEO
//         title="Dealplex Blog | Quick Commerce, FMCG & Franchise Updates"
//         description="Read the latest articles on quick commerce, dark store franchises, FMCG trends & lifestyle guides on the Dealplex Blog."
//         keywords="dealplex blog, quick commerce blog, dark store tips, FMCG industry news, franchise tips india, grocery delivery tips, food delivery guide, medicine delivery guide, travel tips india, vehicle rental tips, ecommerce trends india, hyperlocal delivery blog, startup tips india, business franchise blog, lifestyle blog india, health tips online, quick delivery tips, dealplex news, online shopping tips, dark store franchise blog"
//         image={`${getImageUrl(
//           { value: configData?.logo_storage },
//           "business_logo_url",
//           configData,
//         )}/${configData?.fav_icon}`}
//         businessName={configData?.business_name}
//       />
//       <Container maxWidth="lg" marginBottom="100px">
//         {/* <StoriesHeader /> */}



// <Box
//   sx={{
//     width: "100%",
//     mb: 5,
//     borderRadius: "16px",
//     overflow: "hidden",
//   }}
// >
//   <Box
//     component="img"
//     src="/blog-banner.svg"
//     alt="Dealplex Banner"
// sx={{
//   width: "100%",
//   maxWidth: "1338px",
//   height: "274px",
//   display: "block",
//   margin: "0 auto",
//   objectFit: "contain",
// }}
//   />
// </Box>

//         <Grid container spacing={4} sx={{ my: "20px" }}>
//           {loading ? (
//             // Show skeletons while loading
//             Array.from(new Array(6)).map((_, index) => (
//               <Grid
// item
// xs={12}
// sm={6}
// md={4}
// sx={{
// display:"flex"
// }}
//  key={`skeleton-${index}`}>
//                 <StoryCardSkeleton />
//               </Grid>
//             ))
//           ) : stories.length > 0 ? (
//             // Show stories
// stories.map((story) => (
//   <Grid
//     key={story.id}
//     item
//     xs={12}
//     sm={6}
//     md={4}
//     sx={{
//       display: "flex",
//     }}
//   >
//     <Link href={`/blog/${story.slug}`} passHref legacyBehavior>
//       <a
//         style={{
//           textDecoration: "none",
//           width: "100%",
//         }}
//       >
//         <StoryCard story={story} />
//       </a>
//     </Link>
//   </Grid>
// ))
//           ) : (
//             // No stories found
//             <Grid item xs={12}>
//               <Box sx={{ textAlign: "center", py: 8 }}>
//                 <Typography variant="h6">{t("No stories found.")}</Typography>
//               </Box>
//             </Grid>
//           )}
//         </Grid>
//       </Container>
//     </>
//   );
// };

// export default BlogPage;


import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import SEO from "../../src/components/seo";
import { getImageUrl } from "utils/CustomFunctions";
import { Box, Typography, Grid, Container, Skeleton } from "@mui/material";
import Link from "next/link";

const StoryCard = ({ story }) => {
  const formattedDate = new Date(story.publish_time).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <Box
      sx={{
        width: { xs: "100%", sm: "100%", md: "384px" },
        maxWidth: "100%",
        height: { xs: "auto", md: "500px" },
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        transition: "0.3s",
        cursor: "pointer",

        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* IMAGE */}

      <Box
        component="img"
        src={story.thumbnail}
        alt={story.title}
        sx={{
          width: "100%",
          height: { xs: "200px", sm: "220px", md: "255px" },
          objectFit: "cover",
        }}
      />

      {/* CONTENT */}

      <Box
        sx={{
          paddingTop: { xs: "12px", md: "18px" },
        }}
      >
        {/* CATEGORY */}

<Typography
  sx={{
  fontSize: {
    xs: "15px",
    md: "16px",
  },

  fontWeight: 400,

  color: "#5F6368",

  whiteSpace: "nowrap",
}}
>
  {story.category}
</Typography>

        {/* TITLE */}

        <Typography
          sx={{
            fontSize: { xs: "16px", md: "18px" },
            fontWeight: 600,
            lineHeight: { xs: "24px", md: "28px" },
            color: "#202124",

            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",

            minHeight: { xs: "48px", md: "56px" },

            mb: { xs: "14px", md: "22px" },
          }}
        >
          {story.title}
        </Typography>

        {/* AUTHOR */}

        <Typography
          sx={{
            fontSize: { xs: "13px", md: "14px" },
            color: "#7F7F7F",
            mb: "4px",
          }}
        >
          {story.publisher_name} | {formattedDate}
        </Typography>

        {/* READ TIME */}

        <Typography
          sx={{
            fontSize: { xs: "13px", md: "14px" },
            color: "#7F7F7F",
          }}
        >
          {story.reading_time} min read
        </Typography>
      </Box>
    </Box>
  );
};

// Story Card Loading Skeleton
const StoryCardSkeleton = () => {
  return (
    <Box sx={{ borderRadius: 2, height: "auto", width: "100%" }}>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={0}
        sx={{ paddingTop: "66%", borderRadius: 2 }}
      />
      <Box sx={{ p: 2 }}>
        <Skeleton width="40%" height={20} />
        <Skeleton width="90%" height={28} sx={{ mt: 1 }} />
        <Skeleton width="100%" height={20} sx={{ mt: 1 }} />
        <Skeleton width="80%" height={20} />
      </Box>
    </Box>
  );
};

const BlogPage = ({ configData, landingPageData }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);


const [stories, setStories] = useState([]);
const [filteredStories, setFilteredStories] = useState([]);
const [categories, setCategories] = useState([]);
const [selectedCategory, setSelectedCategory] = useState("All categories");

  useEffect(() => {
    // Simulate API fetch
    const fetchStories = async () => {
      setLoading(true);
      try {
        // Fetch from your API endpoint
        const response = await fetch("https://dealplex.in/api/v1/blogs");
        const data = await response.json();
        // console.log(
        //   "id:::::::::::::::::::::::::::::::::::::::::::::::::::::::",
        //   data,
        // );

        // Map the API data to match the expected structure

const mappedStories = data.data.map((story) => ({
  id: story.id,
  title: story.title,
  short_description: story.short_description,
  slug: story.slug,
  thumbnail: story.thumbnail,
  publisher_name: story.publisher_name,
  publish_time: story.published_at,
  reading_time: story.reading_time || "N/A",
  category: story.category || "Technology",
}));
        setStories(mappedStories);
setFilteredStories(mappedStories);

const uniqueCategories = [
  "All categories",
  ...new Set(
    mappedStories
      .map((item) => item.category)
      .filter(Boolean)
  ),
];

setCategories(uniqueCategories);


      } catch (error) {
        // console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  return (
    <>
      <CssBaseline />
      <SEO
        title="Dealplex Blog | Quick Commerce, FMCG & Franchise Updates"
        description="Read the latest articles on quick commerce, dark store franchises, FMCG trends & lifestyle guides on the Dealplex Blog."
        keywords="dealplex blog, quick commerce blog, dark store tips, FMCG industry news, franchise tips india, grocery delivery tips, food delivery guide, medicine delivery guide, travel tips india, vehicle rental tips, ecommerce trends india, hyperlocal delivery blog, startup tips india, business franchise blog, lifestyle blog india, health tips online, quick delivery tips, dealplex news, online shopping tips, dark store franchise blog"
        image={`${getImageUrl(
          { value: configData?.logo_storage },
          "business_logo_url",
          configData,
        )}/${configData?.fav_icon}`}
        businessName={configData?.business_name}
      />
      <Container maxWidth="lg" sx={{ mb: "100px", px: { xs: 2, sm: 3, md: 3 } }}>
        <Box
          sx={{
            width: "100%",
            mb: { xs: 3, md: 5 },
            borderRadius: { xs: "10px", md: "16px" },
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src="/blog-banner.svg"
            alt="Dealplex Banner"
            sx={{
              width: "100%",
              maxWidth: "1338px",
              height: { xs: "140px", sm: "200px", md: "274px" },
              display: "block",
              margin: "0 auto",
              objectFit: "contain",
            }}
          />
        </Box>


{/* <Box
  sx={{
  display: "flex",
  alignItems: "center",

  gap: "12px",

  width: "100%",

  overflowX: "auto",
  overflowY: "hidden",

  whiteSpace: "nowrap",

  py: 2,
  mb: 4,

  justifyContent:
    categories.length <= 5 ? "center" : "flex-start",

  "&::-webkit-scrollbar": {
    display: "none",
  },

  scrollbarWidth: "none",
  msOverflowStyle: "none",
}}
>
  
  {categories.map((category) => (
    <Box
      key={category}
      onClick={() => {
        setSelectedCategory(category);

        if (category === "All categories") {
          setFilteredStories(stories);
        } else {
          setFilteredStories(
            stories.filter(
              (item) => item.category === category
            )
          );
        }
      }}
      sx={{
  flexShrink: 0,

  px: {
    xs: "18px",
    md: "22px",
  },

  py: {
    xs: "10px",
    md: "11px",
  },

  border:
    selectedCategory === category
      ? "1px solid #202124"
      : "1px solid #D8D8D8",

  background:
    selectedCategory === category
      ? "#FAFAFA"
      : "#FFFFFF",

  borderRadius: "2px",

  cursor: "pointer",

  transition: ".25s",

  "&:hover": {
    border: "1px solid #202124",
    background: "#FAFAFA",
  },
}}
    >
      <Typography
        sx={{
          fontSize: {
  xs: "15px",
  md: "16px",
},

whiteSpace: "nowrap",
          fontWeight: 400,
          color: "#5F6368",
        }}
      >
        {category}
      </Typography>
    </Box>
  ))}
</Box> */}


<Box
  sx={{
    position: "relative",
    width: "100%",
    mb: 5,
  }}
>
  <Box
    sx={{
      display: "flex",
      justifyContent: {
        xs: "flex-start",
        md: "center",
      },

      overflowX: "auto",

      overflowY: "hidden",

      gap: "12px",

      py: 2,

      px: {
        xs: 1,
        md: 0,
      },

      scrollBehavior: "smooth",

      "&::-webkit-scrollbar": {
        display: "none",
      },

      scrollbarWidth: "none",

      msOverflowStyle: "none",
    }}
  >
    {categories.map((category) => (
      <Box
        key={category}
        onClick={() => {
          setSelectedCategory(category);

          if (category === "All categories") {
            setFilteredStories(stories);
          } else {
            setFilteredStories(
              stories.filter(
                (item) => item.category === category
              )
            );
          }
        }}
        sx={{
          flexShrink: 0,

          px: {
            xs: "18px",
            md: "22px",
          },

          py: {
            xs: "10px",
            md: "11px",
          },

          border:
            selectedCategory === category
              ? "1px solid #202124"
              : "1px solid #D9D9D9",

          background:
            selectedCategory === category
              ? "#F7F7F7"
              : "#FFFFFF",

          borderRadius: "3px",

          cursor: "pointer",

          transition: "all .25s ease",

          "&:hover": {
            background: "#F7F7F7",
            border: "1px solid #202124",
          },
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: "15px",
              md: "16px",
            },

            fontWeight: 400,

            color: "#5F6368",

            whiteSpace: "nowrap",
          }}
        >
          {category}
        </Typography>
      </Box>
    ))}
  </Box>

  <Box
    sx={{
      display: {
        xs: "none",
        md: categories.length > 6 ? "block" : "none",
      },

      position: "absolute",

      right: 0,

      top: 0,

      width: "80px",

      height: "100%",

      pointerEvents: "none",

      background:
        "linear-gradient(to left,#ffffff 10%,rgba(255,255,255,0))",
    }}
  />
</Box>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ my: { xs: "10px", md: "20px" } }}>
          {loading ? (
            // Show skeletons while loading
            Array.from(new Array(6)).map((_, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                sx={{
                  display: "flex",
                }}
                key={`skeleton-${index}`}
              >
                <StoryCardSkeleton />
              </Grid>
            ))
          ) : stories.length > 0 ? (
            // Show stories
            filteredStories.map((story) => (
              <Grid
                key={story.id}
                item
                xs={12}
                sm={6}
                md={4}
                sx={{
                  display: "flex",
                }}
              >
                <Link href={`/blog/${story.slug}`} passHref legacyBehavior>
                  <a
                    style={{
                      textDecoration: "none",
                      width: "100%",
                    }}
                  >
                    <StoryCard story={story} />
                  </a>
                </Link>
              </Grid>
            ))
          ) : (
            // No stories found
            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6">{t("No stories found.")}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default BlogPage;
