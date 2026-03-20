import React, { useState } from 'react';
import './ItemCard.css';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { getProfileImageUrl, getUserDisplayName, getInitial, getColorFromName } from '../../utils/profileImageUtils';
import { getCurrentLevel } from '../../utils/gamificationUtils';

const ItemDetails = ({ name, category, listedSince = false }) => {
  return (
    <div id="item-details">
      <h2 id="item-name">{name}</h2>
      <p id="item-category">{category}</p>
      {listedSince && <p id="listed-since">{listedSince}</p>}
    </div>
  );
};

export const ItemCard = ({
  inProfile = false,
  imageUrl,
  name,
  category,
  listedSince = false,
  profileImage,
  distance,
  userName,
  userSwaps = 0,
  onClick,
  isMutualMatch = false,
  showLocation = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Create a mock user object for the utility functions
  const mockUser = {
    name: userName,
    profilePic: profileImage,
    photoURL: profileImage,
    swaps: userSwaps
  };
  
  const profileImageUrl = getProfileImageUrl(mockUser);
  const displayName = getUserDisplayName(mockUser);
  const initial = getInitial(displayName);
  const bgColor = getColorFromName(displayName);
  
  // Get user level for dynamic borders
  const finalSwaps = typeof userSwaps === 'number' ? userSwaps : 0;
  const currentLevel = getCurrentLevel(finalSwaps);

  return (
    <div id="item-card" onClick={onClick} className={isMutualMatch ? 'mutual-match-item' : ''}>
      {!inProfile && (
        <div className="upper-info">
          <div className="user-info-group">
            {profileImageUrl ? (
              <div className={`profile-image-container ${currentLevel.borderClass}-itemcard`}>
                <img src={profileImageUrl} alt={name} className="profile-image" />
              </div>
            ) : (
              <div
                className={`profile-image-container user-initial-fallback ${currentLevel.borderClass}-itemcard`}
                style={{ backgroundColor: bgColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}
              >
                {initial}
              </div>
            )}
            <p className="user-name-info">{displayName}</p>
          </div>
          {showLocation && distance && (
            <div className="location-wrapper">
              <FaMapMarkerAlt />
              <p className="distance-info">{distance}</p>
            </div>
          )}
        </div>
      )}
      {isMutualMatch && (
        <div 
          className="mutual-match-badge"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span>🤝</span>
          {showTooltip && (
            <div className="mutual-tooltip">
              <span style={{ whiteSpace: 'nowrap' }}>Mutual match!</span><br />
              You both want items from each other's categories.
            </div>
          )}
        </div>
      )}
      <div id="item-image">
        {imageUrl ? (
          <img src={imageUrl} alt={name} id="item-img" />
        ) : (
          <div id="image-placeholder">Image Placeholder</div>
        )}
      </div>
      <ItemDetails name={name} category={category} listedSince={listedSince} />
    </div>
  );
};
