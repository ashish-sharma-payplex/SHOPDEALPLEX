// components/payment/QRPaymentPage.jsx
import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import Swal from "sweetalert2";

// ─── Theme tokens (same as your QR modal) ─────────────────────────────────
const G = {
  green: "var(--bs-brand)",
  greenLight: "var(--bs-success-bg)",
  greenBorder: "var(--bs-success-border)",
  greenDark: "var(--bs-brand-strong-text)",
  text: "var(--bs-text-strong)",
  muted: "var(--bs-text-muted)",
  border: "var(--bs-border)",
  // bg: "var(--bs-surface-subtle)",
  white: "var(--bs-surface)",
  red: "var(--bs-danger-text)",
  redLight: "var(--bs-danger-bg)",
  amber: "var(--bs-warn-strong-text)",
  amberLight: "var(--bs-warn-bg-soft)",
};

// ─── Inject page styles once ───────────────────────────────────────────────
const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

.qrp-page {
  font-family: "Inter, sans-serif";
  min-height: 100vh;
  padding-top: 100px;
 
}

.qrp-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  
}

@media (max-width: 900px) {
  .qrp-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Left card ── */
.qrp-card {
  background: var(--bs-surface);
  border: 1px solid var(--bs-border);
  border-radius: 16px;
  padding: 24px;
}

.qrp-left-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}
.qrp-left-title { font-size: 18px; font-weight: 700; color: var(--bs-text-strong); margin: 0 }
.qrp-left-sub { font-size: 13px; color: var(--bs-text-muted); margin-top: 2px }

.qrp-timer {
  display: flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 600; color: var(--bs-brand-text);
  flex-shrink: 0;
}
.qrp-timer.danger { color: var(--bs-danger-text) }

.qrp-status-pill {
  display: inline-flex; align-items: center;
  background: var(--bs-warn-bg-soft); border: 1px solid var(--bs-warn-border);
  color: var(--bs-warn-text); font-size: 13px; font-weight: 600;
  border-radius: 8px; padding: 8px 16px;
  margin: 0 auto 20px; width: fit-content;
}
.qrp-status-pill.success { background: var(--bs-success-bg); border-color: var(--bs-success-border); color: var(--bs-brand-text) }
.qrp-status-pill.failed { background: var(--bs-danger-bg); border-color: var(--bs-danger-border); color: var(--bs-danger-text) }

.qrp-qr-area {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.qrp-qr-wrap {
  position: relative; border-radius: 16px;
  border: 1px solid var(--bs-border);
  padding: 14px; background: var(--bs-surface);
}
.qrp-qr-canvas { display: block; border-radius: 8px; background: var(--bs-logo-bg) }
.qrp-qr-overlay {
  position: absolute; inset: 0; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bs-surface-glass);
}
.qrp-qr-overlay-inner { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px }

.qrp-retry-btn {
  margin-top: 4px;
  background: var(--bs-brand); color: var(--bs-text-on-brand); border: none;
  border-radius: 8px; padding: 9px 20px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  transition: background 0.15s, transform 0.1s;
}
.qrp-retry-btn:hover { background: var(--bs-brand-hover); transform: scale(1.03) }

.qrp-scan-hint { font-size: 13px; color: var(--bs-brand-text) }

.qrp-upi-row {
  display: flex; align-items: center; justify-content: center; gap: 18px;
  margin: 18px 0 4px; flex-wrap: wrap;
}
.qrp-upi-chip { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--bs-text-body) }

.qrp-steps {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 560px) {
  .qrp-steps { grid-template-columns: 1fr }
}
.qrp-steps-title { font-size: 15px; font-weight: 700; color: var(--bs-text-strong); margin-bottom: 14px }
.qrp-step-num {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--bs-success-bg); color: var(--bs-brand-text); font-weight: 700; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
}
.qrp-step-title { font-size: 13px; font-weight: 700; color: var(--bs-text-strong); margin-bottom: 4px }
.qrp-step-desc { font-size: 12px; color: var(--bs-text-muted); line-height: 1.5 }

/* ── Right column ── */
.qrp-right { display: flex; flex-direction: column; gap: 16px }
.qrp-right-card {
  background: var(--bs-surface); border: 1px solid var(--bs-border); border-radius: 16px; padding: 18px;
}
.qrp-right-title { font-size: 14px; font-weight: 700; color: var(--bs-text-strong); margin-bottom: 10px }

/* Delivery address */
.qrp-addr-name { font-size: 13px; font-weight: 700; color: var(--bs-text-strong); margin-bottom: 4px }
.qrp-addr-line { display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: var(--bs-text-muted); margin-top: 4px; line-height: 1.5 }

/* Cart */
.qrp-cart-count { font-size: 11px; color: var(--bs-text-faint); float: right }
.qrp-cart-item { display: flex; align-items: center; gap: 10px; margin-top: 10px }
.qrp-cart-img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; background: var(--bs-surface-muted); flex-shrink: 0 }
.qrp-cart-name { font-size: 13px; font-weight: 600; color: var(--bs-text-strong) }
.qrp-cart-sub { font-size: 11px; color: var(--bs-text-faint) }
.qrp-cart-price { margin-left: auto; font-size: 13px; font-weight: 700; color: var(--bs-text-strong) }
.qrp-cart-qty { font-size: 12px; color: var(--bs-text-muted); width: 16px; text-align: center }

/* Payment summary */
.qrp-sum-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--bs-text-body); margin-top: 8px }
.qrp-sum-row.discount { color: var(--bs-brand-text) }
.qrp-sum-total { display: flex; justify-content: space-between; font-size: 15px; font-weight: 700; color: var(--bs-text-strong); margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--bs-border) }

.qrp-cancel-btn {
  width: 100%; margin-top: 16px;
  padding: 11px 0; border-radius: 10px;
  border: 1.5px solid var(--bs-danger-line); background: var(--bs-surface); color: var(--bs-danger-text);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.qrp-cancel-btn:hover:not(:disabled) { background: var(--bs-danger-bg) }
.qrp-cancel-btn:disabled { opacity: 0.4; cursor: not-allowed }

.qrp-spinner {
  width: 30px; height: 30px;
  border: 3px solid var(--bs-border); border-top-color: #16a34a; border-radius: 50%;
  animation: qrpSpin 0.8s linear infinite;
}
@keyframes qrpSpin { to { transform: rotate(360deg) } }
`;

function injectPageStyles() {
  if (
    typeof document !== "undefined" &&
    !document.getElementById("qrp-styles")
  ) {
    const tag = document.createElement("style");
    tag.id = "qrp-styles";
    tag.innerHTML = PAGE_CSS;
    document.head.appendChild(tag);
  }
}

// ─── Countdown hook (same logic as your modal) ────────────────────────────
function useCountdown(expiryDateStr) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {
    if (!expiryDateStr) return;
    const expiry = new Date(expiryDateStr).getTime();
    const now = Date.now();
    const initial = Math.max(0, Math.floor((expiry - now) / 1000));
    setTotalSeconds(initial);
    setSecondsLeft(initial);

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDateStr]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const isDanger = secondsLeft <= 60 && secondsLeft > 0;
  const isExpired = secondsLeft === 0 && totalSeconds > 0;

  return { mm, ss, isDanger, isExpired, secondsLeft };
}

// ─── QR Canvas ─────────────────────────────────────────────────────────────
function QRCanvas({ upiUrl, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!upiUrl || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, upiUrl, {
      width: size,
      margin: 1,
      color: { dark: "#111827", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).catch(console.error);
  }, [upiUrl, size]);

  return (
    <canvas
      ref={canvasRef}
      className="qrp-qr-canvas"
      width={size}
      height={size}
    />
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────
// deliveryAddress / cartItems / paymentSummary props are OPTIONAL.
// Right column simply doesn't render a section if its data isn't passed.
export default function QRPaymentPage({
  paymentData, // { amount, orderId, upiIntentUrl, expiryDate }
  onRetry,
  onCancelPayment, // async fn — required only if you show the cancel button
  retrying = false,
  cancelling = false,
  paymentStatus, // "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED"

  // optional right-side data
  deliveryAddress, // { name, phone, address }
  cartItems, // [{ name, sub, qty, price, image }]
  paymentSummary, // { itemPrice, deliveryCharge, discount, total }
}) {
  injectPageStyles();

  const { mm, ss, isDanger, isExpired } = useCountdown(paymentData?.expiryDate);

  const showExpired = isExpired || paymentStatus === "EXPIRED";
  const showFailed = paymentStatus === "FAILED";
  const showSuccess = paymentStatus === "SUCCESS";
  const cancelEnabled =
    !showExpired && !showFailed && !showSuccess && !retrying && !cancelling;

  const amount = paymentData?.amount ?? paymentSummary?.total ?? "0";
  const upiUrl = paymentData?.upiIntentUrl ?? "";

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "Cancel Payment?",
      text: "Are you sure you want to cancel this payment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No, Go Back",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#16a34a",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await onCancelPayment?.();
      Swal.fire({
        icon: "success",
        title: "Payment Cancelled",
        text: "Your payment has been cancelled successfully.",
        confirmButtonColor: "#16a34a",
        timer: 2500,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cancellation Failed",
        text: err?.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#16a34a",
      });
    }
  };

  return (
    <div className="qrp-page">
      <div className="qrp-grid">
        {/* ── LEFT: QR CARD ── */}
        <div className="qrp-card">
          <div className="qrp-left-header">
            <div>
              <h2 className="qrp-left-title">Pay using QR Code</h2>
              <div className="qrp-left-sub">Scan using any UPI App</div>
            </div>
            {!showExpired && !showFailed && !showSuccess && (
              <div className={`qrp-timer${isDanger ? " danger" : ""}`}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {mm}:{ss}
              </div>
            )}
          </div>

          <div
            className={`qrp-status-pill${showSuccess ? " success" : ""}${
              showFailed || showExpired ? " failed" : ""
            }`}
            style={{ display: "flex" }}
          >
            {showSuccess
              ? "Payment Successful"
              : showFailed
              ? "Payment Failed"
              : showExpired
              ? "QR Expired"
              : "Waiting for payment..."}
          </div>

          <div className="qrp-qr-area">
            <div className="qrp-qr-wrap">
              {retrying ? (
                <div
                  style={{
                    width: 200,
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="qrp-spinner" />
                </div>
              ) : (
                <QRCanvas upiUrl={upiUrl} size={200} />
              )}

              {(showExpired || showFailed) && !retrying && (
                <div className="qrp-qr-overlay">
                  <div className="qrp-qr-overlay-inner">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--bs-warn-strong-text)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--bs-text-strong)",
                      }}
                    >
                      {showFailed ? "Payment Failed" : "QR Expired"}
                    </div>
                    <button className="qrp-retry-btn" onClick={onRetry}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--bs-text-on-brand)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      Retry Payment
                    </button>
                  </div>
                </div>
              )}

              {showSuccess && (
                <div className="qrp-qr-overlay">
                  <div className="qrp-qr-overlay-inner">
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        background: "var(--bs-success-bg)",
                        border: "2px solid var(--bs-success-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--bs-brand-text)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--bs-text-strong)",
                      }}
                    >
                      Payment Successful!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!showExpired && !showFailed && !showSuccess && !retrying && (
              <div className="qrp-scan-hint">
                Scan securely using any UPI application
              </div>
            )}
          </div>

          {/* <div className="qrp-upi-row">
            <span className="qrp-upi-chip">🅖 GPay</span>
            <span className="qrp-upi-chip">PhonePe</span>
            <span className="qrp-upi-chip">Paytm</span>
            <span className="qrp-upi-chip">BHIM</span>
          </div> */}

          <div className="qrp-steps">
            <div>
              <div className="qrp-step-num">1</div>
              <div className="qrp-step-title">Open UPI App</div>
              <div className="qrp-step-desc">
                Open GPay, PhonePe, Paytm or any UPI application.
              </div>
            </div>
            <div>
              <div className="qrp-step-num">2</div>
              <div className="qrp-step-title">Scan QR</div>
              <div className="qrp-step-desc">
                Scan the QR shown above to initiate payment.
              </div>
            </div>
            <div>
              <div className="qrp-step-num">3</div>
              <div className="qrp-step-title">Complete Payment</div>
              <div className="qrp-step-desc">
                Enter your UPI PIN and wait for automatic confirmation.
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: optional sections ── */}
        <div className="qrp-right">
          {deliveryAddress && (
            <div className="qrp-right-card">
              <div className="qrp-right-title"> My Address</div>
              <div className="qrp-addr-name">{deliveryAddress.name}</div>
              {deliveryAddress.phone && (
                <div className="qrp-addr-line">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--bs-brand-text)"
                    strokeWidth="2"
                    style={{ marginTop: 2, flexShrink: 0 }}
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {deliveryAddress.phone}
                </div>
              )}
              {deliveryAddress.address && (
                <div className="qrp-addr-line">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--bs-brand-text)"
                    strokeWidth="2"
                    style={{ marginTop: 2, flexShrink: 0 }}
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {deliveryAddress.address}
                </div>
              )}
            </div>
          )}

          {cartItems?.length > 0 && (
            <div className="qrp-right-card">
              <div className="qrp-right-title">My Seat</div>
              {cartItems.map((item, i) => (
                <div className="qrp-cart-item" key={i}>
                  {/* <span className="qrp-cart-qty">{item.qty ?? 1}</span> */}
                  {item.image && (
                    <img
                      className="qrp-cart-img"
                      src={item.image}
                      alt={item.name}
                    />
                  )}
                  <div>
                    <div className="qrp-cart-name">{item.name}</div>
                    {item.sub && <div className="qrp-cart-sub">{item.sub}</div>}
                  </div>
                  <div className="qrp-cart-price">
                    ₹{Number(item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(paymentSummary || paymentData) && (
            <div className="qrp-right-card">
              <div className="qrp-right-title">Payment Summary</div>
              {/* {paymentSummary?.itemPrice != null && (
                <div className="qrp-sum-row">
                  <span>Item Price</span>
                  <span>₹{Number(paymentSummary.itemPrice).toFixed(2)}</span>
                </div>
              )} */}
              {paymentSummary?.deliveryCharge != null && (
                <div className="qrp-sum-row">
                  <span>Delivery Charge</span>
                  <span>
                    ₹{Number(paymentSummary.deliveryCharge).toFixed(2)}
                  </span>
                </div>
              )}
              {paymentSummary?.discount != null && (
                <div className="qrp-sum-row discount">
                  <span>Product Discount</span>
                  <span>- ₹{Number(paymentSummary.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="qrp-sum-total">
                <span>Total Payable</span>
                <span>₹{Number(amount).toFixed(2)}</span>
              </div>

              {onCancelPayment && (
                <button
                  className="qrp-cancel-btn"
                  disabled={!cancelEnabled}
                  onClick={handleCancel}
                >
                  {cancelling ? "Cancelling..." : "Cancel Payment"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
