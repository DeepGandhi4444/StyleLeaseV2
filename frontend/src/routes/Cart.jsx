import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Ripple } from "primereact/ripple";
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowLeft,
  Calendar,
  AlertCircle,
  CreditCard,
} from "lucide-react";

const Cart = ({ cartItems, setCartItems }) => {
  const toast = useRef(null);
  const navigate = useNavigate();

  const removeFromCart = (productToRemove) => {
    setCartItems(
      cartItems.filter(
        (item) => (item.id || item._id) !== (productToRemove.id || productToRemove._id)
      )
    );
  };

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 899) * (Number(item.qty) || 1),
    0
  );

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;

    // Check if user is logged in
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) {
      if (toast.current) {
        toast.current.show({
          severity: "info",
          summary: "Please Login First",
          detail: "You need to log in to verify delivery address and complete checkout.",
          life: 3000,
        });
      }
      setTimeout(() => navigate("/"), 1200);
      return;
    }

    navigate("/checkout");
  };

  return (
    <main className="app-container" style={{ paddingTop: "20px" }}>
      <Toast ref={toast} className="custom-toast-success" />

      {/* Breadcrumb / Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShoppingBag size={24} color="var(--primary)" />
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
            Rental Bag ({cartItems.length} items)
          </h1>
        </div>
        <Link
          to="/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--primary)",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Keep Exploring</span>
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#fff",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
            }}
          >
            <ShoppingBag size={36} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            Your rental bag is currently empty
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "440px", margin: "0 auto 24px auto" }}>
            Explore trending designer outfits, sherwanis, tuxedos, and luxury footwear. Rent for 3 to 10 days with free doorstep pickup.
          </p>
          <Link to="/products">
            <button
              className="p-ripple"
              style={{
                backgroundColor: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "12px 28px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>Explore Catalog</span>
              <ArrowRight size={16} />
              <Ripple />
            </button>
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Left Column: Cart Items List */}
          <div className="cart-items-card">
            {cartItems.map((item, index) => {
              const itemTotal = (Number(item.price) || 899) * (Number(item.qty) || 1);
              const duration = item.rentalDuration || 4;

              return (
                <div key={item.id || item._id || index} className="cart-item-row">
                  <img
                    src={item.imgSrc}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 4px 0" }}>
                          {item.name}
                        </h3>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <span>Size: <strong>{item.size || "9"}</strong></span>
                          <span>&bull;</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: "var(--primary)", fontWeight: 600 }}>
                            <Calendar size={13} />
                            <span>Tenure: {duration} Days</span>
                          </span>
                          <span>&bull;</span>
                          <span>Qty: <strong>{item.qty || 1}</strong></span>
                        </div>
                        {item.productAge && (
                          <div style={{ fontSize: "12px", color: "#059669", marginTop: "4px" }}>
                            Condition: {item.productAge}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                        title="Remove from bag"
                      >
                        <Trash2 size={16} />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        ₹{Number(item.price || 899).toLocaleString("en-IN")} for {duration} days
                      </div>
                      <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--accent)" }}>
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Late Return Policy Reminder */}
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                backgroundColor: "#fffbeb",
                border: "1px solid #fef3c7",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#92400e",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
              <div>
                <strong>Rental Tenure &amp; Late Fee Terms:</strong> Doorstep pickup will be scheduled automatically on your return due date. Late returns without prior renewal incur a standard penalty of ₹150/day.
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary Card */}
          <div className="cart-summary-sticky-card">
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "18px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              Rental Price Breakdown
            </h2>

            <div className="summary-row">
              <span>Rental Charges ({cartItems.length} items)</span>
              <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
            </div>

            <div className="summary-row">
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={16} color="#059669" /> Sanitization &amp; Ironing
              </span>
              <span style={{ color: "#059669", fontWeight: 600 }}>FREE</span>
            </div>

            <div className="summary-row">
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Truck size={16} color="#059669" /> Doorstep Drop &amp; Pickup
              </span>
              <span style={{ color: "#059669", fontWeight: 600 }}>FREE</span>
            </div>

            <div className="summary-row">
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <RotateCcw size={16} color="#059669" /> Accidental Damage Shield
              </span>
              <span style={{ color: "#059669", fontWeight: 600 }}>INCLUDED</span>
            </div>

            <div className="summary-row total">
              <span>Total Payable:</span>
              <span style={{ color: "var(--accent)" }}>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="p-ripple"
              style={{
                width: "100%",
                backgroundColor: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: "0 4px 14px rgba(236, 52, 39, 0.3)",
                marginTop: "16px",
                transition: "var(--transition)",
              }}
            >
              <CreditCard size={18} />
              <span>Proceed to Demo Payment</span>
              <Ripple />
            </button>

            <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
              🔒 Secured checkout &bull; Address &amp; OTP verification in next step
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;
