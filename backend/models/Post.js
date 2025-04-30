const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: 'clem'
    },
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    // AI-generated content fields
    aiGeneratedTitle: {
        type: String,
        default: ''
    },
    aiGeneratedDescription: {
        type: String,
        default: ''
    },
    aiGeneratedTags: {
        type: [String],
        default: []
    },
    likes: {
        type: [String],
        default: []
    },
    comments: [{
        userId: {
            type: String,
            default: 'clem'
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema); 