import React from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";

const Hit = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", gridColumn: "1 / -1" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
          No products found in this collection.
        </p>
      </div>
    );
  }

  return (
    <>
      {items.map((item, index) => {
        const productId = item._id || item.id || index;
        const linkTo = `/one?id=${productId}`;
        const price = Number(item.price || 899);
        const rating = Number(item.rating || 4.5).toFixed(1);

        return (
          <div className="product-card" key={productId}>
            {/* Image & Brand */}
            <div className="product-img-wrapper">
              <Link to={linkTo} style={{ width: "100%", height: "100%", display: "block" }}>
                <img
                  src={item.imgSrc}
                  alt={item.name}
                  className="product-primary-img"
                  loading="lazy"
                />
              </Link>
              {item.brandSrc && (
                <div className="product-brand-badge" title={item.brandName || "Brand"}>
                  <img
                    src={item.brandSrc}
                    alt={item.brandName || "Brand"}
                    className="product-brand-logo"
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="product-card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="product-category-tag">
                  {item.category || "Footwear"}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>
                  <Star size={13} fill="#f59e0b" />
                  <span>{rating}</span>
                </div>
              </div>

              <Link to={linkTo}>
                <h3 className="product-title" title={item.name}>
                  {item.name}
                </h3>
              </Link>

              {/* Price & Action */}
              <div className="product-card-footer">
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Rental Price</div>
                  <div className="product-price-val">₹{Number(price).toLocaleString('en-IN')}</div>
                </div>

                <Link to={linkTo} className="product-rent-btn">
                  <span>Rent</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Hit;
