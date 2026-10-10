import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  Printer,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { orderAPI } from "../services/api";

const PaymentSuccess = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const data = await orderAPI.getById(orderId);
        if (data) {
          setOrder(data);
        }
      } catch (err) {
        console.warn("[PaymentSuccess] Could not fetch order details:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const returnDateString = order?.expectedReturnDate
    ? new Date(order.expectedReturnDate).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Within 4 Days";

  return (
    <main className="app-container" style={{ paddingTop: "30px", paddingBottom: "70px" }}>
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          backgroundColor: "#fff",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
          padding: "32px",
        }}
      >
        {/* Success Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              backgroundColor: "#dcfce7",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
            }}
          >
            <CheckCircle2 size={40} />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", margin: "0 0 6px 0" }}>
            Payment Successful &amp; Booking Confirmed!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
            Thank you for choosing StyleLease. Your demo rental booking has been processed and saved to the database.
          </p>
        </div>

        {/* Order Meta Bar */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Order Reference:</span>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--primary)" }}>
              #{order ? order._id.toUpperCase() : orderId || "SL-DEMO2026"}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Payment Status:</span>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#16a34a" }}>
              PAID (Demo Gateway)
            </div>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Paid:</span>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--accent)" }}>
              ₹{order ? Number(order.totalAmount).toLocaleString("en-IN") : "899"}
            </div>
          </div>
        </div>

        {/* Rental Tenure & Return Schedule Highlight Box */}
        <div
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Calendar size={18} color="#1d4ed8" />
            <strong style={{ fontSize: "14px", color: "#1e40af" }}>
              Scheduled Return Date: {returnDateString}
            </strong>
          </div>
          <p style={{ fontSize: "13px", color: "#1e3a8a", margin: "0 0 10px 0", lineHeight: "1.5" }}>
            Your rental duration is <strong>{order?.rentalDuration || 4} Days</strong>. Our courier partner will arrive at your address on <strong>{returnDateString}</strong> for doorstep inspection and return pickup.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#92400e",
              backgroundColor: "#fef3c7",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "1px solid #fde68a",
            }}
          >
            <AlertTriangle size={14} color="#d97706" />
            <span>Late Return Penalty Policy: ₹{order?.dailyLatePenalty || 150}/day after {returnDateString}</span>
          </div>
        </div>

        {/* Order Details Breakdown */}
        {order && order.orderItems && order.orderItems.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
              Rented Items
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {order.orderItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={item.imgSrc}
                      alt={item.name}
                      style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "6px" }}
                    />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Size: {item.size || "9"} &bull; Qty: {item.qty || 1}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>
                    ₹{(Number(item.price) * (item.qty || 1)).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Details */}
        {order && order.deliveryAddress && (
          <div style={{ marginBottom: "24px", fontSize: "13px", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
              Shipping &amp; Pickup Address:
            </h4>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", color: "var(--text-main)" }}>
              <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong>{order.deliveryAddress.recipientName || order.customerName}</strong>
                <div>
                  {order.deliveryAddress.addressLine1}, {order.deliveryAddress.addressLine2 ? `${order.deliveryAddress.addressLine2}, ` : ""}{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}
                </div>
                <div style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                  Phone: {order.deliveryAddress.phone || order.contactPhone || "Verified"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
          <Link to="/profile" style={{ flex: "1 1 180px", textDecoration: "none" }}>
            <button
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Package size={16} />
              <span>View in My Bookings</span>
            </button>
          </Link>

          <Link to="/products" style={{ flex: "1 1 180px", textDecoration: "none" }}>
            <button
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#fff",
                color: "var(--text-main)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <ShoppingBag size={16} />
              <span>Browse More Outfits</span>
            </button>
          </Link>

          <button
            onClick={handlePrint}
            style={{
              padding: "12px 18px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "var(--radius-md)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default PaymentSuccess;
