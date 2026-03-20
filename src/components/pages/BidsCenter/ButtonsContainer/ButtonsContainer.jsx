import React, { useState } from 'react';
import BidsButton from './Button/Button';
import './ButtonsContainer.css';

export const ButtonsContainer = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('receivedBids');

  const handleClick = (tab) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <div className="bids-button-container">
      <BidsButton
        text="Received Bids"
        clicked={activeTab === 'receivedBids'}
        onClick={() => handleClick('receivedBids')}
      />
      <BidsButton
        text="My Bids"
        clicked={activeTab === 'myBids'}
        onClick={() => handleClick('myBids')}
      />
    </div>
  );
};

export default ButtonsContainer;