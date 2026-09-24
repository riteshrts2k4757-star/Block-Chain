// src/config.js

// The base URL for all REST API calls. 
// Uses the VITE_API_URL environment variable if deployed, otherwise falls back to the local backend.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// The URL for the WebSocket / MQTT connection (socket.io).
// We use the same backend URL because the main backend now hosts the Socket.io server.
export const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
