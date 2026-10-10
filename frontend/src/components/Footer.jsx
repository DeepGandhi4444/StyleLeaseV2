import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  User,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const Footer = ({ cartItems = [] }) => {
  const location = useLocation();
  const cartCount = cartItems.length;

  return (
    <>
      {/* ================================================================
          Mobile Bottom Navigation Bar (Visible only on screens < 768px)
          ================================================================ */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <Link
          to="/home"
          className={`mobile-tab-btn ${location.pathname === "/home" ? "active" : ""}`}
        >
          <Home size={22} />
          <span>Home</span>
        </Link>

        <Link
          to="/products"
          className={`mobile-tab-btn ${location.pathname === "/products" ? "active" : ""}`}
        >
          <LayoutGrid size={22} />
          <span>Catalog</span>
        </Link>

        <Link
          to="/cart"
          className={`mobile-tab-btn ${location.pathname === "/cart" ? "active" : ""}`}
        >
          <div style={{ position: "relative" }}>
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          <span>Cart</span>
        </Link>

        <Link
          to="/profile"
          className={`mobile-tab-btn ${location.pathname === "/profile" ? "active" : ""}`}
        >
          <User size={22} />
          <span>Profile</span>
        </Link>
      </nav>

      {/* ================================================================
          Desktop Rich Footer (Visible only on screens >= 768px)
          ================================================================ */}
      <footer className="desktop-footer-section">
        <div className="app-container">
          <div className="footer-grid-4col">
            {/* Column 1: Brand Info */}
            <div>
              <div style={{ marginBottom: "14px" }}>
                <img
                  src="images/StyleLease.png"
                  alt="StyleLease"
                  style={{ height: "36px", filter: "brightness(0) invert(1)" }}
                />
              </div>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#94a3b8" }}>
                Premium designer footwear &amp; fashion rentals. Dress to impress
                for college festivals, weddings, and formal events at a fraction of
                retail cost.
              </p>
              <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#38bdf8" }}>
                  <ShieldCheck size={16} /> 100% Authentic
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#38bdf8" }}>
                  <Truck size={16} /> Sanitized Delivery
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="footer-col-title">Quick Explore</h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/home">Home Showcase</Link>
                </li>
                <li>
                  <Link to="/products">All Footwear &amp; Apparel</Link>
                </li>
                <li>
                  <Link to="/cart">Shopping &amp; Rental Bag</Link>
                </li>
                <li>
                  <Link to="/profile">My Orders &amp; Account</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Categories */}
            <div>
              <h4 className="footer-col-title">Collections</h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/products">Men's Oxford &amp; Boots</Link>
                </li>
                <li>
                  <Link to="/products">Women's Heels &amp; Sneakers</Link>
                </li>
                <li>
                  <Link to="/products">Athletic &amp; Marathon Running</Link>
                </li>
                <li>
                  <Link to="/products">Festive &amp; Party Footwear</Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Rental Peace of Mind */}
            <div>
              <h4 className="footer-col-title">How Rental Works</h4>
              <ul className="footer-links-list" style={{ gap: "14px" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                  <Sparkles size={16} color="#fbbf24" /> Select your look &amp; size
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                  <Truck size={16} color="#38bdf8" /> Free doorstep sanitized delivery
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                  <RotateCcw size={16} color="#4ade80" /> Easy prepaid return pickup
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-row">
            <p>&copy; {new Date().getFullYear()} StyleLease Platform. All rights reserved.</p>
            <p style={{ color: "#64748b" }}>Crafted for College Projects &amp; Modern E-Commerce</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
