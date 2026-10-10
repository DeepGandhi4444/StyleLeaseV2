import React, { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import { Link, useNavigate } from "react-router-dom";
import { Search as SearchIcon, X, ArrowRight } from "lucide-react";
import { HitItems } from "../data/Products";
import { productAPI } from "../services/api";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [products, setProducts] = useState(HitItems);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const searchWrapRef = useRef(null);
  const itemRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productAPI.getAll();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        // Fallback to local
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (products && products.length > 0 && searchTerm.trim() !== "") {
      const fuse = new Fuse(products, {
        keys: ["name", "brandName", "category"],
        threshold: 0.35,
      });
      const results = fuse.search(searchTerm);
      setSearchResults(results);
      setHighlightedIndex(-1);
      setIsOpen(results.length > 0);
    } else {
      setSearchResults([]);
      setHighlightedIndex(-1);
      setIsOpen(false);
    }
  }, [searchTerm, products]);

  // Click outside listener to dismiss search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation for search dropdown
  const handleKeyDown = (e) => {
    if (!isOpen || searchResults.length === 0) {
      if (e.key === "Enter" && searchTerm.trim()) {
        navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < searchResults.length - 1 ? prev + 1 : 0;
        if (itemRefs.current[next]) {
          itemRefs.current[next].scrollIntoView({ block: "nearest" });
        }
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : searchResults.length - 1;
        if (itemRefs.current[next]) {
          itemRefs.current[next].scrollIntoView({ block: "nearest" });
        }
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
        const selectedItem = searchResults[highlightedIndex].item;
        navigate(`/one?id=${selectedItem._id || selectedItem.id}`);
        handleClear();
      } else if (searchResults.length > 0) {
        const firstItem = searchResults[0].item;
        navigate(`/one?id=${firstItem._id || firstItem.id}`);
        handleClear();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClear = () => {
    setSearchTerm("");
    setSearchResults([]);
    setHighlightedIndex(-1);
    setIsOpen(false);
  };

  return (
    <div className="search-form-wrap" ref={searchWrapRef}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <SearchIcon size={18} className="search-icon-inside" />
        <input
          type="text"
          className="search-input-field"
          placeholder="Search footwear, brands, collections..."
          maxLength={40}
          autoComplete="off"
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchResults.length > 0) setIsOpen(true);
          }}
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && searchResults.length > 0 && (
        <div className="search-dropdown-menu" role="listbox">
          {searchResults.map((result, idx) => {
            const item = result.item;
            const targetUrl = `/one?id=${item._id || item.id}`;
            const isHighlighted = idx === highlightedIndex;
            return (
              <Link
                key={item._id || item.id}
                ref={(el) => (itemRefs.current[idx] = el)}
                to={targetUrl}
                className={`search-dropdown-item ${isHighlighted ? "highlighted" : ""}`}
                style={
                  isHighlighted
                    ? {
                        backgroundColor: "#f1f5f9",
                        borderLeft: "3px solid var(--primary)",
                      }
                    : {}
                }
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={handleClear}
              >
                <div className="search-item-info">
                  <img
                    src={item.imgSrc}
                    alt={item.name}
                    className="search-item-thumb"
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {item.category || "Footwear"} &bull;{" "}
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                        ₹{Number(item.price || 899).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  color={isHighlighted ? "var(--primary)" : "var(--text-muted)"}
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Search;
