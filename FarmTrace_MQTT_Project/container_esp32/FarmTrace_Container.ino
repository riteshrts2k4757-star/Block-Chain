/*
  ============================================================
              FARMTRACE - ESP32 CONTAINER NODE
              DIRECT WIFI + MQTT + NRF24 + NTP
  ============================================================

  MQTT BROKER:
      broker.emqx.io
      Port: 1883

  MQTT TOPICS:
      farmtrace/container/data
      farmtrace/container/status

  ============================================================
  EXISTING ESP32 CONNECTIONS - PRESERVED
  ============================================================

  DHT11:
      DATA -> GPIO4

  MQ-6:
      AO -> GPIO34

  NRF24:
      CE   -> GPIO22
      CSN  -> GPIO21
      MOSI -> GPIO23
      MISO -> GPIO19
      SCK  -> GPIO18

  ============================================================
  GPS
  ============================================================

  No physical GPS module is required.

  Fixed Dhanbad coordinates:
      Latitude  = 23.795700
      Longitude = 86.430400

  ============================================================
*/

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <SPI.h>
#include <RF24.h>
#include <time.h>
#include <esp_system.h>

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

#define MQTT_CLIENT_ID  "FarmTrace_Container_ESP32"

#define TOPIC_DATA      "farmtrace/container/data"
#define TOPIC_STATUS    "farmtrace/container/status"

// ============================================================
// DHT11
// ============================================================

#define DHT_PIN         4
#define DHT_TYPE        DHT11

DHT dht(DHT_PIN, DHT_TYPE);

// ============================================================
// MQ-6
// ============================================================

#define MQ6_PIN         34

// ============================================================
// NRF24
// EXISTING PINS - DO NOT CHANGE
// ============================================================

#define NRF24_CE_PIN    22
#define NRF24_CSN_PIN   21
#define NRF24_CHANNEL   108

RF24 radio(
  NRF24_CE_PIN,
  NRF24_CSN_PIN
);

const byte ADDRESS_CONTAINER[6] = "CNT01";
const byte ADDRESS_GATEWAY[6]   = "GTW01";

// ============================================================
// FIXED GPS COORDINATES
// DHANBAD
// ============================================================

#define GPS_LATITUDE    23.795700
#define GPS_LONGITUDE   86.430400

// ============================================================
// OPTIONAL FUTURE VOLTAGE SENSOR PINS
// Currently NOT connected.
//
// These are only reserved for future hardware.
// ============================================================

#define SOLAR_ADC_PIN    32
#define BATTERY_ADC_PIN  33

#define HAS_SOLAR_SENSOR    false
#define HAS_BATTERY_SENSOR  false

// ============================================================
// TIMERS
// ============================================================

#define SENSOR_INTERVAL       1000
#define MQTT_INTERVAL         5000
#define SERIAL_INTERVAL       2000

#define WIFI_RETRY_INTERVAL   10000
#define MQTT_RETRY_INTERVAL   3000

// ============================================================
// SENSOR VALUES
// ============================================================

float containerTemperature = 5.2;
float containerHumidity    = 75.0;

uint16_t mq6Value = 320;

float batteryPercent = 85.0;
float solarVoltage   = 4.10;

// ============================================================
// SENSOR SOURCE STATUS
// ============================================================

bool temperatureReal = false;
bool humidityReal    = false;
bool mq6Real         = true;

bool batteryReal = false;
bool solarReal   = false;

// ============================================================
// MQTT
// ============================================================

WiFiClient wifiClient;

PubSubClient mqtt(
  wifiClient
);

// ============================================================
// TIMERS
// ============================================================

unsigned long lastSensorTime = 0;
unsigned long lastMqttTime   = 0;
unsigned long lastSerialTime = 0;

unsigned long lastWiFiAttempt = 0;
unsigned long lastMQTTAttempt = 0;

// ============================================================
// MQTT COUNTERS
// ============================================================

unsigned long mqttPublishCount  = 0;
unsigned long mqttPublishFailed = 0;

// ============================================================
// SEQUENCE
// ============================================================

uint32_t sequenceNumber = 1;

// ============================================================
// TIME
// ============================================================

bool timeSynchronized = false;

const char* NTP_SERVER_1 = "pool.ntp.org";
const char* NTP_SERVER_2 = "time.nist.gov";

// India Standard Time
// UTC + 5:30

const long GMT_OFFSET_SEC = 19800;

const int DAYLIGHT_OFFSET_SEC = 0;

// ============================================================
// REALISTIC SIMULATED VALUES
// ============================================================

float realisticTemperature() {

  static float value = 5.2;

  value += random(-8, 9) / 100.0;

  if (value < 3.0)
    value = 3.0;

  if (value > 8.0)
    value = 8.0;

  return value;
}

// ============================================================

float realisticHumidity() {

  static float value = 75.0;

  value += random(-15, 16) / 10.0;

  if (value < 60.0)
    value = 60.0;

  if (value > 90.0)
    value = 90.0;

  return value;
}

// ============================================================

uint16_t realisticMQ6() {

  static int value = 320;

  value += random(-10, 11);

  if (value < 250)
    value = 250;

  if (value > 450)
    value = 450;

  return (uint16_t)value;
}

// ============================================================

float realisticBattery() {

  static float value = 85.0;

  value += random(-3, 4) / 10.0;

  if (value < 70.0)
    value = 70.0;

  if (value > 100.0)
    value = 100.0;

  return value;
}

// ============================================================

float realisticSolarVoltage() {

  static float value = 4.10;

  value += random(-5, 6) / 100.0;

  if (value < 3.60)
    value = 3.60;

  if (value > 4.40)
    value = 4.40;

  return value;
}

// ============================================================
// GET REAL UNIX TIMESTAMP
// ============================================================

uint64_t getUnixTimestampMs() {

  time_t now = time(nullptr);

  /*
    If NTP has not synchronized yet,
    time() may return a value close to 1970.
  */

  if (now < 1700000000) {

    return 0;
  }

  uint64_t timestamp =
    ((uint64_t)now * 1000ULL) +
    (millis() % 1000);

  return timestamp;
}

// ============================================================
// GET HUMAN READABLE TIME
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
// NTP TIME SYNCHRONIZATION
// ============================================================

void synchronizeTime() {

  Serial.println(
    "[TIME] Synchronizing NTP..."
  );

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
        "[TIME] NTP synchronized successfully."
      );

      Serial.printf(
        "[TIME] %04d-%02d-%02d %02d:%02d:%02d\n",

        timeinfo.tm_year + 1900,
        timeinfo.tm_mon + 1,
        timeinfo.tm_mday,

        timeinfo.tm_hour,
        timeinfo.tm_min,
        timeinfo.tm_sec
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
// WIFI CONNECTION
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

  WiFi.disconnect(true);

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
      "[WIFI] IP Address: "
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
// MQTT CONNECTION
// ============================================================

bool connectMQTT() {

  if (
    WiFi.status() !=
    WL_CONNECTED
  ) {

    return false;
  }

  Serial.println(
    "[MQTT] Connecting to broker.emqx.io..."
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
      "container_online"
    );

    return true;
  }

  Serial.print(
    "[MQTT] Connection failed. State: "
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
// UPDATE SENSOR DATA
// ============================================================

void updateSensors() {

  // ==========================================================
  // DHT11 TEMPERATURE
  // ==========================================================

  float temperature =
    dht.readTemperature();

  if (
    !isnan(temperature)
  ) {

    containerTemperature =
      temperature;

    temperatureReal = true;

  } else {

    containerTemperature =
      realisticTemperature();

    temperatureReal = false;
  }

  // ==========================================================
  // DHT11 HUMIDITY
  // ==========================================================

  float humidity =
    dht.readHumidity();

  if (
    !isnan(humidity)
  ) {

    containerHumidity =
      humidity;

    humidityReal = true;

  } else {

    containerHumidity =
      realisticHumidity();

    humidityReal = false;
  }

  // ==========================================================
  // MQ-6
  // ==========================================================

  int rawMQ6 =
    analogRead(MQ6_PIN);

  /*
    ESP32 ADC range is normally:
        0 - 4095

    If the ADC reading is valid,
    use the real sensor value.
  */

  if (
    rawMQ6 >= 0 &&
    rawMQ6 <= 4095
  ) {

    mq6Value =
      (uint16_t)rawMQ6;

    mq6Real = true;

  } else {

    mq6Value =
      realisticMQ6();

    mq6Real = false;
  }

  // ==========================================================
  // BATTERY
  // ==========================================================

#if HAS_BATTERY_SENSOR

  int batteryADC =
    analogRead(
      BATTERY_ADC_PIN
    );

  batteryPercent =
    ((float)batteryADC / 4095.0) * 100.0;

  if (batteryPercent < 0)
    batteryPercent = 0;

  if (batteryPercent > 100)
    batteryPercent = 100;

  batteryReal = true;

#else

  /*
    No battery sensor physically installed.
    Generate realistic battery percentage.
  */

  batteryPercent =
    realisticBattery();

  batteryReal = false;

#endif

  // ==========================================================
  // SOLAR
  // ==========================================================

#if HAS_SOLAR_SENSOR

  int solarADC =
    analogRead(
      SOLAR_ADC_PIN
    );

  float adcVoltage =
    ((float)solarADC / 4095.0) * 3.3;

  /*
    Example assumes a 2:1 voltage divider.

    Change this multiplier when your actual
    voltage divider is installed.
  */

  solarVoltage =
    adcVoltage * 2.0;

  solarReal = true;

#else

  /*
    No physical solar sensor installed.
    Generate realistic solar voltage.
  */

  solarVoltage =
    realisticSolarVoltage();

  solarReal = false;

#endif
}

// ============================================================
// BUILD EXACT MQTT JSON
// ============================================================

String buildJson() {

  uint64_t timestamp =
    getUnixTimestampMs();

  String json;

  json.reserve(500);

  json += "{";

  // ----------------------------------------------------------
  // DEVICE
  // ----------------------------------------------------------

  json += "\"device\":\"container\",";

  // ----------------------------------------------------------
  // SEQUENCE
  // ----------------------------------------------------------

  json += "\"sequence\":";
  json += String(sequenceNumber);
  json += ",";

  // ----------------------------------------------------------
  // TEMPERATURE
  // ----------------------------------------------------------

  json += "\"temperature\":";
  json += String(
    containerTemperature,
    2
  );
  json += ",";

  // ----------------------------------------------------------
  // HUMIDITY
  // ----------------------------------------------------------

  json += "\"humidity\":";
  json += String(
    containerHumidity,
    2
  );
  json += ",";

  // ----------------------------------------------------------
  // MQ6
  // ----------------------------------------------------------

  json += "\"mq6\":";
  json += String(
    mq6Value
  );
  json += ",";

  // ----------------------------------------------------------
  // BATTERY
  // ----------------------------------------------------------

  json += "\"battery\":";
  json += String(
    batteryPercent,
    1
  );
  json += ",";

  // ----------------------------------------------------------
  // SOLAR
  // ----------------------------------------------------------

  json += "\"solar\":";
  json += String(
    solarVoltage,
    2
  );
  json += ",";

  // ----------------------------------------------------------
  // GPS
  // ----------------------------------------------------------

  json += "\"gps\":{";

  json += "\"lat\":";
  json += String(
    GPS_LATITUDE,
    6
  );

  json += ",";

  json += "\"lng\":";
  json += String(
    GPS_LONGITUDE,
    6
  );

  json += "},";

  // ----------------------------------------------------------
  // TIMESTAMP
  // ----------------------------------------------------------

  json += "\"timestamp\":";
  json += String(
    (unsigned long long)timestamp
  );

  json += "}";

  return json;
}

// ============================================================
// PUBLISH MQTT
// ============================================================

void publishData() {

  if (
    !mqtt.connected()
  ) {

    return;
  }

  String json =
    buildJson();

  Serial.println();
  Serial.println(
    "[MQTT] Publishing container data:"
  );

  Serial.println(
    json
  );

  bool success =
    mqtt.publish(
      TOPIC_DATA,
      json.c_str()
    );

  if (success) {

    mqttPublishCount++;

    sequenceNumber++;

    Serial.println(
      "[MQTT] Publish SUCCESS."
    );

  } else {

    mqttPublishFailed++;

    Serial.println(
      "[MQTT] Publish FAILED."
    );
  }
}

// ============================================================
// SERIAL MONITOR
// ============================================================

void printSerial() {

  Serial.println();
  Serial.println(
    "============================================================"
  );

  Serial.println(
    "              FARMTRACE CONTAINER NODE"
  );

  Serial.println(
    "============================================================"
  );

  Serial.printf(
    "Sequence       : %lu\n",
    (unsigned long)sequenceNumber
  );

  Serial.printf(
    "Temperature    : %.2f C [%s]\n",
    containerTemperature,
    temperatureReal
      ? "REAL"
      : "SIMULATED"
  );

  Serial.printf(
    "Humidity       : %.2f %% [%s]\n",
    containerHumidity,
    humidityReal
      ? "REAL"
      : "SIMULATED"
  );

  Serial.printf(
    "MQ-6           : %u [%s]\n",
    mq6Value,
    mq6Real
      ? "REAL"
      : "SIMULATED"
  );

  Serial.printf(
    "Battery        : %.1f %% [%s]\n",
    batteryPercent,
    batteryReal
      ? "REAL"
      : "SIMULATED"
  );

  Serial.printf(
    "Solar          : %.2f V [%s]\n",
    solarVoltage,
    solarReal
      ? "REAL"
      : "SIMULATED"
  );

  Serial.println();

  Serial.printf(
    "GPS Latitude   : %.6f\n",
    GPS_LATITUDE
  );

  Serial.printf(
    "GPS Longitude  : %.6f\n",
    GPS_LONGITUDE
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

  Serial.println(
    "============================================================"
  );
}

// ============================================================
// NRF24 INITIALIZATION
// ============================================================

void initializeNRF24() {

  Serial.print(
    "[NRF24] Initializing... "
  );

  /*
    ESP32 SPI:

    SCK  -> GPIO18
    MISO -> GPIO19
    MOSI -> GPIO23
    CSN  -> GPIO21
    CE   -> GPIO22
  */

  SPI.begin(
    18,
    19,
    23,
    21
  );

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
    ADDRESS_GATEWAY
  );

  radio.openReadingPipe(
    1,
    ADDRESS_CONTAINER
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

  Serial.begin(
    115200
  );

  delay(1000);

  randomSeed(
    (uint32_t)esp_random()
  );

  Serial.println();
  Serial.println();

  Serial.println(
    "============================================================"
  );

  Serial.println(
    "        FARMTRACE ESP32 CONTAINER NODE"
  );

  Serial.println(
    "============================================================"
  );

  // ----------------------------------------------------------
  // DHT11
  // ----------------------------------------------------------

  Serial.print(
    "[SENSOR] Initializing DHT11... "
  );

  dht.begin();

  Serial.println(
    "OK"
  );

  // ----------------------------------------------------------
  // MQ6
  // ----------------------------------------------------------

  Serial.print(
    "[SENSOR] Initializing MQ-6... "
  );

  pinMode(
    MQ6_PIN,
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
    1024
  );

  // ----------------------------------------------------------
  // NRF24
  // ----------------------------------------------------------

  initializeNRF24();

  // ----------------------------------------------------------
  // Initial sensor reading
  // ----------------------------------------------------------

  updateSensors();

  Serial.println();

  Serial.println(
    "[SYSTEM] Container node ready."
  );

  Serial.println(
    "[SYSTEM] GPS coordinates:"
  );

  Serial.printf(
    "         %.6f, %.6f\n",
    GPS_LATITUDE,
    GPS_LONGITUDE
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
  // SENSOR UPDATE
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
  // MQTT PUBLISH
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
  // SERIAL OUTPUT
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
