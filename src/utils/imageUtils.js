/**
 * Image utility functions
 */

// Default fallback image for when images fail to load
export const DEFAULT_FALLBACK_IMAGE = '/images/placeholder-image.svg';

/**
 * Creates a reliable image URL based on the backend format
 * @param {string} imagePath - The image path or URL
 * @param {boolean} useProxy - Whether to proxy the image request to avoid CORS issues
 * @returns {string} A properly formatted image URL
 */
export const getImageUrl = (imagePath, useProxy = false) => {
  if (!imagePath) return DEFAULT_FALLBACK_IMAGE;

  // Handle data URLs (base64)
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Handle absolute URLs
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return useProxy ? `/api/proxy-image?url=${encodeURIComponent(imagePath)}` : imagePath;
  }

  // Handle relative paths for backend-hosted images
  // Ensure the path starts with a slash and remove any double slashes
  const normalizedPath = imagePath.startsWith('/') 
    ? imagePath 
    : `/${imagePath}`;
    
  return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${normalizedPath}`;
};

/**
 * Creates an image loader component that handles errors with fallbacks
 * @param {string} src - The image source URL
 * @param {string} alt - Alternative text for the image
 * @param {string} fallbackSrc - Fallback image to use if the primary one fails
 * @param {Object} props - Additional props to pass to the img element
 * @returns {JSX.Element} - The image with error handling
 */
export const createImageLoader = (Component) => {
  return function ImageWithFallback({ src, alt, fallbackSrc = DEFAULT_FALLBACK_IMAGE, ...props }) {
    // Handler for when the image fails to load
    const handleError = (e) => {
      console.warn(`Image failed to load: ${src}`);
      e.target.src = fallbackSrc;
      e.target.onerror = null; // Prevent infinite loop if fallback also fails
    };

    return (
      <Component
        src={src ? getImageUrl(src) : fallbackSrc}
        alt={alt || "Image"}
        onError={handleError}
        {...props}
      />
    );
  };
};

/**
 * Utility function to convert a File to a Base64 data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} A promise that resolves to the base64 data URL
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * ImageLoader component with built-in error handling and fallback
 */
export const ImageLoader = createImageLoader('img');

/**
 * Check if an image URL is valid and accessible
 * @param {string} url - The image URL to validate
 * @returns {Promise<boolean>} - Whether the image URL is valid
 */
export const isImageUrlValid = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Retry loading an image with exponential backoff
 * @param {string} url - The image URL to load
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 500)
 * @returns {Promise<string>} - The URL that loaded successfully or the DEFAULT_FALLBACK_IMAGE
 */
export const retryLoadingImage = async (url, maxRetries = 3, initialDelay = 500) => {
  let retries = 0;
  let delay = initialDelay;
  
  const tryLoad = async () => {
    if (await isImageUrlValid(url)) {
      return url;
    }
    
    if (retries >= maxRetries) {
      console.warn(`Failed to load image after ${maxRetries} retries: ${url}`);
      return DEFAULT_FALLBACK_IMAGE;
    }
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Increase delay for next retry
    delay *= 2;
    retries++;
    
    return tryLoad();
  };
  
  return tryLoad();
}; 