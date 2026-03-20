// src/pages/MakeABidPage/SelectionBox/SelectionBox.jsx
import React from 'react';
import './SelectionBox.css';

const SelectionBox = ({ selectedItems }) => {
  return (
    <div className="selection-box">
      {selectedItems.length > 0 ? (
        <div className="selected-items-grid">
          {selectedItems.map((item, idx) => (
            <div className="selected-item-preview" key={item.id}>
              <img src={item.imageUrl} alt={item.name} className="selected-item-image" />
              <div className="selected-item-info">
                <div className="selected-item-name">{item.name}</div>
                <div className="selected-item-category">{item.category}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="selection-placeholder">
          Choose one or more items from the list to offer in exchange.
        </div>
      )}
    </div>
  );
};

export default SelectionBox;
