const path = require('path');
const fs = require('fs');
const { createCanvas } = require('canvas');
const { analyzeImage } = require('./utils/geminiService');

// Function to create a test image
function createTestImage(outputPath) {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#3498db';
  ctx.fillRect(0, 0, width, height);

  // Draw some shapes
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 100, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(100, 100, 200, 150);

  // Add text
  ctx.font = '30px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Test Image for Gemini Vision API', 150, 500);

  // Save image to a file
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Test image created at: ${outputPath}`);
  return outputPath;
}

async function testVisionAnalysis() {
  try {
    // Check if test image exists in uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Look for existing images in the uploads directory
    let files = [];
    try {
      files = fs.readdirSync(uploadsDir);
    } catch (err) {
      console.log('Error reading uploads directory:', err.message);
    }
    
    let testImagePath = null;
    
    for (const file of files) {
      if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
        testImagePath = path.join(uploadsDir, file);
        console.log(`Found existing image to test: ${file}`);
        break;
      }
    }
    
    // If no image found, check uploads/posts directory
    if (!testImagePath) {
      const postsDir = path.join(uploadsDir, 'posts');
      if (fs.existsSync(postsDir)) {
        try {
          const postFiles = fs.readdirSync(postsDir);
          for (const file of postFiles) {
            if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
              testImagePath = path.join(postsDir, file);
              console.log(`Found existing image in posts directory: ${file}`);
              break;
            }
          }
        } catch (err) {
          console.log('Error reading posts directory:', err.message);
        }
      }
    }
    
    // If still no image found, create a simple test image
    if (!testImagePath) {
      console.log('No existing images found. Creating a test image...');
      try {
        testImagePath = path.join(uploadsDir, 'test-image.jpg');
        testImagePath = createTestImage(testImagePath);
      } catch (err) {
        console.error('Failed to create test image:', err.message);
        console.log('Please place a test image in the uploads directory and run the test again.');
        return;
      }
    }
    
    // Get the MIME type from file extension
    const ext = path.extname(testImagePath).toLowerCase();
    let mimeType = 'image/jpeg'; // default
    
    if (ext === '.png') mimeType = 'image/png';
    if (ext === '.gif') mimeType = 'image/gif';
    if (ext === '.webp') mimeType = 'image/webp';
    
    console.log(`Testing image analysis with: ${testImagePath}`);
    console.log(`MIME Type: ${mimeType}`);
    
    // Run the image analysis
    console.log('Analyzing image...');
    const result = await analyzeImage(testImagePath, mimeType);
    
    // Display the result
    console.log('\n====== ANALYSIS RESULT ======');
    console.log(`Title: ${result.title}`);
    console.log(`Description: ${result.description}`);
    console.log(`Tags: ${result.tags.join(', ')}`);
    
    if (result.rawResponse) {
      console.log('\n====== RAW AI RESPONSE ======');
      console.log(result.rawResponse);
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testVisionAnalysis(); 