import React, { useState, useEffect } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ 
  onImageUpload, 
  initialImage = null, 
  label = "Upload Image",
  className = ""
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // If initialImage is provided, use it as preview
  useEffect(() => {
    if (initialImage) {
      if (typeof initialImage === 'string') {
        // If initialImage is a URL or path string
        setImagePreview(initialImage);
      } else if (initialImage instanceof File) {
        // If initialImage is a File object
        handlePreview(initialImage);
      }
    }
  }, [initialImage]);
  
  // Function to handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset errors
    setError(null);
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }
    
    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Create preview
    handlePreview(file);
    
    // Call the onImageUpload callback
    if (onImageUpload) {
      onImageUpload(file);
    }
  };
  
  // Create image preview
  const handlePreview = (file) => {
    const reader = new FileReader();
    reader.onloadstart = () => setIsLoading(true);
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError('Failed to load image preview');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };
  
  // Remove image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setError(null);
    if (onImageUpload) {
      onImageUpload(null);
    }
  };
  
  return (
    <div className={`image-upload-container ${className}`}>
      {!imagePreview ? (
        <>
          <label className="image-upload-label">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="image-upload-input"
            />
            <div className="image-upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>{label}</span>
            </div>
          </label>
          {isLoading && <div className="upload-loading">Loading...</div>}
        </>
      ) : (
        <div className="image-preview-wrapper">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="image-preview"
            onError={() => setError('Failed to load image')}
          />
          <button 
            type="button" 
            className="remove-image-btn"
            onClick={handleRemoveImage}
          >
            ✕
          </button>
        </div>
      )}
      
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};

export default ImageUpload; 