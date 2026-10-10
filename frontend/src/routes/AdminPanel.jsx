import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Printer,
  Search,
  Filter,
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserPlus,
  LogOut,
  Key,
  CheckCircle,
} from "lucide-react";
import { productAPI, orderAPI, authAPI } from "../services/api";
import { HitItems } from "../data/Products";

const AdminPanel = () => {
  const toast = useRef(null);

  // Authorization & Whitelist State
  const [adminWhitelist, setAdminWhitelist] = useState([
    "deep@stylelease.com",
    "tanvi@stylelease.com",
  ]);
  const [currentUserEmail, setCurrentUserEmail] = useState(
    sessionStorage.getItem("email") || localStorage.getItem("email") || ""
  );
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Admin Login Gate State
  const [adminEmailInput, setAdminEmailInput] = useState("deep@stylelease.com");
  const [adminPasswordInput, setAdminPasswordInput] = useState("password123");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Whitelist Management State
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdminLoading, setAddingAdminLoading] = useState(false);

  const [currentTab, setCurrentTab] = useState("products"); // 'products', 'orders', 'mis', 'admins'

  // Products State
  const [products, setProducts] = useState([]);
  const [, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    brandName: "StyleLease Exclusive",
    category: "Ethnic & Wedding Wear",
    price: "",
    imgSrc: "images/p1.jpg",
    description: "",
    sizes: "38, 40, 42, 44",
    countInStock: 10,
    itemAge: "Brand New (Mint Condition)",
    dailyLatePenalty: 150,
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [, setLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [returnModalOrder, setReturnModalOrder] = useState(null);

  const [returnForm, setReturnForm] = useState({
    actualReturnDate: new Date().toISOString().split("T")[0],
    returnCondition: "Good / Mint",
    damageFee: 0,
    penaltyOverride: "",
    penaltyReason: "",
  });

  // MIS Report State
  const [misData, setMisData] = useState(null);
  const [loadingMis, setLoadingMis] = useState(false);

  // Load Products
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await productAPI.getAll();
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(HitItems);
      }
    } catch (err) {
      console.error("[Admin] Error loading products:", err);
      setProducts(HitItems);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load Orders
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await orderAPI.getAll();
      setOrders(data);
    } catch (err) {
      console.error("[Admin] Error loading orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load MIS Report
  const loadMisReport = async () => {
    setLoadingMis(true);
    try {
      const data = await orderAPI.getMisReport();
      setMisData(data);
    } catch (err) {
      console.error("[Admin] Error loading MIS report:", err);
    } finally {
      setLoadingMis(false);
    }
  };

  // Verify Admin Access
  const checkAdminAccess = async () => {
    setAuthChecking(true);
    try {
      let list = [];
      try {
        list = await authAPI.getAdminWhitelist();
      } catch (e) {
        list = ["deep@stylelease.com", "tanvi@stylelease.com"];
      }
      const effectiveList = list && list.length > 0 ? list : ["deep@stylelease.com", "tanvi@stylelease.com"];
      setAdminWhitelist(effectiveList);

      const storedEmail = (
        sessionStorage.getItem("email") ||
        localStorage.getItem("email") ||
        ""
      ).toLowerCase().trim();

      if (storedEmail && effectiveList.includes(storedEmail)) {
        setIsAuthorized(true);
        setCurrentUserEmail(storedEmail);
        loadProducts();
        loadOrders();
        loadMisReport();
      } else {
        setIsAuthorized(false);
      }
    } catch (err) {
      const storedEmail = (
        sessionStorage.getItem("email") ||
        localStorage.getItem("email") ||
        ""
      ).toLowerCase().trim();
      if (storedEmail === "deep@stylelease.com" || storedEmail === "tanvi@stylelease.com") {
        setIsAuthorized(true);
        setCurrentUserEmail(storedEmail);
        loadProducts();
        loadOrders();
        loadMisReport();
      } else {
        setIsAuthorized(false);
      }
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  // Handle Admin Login at Gate
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const targetEmail = adminEmailInput.toLowerCase().trim();
      const res = await authAPI.login(targetEmail, adminPasswordInput);
      const email = (res.email || targetEmail).toLowerCase().trim();

      // Fetch latest whitelist
      let list = [];
      try {
        list = await authAPI.getAdminWhitelist();
      } catch (err) {
        list = ["deep@stylelease.com", "tanvi@stylelease.com"];
      }
      const effectiveList = list && list.length > 0 ? list : ["deep@stylelease.com", "tanvi@stylelease.com"];
      setAdminWhitelist(effectiveList);

      if (!effectiveList.includes(email)) {
        setLoginError(`Access Denied: Account ${email} is not in the authorized admin list.`);
        setLoginLoading(false);
        return;
      }

      sessionStorage.setItem("token", res.token);
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("name", res.name || "Administrator");
      sessionStorage.setItem("role", "admin");
      localStorage.setItem("token", res.token);
      localStorage.setItem("email", email);

      setCurrentUserEmail(email);
      setIsAuthorized(true);

      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Admin Authorized",
          detail: `Welcome back, ${email}!`,
          life: 3000,
        });
      }

      loadProducts();
      loadOrders();
      loadMisReport();
    } catch (err) {
      setLoginError(err.message || "Invalid administrative credentials");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminSignOut = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setIsAuthorized(false);
    setCurrentUserEmail("");
    if (toast.current) {
      toast.current.show({
        severity: "info",
        summary: "Signed Out",
        detail: "Administrator logged out successfully.",
        life: 2500,
      });
    }
  };

  // Add new authorized admin email
  const handleAddAdminEmail = async (e) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      if (toast.current) {
        toast.current.show({
          severity: "warn",
          summary: "Invalid Email",
          detail: "Please enter a valid email address.",
          life: 3000,
        });
      }
      return;
    }

    setAddingAdminLoading(true);
    try {
      const updated = await authAPI.addAdminEmail(newAdminEmail.trim());
      setAdminWhitelist(updated);
      setNewAdminEmail("");
      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Admin Access Granted",
          detail: `${newAdminEmail.trim()} can now access /admin with password123.`,
          life: 3500,
        });
      }
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Failed to Add Admin",
          detail: err.message,
          life: 3000,
        });
      }
    } finally {
      setAddingAdminLoading(false);
    }
  };

  // Revoke admin access
  const handleRemoveAdminEmail = async (emailToRemove) => {
    if (emailToRemove === "deep@stylelease.com" || emailToRemove === "tanvi@stylelease.com") {
      alert("Primary root administrators (deep@stylelease.com, tanvi@stylelease.com) cannot be removed.");
      return;
    }

    if (!window.confirm(`Revoke administrator access for ${emailToRemove}?`)) {
      return;
    }

    try {
      const updated = await authAPI.removeAdminEmail(emailToRemove);
      setAdminWhitelist(updated);
      if (toast.current) {
        toast.current.show({
          severity: "info",
          summary: "Admin Access Revoked",
          detail: `${emailToRemove} has been removed from authorized admins.`,
          life: 3000,
        });
      }
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Removal Failed",
          detail: err.message,
          life: 3000,
        });
      }
    }
  };

  // Handle Save / Add Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.imgSrc) {
      if (toast.current) {
        toast.current.show({
          severity: "warn",
          summary: "Missing Fields",
          detail: "Please provide product name, price, and image source.",
          life: 3000,
        });
      }
      return;
    }

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      countInStock: Number(productForm.countInStock),
      dailyLatePenalty: Number(productForm.dailyLatePenalty),
      sizes: typeof productForm.sizes === "string"
        ? productForm.sizes.split(",").map((s) => s.trim()).filter(Boolean)
        : productForm.sizes,
    };

    try {
      if (editingProduct) {
        const prodId = editingProduct._id || editingProduct.id;
        if (prodId && String(prodId).match(/^[0-9a-fA-F]{24}$/)) {
          await productAPI.update(prodId, payload);
        } else {
          await productAPI.create(payload);
        }
        if (toast.current) {
          toast.current.show({
            severity: "success",
            summary: "Product Updated",
            detail: `Product '${payload.name}' updated successfully.`,
            life: 3000,
          });
        }
      } else {
        await productAPI.create(payload);
        if (toast.current) {
          toast.current.show({
            severity: "success",
            summary: "Product Created",
            detail: `Product '${payload.name}' added to catalog.`,
            life: 3000,
          });
        }
      }
      setShowAddModal(false);
      setEditingProduct(null);
      resetProductForm();
      loadProducts();
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Operation Failed",
          detail: err.message,
          life: 3000,
        });
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      brandName: "StyleLease Exclusive",
      category: "Ethnic & Wedding Wear",
      price: "",
      imgSrc: "images/p1.jpg",
      description: "",
      sizes: "38, 40, 42, 44",
      countInStock: 10,
      itemAge: "Brand New (Mint Condition)",
      dailyLatePenalty: 150,
    });
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || "",
      brandName: prod.brandName || "StyleLease",
      category: prod.category || "Footwear",
      price: prod.price || "",
      imgSrc: prod.imgSrc || "images/p1.jpg",
      description: prod.description || "",
      sizes: Array.isArray(prod.sizes) ? prod.sizes.join(", ") : "7, 8, 9, 10",
      countInStock: prod.countInStock !== undefined ? prod.countInStock : 10,
      itemAge: prod.itemAge || "Brand New (Mint Condition)",
      dailyLatePenalty: prod.dailyLatePenalty || 150,
    });
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      return;
    }

    try {
      if (id && String(id).match(/^[0-9a-fA-F]{24}$/)) {
        await productAPI.delete(id);
      }
      setProducts((prev) => prev.filter((p) => String(p._id || p.id) !== String(id)));
      if (toast.current) {
        toast.current.show({
          severity: "info",
          summary: "Product Deleted",
          detail: `Product '${name}' removed.`,
          life: 3000,
        });
      }
      loadProducts();
    } catch (err) {
      setProducts((prev) => prev.filter((p) => String(p._id || p.id) !== String(id)));
      if (toast.current) {
        toast.current.show({
          severity: "info",
          summary: "Product Removed",
          detail: `Product '${name}' removed from view.`,
          life: 3000,
        });
      }
    }
  };

  // Quick Order Status Change
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Status Updated",
          detail: `Order status set to '${newStatus}'`,
          life: 2500,
        });
      }
      loadOrders();
      loadMisReport();
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

  // Open Process Return Modal
  const openReturnModal = (ord) => {
    setReturnModalOrder(ord);

    // Calculate calendar date difference accurately
    const expected = ord.expectedReturnDate
      ? new Date(ord.expectedReturnDate)
      : new Date(new Date(ord.createdAt || Date.now()).getTime() + (ord.rentalDuration || 4) * 24 * 60 * 60 * 1000);
    const today = new Date();
    const returnDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const expectedDateOnly = new Date(expected.getFullYear(), expected.getMonth(), expected.getDate());
    const dayDiff = Math.round((returnDateOnly.getTime() - expectedDateOnly.getTime()) / (1000 * 60 * 60 * 24));
    const daysLate = Math.max(0, dayDiff);

    setReturnForm({
      actualReturnDate: today.toISOString().split("T")[0],
      returnCondition: daysLate > 0 ? "Late Return" : (ord.returnCondition && ord.returnCondition !== "Pending Inspection" ? ord.returnCondition : "Good / Mint"),
      damageFee: 0,
      penaltyOverride: ord.penaltyAmount !== undefined && ord.penaltyAmount !== 0 ? ord.penaltyAmount : "",
      penaltyReason: ord.penaltyReason || (daysLate > 0 ? `${daysLate} day(s) late` : "Returned in good order"),
    });
  };

  // Submit Process Return & Penalty
  const handleProcessReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;

    try {
      const res = await orderAPI.processReturn(returnModalOrder._id, {
        actualReturnDate: returnForm.actualReturnDate,
        returnCondition: returnForm.returnCondition,
        damageFee: Number(returnForm.damageFee) || 0,
        penaltyOverride: returnForm.penaltyOverride !== "" ? Number(returnForm.penaltyOverride) : undefined,
        penaltyReason: returnForm.penaltyReason,
      });

      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Return Recorded",
          detail: `Return processed. Penalty: ₹${res.penaltyAmount || 0}`,
          life: 3500,
        });
      }
      setReturnModalOrder(null);
      loadOrders();
      loadMisReport();
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Failed to Process Return",
          detail: err.message,
          life: 3000,
        });
      }
    }
  };

  // Filtered products
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brandName?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === "All") return true;
    return o.status === orderStatusFilter;
  });

  // Check authorization states
  if (authChecking) {
    return (
      <main style={{ padding: "80px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", color: "#64748b" }}>
          <Shield size={24} color="var(--primary)" />
          <span style={{ fontSize: "16px", fontWeight: 600 }}>Verifying Administrator Authorization...</span>
        </div>
      </main>
    );
  }

  // Access Restricted Gate for Unauthorized Users
  if (!isAuthorized) {
    return (
      <main style={{ padding: "40px 20px", maxWidth: "520px", margin: "0 auto", fontFamily: "inherit" }}>
        <Toast ref={toast} />
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
            padding: "32px 28px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
            }}
          >
            <Lock size={28} />
          </div>

          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
            Restricted Admin Console
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px", lineHeight: "1.5" }}>
            Direct URL access to <code style={{ backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>/admin</code> is strictly restricted to authorized administrative emails.
          </p>

          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "12px 14px",
              textAlign: "left",
              marginBottom: "20px",
              fontSize: "12px",
              color: "#334155",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "4px", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} color="#059669" />
              <span>Authorized Admin Accounts:</span>
            </div>
            <ul style={{ paddingLeft: "18px", margin: "4px 0", lineHeight: "1.6" }}>
              {adminWhitelist.map((adm) => (
                <li key={adm}>
                  <strong>{adm}</strong> (password: <code>password123</code>)
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleAdminLogin} style={{ textAlign: "left" }}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                Admin Email Address:
              </label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                required
                placeholder="deep@stylelease.com"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                Admin Password:
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                required
                placeholder="password123"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            {loginError && (
              <div
                style={{
                  padding: "10px 12px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  borderRadius: "6px",
                  fontSize: "12px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ShieldAlert size={15} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#0f172a",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 700,
                cursor: loginLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Key size={16} />
              <span>{loginLoading ? "Authorizing..." : "Unlock Admin Console"}</span>
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "20px", maxWidth: "1280px", margin: "0 auto", fontFamily: "inherit" }}>
      <Toast ref={toast} />

      {/* Admin Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #e2e8f0",
          paddingBottom: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
              StyleLease Admin Console
            </h1>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor: "#dbeafe",
                color: "#1e40af",
                padding: "2px 8px",
                borderRadius: "12px",
              }}
            >
              Direct URL Protected
            </span>
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Authenticated Admin: <strong>{currentUserEmail}</strong>
          </span>
        </div>

        {/* Tab Controls & Sign Out */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setCurrentTab("products")}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: currentTab === "products" ? "#0f172a" : "#fff",
              color: currentTab === "products" ? "#fff" : "#334155",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Package size={15} />
            <span>Products ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("orders")}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: currentTab === "orders" ? "#0f172a" : "#fff",
              color: currentTab === "orders" ? "#fff" : "#334155",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ShoppingCart size={15} />
            <span>Rented Orders ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("mis")}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: currentTab === "mis" ? "#0f172a" : "#fff",
              color: currentTab === "mis" ? "#fff" : "#334155",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <TrendingUp size={15} />
            <span>MIS Sales Report</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("admins")}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: currentTab === "admins" ? "#0f172a" : "#fff",
              color: currentTab === "admins" ? "#fff" : "#334155",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Shield size={15} />
            <span>Admin Access ({adminWhitelist.length})</span>
          </button>

          <button
            type="button"
            onClick={handleAdminSignOut}
            title="Lock Console and Sign Out"
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #fecaca",
              backgroundColor: "#fff",
              color: "#dc2626",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "4px",
            }}
          >
            <LogOut size={14} />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          TAB 1: PRODUCTS MANAGEMENT (CRUD)
         ============================================================ */}
      {currentTab === "products" && (
        <div>
          {/* Action Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 260px", maxWidth: "380px" }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title, category, or brand..."
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: "5px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                resetProductForm();
                setEditingProduct(null);
                setShowAddModal(true);
              }}
              style={{
                backgroundColor: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
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
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "6px", backgroundColor: "#fff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "10px 12px" }}>Product</th>
                  <th style={{ padding: "10px 12px" }}>Category</th>
                  <th style={{ padding: "10px 12px" }}>Rental Rate (INR)</th>
                  <th style={{ padding: "10px 12px" }}>Stock</th>
                  <th style={{ padding: "10px 12px" }}>Item Condition</th>
                  <th style={{ padding: "10px 12px" }}>Daily Penalty</th>
                  <th style={{ padding: "10px 12px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                      No products found. Click "Add New Product" to insert items.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p._id || p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={p.imgSrc}
                          alt={p.name}
                          style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "4px", backgroundColor: "#f8fafc" }}
                        />
                        <div>
                          <strong style={{ color: "#0f172a" }}>{p.name}</strong>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{p.brandName || "StyleLease"}</div>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", color: "#475569" }}>{p.category || "Apparel"}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "#dc2626" }}>
                        ₹{Number(p.price || 899).toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "10px 12px" }}>{p.countInStock ?? 15} units</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "#059669" }}>
                        {p.itemAge || "Brand New (Mint)"}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "#d97706" }}>
                        ₹{p.dailyLatePenalty || 150}/day
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleEditClick(p)}
                          style={{
                            backgroundColor: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            cursor: "pointer",
                            marginRight: "6px",
                          }}
                          title="Edit Product"
                        >
                          <Edit2 size={13} color="#0f172a" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p._id || p.id, p.name)}
                          style={{
                            backgroundColor: "#fee2e2",
                            border: "1px solid #fca5a5",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            cursor: "pointer",
                          }}
                          title="Delete Product"
                        >
                          <Trash2 size={13} color="#b91c1c" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add / Edit Product Modal */}
          {showAddModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  padding: "24px",
                  width: "100%",
                  maxWidth: "560px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  border: "1px solid #cbd5e1",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                    {editingProduct ? "Update Product" : "Add New Rental Product"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct}>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Product Name *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Royal Silk Brocade Sherwani"
                      style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Brand Name</label>
                      <input
                        type="text"
                        value={productForm.brandName}
                        onChange={(e) => setProductForm({ ...productForm, brandName: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                      >
                        <option>Ethnic &amp; Wedding Wear</option>
                        <option>Formal &amp; Suits</option>
                        <option>Party &amp; Evening Wear</option>
                        <option>Men's Footwear</option>
                        <option>Women's Footwear</option>
                        <option>Kid's Footwear</option>
                        <option>Unisex Footwear</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Price in INR (₹) *</label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        placeholder="e.g. 1499"
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Stock Count</label>
                      <input
                        type="number"
                        value={productForm.countInStock}
                        onChange={(e) => setProductForm({ ...productForm, countInStock: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Primary Image Path / URL *</label>
                    <input
                      type="text"
                      required
                      value={productForm.imgSrc}
                      onChange={(e) => setProductForm({ ...productForm, imgSrc: e.target.value })}
                      placeholder="images/p1.jpg or https://..."
                      style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Object Condition / Age</label>
                      <input
                        type="text"
                        value={productForm.itemAge}
                        onChange={(e) => setProductForm({ ...productForm, itemAge: e.target.value })}
                        placeholder="e.g. Brand New (Mint Condition)"
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Daily Late Penalty (₹/day)</label>
                      <input
                        type="number"
                        value={productForm.dailyLatePenalty}
                        onChange={(e) => setProductForm({ ...productForm, dailyLatePenalty: e.target.value })}
                        placeholder="150"
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Available Sizes (comma-separated)</label>
                    <input
                      type="text"
                      value={productForm.sizes}
                      onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                      placeholder="e.g. 38, 40, 42, 44 or S, M, L"
                      style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Description</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Describe the styling, textiles, and occasions..."
                      style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      style={{ padding: "8px 14px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: "8px 18px", backgroundColor: "#0f172a", color: "#fff", border: "none", borderRadius: "4px", fontWeight: 600, cursor: "pointer" }}
                    >
                      {editingProduct ? "Update Product" : "Save Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          TAB 2: RENTED ORDERS & RETURNS MANAGEMENT
         ============================================================ */}
      {currentTab === "orders" && (
        <div>
          {/* Status Filter Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Filter size={15} color="#64748b" />
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Filter by Status:</span>
              {["All", "Confirmed", "Delivered", "Active Rental", "Return Requested", "Returned", "Overdue"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: orderStatusFilter === st ? "#0f172a" : "#fff",
                    color: orderStatusFilter === st ? "#fff" : "#334155",
                    fontSize: "12px",
                    fontWeight: orderStatusFilter === st ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={loadOrders}
              style={{
                backgroundColor: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                padding: "6px 12px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Refresh Orders
            </button>
          </div>

          {/* Orders Table */}
          <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "6px", backgroundColor: "#fff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "10px" }}>Order ID</th>
                  <th style={{ padding: "10px" }}>Customer &amp; Phone</th>
                  <th style={{ padding: "10px" }}>Items Rented</th>
                  <th style={{ padding: "10px" }}>Tenure / Return Date</th>
                  <th style={{ padding: "10px" }}>Total (₹)</th>
                  <th style={{ padding: "10px" }}>Status</th>
                  <th style={{ padding: "10px" }}>Penalty (₹)</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Manage Return</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                      No orders matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const scheduledReturn = ord.expectedReturnDate
                      ? new Date(ord.expectedReturnDate).toLocaleDateString("en-IN")
                      : "4 Days";

                    const isOverdue =
                      ord.status !== "Returned" &&
                      ord.expectedReturnDate &&
                      new Date(ord.expectedReturnDate) < new Date();

                    return (
                      <tr key={ord._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px", fontWeight: 700 }}>
                          #{ord._id.slice(-6).toUpperCase()}
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                            {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                          </div>
                        </td>

                        <td style={{ padding: "10px" }}>
                          <strong>{ord.customerName}</strong>
                          <div style={{ color: "#64748b" }}>{ord.contactPhone || ord.customerEmail}</div>
                          {ord.deliveryAddress?.city && (
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{ord.deliveryAddress.city}</div>
                          )}
                        </td>

                        <td style={{ padding: "10px" }}>
                          {ord.orderItems?.map((it, idx) => (
                            <div key={idx} style={{ whiteSpace: "nowrap" }}>
                              &bull; {it.name} (x{it.qty || 1})
                            </div>
                          ))}
                        </td>

                        <td style={{ padding: "10px" }}>
                          <div><strong>{ord.rentalDuration || 4} Days</strong></div>
                          <div style={{ color: isOverdue ? "#b91c1c" : "#059669", fontWeight: 600 }}>
                            Due: {scheduledReturn}
                          </div>
                        </td>

                        <td style={{ padding: "10px", fontWeight: 700, color: "#dc2626" }}>
                          ₹{Number(ord.totalAmount).toLocaleString("en-IN")}
                        </td>

                        <td style={{ padding: "10px" }}>
                          <select
                            value={ord.status || "Confirmed"}
                            onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12px",
                              backgroundColor:
                                ord.status === "Returned"
                                  ? "#ecfdf5"
                                  : ord.status === "Delivered"
                                  ? "#eff6ff"
                                  : isOverdue
                                  ? "#fee2e2"
                                  : "#fff",
                            }}
                          >
                            <option>Confirmed</option>
                            <option>Processing</option>
                            <option>Delivered</option>
                            <option>Active Rental</option>
                            <option>Return Requested</option>
                            <option>Returned</option>
                            <option>Overdue</option>
                            <option>Cancelled</option>
                          </select>
                        </td>

                        <td style={{ padding: "10px" }}>
                          {ord.penaltyAmount > 0 ? (
                            <span style={{ color: "#b91c1c", fontWeight: 700 }}>
                              ₹{ord.penaltyAmount.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span style={{ color: "#059669" }}>₹0</span>
                          )}
                        </td>

                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => openReturnModal(ord)}
                            style={{
                              backgroundColor: ord.status === "Returned" ? "#f1f5f9" : "#0f172a",
                              color: ord.status === "Returned" ? "#334155" : "#fff",
                              border: "none",
                              borderRadius: "4px",
                              padding: "5px 10px",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <RotateCcw size={12} />
                            <span>{ord.status === "Returned" ? "Edit Return" : "Process Return"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Process Return & Penalty Modal */}
          {returnModalOrder && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  padding: "20px",
                  width: "100%",
                  maxWidth: "500px",
                  border: "1px solid #cbd5e1",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>
                    Process Return &amp; Assess Penalty (Order #{returnModalOrder._id.slice(-6).toUpperCase()})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setReturnModalOrder(null)}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleProcessReturnSubmit}>
                  {(() => {
                    const expected = returnModalOrder.expectedReturnDate
                      ? new Date(returnModalOrder.expectedReturnDate)
                      : new Date();
                    const returnDateObj = returnForm.actualReturnDate
                      ? new Date(returnForm.actualReturnDate)
                      : new Date();
                    const returnDateOnly = new Date(returnDateObj.getFullYear(), returnDateObj.getMonth(), returnDateObj.getDate());
                    const expectedDateOnly = new Date(expected.getFullYear(), expected.getMonth(), expected.getDate());
                    const dayDiff = Math.round((returnDateOnly.getTime() - expectedDateOnly.getTime()) / (1000 * 60 * 60 * 24));
                    const liveDaysLate = Math.max(0, dayDiff);
                    const dailyRate = returnModalOrder.dailyLatePenalty || 150;
                    const calculatedLatePenalty = liveDaysLate * dailyRate;
                    const damageCharge = Number(returnForm.damageFee) || 0;
                    const totalEstimatedPenalty = returnForm.penaltyOverride !== "" ? Number(returnForm.penaltyOverride) : (calculatedLatePenalty + damageCharge);

                    return (
                      <div style={{ backgroundColor: "#f8fafc", padding: "10px", borderRadius: "6px", marginBottom: "12px", fontSize: "12px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                          <div>Customer: <strong>{returnModalOrder.customerName}</strong></div>
                          <div>Rental Tenure: <strong>{returnModalOrder.rentalDuration || 4} Days</strong></div>
                          <div>
                            Expected Due Date:{" "}
                            <strong>
                              {returnModalOrder.expectedReturnDate
                                ? new Date(returnModalOrder.expectedReturnDate).toLocaleDateString("en-IN")
                                : "4 Days"}
                            </strong>
                          </div>
                          <div>Daily Penalty Rate: <strong style={{ color: "#d97706" }}>₹{dailyRate}/day</strong></div>
                          <div style={{ gridColumn: "1 / -1" }}>
                            Item Age / Condition: <strong style={{ color: "#0f172a" }}>{returnModalOrder.productAge || "Brand New (Mint Condition)"}</strong>
                          </div>
                        </div>
                        <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>Calculated Late Delay: <strong>{liveDaysLate} day(s)</strong></span>
                          <span style={{ fontWeight: 700, color: totalEstimatedPenalty > 0 ? "#dc2626" : "#059669" }}>
                            Estimated Total Penalty: ₹{totalEstimatedPenalty.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                      Actual Return Date Received *
                    </label>
                    <input
                      type="date"
                      required
                      value={returnForm.actualReturnDate}
                      onChange={(e) => setReturnForm({ ...returnForm, actualReturnDate: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                      Physical Condition Inspection *
                    </label>
                    <select
                      value={returnForm.returnCondition}
                      onChange={(e) => setReturnForm({ ...returnForm, returnCondition: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    >
                      <option>Good / Mint</option>
                      <option>Minor Wear (Covered by Shield)</option>
                      <option>Damaged (Stains / Rips)</option>
                      <option>Late Return</option>
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                        Damage Charge (₹)
                      </label>
                      <input
                        type="number"
                        value={returnForm.damageFee}
                        onChange={(e) => setReturnForm({ ...returnForm, damageFee: e.target.value })}
                        placeholder="0"
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                        Custom Override Penalty (₹)
                      </label>
                      <input
                        type="number"
                        value={returnForm.penaltyOverride}
                        onChange={(e) => setReturnForm({ ...returnForm, penaltyOverride: e.target.value })}
                        placeholder="Auto calculated"
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                      Penalty Reason / Inspection Notes
                    </label>
                    <input
                      type="text"
                      value={returnForm.penaltyReason}
                      onChange={(e) => setReturnForm({ ...returnForm, penaltyReason: e.target.value })}
                      placeholder="e.g. 2 days late return fee assessed"
                      style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setReturnModalOrder(null)}
                      style={{ padding: "8px 14px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: "8px 18px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", fontWeight: 600, cursor: "pointer" }}
                    >
                      Record Return &amp; Save Penalty
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          TAB 3: MIS REPORT FOR SALES GROWTH
         ============================================================ */}
      {currentTab === "mis" && (
        <div>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                Management Information System (MIS) Sales &amp; Growth Report
              </h2>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Key business performance indicators, rental turnaround, and sales trends
              </span>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                backgroundColor: "#0f172a",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Printer size={14} />
              <span>Print / Export MIS Report</span>
            </button>
          </div>

          {loadingMis || !misData ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              Generating MIS calculations...
            </div>
          ) : (
            <>
              {/* Metric KPI Cards Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Total Gross Revenue</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#16a34a" }}>
                    ₹{misData.kpis.totalRevenue.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "2px" }}>Direct Rental Bookings</div>
                </div>

                <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Total Bookings Placed</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                    {misData.kpis.totalOrders} Orders
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Avg: ₹{misData.kpis.averageOrderValue}/order</div>
                </div>

                <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Active Rentals in Market</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#2563eb" }}>
                    {misData.kpis.activeRentals} Active
                  </div>
                  <div style={{ fontSize: "11px", color: "#2563eb", marginTop: "2px" }}>Currently with customers</div>
                </div>

                <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Completed Returns</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#059669" }}>
                    {misData.kpis.completedReturns} Returned
                  </div>
                  <div style={{ fontSize: "11px", color: "#059669", marginTop: "2px" }}>Compliance: {misData.kpis.returnComplianceRate}%</div>
                </div>

                <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Late Return Penalties</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#dc2626" }}>
                    ₹{misData.kpis.totalPenalties.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "2px" }}>{misData.kpis.overdueRentals} currently overdue</div>
                </div>
              </div>

              {/* Two Column Section: Category Revenue Breakdown & Growth Timeline */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                {/* Category Revenue Table */}
                <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>
                    Revenue by Outfit &amp; Footwear Category
                  </h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                        <th style={{ textAlign: "left", padding: "6px 0" }}>Category</th>
                        <th style={{ textAlign: "right", padding: "6px 0" }}>Revenue (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(misData.categoryRevenue).map(([cat, rev]) => (
                        <tr key={cat} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "8px 0", color: "#334155" }}>{cat}</td>
                          <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 700, color: "#16a34a" }}>
                            ₹{rev.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sales Growth Timeline Table */}
                <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>
                    Booking Activity &amp; Growth Timeline
                  </h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                        <th style={{ textAlign: "left", padding: "6px 0" }}>Date</th>
                        <th style={{ textAlign: "center", padding: "6px 0" }}>Bookings</th>
                        <th style={{ textAlign: "right", padding: "6px 0" }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {misData.salesGrowthTimeline.map((item) => (
                        <tr key={item.date} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "8px 0", color: "#334155" }}>{item.date}</td>
                          <td style={{ padding: "8px 0", textAlign: "center" }}>{item.ordersCount} bookings</td>
                          <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                            ₹{item.revenue.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ============================================================
          TAB 4: ADMIN ACCESS & WHITELIST MANAGEMENT
         ============================================================ */}
      {currentTab === "admins" && (
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={20} color="#0f172a" />
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Authorized Administrator Accounts
              </h2>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
              Only users authenticated with these email addresses are permitted to access the <code>/admin</code> direct URL. You can grant access to more email addresses below.
            </p>
          </div>

          {/* Add New Admin Email Form */}
          <form
            onSubmit={handleAddAdminEmail}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "24px",
              padding: "16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1", minWidth: "260px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Add New Admin Email:
              </label>
              <input
                type="email"
                placeholder="e.g. manager@stylelease.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={addingAdminLoading}
              style={{
                alignSelf: "flex-end",
                padding: "10px 18px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#0f172a",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: addingAdminLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <UserPlus size={15} />
              <span>{addingAdminLoading ? "Granting Access..." : "Grant Admin Access"}</span>
            </button>
          </form>

          {/* Whitelisted Admins Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b", textAlign: "left" }}>
                <th style={{ padding: "10px 12px" }}>Administrator Email</th>
                <th style={{ padding: "10px 12px" }}>Access Tier</th>
                <th style={{ padding: "10px 12px" }}>Status</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminWhitelist.map((admEmail) => {
                const isRoot = admEmail === "deep@stylelease.com" || admEmail === "tanvi@stylelease.com";
                const isCurrent = admEmail.toLowerCase() === currentUserEmail.toLowerCase();
                return (
                  <tr key={admEmail} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#0f172a" }}>
                      {admEmail} {isCurrent && <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: 500 }}>(Current Session)</span>}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: isRoot ? "#eff6ff" : "#f1f5f9",
                          color: isRoot ? "#1d4ed8" : "#475569",
                        }}
                      >
                        {isRoot ? "Primary Root Admin" : "Delegated Admin"}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#059669", fontSize: "12px", fontWeight: 600 }}>
                        <CheckCircle size={13} />
                        <span>Authorized</span>
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      {isRoot ? (
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>Permanent Root</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveAdminEmail(admEmail)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            border: "1px solid #fecaca",
                            backgroundColor: "#fff",
                            color: "#dc2626",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Revoke Access
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default AdminPanel;
