import React, { useState, useEffect } from "react";
import { Galleria } from "primereact/galleria";
import { ProductSlider } from "../data/Slider";

export default function ProductGallery({ product, galleryImages }) {
  const [images, setImages] = useState(null);
  const responsiveOptions = [
    {
      breakpoint: "991px",
      numVisible: 4,
    },
    {
      breakpoint: "575px",
      numVisible: 3,
    },
  ];

  useEffect(() => {
    if (galleryImages && galleryImages.length > 0) {
      setImages(
        galleryImages.map((src, idx) => ({
          itemImageSrc: src,
          thumbnailImageSrc: src,
          alt: `${product?.name || "Product"} view ${idx + 1}`,
        }))
      );
    } else if (product && (product.galleryImages?.length > 0 || product.imgSrc)) {
      const srcList =
        product.galleryImages && product.galleryImages.length > 0
          ? product.galleryImages
          : [product.imgSrc];
      setImages(
        srcList.map((src, idx) => ({
          itemImageSrc: src,
          thumbnailImageSrc: src,
          alt: `${product.name} view ${idx + 1}`,
        }))
      );
    } else {
      setImages(ProductSlider);
    }
  }, [product, galleryImages]);

  const itemTemplate = (item) => {
    return (
      <img
        src={item.itemImageSrc}
        alt={item.alt}
        style={{ width: "100%", display: "block" ,borderRadius:"15px"}}
      />
    );
  };

  const thumbnailTemplate = (item) => {
    return (
      <img
        src={item.thumbnailImageSrc}
        alt={item.alt}
        style={{ display: "block", width: "50px" ,marginTop:"8px",borderRadius:"5px"}}
      />
    );
  };

  return (
    <div className="card">
      <Galleria
        value={images}
        responsiveOptions={responsiveOptions}
        numVisible={5}
        style={{ maxWidth: "640px" }}
        item={itemTemplate}
        thumbnail={thumbnailTemplate}
        circular
        autoPlay
        transitionInterval={2000}
      />
    </div>
  );
}
