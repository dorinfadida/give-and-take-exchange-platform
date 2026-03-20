import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import mockUserProfile from './MockUserProfile';
import ProfileHeader from './ProfileHeader/ProfileHeader';
import ProfileItemsSection from './ProfileItemsSection/ProfileItemsSection';
import AddItemModal from './AddItemModal/AddItemModal';
import MyItemModal from './MyItemModal/MyItemModal'; 
import EditProfileModal from './EditProfileModal';
import EditItemModal from './EditItemModal/EditItemModal';
import './MyProfilePage.css';
import FirebaseDataService from '../../../services/firebaseDataService';
import DataService from '../../../services/dataService';

const MyProfilePage = ({ user, onUserUpdate }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  useEffect(() => {
    if (user?.uid || user?.email) {
      setLoadingItems(true);
      const fetchItems = async () => {
        let itemsByUid = [];
        let itemsByEmail = [];
        if (user?.uid) {
          itemsByUid = await FirebaseDataService.getUserItems(user.uid);
        }
        if (user?.email) {
          itemsByEmail = await FirebaseDataService.getItemsByUserEmail(user.email);
        }
        // Combine and remove duplicates by id
        const allItems = [...itemsByUid, ...itemsByEmail].filter((item, index, self) =>
          index === self.findIndex(i => i.id === item.id)
        );
        setItems(allItems);
        setLoadingItems(false);
      };
      fetchItems();
    }
  }, [user]);

  useEffect(() => {
    if (!localUser) {
      navigate('/');
    }
  }, [localUser, navigate]);

  const handleSaveProfile = async (updatedFields) => {
    let photoURL = localUser.photoURL;
    if (updatedFields.photo && updatedFields.photo instanceof File) {
      photoURL = await FirebaseDataService.uploadProfilePhotoToStorage(localUser.uid, updatedFields.photo);
    }
    const updatedUser = {
      ...localUser,
      name: updatedFields.name,
      phone: updatedFields.phone,
      interests: updatedFields.interests,
      photoURL,
      location: updatedFields.location || updatedFields.city || '',
      lat: updatedFields.lat || null,
      lng: updatedFields.lng || null,
    };
    await FirebaseDataService.updateUser(localUser.email, updatedUser);
    setLocalUser(updatedUser);
    
    // Update global user state if callback is provided
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
    
    setIsEditProfileOpen(false);
  };

  const refreshItems = () => {
    if (localUser?.uid || localUser?.email) {
      setLoadingItems(true);
      const fetchItems = async () => {
        let itemsByUid = [];
        let itemsByEmail = [];
        if (localUser?.uid) {
          itemsByUid = await FirebaseDataService.getUserItems(localUser.uid);
        }
        if (localUser?.email) {
          itemsByEmail = await FirebaseDataService.getItemsByUserEmail(localUser.email);
        }
        const allItems = [...itemsByUid, ...itemsByEmail].filter((item, index, self) =>
          index === self.findIndex(i => i.id === item.id)
        );
        setItems(allItems);
        setLoadingItems(false);
      };
      fetchItems();
      
      // Invalidate cache to refresh main page data
      DataService.clearCache();
    }
  };

  const handleItemChanged = async () => {
    await refreshItems();
    // Refresh user from DB to update swaps count
    const updatedUser = await FirebaseDataService.getUserByEmail(localUser.email);
    if (updatedUser) setLocalUser(updatedUser);
  };

  const handleEditItem = (item) => {
    setSelectedItem(null);
    setItemToEdit(item);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setItemToEdit(null);
  };

  if (!localUser) {
    return null;
  }

  return (
    <div className="my-profile-page">
      <ProfileHeader user={localUser} onEditClick={() => setIsEditProfileOpen(true)} />
      {isEditProfileOpen && (
        <EditProfileModal user={localUser} onClose={() => setIsEditProfileOpen(false)} onSave={handleSaveProfile} />
      )}
      {loadingItems ? (
        <div className="loading-items">Loading items...</div>
      ) : (
        <ProfileItemsSection
          items={items}
          onAddItem={() => setModalOpen(true)}
          onItemClick={(item) => setSelectedItem(item)} 
        />
      )}
      {isModalOpen && <AddItemModal onClose={() => setModalOpen(false)} user={localUser} onItemAdded={refreshItems} />}
      {isEditModalOpen && (
        <EditItemModal
          onClose={handleCloseEditModal}
          user={localUser}
          item={itemToEdit}
          onItemUpdated={handleItemChanged}
        />
      )}
      {selectedItem && (
        <MyItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onItemChanged={handleItemChanged}
          onEditItem={handleEditItem}
        />
      )}
    </div>
  );
};

export default MyProfilePage;
