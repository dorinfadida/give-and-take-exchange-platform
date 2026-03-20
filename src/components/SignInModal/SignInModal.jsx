import React, { useState } from 'react';
import './SignInModal.css';
import { signInWithGoogle } from '../../services/authService';
import GoogleSigningButton from '../GoogleSigning/GoogleSigning';

const SignInModal = ({ onClose, onComplete, onGoogleSignIn }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onComplete({ email });
  };

  return (
    <div className="modal-overlay-signin" onClick={onClose}>
      <div className="modal-content-signin" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2 className="modal-title">Sign In</h2>

        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className='google-button-wrapper'>
            <GoogleSigningButton
              onClick={async () => {
                try {
                  const user = await signInWithGoogle();
                  if (onGoogleSignIn) {
                    onGoogleSignIn(user);
                  } else {
                    onComplete({
                      name: user.displayName,
                      email: user.email,
                      photoURL: user.photoURL,
                      uid: user.uid
                    });
                  }
                } catch (error) {
                  alert('Google Sign-In failed: ' + error.message);
                }
              }}
            />
          </div>

          <button type="submit" className="submit-button">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default SignInModal;
