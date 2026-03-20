import React, { useState } from 'react';
import './MyItemModal.css';
import ItemDetails from '../../ItemPage/ItemDetails/ItemDetails';
import ItemGallery from '../../ItemPage/ItemGallery/ItemGallery';
import FirebaseDataService from '../../../../services/firebaseDataService';
import DataService from '../../../../services/dataService';

const MyItemModal = ({ item, onClose, onItemChanged, onEditItem }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this item? This action cannot be undone.');
    if (!confirmed) return;
    setIsProcessing(true);
    await FirebaseDataService.deleteItem(item.id);
    
    // Invalidate cache to refresh main page data
    DataService.clearCache();
    
    setIsProcessing(false);
    if (onItemChanged) await onItemChanged();
    onClose();
  };

  const handleTaken = async () => {
    setIsProcessing(true);
    await FirebaseDataService.deleteItem(item.id);
    // Increment swaps for the user (by email)
    const user = await FirebaseDataService.getUserByEmail(item.userEmail || item.user?.email);
    if (user) {
      await FirebaseDataService.updateUser(user.email, { swaps: (user.swaps || 0) + 1 });
    }
    
    // Invalidate cache to refresh main page data
    DataService.clearCache();
    
    setIsProcessing(false);
    if (onItemChanged) await onItemChanged();
    onClose();
  };

  const handleEdit = () => {
    if (onEditItem) onEditItem(item);
  };

  return (
    <div className="my-item-overlay" onClick={onClose}>
      <div className="my-item-window" onClick={(e) => e.stopPropagation()}>
        <button className="close-button-my-item" onClick={onClose}>×</button>
        <div className="my-item-grid">
            <div className="item-details-wrapper">
                <ItemDetails
                    name={item.name}
                    category={item.category}
                    description={item.description}
                    story={item.story}
                    attributes={item.attributes}
                    isModalView={true}
                />
                <div className="my-item-actions">
                    <button className="taken-btn" onClick={handleTaken} disabled={isProcessing}>Taken</button>
                    <button className="edit-item-button" onClick={handleEdit} disabled={isProcessing}>
                        <img src="/icons/edit_item.svg" alt="Edit" />
                    </button>
                    <button className="delete-btn" onClick={handleDelete} disabled={isProcessing}>Delete item</button>
                </div>
            </div>
            <div className="gallery-wrapper">
                <ItemGallery images={[item.imageUrl, ...(item.images?.filter(img => img !== item.imageUrl) || [])]} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default MyItemModal;
