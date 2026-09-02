import { AppBarStyle } from "./NavBar.style";
import {
  Card,
  NoSsr,
  useMediaQuery,
  useScrollTrigger,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import { useSelector } from "react-redux";
import SecondNavBar from "./second-navbar/SecondNavbar";
import { useEffect } from "react";

const HeaderComponent = () => {
  const { configData } = useSelector((state) => state.configData);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const scrolling = useScrollTrigger();

  let token;
  let location;

  if (typeof window !== "undefined") {
    location = localStorage.getItem("location");
    token = localStorage.getItem("token");
  }

  useEffect(() => {
    // console.log("🔥 HeaderComponent configData:", configData);
  }, [configData]);

  return (
    <AppBarStyle
      scrolling={location || token ? scrolling : false}
      isSmall={isSmall}
    >
      <Box>
        <NoSsr>
          <Card sx={{ boxShadow: "none" }}>
            {/* Agar future me TopNavBar use karna ho */}
          </Card>

          {/* ✅ Pass configData forward */}
          <SecondNavBar configData={configData} />
        </NoSsr>
      </Box>
    </AppBarStyle>
  );
};

export default HeaderComponent;
