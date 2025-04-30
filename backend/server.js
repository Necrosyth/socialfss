const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');

// Load env vars - try multiple locations
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, 'config', '.env'),
  path.join(__dirname, 'config', 'example.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('No .env file found. Using default environment values.');
}

// Check for Gemini API key
if (!process.env.GEMINI_API_KEY) {
  console.warn(`Warning: GEMINI_API_KEY environment variable is not properly set. 
  Image analysis will run in fallback mode without AI features.
  To enable AI features, create a .env file with a valid API key from https://makersuite.google.com/app/apikey`);
} else {
  console.log('Gemini API key found. AI features are enabled.');
  console.log('API key value:', process.env.GEMINI_API_KEY.substring(0, 5) + '...');
}

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Also create posts uploads directory
const postsUploadsDir = path.join(__dirname, 'uploads', 'posts');
if (!fs.existsSync(postsUploadsDir)) {
    fs.mkdirSync(postsUploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An error occurred on the server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 