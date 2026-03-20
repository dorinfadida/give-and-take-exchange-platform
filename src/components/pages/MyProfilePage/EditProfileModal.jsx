import React, { useState, useEffect } from 'react';
import './EditProfileModal.css';
import { categoryOptions } from '../HomePage/Search/FilterComponent/filterOptions';
import { getProfileImageUrl } from '../../../utils/profileImageUtils';

// CityAutocomplete component (inline for now)
function CityAutocomplete({ value, onChange, onSelect, inputStyle }) {
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState(value || '');

  const fetchCities = async (query) => {
    if (!query) return [];
    // const res = await fetch(
    //   `https://nominatim.openstreetmap.org/search?country=Israel&city=${encodeURIComponent(query)}&format=json&addressdetails=1`
    // );
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
        placeholder="Enter location"
        autoComplete="off"
        required
        style={inputStyle}
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

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(getProfileImageUrl(user));
  const [selectedCategories, setSelectedCategories] = useState(user.interests || user.tags || []);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState(user.location || user.city || '');
  const [lat, setLat] = useState(user.lat || null);
  const [lng, setLng] = useState(user.lng || null);

  useEffect(() => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setPhotoPreview(getProfileImageUrl(user));
    setSelectedCategories(user.interests || user.tags || []);
    setLocation(user.location || user.city || '');
    setLat(user.lat || null);
    setLng(user.lng || null);
  }, [user]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      name,
      phone,
      photo,
      interests: selectedCategories,
      location,
      lat,
      lng,
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="epm-modal-overlay" onClick={onClose}>
      <div className="epm-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="epm-close-button" onClick={onClose}>×</button>
        <h2 className="epm-modal-title">Edit Profile</h2>
        <div className="epm-modal-body">
          <div className="epm-form-fields">
            <div className="epm-form-group">
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
              />
            </div>
            <div className="epm-form-group">
              <label>Phone Number:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+123456789"
              />
            </div>
            <div className="epm-form-group">
              <label>Upload Profile Photo:</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="epm-photo-preview" />
              )}
            </div>
            <div className="epm-form-group">
              <label>Location:</label>
              <CityAutocomplete
                value={location}
                onChange={setLocation}
                onSelect={(cityObj) => {
                  setLocation(cityObj.name);
                  setLat(cityObj.lat);
                  setLng(cityObj.lng);
                }}
                inputStyle={{ width: '100%' }}
              />
            </div>
          </div>
          <div className="epm-interests-section">
            <label className='epm-interests-headline'>Pick Your Interests</label>
            <div className="epm-category-buttons">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`epm-category-button ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        <form className="epm-form-footer" onSubmit={handleSubmit}>
          <button type="submit" className="epm-submit-button">Save Changes</button>
          {success && <div className="epm-success-msg">Profile updated successfully!</div>}
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 