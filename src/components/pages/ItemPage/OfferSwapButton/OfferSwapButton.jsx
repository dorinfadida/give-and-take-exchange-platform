import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OfferSwapButton.css';

const OfferSwapButton = ({ item }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/make-a-bid/${item.id}`, { state: { itemToTake: item } });
  };

  return (
    <button className="offer-swap-button" onClick={handleClick}>
      Offer a Swap
    </button>
  );
};

export default OfferSwapButton;
