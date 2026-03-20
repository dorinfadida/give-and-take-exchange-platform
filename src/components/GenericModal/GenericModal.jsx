import React from 'react';
import './GenericModal.css';

export const GenericModal = ({ children, onClose }) => {
  return (
    <div className="generic-modal-overlay" onClick={onClose}>
      <div className="generic-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="generic-modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default GenericModal;
