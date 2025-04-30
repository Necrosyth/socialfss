import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [ws, setWs] = useState(null);
    const [username, setUsername] = useState('User' + Math.floor(Math.random() * 1000));
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [reconnectAttempt, setReconnectAttempt] = useState(0);
    const messagesEndRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const processedMsgIds = useRef(new Set());

    const connectWebSocket = () => {
        // Don't create a new connection if one already exists and is open/connecting
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
            console.log('WebSocket connection already exists, not creating a new one');
            return;
        }

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        setConnectionStatus('connecting');
        
        // Connect to WebSocket server
        const websocket = new WebSocket('ws://localhost:8080');
        
        websocket.onopen = () => {
            console.log('Connected to WebSocket server');
            setConnectionStatus('connected');
            setReconnectAttempt(0);
            
            // Send username to server
            websocket.send(JSON.stringify({
                type: 'username',
                username: username,
                id: generateMessageId()
            }));
        };

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Check if we've already processed this message (using id or content as fallback)
                const msgId = data.id || `${data.username}-${data.timestamp}-${data.text}`;
                
                if (!processedMsgIds.current.has(msgId)) {
                    processedMsgIds.current.add(msgId);
                    
                    // Limit the size of the set to prevent memory leaks
                    if (processedMsgIds.current.size > 1000) {
                        const iterator = processedMsgIds.current.values();
                        processedMsgIds.current.delete(iterator.next().value);
                    }
                    
                    setMessages(prevMessages => [...prevMessages, data]);
                } else {
                    console.log('Duplicate message detected, skipping:', msgId);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        websocket.onclose = (event) => {
            // Only attempt reconnect if the current websocket is the one that closed
            if (ws === websocket) {
                console.log(`Disconnected from WebSocket server (code: ${event.code})`);
                setConnectionStatus('disconnected');
                setWs(null);
                
                if (event.code !== 1000) { // Not a normal closure
                    // Try to reconnect with exponential backoff
                    const delay = Math.min(1000 * (2 ** reconnectAttempt), 30000); // Max 30 second delay
                    console.log(`Attempting to reconnect in ${delay/1000} seconds...`);
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        setReconnectAttempt(prev => prev + 1);
                        connectWebSocket();
                    }, delay);
                }
            }
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            // The onclose handler will be called after this
        };

        setWs(websocket);
    };

    // Generate a unique message ID
    const generateMessageId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    };

    useEffect(() => {
        // Initial connection
        connectWebSocket();

        // Cleanup on unmount
        return () => {
            if (ws) {
                console.log('Closing WebSocket connection due to component unmount');
                ws.close(1000, 'Component unmounted');
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount, not when username changes

    // Handle username change separately
    useEffect(() => {
        // If we're connected, send the new username
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'username',
                username: username,
                id: generateMessageId()
            }));
        }
    }, [username, ws]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && ws && ws.readyState === WebSocket.OPEN) {
            const messageId = generateMessageId();
            const messageData = {
                type: 'message',
                username: username,
                text: message,
                timestamp: new Date().toISOString(),
                id: messageId
            };
            ws.send(JSON.stringify(messageData));
            setMessage('');
        } else if (!ws || ws.readyState !== WebSocket.OPEN) {
            // Add a local message if there's no connection
            setMessages(prevMessages => [...prevMessages, {
                type: 'system',
                text: 'Cannot send message: Not connected to chat server',
                timestamp: new Date().toISOString(),
                id: generateMessageId()
            }]);
        }
    };

    const getStatusIcon = () => {
        switch(connectionStatus) {
            case 'connected':
                return '🟢';
            case 'connecting':
                return '🟡';
            case 'disconnected':
                return '🔴';
            default:
                return '⚪';
        }
    };

    const manualReconnect = () => {
        if (ws) {
            console.log('Manually closing WebSocket connection for reconnect');
            ws.close(1000, 'Manual reconnect');
        } else {
            connectWebSocket();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>Chat Room</h2>
                <div className="connection-status">
                    <span title={connectionStatus}>{getStatusIcon()}</span>
                    {connectionStatus !== 'connected' && (
                        <button onClick={manualReconnect} className="reconnect-button">
                            Reconnect
                        </button>
                    )}
                </div>
                <div className="username">You are: {username}</div>
            </div>
            <div className="messages">
                {connectionStatus !== 'connected' && (
                    <div className="connection-message">
                        {connectionStatus === 'connecting' 
                            ? 'Connecting to chat server...' 
                            : 'Disconnected from chat server. Messages cannot be sent at this time.'}
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={msg.id || index} className={`message ${
                        msg.type === 'system' ? 'system-message' : 
                        msg.username === username ? 'own-message' : ''
                    }`}>
                        <div className="message-header">
                            {msg.type !== 'system' && <span className="username">{msg.username}</span>}
                            <span className="timestamp">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="message-text">{msg.text}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="message-form">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={connectionStatus !== 'connected'}
                />
                <button type="submit" disabled={connectionStatus !== 'connected'}>Send</button>
            </form>
        </div>
    );
};

export default Chat; 