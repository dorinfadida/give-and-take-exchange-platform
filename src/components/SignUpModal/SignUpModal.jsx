import React, { useState, useEffect } from 'react';
import './SignUpModal.css';
import { categoryOptions } from '../pages/HomePage/Search/FilterComponent/filterOptions';
import { signInWithGoogle } from '../../services/authService';
import GoogleSigningButton from '../GoogleSigning/GoogleSigning';
import { getInitial, generateRandomAvatarColor } from '../../utils/profileImageUtils';

// CityAutocomplete component (inline for now)
function CityAutocomplete({ value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState(value || '');

  const fetchCities = async (query) => {
    if (!query) return [];
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?country=Israel&city=${encodeURIComponent(query)}&format=json&addressdetails=1&accept-language=en`
    );
    const data = await res.json();
    const unique = [];
    const seen = new Set();
    for (const city of data) {
      const name = city.display_name.split(',')[0].trim();
      if (!seen.has(name)) {
        unique.push({
          name,
          lat: city.lat,
          lng: city.lon
        });
        seen.add(name);
      }
    }
    return unique;
  };

  const handleInputChange = async (e) => {
    const val = e.target.value;
    setInput(val);
    onChange(val);
    if (val.length > 1) {
      const results = await fetchCities(val);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (city) => {
    setInput(city.name);
    setSuggestions([]);
    onSelect(city);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Enter city"
        autoComplete="on"
        required
      />
      {suggestions.length > 0 && (
        <ul style={{
          position: 'absolute', background: '#fff', border: '1px solid #ccc', zIndex: 10, width: '100%', listStyle: 'none', margin: 0, padding: 0
        }}>
          {suggestions.map((city, idx) => (
            <li
              key={idx}
              style={{ padding: '8px', cursor: 'pointer' }}
              onClick={() => handleSelect(city)}
            >
              {city.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SignUpModal = ({ onClose, onComplete, defaultName = '', defaultEmail = '', defaultPhone = '', defaultPhoto = null, defaultAvatarColor = '', hideGoogleButton = false }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(defaultPhoto);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [googleUser, setGoogleUser] = useState(null);
  const [city, setCity] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [avatarColor, setAvatarColor] = useState(defaultAvatarColor || null);

  useEffect(() => {
    setName(defaultName);
    setEmail(defaultEmail);
    setPhone(defaultPhone);
    setPhotoPreview(defaultPhoto);
    setAvatarColor(defaultAvatarColor || null);
  }, [defaultName, defaultEmail, defaultPhone, defaultPhoto, defaultAvatarColor]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const handleGoogleSignUp = async () => {
    try {
      const user = await signInWithGoogle();
      setName(user.displayName || '');
      setEmail(user.email || '');
      setPhotoPreview(user.photoURL || '');
      setGoogleUser(user);
      setIsGoogleSignedIn(true);
      setAvatarColor(user.photoURL ? null : generateRandomAvatarColor());
    } catch (error) {
      alert('Google Sign-Up failed: ' + error.message);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!isGoogleSignedIn) {
      alert('Please sign up with Google first');
      return;
    }
    
    if (!phone.trim()) {
      alert('Phone number is required');
      return;
    }
    
    if (!city.trim()) {
      alert('City is required');
      return;
    }
    
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasProfileImage = !!(photo || (googleUser && googleUser.photoURL));
    onComplete({
      name,
      email,
      phone,
      photo: photo || (googleUser ? googleUser.photoURL : null),
      interests: selectedCategories,
      uid: googleUser ? googleUser.uid : undefined,
      photoURL: googleUser ? googleUser.photoURL : undefined,
      avatarColor: hasProfileImage ? '' : (avatarColor || generateRandomAvatarColor()),
      location: city,
      lat,
      lng,
    });
  };

  // Helper to get the correct profile image for preview
  function getSignUpProfileImageUrl() {
    if (photoPreview) return photoPreview; // uploaded preview (URL.createObjectURL)
    if (googleUser && googleUser.photoURL) return googleUser.photoURL;
    return null;
  }

  return (
    <div className="modal-overlay-signup" onClick={onClose}>
      <div className={`modal-content-signup${step === 2 ? ' wide' : ''}`} style={{maxHeight: '90vh', minHeight: 'auto', overflowY: 'auto', overflowX: 'hidden'}} onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        {step === 1 && (
          <div className="signup-step signup-step-1">
            <h2 className="modal-title">Create Your Account</h2>
            
            {/* Google Sign Up Section */}
            <div className="google-signup-section">
              {!isGoogleSignedIn ? (
                <div className="google-button-wrapper">
                  <GoogleSigningButton
                    text="Sign up with Google"
                    onClick={handleGoogleSignUp}
                  />
                  <p className="google-note">* Required: Sign up with Google to continue</p>
                </div>
              ) : (
                <div className="google-success">
                  <div className="google-user-info">
                    {getSignUpProfileImageUrl() ? (
                      <img src={getSignUpProfileImageUrl()} alt="Profile" className="google-profile-pic" />
                    ) : (
                      <div className="google-profile-pic" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: avatarColor || '#92A8D1',
                        color: '#fff',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        width: 40,
                        height: 40
                      }}>
                        {getInitial(name)}
                      </div>
                    )}
                    <div className="google-user-details">
                      <p><strong>Name:</strong> {name}</p>
                      <p><strong>Email:</strong> {email}</p>
                    </div>
                  </div>
                  <button 
                    className="change-google-account" 
                    onClick={handleGoogleSignUp}
                  >
                    Change Google Account
                  </button>
                </div>
              )}
            </div>

            <form className="signup-form" onSubmit={handleNext}>
              <div className="form-group">
                <label>Phone Number: <span className="required">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+972-XX-XXX-XXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label>City: <span className="required">*</span></label>
                <CityAutocomplete
                  value={city}
                  onChange={setCity}
                  onSelect={(cityObj) => {
                    setCity(cityObj.name);
                    setLat(cityObj.lat);
                    setLng(cityObj.lng);
                  }}
                />
              </div>

              <div className="form-group">
                <label>Profile Photo:</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {getSignUpProfileImageUrl() && (
                  <img src={getSignUpProfileImageUrl()} alt="Preview" className="photo-preview" />
                )}
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={!isGoogleSignedIn}
              >
                Next
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="signup-step signup-step-2">
            <h2 className="modal-title">Pick Your Interests</h2>
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="category-buttons">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-button ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button type="submit" className="submit-button">Create Account</button>
            </form>
            <button className="back-button" onClick={() => setStep(1)} style={{marginTop: 16}}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpModal;
