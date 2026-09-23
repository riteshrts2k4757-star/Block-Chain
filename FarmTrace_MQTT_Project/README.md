# FarmTrace MQTT Setup

## Architecture

Phone hotspot `r6`
→ ESP32 Driver Gateway
→ MQTT broker on laptop
→ server.js
→ live web dashboard

The nRF24 connection between the Driver Gateway and Container ESP32 is preserved.

## Files

- `gateway_esp32/FarmTrace_Gateway.ino`
- `container_esp32/FarmTrace_Container.ino`
- `server/server.js`
- `server/package.json`
- `server/public/index.html`

## 1. Start server

Open a terminal in the `server` folder:

```bash
npm install
node server.js
```

The server prints the computer's IPv4 addresses.

Example:

```text
Wi-Fi: 192.168.43.100
```

## 2. Configure ESP32 gateway

Open:

`gateway_esp32/FarmTrace_Gateway.ino`

Change:

```cpp
#define MQTT_BROKER_IP "192.168.43.100"
```

to the IP printed by your computer.

Do NOT use `localhost` or `127.0.0.1` in the ESP32 code.

## 3. Network

Connect the computer and ESP32 to the same hotspot:

SSID:
`r6`

Password:
`Riyanshu#1#2#3`

The computer's hotspot IP may be different from the example.

## 4. Dashboard

After `node server.js`:

`http://localhost:3000`

For another device on the same hotspot:

`http://<computer-ip>:3000`

## 5. MQTT

Embedded MQTT broker:

- Port: 1883
- Data: `farmtrace/gateway/data`
- Status: `farmtrace/gateway/status`
- Commands: `farmtrace/gateway/command`
- Responses: `farmtrace/gateway/response`

## 6. Arduino libraries

Gateway ESP32:

- PubSubClient
- RF24
- Adafruit MPU6050
- Adafruit Unified Sensor

Container ESP32:

- RF24
- DHT sensor library

## Important

The supplied container packet structure is preserved.

The gateway is now ESP32 and connects to the hotspot instead of creating its own Wi-Fi network.

The container still communicates with the gateway using nRF24.
