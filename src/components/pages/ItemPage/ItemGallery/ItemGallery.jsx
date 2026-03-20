// components/pages/ItemPage/ItemGallery/ItemGallery.jsx
import React, { useState } from 'react';
import './ItemGallery.css';

export default function ItemGallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!Array.isArray(images) || images.length === 0) {
    return (
      <div className="gallery no-images">
        <div className="main-image-container">
          <div className="main-image placeholder">No images available</div>
        </div>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="gallery">
      <div className="main-image-container">
        <button onClick={handlePrev} className="arrow-button arrow-left">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <img
          src={images[currentIndex]}
          alt={`Preview ${currentIndex}`}
          className="main-image"
        />
        <button onClick={handleNext} className="arrow-button arrow-right">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

      <div className="thumbnails">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index}`}
            className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleThumbnailClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
