// pages/buses/BusTicketPage.jsx
import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";

const RED = "#e0312e";
const GREEN = "#16a34a";
const BORDER = "#e5e7eb";
const MUTED = "#6b7280";

const STYLES = `
  .bt-wrap {
    min-height: 100vh;
    background: #f3f4f6;
    padding: 32px 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .bt-card {
    width: 100%;
    max-width: 700px;
    background: #fff;
    border-radius: 10px;
    border: 1px solid ${BORDER};
    overflow: hidden;
    /* ✅ NAYA — main card ke upar extra top space, taaki fixed
       navbar/header ke saath overlap na ho. Value yahin se tweak karo. */
    margin-top: 96px;
  }
  .bt-section {
    padding: 18px 26px;
    border-bottom: 1px solid #f3f4f6;
  }
  .bt-section:last-child { border-bottom: none; }
  .bt-label {
    font-size: 11px;
    font-weight: 700;
    text-decoration: underline;
    color: #111;
    margin-bottom: 4px;
    white-space: nowrap;
  }
  .bt-value {
    font-size: 13px;
    color: #111;
    font-weight: 600;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  .bt-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .bt-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .bt-info-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    column-gap: 24px;
    row-gap: 20px;
  }
  .bt-info-cell {
    min-width: 0;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  .bt-addr-row {
    font-size: 13px;
    color: #111;
    margin-bottom: 3px;
    line-height: 1.4;
  }
  .bt-addr-row b { font-weight: 700; }
  .bt-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .bt-table th {
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    text-decoration: underline;
    color: #111;
    padding: 4px 0;
  }
  .bt-table td {
    font-size: 13px;
    color: #111;
    padding: 6px 0;
    font-weight: 500;
  }
  .bt-actions {
    width: 100%;
    max-width: 700px;
    display: flex;
    gap: 12px;
    margin-top: 20px;
  }
  .bt-btn {
    flex: 1;
    height: 46px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }
  .bt-success-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 0 8px;
    background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
  }
  .bt-fail-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 0 8px;
    background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%);
  }
  .bt-success-circle {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: ${GREEN};
    display: flex;
    align-items: center;
    justify-content: center;
    animation: btPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .bt-fail-circle {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: ${RED};
    display: flex;
    align-items: center;
    justify-content: center;
    animation: btPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .bt-success-check {
    stroke: #fff;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    stroke-dasharray: 24;
    stroke-dashoffset: 24;
    animation: btDraw 0.4s ease forwards 0.35s;
  }
  .bt-fail-cross line {
    stroke: #fff;
    stroke-width: 3;
    stroke-linecap: round;
    opacity: 0;
    animation: btFadeUp 0.3s ease forwards 0.35s;
  }
  .bt-success-title {
    font-size: 18px;
    font-weight: 700;
    color: #166534;
    margin-top: 14px;
    opacity: 0;
    animation: btFadeUp 0.4s ease forwards 0.55s;
  }
  .bt-fail-title {
    font-size: 18px;
    font-weight: 700;
    color: ${RED};
    margin-top: 14px;
    opacity: 0;
    animation: btFadeUp 0.4s ease forwards 0.55s;
  }
  .bt-success-sub {
    font-size: 13px;
    color: #16a34a;
    margin-top: 4px;
    opacity: 0;
    animation: btFadeUp 0.4s ease forwards 0.7s;
  }
  .bt-fail-sub {
    font-size: 13px;
    color: ${RED};
    margin-top: 4px;
    opacity: 0;
    max-width: 480px;
    text-align: center;
    padding: 0 16px;
    animation: btFadeUp 0.4s ease forwards 0.7s;
  }
  .bt-success-ring {
    position: absolute;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 2px solid ${GREEN};
    animation: btRing 1s ease-out forwards 0.1s;
    opacity: 0;
  }
  .bt-fail-ring {
    position: absolute;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 2px solid ${RED};
    animation: btRing 1s ease-out forwards 0.1s;
    opacity: 0;
  }
  @keyframes btPop {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes btDraw {
    to { stroke-dashoffset: 0; }
  }
  @keyframes btFadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes btRing {
    0% { transform: scale(0.8); opacity: 0.6; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  .bt-capture-mode .bt-success-circle,
  .bt-capture-mode .bt-fail-circle,
  .bt-capture-mode .bt-success-title,
  .bt-capture-mode .bt-fail-title,
  .bt-capture-mode .bt-success-sub,
  .bt-capture-mode .bt-fail-sub,
  .bt-capture-mode .bt-success-check,
  .bt-capture-mode .bt-fail-cross line,
  .bt-capture-mode .bt-success-ring,
  .bt-capture-mode .bt-fail-ring {
    animation: none !important;
    opacity: 1 !important;
    stroke-dashoffset: 0 !important;
    transform: none !important;
  }
  @media (max-width: 700px) {
    .bt-info-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 560px) {
    .bt-grid-3 { grid-template-columns: 1fr 1fr; }
    .bt-grid-2 { grid-template-columns: 1fr; }
    .bt-info-grid { grid-template-columns: 1fr; }
    .bt-section { padding: 16px; }
    /* ✅ NAYA — mobile pe utna bada gap nahi chahiye, thoda kam rakha */
    .bt-card { margin-top: 56px; }
  }
`;

const injectStyles = () => {
  if (typeof document === "undefined") return;
  let tag = document.getElementById("bt-styles");
  if (!tag) {
    tag = document.createElement("style");
    tag.id = "bt-styles";
    document.head.appendChild(tag);
  }
  // ✅ FIX — pehle sirf tag na-hone par create hota tha, isliye ek baar
  // page visit hone ke baad naya CSS kabhi apply nahi hota tha (purana
  // <style> tag DOM mein reh jata tha). Ab content hamesha refresh hoga.
  if (tag.innerHTML !== STYLES) {
    tag.innerHTML = STYLES;
  }
};

const Field = ({ label, value }) => (
  <div className="bt-info-cell">
    <div className="bt-label">{label}</div>
    <div className="bt-value">{value ?? "-"}</div>
  </div>
);

const Row = ({ k, v }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      padding: "3px 0",
    }}
  >
    <span style={{ color: MUTED }}>{k}</span>
    <span style={{ fontWeight: 700, color: "#111", marginLeft: 12 }}>
      {v ?? "-"}
    </span>
  </div>
);

const BusTicketPage = () => {
  injectStyles();
  const { state } = useLocation();
  const navigate = useNavigate();
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const bookingResponse = state?.bookingResponse;
  const bus = state?.bus || {};
  const contact = state?.contact || {};
  const billing = state?.billing || {};
  const passengers = state?.passengers || [];
  const selectedSeatObjects = state?.selectedSeatObjects || [];
  const selectedBoardingPoint = state?.selectedBoardingPoint;
  const selectedDroppingPoint = state?.selectedDroppingPoint;

  useEffect(() => {
    if (!bookingResponse) {
      navigate("/", { replace: true });
    }
  }, [bookingResponse, navigate]);

  // ✅ FIX — user was able to hit the browser Back button from the
  // Booking Confirmed screen and land back on payment/seat-selection,
  // which could trigger a duplicate booking attempt. We push an extra
  // history entry on mount and, whenever the user tries to go back
  // (popstate), re-push forward and redirect them to My Trips instead —
  // effectively locking the Back button on this screen.
  useEffect(() => {
    if (!bookingResponse) return;

    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      navigate("/my-trips", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [bookingResponse, navigate]);

  if (!bookingResponse) return null;

  // ✅ NAYA — booking/payment fail hua ya nahi, isse decide hoga
  const isBookingFailed = bookingResponse?.success === false;
  const failureMessage =
    bookingResponse?.message ||
    "Something went wrong while processing your booking. Please try again.";

  const data = bookingResponse?.data || {};

  // ✅ FIX — actual bus /book/ response ka shape hai: data.booking.{status,
  // ticket_number, invoice_number, invoice_amount, bus_id}. Pehle galti se
  // top-level (data.booking_id, data.hotel_booking_status) map kiya tha,
  // jo hotel-response ka shape tha, isliye sab "-" dikh raha tha.
  const booking = data?.booking || {};
  const ticketNumber = booking?.ticket_number;
  const invoiceNumber = booking?.invoice_number;
  const invoiceAmount = booking?.invoice_amount;
  const busId = booking?.bus_id;
  const bookingStatus = booking?.status; // e.g. "CONFIRMED"

  // ✅ NAYA — lead passenger (jo form mein sabse pehle bhara gaya tha)
  const leadPassenger = passengers?.[0] || {};

  const totalFare = selectedSeatObjects.reduce(
    (s, seat) => s + (seat.SeatFare || 0),
    0,
  );

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      ticketRef.current.classList.add("bt-capture-mode");

      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `Ticket-${ticketNumber || "bus"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      // console.error("Download failed:", err);
    } finally {
      ticketRef.current?.classList.remove("bt-capture-mode");
      setDownloading(false);
    }
  };

  return (
    <div className="bt-wrap">
      <div className="bt-card" ref={ticketRef}>
        {/* Success / Failure animation */}
        {isBookingFailed ? (
          <div className="bt-fail-wrap">
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="bt-fail-ring" />
              <div className="bt-fail-circle">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  className="bt-fail-cross"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </div>
            </div>
            <div className="bt-fail-title">Booking failed</div>
            <div className="bt-fail-sub">{failureMessage}</div>
          </div>
        ) : (
          <div className="bt-success-wrap">
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="bt-success-ring" />
              <div className="bt-success-circle">
                <svg width="34" height="34" viewBox="0 0 24 24">
                  <path className="bt-success-check" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="bt-success-title">Booking confirmed</div>
            <div className="bt-success-sub">
              Your bus ticket has been booked successfully
            </div>
          </div>
        )}

        {/* Header */}
        <div
          className="bt-section"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
                {bus.from} <span style={{ color: MUTED }}>→</span> {bus.to}
              </span>
            </div>
            <div className="bt-value" style={{ fontWeight: 700 }}>
              {bus.departureDate}
            </div>
            <div style={{ marginTop: 10 }}>
              <div className="bt-label">Bus operator</div>
              <div className="bt-value">{bus.operatorName}</div>
            </div>
          </div>

          {/* ✅ PNR/status box sirf success case mein dikhega */}
          {!isBookingFailed && (
            <div
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: "10px 16px",
                minWidth: 200,
              }}
            >
              <Row k="Ticket #" v={ticketNumber} />
              <Row k="Invoice #" v={invoiceNumber} />
              <Row
                k="Invoice Amount"
                v={
                  invoiceAmount != null
                    ? `₹${Number(invoiceAmount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}`
                    : "-"
                }
              />
              <Row k="Bus ID" v={busId} />
              <Row
                k="Status"
                v={
                  <span
                    style={{
                      color:
                        bookingStatus?.toLowerCase() === "confirmed"
                          ? GREEN
                          : RED,
                    }}
                  >
                    {bookingStatus}
                  </span>
                }
              />
            </div>
          )}
        </div>

        {/* Passengers table — fixed 4-col layout matching info-grid */}
        <div className="bt-section">
          <table className="bt-table">
            <colgroup>
              <col style={{ width: "50%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Passenger name</th>
                <th>Seat</th>
                <th>Age / Gender</th>
              </tr>
            </thead>
            <tbody>
              {passengers.map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{selectedSeatObjects[i]?.SeatName || "-"}</td>
                  <td>
                    {p.age} / {p.gender}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ NAYA — Booked by: lead passenger + contact + address, ek jagah */}
        <div className="bt-section">
          <div className="bt-info-grid">
            <Field label="Booked by" value={leadPassenger.name} />
            <Field
              label="Age / Gender"
              value={`${leadPassenger.age || "-"} / ${
                leadPassenger.gender || "-"
              }`}
            />
            <Field
              label="Contact number"
              value={`${contact.countryCode || ""} ${
                contact.phone || ""
              }`.trim()}
            />
            <Field label="Email" value={contact.email} />
          </div>
        </div>

        {/* ✅ NAYA — Address (billing address use hoti hai; agar khaali ho toh "-") */}
        <div className="bt-section">
          <div className="bt-info-grid">
            <div className="bt-info-cell" style={{ gridColumn: "span 2" }}>
              <div className="bt-label">Address</div>
              <div className="bt-value" style={{ fontWeight: 500 }}>
                {billing.address || "-"}
                {billing.city ? `, ${billing.city}` : ""}
                {billing.state ? `, ${billing.state}` : ""}
                {billing.pin ? ` - ${billing.pin}` : ""}
              </div>
            </div>
            <div />
            <div />
          </div>
        </div>

        {/* Journey + Boarding/Dropping address + Fare — single aligned 4-col grid */}
        <div className="bt-section">
          <div className="bt-info-grid">
            {/* Row 1 */}
            <Field label="Bus type" value={bus.busType} />
            <Field label="Departure time" value={bus.departureTime} />
            <Field label="Arrival time" value={bus.arrivalTime} />
            <div className="bt-info-cell">
              <div className="bt-label">Boarding point address</div>
              {selectedBoardingPoint?.subLabel && (
                <div className="bt-addr-row">
                  <b>Location :</b> {selectedBoardingPoint.subLabel}
                </div>
              )}
              <div className="bt-addr-row">
                <b>Landmark :</b> {selectedBoardingPoint?.landmark || "-"}
              </div>
              <div className="bt-addr-row">
                <b>Address :</b> {selectedBoardingPoint?.address || "-"}
              </div>
            </div>

            {/* Row 2 */}
            <Field
              label={`Fare (${selectedSeatObjects.length} seat${
                selectedSeatObjects.length > 1 ? "s" : ""
              })`}
              value={`₹${totalFare.toLocaleString("en-IN")}`}
            />
            <div className="bt-info-cell" />
            <div className="bt-info-cell" />
            <div className="bt-info-cell">
              <div className="bt-label">Dropping point address</div>
              {selectedDroppingPoint?.subLabel && (
                <div className="bt-addr-row">
                  <b>Location :</b> {selectedDroppingPoint.subLabel}
                </div>
              )}
              <div className="bt-addr-row">
                <b>Landmark :</b> {selectedDroppingPoint?.landmark || "-"}
              </div>
              <div className="bt-addr-row">
                <b>Address :</b> {selectedDroppingPoint?.address || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Billing - only if user actually filled it */}
        {(billing.address || billing.city || billing.state) && (
          <div className="bt-section">
            <div className="bt-grid-3">
              <Field label="Billing address" value={billing.address} />
              <Field
                label="City / State"
                value={`${billing.city || "-"} / ${billing.state || "-"}`}
              />
              <Field label="Pincode" value={billing.pin} />
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="bt-section" style={{ background: "#f9fafb" }}>
          <div style={{ fontSize: 12, color: MUTED, textAlign: "center" }}>
            {isBookingFailed
              ? "If any amount was deducted, it will be refunded within 5-7 business days. Please contact support if you need assistance."
              : "Please carry a valid ID proof while boarding. Show this ticket to the conductor."}
          </div>
        </div>
      </div>

      <div className="bt-actions">
        <button
          className="bt-btn"
          style={{
            background: "#fff",
            border: `1px solid ${BORDER}`,
            color: "#111",
          }}
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>

        {/* ✅ Failure case mein "Download" ki jagah "Try Again" dikhega */}
        {isBookingFailed ? (
          <button
            className="bt-btn"
            style={{ background: RED, color: "#fff" }}
            onClick={() => navigate(-1)}
          >
            Try Again
          </button>
        ) : (
          <button
            className="bt-btn"
            style={{
              background: downloading ? "#9ca3af" : GREEN,
              color: "#fff",
              cursor: downloading ? "not-allowed" : "pointer",
            }}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? "Generating..." : "Download Ticket"}
          </button>
        )}
      </div>
    </div>
  );
};

export default BusTicketPage;
