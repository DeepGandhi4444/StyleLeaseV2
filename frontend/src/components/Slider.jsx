import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

const settings = {
  dots: true,
  infinite: true,
  speed: 600,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  pauseOnHover: true,
  arrows: false,
};

const CustomSlider = ({ items }) => {
  return (
    <div className="hero-slider-container">
      <Slider {...settings}>
        {items.map((item, index) => (
          <div key={item.id || index} className="slider-slide-wrap">
            <Link to="/products">
              <img
                src={item.src}
                className="slider-slide-img"
                alt={item.title || "Banner"}
              />
              <div className="slider-overlay-content">
                <div className="slider-overlay-badge" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Sparkles size={13} />
                  <span>{item.label || "PREMIUM COLLECTION"}</span>
                </div>
                <h2 className="slider-overlay-title">
                  {item.title || "Step Out in Style"}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", marginTop: "4px", color: "#e2e8f0" }}>
                  <span>Rent Now &bull; Up to 70% Off Retail</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CustomSlider;
