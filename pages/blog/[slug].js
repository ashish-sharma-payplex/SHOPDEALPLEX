// import { useRouter } from "next/router";
// import React, { useEffect, useState } from "react";
// import CssBaseline from "@mui/material/CssBaseline";
// import { Box, Typography, Container, Grid, CircularProgress } from "@mui/material";
// import { useSelector } from "react-redux";
// import SecondNavBar from "../../src/components/header/second-navbar/SecondNavbar";
// import FooterMiddle from "../../src/components/footer/footer-middle/FooterMiddle";

// const BlogPost = () => {
//   const router = useRouter();
//   const { slug } = router.query;
  
//   const { configData, landingPageData } = useSelector(
//   (state) => state.configData
// );

//   const [story, setStory] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     if (!slug) return;

//     const fetchStory = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch(`https://dealplex.in/api/v1/blogs/${slug}`);
//         const data = await response.json();

//         if (data.status === "success" && data.data) {
//           const mappedStory = {
//             id: data.data.id,
//             title: data.data.title || "Untitled Blog",
//             short_description: data.data.short_description || "No description available.",
//             slug: data.data.slug,
//             thumbnail: data.data.thumbnail || "/default-thumbnail.png",

//             image_alt_text:
//                           data.data.image_alt_text || data.data.title,
//             publisher_name: data.data.publisher_name || "Unknown Publisher",
//             publish_time: data.data.published_at,
//             reading_time: data.data.reading_time || "N/A",
//             gallery_images: data.data.gallery_images || [],
//             content: data.data.content || "No content available.",
//           };

//           setStory(mappedStory);
//         } else {
//           setError(true);
//         }
//       } catch (error) {
//         setError(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStory();
//   }, [slug]);

//   if (loading) {
//     return (
//       <Container maxWidth="md" sx={{ py: 8 }} align="center">
//         <CircularProgress />
//         <Typography variant="h4" sx={{ mt: 2 }}>
//           Loading...
//         </Typography>
//       </Container>
//     );
//   }

//   if (error || !story) {
//     return (
//       <Container maxWidth="md" sx={{ py: 8 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           Blog post not found
//         </Typography>
//         <Typography variant="body1" align="center">
//           The blog post you are looking for does not exist or an error occurred.
//         </Typography>
//       </Container>
//     );
//   }

//   const formattedDate = new Date(story.publish_time);

//   const cleanContent = (html) => {
//   if (!html) return "";

//   return html
//     // span tags remove
//     .replace(/<\/?span[^>]*>/gi, "")

//     // style attributes remove
//     .replace(/\sstyle="[^"]*"/gi, "")

//     // class attributes remove
//     .replace(/\sclass="[^"]*"/gi, "")

//     // id attributes remove
//     .replace(/\sid="[^"]*"/gi, "")

//     // empty paragraphs remove
//     .replace(/<p>(&nbsp;|\s)*<\/p>/gi, "");
// };
//   const displayDate = isNaN(formattedDate) ? "Unknown Date" : formattedDate.toLocaleDateString();

//   // const formatContent = (content) => {
//   //   return content.split("\r\n").map((item, index) => (
//   //     <span key={index}>
//   //       {item}
//   //       <br />
//   //     </span>
//   //   ));
//   // };

//   // return (
//   //   <>
//   //     <CssBaseline />
//   //     <Container maxWidth="md" sx={{ py: 8 }}>

//     return (
//     <>
//       <CssBaseline />

//       <Box
//         sx={{
//           maxWidth: "1280px",
//           width: "100%",
//           mx: "auto",
//           pb: "20px",
//         }}
//       >
//         <SecondNavBar
//   configData={configData}
//   isBlog={true}
// />

//         <Container maxWidth="md" sx={{ py: 8 }}>
//         <Typography variant="h3" component="h1" gutterBottom>
//           {story.title}
//         </Typography>
//         <Typography variant="subtitle1" color="text.secondary" gutterBottom>
//           {story.publisher_name} • {displayDate} • {story.reading_time} min read
//         </Typography>
//         <Box
//           component="img"
//           src={story.thumbnail}
//           // alt={story.title}

//           alt={story.image_alt_text}
// sx={{
//   width: "100%",
//   height: "auto",
//   borderRadius: 2,
//   mb: 0.2,
//   objectFit: "cover",
// }}
//         />

// <Box
//   component="p"
//   sx={{
//     mt: "4px",
//     mb: "20px",

//     textAlign: "center",

//     fontFamily: "inherit",

//     fontSize: "15px",

//     fontWeight: 400,

//     fontStyle: "italic",

//     color: "#6B7280",

//     lineHeight: "24px",

//     letterSpacing: "0",

//     marginLeft: "auto",
//     marginRight: "auto",
//   }}
// >
//   {story.image_alt_text}
// </Box>


//         <Typography
//           variant="body1"
//           paragraph
//           sx={{
//             textAlign: "justify",
//             fontSize: "1.1rem",
//             lineHeight: 1.7,
//             color: "text.primary",
//             marginBottom: 2,
//           }}
//         >
//           {story.short_description}
//         </Typography>

//         {/* <Typography
//           variant="body2"
//           paragraph
//           sx={{
//             textAlign: "justify",
//             fontSize: "1.2rem",
//             lineHeight: 1.8,
//             color: "text.secondary",
//             marginBottom: 3,
//             fontWeight: "400",
//           }}
//         >
//           {formatContent(story.content)}
//         </Typography> */}

// <Box
//   sx={{
//   fontFamily: '"Inter", sans-serif',
//   fontSize: "1.1rem",
//   fontWeight: 400,
//   color: "rgb(62, 89, 77)",
//   lineHeight: 1.7,

//   "& *": {
//     fontFamily: '"Inter", sans-serif !important',
//     color: "rgb(62, 89, 77) !important",
//   },

//   "& p": {
//     marginBottom: "20px",
//     fontSize: "1.1rem",
//     fontWeight: 400,
//     color: "rgb(62, 89, 77) !important",
//     lineHeight: 1.7,
//   },

//   "& h1": {
//     color: "rgb(62, 89, 77) !important",
//     fontWeight: 700,
//   },

// "& h2, & h3": {
//   fontSize: "34px",
//   fontWeight: 700,
//   marginTop: "28px",
//   marginBottom: "18px",
//   lineHeight: 1.3,
//   color: "rgb(62, 89, 77) !important",
// },

//   "& li": {
//     color: "rgb(62, 89, 77) !important",
//     lineHeight: "29.92px",
//   },

//   "& a": {
//     color: "#1A914B !important",
//     textDecoration: "underline",
//   },
// }}
//   dangerouslySetInnerHTML={{
//   __html: cleanContent(story.content)
// }}
// />

//         {story.gallery_images && story.gallery_images.length > 0 && (
//           <Box sx={{ mt: 4 }}>
//             <Typography variant="h6" gutterBottom>
//               Image Gallery
//             </Typography>
//             <Grid container spacing={2}>
//               {story.gallery_images.map((image, index) => (
//                 <Grid item xs={12} sm={6} key={index}>
//                   <Box
//                     component="img"
//                     src={image}
//                     // alt={`Gallery image ${index + 1}`}
//                     alt={story.image_alt_text}
//                     sx={{
//                       width: "100%",
//                       height: "auto",
//                       borderRadius: 2,
//                       objectFit: "cover",
//                     }}
//                   />





//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         )}
//             </Container>

//       <FooterMiddle
//         configData={configData}
//         landingPageData={landingPageData}
//       />
//     </Box>
//   </>
// );
// };

// export default BlogPost;


import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, Typography, Container, Grid } from "@mui/material";
import { useSelector } from "react-redux";
import SecondNavBar from "../../src/components/header/second-navbar/SecondNavbar";
import FooterMiddle from "../../src/components/footer/footer-middle/FooterMiddle";
import SEO from "../../src/components/seo";

const BlogPost = ({ story, error }) => {
  const { configData, landingPageData } = useSelector(
    (state) => state.configData
  );

  if (error || !story) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Blog post not found
        </Typography>
        <Typography variant="body1" align="center">
          The blog post you are looking for does not exist or an error occurred.
        </Typography>
      </Container>
    );
  }

  const formattedDate = new Date(story.publish_time);

  const cleanContent = (html) => {
    if (!html) return "";

    return html
      .replace(/<\/?span[^>]*>/gi, "")
      .replace(/\sstyle="[^"]*"/gi, "")
      .replace(/\sclass="[^"]*"/gi, "")
      .replace(/\sid="[^"]*"/gi, "")
      .replace(/<p>(&nbsp;|\s)*<\/p>/gi, "");
  };

  // const displayDate = isNaN(formattedDate) ? "Unknown Date" : formattedDate.toLocaleDateString();
const formatDateSafe = (date) => {
    if (isNaN(date)) return "Unknown Date";

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  };

  const displayDate = formatDateSafe(formattedDate);
  return (
    <>
      <SEO
        title={story.metaTitle}
        description={story.metaDescription}
        keywords={story.metaKeywords}
        image={story.thumbnail}
        canonical={story.canonicalUrl}
        robots={story.robots}
        schema={story.schema}
        configData={configData}
      />

      <CssBaseline />

      <Box
        sx={{
          maxWidth: "1280px",
          width: "100%",
          mx: "auto",
          pb: "20px",
        }}
      >
        <SecondNavBar configData={configData} isBlog={true} />

        <Container maxWidth="md" sx={{ py: 8 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {story.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {story.publisher_name} • {displayDate} • {story.reading_time} min read
          </Typography>
          <Box
            component="img"
            src={story.thumbnail}
            alt={story.image_alt_text}
            sx={{
              width: "100%",
              height: "auto",
              borderRadius: 2,
              mb: 0.2,
              objectFit: "cover",
            }}
          />

          <Box
            component="p"
            sx={{
              mt: "4px",
              mb: "20px",
              textAlign: "center",
              fontFamily: "inherit",
              fontSize: "15px",
              fontWeight: 400,
              fontStyle: "italic",
              color: "#6B7280",
              lineHeight: "24px",
              letterSpacing: "0",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {story.image_alt_text}
          </Box>

          <Typography
            variant="body1"
            paragraph
            sx={{
              textAlign: "justify",
              fontSize: "1.1rem",
              lineHeight: 1.7,
              color: "text.primary",
              marginBottom: 2,
            }}
          >
            {story.short_description}
          </Typography>

          <Box
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: "1.1rem",
              fontWeight: 400,
              color: "rgb(62, 89, 77)",
              lineHeight: 1.7,

              "& *": {
                fontFamily: '"Inter", sans-serif !important',
                color: "rgb(62, 89, 77) !important",
              },

              "& p": {
                marginBottom: "20px",
                fontSize: "1.1rem",
                fontWeight: 400,
                color: "rgb(62, 89, 77) !important",
                lineHeight: 1.7,
              },

              "& h1": {
                color: "rgb(62, 89, 77) !important",
                fontWeight: 700,
              },

              "& h2, & h3": {
                fontSize: "34px",
                fontWeight: 700,
                marginTop: "28px",
                marginBottom: "18px",
                lineHeight: 1.3,
                color: "rgb(62, 89, 77) !important",
              },

              "& li": {
                color: "rgb(62, 89, 77) !important",
                lineHeight: "29.92px",
              },

              "& a": {
                color: "#1A914B !important",
                textDecoration: "underline",
              },
            }}
            dangerouslySetInnerHTML={{
              __html: cleanContent(story.content),
            }}
          />

          {story.gallery_images && story.gallery_images.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Image Gallery
              </Typography>
              <Grid container spacing={2}>
                {story.gallery_images.map((image, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box
                      component="img"
                      src={image}
                      alt={story.image_alt_text}
                      sx={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 2,
                        objectFit: "cover",
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>

        <FooterMiddle configData={configData} landingPageData={landingPageData} />
      </Box>
    </>
  );
};

export async function getServerSideProps(context) {
  const { slug } = context.params;

  try {
    const response = await fetch(`https://dealplex.in/api/v1/blogs/${slug}`);
    const data = await response.json();

    if (data.status !== "success" || !data.data) {
      return { props: { story: null, error: true } };
    }

    const mappedStory = {
      id: data.data.id,
      title: data.data.title || "Untitled Blog",
      short_description: data.data.short_description || "No description available.",
      slug: data.data.slug,
      thumbnail: data.data.thumbnail || "/default-thumbnail.png",
      image_alt_text: data.data.image_alt_text || data.data.title,
      publisher_name: data.data.publisher_name || "Unknown Publisher",
      publish_time: data.data.published_at,
      reading_time: data.data.reading_time || "N/A",
      gallery_images: data.data.gallery_images || [],
      content: data.data.content || "No content available.",

      metaTitle: data.data.meta_title || data.data.title || "Untitled Blog",
      metaDescription: data.data.meta_description || data.data.short_description || "",
      canonicalUrl: data.data.canonical_url || `https://shopdealplex.com/blog/${slug}`,
      metaKeywords: data.data.meta_keywords || "",
      robots: data.data.robots || "index, follow",
      schema: data.data.schema || null,
    };

    return { props: { story: mappedStory, error: false } };
  } catch (err) {
    return { props: { story: null, error: true } };
  }
}

export default BlogPost;