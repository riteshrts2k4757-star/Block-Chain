const app = require('./src/app');
const { connectMQTT } = require('./src/config/mqtt');

const PORT = process.env.PORT || 5000;

// Connect to MQTT Broker for real-time telemetry processing
connectMQTT();

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
