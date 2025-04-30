const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const { promisify } = require('util');

// Helper to create directories if they don't exist
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
};

// Setup multer disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Organize uploads by date (YYYY/MM/DD)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        const uploadPath = path.join(__dirname, '../uploads', String(year), month, day);
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

// Upload a single image
router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No image file provided' 
            });
        }
        
        // Return success with file path relative to the backend root
        const relativePath = getRelativePath(req.file.path);
        
        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            imagePath: relativePath,
            // Full URL would be: http://localhost:5000/uploads/path/to/image.jpg
            imageUrl: `/uploads${relativePath.replace('/uploads', '')}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error uploading image',
            error: error.message
        });
    }
});

// Delete an image
router.delete('/:year/:month/:day/:filename', async (req, res) => {
    try {
        const { year, month, day, filename } = req.params;
        const imagePath = path.join(__dirname, '../uploads', year, month, day, filename);
        
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Image not found' 
            });
        }
        
        // Delete the file
        await promisify(fs.unlink)(imagePath);
        
        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting image',
            error: error.message
        });
    }
});

// Proxy external images to avoid CORS issues
router.get('/proxy', async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ 
            success: false, 
            message: 'No URL provided' 
        });
    }
    
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });
        
        // Forward content type
        res.setHeader('Content-Type', response.headers['content-type']);
        
        // Stream the image
        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error proxying image',
            error: error.message
        });
    }
});

// Get image information
router.get('/info', (req, res) => {
    const { path: imagePath } = req.query;
    
    if (!imagePath) {
        return res.status(400).json({ 
            success: false, 
            message: 'No image path provided' 
        });
    }
    
    try {
        const fullPath = path.join(__dirname, '..', imagePath);
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Image not found' 
            });
        }
        
        // Get file stats
        const stats = fs.statSync(fullPath);
        
        res.status(200).json({
            success: true,
            size: stats.size,
            lastModified: stats.mtime,
            path: imagePath,
            url: `/uploads${imagePath.replace('/uploads', '')}`
        });
    } catch (error) {
        console.error('Info error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error getting image information',
            error: error.message
        });
    }
});

module.exports = router; 