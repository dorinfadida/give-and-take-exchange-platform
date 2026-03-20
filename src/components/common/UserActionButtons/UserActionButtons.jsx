import React from 'react';
import './UserActionButtons.css'; 

export default function UserActionButtons() {
  return (
    <div className="user-actions">
      <button className="circle-button" title="View Profile">
        <img src="/icons/list.svg" alt="User Items" />
      </button>
      <button className="circle-button" title="Contact on WhatsApp">
        <img src="/icons/whatsapp.svg" alt="WhatsApp" />
      </button>
    </div>
  );
}
