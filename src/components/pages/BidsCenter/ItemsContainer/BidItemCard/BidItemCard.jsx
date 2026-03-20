import React from 'react';
import './BidItemCard.css';
// import { mockBids } from '../MockBids';
// import { mockItem } from '../../../ItemPage/MockItem';

export const BidItemCard = ({ item, onItemClick, isMyItem }) => {
  if (!item) {
    console.warn('BidItemCard: item not found or undefined!', item);
    return <div className="bid-item-card">Item not found</div>;
  }
  console.log('BidItemCard: rendering item', { id: item.id, name: item.name, imageUrl: item.imageUrl, item });
  const { name, category, image, imageUrl, images } = item;

  // בחר תמונה: ראשית מהמערך, אם לא קיים אז imageUrl, אם לא קיים אז image
  const displayImage =
    (Array.isArray(images) && images.length > 0 && images[0]) ||
    imageUrl ||
    image;

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item, isMyItem);
    }
  };

  return (
    <div className="bid-item-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="bid-item-image">
        {displayImage ? (
          <img src={displayImage} alt={name} className="bid-img" />
        ) : (
          <div className="bid-image-placeholder">No Image</div>
        )}
      </div>
      <div className="bid-item-details">
        <h4 className="bid-item-name">{name}</h4>
        <p className="bid-item-category">{category}</p>
      </div>
    </div>
  );
};

export default BidItemCard;
