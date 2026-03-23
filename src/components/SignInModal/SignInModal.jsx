import React from 'react';
import './SignInModal.css';
import { signInWithGoogle } from '../../services/authService';
import GoogleSigningButton from '../GoogleSigning/GoogleSigning';

const SignInModal = ({ onClose, onGoogleSignIn }) => {

  return (
    <div className="modal-overlay-signin" onClick={onClose}>
      <div className="modal-content-signin" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2 className="modal-title">Sign In</h2>

        <div className='google-button-wrapper'>
          <GoogleSigningButton
            onClick={async () => {
              try {
                const user = await signInWithGoogle();
                if (onGoogleSignIn) {
                  onGoogleSignIn(user);
                }
              } catch (error) {
                alert('Google Sign-In failed: ' + error.message);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
