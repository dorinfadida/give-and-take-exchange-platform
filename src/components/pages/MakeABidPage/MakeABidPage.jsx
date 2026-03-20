// src/pages/MakeABidPage/MakeABidPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './MakeABidPage.css';
import FirebaseDataService from '../../../services/firebaseDataService';
import ItemToTakeCard from './ItemToTakeCard/ItemToTakeCard';
import MyItemsList from './MyItemsList/MyItemsList';
import SelectionBox from './SelectionBox/SelectionBox';
import MakeBidButton from './MakeBidButton/MakeBidButton';
import LookingForTags from '../ItemPage/LookingForTags/LookingForTags';

const MakeABidPage = ({ user }) => {
  const { state } = useLocation();
  const itemToTake = state?.itemToTake;
  const editBid = state?.editBid;

  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [ownerProfile, setOwnerProfile] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      FirebaseDataService.getUserItems(user.uid).then(items => {
        console.log('Loaded userItems:', items);
        setUserItems(items);
        
        // טיפול בעריכת הצעה קיימת
        if (editBid) {
          if (editBid.options && Array.isArray(editBid.options)) {
            // המבנה החדש - options
            const allSelectedIds = editBid.options.flat();
            setSelectedItemIds(allSelectedIds);
          } else if (editBid.giveItemId) {
            // המבנה הישן - giveItemId
            setSelectedItemIds([editBid.giveItemId]);
          }
        }
      });
    }
  }, [user, editBid]);

  useEffect(() => {
    async function fetchOwnerProfile() {
      console.log('itemToTake:', itemToTake);
      const email = itemToTake?.userEmail || itemToTake?.user?.email;
      if (email) {
        console.log('Fetching owner by email:', email);
        const profile = await FirebaseDataService.getUserByEmail(email);
        console.log('Fetched ownerProfile:', profile);
        setOwnerProfile(profile);
      } else {
        setOwnerProfile(null);
      }
    }
    fetchOwnerProfile();
  }, [itemToTake]);

  const handleSelectItem = (itemId) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const selectedItems = userItems.filter(item => selectedItemIds.includes(item.id));

  if (!itemToTake) {
    return <div className="make-a-bid-page">Item not found.</div>;
  }

  return (
    <div className="make-a-bid-page">
      <div className="bid-content">
        <div className="left-column">
          <h3>Take</h3>
          <ItemToTakeCard item={itemToTake} />

          <h3>Give (Select one or more items)</h3>
          <div className="looking-for-wrapper">
            <LookingForTags tags={ownerProfile?.interests || ownerProfile?.lookingFor || []} />
          </div>
          <SelectionBox selectedItems={selectedItems} />

          <MakeBidButton selectedItems={selectedItems} itemToTake={itemToTake} user={user} editBid={editBid} />
        </div>

        <div className="right-column">
          <h3>Your Items</h3>
          <MyItemsList
            items={userItems}
            selectedItemIds={selectedItemIds}
            onSelectItem={handleSelectItem}
          />
        </div>
      </div>
    </div>
  );
};

export default MakeABidPage;