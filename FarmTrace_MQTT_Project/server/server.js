const os = require("os");
const path = require("path");
const http = require("http");
const express = require("express");
const mqtt = require("mqtt");
const aedes = require("aedes")();
const net = require("net");
const cors = require("cors");
const { Server } = require("socket.io");

const HTTP_PORT = 3000;
const MQTT_PORT = 1883;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

const mqttServer = net.createServer(aedes.handle);

let latestDriverData = null;
let latestContainerData = null;
let latestStatus = {
  status: "offline",
  receivedAt: null
};

function getIPv4Addresses() {
  const interfaces = os.networkInterfaces();
  const result = [];

  for (const name of Object.keys(interfaces)) {
    for (const info of interfaces[name] || []) {
      if (info.family === "IPv4" && !info.internal) {
        result.push({
          interface: name,
          address: info.address
        });
      }
    }
  }

  return result;
}

aedes.on("client", client => {
  console.log(`[MQTT] Client connected: ${client ? client.id : "unknown"}`);
});

aedes.on("clientDisconnect", client => {
  console.log(`[MQTT] Client disconnected: ${client ? client.id : "unknown"}`);
});

aedes.on("publish", packet => {
  if (!packet.topic || !packet.payload) return;

  const topic = packet.topic.toString();

  // No longer printing all raw payloads to avoid terminal spam

  if (topic === "farmtrace/driver/data" || topic.endsWith("driver/data")) {
    try {
      latestDriverData = JSON.parse(packet.payload.toString());
      latestDriverData.receivedAt = new Date().toISOString();
      io.emit("farmtrace:driver:data", latestDriverData);
      // console.log(`[DRIVER DATA] MQ3=${latestDriverData.mq3 ?? "-"} | Temp=${latestDriverData.temperature ?? "-"}`);
    } catch (err) {
      console.error("[MQTT] Invalid driver JSON:", err.message);
    }
  }

  if (topic === "farmtrace/container/data" || topic.endsWith("container/data")) {
    try {
      latestContainerData = JSON.parse(packet.payload.toString());
      latestContainerData.receivedAt = new Date().toISOString();
      io.emit("farmtrace:container:data", latestContainerData);
      // console.log(`[CONTAINER DATA] Temp=${latestContainerData.temperature ?? "-"} | Humidity=${latestContainerData.humidity ?? "-"} | MQ6=${latestContainerData.mq6 ?? "-"}`);
    } catch (err) {
      console.error("[MQTT] Invalid container JSON:", err.message);
    }
  }

  // Handle any topic that ends with "status"
  if (topic.endsWith("status")) {
    try {
      latestStatus = {
        ...JSON.parse(packet.payload.toString()),
        receivedAt: new Date().toISOString()
      };

      io.emit("farmtrace:status", latestStatus);
      // console.log("[STATUS PROCESSED]", latestStatus);
    } catch (err) {
      console.error("[MQTT] Invalid status JSON:", err.message);
    }
  }

  // Handle response topics
  if (topic.endsWith("response")) {
    try {
      const response = JSON.parse(packet.payload.toString());
      io.emit("farmtrace:response", response);
    } catch (err) {
      console.error("[MQTT] Invalid response JSON:", err.message);
    }
  }
});

app.get("/api/data", (req, res) => {
  res.json({
    driverData: latestDriverData,
    containerData: latestContainerData,
    status: latestStatus
  });
});

app.post("/api/command", (req, res) => {
  const command = req.body || {};

  const payload = JSON.stringify(command);

  aedes.publish({
    cmd: "publish",
    topic: "farmtrace/gateway/command",
    payload: Buffer.from(payload),
    qos: 0,
    retain: false
  }, err => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }

    res.json({
      status: "queued",
      command
    });
  });
});

io.on("connection", socket => {
  console.log(`[SOCKET] Dashboard connected: ${socket.id}`);

  if (latestDriverData) {
    socket.emit("farmtrace:driver:data", latestDriverData);
  }
  if (latestContainerData) {
    socket.emit("farmtrace:container:data", latestContainerData);
  }

  socket.emit("farmtrace:status", latestStatus);

  socket.on("request-battery", () => {
    const payload = JSON.stringify({
      command: "REQUEST_BATTERY"
    });

    aedes.publish({
      cmd: "publish",
      topic: "farmtrace/gateway/command",
      payload: Buffer.from(payload),
      qos: 0,
      retain: false
    });
  });
});

mqttServer.listen(MQTT_PORT, "0.0.0.0", () => {
  console.log("");
  console.log("============================================================");
  console.log("                 FARMTRACE MQTT BROKER");
  console.log("============================================================");
  console.log(`MQTT Port: ${MQTT_PORT}`);
});

httpServer.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log("");
  console.log("============================================================");
  console.log("                 FARMTRACE SERVER");
  console.log("============================================================");
  console.log(`Dashboard: http://localhost:${HTTP_PORT}`);
  console.log(`API:       http://localhost:${HTTP_PORT}/api/data`);
  console.log("");

  console.log("Use one of these IP addresses as MQTT_BROKER_IP");
  console.log("inside the ESP32 gateway code:");

  for (const item of getIPv4Addresses()) {
    console.log(`  ${item.interface}: ${item.address}`);
  }

  console.log("");
  console.log("IMPORTANT:");
  console.log("ESP32 and this computer must be connected to the SAME hotspot.");
  console.log("============================================================");
});

process.on("SIGINT", () => {
  console.log("\nShutting down FarmTrace...");
  mqttServer.close();
  httpServer.close();
  process.exit(0);
});
