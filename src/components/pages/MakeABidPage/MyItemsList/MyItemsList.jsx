// src/pages/MakeABidPage/MyItemsList/MyItemsList.jsx
import React from 'react';
import './MyItemsList.css';
import MyItemCard from '../MyItemCard/MyItemCard';

const MyItemsList = ({ items, selectedItemIds, onSelectItem }) => {
  return (
    <div className="my-items-list">
      {items.map(item => (
        <MyItemCard
          key={item.id}
          item={item}
          isSelected={selectedItemIds.includes(item.id)}
          onClick={() => onSelectItem(item.id)}
        />
      ))}
    </div>
  );
};

export default MyItemsList;
