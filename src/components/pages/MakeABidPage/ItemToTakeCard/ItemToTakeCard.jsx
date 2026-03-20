// src/pages/MakeABidPage/ItemToTakeCard/ItemToTakeCard.jsx
import React from 'react';
import './ItemToTakeCard.css';
// import { itemToTake } from '../mockData';

const ItemToTakeCard = ({ item }) => {
  return (
    <div className="item-to-take-card">
      <div className="item-left">
        <div className="item-name">{item.name}</div>
        <div className="item-category">{item.category}</div>
        <div className="item-description">{item.description}</div>
      </div>
      <img className="item-image" src={item.imageUrl} alt={item.name} />
    </div>
  );
};

export default ItemToTakeCard;
