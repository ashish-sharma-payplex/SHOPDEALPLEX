import React, { useEffect, useState } from "react";
import { CustomPaperBigCard } from "../../styled-components/CustomStyles.style";
import { Stack } from "@mui/system";
import SuccessCard from "../checkout/SuccessCard";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import CheckoutFailed from "../checkout/CheckoutFailed";
import jwt from "base-64";
import axios from "axios";
import { Typography, useTheme } from "@mui/material";

const OrderSuccessPage = ({ configData }) => {
  const router = useRouter();
  const { status, totalAmount, order_id, token, flag, page } = router.query;
  const { t } = useTranslation();
  const { total } = router.query;
  const theme = useTheme();
  const [attributeId, setAttributeId] = useState("");
  const [trackData, setTrackData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        // Attempt to decode the Base64 token
        const decodedToken = jwt.decode(token);

        // Check if decodedToken is a valid string
        if (typeof decodedToken === "string") {
          // Assuming decodedToken is in the format: "key1=value1&&key2=value2&&..."
          const keyValuePairs = decodedToken.split("&&");

          // Loop through the key-value pairs to find the one with attribute_id
          for (const pair of keyValuePairs) {
            const [key, value] = pair.split("=");
            if (key === "attribute_id") {
              setAttributeId(value);
              return; // Exit the loop when attribute_id is found
            }
          }
        } else {
          // console.error("Decoded token is not a string:", decodedToken);
        }
      } catch (error) {
        // console.error("Error decoding token:", error);
      }
    } else {
      // console.error("Token is missing.");
    }
  }, [token]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const id = order_id ? order_id : attributeId;
        if (id) {
          // Assuming an API endpoint exists to fetch order details by id
          const response = await axios.get(`/api/orders/${id}`);
          setTrackData(response.data);
        }
      } catch (error) {
        // console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady && (order_id || attributeId)) {
      fetchOrderDetails();
    }
  }, [router.isReady, order_id, attributeId]);

  const renderPaymentMessage = () => {
    return (
      <Typography fontSize="14px" fontWeight="400">
        {page === "my-orders?flag=cancel" ? (
          <Typography color={theme.palette.error.main}>
            {t("Your payment has been cancel, and your order ")}
          </Typography>
        ) : page === "my-orders?flag=fail" ? (
          <Typography color={theme.palette.error.main}>
            {t("Your payment has failed, and your order ")}
          </Typography>
        ) : (
          `${t(
            "Your payment has been successfully processed, and your order "
          )} !`
        )}
        <Typography component="span" fontWeight="600" sx={{ color: theme.palette.primary.main }}>
          {" "}
          #{trackData?.id || order_id || attributeId}{" "}
        </Typography>
        <Typography component="span" fontWeight="400">{`${t("has been placed.")} !`}</Typography>
      </Typography>
    );
  };

  return (
    <>
      {router.isReady && (
        <Stack
          width="100%"
          height="100%"
          mb="3rem"
          alignItems="center"
          justifyContent="center"
          mt="1rem"
        >
          <CustomPaperBigCard>
            {loading ? (
              <Typography>{t("Loading...")}</Typography>
            ) : trackData?.offline_payment ? (
              <>
                {renderPaymentMessage()}
                {(flag && flag === "fail") || flag === "cancel" ? (
                  <CheckoutFailed
                    id={order_id ? order_id : attributeId}
                    configData={configData}
                  />
                ) : (
                  <SuccessCard
                    configData={configData}
                    total={total}
                    order_id={order_id ? order_id : attributeId}
                  />
                )}
              </>
            ) : (flag && flag === "fail") || flag === "cancel" ? (
              <>
                {renderPaymentMessage()}
                <CheckoutFailed
                  id={order_id ? order_id : attributeId}
                  configData={configData}
                />
              </>
            ) : (
              <>
                {renderPaymentMessage()}
                <SuccessCard
                  configData={configData}
                  total={total}
                  order_id={order_id ? order_id : attributeId}
                />
              </>
            )}
          </CustomPaperBigCard>
        </Stack>
      )}
    </>
  );
};

export default OrderSuccessPage;
