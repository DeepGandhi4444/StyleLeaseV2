import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  User,
  LayoutGrid,
  Menu,
  X,
  Home,
  Sparkles,
} from "lucide-react";
import Search from "./Search";

export default function Navbar({ cartItems = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const cartCount = cartItems.length;
  const userName = sessionStorage.getItem("name") || localStorage.getItem("name");

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header">
      <div className="app-container">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/home" className="brand-logo-wrap" onClick={closeMenu}>
            <img src="images/StyleLease.png" alt="StyleLease" />
          </Link>

          {/* Search Box */}
          <div className="nav-search-wrap">
            <Search />
          </div>

          {/* Desktop Navigation Links */}
          <ul className="desktop-nav-links">
            <li>
              <Link
                to="/home"
                className={`nav-item-link ${location.pathname === "/home" ? "active" : ""}`}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className={`nav-item-link ${location.pathname === "/products" ? "active" : ""}`}
              >
                <LayoutGrid size={18} />
                <span>Catalog</span>
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className="nav-item-link"
              >
                <Sparkles size={18} />
                <span>New Arrivals</span>
              </Link>
            </li>
          </ul>

          {/* Action Buttons: Cart & Profile */}
          <div className="nav-actions">
            <Link
              to="/cart"
              className="nav-icon-btn"
              title="Shopping Cart"
              onClick={closeMenu}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <Link
              to="/profile"
              className="nav-icon-btn"
              title={userName ? `Profile (${userName})` : "My Account"}
              onClick={closeMenu}
            >
              <User size={20} />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              className="mobile-menu-btn"
              onClick={toggleMenu}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <Link to="/home" className="mobile-nav-link" onClick={closeMenu}>
              <Home size={20} color="var(--primary)" />
              <span>Home</span>
            </Link>
            <Link to="/products" className="mobile-nav-link" onClick={closeMenu}>
              <LayoutGrid size={20} color="var(--primary)" />
              <span>All Products &amp; Catalog</span>
            </Link>
            <Link to="/cart" className="mobile-nav-link" onClick={closeMenu}>
              <ShoppingBag size={20} color="var(--primary)" />
              <span>My Cart ({cartCount})</span>
            </Link>
            <Link to="/profile" className="mobile-nav-link" onClick={closeMenu}>
              <User size={20} color="var(--primary)" />
              <span>Profile &amp; Orders</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
