import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import {
  User,
  Package,
  Truck,
  Clock,
  Phone,
  PhoneCall,
  LogOut,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Smartphone,
  AlertTriangle,
  Calendar,
  RotateCcw,
  X,
} from "lucide-react";
import { authAPI, orderAPI } from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const toast = useRef(null);

  const [activeTab, setActiveTab] = useState("orders"); // 'orders', 'addresses', 'verification'
  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // User Return Modal State
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnConditionChoice, setReturnConditionChoice] = useState("Good / Mint (As Received)");
  const [returnNotes, setReturnNotes] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Address Form State
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    tag: "Home",
    isDefault: false,
  });

  // OTP Verification State
  const [otpPhone, setOtpPhone] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const email =
    sessionStorage.getItem("email") ||
    localStorage.getItem("email") ||
    "customer@stylelease.com";

  const fetchProfileAndOrders = async () => {
    try {
      const profileData = await authAPI.getProfile();
      if (profileData && profileData.user) {
        setUserProfile(profileData.user);
        setOtpPhone(profileData.user.phone || "");
      }
    } catch (err) {
      console.warn("[Profile] Could not fetch profile:", err.message);
    }

    try {
      const ordersData = await orderAPI.getMyOrders(email);
      setOrders(ordersData);
    } catch (err) {
      console.warn("[Profile] Could not fetch orders:", err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchProfileAndOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  // Add Address Handler
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (
      !newAddress.addressLine1 ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.postalCode ||
      !newAddress.phone
    ) {
      if (toast.current) {
        toast.current.show({
          severity: "warn",
          summary: "Missing Fields",
          detail: "Please fill in all required address fields and phone number.",
          life: 3000,
        });
      }
      return;
    }

    try {
      const res = await authAPI.addAddress(newAddress);
      setUserProfile((prev) => ({ ...prev, addresses: res.addresses }));
      setShowAddAddressModal(false);
      setNewAddress({
        recipientName: userProfile?.name || "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        phone: userProfile?.phone || "",
        tag: "Home",
        isDefault: false,
      });
      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Address Added",
          detail: "New delivery address added successfully.",
          life: 3000,
        });
      }
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Failed to Add Address",
          detail: err.message,
          life: 3000,
        });
      }
    }
  };

  // Delete Address Handler
  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await authAPI.deleteAddress(addressId);
      setUserProfile((prev) => ({ ...prev, addresses: res.addresses }));
      if (toast.current) {
        toast.current.show({
          severity: "info",
          summary: "Address Removed",
          detail: "Address removed from your profile.",
          life: 2500,
        });
      }
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Could Not Remove Address",
          detail: err.message,
          life: 3000,
        });
      }
    }
  };

  // Set Default Address Handler
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await authAPI.setDefaultAddress(addressId);
      setUserProfile((prev) => ({ ...prev, addresses: res.addresses }));
      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Default Address Updated",
          detail: "Preferred delivery address updated.",
          life: 2500,
        });
      }
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Update Failed",
          detail: err.message,
          life: 3000,
        });
      }
    }
  };

  // Send OTP Handler
  const handleSendOtp = async () => {
    if (!otpPhone || otpPhone.length < 8) {
      if (toast.current) {
        toast.current.show({
          severity: "warn",
          summary: "Phone Number Required",
          detail: "Please enter a valid phone number to receive OTP.",
          life: 3000,
        });
      }
      return;
    }

    try {
      const res = await authAPI.sendOtp(otpPhone, "phone_verify");
      setOtpSent(true);
      if (toast.current) {
        toast.current.show({
          severity: "info",
          summary: "OTP Dispatched",
          detail: res.message || "Demo OTP 123456 generated.",
          life: 5000,
        });
      }
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Failed to Send OTP",
          detail: err.message,
          life: 3000,
        });
      }
    }
  };

  // Verify OTP Handler
  const handleVerifyOtp = async () => {
    if (!enteredOtp) {
      if (toast.current) {
        toast.current.show({
          severity: "warn",
          summary: "Enter OTP",
          detail: "Please enter the 6-digit OTP code.",
          life: 3000,
        });
      }
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await authAPI.verifyOtp(otpPhone, enteredOtp);
      if (res.success) {
        setUserProfile((prev) => ({
          ...prev,
          phone: otpPhone,
          isPhoneVerified: true,
        }));
        setOtpSent(false);
        setEnteredOtp("");
        if (toast.current) {
          toast.current.show({
            severity: "success",
            summary: "Phone Verified!",
            detail: "Your contact number is now verified.",
            life: 3000,
          });
        }
      }
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Verification Failed",
          detail: err.message || "Invalid OTP code",
          life: 3000,
        });
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Open Return Request Modal
  const openUserReturnModal = (ord) => {
    setReturnModalOrder(ord);
    setReturnConditionChoice("Good / Mint (As Received)");
    setReturnNotes("");
  };

  // User Confirm Return Request Handler
  const handleConfirmReturnRequest = async (e) => {
    if (e) e.preventDefault();
    if (!returnModalOrder) return;
    setIsSubmittingReturn(true);

    try {
      await orderAPI.updateStatus(returnModalOrder._id, "Return Requested");
      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Return Pickup Scheduled",
          detail: `Doorstep return pickup scheduled for booking #${returnModalOrder._id.slice(-6).toUpperCase()}. Condition and penalty policy acknowledged.`,
          life: 4500,
        });
      }
      setReturnModalOrder(null);
      fetchProfileAndOrders();
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Failed to Request Return",
          detail: err.message,
          life: 3000,
        });
      }
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const name =
    userProfile?.name ||
    sessionStorage.getItem("name") ||
    localStorage.getItem("name") ||
    "Valued Customer";

  return (
    <main className="app-container" style={{ paddingTop: "20px", paddingBottom: "60px" }}>
      <Toast ref={toast} className="custom-toast-success" />

      {/* Responsive Dashboard Grid (Sidebar + Main Content) */}
      <div className="profile-dashboard-grid">
        {/* Left Sidebar: User Info Card */}
        <aside className="profile-sidebar-card">
          <div className="profile-avatar-circle">
            <User size={44} />
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0" }}>
            {name}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 8px 0" }}>
            {email}
          </p>

          {/* Verification Badge */}
          {userProfile?.isPhoneVerified ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#dcfce7",
                color: "#15803d",
                fontSize: "12px",
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: "20px",
                marginBottom: "20px",
              }}
            >
              <ShieldCheck size={14} />
              <span>Verified StyleLease Member</span>
            </div>
          ) : (
            <div
              onClick={() => setActiveTab("verification")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#fef3c7",
                color: "#b45309",
                fontSize: "12px",
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: "20px",
                marginBottom: "20px",
                cursor: "pointer",
              }}
            >
              <Smartphone size={14} />
              <span>Verify Phone via OTP</span>
            </div>
          )}

          {/* Tab Navigation Links */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => setActiveTab("orders")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: activeTab === "orders" ? "var(--primary-light)" : "#f8fafc",
                color: activeTab === "orders" ? "var(--primary)" : "var(--text-main)",
                border: "none",
                fontSize: "14px",
                fontWeight: activeTab === "orders" ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Package size={18} />
                <span>My Rental Bookings ({orders.length})</span>
              </div>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: activeTab === "addresses" ? "var(--primary-light)" : "#f8fafc",
                color: activeTab === "addresses" ? "var(--primary)" : "var(--text-main)",
                border: "none",
                fontSize: "14px",
                fontWeight: activeTab === "addresses" ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MapPin size={18} />
                <span>Saved Addresses ({userProfile?.addresses?.length || 0})</span>
              </div>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => setActiveTab("verification")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: activeTab === "verification" ? "var(--primary-light)" : "#f8fafc",
                color: activeTab === "verification" ? "var(--primary)" : "var(--text-main)",
                border: "none",
                fontSize: "14px",
                fontWeight: activeTab === "verification" ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Smartphone size={18} />
                <span>Phone &amp; OTP Verification</span>
              </div>
              <ArrowRight size={14} />
            </button>
          </div>

          <button
            onClick={handleLogout}
            style={{
              marginTop: "24px",
              width: "100%",
              padding: "10px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "var(--transition)",
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Right Content Area */}
        <div className="profile-orders-section">
          {/* TAB 1: RENTAL BOOKINGS */}
          {activeTab === "orders" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "14px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                    My Rental Bookings
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
                    Track rental durations, scheduled return dates, item condition, and penalty terms
                  </p>
                </div>
                <span
                  style={{
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    fontWeight: 700,
                    fontSize: "12px",
                    padding: "4px 12px",
                    borderRadius: "12px",
                  }}
                >
                  {orders.length} Bookings
                </span>
              </div>

              {loadingOrders ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  Loading rental bookings from database...
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <Package size={44} color="var(--text-muted)" style={{ margin: "0 auto 12px auto", display: "block" }} />
                  <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>No orders placed yet</h3>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
                    Explore our catalog to rent sherwanis, tuxedos, and designer footwear for your next event.
                  </p>
                  <Link
                    to="/products"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "var(--primary)",
                      color: "#fff",
                      padding: "8px 18px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "14px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {orders.map((ord) => {
                    const duration = ord.rentalDuration || 4;
                    const scheduledReturn = ord.expectedReturnDate
                      ? new Date(ord.expectedReturnDate).toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Scheduled in 4 days";

                    const isOverdue =
                      ord.status !== "Returned" &&
                      ord.expectedReturnDate &&
                      new Date(ord.expectedReturnDate) < new Date();

                    return (
                      <div key={ord._id} className="order-card-tile">
                        {/* Order Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                              Booking #{ord._id.slice(-6).toUpperCase()}
                            </span>
                            <span style={{ color: "var(--text-muted)", fontSize: "12px", marginLeft: "10px" }}>
                              Booked on {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            {isOverdue && (
                              <span
                                style={{
                                  backgroundColor: "#fee2e2",
                                  color: "#b91c1c",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "3px 8px",
                                  borderRadius: "12px",
                                }}
                              >
                                Overdue
                              </span>
                            )}
                            <span
                              style={{
                                backgroundColor:
                                  ord.status === "Returned"
                                    ? "#ecfdf5"
                                    : ord.status === "Delivered"
                                    ? "#eff6ff"
                                    : "#fef3c7",
                                color:
                                  ord.status === "Returned"
                                    ? "#047857"
                                    : ord.status === "Delivered"
                                    ? "#1d4ed8"
                                    : "#92400e",
                                fontSize: "12px",
                                fontWeight: 700,
                                padding: "3px 10px",
                                borderRadius: "20px",
                              }}
                            >
                              {ord.status || "Confirmed"}
                            </span>
                          </div>
                        </div>

                        {/* Rental Tenure & Schedule Bar */}
                        <div
                          style={{
                            backgroundColor: "#f8fafc",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            marginBottom: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "12px",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Clock size={14} color="var(--primary)" />
                            <span>Rental Duration: <strong>{duration} Days</strong></span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Calendar size={14} color="#059669" />
                            <span>Return Due: <strong>{scheduledReturn}</strong></span>
                          </div>

                          {ord.productAge && (
                            <div style={{ color: "#64748b" }}>
                              Condition: <strong>{ord.productAge}</strong>
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        {ord.orderItems &&
                          ord.orderItems.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "8px 0",
                                borderTop: "1px solid #f8fafc",
                              }}
                            >
                              <img
                                src={item.imgSrc}
                                alt={item.name}
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  objectFit: "cover",
                                  borderRadius: "var(--radius-sm)",
                                  backgroundColor: "#f1f5f9",
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 2px 0" }}>
                                  {item.name}
                                </h4>
                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                  Size: {item.size || "9"} &bull; Qty: {item.qty || 1}
                                </span>
                              </div>
                              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--accent)" }}>
                                ₹{(Number(item.price) * (item.qty || 1)).toLocaleString("en-IN")}
                              </div>
                            </div>
                          ))}

                        {/* Penalty Notice if assessed */}
                        {ord.penaltyAmount > 0 && (
                          <div
                            style={{
                              backgroundColor: "#fff1f2",
                              border: "1px solid #fecdd3",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              margin: "8px 0",
                              fontSize: "12px",
                              color: "#be123c",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <AlertTriangle size={16} />
                            <div>
                              <strong>Late Return Penalty Assessed:</strong> ₹{ord.penaltyAmount.toLocaleString("en-IN")}
                              {ord.penaltyReason && ` (${ord.penaltyReason})`}
                            </div>
                          </div>
                        )}

                        {/* Footer Info & Action */}
                        <div
                          style={{
                            borderTop: "1px solid var(--border-color)",
                            paddingTop: "10px",
                            marginTop: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "13px",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Total Paid: </span>
                            <strong style={{ color: "var(--accent)", fontSize: "15px" }}>
                              ₹{Number(ord.totalAmount).toLocaleString("en-IN")}
                            </strong>
                          </div>

                          {/* Action Button: Request Return if Active */}
                          {ord.status !== "Returned" && ord.status !== "Return Requested" && (
                            <button
                              type="button"
                              onClick={() => openUserReturnModal(ord)}
                              style={{
                                backgroundColor: "var(--primary)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 14px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <RotateCcw size={14} />
                              <span>Request Doorstep Return Pickup</span>
                            </button>
                          )}

                          {ord.status === "Return Requested" && (
                            <span style={{ fontSize: "12px", color: "#d97706", fontWeight: 600 }}>
                              ⏳ Return pickup scheduled by concierge
                            </span>
                          )}

                          {ord.status === "Returned" && (
                            <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>
                              ✓ Return completed &amp; inspected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* User Return Request & Penalty Policy Modal */}
              {returnModalOrder && (() => {
                const expected = returnModalOrder.expectedReturnDate
                  ? new Date(returnModalOrder.expectedReturnDate)
                  : new Date();
                const today = new Date();
                const returnDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const expectedDateOnly = new Date(expected.getFullYear(), expected.getMonth(), expected.getDate());
                const dayDiff = Math.round((returnDateOnly.getTime() - expectedDateOnly.getTime()) / (1000 * 60 * 60 * 24));
                const daysLate = Math.max(0, dayDiff);
                const dailyPenalty = returnModalOrder.dailyLatePenalty || 150;
                const estimatedLateFee = daysLate * dailyPenalty;

                return (
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 9999,
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                        maxWidth: "520px",
                        width: "100%",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #cbd5e1",
                        overflow: "hidden",
                      }}
                    >
                      {/* Modal Header */}
                      <div
                        style={{
                          padding: "16px 20px",
                          borderBottom: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <RotateCcw size={18} color="var(--primary)" />
                          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                            Doorstep Return &amp; Penalty Policy
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReturnModalOrder(null)}
                          style={{ background: "none", border: "none", cursor: "pointer" }}
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <form onSubmit={handleConfirmReturnRequest} style={{ padding: "20px" }}>
                        {/* Rental Booking & Item Details */}
                        <div
                          style={{
                            backgroundColor: "#f1f5f9",
                            borderRadius: "8px",
                            padding: "12px 14px",
                            marginBottom: "16px",
                            fontSize: "13px",
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: "6px", color: "var(--text-main)" }}>
                            Booking #{returnModalOrder._id.slice(-6).toUpperCase()} Details:
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                            <div>
                              <span style={{ color: "var(--text-muted)" }}>Rental Duration: </span>
                              <strong>{returnModalOrder.rentalDuration || 4} Days</strong>
                            </div>
                            <div>
                              <span style={{ color: "var(--text-muted)" }}>Scheduled Return: </span>
                              <strong>{new Date(expected).toLocaleDateString("en-IN")}</strong>
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                              <span style={{ color: "var(--text-muted)" }}>Object Age / Condition: </span>
                              <strong style={{ color: "var(--primary)" }}>
                                {returnModalOrder.productAge || "Brand New (Mint Condition)"}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Stated Penalty Based on Rental Duration & Return Date */}
                        <div
                          style={{
                            borderRadius: "8px",
                            padding: "14px",
                            marginBottom: "16px",
                            backgroundColor: daysLate > 0 ? "#fff1f2" : "#f0fdf4",
                            border: daysLate > 0 ? "1px solid #fecdd3" : "1px solid #bbf7d0",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                            {daysLate > 0 ? (
                              <AlertTriangle size={18} color="#be123c" style={{ flexShrink: 0, marginTop: "2px" }} />
                            ) : (
                              <CheckCircle2 size={18} color="#15803d" style={{ flexShrink: 0, marginTop: "2px" }} />
                            )}
                            <div>
                              <strong style={{ color: daysLate > 0 ? "#be123c" : "#15803d", fontSize: "14px" }}>
                                {daysLate > 0 ? "Late Return Detected" : "On-Time Return Confirmation"}
                              </strong>
                              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: daysLate > 0 ? "#9f1239" : "#166534" }}>
                                {daysLate > 0
                                  ? `Your rental tenure was marked for ${returnModalOrder.rentalDuration || 4} days (due on ${new Date(expected).toLocaleDateString("en-IN")}). The return is ${daysLate} day(s) late. Based on the agreed rate of ₹${dailyPenalty}/day, the late penalty is ₹${estimatedLateFee}.`
                                  : `Your rental tenure of ${returnModalOrder.rentalDuration || 4} days is active. Returning on or before ${new Date(expected).toLocaleDateString("en-IN")} incurs ZERO (₹0) penalty.`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Return Condition Checklist */}
                        <div style={{ marginBottom: "14px" }}>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                            Declared Return Condition *
                          </label>
                          <select
                            value={returnConditionChoice}
                            onChange={(e) => setReturnConditionChoice(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "13px",
                            }}
                          >
                            <option>Good / Mint (As Received)</option>
                            <option>Dry-Cleaned / Packed in Garment Bag</option>
                            <option>Minor Wear (Covered under StyleLease Shield)</option>
                            <option>Stained or Damaged (Needs Inspection Assessment)</option>
                          </select>
                        </div>

                        {/* Inspection Notes */}
                        <div style={{ marginBottom: "18px" }}>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                            Notes for Courier Pickup Team (Optional)
                          </label>
                          <input
                            type="text"
                            value={returnNotes}
                            onChange={(e) => setReturnNotes(e.target.value)}
                            placeholder="e.g. Garment bag packed, security tags intact"
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "13px",
                            }}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                          <button
                            type="button"
                            onClick={() => setReturnModalOrder(null)}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              backgroundColor: "#f8fafc",
                              fontSize: "13px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingReturn}
                            style={{
                              padding: "8px 18px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "var(--primary)",
                              color: "#fff",
                              fontSize: "13px",
                              fontWeight: 700,
                              cursor: isSubmittingReturn ? "not-allowed" : "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {isSubmittingReturn ? "Scheduling..." : "Confirm & Schedule Pickup"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES & PHONE NUMBERS */}
          {activeTab === "addresses" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "14px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                    Manage Delivery Addresses
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
                    Add multiple delivery destinations with dedicated contact numbers for doorstep fitting
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(true)}
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Plus size={16} />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Add Address Modal / Form */}
              {showAddAddressModal && (
                <form
                  onSubmit={handleAddAddress}
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "18px",
                    marginBottom: "20px",
                  }}
                >
                  <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>
                    New Delivery Address
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Recipient Name *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.recipientName}
                        onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                        placeholder="e.g. Deep Gandhi"
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Contact Phone Number *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Address Line 1 *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      placeholder="Building, Flat, Street address"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>City *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>State *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>PIN Code *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {["Home", "Work", "Other"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewAddress({ ...newAddress, tag: t })}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: newAddress.tag === t ? "1px solid var(--primary)" : "1px solid #cbd5e1",
                            backgroundColor: newAddress.tag === t ? "var(--primary-light)" : "#fff",
                            color: newAddress.tag === t ? "var(--primary)" : "var(--text-main)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => setShowAddAddressModal(false)}
                        style={{
                          padding: "8px 14px",
                          backgroundColor: "#e2e8f0",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: "8px 18px",
                          backgroundColor: "var(--primary)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* List of Saved Addresses */}
              {!userProfile?.addresses || userProfile.addresses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  <MapPin size={36} style={{ margin: "0 auto 10px auto", display: "block" }} />
                  <p>No addresses saved yet. Click "Add New Address" above to save your delivery location.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {userProfile.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      style={{
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 700, fontSize: "15px" }}>{addr.recipientName || name}</span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              backgroundColor: "#e2e8f0",
                              color: "#334155",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {addr.tag || "Home"}
                          </span>
                          {addr.isDefault && (
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: "#dcfce7",
                                color: "#15803d",
                                padding: "2px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              Default Address
                            </span>
                          )}
                        </div>

                        <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--text-muted)" }}>
                          {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ""}{addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                        <div style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                          <Phone size={13} color="var(--primary)" />
                          <span>Phone: <strong>{addr.phone}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr._id)}
                            style={{
                              backgroundColor: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr._id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            padding: "6px",
                          }}
                          title="Delete Address"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PHONE & OTP VERIFICATION */}
          {activeTab === "verification" && (
            <div>
              <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "14px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                  Phone &amp; OTP Security Verification
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
                  Verify your mobile number via one-time password to validate rental bookings
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  padding: "24px",
                  maxWidth: "520px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Smartphone size={24} color="var(--primary)" />
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                      Mobile Number Verification
                    </h3>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Status:{" "}
                      <strong style={{ color: userProfile?.isPhoneVerified ? "#16a34a" : "#d97706" }}>
                        {userProfile?.isPhoneVerified ? "Verified ✓" : "Unverified"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                    Mobile Number:
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "10px 16px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {otpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <strong style={{ fontSize: "13px", color: "#15803d" }}>OTP sent to {otpPhone}</strong>
                    </div>
                    <div style={{ fontSize: "12px", color: "#854d0e", backgroundColor: "#fef9c3", padding: "6px 10px", borderRadius: "4px", marginBottom: "12px" }}>
                      💡 Demo Environment Active: Enter standard OTP <strong>123456</strong>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="6-digit OTP"
                        style={{ width: "160px", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", letterSpacing: "2px", fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp}
                        style={{
                          backgroundColor: "#16a34a",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "10px 20px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {isVerifyingOtp ? "Verifying..." : "Validate OTP"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guarantees Footer */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Truck size={20} color="var(--primary)" />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>Free Doorstep Pickup</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>On scheduled return date</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={20} color="var(--primary)" />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>Flexible Tenure</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>3 to 10 days rental</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <PhoneCall size={20} color="var(--primary)" />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>Stylist Concierge</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Fit &amp; size exchange help</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;