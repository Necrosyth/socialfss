const { analyzeImage } = require('../utils/geminiService');

/**
 * Middleware to analyze uploaded images using Gemini API
 * This middleware should be used after multer middleware that handles the file upload
 * It expects req.file to be populated with the uploaded file
 * It will wait for the analysis to complete before allowing the request to proceed
 */
const analyzeImageMiddleware = async (req, res, next) => {
  // Skip if no file was uploaded
  if (!req.file) {
    return next();
  }

  try {
    // Log file information
    console.log('Processing uploaded image:', req.file.path);
    
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Using fallback mode without AI analysis.');
      
      // Provide fallback default values
      req.body.aiGeneratedTitle = 'Uploaded Image';
      req.body.aiGeneratedDescription = 'This image was uploaded without AI analysis.';
      req.body.aiGeneratedTags = ['image', 'upload'];
      
      return next();
    }
    
    // Call the Gemini API to analyze the image
    const analysisResult = await analyzeImage(req.file.path, req.file.mimetype);
    
    if (!analysisResult) {
      throw new Error('Image analysis failed to return results');
    }
    
    console.log('Image analysis completed successfully:', analysisResult);
    
    // Attach the analysis results to the request object
    // This makes it available to subsequent middleware or route handlers
    req.imageAnalysis = analysisResult;
    
    // If this is part of a post creation, attach the analysis to the post data
    if (req.body) {
      // If no description was provided by the user, use the one from Gemini
      if (!req.body.description || req.body.description.trim() === '') {
        req.body.description = analysisResult.description;
      }
      
      // If no title was provided, use the one from Gemini
      if (!req.body.title || req.body.title.trim() === '') {
        req.body.title = analysisResult.title;
      }
      
      // Always store the AI-generated fields
      req.body.aiGeneratedDescription = analysisResult.description;
      req.body.aiGeneratedTitle = analysisResult.title;
      
      // Use tags directly from the Gemini response if available
      if (analysisResult.tags && analysisResult.tags.length > 0) {
        req.body.aiGeneratedTags = analysisResult.tags;
        console.log('Using AI-generated tags from Gemini:', req.body.aiGeneratedTags);
      } else {
        // Fallback: Extract tags from the description if Gemini didn't provide them
        let aiGeneratedTags = [];
        
        if (analysisResult.rawResponse) {
          // Extract potential tags from the raw response
          const text = analysisResult.rawResponse.toLowerCase();
          
          // Common categories to look for
          const categories = ['theme', 'subject', 'color', 'mood', 'style', 'keyword', 'tag', 'category'];
          
          // Extract text after these indicators if they exist in the response
          categories.forEach(category => {
            const pattern = new RegExp(`${category}[s]?[:\\-]\\s*([^\\n\\.]+)`, 'i');
            const match = text.match(pattern);
            if (match && match[1]) {
              // Split by commas or 'and' and trim each tag
              const extractedTags = match[1].split(/,|\sand\s/).map(tag => tag.trim());
              aiGeneratedTags = [...aiGeneratedTags, ...extractedTags];
            }
          });
          
          // If no structured tags found, extract potential keywords from description
          if (aiGeneratedTags.length === 0) {
            // Get important words from description (longer than 3 chars, not stopwords)
            const stopwords = ['the', 'and', 'for', 'with', 'this', 'that', 'from', 'are', 'its', 'has'];
            const words = analysisResult.description.toLowerCase().split(/\W+/);
            
            const keywordTags = words
              .filter(word => word.length > 3 && !stopwords.includes(word))
              .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
              .slice(0, 5); // Take top 5 keywords
              
            aiGeneratedTags = [...aiGeneratedTags, ...keywordTags];
          }
        }
        
        // Ensure no duplicates and limit to 10 tags
        req.body.aiGeneratedTags = [...new Set(aiGeneratedTags)]
          .filter(tag => tag && tag.length > 0)
          .slice(0, 10);
        
        console.log('Generated fallback tags:', req.body.aiGeneratedTags);
      }
    }
    
    next();
  } catch (error) {
    console.error('Error analyzing image:', error);
    
    // Instead of failing, provide fallback values and continue
    console.warn('Using fallback mode due to analysis error');
    req.body.aiGeneratedTitle = 'Image Upload';
    req.body.aiGeneratedDescription = 'This image was uploaded but could not be analyzed by AI.';
    req.body.aiGeneratedTags = ['image', 'upload'];
    
    next();
  }
};

module.exports = {
  analyzeImageMiddleware
}; 