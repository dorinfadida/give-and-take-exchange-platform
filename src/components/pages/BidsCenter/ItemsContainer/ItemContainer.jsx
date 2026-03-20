import React, { useEffect, useState } from 'react';
import { MdCompareArrows } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { BidItemCard } from './BidItemCard/BidItemCard';
import UserInfoBox from '../../ItemPage/UserInfoBox/UserInfoBox';
import BidStatusButton from '../BidStatusButton/BidStatusButton';
import DataService from '../../../../services/dataService';
import { getCurrentUser } from '../../../../services/authService';
import MyItemModal from '../../MyProfilePage/MyItemModal/MyItemModal';
import ItemPage from '../../ItemPage/ItemPage';
import './ItemsContainer.css';

const ItemContainer = ({ activeTab }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [optionIndexes, setOptionIndexes] = useState({}); // { [bidId]: currentOptionIndex }
  
  // State for managing modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMyItemModalOpen, setIsMyItemModalOpen] = useState(false);
  const [isItemPageOpen, setIsItemPageOpen] = useState(false);

  useEffect(() => {
    const fetchBids = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = getCurrentUser();
        if (!user) {
          setBids([]);
          setLoading(false);
          return;
        }
        const userId = user.uid || user.email || user.id;
        const allBids = await DataService.getBidsWithDetails();
        let filteredBids = [];
        if (activeTab === 'myBids') {
          filteredBids = allBids.filter(bid => bid.fromUserId === userId && bid.status !== 'rejected');
        } else {
          filteredBids = allBids.filter(bid => bid.toUserId === userId && bid.status !== 'rejected');
        }
        
        // מיון ההצעות מהחדשה ביותר לישנה ביותר
        filteredBids.sort((a, b) => {
          const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
          const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
          return dateB - dateA; // מיון יורד - מהחדש לישן
        });
        
        setBids(filteredBids);
      } catch (err) {
        console.error('Error loading bids:', err);
        setError('Failed to load bids');
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [activeTab]);

  const giveLabel = activeTab === 'myBids' ? 'Give' : 'Take';
  const takeLabel = activeTab === 'myBids' ? 'Take' : 'Give';

  // פונקציה שמבצעת עדכון סטטוס ל-accepted ומעדכנת את ההצעה ברשימה המקומית
  const handleAcceptBid = async (bidId) => {
    try {
      await DataService.acceptBid(bidId);
      // עדכון סטטוס ההצעה ברשימה המקומית
      setBids(prevBids =>
        prevBids.map(bid =>
          bid.id === bidId ? { ...bid, status: 'accepted' } : bid
        )
      );
      DataService.clearCache(); // אופציונלי
    } catch (err) {
      setError('Failed to accept bid');
    }
  };

  // פונקציה שמבצעת עדכון סטטוס ל-rejected ורענון ההצעות
  const handleDeclineBid = async (bidId) => {
    const confirmed = window.confirm('Are you sure you want to decline this bid?');
    if (!confirmed) return;
    
    try {
      await DataService.rejectBid(bidId);
      
      // הסר את ההצעה מהרשימה המקומית מיד
      setBids(prevBids => prevBids.filter(bid => bid.id !== bidId));
      
      // נקה את ה-cache
      DataService.clearCache();
    } catch (err) {
      console.error('Error declining bid:', err);
      setError('Failed to decline bid');
    }
  };

  // פונקציה שמבצעת מחיקת הצעה ורענון ההצעות
  const handleDeleteBid = async (bidId) => {
    const confirmed = window.confirm('Are you sure you want to delete this bid? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      await DataService.deleteBid(bidId);
      
      // הסר את ההצעה מהרשימה המקומית מיד
      setBids(prevBids => prevBids.filter(bid => bid.id !== bidId));
      
      // נקה את ה-cache
      DataService.clearCache();
    } catch (err) {
      console.error('Error deleting bid:', err);
      setError('Failed to delete bid');
    }
  };

  const handleChangeBid = (bid) => {
    // נווט לעמוד make-a-bid עם ה-itemToTake וה-bid לעריכה
    navigate(`/make-a-bid/${bid.takeItemId}`, { state: { itemToTake: bid.takeItem, editBid: bid } });
  };

  // פונקציה להחלפת אופציה
  const handleOptionChange = (bidId, direction, optionsLength) => {
    setOptionIndexes(prev => {
      const current = prev[bidId] || 0;
      let next = current + direction;
      if (next < 0) next = optionsLength - 1;
      if (next >= optionsLength) next = 0;
      return { ...prev, [bidId]: next };
    });
  };

  // פונקציה לטיפול בלחיצה על פריט
  const handleItemClick = (item, isMyItem) => {
    setSelectedItem(item);
    if (isMyItem) {
      setIsMyItemModalOpen(true);
    } else {
      setIsItemPageOpen(true);
    }
  };

  // פונקציה לקבוע אם פריט שייך למשתמש הנוכחי
  const isItemMine = (item) => {
    const currentUser = getCurrentUser();
    if (!currentUser || !item) return false;
    
    const currentUserId = currentUser.uid || currentUser.email || currentUser.id;
    const itemUserId = item.userId || item.userEmail || item.user?.email || item.user?.uid;
    
    return currentUserId === itemUserId;
  };

  // פונקציות לסגירת המודלים
  const closeMyItemModal = () => {
    setIsMyItemModalOpen(false);
    setSelectedItem(null);
  };

  const closeItemPage = () => {
    setIsItemPageOpen(false);
    setSelectedItem(null);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-text">
        <div className="loading-spinner"></div>
        Loading bids...
      </div>
    </div>
  );
  if (error) return (
    <div className="error-container">
      <div>
        <div className="error-icon">⚠️</div>
        {error}
        <br />
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    </div>
  );
  if (bids.length === 0) return (
    <div className="empty-state">
      <div>
        <div className="empty-icon">📭</div>
        No bids to show.
        <br />
        <span className="empty-subtitle">
          {activeTab === 'myBids' 
            ? 'You haven\'t sent any bids yet.' 
            : 'You haven\'t received any bids yet.'
          }
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div className="items-container-bid-center">
        {bids.map((bid) => {
          const optionsCount = bid.optionsWithDetails?.length || 0;
          const currentOptionIdx = optionIndexes[bid.id] || 0;
          
          // לוגים מפורטים
          console.log('---\nBID', bid.id, 'optionsWithDetails:', bid.optionsWithDetails);
          console.log('BID', bid.id, 'currentOptionIdx:', currentOptionIdx);
          
          // בדיקה אם יש אופציות ריקות
          if (bid.optionsWithDetails) {
            bid.optionsWithDetails.forEach((option, idx) => {
              if (!option || option.length === 0) {
                console.warn('BID', bid.id, 'Empty option at index', idx);
              }
            });
          }
          
          // קביעת הפריטים להצגה
          let giveItemToShow = null;
          if (optionsCount > 0 && bid.optionsWithDetails?.[currentOptionIdx]?.[0]) {
            giveItemToShow = bid.optionsWithDetails[currentOptionIdx][0];
          } else if (bid.giveItem) {
            giveItemToShow = bid.giveItem;
          }
          let takeItemToShow = bid.takeItem;
          
          console.log('BID', bid.id, 'giveItemToShow:', giveItemToShow);
          console.log('BID', bid.id, 'takeItemToShow:', takeItemToShow);
          
          // אם אין פריט להצגה, נדלג על הצעה זו
          if (!giveItemToShow || !takeItemToShow) {
            console.warn('BID', bid.id, 'has no item to show, skipping');
            return null;
          }
          
          return (
            <div key={bid.id} className="bid-row-bid-center">
              <div className="item-pair-bid-center">
                <span className="bid-timestamp">{bid.createdAt ? new Date(bid.createdAt.seconds ? bid.createdAt.seconds * 1000 : bid.createdAt).toLocaleString() : ''}</span>
                <div className="bid-items-section">
                  <div className="give-item-bid-center">
                    <h4 className="item-label">{giveLabel}</h4>
                    {optionsCount > 1 ? (
                      <div className="bid-slider-controls">
                        <button className="option-arrow left" onClick={() => handleOptionChange(bid.id, -1, optionsCount)}>&lt;</button>
                                            <BidItemCard 
                      item={giveItemToShow} 
                      onItemClick={handleItemClick}
                      isMyItem={isItemMine(giveItemToShow)}
                    />
                        <button className="option-arrow right" onClick={() => handleOptionChange(bid.id, 1, optionsCount)}>&gt;</button>
                      </div>
                    ) : (
                      <BidItemCard 
                        item={giveItemToShow} 
                        onItemClick={handleItemClick}
                        isMyItem={isItemMine(giveItemToShow)}
                      />
                    )}
                    {optionsCount > 1 && (
                      <div className="option-dots">
                        {bid.optionsWithDetails.map((_, idx) => (
                          <span key={idx} className={idx === currentOptionIdx ? 'dot active' : 'dot'}></span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="swap-icon-center">
                    <MdCompareArrows size={55} />
                  </div>
                  <div className="take-item-bid-center">
                    <h4 className="item-label">{takeLabel}</h4>
                                      <BidItemCard 
                    item={takeItemToShow} 
                    onItemClick={handleItemClick}
                    isMyItem={isItemMine(takeItemToShow)}
                  />
                  </div>
                </div>
                <div className="profile-bid-center">
                  <UserInfoBox user={activeTab === 'myBids' ? bid.toUser : bid.fromUser} />
                  {bid.status === 'accepted' || activeTab === 'acceptedBids' ? (
                    <div className="bid-contact-info">
                      <span className="bid-contact-title">Contact details for completing the swap:</span>
                      <span className="bid-contact-phone">
                        Phone: {activeTab === 'myBids' ? bid.toUser?.phone : bid.fromUser?.phone}
                      </span>
                      <a
                        href={`https://wa.me/${(activeTab === 'myBids' ? bid.toUser?.phone : bid.fromUser?.phone)?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-link"
                      >
                        <img src="/icons/whatsapp.svg" alt="WhatsApp" className="whatsapp-icon" />
                        WhatsApp
                      </a>
                    </div>
                  ) : (
                    <>
                      {activeTab === 'myBids' && (
                        <div className="bid-status-buttons">
                          <BidStatusButton text="Change" change icon onClick={() => handleChangeBid(bid)} />
                          <BidStatusButton text="Delete" decline icon onClick={() => handleDeleteBid(bid.id)} />
                        </div>
                      )}
                      {activeTab === 'receivedBids' && (
                        <div className="bid-status-buttons">
                          <BidStatusButton text="Accept" accept icon onClick={() => handleAcceptBid(bid.id)} />
                          <BidStatusButton text="Decline" decline icon onClick={() => handleDeclineBid(bid.id)} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Modals */}
      {isMyItemModalOpen && selectedItem && (
        <MyItemModal
          item={selectedItem}
          onClose={closeMyItemModal}
          onItemChanged={() => {
            // Refresh bids after item change
            window.location.reload();
          }}
        />
      )}
      
      {isItemPageOpen && selectedItem && (
        <ItemPage
          item={selectedItem}
          onClose={closeItemPage}
        />
      )}
    </>
  );
};

export default ItemContainer;
