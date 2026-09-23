/*
  FARMTRACE - CONTAINER NODE
  ESP32

  Existing nRF24 connection is preserved.
  No battery or solar hardware is included.

  DHT11:
    DATA -> GPIO4

  MQ-6:
    AO -> GPIO34

  nRF24:
    CE   -> GPIO22
    CSN  -> GPIO21
    MOSI -> GPIO23
    MISO -> GPIO19
    SCK  -> GPIO18

  Serial: 115200
*/

#include <Arduino.h>
#include <SPI.h>
#include <RF24.h>
#include <DHT.h>
#include "mbedtls/md.h"

#define DHT_PIN 4
#define DHT_TYPE DHT11
#define MQ6_PIN 34

#define NRF24_CE_PIN 22
#define NRF24_CSN_PIN 21
#define NRF24_CHANNEL 108

const byte ADDRESS_CONTAINER[6] = "CNT01";
const byte ADDRESS_GATEWAY[6]   = "GTW01";

#define PKT_DATA 0x01
#define PKT_ACK 0x02
#define PKT_COMMAND 0x03
#define PKT_RESPONSE 0x04

#define CMD_REQUEST_BATTERY 0x10

#define SENSOR_INTERVAL 5000UL
#define ACK_TIMEOUT 300UL
#define MAX_RETRIES 3

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

DHT dht(DHT_PIN, DHT_TYPE);
RF24 radio(NRF24_CE_PIN, NRF24_CSN_PIN);

uint16_t sequenceNumber = 1;
unsigned long lastSensorTime = 0;
uint8_t previousHash[32] = {0};
bool radioReady = false;

void separator() {
  Serial.println("------------------------------------------------------------");
}

void generateHash(SensorDataPacket &packet, uint8_t *output) {
  mbedtls_md_context_t ctx;
  mbedtls_md_init(&ctx);

  const mbedtls_md_info_t *info =
    mbedtls_md_info_from_type(MBEDTLS_MD_SHA256);

  if (info == nullptr) {
    memset(output, 0, 32);
    return;
  }

  if (mbedtls_md_setup(&ctx, info, 0) != 0) {
    memset(output, 0, 32);
    mbedtls_md_free(&ctx);
    return;
  }

  mbedtls_md_starts(&ctx);
  mbedtls_md_update(&ctx, previousHash, 32);
  mbedtls_md_update(&ctx, (const unsigned char *)&packet.sequence, sizeof(packet.sequence));
  mbedtls_md_update(&ctx, (const unsigned char *)&packet.timestamp, sizeof(packet.timestamp));
  mbedtls_md_update(&ctx, (const unsigned char *)&packet.temperature, sizeof(packet.temperature));
  mbedtls_md_update(&ctx, (const unsigned char *)&packet.humidity, sizeof(packet.humidity));
  mbedtls_md_update(&ctx, (const unsigned char *)&packet.mq6Raw, sizeof(packet.mq6Raw));
  mbedtls_md_finish(&ctx, output);
  mbedtls_md_free(&ctx);
}

void printHash(uint8_t *hash, uint8_t length) {
  for (uint8_t i = 0; i < length; i++) {
    if (hash[i] < 16) Serial.print("0");
    Serial.print(hash[i], HEX);
  }
  Serial.println();
}

void initializeDHT() {
  Serial.println("[SENSOR] Starting DHT11...");
  dht.begin();
  delay(1500);

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("[SENSOR] DHT11 NOT DETECTED / READ FAILED");
  } else {
    Serial.println("[SENSOR] DHT11 DETECTED / READY");
  }
}

void initializeMQ6() {
  pinMode(MQ6_PIN, INPUT);
  Serial.print("[SENSOR] MQ-6 initialized. ADC=");
  Serial.println(analogRead(MQ6_PIN));
}

void initializeRadio() {
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

  radio.openWritingPipe(ADDRESS_GATEWAY);
  radio.openReadingPipe(1, ADDRESS_CONTAINER);
  radio.startListening();

  Serial.println("[RADIO] nRF24 DETECTED / READY");
}

bool waitForAck(uint16_t expectedSequence) {
  unsigned long start = millis();

  while (millis() - start < ACK_TIMEOUT) {
    if (radio.available()) {
      uint8_t buffer[32] = {0};
      radio.read(buffer, sizeof(buffer));

      if (buffer[0] == PKT_ACK) {
        AckPacket ack = {};
        memcpy(&ack, buffer, sizeof(ack));

        if (ack.sequence == expectedSequence) {
          return true;
        }
      }
    }
    delay(2);
  }

  return false;
}

void sendSensorData() {
  SensorDataPacket packet = {};
  packet.type = PKT_DATA;
  packet.sequence = sequenceNumber++;
  packet.timestamp = millis() / 1000;

  packet.temperature = dht.readTemperature();
  packet.humidity = dht.readHumidity();

  if (isnan(packet.temperature)) packet.temperature = 0;
  if (isnan(packet.humidity)) packet.humidity = 0;

  packet.mq6Raw = analogRead(MQ6_PIN);

  // Hardware is not installed.
  packet.batteryPct = 0;
  packet.solarVoltage = 0;

  uint8_t fullHash[32];
  generateHash(packet, fullHash);

  memcpy(packet.hashFragment, fullHash, 8);
  memcpy(previousHash, fullHash, 32);

  Serial.println();
  separator();
  Serial.println("              FARMTRACE CONTAINER DATA");
  separator();

  Serial.printf("Sequence       : %u\n", packet.sequence);
  Serial.printf("Temperature    : %.2f C\n", packet.temperature);
  Serial.printf("Humidity       : %.2f %%\n", packet.humidity);
  Serial.printf("MQ-6 ADC       : %u\n", packet.mq6Raw);
  Serial.println("Battery        : NOT INSTALLED");
  Serial.println("Solar          : NOT INSTALLED");
  Serial.print("SHA256         : ");
  printHash(packet.hashFragment, 8);
  separator();

  if (!radioReady) {
    Serial.println("[RADIO] Radio unavailable.");
    return;
  }

  bool acknowledged = false;

  for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    Serial.printf("[RADIO] Sending packet, attempt %d...\n", attempt);

    radio.stopListening();
    bool transmitted = radio.write(&packet, sizeof(packet));
    radio.startListening();

    if (!transmitted) {
      Serial.println("[RADIO] TX failed.");
      continue;
    }

    if (waitForAck(packet.sequence)) {
      acknowledged = true;
      Serial.println("[RADIO] ACK RECEIVED.");
      break;
    }

    Serial.println("[RADIO] No ACK received.");
  }

  Serial.println(
    acknowledged
      ? "[FARMTRACE] Packet delivered successfully."
      : "[FARMTRACE] Gateway unreachable."
  );

  separator();
}

void processCommands() {
  if (!radioReady || !radio.available()) return;

  uint8_t buffer[32] = {0};
  radio.read(buffer, sizeof(buffer));

  if (buffer[0] != PKT_COMMAND) return;

  CommandPacket command = {};
  memcpy(&command, buffer, sizeof(command));

  Serial.println("[COMMAND] Command received.");

  ResponsePacket response = {};
  response.type = PKT_RESPONSE;
  response.commandCode = command.commandCode;
  response.commandId = command.commandId;
  response.value1 = 0;

  if (command.commandCode == CMD_REQUEST_BATTERY) {
    Serial.println("[COMMAND] Battery sensor is not installed.");
  }

  radio.stopListening();
  radio.write(&response, sizeof(response));
  radio.startListening();

  Serial.println("[COMMAND] Response sent.");
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("============================================================");
  Serial.println("             FARMTRACE CONTAINER NODE");
  Serial.println("============================================================");

  initializeDHT();
  initializeMQ6();
  initializeRadio();

  Serial.println();
  Serial.println("             CONTAINER NODE READY");
  Serial.println("============================================================");
}

void loop() {
  processCommands();

  if (millis() - lastSensorTime >= SENSOR_INTERVAL) {
    lastSensorTime = millis();
    sendSensorData();
  }

  delay(5);
}
