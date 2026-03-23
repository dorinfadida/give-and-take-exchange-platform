import React, { useState, useRef } from "react";
import "./ToolBar.css";
import { FaBars } from "react-icons/fa";
import { MdNotifications } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import SearchBar from '../pages/HomePage/Search/Search';
import NotificationsWindow from "../common/NotificationsWindow/NotificationsWindow";
import { useClickOutside } from "../../hooks/useClickOutside";
import { getProfileImageUrl, getUserDisplayName, getInitial, getAvatarFallbackColor } from '../../utils/profileImageUtils';
import { getCurrentLevel } from '../../utils/gamificationUtils';

const ToolBar = ({ toggleMenu, isSignedIn, onSignUpClick, onSignInClick, user, search, setSearch, selectedDistance, setSelectedDistance, selectedInterests, setSelectedInterests, onApply, userInterests }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef();

  useClickOutside(notificationsRef, () => setShowNotifications(false));

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Get profile image and display name
  const profileImageUrl = getProfileImageUrl(user);
  const displayName = getUserDisplayName(user);
  const initial = getInitial(displayName);
  const bgColor = getAvatarFallbackColor(user);
  
  // Get user level for dynamic borders
  const finalSwaps = typeof user?.swaps === 'number' ? user.swaps : 0;
  const currentLevel = getCurrentLevel(finalSwaps);

  const mockNotifications = [
    { id: 1, message: "You have a new bid proposal for 'Vintage Camera' from John Doe.", time: "5 minutes ago" },
    { id: 2, message: "Your offer for 'Classic Leather Jacket' has been accepted!", time: "1 hour ago" },
  ];

  return (
    <header className="toolbar">
      <div className="logo-container">
        <a href="/" className="logo-link">
          <img src="/transLogo.png" alt="Logo" className="logo large-logo" />
        </a>
      </div>

      <div className="toolbar-search-center">
        <SearchBar 
          search={search} 
          setSearch={setSearch} 
          selectedDistance={selectedDistance} 
          setSelectedDistance={setSelectedDistance} 
          selectedInterests={selectedInterests} 
          setSelectedInterests={setSelectedInterests} 
          onApply={onApply} 
          userInterests={userInterests}
        />
      </div>

      {isSignedIn && user ? (
        <div className="icons-container">
          {profileImageUrl ? (
            <div
              className={`profile-image-toolbar ${currentLevel.borderClass}-toolbar`}
              onClick={() => handleNavigate("/profile")}
              style={{
                width: 40,
                height: 40
              }}
            >
              <img
                src={profileImageUrl}
                alt="Your Profile"
                className="profile-image-toolbar-img"
              />
            </div>
          ) : (
            <div
              className={`profile-image-toolbar profile-placeholder-toolbar ${currentLevel.borderClass}-toolbar`}
              onClick={() => handleNavigate("/profile")}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: bgColor,
                color: '#fff',
                fontSize: '1.7rem',
                fontWeight: 700,
                width: 40,
                height: 40,
                borderRadius: '50%',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              {initial}
            </div>
          )}
          <div className="notification-container" ref={notificationsRef}>
            <MdNotifications className="toolbar-bell-icon" onClick={() => setShowNotifications(!showNotifications)} />
            {showNotifications && <NotificationsWindow notifications={mockNotifications} />}
          </div>
          <FaBars className="toolbar-menu-icon" onClick={toggleMenu} />
        </div>
      ) : (
        <div className="auth-buttons-container">
          <button className="auth-button" onClick={onSignInClick}>Sign In</button>
          <button className="auth-button" onClick={onSignUpClick}>Sign Up</button>
        </div>
      )}
    </header>
  );
};

export default ToolBar;