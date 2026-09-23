/*
  FARMTRACE - DRIVER GATEWAY
  Board: ESP32

  Wi-Fi:
    SSID: r6
    Password: Riyanshu#1#2#3

  MQTT:
    Broker IP: CHANGE THIS TO THE IP PRINTED BY server.js
    Port: 1883

  Driver:
    MQ-3 AO -> GPIO34
    MPU6050 SDA -> GPIO21
    MPU6050 SCL -> GPIO22

  nRF24:
    CE   -> GPIO4
    CSN  -> GPIO5
    MOSI -> GPIO23
    MISO -> GPIO19
    SCK  -> GPIO18

  Existing container nRF24 packet format is preserved.
*/

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <RF24.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

#define WIFI_SSID     "r6"
#define WIFI_PASSWORD "Riyanshu#1#2#3"

// CHANGE THIS after running server.js.
// Use the PC/laptop IPv4 address shown by server.js.
#define MQTT_BROKER_IP "192.168.43.100"
#define MQTT_PORT 1883

#define MQTT_DATA_TOPIC     "farmtrace/gateway/data"
#define MQTT_STATUS_TOPIC   "farmtrace/gateway/status"
#define MQTT_COMMAND_TOPIC  "farmtrace/gateway/command"
#define MQTT_RESPONSE_TOPIC "farmtrace/gateway/response"

#define MQ3_PIN 34
#define I2C_SDA 21
#define I2C_SCL 22

#define NRF24_CE_PIN 4
#define NRF24_CSN_PIN 5
#define NRF24_CHANNEL 108

const byte ADDRESS_CONTAINER[6] = "CNT01";
const byte ADDRESS_GATEWAY[6]   = "GTW01";

#define PKT_DATA      0x01
#define PKT_ACK       0x02
#define PKT_COMMAND   0x03
#define PKT_RESPONSE  0x04
#define CMD_REQUEST_BATTERY 0x10

struct SensorDataPacket {
  uint8_t type;
  uint16_t sequence;
  uint32_t timestamp;
  float temperature;
  float humidity;
  uint16_t mq6Raw;
  uint8_t batteryPct;
  float solarVoltage;
  uint8_t hashFragment[8];
};

struct AckPacket {
  uint8_t type;
  uint16_t sequence;
};

struct CommandPacket {
  uint8_t type;
  uint8_t commandCode;
  uint32_t commandId;
};

struct ResponsePacket {
  uint8_t type;
  uint8_t commandCode;
  uint32_t commandId;
  float value1;
};

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
RF24 radio(NRF24_CE_PIN, NRF24_CSN_PIN);
Adafruit_MPU6050 mpu;

SensorDataPacket latestContainerData = {};
bool containerDataAvailable = false;
unsigned long lastContainerPacket = 0;
unsigned long containerPacketCount = 0;

float accelX = 0, accelY = 0, accelZ = 0;
float gyroX = 0, gyroY = 0, gyroZ = 0;
float mpuTemp = 0;
uint16_t mq3Raw = 0;

bool mpuReady = false;
bool radioReady = false;

unsigned long lastSensorUpdate = 0;
unsigned long lastPublish = 0;
unsigned long lastWiFiAttempt = 0;
unsigned long lastMQTTAttempt = 0;

const unsigned long SENSOR_INTERVAL = 1000;
const unsigned long MQTT_INTERVAL = 1000;
const unsigned long RECONNECT_INTERVAL = 5000;

void publishStatus(const char* status) {
  if (!mqttClient.connected()) return;

  char payload[256];
  snprintf(
    payload, sizeof(payload),
    "{\"status\":\"%s\",\"device\":\"driver_gateway\",\"ip\":\"%s\",\"radio\":%s,\"mpu\":%s}",
    status,
    WiFi.localIP().toString().c_str(),
    radioReady ? "true" : "false",
    mpuReady ? "true" : "false"
  );

  mqttClient.publish(MQTT_STATUS_TOPIC, payload, true);
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println();
  Serial.println("[WIFI] Connecting to hotspot: r6");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();

  while (WiFi.status() != WL_CONNECTED &&
         millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("[WIFI] CONNECTED");
    Serial.print("[WIFI] ESP32 IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WIFI] Gateway: ");
    Serial.println(WiFi.gatewayIP());
    Serial.print("[WIFI] RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("[WIFI] CONNECTION FAILED");
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;

  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("[MQTT] Command: ");
  Serial.println(message);

  if (String(topic) == MQTT_COMMAND_TOPIC &&
      message.indexOf("REQUEST_BATTERY") >= 0) {

    if (!radioReady) {
      mqttClient.publish(
        MQTT_RESPONSE_TOPIC,
        "{\"status\":\"error\",\"message\":\"nRF24 unavailable\"}"
      );
      return;
    }

    CommandPacket command = {};
    command.type = PKT_COMMAND;
    command.commandCode = CMD_REQUEST_BATTERY;
    command.commandId = millis();

    radio.stopListening();
    bool sent = radio.write(&command, sizeof(command));
    radio.startListening();

    if (sent) {
      Serial.println("[COMMAND] Battery request sent to container.");
      mqttClient.publish(
        MQTT_RESPONSE_TOPIC,
        "{\"status\":\"queued\",\"command\":\"REQUEST_BATTERY\"}"
      );
    } else {
      Serial.println("[COMMAND] nRF24 transmission failed.");
      mqttClient.publish(
        MQTT_RESPONSE_TOPIC,
        "{\"status\":\"error\",\"message\":\"nRF24 transmission failed\"}"
      );
    }
  }
}

void connectMQTT() {
  if (mqttClient.connected()) return;
  if (WiFi.status() != WL_CONNECTED) return;

  Serial.print("[MQTT] Connecting to ");
  Serial.print(MQTT_BROKER_IP);
  Serial.print(":");
  Serial.println(MQTT_PORT);

  String clientId = "FarmTrace-Gateway-" + String((uint32_t)ESP.getEfuseMac(), HEX);

  if (mqttClient.connect(clientId.c_str())) {
    Serial.println("[MQTT] BROKER CONNECTED");
    mqttClient.subscribe(MQTT_COMMAND_TOPIC);
    publishStatus("online");
  } else {
    Serial.print("[MQTT] FAILED, state=");
    Serial.println(mqttClient.state());
  }
}

void updateSensors() {
  mq3Raw = analogRead(MQ3_PIN);

  if (!mpuReady) return;

  sensors_event_t acceleration, gyro, temperature;
  mpu.getEvent(&acceleration, &gyro, &temperature);

  accelX = acceleration.acceleration.x;
  accelY = acceleration.acceleration.y;
  accelZ = acceleration.acceleration.z;

  gyroX = gyro.gyro.x;
  gyroY = gyro.gyro.y;
  gyroZ = gyro.gyro.z;

  mpuTemp = temperature.temperature;
}

void publishData() {
  if (!mqttClient.connected()) return;

  char payload[1800];

  unsigned long packetAge =
    containerDataAvailable ? millis() - lastContainerPacket : 0;

  snprintf(
    payload, sizeof(payload),
    "{"
      "\"timestamp\":%lu,"
      "\"driver\":{"
        "\"mq3\":%u,"
        "\"motion\":{\"x\":%.3f,\"y\":%.3f,\"z\":%.3f},"
        "\"gyro\":{\"x\":%.3f,\"y\":%.3f,\"z\":%.3f},"
        "\"temperature\":%.2f"
      "},"
      "\"container\":%s,"
      "\"connection\":{"
        "\"wifi\":true,"
        "\"mqtt\":%s,"
        "\"radio\":%s,"
        "\"containerData\":%s"
      "},"
      "\"gateway\":{"
        "\"ip\":\"%s\","
        "\"packets\":%lu,"
        "\"lastPacketMs\":%lu"
      "}"
    "}",
    millis(),
    mq3Raw,
    accelX, accelY, accelZ,
    gyroX, gyroY, gyroZ,
    mpuTemp,
    containerDataAvailable ? 
      String(
        "{\"sequence\":" + String(latestContainerData.sequence) +
        ",\"temperature\":" + String(latestContainerData.temperature, 2) +
        ",\"humidity\":" + String(latestContainerData.humidity, 2) +
        ",\"mq6\":" + String(latestContainerData.mq6Raw) +
        ",\"battery\":" + String(latestContainerData.batteryPct) +
        ",\"solar\":" + String(latestContainerData.solarVoltage, 2) +
        ",\"packetAgeMs\":" + String(packetAge) +
        "}"
      ).c_str()
      : "null",
    mqttClient.connected() ? "true" : "false",
    radioReady ? "true" : "false",
    containerDataAvailable ? "true" : "false",
    WiFi.localIP().toString().c_str(),
    containerPacketCount,
    packetAge
  );

  mqttClient.publish(MQTT_DATA_TOPIC, payload);
}

void printCombinedData() {
  Serial.println();
  Serial.println("============================================================");
  Serial.println("                    FARMTRACE LIVE DATA");
  Serial.println("============================================================");

  Serial.println("[DRIVER]");
  Serial.printf("MQ-3 ADC       : %u\n", mq3Raw);
  Serial.printf("Accel X/Y/Z     : %.3f / %.3f / %.3f m/s2\n", accelX, accelY, accelZ);
  Serial.printf("Gyro X/Y/Z      : %.3f / %.3f / %.3f rad/s\n", gyroX, gyroY, gyroZ);
  Serial.printf("MPU Temp        : %.2f C\n", mpuTemp);

  Serial.println();
  Serial.println("[CONTAINER / nRF24]");

  if (containerDataAvailable) {
    Serial.printf("Sequence        : %u\n", latestContainerData.sequence);
    Serial.printf("Temperature     : %.2f C\n", latestContainerData.temperature);
    Serial.printf("Humidity        : %.2f %%\n", latestContainerData.humidity);
    Serial.printf("MQ-6 ADC         : %u\n", latestContainerData.mq6Raw);
    Serial.printf("Battery         : %u %%\n", latestContainerData.batteryPct);
    Serial.printf("Solar           : %.2f V\n", latestContainerData.solarVoltage);
    Serial.printf("Packet Age      : %lu ms\n", millis() - lastContainerPacket);
  } else {
    Serial.println("Status          : WAITING FOR CONTAINER");
  }

  Serial.println();
  Serial.println("[CONNECTION]");
  Serial.print("Wi-Fi           : ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "CONNECTED" : "DISCONNECTED");
  Serial.print("MQTT            : ");
  Serial.println(mqttClient.connected() ? "CONNECTED" : "DISCONNECTED");
  Serial.print("nRF24            : ");
  Serial.println(radioReady ? "DETECTED / READY" : "NOT DETECTED");
  Serial.println("============================================================");
}

void processRadio() {
  if (!radioReady || !radio.available()) return;

  uint8_t buffer[32] = {0};
  radio.read(buffer, sizeof(buffer));

  if (buffer[0] == PKT_DATA) {
    memcpy(&latestContainerData, buffer, sizeof(SensorDataPacket));

    containerDataAvailable = true;
    lastContainerPacket = millis();
    containerPacketCount++;

    AckPacket ack = {};
    ack.type = PKT_ACK;
    ack.sequence = latestContainerData.sequence;

    radio.stopListening();
    bool sent = radio.write(&ack, sizeof(ack));
    radio.startListening();

    Serial.print("[RADIO] Container packet received. Sequence=");
    Serial.println(latestContainerData.sequence);

    Serial.println(
      sent ? "[RADIO] ACK sent." : "[RADIO] ACK failed."
    );

    printCombinedData();
  }
  else if (buffer[0] == PKT_RESPONSE) {
    ResponsePacket response = {};
    memcpy(&response, buffer, sizeof(response));

    char payload[200];
    snprintf(
      payload, sizeof(payload),
      "{\"status\":\"success\",\"commandCode\":%u,\"commandId\":%lu,\"value1\":%.2f}",
      response.commandCode,
      (unsigned long)response.commandId,
      response.value1
    );

    mqttClient.publish(MQTT_RESPONSE_TOPIC, payload);

    Serial.println("[RADIO] Command response forwarded to MQTT.");
  }
}

void initializeMPU() {
  Serial.println("[SENSOR] Starting MPU6050...");

  Wire.begin(I2C_SDA, I2C_SCL);
  delay(200);

  if (!mpu.begin()) {
    Serial.println("[SENSOR] ERROR: MPU6050 NOT detected.");
    mpuReady = false;
    return;
  }

  mpuReady = true;

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  Serial.println("[SENSOR] MPU6050 DETECTED / READY");
}

void initializeRadio() {
  Serial.println();
  Serial.println("[RADIO] Starting nRF24L01...");

  SPI.begin();

  if (!radio.begin()) {
    Serial.println("[RADIO] ERROR: nRF24 NOT DETECTED!");
    radioReady = false;
    return;
  }

  if (!radio.isChipConnected()) {
    Serial.println("[RADIO] CHIP NOT CONNECTED / NOT RESPONDING!");
    radioReady = false;
    return;
  }

  radioReady = true;

  radio.setChannel(NRF24_CHANNEL);
  radio.setDataRate(RF24_1MBPS);
  radio.setPALevel(RF24_PA_LOW);
  radio.setRetries(5, 15);

  radio.openWritingPipe(ADDRESS_CONTAINER);
  radio.openReadingPipe(1, ADDRESS_GATEWAY);
  radio.startListening();

  Serial.println("[RADIO] nRF24 DETECTED / READY");
  Serial.print("[RADIO] Channel: ");
  Serial.println(NRF24_CHANNEL);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("============================================================");
  Serial.println("                 FARMTRACE DRIVER GATEWAY");
  Serial.println("                 ESP32 + MQTT + nRF24");
  Serial.println("============================================================");

  initializeMPU();

  pinMode(MQ3_PIN, INPUT);
  mq3Raw = analogRead(MQ3_PIN);
  Serial.print("[SENSOR] MQ-3 initialized. ADC=");
  Serial.println(mq3Raw);

  initializeRadio();

  mqttClient.setServer(MQTT_BROKER_IP, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(2048);

  connectWiFi();
  connectMQTT();

  Serial.println();
  Serial.println("============================================================");
  Serial.println("                    GATEWAY READY");
  Serial.println("============================================================");
}

void loop() {
  unsigned long now = millis();

  if (WiFi.status() != WL_CONNECTED &&
      now - lastWiFiAttempt >= RECONNECT_INTERVAL) {
    lastWiFiAttempt = now;
    connectWiFi();
  }

  if (!mqttClient.connected() &&
      now - lastMQTTAttempt >= RECONNECT_INTERVAL) {
    lastMQTTAttempt = now;
    connectMQTT();
  }

  mqttClient.loop();

  if (now - lastSensorUpdate >= SENSOR_INTERVAL) {
    lastSensorUpdate = now;
    updateSensors();
  }

  processRadio();

  if (mqttClient.connected() &&
      now - lastPublish >= MQTT_INTERVAL) {
    lastPublish = now;
    publishData();
  }

  delay(5);
}
