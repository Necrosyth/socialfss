import React, { useState } from 'react';
import './AiGeneratedContent.css';

/**
 * Component to display AI-generated content for a post
 */
const AiGeneratedContent = ({ 
  title, 
  description, 
  className = '',
  collapsible = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // If no AI content, don't render anything
  if (!title && !description) {
    return null;
  }
  
  return (
    <div className={`ai-content-container ${className} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="ai-content-header">
        <div className="ai-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L5 5.5V14.5L12 22L19 14.5V5.5L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>AI-Generated</span>
        </div>
        
        {collapsible && (
          <button
            className="toggle-button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      
      <div className="ai-content">
        {title && <h4 className="ai-title">{title}</h4>}
        {description && (
          <p className="ai-description">
            {isExpanded 
              ? description 
              : `${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`}
          </p>
        )}
      </div>
    </div>
  );
};

export default AiGeneratedContent; 