/* eslint-disable react-hooks/exhaustive-deps */
import {
  Grid,
  Popover,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { t } from "i18next";

import useGetProfile from "../../api-manage/hooks/react-query/profile/useGetProfile";
import useGetWalletTransactionsList from "../../api-manage/hooks/react-query/useGetWalletTransactionsList";
import { setUser } from "../../redux/slices/profileInfo";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";

import wallet from "./assets/new-wallet.png";
import WalletBoxComponent from "./WalletBoxComponent";
import WalletFundBonus from "./WalletFundBonus";
import TransactionHistory from "../transaction-history";
import TransactionHistoryMobile from "./TransactionHistoryMobile";
import HowToUse from "./HowToUse";

const Wallet = (props) => {
  const { configData } = props;

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();

  const [openPopover, setOpenPopover] = useState(false);
  const anchorRef = useRef(null);

  const userOnSuccessHandler = (res) => {
    dispatch(setUser(res));
  };

  const {
    data: userData,
    refetch: profileRefetch,
    isLoading: userDataLoading,
  } = useGetProfile(userOnSuccessHandler);

  const [offset, setOffset] = useState(1);
  const [transactionType, setTransactionType] = useState("all");

  const pageParams = { offset, type: transactionType };
  const { data, refetch, isLoading, isFetching } =
    useGetWalletTransactionsList(pageParams);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await refetch();
    await profileRefetch();
  };

  useEffect(() => {
    refetch();
  }, [transactionType, offset]);

  const steps = [
    { label: "Earn money to your wallet by completing the offer & challenged" },
    { label: "Convert your loyalty points into wallet money" },
    { label: "Admin also reward their top customers with wallet money" },
    { label: "Send your wallet money while order" },
  ];


useEffect(() => {
    // console.log("User Data: ", userData); // Log the entire userData to inspect
    // console.log("Wallet Balance: ", userData?.wallet_balance); // Log wallet balance specifically
  }, [userData]);


  return (
    <CustomStackFullWidth
      my={{ xs: "1rem", md: "2rem" }}
      sx={{ minHeight: "60vh" }}
      alignItems="center"
    >
      {/* PAGE TITLE */}
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        maxWidth="1100px"
        mb={2}
      >
        <Typography fontSize="18px" fontWeight="700">
          {t("Wallet")}
        </Typography>
        {isSmall && (
          <InfoOutlinedIcon onClick={() => setOpenPopover(true)} />
        )}
      </Stack>

      {/* MAIN CONTENT */}
      <Grid
        container
        direction="column"
        alignItems="center"
        maxWidth="1100px"
      >
        {/* 1️⃣ Wallet Card */}
      <Grid item xs={12} display="flex" justifyContent="center" width="100%">

          <WalletBoxComponent
            title={t("Total Balance")}
            balance={userData && userData?.wallet_balance}
            image={wallet}
            userDataLoading={userDataLoading}
          />
        </Grid>

        {/* 2️⃣ How to use (steps under card) */}
        <Grid item xs={12} mt={3} width="100%">
          <HowToUse steps={steps} />
        </Grid>

        {/* 3️⃣ Transaction History */}
        <Grid item xs={12} mt={4} width="100%">
          <WalletFundBonus />

          {isSmall ? (
            <TransactionHistoryMobile
              data={data}
              isLoading={isLoading}
              value={transactionType}
              setValue={setTransactionType}
              offset={offset}
              setOffset={setOffset}
              isFetching={isFetching}
            />
          ) : (
            <TransactionHistory
              data={data}
              isLoading={isLoading}
              value={transactionType}
              setValue={setTransactionType}
              offset={offset}
              setOffset={setOffset}
              isFetching={isFetching}
            />
          )}
        </Grid>
      </Grid>

      {/* POPOVER (Mobile HowToUse) */}
      <Popover
        disableScrollLock
        open={openPopover}
        onClose={() => setOpenPopover(false)}
        anchorEl={anchorRef.current}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            padding: "20px",
            borderRadius: "10px",
          },
        }}
      >
        <HowToUse steps={steps} />
      </Popover>
    </CustomStackFullWidth>
  );
};

export default Wallet;
