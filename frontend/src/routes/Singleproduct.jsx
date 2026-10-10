import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import ProductGallery from "../components/ProductGallery";
import { Ripple } from "primereact/ripple";
import { Panel } from "primereact/panel";
import { Toast } from "primereact/toast";
import {
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Plus,
  Minus,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Tag,
  CheckCircle2,
  MapPin,
  Clock,
} from "lucide-react";
import { HitItems } from "../data/Products";
import { productAPI } from "../services/api";

const Singleproduct = ({ cartItems, setCartItems }) => {
  const { id: paramId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get("id") || paramId;

  const initialProduct =
    HitItems.find(
      (p) => String(p.id) === String(productId) || String(p._id) === String(productId)
    ) || HitItems[0];

  const [product, setProduct] = useState(initialProduct);
  const [selectedSize, setSelectedSize] = useState(
    initialProduct.sizes && initialProduct.sizes.length > 0 ? initialProduct.sizes[0] : "9"
  );
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedTenure, setSelectedTenure] = useState(4); // Default 4 days tenure
  const [userRating, setUserRating] = useState(Math.round(initialProduct.rating || 5));
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(null);

  const toast = useRef(null);

  useEffect(() => {
    if (!productId) return;

    // Immediate local match for instant rendering without lag
    const localMatch = HitItems.find(
      (p) => String(p.id) === String(productId) || String(p._id) === String(productId)
    );
    if (localMatch) {
      setProduct(localMatch);
      setUserRating(Math.round(localMatch.rating || 5));
      if (localMatch.sizes && localMatch.sizes.length > 0) {
        setSelectedSize(localMatch.sizes[0]);
      }
    }

    const fetchProduct = async () => {
      try {
        const data = await productAPI.getById(productId);
        if (data) {
          setProduct(data);
          setUserRating(Math.round(data.rating || 5));
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }
        }
      } catch (err) {
        console.warn("[Singleproduct] Failed to fetch by ID from API:", err.message);
      }
    };
    fetchProduct();
  }, [productId]);

  // Calculate return date
  const now = new Date();
  const expectedReturnDate = new Date(
    now.getTime() + selectedTenure * 24 * 60 * 60 * 1000
  );
  const formattedReturnDate = expectedReturnDate.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Calculate price based on tenure (with progressive affordability discount)
  const basePrice = Number(product.price) || 899;
  const tenureMultiplier =
    selectedTenure === 3
      ? 0.85
      : selectedTenure === 7
      ? 1.4
      : selectedTenure === 10
      ? 1.8
      : selectedTenure === 14
      ? 2.2
      : 1.0;
  const finalItemPrice = Math.round(basePrice * tenureMultiplier);

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6) {
      setPincodeStatus({
        available: false,
        message: "Please enter a valid 6-digit delivery pincode.",
      });
      return;
    }
    setPincodeStatus({
      available: true,
      message: `Delivery available for PIN ${pincode.trim()}! Guaranteed delivery in 24-48 hrs with doorstep return pickup.`,
    });
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      id: `${product._id || product.id}-${selectedSize}-${selectedTenure}d`,
      _id: product._id || product.id,
      name: product.name,
      price: finalItemPrice,
      basePrice: basePrice,
      imgSrc: product.imgSrc || "images/p1.jpg",
      brandName: product.brandName || "StyleLease",
      size: selectedSize,
      qty: Number(selectedQty),
      rentalDuration: Number(selectedTenure),
      rentalStartDate: now.toISOString(),
      expectedReturnDate: expectedReturnDate.toISOString(),
      productAge: product.itemAge || "Brand New (Mint Condition)",
      dailyLatePenalty: product.dailyLatePenalty || 150,
      category: product.category || "Designer Wear",
    };

    const existingIndex = cartItems.findIndex((item) => item.id === itemToAdd.id);
    if (existingIndex > -1) {
      const updatedCart = [...cartItems];
      updatedCart[existingIndex].qty += itemToAdd.qty;
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, itemToAdd]);
    }

    if (toast.current) {
      toast.current.show({
        severity: "success",
        summary: "Added to Rental Bag",
        detail: `${product.name} (Size ${selectedSize}, ${selectedTenure} Days) added successfully!`,
        life: 3000,
      });
    }
  };

  const incrementQty = () => setSelectedQty((prev) => Math.min(prev + 1, 5));
  const decrementQty = () => setSelectedQty((prev) => Math.max(prev - 1, 1));

  const availableSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : ["7", "8", "9", "10", "11"];

  const tenureOptions = [
    { days: 3, label: "3 Days", tag: "Weekend Special" },
    { days: 4, label: "4 Days", tag: "Most Popular" },
    { days: 7, label: "7 Days", tag: "Week-long (Save 30%)" },
    { days: 10, label: "10 Days", tag: "Extended (Save 40%)" },
    { days: 14, label: "14 Days", tag: "Fortnight (Save 50%)" },
  ];

  return (
    <main className="app-container" style={{ paddingTop: "20px" }}>
      <Toast ref={toast} className="custom-toast-success" />

      {/* Back to Products Navigation */}
      <div style={{ marginBottom: "16px" }}>
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
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Responsive 2-Column Product Layout */}
      <div className="product-detail-layout">
        {/* Left Column: Galleria Image Gallery */}
        <div className="product-gallery-side">
          <ProductGallery product={product} />
        </div>

        {/* Right Column: Details, Sizing, Pricing & Actions */}
        <div className="product-info-side">
          <div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span className="detail-header-badge">
                <Sparkles size={13} />
                <span>{product.category || "Designer Footwear"}</span>
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: "#eff6ff",
                  color: "#1d4ed8",
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                <Tag size={12} />
                <span>Condition: {product.itemAge || "Brand New (Mint Condition)"}</span>
              </span>
            </div>

            <h1 className="detail-title" style={{ marginTop: "8px" }}>
              {product.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "#f59e0b" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= userRating ? "#f59e0b" : "none"}
                    color="#f59e0b"
                    style={{ cursor: "pointer" }}
                    onClick={() => setUserRating(star)}
                  />
                ))}
              </div>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                ({product.reviewsCount || 24} customer ratings)
              </span>
            </div>
          </div>

          {/* Pricing in INR */}
          <div className="detail-price-box">
            <span className="detail-price-main">
              ₹{finalItemPrice.toLocaleString("en-IN")}
            </span>
            <span className="detail-price-sub">/ {selectedTenure}-day rental tenure</span>
          </div>

          {/* Availability & Stock Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "12px 0", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor: "#ecfdf5",
                color: "#065f46",
                border: "1px solid #a7f3d0",
                padding: "4px 10px",
                borderRadius: "20px",
              }}
            >
              <CheckCircle2 size={15} color="#059669" />
              <span>Available Now ({product.countInStock || 15} pairs in stock)</span>
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              <Clock size={14} />
              <span>Instant Booking Ready</span>
            </span>
          </div>

          {/* Delivery & Pincode Availability Checker */}
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "#f8fafc",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <MapPin size={15} color="var(--primary)" />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>
                Check Delivery &amp; Pickup Availability:
              </span>
            </div>
            <form onSubmit={handleCheckPincode} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Enter 6-digit Pincode (e.g. 380054)"
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, ""));
                  setPincodeStatus(null);
                }}
                style={{
                  flex: "1",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Check
              </button>
            </form>
            {pincodeStatus && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: pincodeStatus.available ? "#047857" : "#b91c1c",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {pincodeStatus.available ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <span>{pincodeStatus.message}</span>
              </div>
            )}
          </div>

          {/* Rental Tenure Selector */}
          <div style={{ margin: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
                Select Rental Duration:
              </h4>
              <span style={{ fontSize: "12px", color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                <Calendar size={13} />
                Return by: {formattedReturnDate}
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {tenureOptions.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setSelectedTenure(opt.days)}
                  style={{
                    flex: "1 1 80px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: selectedTenure === opt.days ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                    backgroundColor: selectedTenure === opt.days ? "var(--primary-light)" : "#fff",
                    color: selectedTenure === opt.days ? "var(--primary)" : "var(--text-main)",
                    cursor: "pointer",
                    textAlign: "center",
                    fontWeight: selectedTenure === opt.days ? 700 : 500,
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ fontSize: "14px" }}>{opt.label}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{opt.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Late Return Penalty Policy Notice */}
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#92400e",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
            <div>
              <strong>Late Return Penalty Policy:</strong> ₹{product.dailyLatePenalty || 150}/day is charged if item is not returned by {formattedReturnDate}. Free doorstep pickup is scheduled for your return date.
            </div>
          </div>

          {/* Description Snippet */}
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6" }}>
            {product.description ||
              "Handcrafted with breathable textiles, reinforced stitching, and cushioned ergonomic soles for premium all-day comfort."}
          </p>

          {/* Size Selector */}
          <div className="size-selector-wrap">
            <h4>Select Size:</h4>
            <div className="size-pills-row">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`size-pill-btn ${selectedSize === size ? "selected" : ""}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Counter */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>
              Quantity:
            </h4>
            <div className="qty-counter-row">
              <button
                type="button"
                className="qty-counter-btn"
                onClick={decrementQty}
                disabled={selectedQty <= 1}
              >
                <Minus size={16} />
              </button>
              <span style={{ fontSize: "16px", fontWeight: 700, minWidth: "24px", textAlign: "center" }}>
                {selectedQty}
              </span>
              <button
                type="button"
                className="qty-counter-btn"
                onClick={incrementQty}
                disabled={selectedQty >= 5}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Action Button: Add to Cart */}
          <div className="action-buttons-row">
            <button
              type="button"
              className="add-to-cart-large-btn p-ripple"
              onClick={handleAddToCart}
            >
              <ShoppingBag size={20} />
              <span>Add to Rental Bag (₹{(finalItemPrice * selectedQty).toLocaleString("en-IN")})</span>
              <Ripple />
            </button>
          </div>

          {/* Value Propositions / Perks */}
          <div className="perks-list-card">
            <div className="perk-item">
              <Truck size={20} color="var(--primary)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>Free Delivery</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Doorstep drop &amp; return</div>
              </div>
            </div>
            <div className="perk-item">
              <ShieldCheck size={20} color="var(--primary)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>Deep Sanitized</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Medical grade clean</div>
              </div>
            </div>
            <div className="perk-item">
              <RotateCcw size={20} color="var(--primary)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>Damage Shield</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Minor wear covered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Panels for Product Specifications */}
      <div style={{ marginBottom: "50px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <Panel header="Product Overview &amp; Craftsmanship" toggleable>
          <p style={{ lineHeight: "1.7", color: "var(--text-muted)", fontSize: "14px" }}>
            {product.description} Crafted with ultra-lightweight materials and shock-absorbing
            foams that cradle your foot throughout weddings, presentations, and dance floors.
            Every item undergoes multi-point inspection before leaving our fulfillment hub.
          </p>
        </Panel>

        <Panel header="Rental Terms &amp; Conditions &amp; Penalty Policy" toggleable>
          <ul style={{ paddingLeft: "20px", lineHeight: "1.8", color: "var(--text-muted)", fontSize: "14px" }}>
            <li>Standard rental tenure is selectable (3, 4, 7, or 10 days).</li>
            <li>Free doorstep return pickup is scheduled on your return due date.</li>
            <li><strong>Late Return Penalty:</strong> An overdue penalty of ₹{product.dailyLatePenalty || 150}/day is charged automatically for delays past the return date.</li>
            <li><strong>Condition &amp; Damage:</strong> Accidental minor wear is fully covered by our Damage Shield. Severe tears or permanent stains may incur repair charges.</li>
            <li>Keep the return box and barcode label provided with delivery.</li>
          </ul>
        </Panel>

        <Panel header="Verified Customer Reviews" toggleable>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <strong>Rahul V.</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>College Convocation</span>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
                "Rented this pair for my college farewell. Everyone asked where I bought them from! Flawless condition and great fit."
              </p>
            </div>
            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <strong>Simran K.</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Dance Festival</span>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
                "Super convenient and cost-effective. Saved me thousands of rupees for a one-time event."
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </main>
  );
};

export default Singleproduct;
