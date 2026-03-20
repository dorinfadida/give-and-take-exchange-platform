// Updated SearchBar.jsx
import React, { useState, useRef } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import FilterComponent from './FilterComponent/FilterComponent';
import { useClickOutside } from '../../../../hooks/useClickOutside';
import './Search.css';

export const SearchBar = ({ search, setSearch, selectedDistance, setSelectedDistance, selectedInterests, setSelectedInterests, onApply, userInterests }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [draftDistance, setDraftDistance] = useState(selectedDistance || '');
  const [draftInterests, setDraftInterests] = useState(selectedInterests || []);
  const filterRef = useRef(null);

  const toggleFilters = () => {
    setDraftDistance(selectedDistance || ''); // Reset draft to current on open
    setDraftInterests(selectedInterests || []);
    setShowFilters(prev => !prev);
  };

  useClickOutside(filterRef, () => {
    if (showFilters) {
      setShowFilters(false);
    }
  });

  const handleApply = () => {
    setShowFilters(false);
    if (onApply) onApply(draftDistance, draftInterests);
  };

  return (
    <div className="search-wrapper" ref={filterRef}>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search"
          className="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <FaFilter className="filter-icon" onClick={toggleFilters} />
        <FaSearch className="search-icon" />
      </div>

      {showFilters && (
        <div className="search-options">
          <FilterComponent
            selectedDistance={draftDistance}
            onDistanceChange={setDraftDistance}
            selectedInterests={draftInterests}
            onInterestsChange={setDraftInterests}
            userInterests={userInterests}
            onApply={handleApply}
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
