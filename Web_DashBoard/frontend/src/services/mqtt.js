import { io } from 'socket.io-client';
import { queueCommand } from './api';

const SOCKET_URL = 'http://localhost:3000';
let socket = null;
const listeners = new Set();

export const connectMQTT = () => {
  if (socket) return;

  console.log('Connecting to Local FarmTrace Server...');
  socket = io(SOCKET_URL);

  socket.on('connect', () => {
    console.log('Web Socket Connected');
  });

  socket.on('farmtrace:container:data', (data) => {
    listeners.forEach(listener => listener({ topic: 'farmtrace/container/data', data }));
  });

  socket.on('farmtrace:driver:data', (data) => {
    listeners.forEach(listener => listener({ topic: 'farmtrace/driver/data', data }));
  });
  
  socket.on('connect_error', (err) => {
    console.error('Socket Connection Error', err);
  });
};

export const subscribeToTelemetry = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const publishCommand = (deviceId, command) => {
  // We can queue the command to the backend API or send it over socket if server supports it.
  // We'll queue it via API.
  queueCommand(deviceId, command).catch(err => console.error(err));
  return true;
};
