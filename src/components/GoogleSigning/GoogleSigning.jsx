import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import './GoogleSigning.css';

const MockGoogleButton = ({ text = "Sign in with Google", onClick }) => {
  return (
    <button className="google-button" onClick={onClick}>
      <FcGoogle className="google-icon" />
      <span>{text}</span>
    </button>
  );
};

export default MockGoogleButton;
