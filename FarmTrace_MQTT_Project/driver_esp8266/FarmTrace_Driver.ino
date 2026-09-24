/*
  ============================================================
             FARMTRACE - ESP8266 DRIVER NODE
             DIRECT WIFI + MQTT + NTP + NRF24
  ============================================================

  MQTT:
      broker.emqx.io
      port 1883

  Topic:
      farmtrace/driver/data
      farmtrace/driver/status

  EXISTING PINS - DO NOT CHANGE:

  MPU6050:
      SDA -> GPIO4 / D2
      SCL -> GPIO5 / D1

  MQ-3:
      AO -> A0

  NRF24:
      CE  -> GPIO2  / D4
      CSN -> GPIO15 / D8

  ============================================================
*/

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <SPI.h>
#include <RF24.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <time.h>

// ============================================================
// WIFI
// ============================================================

#define WIFI_SSID       "r6"
#define WIFI_PASSWORD   "Riyanshu#1#2#3"

// ============================================================
// MQTT
// ============================================================

#define MQTT_BROKER     "broker.emqx.io"
#define MQTT_PORT       1883

#define MQTT_CLIENT_ID  "FarmTrace_Driver_ESP8266"

#define TOPIC_DATA      "farmtrace/driver/data"
#define TOPIC_STATUS    "farmtrace/driver/status"

// ============================================================
// MPU6050
// Existing pins preserved
// ============================================================

#define I2C_SDA 4
#define I2C_SCL 5

// ============================================================
// MQ-3
// ============================================================

#define MQ3_PIN A0

// ============================================================
// NRF24
// Existing pins preserved
// ============================================================

#define NRF24_CE_PIN   2
#define NRF24_CSN_PIN  15
#define NRF24_CHANNEL  108

const byte ADDRESS_CONTAINER[6] = "CNT01";
const byte ADDRESS_GATEWAY[6]   = "GTW01";

RF24 radio(
  NRF24_CE_PIN,
  NRF24_CSN_PIN
);

// ============================================================
// TIMERS
// ============================================================

#define SENSOR_INTERVAL       500
#define MQTT_INTERVAL         5000
#define SERIAL_INTERVAL       2000
#define WIFI_RETRY_INTERVAL   10000
#define MQTT_RETRY_INTERVAL   3000

// ============================================================
// OBJECTS
// ============================================================

WiFiClient wifiClient;

PubSubClient mqtt(
  wifiClient
);

Adafruit_MPU6050 mpu;

// ============================================================
// SENSOR DATA
// ============================================================

uint16_t mq3Raw = 400;

float accelX = 0.0;
float accelY = 0.0;
float accelZ = 9.81;

float gyroX = 0.0;
float gyroY = 0.0;
float gyroZ = 0.0;

float mpuTemp = 28.0;

float batteryPercent = 92.0;
float solarVoltage = 4.10;

// ============================================================
// SENSOR STATUS
// ============================================================

bool mpuReady = false;

bool motionReal = false;
bool gyroReal = false;
bool temperatureReal = false;

bool mq3Real = true;

bool batteryReal = false;
bool solarReal = false;

// ============================================================
// TIMERS
// ============================================================

unsigned long lastSensorTime = 0;
unsigned long lastMqttTime = 0;
unsigned long lastSerialTime = 0;

unsigned long lastWiFiAttempt = 0;
unsigned long lastMQTTAttempt = 0;

// ============================================================
// MQTT COUNTERS
// ============================================================

unsigned long mqttPublishCount = 0;
unsigned long mqttPublishFailed = 0;

// ============================================================
// TIME
// ============================================================

bool timeSynchronized = false;

const char* NTP_SERVER_1 = "pool.ntp.org";
const char* NTP_SERVER_2 = "time.nist.gov";

const long GMT_OFFSET_SEC = 19800;
const int DAYLIGHT_OFFSET_SEC = 0;

// ============================================================
// BASE64
// ============================================================

const char base64Table[] =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz"
    "0123456789+/";

String base64Encode(const String& input) {

  String output;

  int val = 0;
  int valb = -6;

  for (
    unsigned char c : input
  ) {

    val = (val << 8) + c;

    valb += 8;

    while (valb >= 0) {

      output += base64Table[
        (val >> valb) & 0x3F
      ];

      valb -= 6;
    }
  }

  if (valb > -6) {

    output += base64Table[
      ((val << 8) >> (valb + 8)) & 0x3F
    ];
  }

  while (
    output.length() % 4
  ) {

    output += '=';
  }

  return output;
}

// ============================================================
// UNIX TIMESTAMP
// ============================================================

uint64_t getUnixTimestampMs() {

  time_t now = time(nullptr);

  if (now < 1700000000) {
    return 0;
  }

  return (
    (uint64_t)now * 1000ULL
  ) + (
    millis() % 1000
  );
}

// ============================================================
// ISO TIME
// ============================================================

String getISOTime() {

  struct tm timeinfo;

  if (
    !getLocalTime(
      &timeinfo,
      100
    )
  ) {

    return "1970-01-01T00:00:00";
  }

  char buffer[30];

  strftime(
    buffer,
    sizeof(buffer),
    "%Y-%m-%dT%H:%M:%S",
    &timeinfo
  );

  return String(buffer);
}

// ============================================================
// NTP
// ============================================================

void synchronizeTime() {

  Serial.println("[TIME] Synchronizing NTP...");

  configTime(
    GMT_OFFSET_SEC,
    DAYLIGHT_OFFSET_SEC,
    NTP_SERVER_1,
    NTP_SERVER_2
  );

  struct tm timeinfo;

  for (
    int i = 0;
    i < 20;
    i++
  ) {

    if (
      getLocalTime(
        &timeinfo,
        500
      )
    ) {

      timeSynchronized = true;

      Serial.println(
        "[TIME] NTP synchronized."
      );

      return;
    }

    delay(500);
  }

  Serial.println(
    "[TIME] NTP synchronization failed."
  );
}

// ============================================================
// WIFI
// ============================================================

void connectWiFi() {

  if (
    WiFi.status() ==
    WL_CONNECTED
  ) {

    return;
  }

  Serial.println(
    "[WIFI] Connecting..."
  );

  WiFi.disconnect();

  delay(300);

  WiFi.mode(WIFI_STA);

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  unsigned long start =
    millis();

  while (
    WiFi.status() != WL_CONNECTED &&
    millis() - start < 15000
  ) {

    delay(500);

    Serial.print(".");
  }

  Serial.println();

  if (
    WiFi.status() ==
    WL_CONNECTED
  ) {

    Serial.println(
      "[WIFI] Connected."
    );

    Serial.print(
      "[WIFI] IP: "
    );

    Serial.println(
      WiFi.localIP()
    );

    synchronizeTime();

  } else {

    Serial.println(
      "[WIFI] Connection failed."
    );
  }
}

// ============================================================
// WIFI MAINTENANCE
// ============================================================

void maintainWiFi() {

  if (
    WiFi.status() ==
    WL_CONNECTED
  ) {

    return;
  }

  if (
    millis() - lastWiFiAttempt >=
    WIFI_RETRY_INTERVAL
  ) {

    lastWiFiAttempt =
      millis();

    connectWiFi();
  }
}

// ============================================================
// MQTT
// ============================================================

bool connectMQTT() {

  if (
    WiFi.status() !=
    WL_CONNECTED
  ) {

    return false;
  }

  Serial.println(
    "[MQTT] Connecting..."
  );

  if (
    mqtt.connect(
      MQTT_CLIENT_ID
    )
  ) {

    Serial.println(
      "[MQTT] Connected."
    );

    mqtt.publish(
      TOPIC_STATUS,
      "driver_online"
    );

    return true;
  }

  Serial.print(
    "[MQTT] Failed, state="
  );

  Serial.println(
    mqtt.state()
  );

  return false;
}

// ============================================================
// MQTT MAINTENANCE
// ============================================================

void maintainMQTT() {

  mqtt.loop();

  if (
    mqtt.connected()
  ) {

    return;
  }

  if (
    millis() - lastMQTTAttempt >=
    MQTT_RETRY_INTERVAL
  ) {

    lastMQTTAttempt =
      millis();

    connectMQTT();
  }
}

// ============================================================
// REALISTIC SIMULATION
// ============================================================

float simulatedAccelX() {

  static float value = 0.10;

  value +=
    random(-10, 11) / 100.0;

  if (value < -0.50)
    value = -0.50;

  if (value > 0.50)
    value = 0.50;

  return value;
}

float simulatedAccelY() {

  static float value = 0.05;

  value +=
    random(-10, 11) / 100.0;

  if (value < -0.50)
    value = -0.50;

  if (value > 0.50)
    value = 0.50;

  return value;
}

float simulatedAccelZ() {

  static float value = 9.81;

  value +=
    random(-5, 6) / 100.0;

  if (value < 9.30)
    value = 9.30;

  if (value > 10.30)
    value = 10.30;

  return value;
}

float simulatedGyro() {

  static float value = 0.02;

  value +=
    random(-5, 6) / 100.0;

  if (value < -0.30)
    value = -0.30;

  if (value > 0.30)
    value = 0.30;

  return value;
}

float simulatedMPUTemperature() {

  static float value = 28.0;

  value +=
    random(-10, 11) / 100.0;

  if (value < 24.0)
    value = 24.0;

  if (value > 34.0)
    value = 34.0;

  return value;
}

float simulatedBattery() {

  static float value = 92.0;

  value +=
    random(-3, 4) / 10.0;

  if (value < 75.0)
    value = 75.0;

  if (value > 100.0)
    value = 100.0;

  return value;
}

float simulatedSolar() {

  static float value = 4.10;

  value +=
    random(-5, 6) / 100.0;

  if (value < 3.60)
    value = 3.60;

  if (value > 4.40)
    value = 4.40;

  return value;
}

// ============================================================
// SENSOR UPDATE
// ============================================================

void updateSensors() {

  // ----------------------------------------------------------
  // MQ-3
  // ----------------------------------------------------------

  int raw = analogRead(
    MQ3_PIN
  );

  if (
    raw >= 0 &&
    raw <= 1023
  ) {

    mq3Raw = raw;

    mq3Real = true;

  } else {

    mq3Raw =
      random(300, 500);

    mq3Real = false;
  }

  // ----------------------------------------------------------
  // MPU6050
  // ----------------------------------------------------------

  if (
    mpuReady
  ) {

    sensors_event_t acceleration;
    sensors_event_t gyro;
    sensors_event_t temperature;

    mpu.getEvent(
      &acceleration,
      &gyro,
      &temperature
    );

    // Validate accelerometer values
    if (
      isfinite(
        acceleration.acceleration.x
      ) &&
      isfinite(
        acceleration.acceleration.y
      ) &&
      isfinite(
        acceleration.acceleration.z
      )
    ) {

      accelX =
        acceleration.acceleration.x;

      accelY =
        acceleration.acceleration.y;

      accelZ =
        acceleration.acceleration.z;

      motionReal = true;

    } else {

      accelX =
        simulatedAccelX();

      accelY =
        simulatedAccelY();

      accelZ =
        simulatedAccelZ();

      motionReal = false;
    }

    // --------------------------------------------------------
    // Gyroscope
    // --------------------------------------------------------

    if (
      isfinite(gyro.gyro.x) &&
      isfinite(gyro.gyro.y) &&
      isfinite(gyro.gyro.z)
    ) {

      gyroX =
        gyro.gyro.x;

      gyroY =
        gyro.gyro.y;

      gyroZ =
        gyro.gyro.z;

      gyroReal = true;

    } else {

      gyroX =
        simulatedGyro();

      gyroY =
        simulatedGyro();

      gyroZ =
        simulatedGyro();

      gyroReal = false;
    }

    // --------------------------------------------------------
    // Temperature
    // --------------------------------------------------------

    if (
      isfinite(
        temperature.temperature
      )
    ) {

      mpuTemp =
        temperature.temperature;

      temperatureReal = true;

    } else {

      mpuTemp =
        simulatedMPUTemperature();

      temperatureReal = false;
    }

  } else {

    accelX =
      simulatedAccelX();

    accelY =
      simulatedAccelY();

    accelZ =
      simulatedAccelZ();

    gyroX =
      simulatedGyro();

    gyroY =
      simulatedGyro();

    gyroZ =
      simulatedGyro();

    mpuTemp =
      simulatedMPUTemperature();

    motionReal = false;
    gyroReal = false;
    temperatureReal = false;
  }

  // ----------------------------------------------------------
  // Battery
  // No physical battery sensor
  // ----------------------------------------------------------

  batteryPercent =
    simulatedBattery();

  batteryReal = false;

  // ----------------------------------------------------------
  // Solar
  // No physical solar sensor
  // ----------------------------------------------------------

  solarVoltage =
    simulatedSolar();

  solarReal = false;
}

// ============================================================
// BUILD JSON
// ============================================================

String buildBaseJson() {

  uint64_t timestamp =
    getUnixTimestampMs();

  String json = "{";

  json += "\"device\":\"driver\",";

  json += "\"device_type\":\"driver_node\",";

  json += "\"mq3\":";
  json += String(mq3Raw);
  json += ",";

  json += "\"mq3_source\":\"";
  json += mq3Real
            ? "real"
            : "simulated";
  json += "\",";

  // ----------------------------------------------------------
  // Motion
  // ----------------------------------------------------------

  json += "\"motion\":{";

  json += "\"x\":";
  json += String(accelX, 3);
  json += ",";

  json += "\"y\":";
  json += String(accelY, 3);
  json += ",";

  json += "\"z\":";
  json += String(accelZ, 3);

  json += "},";

  json += "\"motion_source\":\"";
  json += motionReal
            ? "real"
            : "simulated";
  json += "\",";

  // ----------------------------------------------------------
  // Gyro
  // ----------------------------------------------------------

  json += "\"gyro\":{";

  json += "\"x\":";
  json += String(gyroX, 3);
  json += ",";

  json += "\"y\":";
  json += String(gyroY, 3);
  json += ",";

  json += "\"z\":";
  json += String(gyroZ, 3);

  json += "},";

  json += "\"gyro_source\":\"";
  json += gyroReal
            ? "real"
            : "simulated";
  json += "\",";

  // ----------------------------------------------------------
  // Temperature
  // ----------------------------------------------------------

  json += "\"temperature\":";
  json += String(mpuTemp, 2);
  json += ",";

  json += "\"temperature_source\":\"";
  json += temperatureReal
            ? "real"
            : "simulated";
  json += "\",";

  // ----------------------------------------------------------
  // Battery
  // ----------------------------------------------------------

  json += "\"battery\":";
  json += String(batteryPercent, 1);
  json += ",";

  json += "\"battery_source\":\"simulated\",";

  // ----------------------------------------------------------
  // Solar
  // ----------------------------------------------------------

  json += "\"solar\":";
  json += String(solarVoltage, 2);
  json += ",";

  json += "\"solar_voltage\":";
  json += String(solarVoltage, 2);
  json += ",";

  json += "\"solar_source\":\"simulated\",";

  // ----------------------------------------------------------
  // Timestamp
  // ----------------------------------------------------------

  json += "\"timestamp\":";
  json += String(
    (unsigned long long)timestamp
  );
  json += ",";

  json += "\"timestamp_iso\":\"";
  json += getISOTime();
  json += "\",";

  json += "\"timestamp_source\":\"";
  json += timeSynchronized
            ? "ntp"
            : "unsynchronized";

  json += "\"";

  json += "}";

  return json;
}

// ============================================================
// MQTT PUBLISH
// ============================================================

void publishData() {

  if (
    !mqtt.connected()
  ) {

    return;
  }

  String baseJson =
    buildBaseJson();

  // Encode the complete telemetry JSON.
  String encodedData =
    base64Encode(baseJson);

  // ----------------------------------------------------------
  // Final payload
  // ----------------------------------------------------------

  String json = "{";

  json += "\"device\":\"driver\",";

  json += "\"device_type\":\"driver_node\",";

  json += "\"mq3\":";
  json += String(mq3Raw);
  json += ",";

  json += "\"mq3_source\":\"";
  json += mq3Real
            ? "real"
            : "simulated";
  json += "\",";

  // Motion
  json += "\"motion\":{";

  json += "\"x\":";
  json += String(accelX, 3);
  json += ",";

  json += "\"y\":";
  json += String(accelY, 3);
  json += ",";

  json += "\"z\":";
  json += String(accelZ, 3);

  json += "},";

  json += "\"motion_source\":\"";
  json += motionReal
            ? "real"
            : "simulated";
  json += "\",";

  // Gyro
  json += "\"gyro\":{";

  json += "\"x\":";
  json += String(gyroX, 3);
  json += ",";

  json += "\"y\":";
  json += String(gyroY, 3);
  json += ",";

  json += "\"z\":";
  json += String(gyroZ, 3);

  json += "},";

  json += "\"gyro_source\":\"";
  json += gyroReal
            ? "real"
            : "simulated";
  json += "\",";

  // Temperature
  json += "\"temperature\":";
  json += String(mpuTemp, 2);
  json += ",";

  json += "\"temperature_source\":\"";
  json += temperatureReal
            ? "real"
            : "simulated";
  json += "\",";

  // Battery
  json += "\"battery\":";
  json += String(batteryPercent, 1);
  json += ",";

  json += "\"battery_source\":\"simulated\",";

  // Solar
  json += "\"solar\":";
  json += String(solarVoltage, 2);
  json += ",";

  json += "\"solar_voltage\":";
  json += String(solarVoltage, 2);
  json += ",";

  json += "\"solar_source\":\"simulated\",";

  // Timestamp
  json += "\"timestamp\":";
  json += String(
    (unsigned long long)getUnixTimestampMs()
  );
  json += ",";

  json += "\"timestamp_iso\":\"";
  json += getISOTime();
  json += "\",";

  json += "\"timestamp_source\":\"";
  json += timeSynchronized
            ? "ntp"
            : "unsynchronized";
  json += "\",";

  // Base64
  json += "\"encoded_data\":\"";
  json += encodedData;
  json += "\"";

  json += "}";

  bool result =
    mqtt.publish(
      TOPIC_DATA,
      json.c_str()
    );

  if (result) {

    mqttPublishCount++;

    Serial.println(
      "[MQTT] Driver telemetry published."
    );

  } else {

    mqttPublishFailed++;

    Serial.println(
      "[MQTT] Driver publish FAILED."
    );
  }
}

// ============================================================
// SERIAL
// ============================================================

void printSerial() {

  Serial.println();
  Serial.println("============================================================");
  Serial.println("                FARMTRACE DRIVER NODE");
  Serial.println("============================================================");

  Serial.printf(
    "MQ-3           : %u [%s]\n",
    mq3Raw,
    mq3Real
      ? "REAL"
      : "SIMULATED"
  );

  Serial.printf(
    "Motion X/Y/Z   : %.2f / %.2f / %.2f [%s]\n",
    accelX,
    accelY,
    accelZ,
    motionReal
      ? "REAL"
      : "SIMULATED"
  );

  Serial.printf(
    "Gyro X/Y/Z     : %.2f / %.2f / %.2f [%s]\n",
    gyroX,
    gyroY,
    gyroZ,
    gyroReal
      ? "REAL"
      : "SIMULATED"
  );

  Serial.printf(
    "MPU Temp       : %.2f C [%s]\n",
    mpuTemp,
    temperatureReal
      ? "REAL"
      : "SIMULATED"
  );

  Serial.printf(
    "Battery        : %.1f %% [SIMULATED]\n",
    batteryPercent
  );

  Serial.printf(
    "Solar Voltage  : %.2f V [SIMULATED]\n",
    solarVoltage
  );

  Serial.println();

  Serial.printf(
    "Timestamp      : %llu\n",
    (unsigned long long)getUnixTimestampMs()
  );

  Serial.printf(
    "Time Source    : %s\n",
    timeSynchronized
      ? "NTP"
      : "UNSYNCED"
  );

  Serial.println();

  Serial.printf(
    "WiFi           : %s\n",
    WiFi.status() ==
      WL_CONNECTED
      ? "CONNECTED"
      : "DISCONNECTED"
  );

  Serial.printf(
    "IP             : %s\n",
    WiFi.localIP()
      .toString()
      .c_str()
  );

  Serial.printf(
    "MQTT           : %s\n",
    mqtt.connected()
      ? "CONNECTED"
      : "DISCONNECTED"
  );

  Serial.printf(
    "MQTT Published : %lu\n",
    mqttPublishCount
  );

  Serial.printf(
    "MQTT Failed    : %lu\n",
    mqttPublishFailed
  );

  Serial.println();

  Serial.printf(
    "NRF24          : %s\n",
    radio.isChipConnected()
      ? "DETECTED"
      : "NOT DETECTED"
  );

  Serial.println("============================================================");
}

// ============================================================
// NRF24
// ============================================================

void initializeNRF24() {

  Serial.print(
    "[NRF24] Initializing... "
  );

  /*
     ESP8266 hardware SPI:

     SCK  -> GPIO14 / D5
     MISO -> GPIO12 / D6
     MOSI -> GPIO13 / D7
     CSN  -> GPIO15 / D8
     CE   -> GPIO2  / D4
  */

  if (
    !radio.begin()
  ) {

    Serial.println(
      "FAILED"
    );

    return;
  }

  radio.setChannel(
    NRF24_CHANNEL
  );

  radio.setDataRate(
    RF24_250KBPS
  );

  radio.setPALevel(
    RF24_PA_LOW
  );

  radio.setRetries(
    5,
    15
  );

  radio.openWritingPipe(
    ADDRESS_CONTAINER
  );

  radio.openReadingPipe(
    1,
    ADDRESS_GATEWAY
  );

  radio.stopListening();

  Serial.println(
    "OK"
  );
}

// ============================================================
// SETUP
// ============================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  randomSeed(
    analogRead(A0)
  );

  Serial.println();
  Serial.println();
  Serial.println("============================================================");
  Serial.println("       FARMTRACE ESP8266 DRIVER NODE");
  Serial.println("============================================================");

  // ----------------------------------------------------------
  // I2C
  // ----------------------------------------------------------

  Wire.begin(
    I2C_SDA,
    I2C_SCL
  );

  // ----------------------------------------------------------
  // MPU6050
  // ----------------------------------------------------------

  Serial.print(
    "[SENSOR] Initializing MPU6050... "
  );

  if (
    mpu.begin()
  ) {

    mpuReady = true;

    mpu.setAccelerometerRange(
      MPU6050_RANGE_8_G
    );

    mpu.setGyroRange(
      MPU6050_RANGE_500_DEG
    );

    mpu.setFilterBandwidth(
      MPU6050_BAND_21_HZ
    );

    Serial.println(
      "OK"
    );

  } else {

    mpuReady = false;

    Serial.println(
      "FAILED - simulation enabled"
    );
  }

  // ----------------------------------------------------------
  // MQ3
  // ----------------------------------------------------------

  Serial.print(
    "[SENSOR] Initializing MQ-3... "
  );

  pinMode(
    MQ3_PIN,
    INPUT
  );

  Serial.println(
    "OK"
  );

  // ----------------------------------------------------------
  // WIFI
  // ----------------------------------------------------------

  connectWiFi();

  // ----------------------------------------------------------
  // MQTT
  // ----------------------------------------------------------

  mqtt.setServer(
    MQTT_BROKER,
    MQTT_PORT
  );

  mqtt.setBufferSize(
    2048
  );

  // ----------------------------------------------------------
  // NRF24
  // ----------------------------------------------------------

  initializeNRF24();

  // ----------------------------------------------------------
  // Initial sensor read
  // ----------------------------------------------------------

  updateSensors();

  Serial.println();
  Serial.println(
    "[SYSTEM] Driver node ready."
  );

  Serial.println(
    "============================================================"
  );
}

// ============================================================
// LOOP
// ============================================================

void loop() {

  maintainWiFi();

  maintainMQTT();

  unsigned long now =
    millis();

  // ----------------------------------------------------------
  // Sensors
  // ----------------------------------------------------------

  if (
    now - lastSensorTime >=
    SENSOR_INTERVAL
  ) {

    lastSensorTime =
      now;

    updateSensors();
  }

  // ----------------------------------------------------------
  // MQTT
  // ----------------------------------------------------------

  if (
    now - lastMqttTime >=
    MQTT_INTERVAL
  ) {

    lastMqttTime =
      now;

    publishData();
  }

  // ----------------------------------------------------------
  // Serial
  // ----------------------------------------------------------

  if (
    now - lastSerialTime >=
    SERIAL_INTERVAL
  ) {

    lastSerialTime =
      now;

    printSerial();
  }

  delay(5);
}
