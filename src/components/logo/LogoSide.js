import CustomLogo from "./CustomLogo";
import { useEffect } from "react";
import { Stack } from "@mui/system";
import { getImageUrl } from "utils/CustomFunctions";

const LogoSide = ({
  configData,
  width,
  height,
  objectFit,
  isBlog = false,
}) => {
  const businessLogo = configData?.base_urls?.business_logo_url;
  const logoFullUrl = configData?.logo_full_url;

  // console.log("isBlog in LogoSide:", isBlog);

  // Log the URLs to check if the data is coming correctly

    useEffect(() => {
    // console.log("Logo Full ding ding URL:", configData);
  }, [logoFullUrl]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      width="150px"
      justifyContent="flex-start"
    >
      <CustomLogo
        atlText="blog logo"
        logoImg={isBlog ? "/blog-logo.svg" : logoFullUrl}// Make sure this is the correct logo URL
        width={width}
        height={height}
        objectFit={objectFit}
      />
    </Stack>
  );
};

LogoSide.propTypes = {};

export default LogoSide;
