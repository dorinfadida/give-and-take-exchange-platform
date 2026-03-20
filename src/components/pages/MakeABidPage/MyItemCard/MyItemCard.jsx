// src/pages/MakeABidPage/MyItemCard/MyItemCard.jsx
import React from 'react';
import './MyItemCard.css';

const MyItemCard = ({ item, isSelected, onClick }) => {
  return (
    <div
      className={`my-item-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <img src={item.imageUrl} alt={item.name} className="my-item-image" />
      <div className="my-item-info">
        <div className="my-item-name">{item.name}</div>
        <div className="my-item-category">{item.category}</div>
      </div>
    </div>
  );
};

export default MyItemCard;