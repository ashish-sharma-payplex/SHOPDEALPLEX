import {
  Step,
  StepLabel,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Box } from "@mui/system";
import { useTheme } from "@emotion/react";
import { CustomStepperStyled } from "../track-order/trackOrder.style";
import StepCircle from "./StepCircle";
import { GreenConnector } from "./GreenConnector";
import { t } from "i18next";

const HowToUse = ({ steps }) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up("md"));
  const orientation = isLaptop ? "horizontal" : "vertical";

  return (
    <Box sx={{ width: "100%" }}>
      <CustomStepperStyled
        orientation={orientation}
        alternativeLabel={isLaptop}
        connector={isLaptop ? <GreenConnector orientation={orientation} /> : null} // hide connector for mobile/tablet
      >
        {steps?.map((step, index) => (
          <Step key={index} completed>
            <StepLabel
              StepIconComponent={() => (
                <StepCircle
                  size={orientation === "horizontal" ? 24 : 18}
                  iconSize={orientation === "horizontal" ? 16 : 12}
                />
              )}
            >
              <Typography
                fontSize={orientation === "horizontal" ? 14 : 12}
                fontWeight="400"
                textAlign={orientation === "horizontal" ? "center" : "left"}
                sx={{
                  color: theme.palette.text.secondary,
                  marginLeft: orientation === "vertical" ? 0 : undefined,
                }}
              >
                {t(step?.label)}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </CustomStepperStyled>
    </Box>
  );
};

export default HowToUse;
