// src\components\transaction-history\index.js
import { useTheme } from "@emotion/react";
import {
  MenuItem,
  Select,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import moment from "moment";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import SimpleBar from "simplebar-react";
import { data_limit } from "../../api-manage/ApiRoutes";
import { getAmountWithSign } from "../../helper-functions/CardHelpers";
import CustomDivider from "../CustomDivider";
import DotSpin from "../DotSpin";
import CustomEmptyResult from "../custom-empty-result";
import nodataimage from "./img/noData.svg";
import TransactionShimmer from "./Shimmer";
import greenCoin from "./img/coin.png";
import yellowCoin from "./img/yellow-coin.png";

export const transaction_options = [
  {
    label: "All Transaction",
    value: "all",
  },
  {
    label: "Order Transaction",
    value: "order",
  },
  {
    label: "Add Fund",
    value: "add_fund",
  },
  {
    label: "Loyalty Points Transaction",
    value: "loyalty_point",
  },
  {
    label: "Referrer Transactions",
    value: "referrer",
  },
  {
    label: "Cash back Transactions",
    value: "CashBack",
  },
  {
    label: "Utility",           // âœ… new filter
    value: "utility",
  },
];

const TransactionHistory = (props) => {
  const {
    data,
    isLoading,
    page,
    value,
    setValue,
    offset,
    setOffset,
    isFetching,
  } = props;

  const [trxData, setTrxData] = useState([]);

  useEffect(() => {
    // console.log("transaction API data received:", data?.data);

    if (!isLoading) {
      let filteredData = data?.data || [];

      // âœ… Only filter if Utility is selected
      if (value === "utility") {
        filteredData = filteredData.filter(item =>
          item.transaction_type === "bbps_bill_pay" ||
          item.transaction_type === "bbps_refund"
        );
      }

      if (offset <= 1) {
        setTrxData(filteredData);
      } else {
        setTrxData([...trxData, ...filteredData]);
      }
    }
  }, [data, value]);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      if (!isLoading) {
        if (offset * data_limit <= data.total_size) {
          setOffset((prevState) => prevState + 1);
        }
      }
    }
  }, [inView]);

  const { t } = useTranslation();

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    // console.log("Selected Filter:", selectedValue);

    setValue(selectedValue);
    setOffset(1);
  };


  const theme = useTheme();
  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        mt={2}
      >
        <Typography fontSize="18px" fontWeight="700" py="1rem" m={0}>
          {t("Transaction History")}
        </Typography>
        {page != "loyalty" && (
          <CustomSelect value={value} onChange={(e) => handleChange(e)}>
            {transaction_options?.map((item, i) => (
              <MenuItem key={i} value={item?.value}>
                {t(item?.label)}
              </MenuItem>
            ))}
          </CustomSelect>
        )}
      </Stack>
      {trxData?.length > 0 && (
        <SimpleBar style={{ maxHeight: "60vh" }}>
          <TableContainer>
            <CustomTable>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#F4F4F4",    // soft green background
                    borderRadius: "10px",
                    boxShadow: "inset 0 -1px 0 #a7d5a7",
                    // For rounded corners on the row, MUI TableRow sometimes needs additional CSS on cells.
                  }}
                >

                  <CustomTableCell>
                    <Typography
                      variant="body1"
                      color={theme.palette.text.primary}
                    >
                      {t("Transaction Type")}
                    </Typography>
                  </CustomTableCell>
                  <CustomTableCell>
                    <Typography
                      variant="body1"
                      color={theme.palette.text.primary}
                      textTransform="capitalize"
                    >
                      {page == "loyalty" ? t("points") : t("Amount")}
                    </Typography>
                  </CustomTableCell>
                  <CustomTableCell>
                    <Typography
                      variant="body1"
                      color={theme.palette.text.primary}
                    >
                      {t("Date & Time")}
                    </Typography>
                  </CustomTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trxData?.map((item, index) => {
                  return (
                    <TableRow
                      key={item?.id}
                      sx={{
                        ".MuiTableCell-root": {
                          // background: theme.palette.background.custom3,
                          borderRadius: "10px",
                        },
                      }}
                    >
                      <CustomTableCell>
                        <Stack direction="row" gap="4px" alignItems="center">
                          {item?.debit ? (
                            <Image
                              src={yellowCoin.src}
                              width="16"
                              height="16"
                              alt="image"
                            />
                          ) : (
                            <Image
                              src={greenCoin.src}
                              width="25"
                              height="25"
                              alt="image"
                            />
                          )}
                          {item?.transaction_type === "add_fund" ? (
                            <Typography
                              fontSize="12px"
                              sx={{
                                color: theme.palette.text.secondary,
                              }}
                            >
                              {t("added via ")}
                              {t(item?.reference).replaceAll("_", " ")} (
                              {t("bonus")}:
                              {getAmountWithSign(item?.admin_bonus)})
                            </Typography>
                          ) : (
                            <Typography
                              fontSize="12px"
                              sx={{
                                color: theme.palette.text.secondary,
                              }}
                            >
                              {t(item?.transaction_type).replaceAll("_", " ")}
                            </Typography>
                          )}
                        </Stack>
                      </CustomTableCell>
                      <CustomTableCell>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: item?.debit ? "error.main" : "success.main", // âœ… red / green
                          }}
                        >

                          {item?.debit ? "- " : "+ "}

                          {
                            // âœ… Always handle BBPS debit properly
                            (item?.transaction_type === "bbps_bill_pay" ||
                              item?.transaction_type === "bbps_refund") && item?.debit
                              ? getAmountWithSign(item?.debit)

                              : page === "loyalty"
                                ? item?.transaction_type === "point_to_wallet"
                                  ? item?.debit
                                  : item?.credit

                                : getAmountWithSign(
                                  item?.transaction_type === "point_to_wallet" ||
                                    item?.transaction_type === "partial_payment" ||
                                    item?.transaction_type === "order_place"
                                    ? item?.debit
                                    : item?.credit + item?.admin_bonus
                                )
                          }
                        </Typography>
                      </CustomTableCell>

                      <CustomTableCell>
                        {moment(item?.created_at).format("D MMMM h:mm A")}
                      </CustomTableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </CustomTable>
            <Box ref={ref} sx={{ height: "5px" }} />
          </TableContainer>
        </SimpleBar>
      )}
      {!isLoading && isFetching && (
        <Stack sx={{ marginTop: "2rem" }}>
          <DotSpin />
        </Stack>
      )}
      {isLoading && (
        <TableContainer>
          <CustomTable>
            <TableBody>
              <TransactionShimmer />
            </TableBody>
          </CustomTable>
        </TableContainer>
      )}
      {trxData?.length == 0 && (
        <CustomEmptyResult
          image={nodataimage}
          width="128px"
          height="80"
          label="No transaction found"
        />
      )}
      <CustomDivider />
    </>
  );
};

export const CustomSelect = ({ label, children, name, id, value, onChange }) => {
  return (
    <Select
      labelId={id}
      id={id}
      name={name}
      value={value}
      label={label}
      onChange={onChange}
      sx={{
        height: "36px",
        borderRadius: "6px",
        minWidth: "160px",
        fontSize: "14px",
      }}
    >
      {children}
    </Select>
  );
};


export const CustomTableCell = styled(TableCell)(({ theme }) => ({
  padding: "12px 20px",
  textTransform: "capitalize !important",
  borderBottom: "none",
  fontWeight: "600",
  fontSize: "14px",
  color: theme.palette.text.primary,
  "&:first-of-type": {
    borderRadius: "10px 0 0 10px !important",
  },
  "&:last-of-type": {
    borderRadius: "0 10px 10px 0 !important",
  },
  [theme.breakpoints.down("md")]: {
    padding: "12px 10px",
  },
}));

export const CustomTable = styled(Table)(({ theme }) => ({
  borderCollapse: "separate",
  borderSpacing: "0 12px",
  border: "1px solid #D9E1EC",
  // border:"1px solid black",
  // background: "#f7fdf7",
  borderRadius: "10px",
  // boxShadow: "0 2px 8px rgb(0 0 0 / 0.05)",
}));

export default TransactionHistory;