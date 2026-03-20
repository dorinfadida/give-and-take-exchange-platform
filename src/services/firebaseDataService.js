import { db } from '../firebase';
import { storage } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  deleteDoc,
  getDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Mock data imports
// import { mockItem } from '../components/pages/ItemPage/MockItem';
// import mockUserProfile from '../components/pages/MyProfilePage/MockUserProfile';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  ITEMS: 'items',
  SWAPS: 'swaps',
  USER_ITEMS: 'userItems'
};

/**
 * Service for managing Firebase data operations
 */
class FirebaseDataService {
 
  /**
   * Get all items
   */
  async getAllItems() {
    const itemsRef = collection(db, COLLECTIONS.ITEMS);
    const snapshot = await getDocs(itemsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get item by ID
   */
  async getItemById(itemId) {
    const itemRef = doc(db, COLLECTIONS.ITEMS, itemId);
    const itemDoc = await getDoc(itemRef);
    if (itemDoc.exists()) {
      return { id: itemDoc.id, ...itemDoc.data() };
    }
    return null;
  }

  /**
   * Get items by user ID
   */
  async getItemsByUserId(userId) {
    const itemsRef = collection(db, COLLECTIONS.ITEMS);
    const q = query(itemsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get all bids
   */
  async getAllBids() {
    const swapsRef = collection(db, COLLECTIONS.SWAPS);
    const snapshot = await getDocs(swapsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get bid by ID
   */
  async getBidById(bidId) {
    const swapRef = doc(db, COLLECTIONS.SWAPS, bidId);
    const swapDoc = await getDoc(swapRef);
    if (swapDoc.exists()) {
      return { id: swapDoc.id, ...swapDoc.data() };
    }
    return null;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('uid', '==', userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  }

  /**
   * Add new item
   */
  async addItem(itemData) {
    const itemsRef = collection(db, COLLECTIONS.ITEMS);
    const docRef = await addDoc(itemsRef, {
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  /**
   * Update item
   */
  async updateItem(itemId, updateData) {
    const itemRef = doc(db, COLLECTIONS.ITEMS, itemId);
    await updateDoc(itemRef, {
      ...updateData,
      updatedAt: new Date()
    });
  }

  /**
   * Delete item
   */
  async deleteItem(itemId) {
    const itemRef = doc(db, COLLECTIONS.ITEMS, itemId);
    await deleteDoc(itemRef);
  }

  /**
   * Add new bid
   */
  async addBid(bidData) {
    const swapsRef = collection(db, COLLECTIONS.SWAPS);
    const docRef = await addDoc(swapsRef, {
      ...bidData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  /**
   * Update bid status
   */
  async updateBidStatus(bidId, status) {
    const swapRef = doc(db, COLLECTIONS.SWAPS, bidId);
    await updateDoc(swapRef, {
      status,
      updatedAt: new Date()
    });
  }

  /**
   * Get all items for a user by userId (uid)
   */
  async getUserItems(userId) {
    const itemsRef = collection(db, COLLECTIONS.ITEMS);
    const q = query(itemsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Add user to Firestore if not exists
   */
  async addUserIfNotExists(user) {
    const email = (user.email || '').toLowerCase();
    if (!email) throw new Error('Email is required to create user document');
    const userRef = doc(db, COLLECTIONS.USERS, email);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      const userData = {
        name: user.displayName || user.name || '',
        email,
        photoURL: user.photoURL || user.photo || '',
        phone: user.phoneNumber || user.phone || '',
        interests: user.interests || [],
        swaps: 0,
        tags: user.tags || [],
        location: user.location || '',
        lat: user.lat || null,
        lng: user.lng || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        uid: user.uid
      };
      await setDoc(userRef, userData);
      return userData;
    } else {
      return userDoc.data();
    }
  }

  /**
   * Upload profile photo to Firebase Storage and return URL
   */
  async uploadProfilePhotoToStorage(uid, file) {
    const storageRef = ref(storage, `profile_photos/${uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('email', '==', (email || '').toLowerCase()));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  }

  /**
   * Update user profile by email
   */
  async updateUser(email, updateData) {
    const userEmail = (email || '').toLowerCase();
    const userRef = doc(db, COLLECTIONS.USERS, userEmail);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: new Date()
    });
  }

  /**
   * Upload multiple images to Firebase Storage and return array of URLs
   */
  async uploadMultipleImagesToStorage(uid, files) {
    const urls = [];
    for (const file of files) {
      const storageRef = ref(storage, `item_images/${uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  }

  /**
   * Get items by user email
   */
  async getItemsByUserEmail(userEmail) {
    const itemsRef = collection(db, COLLECTIONS.ITEMS);
    const q = query(itemsRef, where('userEmail', '==', userEmail));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Update bid (swap) by ID
   */
  async updateBid(bidId, updateData) {
    const swapRef = doc(db, COLLECTIONS.SWAPS, bidId);
    await updateDoc(swapRef, {
      ...updateData,
      updatedAt: new Date()
    });
  }

  /**
   * Delete bid (swap) by ID
   */
  async deleteBid(bidId) {
    const swapRef = doc(db, COLLECTIONS.SWAPS, bidId);
    await deleteDoc(swapRef);
  }

  /**
   * Get all users in a single query
   */
  async getAllUsers() {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get users by IDs in batch
   */
  async getUsersByIds(userIds) {
    if (!userIds || userIds.length === 0) return [];
    
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('uid', 'in', userIds));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get items by IDs in batch
   */
  async getItemsByIds(itemIds) {
    if (!itemIds || itemIds.length === 0) return [];
    
    const itemsRef = collection(db, COLLECTIONS.ITEMS);
    const q = query(itemsRef, where('__name__', 'in', itemIds));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

const instance = new FirebaseDataService();
export default instance; 