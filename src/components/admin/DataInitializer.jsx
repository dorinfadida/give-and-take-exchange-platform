import React, { useState } from 'react';
import { initializeFirebaseData, clearAllData } from '../../utils/initializeFirebaseData';
import './DataInitializer.css';

const DataInitializer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleInitializeData = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      // await initializeFirebaseData();
      setMessage('✅ Database initialization is currently disabled.');
      setMessageType('success');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('⚠️ Are you sure you want to clear ALL data? This action cannot be undone!')) {
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      await clearAllData();
      setMessage('🗑️ All data cleared successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="data-initializer">
      <h2>Firebase Data Management</h2>
      
      <div className="data-initializer__actions">
        <button 
          className="data-initializer__btn data-initializer__btn--primary"
          onClick={handleInitializeData}
          disabled={isLoading}
        >
          {isLoading ? '🔄 Initializing...' : '🚀 Initialize Database with Mock Data'}
        </button>
        
        <button 
          className="data-initializer__btn data-initializer__btn--danger"
          onClick={handleClearData}
          disabled={isLoading}
        >
          {isLoading ? '🔄 Clearing...' : '🗑️ Clear All Data'}
        </button>
      </div>
      
      {message && (
        <div className={`data-initializer__message data-initializer__message--${messageType}`}>
          {message}
        </div>
      )}
      
      <div className="data-initializer__info">
        <h3>What this does:</h3>
        <ul>
          <li>📊 Creates users: Dana Cohen, Israel Israeli, Yuval Fadida</li>
          <li>🛍️ Adds items: Beats Headphones, Serving Utensils, Cool Hat, Retro Hat</li>
          <li>🤝 Creates sample bids between users</li>
          <li>📦 Adds user-specific items for Dana Cohen</li>
          <li>⏰ Sets proper timestamps and metadata</li>
        </ul>
        
        <div className="data-initializer__warning">
          <strong>⚠️ Warning:</strong> Only run this once to avoid duplicate data!
        </div>
      </div>
    </div>
  );
};

export default DataInitializer; 