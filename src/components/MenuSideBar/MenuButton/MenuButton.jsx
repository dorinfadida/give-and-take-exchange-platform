import React from 'react';
import './MenuButton.css';

const MenuButton = ({ icon, text, onClick }) => {


  return (
    <div className="menu-button" onClick={onClick}>
      <span className="menu-icon">{icon}</span>
      <span className="menu-text">{text}</span>
    </div>
  );
};

export default MenuButton;
