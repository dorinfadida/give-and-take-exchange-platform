import FirebaseDataService from '../services/firebaseDataService';

/**
 * Utility function to initialize Firebase with mock data
 * Run this once to populate your database
 */
// export const initializeFirebaseData = async () => {
//   try {
//     console.log('🚀 Starting Firebase data initialization...');
//     // Initialize the database with all mock data
//     // await FirebaseDataService.initializeDatabase();
//     console.log('✅ Firebase data initialization completed successfully!');
//     console.log('📊 Your database now contains:');
//     console.log('   - Users: Dana Cohen, Israel Israeli, Yuval Fadida');
//     console.log('   - Items: Beats Headphones, Serving Utensils, Cool Hat, Retro Hat');
//     console.log('   - Bids: 2 sample bids');
//     console.log('   - User Items: Modern Floor Lamp, Vintage Bookshelf, Nike Air Force 1');
//   } catch (error) {
//     console.error('❌ Error initializing Firebase data:', error);
//     throw error;
//   }
// };

/**
 * Function to clear all data (use with caution!)
 */
export const clearAllData = async () => {
  try {
    console.log('🗑️ Clearing all data...');
    
    // Get all collections and delete documents
    const collections = ['users', 'items', 'bids', 'userItems'];
    
    for (const collectionName of collections) {
      const snapshot = await FirebaseDataService.db.collection(collectionName).get();
      const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      console.log(`Cleared collection: ${collectionName}`);
    }
    
    console.log('✅ All data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}; 