import React, { useState } from 'react';
import './EditItemModal.css';
import FirebaseDataService from '../../../../services/firebaseDataService';
import { auth } from '../../../../firebase';

const CATEGORIES = [
  { group: "🏠 Apartment", options: [
    "🛋️ Furniture", "🧊 Home Appliances", "🍽️ Kitchenware", "📦 Storage & Organization",
    "💡 Lighting & Decor", "🪴 Garden & Outdoor", "🚿 Bathroom Items", "🧼 Cleaning Supplies", "🛠️ Tools & Repairs"
  ]},
  { group: "🎓 Studies", options: [
    "💻 Laptop & Tech", "📱 Tablet & Accessories", "🎒 Backpacks", "📚 Study Materials",
    "📖 Academic Books", "🖨️ Printer & Ink", "🎧 Headphones"
  ]},
  { group: "🙋 For Yourself", options: [
    "👔 Men's Clothing", "👗 Women's Clothing", "👟 Shoes", "🧢 Accessories",
    "🧳 Travel Bags", "🧴 Personal Care"
  ]},
  { group: "🎮 Fun & Free Time", options: [
    "📚 Books", "🎲 Board Games", "🎮 Gaming", "🎸 Musical Instruments", "🎨 DIY & Hobbies",
    "📺 TV & Media Devices", "📱 Phones & Gadgets", "🏀 Sports Gear", "🏕️ Camping & Travel", "🐾 Pet Supplies"
  ]}
];

const CONDITION_OPTIONS = [
  'Brand New',
  'Like New',
  'Used',
  'Well Used',
  'Needs Repair',
];

const EditItemModal = ({ onClose, item, user, onItemUpdated }) => {
  const [itemName, setItemName] = useState(item.name || '');
  const [category, setCategory] = useState(item.category || '');
  const [description, setDescription] = useState(item.description || '');
  const [condition, setCondition] = useState(item.attributes?.Condition || '');
  const [attributeFields, setAttributeFields] = useState(
    Object.entries(item.attributes || {})
      .filter(([key]) => key !== 'Condition')
      .map(([label, value]) => ({ label, value }))
  );
  // Unified images state: {type: 'url'|'file', value}
  const [allImages, setAllImages] = useState(
    (item.images || (item.imageUrl ? [item.imageUrl] : [])).map(url => ({ type: 'url', value: url }))
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map(file => ({ type: 'file', value: file }));
    setAllImages(prev => [...prev, ...files]);
  };

  const handleRemoveImage = (idx) => {
    setAllImages(allImages.filter((_, i) => i !== idx));
  };

  const handleAttributeFieldChange = (index, field, value) => {
    const newFields = [...attributeFields];
    if (field === 'label') {
      newFields[index].label = value;
    } else {
      newFields[index].value = value;
    }
    setAttributeFields(newFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      alert('Please enter an item name');
      return;
    }
    if (!category) {
      alert('Please select a category');
      return;
    }
    setIsSaving(true);
    // Separate files and urls
    const filesToUpload = allImages.filter(img => img.type === 'file').map(img => img.value);
    let urls = allImages.filter(img => img.type === 'url').map(img => img.value);
    if (filesToUpload.length > 0) {
      if (!auth.currentUser) {
        alert('Something went wrong, please log in again');
        setIsSaving(false);
        return;
      }
      const realUid = auth.currentUser.uid;
      const uploadedUrls = await FirebaseDataService.uploadMultipleImagesToStorage(realUid, filesToUpload);
      urls = [...urls, ...uploadedUrls];
    }
    const imageUrl = urls[0] || '';
    const itemData = {
      name: itemName,
      category,
      imageUrl,
      images: urls,
      userId: item.userId,
      userEmail: item.userEmail,
    };
    if (description.trim()) {
      itemData.description = description;
    }
    const filledAttributes = attributeFields
      .filter(field => field.value.trim())
      .reduce((acc, field) => {
        acc[field.label] = field.value;
        return acc;
      }, {});
    if (condition) {
      filledAttributes['Condition'] = condition;
    }
    if (Object.keys(filledAttributes).length > 0) {
      itemData.attributes = filledAttributes;
    }
    await FirebaseDataService.updateItem(item.id, itemData);
    setIsSaving(false);
    if (onItemUpdated) onItemUpdated();
    onClose();
  };

  return (
    <div className="modal-overlay-edit-item" onClick={onClose}>
      <div className="modal-content-edit-item" onClick={e => e.stopPropagation()}>
        <button className="close-button-edit-item" onClick={onClose}>×</button>
        <h2 className="modal-title-edit-item">Edit Item</h2>
        <form className="edit-item-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item name:</label>
            <input
              type="text"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              rows="3"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Condition:</label>
            <select
              value={condition}
              onChange={e => setCondition(e.target.value)}
            >
              <option value="" disabled>Select condition</option>
              {CONDITION_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Images:</label>
            <div className="image-preview-gallery">
              {allImages.map((imgObj, idx) => (
                <div key={idx} className="edit-image-thumb">
                  <img src={imgObj.type === 'file' ? URL.createObjectURL(imgObj.value) : imgObj.value} alt={`img-${idx}`} />
                  <button type="button" onClick={() => handleRemoveImage(idx)}><img src="/icons/delete.svg" alt="Delete" /></button>
                </div>
              ))}
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>
          <div className="form-group">
            <label>Additional Details:</label>
            <div className="attribute-fields">
              {attributeFields.map((field, index) => (
                <div key={index} className="attribute-field">
                  <input
                    type="text"
                    value={field.label}
                    onChange={e => handleAttributeFieldChange(index, 'label', e.target.value)}
                    className="field-label"
                    placeholder="Attribute"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={e => handleAttributeFieldChange(index, 'value', e.target.value)}
                    className="field-value"
                    placeholder="Value"
                  />
                  <button
                    type="button"
                    className="delete-attribute-btn"
                    onClick={() => setAttributeFields(attributeFields.filter((_, i) => i !== index))}
                    aria-label="Delete attribute"
                  >
                    <img src="/icons/delete.svg" alt="Delete" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-attribute-btn"
                onClick={() => setAttributeFields([...attributeFields, { label: '', value: '' }])}
              >
                Add Attribute Field
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="edit-item-btn"
            disabled={isSaving || !itemName.trim() || !category}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal; 