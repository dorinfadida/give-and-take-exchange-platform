import React, { useState, useEffect } from 'react';
import './AddItemModal.css';
import FirebaseDataService from '../../../../services/firebaseDataService';
import { GeminiService } from '../../../../services/geminiService';
import { auth } from '../../../../firebase';

// Import AI logo SVG
const AILogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="20px" height="20px" style={{ marginRight: '8px' }}>
    <path d="M14.217 19.707l-1.112 2.547c-.427.979-1.782.979-2.21 0l-1.112-2.547c-.99-2.267-2.771-4.071-4.993-5.057L1.73 13.292c-.973-.432-.973-1.848 0-2.28l2.965-1.316C6.974 8.684 8.787 6.813 9.76 4.47l1.126-2.714c.418-1.007 1.81-1.007 2.228 0L14.24 4.47c.973 2.344 2.786 4.215 5.065 5.226l2.965 1.316c.973.432.973 1.848 0 2.28l-3.061 1.359C16.988 15.637 15.206 17.441 14.217 19.707zM24.481 27.796l-.339.777c-.248.569-1.036.569-1.284 0l-.339-.777c-.604-1.385-1.693-2.488-3.051-3.092l-1.044-.464c-.565-.251-.565-1.072 0-1.323l.986-.438c1.393-.619 2.501-1.763 3.095-3.195l.348-.84c.243-.585 1.052-.585 1.294 0l.348.84c.594 1.432 1.702 2.576 3.095 3.195l.986.438c.565.251.565 1.072 0 1.323l-1.044.464C26.174 25.308 25.085 26.411 24.481 27.796z"/>
  </svg>
);

// Predefined categories for the dropdown
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

const AddItemModal = ({ onClose, user, onItemAdded, editMode = false, itemToEdit = null, onItemUpdated }) => {
  // Basic form state
  const [itemName, setItemName] = useState('');
  const [images, setImages] = useState([]);
  
  // AI-generated content state
  const [aiData, setAiData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  
  // Editable AI content
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [attributeFields, setAttributeFields] = useState([]);

  // 1. Add state for condition
  const [condition, setCondition] = useState('');
  const CONDITION_OPTIONS = [
    'Brand New',
    'Like New',
    'Used',
    'Well Used',
    'Needs Repair',
  ];

  // Prefill form in edit mode
  useEffect(() => {
    if (editMode && itemToEdit) {
      setItemName(itemToEdit.name || '');
      setCategory(itemToEdit.category || '');
      setDescription(itemToEdit.description || '');
      setImages([]); // Don't prefill images, only show preview
      // Prefill attributes
      const attrs = itemToEdit.attributes || {};
      const fields = Object.entries(attrs)
        .filter(([key]) => key !== 'Condition')
        .map(([label, value]) => ({ label, value }));
      setAttributeFields(fields);
      setCondition(attrs['Condition'] || '');
    }
  }, [editMode, itemToEdit]);

  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleGenerateDescription = async () => {
    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setIsGenerating(true);
    setGenerationError('');

    try {
      const result = await GeminiService.describeProduct(images[0]);
      
      setAiData(result);
      setItemName(result.name || '');
      setCategory(result.category);
      setDescription(result.description);
      setAttributeFields(result.fields.map(field => ({
        label: field,
        value: ''
      })));
    } catch (error) {
      console.error('Failed to generate description:', error);
      setGenerationError(error?.message || 'Failed to generate description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
    let imageUrl = itemToEdit?.imageUrl || '';
    let imagesUrls = itemToEdit?.images || [];
    if (images.length > 0 && images[0] instanceof File) {
      if (!auth.currentUser) {
        alert('Something went wrong, please log in again');
        setIsSaving(false);
        return;
      }
      const realUid = auth.currentUser.uid;
      imagesUrls = await FirebaseDataService.uploadMultipleImagesToStorage(realUid, images);
      imageUrl = imagesUrls[0];
    }

    // Prepare item data
    const itemData = {
      name: itemName,
      category,
      imageUrl,
      images: imagesUrls,
      userId: auth.currentUser ? auth.currentUser.uid : '',
      userEmail: user.email,
    };

    // Add description if available
    if (description.trim()) {
      itemData.description = description;
    }

    // Add attribute fields if any have values
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

    if (editMode && itemToEdit) {
      // Update existing item
      await FirebaseDataService.updateItem(itemToEdit.id, itemData);
      if (onItemUpdated) onItemUpdated();
    } else {
      // Add new item
      await FirebaseDataService.addItem({ ...itemData, createdAt: new Date() });
      if (onItemAdded) onItemAdded();
    }
    setIsSaving(false);
    onClose();
  };

  const showExpandedForm = aiData && !isGenerating;

  return (
    <div className="modal-overlay-add-item" onClick={onClose}>
      <div className="modal-content-add-item" onClick={(e) => e.stopPropagation()}>
        <button className="close-button-add-item" onClick={onClose}>×</button>
        <h2 className="modal-title-add-item">{editMode ? 'Edit Item' : 'Add New Item'}</h2>

        <form className="add-item-form" onSubmit={handleSubmit}>
          {/* Step 1: Upload Images */}
          <div className="form-group">
            <label>Upload Photos:</label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          {images.length > 0 && (
            <div className="image-preview-gallery">
              {images.map((img, idx) => (
                <img key={idx} src={URL.createObjectURL(img)} alt={`preview-${idx}`} className="preview-img" />
              ))}
            </div>
          )}

          {/* Generate Description Button */}
          <button 
            type="button" 
            className="generate-description-btn"
            onClick={handleGenerateDescription}
            disabled={isGenerating || images.length === 0}
          >
            <AILogo />
            {isGenerating ? 'Generating...' : 'Generate Description'}
          </button>

          {generationError && (
            <div className="error-message">
              {generationError}
            </div>
          )}

          {/* Step 2: AI-Generated Content */}
          {showExpandedForm && (
            <>
              <div className="ai-generated-note">
                🧠 Generated using AI based on your uploaded image
              </div>

              {/* Item Name field - now first after generation */}
              <div className="form-group">
                <label>Item name:</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  rows="3"
                  placeholder="Item description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Condition as a separate group */}
              <div className="condition-group">
                <label htmlFor="condition-select">Condition:</label>
                <select
                  id="condition-select"
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  required
                >
                  <option value="" disabled>Select condition</option>
                  {CONDITION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Additional Details:</label>
                <div className="attribute-fields">
                  {/* AI/manual fields */}
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
                      >
                        <img src="/icons/delete.svg" alt="Delete" />
                      </button>
                    </div>
                  ))}
                  {/* Always show add button */}
                  <button
                    type="button"
                    className="add-attribute-btn"
                    onClick={() => setAttributeFields([...attributeFields, { label: '', value: '' }])}
                  >
                    Add Attribute Field
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="add-item-btn"
            disabled={isSaving || !itemName.trim() || !category}
          >
            {isSaving ? 'Adding...' : (editMode ? 'Save Changes' : 'Add Item')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;

