# Gemini API Setup Guide

## Getting Started with Gemini API

To use the Gemini API in this application, you need to:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

## Environment Configuration

Create a file named `.env` in the `backend/config/` directory with the following content:

```
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/socialapp

# Port
PORT=5000

# Google Gemini API Key
GEMINI_API_KEY=your_actual_api_key_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Environment
NODE_ENV=development
```

Replace `your_actual_api_key_here` with the API key you obtained from Google AI Studio.

## Testing Your Setup

After configuring your API key, run the test script:

```
node test-gemini.js
```

This will test your Gemini 2.0 Flash model connection and verify if your API key is working correctly.

## Model Information

This application uses the **Gemini 2.0 Flash** model for:
- Image analysis and description generation
- Content recommendations
- Text-based AI queries

Make sure your API key has access to the Gemini 2.0 Flash model. Some API keys may be restricted to certain models based on your region or account type.

## Troubleshooting

If you encounter issues:

1. Ensure your API key is correctly copied (no spaces or extra characters)
2. Verify your Google account has access to the Gemini 2.0 Flash model
3. Check if you've reached your API usage quota
4. Make sure your .env file is in the correct location
5. Restart your application after making changes

## API Documentation

For more information on using the Gemini API, refer to the [official documentation](https://ai.google.dev/docs). 