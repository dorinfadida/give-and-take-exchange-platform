import FirebaseDataService from './firebaseDataService';

// Simple cache for performance
const cache = {
  items: null,
  bids: null,
  lastFetch: { items: 0, bids: 0 }
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * High-level data service for the application
 */
class DataService {
  
  /**
   * Check if cache is valid
   */
  _isCacheValid(type) {
    return cache[type] && (Date.now() - cache.lastFetch[type]) < CACHE_DURATION;
  }

  /**
   * Clear cache
   */
  clearCache() {
    cache.items = null;
    cache.bids = null;
    cache.lastFetch.items = 0;
    cache.lastFetch.bids = 0;
  }

  /**
   * Get all items with user information
   */
  async getItemsWithUsers() {
    try {
      // Check cache first
      if (this._isCacheValid('items')) {
        return cache.items;
      }

      const items = await FirebaseDataService.getAllItems();
      
      // Collect all unique user IDs and emails
      const userIds = new Set();
      const userEmails = new Set();
      
      items.forEach(item => {
        if (item.userId) userIds.add(item.userId);
        if (item.userEmail) userEmails.add(item.userEmail);
      });
      
      // Fetch all users in batch
      const allUsers = await FirebaseDataService.getAllUsers();
      
      // Create lookup maps
      const usersById = new Map();
      const usersByEmail = new Map();
      
      allUsers.forEach(user => {
        if (user.uid) usersById.set(user.uid, user);
        if (user.email) usersByEmail.set(user.email.toLowerCase(), user);
      });
      
      // Attach users to items
      const itemsWithUsers = items.map(item => {
        let user = null;
        if (item.userId) {
          user = usersById.get(item.userId);
        }
        if (!user && item.userEmail) {
          user = usersByEmail.get(item.userEmail.toLowerCase());
        }
        return { ...item, user };
      });
      
      // Cache the result
      cache.items = itemsWithUsers;
      cache.lastFetch.items = Date.now();
      
      return itemsWithUsers;
    } catch (error) {
      console.error('Error getting items with users:', error);
      throw error;
    }
  }

  /**
   * Get bids with full item and user information
   */
  async getBidsWithDetails() {
    try {
      // Check cache first
      if (this._isCacheValid('bids')) {
        return cache.bids;
      }

      const bids = await FirebaseDataService.getAllBids();
      
      // Collect all unique IDs
      const itemIds = new Set();
      const userIds = new Set();
      
      bids.forEach(bid => {
        if (bid.takeItemId) itemIds.add(bid.takeItemId);
        if (bid.fromUserId) userIds.add(bid.fromUserId);
        if (bid.toUserId) userIds.add(bid.toUserId);
        
        // טיפול במבנה החדש - options
        if (bid.options && Array.isArray(bid.options)) {
          bid.options.forEach(option => {
            if (option.items && Array.isArray(option.items)) {
              option.items.forEach(itemId => itemIds.add(itemId));
            }
          });
        }
        
        // תמיכה במבנה הישן - giveItemId
        if (bid.giveItemId) itemIds.add(bid.giveItemId);
      });
      
      // Fetch all items and users in batch
      const allItems = await FirebaseDataService.getAllItems();
      console.log('allItems ids:', allItems.map(i => i.id));
      const allUsers = await FirebaseDataService.getAllUsers();

      // Log each bid's takeItemId and giveItemId
      bids.forEach(bid => {
        console.log('bid', bid.id, 'takeItemId:', bid.takeItemId, 'giveItemId:', bid.giveItemId);
      });

      // Create lookup maps
      const itemsById = new Map();
      const usersById = new Map();
      
      allItems.forEach(item => {
        itemsById.set(item.id, item);
      });
      
      allUsers.forEach(user => {
        if (user.uid) usersById.set(user.uid, user);
      });
      
      // Attach details to bids
      const bidsWithDetails = bids.map(bid => {
        const takeItem = itemsById.get(bid.takeItemId);
        const fromUser = usersById.get(bid.fromUserId);
        const toUser = usersById.get(bid.toUserId);
        
        // לוגים מפורטים
        console.log('---\nBID', bid.id, 'RAW:', JSON.stringify(bid));
        console.log('BID', bid.id, 'allItems ids:', Array.from(itemsById.keys()));
        
        // טיפול במבנה החדש - options
        let optionsWithDetails = [];
        if (bid.options && Array.isArray(bid.options) && bid.options.length > 0) {
          optionsWithDetails = bid.options.map(option => {
            if (option.items && Array.isArray(option.items)) {
              return option.items.map(itemId => itemsById.get(itemId)).filter(Boolean);
            }
            return [];
          });
        }
        
        // תמיכה במבנה הישן - giveItemId (אם אין options תקינים)
        if (optionsWithDetails.length === 0 && bid.giveItemId) {
          const giveItem = itemsById.get(bid.giveItemId);
          if (giveItem) {
            optionsWithDetails = [[giveItem]];
            console.log('BID', bid.id, 'converted old format to optionsWithDetails:', optionsWithDetails);
          } else {
            console.warn('BID', bid.id, 'has giveItemId', bid.giveItemId, 'but item not found in allItems');
          }
        }
        
        // תמיכה במבנה הישן - giveItem (למען תאימות לאחור)
        let giveItem = null;
        if (bid.giveItemId) {
          giveItem = itemsById.get(bid.giveItemId);
        }
        
        console.log('BID', bid.id, 'FINAL optionsWithDetails:', optionsWithDetails);
        
        return {
          ...bid,
          takeItem,
          giveItem, // למען תאימות לאחור
          optionsWithDetails, // המבנה החדש
          fromUser,
          toUser
        };
      });
      
      // Cache the result
      cache.bids = bidsWithDetails;
      cache.lastFetch.bids = Date.now();
      
      return bidsWithDetails;
    } catch (error) {
      console.error('Error getting bids with details:', error);
      throw error;
    }
  }

  /**
   * Search items by category or name
   */
  async searchItems(searchTerm) {
    try {
      const items = await FirebaseDataService.getAllItems();
      const searchLower = searchTerm.toLowerCase();
      
      return items.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  }

  /**
   * Get items by category
   */
  async getItemsByCategory(category) {
    try {
      const items = await FirebaseDataService.getAllItems();
      return items.filter(item => item.category === category);
    } catch (error) {
      console.error('Error getting items by category:', error);
      throw error;
    }
  }

  /**
   * Create a new bid with multiple options
   */
  async createBid(takeItemId, options, fromUserId, toUserId) {
    try {
      const bidData = {
        takeItemId,
        options, // מערך של אופציות, כל אופציה מכילה מערך של itemIds
        fromUserId,
        toUserId,
        status: 'pending',
        createdAt: new Date()
      };
      const bidId = await FirebaseDataService.addBid(bidData);
      
      // Invalidate cache since we added a new bid
      cache.bids = null;
      cache.lastFetch.bids = 0;
      
      return bidId;
    } catch (error) {
      console.error('Error creating bid:', error);
      throw error;
    }
  }

  /**
   * Accept a bid
   */
  async acceptBid(bidId) {
    await FirebaseDataService.updateBidStatus(bidId, 'accepted');
    
    // Invalidate cache since we updated a bid
    cache.bids = null;
    cache.lastFetch.bids = 0;
    
    const bid = await FirebaseDataService.getBidById(bidId);
    if (!bid) throw new Error('Bid not found');

    const fromUser = await FirebaseDataService.getUserById(bid.fromUserId);
    const toUser = await FirebaseDataService.getUserById(bid.toUserId);

    return {
      fromUserPhone: fromUser?.phone || '',
      toUserPhone: toUser?.phone || ''
    };
  }

  /**
   * Reject a bid
   */
  async rejectBid(bidId) {
    try {
      await FirebaseDataService.updateBidStatus(bidId, 'rejected');
      
      // Invalidate cache since we updated a bid
      cache.bids = null;
      cache.lastFetch.bids = 0;
    } catch (error) {
      console.error('Error rejecting bid:', error);
      throw error;
    }
  }

  /**
   * Delete a bid
   */
  async deleteBid(bidId) {
    try {
      await FirebaseDataService.deleteBid(bidId);
      
      // Invalidate cache since we deleted a bid
      cache.bids = null;
      cache.lastFetch.bids = 0;
    } catch (error) {
      console.error('Error deleting bid:', error);
      throw error;
    }
  }

  /**
   * Get user profile with items
   */
  async getUserProfileWithItems(userId) {
    try {
      const user = await FirebaseDataService.getUserById(userId);
      const items = await FirebaseDataService.getItemsByUserId(userId);
      
      return {
        ...user,
        items
      };
    } catch (error) {
      console.error('Error getting user profile with items:', error);
      throw error;
    }
  }

  /**
   * Get available items (not traded)
   */
  async getAvailableItems() {
    try {
      const items = await FirebaseDataService.getAllItems();
      return items.filter(item => item.status === 'available');
    } catch (error) {
      console.error('Error getting available items:', error);
      throw error;
    }
  }

  /**
   * Get pending bids for a user
   */
  async getPendingBidsForUser(userId) {
    try {
      const bids = await FirebaseDataService.getAllBids();
      return bids.filter(bid => 
        bid.userId === userId && bid.status === 'pending'
      );
    } catch (error) {
      console.error('Error getting pending bids for user:', error);
      throw error;
    }
  }

  /**
   * Get completed swaps for a user
   */
  async getCompletedSwapsForUser(userId) {
    try {
      const bids = await FirebaseDataService.getAllBids();
      return bids.filter(bid => 
        bid.userId === userId && bid.status === 'completed'
      );
    } catch (error) {
      console.error('Error getting completed swaps for user:', error);
      throw error;
    }
  }

  /**
   * Update an existing bid
   */
  async updateBid(bidId, updateData) {
    try {
      await FirebaseDataService.updateBid(bidId, updateData);
    } catch (error) {
      console.error('Error updating bid:', error);
      throw error;
    }
  }
}

const dataService = new DataService();
export default dataService; 