const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { analyzeImageMiddleware } = require('../middleware/imageAnalysis');
const { analyzeImage } = require('../utils/geminiService');

// Helper to create directories if they don't exist
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
};

// Setup multer storage for post images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Organize uploads by date (YYYY/MM/DD)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        const uploadPath = path.join(__dirname, '../uploads/posts', String(year), month, day);
        ensureDir(uploadPath);
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Create a safe filename with original extension
        const fileExt = path.extname(file.originalname).toLowerCase();
        const randomName = crypto.randomBytes(16).toString('hex');
        cb(null, `${randomName}${fileExt}`);
    }
});

// Filter function to validate uploads
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF and WEBP files are allowed.'), false);
    }
};

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Helper function to get the relative path from the absolute path
const getRelativePath = (absolutePath) => {
    return absolutePath.replace(path.join(__dirname, '..'), '').replace(/\\/g, '/');
};

// Test endpoint for Gemini API
router.get('/test-gemini', async (req, res) => {
    try {
        console.log('Testing Gemini API...');
        console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present (not shown for security)' : 'Not present');

        // Path to a sample image for testing
        const sampleImagePath = path.join(__dirname, '../uploads/sample-test-image.jpg');
        
        // Create a sample image if it doesn't exist
        if (!fs.existsSync(sampleImagePath)) {
            // Just copy the first image we find in the uploads directory as a sample
            const uploadDirs = path.join(__dirname, '../uploads');
            let sampleSource = null;
            
            // Look for any jpg in the uploads directory or its subdirectories
            const findJpg = (dir) => {
                const items = fs.readdirSync(dir, { withFileTypes: true });
                for (const item of items) {
                    const itemPath = path.join(dir, item.name);
                    if (item.isDirectory()) {
                        const found = findJpg(itemPath);
                        if (found) return found;
                    } else if (item.name.endsWith('.jpg') || item.name.endsWith('.jpeg')) {
                        return itemPath;
                    }
                }
                return null;
            };
            
            sampleSource = findJpg(uploadDirs);
            
            if (sampleSource) {
                // Create the sample image by copying an existing one
                fs.copyFileSync(sampleSource, sampleImagePath);
                console.log(`Created sample image at ${sampleImagePath} from ${sampleSource}`);
            } else {
                return res.status(404).json({ 
                    message: 'No sample image found to use for testing. Please upload a post with an image first.' 
                });
            }
        }
        
        // Test using Gemini 2.0 Flash model directly
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }
        
        // Read the image file
        const imageBuffer = await fs.promises.readFile(sampleImagePath);
        
        // Initialize Gemini client
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        
        console.log('Initializing Gemini 2.0 Flash model...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        // Convert image to Gemini-compatible format
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: 'image/jpeg'
            }
        };
        
        // Send prompt with image
        const prompt = `
          Analyze this image and provide:
          1. A catchy social media title for this image (one line)
          2. A detailed description of what you see in the imAGE(2-3 paragraphs)
          3. Tags: Generate 5-7 relevant tags for the image (categories, themes, objects, etc.)
          
          Format your response like this:
          [Title]
          
          [Description]
          
          Tags: tag1, tag2, tag3, tag4, tag5
        `;
        console.log('Sending request to Gemini API...');
        
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        
        // Extract title, description, and tags
        let title = '';
        let description = '';
        let tags = [];
        
        // Parse the response
        const lines = text.split('\n').filter(line => line.trim());
        
        // First line is the title
        if (lines.length > 0) {
          title = lines[0];
        }
        
        // Look for tags line
        const tagsLineIndex = lines.findIndex(line => 
          line.toLowerCase().startsWith('tag') || 
          line.toLowerCase().includes('tags:')
        );
        
        if (tagsLineIndex > 0) {
          // Get the description from lines between title and tags
          description = lines.slice(1, tagsLineIndex).join('\n').trim();
          
          // Extract tags
          const tagsLine = lines[tagsLineIndex];
          const tagsMatch = tagsLine.match(/tags:?\s*(.+)/i);
          if (tagsMatch && tagsMatch[1]) {
            tags = tagsMatch[1]
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0);
          }
        } else {
          // If no tags found, assume all lines after the first are the description
          description = lines.slice(1).join('\n').trim();
        }
        
        res.json({
            success: true,
            message: 'Gemini API test successful',
            result: {
                title,
                description,
                tags,
                rawResponse: text
            }
        });
    } catch (error) {
        console.error('Error testing Gemini API:', error);
        res.status(500).json({
            success: false,
            message: 'Gemini API test failed',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a post with image upload and analysis
router.post('/', upload.single('image'), analyzeImageMiddleware, async (req, res) => {
    console.log('Received post creation request with data:', req.body);

    try {
        // Create post object with all AI-generated fields
        const postData = {
            description: req.body.description,
            title: req.body.title || '',
            aiGeneratedTitle: req.body.aiGeneratedTitle || '',
            aiGeneratedDescription: req.body.aiGeneratedDescription || '',
            aiGeneratedTags: req.body.aiGeneratedTags || []
        };

        // If an image was uploaded, add the image path
        if (req.file) {
            const relativePath = getRelativePath(req.file.path);
            postData.image = `/uploads${relativePath.replace('/uploads', '')}`;
            
            // Verify we have AI analysis results
            if (!req.body.aiGeneratedTitle && !req.body.aiGeneratedDescription) {
                console.warn('Warning: Image was uploaded but no AI analysis results were attached');
            }
        }

        const post = new Post(postData);

        console.log('Attempting to save post:', post);
        const newPost = await post.save();
        console.log('Successfully saved post with AI-generated content:', {
            id: newPost._id,
            title: newPost.title,
            aiTitle: newPost.aiGeneratedTitle,
            aiTags: newPost.aiGeneratedTags
        });
        
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(400).json({ 
            message: error.message,
            details: error.errors // Include validation errors if any
        });
    }
});

// Like a post
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes('clem')) {
            await post.updateOne({ $push: { likes: 'clem' } });
            res.status(200).json('Post has been liked');
        } else {
            await post.updateOne({ $pull: { likes: 'clem' } });
            res.status(200).json('Post has been unliked');
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// Add comment
router.put('/:id/comment', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        await post.updateOne({
            $push: {
                comments: {
                    text: req.body.text
                }
            }
        });
        res.status(200).json('Comment added');
    } catch (error) {
        res.status(500).json(error);
    }
});

// Delete a post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        // If post has an image, delete it
        if (post.image && post.image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', post.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json('Post has been deleted');
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router; 