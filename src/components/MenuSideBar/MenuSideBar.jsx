import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuSideBar.css';
import MenuButton from './MenuButton/MenuButton';
import {
  FaHandshake,
  FaPlusCircle,
  FaCompass,
  FaUserAlt,
  FaSignOutAlt,
} from 'react-icons/fa';
import { logout } from '../../services/authService';

const MenuSideBar = ({ onClose, openAddModal, onLogout }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await logout();
    if (onLogout) {
      await onLogout();
    } else {
      navigate('/');
    }
    onClose();
  };

  return (
    <div className="menu-sidebar-overlay" onClick={onClose}>
      <div className="menu-sidebar" onClick={(e) => e.stopPropagation()}>
        <MenuButton icon={<FaCompass />} text="Discover" onClick={() => handleNavigate('/discover')} />
        <MenuButton icon={<FaPlusCircle />} text="Add Items" onClick={() => { openAddModal(); onClose(); }} />
        <MenuButton icon={<FaHandshake />} text="Bids Center" onClick={() => handleNavigate('/bids-center')} />
        <MenuButton icon={<FaUserAlt />} text="Profile" onClick={() => handleNavigate('/profile')} />
        <MenuButton icon={<FaSignOutAlt />} text="Sign Out" onClick={handleSignOut} />
      </div>
    </div>
  );
};

export default MenuSideBar;

