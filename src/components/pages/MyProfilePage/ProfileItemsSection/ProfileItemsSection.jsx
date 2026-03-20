// src/pages/MyProfilePage/ProfileItemsSection/ProfileItemsSection.jsx

import React from 'react';
import { ItemCard } from '../../../ItemCard/ItemCard';
import './ProfileItemsSection.css';

const ProfileItemsSection = ({ onAddItem, onItemClick, items }) => {
  return (
    <div className="profile-items-section">
      <div className="section-header">
        <h2 className="section-title">Ready to Give</h2>
        <button className="add-item-button" onClick={onAddItem}>
          <img src="/icons/plus-square.svg" alt="Add item" />
        </button>
      </div>
      <div className="items-grid">
        {items && items.length > 0 ? (
          items.map((item, i) => (
            <ItemCard key={item.id || i} inProfile={true} name={item.name} category={item.category} imageUrl={item.imageUrl} listedSince={item.listedsince} onClick={() => onItemClick(item)} />
          ))
        ) : (
          <div style={{textAlign: 'left', width: '100%', color: '#888', marginTop: '20px'}}>
            You don't have any items yet. Add your first one!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileItemsSection;
