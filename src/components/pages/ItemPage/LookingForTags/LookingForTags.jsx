// components/pages/ItemPage/LookingForTags/LookingForTags.jsx
import React from 'react';
import './LookingForTags.css';

export default function LookingForTags({ tags }) {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  return (
    <div className="looking-for">
      <div className="looking-for-title">Looking for:</div>
      <div className="tag-list">
        {tags.map((tag, index) => (
          <div key={index} className="tag">
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
}
