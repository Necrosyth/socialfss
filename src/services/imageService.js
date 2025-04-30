import axios from 'axios';
import { fileToDataUrl } from '../utils/imageUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create FormData from file
const createFormData = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return formData;
};

/**
 * Upload an image to the server
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} The response containing the image URL
 */
export const uploadImage = async (file) => {
  try {
    if (!file) throw new Error('No file provided');
    
    const formData = createFormData(file);
    
    const response = await axios.post(`${API_URL}/api/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Prepare an image for display - either upload it to the server or convert to data URL
 * @param {File|null} file - The image file
 * @param {boolean} uploadToServer - Whether to upload to server or use data URL
 * @returns {Promise<string>} The image URL or data URL
 */
export const prepareImage = async (file, uploadToServer = true) => {
  if (!file) return null;
  
  try {
    if (uploadToServer) {
      // Upload to server and get the URL
      const response = await uploadImage(file);
      return response.imageUrl;
    } else {
      // Convert to data URL for local preview
      return await fileToDataUrl(file);
    }
  } catch (error) {
    console.error('Error preparing image:', error);
    throw error;
  }
};

/**
 * Delete an image from the server
 * @param {string} imagePath - The path to the image 
 * @returns {Promise<Object>} The response
 */
export const deleteImage = async (imagePath) => {
  try {
    if (!imagePath) throw new Error('No image path provided');
    
    // Extract path components from the URL
    // Format: /uploads/YYYY/MM/DD/filename.ext
    const pathParts = imagePath.replace('/uploads/', '').split('/');
    if (pathParts.length !== 4) {
      throw new Error('Invalid image path format');
    }
    
    const [year, month, day, filename] = pathParts;
    
    const response = await axios.delete(`${API_URL}/api/images/${year}/${month}/${day}/${filename}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Get information about an image
 * @param {string} imagePath - The path to the image
 * @returns {Promise<Object>} The image information
 */
export const getImageInfo = async (imagePath) => {
  try {
    if (!imagePath) throw new Error('No image path provided');
    
    const response = await axios.get(`${API_URL}/api/images/info`, {
      params: { path: imagePath }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting image info:', error);
    throw error;
  }
};

/**
 * Create a proxy URL for external images to avoid CORS issues
 * @param {string} url - The external image URL
 * @returns {string} The proxy URL
 */
export const getProxyImageUrl = (url) => {
  if (!url) return null;
  
  // Don't proxy local URLs
  if (url.startsWith('/') || url.startsWith(API_URL)) {
    return url;
  }
  
  return `${API_URL}/api/images/proxy?url=${encodeURIComponent(url)}`;
};

/**
 * Check if an image exists and is accessible
 * @param {string} imagePath - The path to the image
 * @returns {Promise<boolean>} Whether the image exists
 */
export const checkImageExists = async (imagePath) => {
  try {
    await getImageInfo(imagePath);
    return true;
  } catch (error) {
    return false;
  }
}; 