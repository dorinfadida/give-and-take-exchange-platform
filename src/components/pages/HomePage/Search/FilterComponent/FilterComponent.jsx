import React, { useEffect, useRef } from 'react';
import { categoryGroups } from './filterOptions';
import './FilterComponent.css';

export const FilterComponent = ({ selectedDistance, onDistanceChange, selectedInterests, onInterestsChange, userInterests, onApply }) => {
  const sliderRef = useRef(null);

  const handleCategoryClick = (option) => {
    if (selectedInterests.includes(option)) {
      onInterestsChange(selectedInterests.filter(cat => cat !== option));
    } else {
      onInterestsChange([...selectedInterests, option]);
    }
  };

  const handleDistanceChange = (e) => {
    const value = e.target.value;
    onDistanceChange(value === "0" ? "" : value);
  };

  const getDistanceLabel = (value) => {
    if (!value || value === "0") return "Any Distance";
    return `${value} km`;
  };

  // Update slider track color based on current value
  useEffect(() => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const value = selectedDistance || "0";
      const percentage = (parseInt(value) / 100) * 100;
      
      // For vertical slider, we need to adjust the gradient direction
      // Since the slider is rotated -90deg, we need to use 'to right' for correct vertical progression
      slider.style.background = `linear-gradient(to right, #2a9c64 0%, #2a9c64 ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
    }
  }, [selectedDistance]);

  const handleApply = () => {
    if (onApply) onApply();
  };

  const handleClear = () => {
    onInterestsChange([]);
    onDistanceChange("");
  };

  return (
    <div className="filter-bar two-col-filter-bar">
      <div className="filter-content">
        <div className="filter-left">
          <div className="filter-text category-title">Category</div>
          <div className="category-list">
            {categoryGroups.map((group) => (
              <div key={group.label} className="dropdown-group">
                <div className="dropdown-group-label">{group.label}</div>
                {group.options.map((option) => (
                  <div
                    key={option}
                    className={`dropdown-option${selectedInterests.includes(option) ? ' selected' : ''}`}
                    onClick={() => handleCategoryClick(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="filter-right">
          <div className="filter-text distance-title">Distance</div>
          <div className="vertical-slider-container">
            <input
              ref={sliderRef}
              type="range"
              min="0"
              max="100"
              step="10"
              value={selectedDistance || "0"}
              onChange={handleDistanceChange}
              className="vertical-distance-slider"
              orient="vertical"
            />
            <div className="distance-label">{getDistanceLabel(selectedDistance)}</div>
          </div>
        </div>
      </div>
      <div className="filter-buttons">
        <button className="clear-button" onClick={handleClear}>
          Clear
        </button>
        <button className="apply-button" onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterComponent;
