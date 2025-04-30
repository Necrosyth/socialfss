import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import ImageDisplay from './ImageDisplay';
import { uploadImage, prepareImage, deleteImage } from '../services/imageService';
import './ImageUploadExample.css';

const ImageUploadExample = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Clear messages after a delay
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // Handle image selection
  const handleImageChange = (file) => {
    setSelectedImage(file);
    setError('');
    
    // Create a preview URL for immediate display
    if (file) {
      prepareImage(file, false) // false = use data URL, not uploading yet
        .then(dataUrl => setImageUrl(dataUrl))
        .catch(err => {
          console.error('Error creating preview:', err);
          setError('Failed to create image preview');
        });
    } else {
      setImageUrl('');
    }
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      const result = await uploadImage(selectedImage);
      setImageUrl(result.imageUrl);
      setMessage('Image uploaded successfully!');
      console.log('Upload result:', result);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image deletion
  const handleDelete = async () => {
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
      setError('No uploaded image to delete');
      return;
    }
    
    try {
      await deleteImage(imageUrl);
      setImageUrl('');
      setSelectedImage(null);
      setMessage('Image deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete image');
    }
  };

  return (
    <div className="image-upload-example">
      <h2>Image Upload Example</h2>
      
      <div className="upload-section">
        <ImageUpload 
          onImageUpload={handleImageChange}
          initialImage={selectedImage}
          label="Click to select an image"
        />
        
        <div className="upload-actions">
          <button 
            onClick={handleUpload}
            disabled={!selectedImage || isUploading}
            className="upload-button"
          >
            {isUploading ? 'Uploading...' : 'Upload to Server'}
          </button>
          
          {imageUrl && imageUrl.startsWith('/uploads/') && (
            <button 
              onClick={handleDelete}
              className="delete-button"
            >
              Delete from Server
            </button>
          )}
        </div>
      </div>
      
      {(message || error) && (
        <div className={`status-message ${error ? 'error' : 'success'}`}>
          {error || message}
        </div>
      )}
      
      {imageUrl && (
        <div className="image-preview-section">
          <h3>Image Preview</h3>
          <ImageDisplay 
            src={imageUrl}
            alt="Uploaded image"
            className="preview-image"
          />
          <div className="image-url">
            <strong>Image URL:</strong> {imageUrl}
          </div>
        </div>
      )}
      
      <div className="usage-info">
        <h3>How to Use in Your App</h3>
        <pre>{`
// For displaying images with reliability:
<ImageDisplay 
  src={imageUrl} 
  alt="Description" 
  fallbackSrc="/path/to/fallback.jpg"
/>

// For uploading images:
const handleImageUpload = async (file) => {
  try {
    const result = await uploadImage(file);
    setImageUrl(result.imageUrl);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
        `}</pre>
      </div>
    </div>
  );
};

export default ImageUploadExample; 