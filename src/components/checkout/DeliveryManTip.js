import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import {
  CustomBoxForTips,
  CustomStackFullWidth,
  CustomTextField,
} from "../../styled-components/CustomStyles.style";
import { Grid, Typography, Tooltip, Fade, Paper, Box } from "@mui/material";
import { Stack } from "@mui/system";
import { CouponTitle, DeliveryCaption, RoundButton } from "./CheckOut.style";
import { useTheme } from "@emotion/react";
import { toast } from 'react-hot-toast';
import { getAmountWithSign } from "helper-functions/CardHelpers";

const DeliveryManTip = ({
  deliveryTip,
  setDeliveryTip,
  isSmall,
  tripsData,
}) => {
  const [show, setShow] = useState(false);
  const theme = useTheme();
  const [fieldValue, setFieldValue] = useState(deliveryTip);
  const [isCustom, setIsCustom] = useState(false);
  const deliveryTips = [20, 30, 50];  // Tip options
  const { t } = useTranslation();

  let debounceTimeout;

  // Fetch delivery tip from localStorage on component mount
  useEffect(() => {
    const savedTip = localStorage.getItem("deliveryTip");
    if (savedTip) {
      setDeliveryTip(Number(savedTip));  // Set state from saved value
      setFieldValue(Number(savedTip));  // Set field value
    }
  }, [setDeliveryTip]);

  const debouncedSetInputValue = (value) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);  // Clear the previous timeout
    }

    debounceTimeout = setTimeout(() => {
      setDeliveryTip(value);  // Update the state with the new tip
      localStorage.setItem("deliveryTip", value);  // Save the custom tip to localStorage
    }, 300);
  };

  const handleOnChange = (e) => {
    let value = e.target.value;

    // Check if the value is a valid number and is not greater than 100
    if (value > -1 && value <= 999) {
      setFieldValue(value);
      debouncedSetInputValue(value);
      setIsCustom(true);
    } else if (value > 999) {
      // Display a toast error message if the value exceeds 100
      toast.error(t("Max tip amount is ₹999")); 

      setFieldValue(999);  // Automatically set to 100 if the value exceeds 100
      debouncedSetInputValue(999);
      setIsCustom(true);  // Still consider it as a custom value
    } else {
      setIsCustom(false);
    }
  };

  const handleClickOnTips = (tip) => {
    // If the same tip is clicked again, reset the tip (deselect)
    if (tip === deliveryTip) {
      setFieldValue(0);  // Set to 0 to remove the tip
      setIsCustom(false);  // Deselect custom tip
      localStorage.removeItem("deliveryTip");  // Remove from localStorage
      setDeliveryTip(0);  // Reset the deliveryTip state
    } else {
      setFieldValue(tip);  // Set the selected tip
      setIsCustom(false);  // Mark as not custom
      localStorage.setItem("deliveryTip", tip);  // Save the selected tip to localStorage
      setDeliveryTip(tip);  // Set the selected tip
    }
  };

  useEffect(() => {
    debouncedSetInputValue(fieldValue);
  }, [fieldValue]);

  const handleShow = () => {
    setShow(true);
  };
  const handleClose = () => {
    setShow(false);
  };

  return (
    <CustomStackFullWidth>
      <Grid container rowGap="14px" spacing={1}>
        <Grid item xs={12} md={12}>
          <Box sx={{ display: 'flex', flexDirection:'column', alignItems: 'left', gap: 0.5, mb: 0.5 }}>
            <DeliveryCaption sx={{ fontSize: '16px', fontWeight: 'bold' }}>
              {t("Tip Your Delivery Partner")}
            </DeliveryCaption>

            <Typography sx={{ fontSize: '12px', fontWeight: 'normal', color: theme.palette.text.secondary, mt: 1 }}>
              {t("Every penny of your kind tip will go straight to your delivery partner. Thank you!")}
            </Typography>
          </Box>
        </Grid>
        {!show && (
          <Grid item xs={12}>
            <CustomStackFullWidth direction="row" alignItems="center" gap="8px" flexWrap="wrap">
              {deliveryTips.map((item, index) => {
                const isActive = item === deliveryTip;
                const isMostTipped = tripsData?.most_tips_amount === item;
                return (
                  <Stack key={index} alignItems="flex-start">
                    <Tooltip title={index === 0 ? t("Tip the delivery person") : t("Tip the delivery person")}>
                      <CustomBoxForTips
                        onClick={() => handleClickOnTips(item)}  // Deselectable click functionality
                        active={isActive}
                        sx={{
                          background: isActive ? '#28a745' : '#FFFFFF',
                          border: isActive ? '1px solid #28a745' : '1px solid #66666633',
                          boxShadow: isActive 
                            ? '0 4px 12px rgba(40, 167, 69, 0.3)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: isActive 
                              ? '0 6px 16px rgba(40, 167, 69, 0.15)' 
                              : '0 6px 16px rgba(0, 0, 0, 0.15)',
                            borderColor: theme.palette.primary.main,
                          },
                          position: 'relative',
                          overflow: 'hidden',
                          width: '70px',
                          height: '30px',
                          padding: '2px 2px',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          {index === 0 ? (
                            <img
                              src="/tip1.png"
                              alt="₹20 Tip Icon"
                              style={{
                                width: '12px',
                                height: '12px',
                              }}
                            />
                          ) : index === 1 ? (
                            <img
                              src="/tip2.png"
                              alt="₹30 Tip Icon"
                              style={{
                                width: '12px',
                                height: '12px',
                              }}
                            />
                          ) : index === 2 ? (
                            <img
                              src="tip3.png"
                              alt="₹50 Tip Icon"
                              style={{
                                width: '12px',
                                height: '12px',
                              }}
                            />
                          ) : (
                            <img
                              src="/customtip.png"
                              alt="Default Tip Icon"
                              style={{
                                width: '12px',
                                height: '12px',
                              }}
                            />
                          )}

                          <Typography
                            fontSize={isActive ? "14px" : "12px"}
                            textTransform="capitalize"
                            fontWeight="600"
                            color={isActive ? theme.palette.whiteContainer.main : theme.palette.primary.main}
                          >
                            {getAmountWithSign(item)}
                          </Typography>
                        </Stack>

                        {isMostTipped && !isSmall && (
                          <Stack
                            position="absolute"
                            bottom="0px"
                            alignItems="center"
                            width="100%"
                            sx={{
                              background: `linear-gradient(180deg, transparent, #FF6600)`,
                              borderRadius: '0 0 8px 8px',
                            }}
                          >
                            {/* <Typography
                              color={theme.palette.whiteContainer.main}
                              fontSize="9px"
                              fontWeight="bold"
                              sx={{ py: 0.5 }}
                            >
                              {t("Most Tipped")}
                            </Typography> */}
                          </Stack>
                        )}
                      </CustomBoxForTips>
                    </Tooltip>
                    {isMostTipped && isSmall && (
                      <Typography
                        color={theme.palette.primary.main}
                        fontSize="10px"
                        fontWeight="bold"
                        sx={{ mt: 0.5 }}
                      >
                        {t("Most Tipped")}
                      </Typography>
                    )}
                  </Stack>
                );
              })}

              {/* Custom Tip Option */}
              <Tooltip title={t("Enter custom tip amount")}>
                <CustomBoxForTips
                  onClick={handleShow}
                  active={isCustom}
                  sx={{
                    background: isCustom ? '#28a745' : '#FFFFFF',
                    border: isCustom ? '1px solid #28a745' : '1px solid #66666633',
                    boxShadow: isCustom 
                      ? '0 4px 12px rgba(40, 167, 69, 0.3)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isCustom 
                        ? '0 6px 16px rgba(40, 167, 69, 0.15)' 
                        : '0 6px 16px rgba(0, 0, 0, 0.15)',
                      borderColor: theme.palette.primary.main,
                    },
                    width: '70px',
                    height: '30px',
                    padding: '2px 2px',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <img
                      src="/customtip.png"
                      alt="Custom Symbol"
                      style={{
                        width: '14px',
                        height: '14px',
                        color: isCustom ? theme.palette.whiteContainer.main : theme.palette.primary.main,
                      }}
                    />
                    <Typography
                      color={isCustom ? theme.palette.whiteContainer.main : theme.palette.primary.main}
                      fontSize="12px"
                      fontWeight="600"
                    >
                      {t("Custom")}
                    </Typography>
                  </Stack>
                </CustomBoxForTips>
              </Tooltip>
            </CustomStackFullWidth>
          </Grid>
        )}
        {show && (
          <Fade in={show}>
            <Stack
              width="100%"
              direction="row"
              spacing={2}
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                borderRadius: 2,
                border: `1px solid ${theme.palette.grey[300]}`,
              }}
            >
              <CustomTextField
                type="number"
                label={t("Enter tip amount")}
                autoFocus={true}
                value={fieldValue}
                onChange={(e) => handleOnChange(e)}
                InputProps={{
                  inputProps: { min: 0 },
                  startAdornment: <CurrencyRupeeIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
                onKeyPress={(event) => {
                  if (event?.key === "-" || event?.key === "+") {
                    event.preventDefault();
                  }
                }}
              />
              <Tooltip title={t("Close custom tip input")}>
                <RoundButton
                  onClick={handleClose}
                  minWidth="50px"
                  padding="9px 16px"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.grey[400]}, ${theme.palette.grey[500]})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.grey[500]}, ${theme.palette.grey[600]})`,
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CloseIcon sx={{ width: "15px", height: "20px" }} />
                </RoundButton>
              </Tooltip>
            </Stack>
          </Fade>
        )}
      </Grid>
    </CustomStackFullWidth>
  );
};

export default DeliveryManTip;
