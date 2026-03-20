import React, { useState } from 'react';
import ButtonsContainer from './ButtonsContainer/ButtonsContainer';
import ItemContainer from './ItemsContainer/ItemContainer';
import './BidsCenter.css';

const BidsCenter = () => {
  const [activeTab, setActiveTab] = useState('receivedBids');

  return (
    <div className="bids-center-wrapper">
      <h2 className="bids-headline">Bid Activity Center</h2>
      <h3 className="bids-subheadline">
        Scroll and Check the status of your sent and received bids!
      </h3>

      <ButtonsContainer onTabChange={setActiveTab} />

      <ItemContainer activeTab={activeTab} />
    </div>
  );
};

export default BidsCenter;