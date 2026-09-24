const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { connectMQTT } = require('./src/config/mqtt');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Connect to MQTT Broker for real-time telemetry processing
connectMQTT(io);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
