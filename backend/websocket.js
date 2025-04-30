const WebSocket = require('ws');

// Store connected clients with their usernames
const clients = new Map();

// Generate a unique message ID if one doesn't exist
const ensureMessageId = (message) => {
    try {
        const data = JSON.parse(message);
        if (!data.id) {
            data.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        }
        return JSON.stringify(data);
    } catch (e) {
        console.error('Error parsing message:', e);
        return message;
    }
};

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Store client with a temporary ID
    let clientId = Date.now().toString(36);
    clients.set(ws, { id: clientId, username: 'Anonymous' });

    // Send connection confirmation
    ws.send(JSON.stringify({
        type: 'system',
        text: 'Connected to chat server',
        timestamp: new Date().toISOString(),
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            console.log('Received:', message.toString());
            const messageData = JSON.parse(message.toString());
            
            // Add message ID if missing
            if (!messageData.id) {
                messageData.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
            }

            // Handle username registration
            if (messageData.type === 'username') {
                // Update client's username
                clients.set(ws, { 
                    id: clients.get(ws).id,
                    username: messageData.username 
                });
                
                // Notify everyone about the new user
                const userJoinedMessage = JSON.stringify({
                    type: 'system',
                    text: `${messageData.username} has joined the chat`,
                    timestamp: new Date().toISOString(),
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
                });
                
                // Broadcast to all clients except the one that sent the message
                clients.forEach((clientInfo, client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(userJoinedMessage);
                    }
                });
                
                // No need to further broadcast username messages
                return;
            }
            
            // Add the sender's username if it's missing
            if (!messageData.username && clients.has(ws)) {
                messageData.username = clients.get(ws).username;
            }
            
            // Prepare the message string once
            const messageString = JSON.stringify(messageData);
            
            // Broadcast message to all clients
            clients.forEach((clientInfo, client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(messageString);
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        // Get username before removing from clients
        const clientInfo = clients.get(ws);
        if (clientInfo) {
            console.log(`Client disconnected: ${clientInfo.username}`);
            
            // Notify others about the disconnection
            const userLeftMessage = JSON.stringify({
                type: 'system',
                text: `${clientInfo.username} has left the chat`,
                timestamp: new Date().toISOString(),
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
            });
            
            clients.forEach((info, client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(userLeftMessage);
                }
            });
            
            // Remove client from the map
            clients.delete(ws);
        } else {
            console.log('Unknown client disconnected');
        }
    });
});

// Handle server errors
wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

console.log('WebSocket server running on ws://localhost:8080'); 