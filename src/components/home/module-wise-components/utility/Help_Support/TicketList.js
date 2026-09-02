import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import useGetTicketList from "api-manage/hooks/react-query/utility/useGetTicketList";

const TicketList = ({ tokenAvailable }) => {
  const { data: tickets = [], isLoading, isError } =
    useGetTicketList(tokenAvailable);


//     console.log("tickets:", tickets);
// console.log("isLoading:", isLoading);
// console.log("isError:", isError);
  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography color="error">Error fetching tickets</Typography>;

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Ticket List
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ticket ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Service</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {tickets.map((ticket, index) => (
            <TableRow key={index}>
              <TableCell>{ticket.ticket_id}</TableCell>
              <TableCell>{ticket.ticket_status}</TableCell>
              <TableCell>{ticket.ticket_type}</TableCell>
              <TableCell>{ticket.description}</TableCell>

              <TableCell>
                {ticket.transaction?.amount ?? "N/A"}
              </TableCell>

              <TableCell>
                {ticket.transaction?.service_name ?? "N/A"}
              </TableCell>

              <TableCell>{ticket.created_at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TicketList;