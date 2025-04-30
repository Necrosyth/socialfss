import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getPosts = async () => {
    const response = await axios.get(`${API_URL}/posts`);
    return response.data;
};

export const createPost = async (postData) => {
    // Create a FormData object to handle file uploads
    const formData = new FormData();
    
    // Add text fields
    formData.append('description', postData.description);
    formData.append('userId', 'clem'); // Default user
    
    // If there's a title, add it
    if (postData.title) {
        formData.append('title', postData.title);
    }
    
    // Handle image - check if it's a File object
    if (postData.image) {
        if (postData.image instanceof File) {
            // If it's already a File object, append it directly
            formData.append('image', postData.image);
        } else if (typeof postData.image === 'string' && postData.image.startsWith('blob:')) {
            // If it's a blob URL, we need to fetch the actual file
            console.warn('Image is a blob URL. Please provide a File object instead.');
            throw new Error('Cannot upload blob URL directly. Please provide a File object.');
        } else if (typeof postData.image === 'string') {
            // If it's a string but not a blob URL, it might be a base64 or an existing image path
            formData.append('imageUrl', postData.image);
        }
    }
    
    // Make the API request with the FormData
    const response = await axios.post(`${API_URL}/posts`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data;
};

export const likePost = async (postId) => {
    const response = await axios.put(`${API_URL}/posts/${postId}/like`, { 
        userId: "clem" // Default user
    });
    return response.data;
};

export const addComment = async (postId, commentData) => {
    const response = await axios.put(`${API_URL}/posts/${postId}/comment`, {
        ...commentData,
        userId: "clem" // Default user
    });
    return response.data;
};

export const deletePost = async (postId) => {
    const response = await axios.delete(`${API_URL}/posts/${postId}`);
    return response.data;
}; 