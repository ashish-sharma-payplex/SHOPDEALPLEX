import { Grid, Skeleton } from "@mui/material";
import "simplebar/dist/simplebar.min.css";
import CampaignOrders from "./CampaignOrders";
import RegularOrders from "./RegularOrders";


const OrderSummaryDetails = (props) => {
  const { page, configData, cartList, t, campaignItemList, isSmall, isLoading } = props;

  return (
    <>
      <Grid item md={12} xs={12} container spacing={1} mt="20px">
        {(page === "cart" || page === "buy_now") && (
          <>
            {isLoading ? (
              <div style={{ width: "100%", padding: "10px" }}>
                {/* Example Skeletons for Regular Orders */}
                <Skeleton height={30} width="40%" style={{ marginBottom: 10 }} />
                <Skeleton height={20} width="90%" style={{ marginBottom: 6 }} />
                <Skeleton height={20} width="80%" style={{ marginBottom: 6 }} />
                <Skeleton height={20} width="60%" style={{ marginBottom: 6 }} />
                <Skeleton height={25} width="50%" style={{ marginTop: 10 }} />
              </div>
            ) : (
              <RegularOrders
                configData={configData}
                cartList={cartList}
                t={t}
                isSmall={isSmall}
              />
            )}
          </>
        )}

        {page === "campaign" && (
          <CampaignOrders
            configData={configData}
            campaignItemList={campaignItemList}
            t={t}
          />
        )}
      </Grid>
    </>
  );
};

export default OrderSummaryDetails;