// src/config.js

// The base URL for all REST API calls. 
// Uses the VITE_API_URL environment variable if deployed, otherwise falls back to the local backend.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// The URL for the WebSocket / MQTT connection (socket.io).
// If your backend is hosted at https://my-backend.onrender.com, use that instead.
export const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
