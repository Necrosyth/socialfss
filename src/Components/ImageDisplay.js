import React, { useState, useEffect } from 'react';
import { getImageUrl, DEFAULT_FALLBACK_IMAGE } from '../utils/imageUtils';
import './ImageDisplay.css';

const ImageDisplay = ({
  src,
  alt = "Image",
  className = "",
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  retryCount = 2,
  lazyLoad = true,
  onClick,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    // Reset states when src changes
    setImgSrc(src);
    setLoading(true);
    setError(false);
    setRetries(0);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    
    // Try to reload with a cache-busting parameter
    if (retries < retryCount && imgSrc !== fallbackSrc) {
      setRetries(prev => prev + 1);
      
      // Add a timestamp to bust the cache
      const cacheBuster = `cacheBust=${Date.now()}`;
      const separator = imgSrc.includes('?') ? '&' : '?';
      
      // Delay retry slightly to give the browser time to reset
      setTimeout(() => {
        setImgSrc(`${imgSrc}${separator}${cacheBuster}`);
      }, 300);
    } else {
      // Fall back to the fallback image after retries
      setError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Format the URL based on the source type
  const formattedSrc = imgSrc ? getImageUrl(imgSrc) : fallbackSrc;
  
  return (
    <div className={`image-display-container ${className}`}>
      {loading && (
        <div className="image-loading-indicator">
          <div className="spinner"></div>
        </div>
      )}
      
      <img
        src={formattedSrc}
        alt={alt}
        className={`image-display ${loading ? 'loading' : ''} ${error ? 'error' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazyLoad ? "lazy" : undefined}
        onClick={onClick}
        {...props}
      />
      
      {error && (
        <div className="image-error-overlay">
          <span>Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay; 