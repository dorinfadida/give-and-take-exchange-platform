// components/pages/ItemPage/UserInfoBox/UserInfoBox.jsx
import React from 'react';
import './UserInfoBox.css';
import { getProfileImageUrl, getUserDisplayName, getInitial, getColorFromName } from '../../../../utils/profileImageUtils';
import { getCurrentLevel } from '../../../../utils/gamificationUtils';

export default function UserInfoBox({ user }) {
  const profileImageUrl = getProfileImageUrl(user);
  const displayName = getUserDisplayName(user);
  const initial = getInitial(displayName);
  const bgColor = getColorFromName(displayName);
  
  // Get user level for dynamic borders
  const finalSwaps = typeof user?.swaps === 'number' ? user.swaps : 0;
  const currentLevel = getCurrentLevel(finalSwaps);

  return (
    <div className="user-info-box-itempage">
      {profileImageUrl ? (
        <div className={`profile-picture-container-itempage ${currentLevel.borderClass}`}>
          <img 
            className="user-profilePic-itempage" 
            src={profileImageUrl} 
            alt="Profile"
          />
        </div>
      ) : (
        <div
          className={`profile-picture-container-itempage user-initial-fallback ${currentLevel.borderClass}`}
          style={{ 
            backgroundColor: bgColor, 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 28, 
            fontWeight: 700
          }}
        >
          {initial}
        </div>
      )}
      <div className="user-info-text-itempage">
        <div className="user-name-itempage">{displayName}</div>
        <div className="user-location-itempage">{user.location}</div>
        <div className="user-level-itempage">
          <span className="level-emoji">{currentLevel.emoji}</span>
          <span className="level-title">{currentLevel.title}</span>
        </div>
        <div className="user-swaps-itempage">
          Made <span className="swaps-count-itempage">{user.swaps}</span> Swaps
        </div>
      </div>
    </div>
  );
}
