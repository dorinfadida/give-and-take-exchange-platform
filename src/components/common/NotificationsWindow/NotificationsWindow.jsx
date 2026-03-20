import React from 'react';
import './NotificationsWindow.css';

const NotificationsWindow = ({ notifications }) => {
  return (
    <div className="notifications-window">
      <div className="notifications-header">
        <h4>Notifications</h4>
      </div>
      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className="notification-item">
              <p>{notification.message}</p>
              <span className="notification-time">{notification.time}</span>
            </div>
          ))
        ) : (
          <p>No new notifications</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsWindow; 