import React, { useState } from 'react';
import './ProfileHeader.css';
import { getProfileImageUrl, getUserDisplayName, getInitial, getColorFromName } from '../../../../utils/profileImageUtils';
import { 
  getCurrentLevel, 
  getProgressToNextLevel, 
  getLevelTooltipText 
} from '../../../../utils/gamificationUtils';

const ProfileHeader = ({ user, onEditClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const {
    location,
    swaps,
    phone,
    email,
    tags = [],
    interests = [],
  } = user;

  const finalName = getUserDisplayName(user);
  const profileImageUrl = getProfileImageUrl(user);
  const finalTags = interests.length > 0 ? interests : tags;
  const finalSwaps = typeof swaps === 'number' ? swaps : 0;
  
  // Gamification data
  const currentLevel = getCurrentLevel(finalSwaps);
  const progressToNextLevel = getProgressToNextLevel(finalSwaps);
  const tooltipText = getLevelTooltipText(finalSwaps);

  return (
    <div className="profile-header">
      <button className="edit-button" onClick={onEditClick}>
        <img src="/icons/edit_profile.svg" alt="Edit profile" />
      </button>

      <div className="profile-row">
        {/* Left section: user info */}
        <div className="left-section">
          <div className="user-info-box">
            <div className="profile-picture-container">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={finalName}
                  className={`user-profilePic ${currentLevel.borderClass}`}
                  style={{
                    '--level-icon-url': `url('${currentLevel.iconPath}')`,
                    '--sparkle-icon-url': currentLevel.sparklePath ? `url('${currentLevel.sparklePath}')` : undefined
                  }}
                />
              ) : (
                <div className={`user-profilePic ${currentLevel.borderClass}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: getColorFromName(finalName),
                  color: '#fff',
                  fontSize: '2.2rem',
                  fontWeight: 700,
                  '--level-icon-url': `url('${currentLevel.iconPath}')`,
                  '--sparkle-icon-url': currentLevel.sparklePath ? `url('${currentLevel.sparklePath}')` : undefined
                }}>
                  {getInitial(finalName)}
                </div>
              )}
            </div>
            <div className="user-info-text">
              <div className="user-name">{finalName}</div>
              <div className="user-level">
                {currentLevel.emoji} {currentLevel.title}
              </div>
              <div className="user-swaps">Made <strong>{finalSwaps}</strong> Swaps</div>
              
              {/* Progress Bar */}
              <div 
                className="progress-container"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progressToNextLevel}%` }}
                  ></div>
                </div>
                {showTooltip && (
                  <div className="level-tooltip">
                    <pre>{tooltipText}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle section: contact info */}
        <div className="middle-section">
          <div className="contact-info-box">
            <p className="contact-label">🏠 {location}</p>
            <p className="contact-label">📞 {phone}</p>
            <p className="contact-label">📧 {email}</p>
          </div>
        </div>

        {/* Right section: tags */}
        <div className="right-section">
          <div className="looking-for">
            <div className="looking-for-title">Looking for:</div>
            <div className="tag-list">
              {finalTags.map((tag, index) => (
                <div className="tag" key={index}>{tag}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;