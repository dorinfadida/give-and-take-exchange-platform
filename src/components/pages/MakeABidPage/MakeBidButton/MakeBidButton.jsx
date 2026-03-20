// src/pages/MakeABidPage/MakeBidButton/MakeBidButton.jsx
import React, { useState } from 'react';
import './MakeBidButton.css';
import dataService from '../../../../services/dataService';
import FirebaseDataService from '../../../../services/firebaseDataService';
import { useNavigate } from 'react-router-dom';

const MakeBidButton = ({ selectedItems, itemToTake, user, editBid }) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBid = async () => {
    if (selectedItems.length === 0 || !user) return;
    
    console.log('=== DEBUG INFO ===');
    console.log('selectedItems:', selectedItems);
    console.log('user:', user);
    console.log('itemToTake:', itemToTake);
    console.log('itemToTake.userId:', itemToTake.userId);
    console.log('itemToTake.user:', itemToTake.user);
    console.log('itemToTake.user?.uid:', itemToTake.user?.uid);
    console.log('itemToTake.userEmail:', itemToTake.userEmail);
    console.log('itemToTake.user?.email:', itemToTake.user?.email);
    console.log('All itemToTake keys:', Object.keys(itemToTake));
    console.log('dataService available:', !!dataService);
    console.log('dataService.createBid available:', !!dataService.createBid);
    console.log('FirebaseDataService available:', !!FirebaseDataService);
    console.log('FirebaseDataService.getUserByEmail available:', !!FirebaseDataService.getUserByEmail);
    
    // בדיקה שהכל עובד
    try {
      const testItems = await FirebaseDataService.getAllItems();
      console.log('Firebase connection test - items count:', testItems.length);
    } catch (firebaseError) {
      console.error('Firebase connection test failed:', firebaseError);
    }
    
    // ניסיון לקבל את ה-toUserId במספר דרכים שונות
    let toUserId = itemToTake.userId || itemToTake.user?.uid;
    
    // אם אין userId, ננסה לקבל אותו מה-userEmail
    if (!toUserId && itemToTake.userEmail) {
      try {
        const userByEmail = await FirebaseDataService.getUserByEmail(itemToTake.userEmail);
        toUserId = userByEmail?.uid;
        console.log('Found user by email:', userByEmail);
      } catch (error) {
        console.error('Error getting user by email:', error);
      }
    }
    
    // אם עדיין אין toUserId, ננסה מה-user.email
    if (!toUserId && itemToTake.user?.email) {
      try {
        const userByEmail = await FirebaseDataService.getUserByEmail(itemToTake.user.email);
        toUserId = userByEmail?.uid;
        console.log('Found user by user.email:', userByEmail);
      } catch (error) {
        console.error('Error getting user by user.email:', error);
      }
    }
    
    console.log('Final toUserId:', toUserId);
    console.log('==================');
    
    if (!toUserId) {
      setSuccessMsg('Item owner not found. Please try again.');
      return;
    }
    setLoading(true);
    try {
      const takeItemId = itemToTake.id;
      
      // יצירת אופציות - כל פריט נבחר הוא אופציה נפרדת
      const options = selectedItems.map(item => ({ items: [item.id] }));
      
      console.log('Creating bid with:', {
        takeItemId,
        options,
        fromUserId: user.uid,
        toUserId
      });
      
      if (editBid && editBid.id) {
        // עדכון הצעה קיימת
        console.log('Updating existing bid:', editBid.id);
        try {
          await dataService.updateBid(editBid.id, { 
            options, 
            takeItemId, 
            updatedAt: new Date() 
          });
          setSuccessMsg('Bid updated successfully!');
        } catch (updateError) {
          console.error('Error updating bid:', updateError);
          throw updateError;
        }
      } else {
        // יצירת הצעה חדשה
        console.log('Creating new bid');
        try {
          await dataService.createBid(takeItemId, options, user.uid, toUserId);
          setSuccessMsg('Bid sent successfully!');
        } catch (createError) {
          console.error('Error creating bid:', createError);
          throw createError;
        }
      }
      setTimeout(() => {
        navigate('/bids-center');
      }, 1500);
    } catch (error) {
      console.error('Error in handleBid:', error);
      setSuccessMsg(`Error sending bid: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="make-bid-button"
        onClick={handleBid}
        disabled={selectedItems.length === 0 || loading}
      >
        {loading ? 'Sending...' : (editBid ? 'Update Bid' : 'Make a Bid')}
      </button>
      {successMsg && (
        <div style={{ marginTop: 10, color: 'green', fontWeight: 'bold' }}>{successMsg}</div>
      )}
    </div>
  );
};

export default MakeBidButton;