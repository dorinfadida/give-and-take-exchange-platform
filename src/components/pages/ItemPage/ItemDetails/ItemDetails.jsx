import React, { useState } from 'react';
import './ItemDetails.css';

export default function ItemDetails({ category, name, description, story, attributes }) {
  const [activeTab, setActiveTab] = useState('description');

  // Helper function to render attributes
  const renderAttributes = () => {
    if (!attributes || Object.keys(attributes).length === 0) {
      return <p className="no-details">No additional details available.</p>;
    }

    return (
      <div className="attributes-container">
        {Object.entries(attributes).map(([key, value]) => (
          <div key={key} className="attribute-item">
            <span className="attribute-label">{key}:</span>
            <span className="attribute-value">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="item-details-itemPage">
      <h2 className="item-name-itemPage">{name}</h2>
      <p className="item-category-itemPage">{category}</p>

      <div className="tabs-wrapper">
        <button
          className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
          onClick={() => setActiveTab('description')}
        >
          Description
        </button>
        <button
          className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
      </div>

      <div className="item-description-box-itemPage">
        {activeTab === 'description' ? (
          <p className="item-description-itemPage">
            {description || 'No description available.'}
          </p>
        ) : (
          renderAttributes()
        )}
      </div>
    </div>
  );
}
