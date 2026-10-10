import React, { useState, useEffect } from "react";
import { Sparkles, Filter, ChevronUp } from "lucide-react";
import Hit from "../components/Hit";
import { HitItems } from "../data/Products";
import { productAPI } from "../services/api";

const CATEGORIES = [
  "All",
  "Men's Footwear",
  "Women's Footwear",
  "Ethnic & Wedding Wear",
  "Formal & Suits",
  "Party & Evening Wear",
  "Unisex Footwear",
];

const Products = () => {
  const [allProducts, setAllProducts] = useState(HitItems);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const data = await productAPI.getAll();
        if (data && data.length > 0) {
          setAllProducts(data);
        }
      } catch (err) {
        console.warn("[Products] Fallback to local products due to:", err.message);
      }
    };
    fetchAllProducts();
  }, []);

  const filteredProducts =
    activeCategory === "All"
      ? allProducts
      : allProducts.filter((p) => {
          if (!p.category) return false;
          const pCat = p.category.toLowerCase();
          const target = activeCategory.toLowerCase();
          return pCat.includes(target) || target.includes(pCat) || pCat.includes(target.replace(" footwear", ""));
        });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="app-container" style={{ paddingTop: "20px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #2D51A7 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "32px 24px",
          color: "#fff",
          marginBottom: "24px",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: "#fbbf24", fontWeight: 700 }}>
          <Sparkles size={16} />
          <span>StyleLease Collection</span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "8px 0 6px 0" }}>
          Explore Footwear &amp; Apparel
        </h1>
        <p style={{ color: "#e2e8f0", fontSize: "14px", maxWidth: "600px" }}>
          Choose from authentic designer collections for parties, college festivals, and formal occasions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "14px", fontWeight: 600 }}>
          <Filter size={16} />
          <span>Filter:</span>
        </div>
        <div className="filter-tabs-wrap" style={{ margin: 0, padding: 0 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-tab-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Counter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Showing <strong>{filteredProducts.length}</strong> items in <em>{activeCategory}</em>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        <Hit items={filteredProducts} />
      </div>

      {/* Floating Scroll to Top */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          backgroundColor: "var(--primary)",
          color: "#fff",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: "none",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 900,
        }}
      >
        <ChevronUp size={20} />
      </button>
    </main>
  );
};

export default Products;
