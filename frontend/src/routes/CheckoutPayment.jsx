import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Ripple } from "primereact/ripple";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  Calendar,
  AlertTriangle,
  QrCode,
  Building2,
  ArrowLeft,
  Plus,
  Lock,
  Clock,
  Smartphone,
} from "lucide-react";
import { authAPI, orderAPI } from "../services/api";

const CheckoutPayment = ({ cartItems, setCartItems }) => {
  const navigate = useNavigate();
  const toast = useRef(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    recipientName: sessionStorage.getItem("name") || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    tag: "Home",
  });

  // Phone & OTP verification state
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("styleuser@okaxis");
  const [cardNumber, setCardNumber] = useState("4532 8910 2482 1094");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("432");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Calculate rental totals
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 899) * (Number(item.qty) || 1),
    0
  );

  const primaryDuration = cartItems[0]?.rentalDuration || 4;
  const now = new Date();
  const expectedReturnDate = new Date(
    now.getTime() + primaryDuration * 24 * 60 * 60 * 1000
  );
  const formattedReturnDate = expectedReturnDate.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    // Redirect if cart is empty
    if (!cartItems || cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const data = await authAPI.getProfile();
        if (data && data.user) {
          setUserProfile(data.user);
          setAddresses(data.user.addresses || []);
          setIsPhoneVerified(Boolean(data.user.isPhoneVerified));

          if (data.user.addresses && data.user.addresses.length > 0) {
            const defIndex = data.user.addresses.findIndex((a) => a.isDefault);
            setSelectedAddressIndex(defIndex !== -1 ? defIndex : 0);
          } else {
            setShowNewAddressForm(true);
          }

          if (data.user.phone) {
            setNewAddress((prev) => ({ ...prev, phone: data.user.phone }));
          }
        }
      } catch (err) {
        console.warn("[Checkout] Failed to fetch profile:", err.message);
        setShowNewAddressForm(true);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, [cartItems, navigate]);

  // Handle Dispatch OTP
  const handleSendOtp = async (phoneToVerify) => {
    const targetPhone = phoneToVerify || newAddress.phone;
    if (!targetPhone || targetPhone.length < 8) {
      if (toast.current) {
        toast.current.show({
          severity: "warn",
          summary: "Phone Number Required",
          detail: "Please enter a valid 10-digit contact phone number first.",
          life: 3000,
        });
      }
      return;
    }

    try {
      const res = await authAPI.sendOtp(targetPhone, "checkout_verify");
      setOtpSent(true);
      if (toast.current) {
        toast.current.show({
          severity: "info",
          summary: "OTP Sent (Demo Mode)",
          detail: res.message || "Enter demo OTP 123456 to verify your contact number.",
          life: 5000,
        });
      }
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Failed to send OTP",
          detail: err.message,
          life: 3000,
        });
      }
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (phoneToVerify) => {
    const targetPhone = phoneToVerify || newAddress.phone;
    if (!enteredOtp) {
      if (toast.current) {
        toast.current.show({
          severity: "warn",
          summary: "Enter OTP",
          detail: "Please enter the 6-digit OTP (e.g. 123456).",
          life: 3000,
        });
      }
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await authAPI.verifyOtp(targetPhone, enteredOtp);
      if (res.success) {
        setIsPhoneVerified(true);
        setOtpSent(false);
        if (toast.current) {
          toast.current.show({
            severity: "success",
            summary: "Contact Verified!",
            detail: "Phone number verified successfully via OTP.",
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

  // Handle Saving New Address
  const handleSaveAddress = async (e) => {
    if (e) e.preventDefault();
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
          summary: "Missing Information",
          detail: "Please fill in all required address fields and phone number.",
          life: 3000,
        });
      }
      return;
    }

    try {
      const res = await authAPI.addAddress(newAddress);
      setAddresses(res.addresses || []);
      setSelectedAddressIndex(res.addresses.length - 1);
      setShowNewAddressForm(false);
      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Address Saved",
          detail: "Delivery address saved to your profile.",
          life: 3000,
        });
      }
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Failed to save address",
          detail: err.message,
          life: 3000,
        });
      }
    }
  };

  // Final Demo Payment & Order Placement
  const handleFinalPayment = async () => {
    // 1. Determine active delivery address
    let activeAddress;
    if (showNewAddressForm || addresses.length === 0) {
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
            summary: "Delivery Address Required",
            detail: "Please fill in your delivery address and contact number before proceeding.",
            life: 3000,
          });
        }
        return;
      }
      activeAddress = newAddress;
      // Auto-save new address to user profile so profile is completed
      try {
        const savedRes = await authAPI.addAddress(newAddress);
        if (savedRes && savedRes.addresses) {
          setAddresses(savedRes.addresses);
        }
      } catch (e) {
        console.warn("[Checkout] Address auto-save notice:", e.message);
      }
    } else {
      activeAddress = addresses[selectedAddressIndex];
      if (!activeAddress) {
        if (toast.current) {
          toast.current.show({
            severity: "warn",
            summary: "Address Required",
            detail: "Please select or add a delivery address.",
            life: 3000,
          });
        }
        return;
      }
    }

    // 2. Validate phone verification
    if (!isPhoneVerified) {
      if (toast.current) {
        toast.current.show({
          severity: "warn",
          summary: "Phone Verification Required",
          detail: "Please verify your contact number via OTP (Demo: 123456) to confirm delivery.",
          life: 4000,
        });
      }
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Simulate realistic payment gateway authorization delay (1.2s)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const customerName =
        userProfile?.name ||
        sessionStorage.getItem("name") ||
        activeAddress.recipientName ||
        "Valued Customer";
      const customerEmail =
        userProfile?.email ||
        sessionStorage.getItem("email") ||
        "customer@stylelease.com";

      const maxDuration = Math.max(...cartItems.map((it) => Number(it.rentalDuration) || 4));
      const maxPenalty = Math.max(...cartItems.map((it) => Number(it.dailyLatePenalty) || 150));
      const allProductAges = cartItems.map((it) => it.productAge || "Mint Condition").filter(Boolean);
      const combinedProductAge = allProductAges.length > 0 ? allProductAges[0] : "Brand New (Mint Condition)";

      const orderPayload = {
        customerName,
        customerEmail,
        contactPhone: activeAddress.phone,
        deliveryAddress: {
          recipientName: activeAddress.recipientName || customerName,
          addressLine1: activeAddress.addressLine1,
          addressLine2: activeAddress.addressLine2 || "",
          city: activeAddress.city,
          state: activeAddress.state,
          postalCode: activeAddress.postalCode,
          phone: activeAddress.phone,
        },
        rentalDuration: maxDuration,
        rentalStartDate: now.toISOString(),
        expectedReturnDate: expectedReturnDate.toISOString(),
        productAge: combinedProductAge,
        dailyLatePenalty: maxPenalty,
        orderItems: cartItems.map((item) => ({
          product: item._id && String(item._id).match(/^[0-9a-fA-F]{24}$/) ? item._id : undefined,
          name: item.name,
          imgSrc: item.imgSrc,
          price: Number(item.price) || 899,
          qty: Number(item.qty) || 1,
          size: item.size || "9",
          category: item.category || "Designer Wear",
        })),
        totalAmount,
        paymentMethod: `Demo Payment (${paymentMethod})`,
        paymentStatus: "Paid",
      };

      const result = await orderAPI.create(orderPayload);

      // Clear rental bag
      setCartItems([]);
      setIsProcessingPayment(false);

      // Navigate to Payment Success Page
      const createdOrderId = result.order?._id || "DEMO" + Date.now();
      navigate(`/payment-success?orderId=${createdOrderId}`);
    } catch (err) {
      setIsProcessingPayment(false);
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Payment Authorization Failed",
          detail: err.message || "Could not process demo transaction",
          life: 4000,
        });
      }
    }
  };

  const activeSelectedAddress = addresses[selectedAddressIndex];

  return (
    <main className="app-container" style={{ paddingTop: "20px", paddingBottom: "60px" }}>
      <Toast ref={toast} className="custom-toast-success" />

      {/* Header Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldCheck size={26} color="var(--primary)" />
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
              Checkout &amp; Demo Payment Gateway
            </h1>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Step 2 of 2: Verify Address, OTP &amp; Authorize Rental Payment
            </span>
          </div>
        </div>

        <Link
          to="/cart"
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
          <span>Back to Bag</span>
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Address, OTP & Payment Methods */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Section 1: Delivery Address & Contact Details */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              padding: "20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} color="var(--primary)" />
                <span>1. Delivery Address &amp; Contact Details</span>
              </h2>

              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Plus size={14} />
                  <span>{showNewAddressForm ? "Cancel" : "Add New Address"}</span>
                </button>
              )}
            </div>

            {loadingUser ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                Loading delivery profiles...
              </div>
            ) : (
              <>
                {/* Saved Addresses List */}
                {!showNewAddressForm && addresses.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                    {addresses.map((addr, idx) => (
                      <div
                        key={addr._id || idx}
                        onClick={() => setSelectedAddressIndex(idx)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "8px",
                          border: selectedAddressIndex === idx ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                          backgroundColor: selectedAddressIndex === idx ? "var(--primary-light)" : "#fafafa",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontWeight: 700, fontSize: "14px" }}>{addr.recipientName || "Recipient"}</span>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                backgroundColor: "#e2e8f0",
                                color: "#334155",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              {addr.tag || "Home"}
                            </span>
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ""}{addr.city}, {addr.state} - {addr.postalCode}
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--text-main)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Phone size={13} color="var(--primary)" />
                            <span>{addr.phone}</span>
                          </div>
                        </div>

                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressIndex === idx}
                          onChange={() => setSelectedAddressIndex(idx)}
                          style={{ accentColor: "var(--primary)", marginTop: "4px" }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Address Form (Rendered if toggled or if no addresses exist) */}
                {(showNewAddressForm || addresses.length === 0) && (
                  <form
                    onSubmit={handleSaveAddress}
                    style={{
                      backgroundColor: "#f8fafc",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px dashed var(--border-color)",
                      marginBottom: "16px",
                    }}
                  >
                    <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>
                      Provide Delivery Destination:
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                          Recipient Full Name *
                        </label>
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
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                          Contact Phone Number *
                        </label>
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
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                        Flat / House No. / Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        placeholder="e.g. Flat 402, Royal Residency, SG Highway"
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
                          placeholder="e.g. Ahmedabad"
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
                          placeholder="e.g. Gujarat"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Postal Code *</label>
                        <input
                          type="text"
                          required
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          placeholder="e.g. 380054"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: "var(--primary)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 18px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Save &amp; Select Address
                      </button>
                    </div>
                  </form>
                )}

                {/* OTP Validation Box */}
                <div
                  style={{
                    backgroundColor: isPhoneVerified ? "#f0fdf4" : "#fefce8",
                    border: isPhoneVerified ? "1px solid #bbf7d0" : "1px solid #fef08a",
                    borderRadius: "8px",
                    padding: "14px",
                    marginTop: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Smartphone size={20} color={isPhoneVerified ? "#16a34a" : "#ca8a04"} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: isPhoneVerified ? "#166534" : "#854d0e" }}>
                          {isPhoneVerified ? "Contact Phone Number Verified" : "OTP Phone Verification Required"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          Active Phone: <strong>{activeSelectedAddress?.phone || newAddress.phone || "Not provided"}</strong>
                        </div>
                      </div>
                    </div>

                    {isPhoneVerified ? (
                      <span
                        style={{
                          backgroundColor: "#dcfce7",
                          color: "#15803d",
                          fontSize: "12px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "14px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>OTP Verified</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp(activeSelectedAddress?.phone || newAddress.phone)}
                        style={{
                          backgroundColor: "#ca8a04",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {otpSent ? "Resend OTP" : "Send Verification OTP"}
                      </button>
                    )}
                  </div>

                  {/* OTP Input Form when sent */}
                  {!isPhoneVerified && otpSent && (
                    <div
                      style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px dashed #fef08a",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP (123456)"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "14px",
                          letterSpacing: "2px",
                          fontWeight: 700,
                          width: "220px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyOtp(activeSelectedAddress?.phone || newAddress.phone)}
                        disabled={isVerifyingOtp}
                        style={{
                          backgroundColor: "var(--primary)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 18px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                      </button>
                      <span style={{ fontSize: "12px", color: "#854d0e", fontWeight: 600 }}>
                        (Demo Mode Active: Enter <strong>123456</strong>)
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Section 2: Demo Payment Method Selector */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              padding: "20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <CreditCard size={18} color="var(--primary)" />
              <span>2. Select Demo Payment Method</span>
            </h2>

            {/* Payment Method Pills */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "20px" }}>
              {[
                { id: "UPI", label: "UPI / QR", icon: <QrCode size={18} /> },
                { id: "Card", label: "Credit/Debit Card", icon: <CreditCard size={18} /> },
                { id: "NetBanking", label: "Net Banking", icon: <Building2 size={18} /> },
                { id: "COD", label: "Pay on Delivery", icon: <Clock size={18} /> },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  style={{
                    padding: "12px 10px",
                    borderRadius: "8px",
                    border: paymentMethod === m.id ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                    backgroundColor: paymentMethod === m.id ? "var(--primary-light)" : "#fff",
                    color: paymentMethod === m.id ? "var(--primary)" : "var(--text-main)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: paymentMethod === m.id ? 700 : 500,
                    transition: "all 0.15s ease",
                  }}
                >
                  {m.icon}
                  <span style={{ fontSize: "13px" }}>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Dynamic Payment Details Area */}
            {paymentMethod === "UPI" && (
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <QrCode size={20} color="var(--primary)" />
                  <strong style={{ fontSize: "14px" }}>Demo UPI Payment (Instant Authorization)</strong>
                </div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Enter Virtual Payment Address (VPA / UPI ID):
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. user@okhdfcbank"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                  Supported apps: Google Pay, PhonePe, Paytm, BHIM, Navi.
                </div>
              </div>
            )}

            {paymentMethod === "Card" && (
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Demo Card Number:
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", letterSpacing: "1px" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      Expiry Date:
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      CVV:
                    </label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "NetBanking" && (
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Select Bank for Demo NetBanking:
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                >
                  <option>HDFC Bank</option>
                  <option>State Bank of India</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {paymentMethod === "COD" && (
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                  Pay on Delivery (Cash or QR Scan upon Doorstep Delivery)
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Our delivery executive will collect payment and verify size fitting at your doorstep.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order & Tenure Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              padding: "20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 16px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              Rental Booking Summary
            </h2>

            {/* Items List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              {cartItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <img
                    src={item.imgSrc}
                    alt={item.name}
                    style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "6px", backgroundColor: "#f1f5f9" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Size: {item.size || "9"} &bull; Tenure: {item.rentalDuration || 4} Days &bull; Qty: {item.qty || 1}
                    </div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent)" }}>
                    ₹{((Number(item.price) || 899) * (Number(item.qty) || 1)).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            {/* Dates & Tenure Card */}
            <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Rental Tenure:</span>
                <strong>{primaryDuration} Days</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Delivery / Start Date:</span>
                <strong>Today ({now.toLocaleDateString("en-IN", { month: "short", day: "numeric" })})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={13} /> Scheduled Return:
                </span>
                <strong style={{ color: "var(--primary)" }}>{formattedReturnDate}</strong>
              </div>
            </div>

            {/* Price Calculations */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Rental Subtotal</span>
                <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Sanitization &amp; Inspection</span>
                <span style={{ color: "#059669", fontWeight: 600 }}>FREE</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Doorstep Pickup on {formattedReturnDate}</span>
                <span style={{ color: "#059669", fontWeight: 600 }}>FREE</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "17px", fontWeight: 700, borderTop: "1px solid var(--border-color)", paddingTop: "10px", marginTop: "4px" }}>
                <span>Total Amount:</span>
                <span style={{ color: "var(--accent)" }}>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Late Penalty Terms Banner */}
            <div
              style={{
                padding: "10px",
                backgroundColor: "#fffbeb",
                border: "1px solid #fef3c7",
                borderRadius: "6px",
                fontSize: "11px",
                color: "#92400e",
                marginBottom: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "6px",
              }}
            >
              <AlertTriangle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong>Return &amp; Penalty Terms:</strong> Item must be handed over to our courier partner on {formattedReturnDate}. Late fee of ₹150/day applies thereafter.
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handleFinalPayment}
              disabled={isProcessingPayment}
              className="p-ripple"
              style={{
                width: "100%",
                backgroundColor: isPhoneVerified ? "var(--accent)" : "#94a3b8",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: isPhoneVerified ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: isPhoneVerified ? "0 4px 14px rgba(236, 52, 39, 0.3)" : "none",
              }}
            >
              <Lock size={16} />
              <span>
                {isProcessingPayment
                  ? "Authorizing Demo Transaction..."
                  : isPhoneVerified
                  ? `Pay ₹${totalAmount.toLocaleString("en-IN")} (Demo Mode)`
                  : "Verify OTP to Unlock Payment"}
              </span>
              <Ripple />
            </button>

            <div style={{ marginTop: "12px", fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
              🔒 Simulated Test Environment &bull; No Real Card Debits
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPayment;
