import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";
import CustomSlider from "../components/Slider";
import Hit from "../components/Hit";
import { HomeSlider } from "../data/Slider";
import { HitItems } from "../data/Products";
import { productAPI } from "../services/api";

const Home = () => {
  const [products, setProducts] = useState(HitItems);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getAll({ isSpecial: true });
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn("[Home] Using fallback products due to:", err.message);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="app-container" style={{ paddingTop: "12px" }}>
      {/* Hero Banner Slider */}
      <CustomSlider items={HomeSlider} />

      {/* Trust & Service Badges */}
      <section style={{ margin: "28px 0" }}>
        <div className="perks-list-card" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div className="perk-item">
            <Truck size={22} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 600 }}>Free Doorstep Delivery</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>On all rental bookings</div>
            </div>
          </div>
          <div className="perk-item">
            <ShieldCheck size={22} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 600 }}>100% Sanitized &amp; Fresh</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Deep cleaned before dispatch</div>
            </div>
          </div>
          <div className="perk-item">
            <RotateCcw size={22} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 600 }}>Hassle-Free Returns</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Prepaid box &amp; pickup</div>
            </div>
          </div>
          <div className="perk-item">
            <Headphones size={22} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 600 }}>24/7 Styling Support</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Size swaps &amp; concierge</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="category-section-wrap">
        <div className="section-headline">
          <h2 className="section-title">
            <Sparkles size={20} color="var(--primary)" />
            <span>Featured Categories</span>
          </h2>
          <Link to="/products" className="section-link">
            <span>Explore All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="category-grid">
          {/* Women */}
          <Link to="/products" className="category-card">
            <img src="images/img-w.jpg" alt="Women" className="category-card-img" />
            <div className="category-card-overlay">
              <div className="category-card-name">WOMEN</div>
              <div className="category-card-btn">
                <span>Browse Collection</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Men */}
          <Link to="/products" className="category-card">
            <img src="images/man-r-img.jpg" alt="Men" className="category-card-img" />
            <div className="category-card-overlay">
              <div className="category-card-name">MEN</div>
              <div className="category-card-btn">
                <span>Browse Collection</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Kids */}
          <Link to="/products" className="category-card">
            <img src="images/kid-r-img.jpg" alt="Kids" className="category-card-img" />
            <div className="category-card-overlay">
              <div className="category-card-name">KIDS</div>
              <div className="category-card-btn">
                <span>Browse Collection</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Special Products Showcase */}
      <section style={{ marginBottom: "40px" }}>
        <div className="section-headline">
          <h2 className="section-title">
            <Sparkles size={20} color="var(--accent)" />
            <span>Special Rental Highlights</span>
          </h2>
          <Link to="/products" className="section-link">
            <span>View Full Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="products-grid">
          <Hit items={products} />
        </div>
      </section>
    </main>
  );
};

export default Home;
