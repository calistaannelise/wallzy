#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>

// ==== BLE (Arduino BLE) ====
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ---------------- Pins ----------------
#define BUZZER_PIN 40
#define PIN_SCK    13
#define PIN_MISO   11
#define PIN_MOSI   12
#define PIN_RST    10   // shared RST for all readers

// Unique SS (SDA) per reader
#define SS_A 14
#define SS_B 4
#define SS_C 15

// ---------------- RC522 Readers ----------------
static const uint8_t NUM_READERS = 3;
uint8_t SS_PINS[NUM_READERS] = { SS_A, SS_B, SS_C };
MFRC522 readers[NUM_READERS] = {
  MFRC522(SS_A, PIN_RST),
  MFRC522(SS_B, PIN_RST),
  MFRC522(SS_C, PIN_RST)
};

// category names per reader index
const char* CATEGORY_OF_IDX(uint8_t idx) {
  switch (idx) {
    case 0: return "grocery"; // SS_A
    case 1: return "dining";  // SS_B
    case 2: return "online";  // SS_C
    default: return "unknown";
  }
}

// ---------------- BLE UUIDs ----------------
static const char* SERVICE_UUID  = "275dc6e0-dff5-4b56-9af0-584a5768a02a";
static const char* CHAR_UUID     = "9b2a6a1f-4f8a-4c67-9d2a-62b3c1a8e0ff"; // notify-only

// BLE globals
BLEServer*         g_server    = nullptr;
BLECharacteristic* g_char      = nullptr;
volatile bool      g_connected = false;

// ---------------- BLE Callbacks ----------------
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) override {
    g_connected = true;
    Serial.println("[BLE] Central connected");
  }
  void onDisconnect(BLEServer* pServer) override {
    g_connected = false;
    Serial.println("[BLE] Central disconnected; advertising…");
    pServer->getAdvertising()->start();
  }
};

// Helper: notify JSON string if connected
static void notify_json(const String& json) {
  if (!g_connected || !g_char) return;
  g_char->setValue((uint8_t*)json.c_str(), json.length());
  g_char->notify();
  Serial.print("[BLE] Notified: "); Serial.println(json);
}

// ---------------- RFID Task ----------------
void RFIDBuzzerTask(void *) {
  // Ensure all CS high (deselected) and RC522 out of reset
  for (uint8_t i = 0; i < NUM_READERS; ++i) {
    pinMode(SS_PINS[i], OUTPUT);
    digitalWrite(SS_PINS[i], HIGH);
  }
  pinMode(PIN_RST, OUTPUT);
  digitalWrite(PIN_RST, HIGH);

  // Init SPI readers
  for (uint8_t i = 0; i < NUM_READERS; ++i) {
    readers[i].PCD_Init(SS_PINS[i], PIN_RST);
    delay(50);
    byte ver = readers[i].PCD_ReadRegister(readers[i].VersionReg);
    Serial.printf("Reader %u VersionReg: 0x%02X\n", i, ver);
  }

  // Buzzer
  ledcAttach(BUZZER_PIN, 1000, 11);

  // Poll readers round-robin
  for (;;) {
    for (uint8_t idx = 0; idx < NUM_READERS; ++idx) {
      MFRC522 &r = readers[idx];

      if (!r.PICC_IsNewCardPresent()) continue;
      if (!r.PICC_ReadCardSerial())   continue;

      // Build UID as HEX (no separators), e.g., "04A1B2C3"
      char uidHex[3 * 10] = {0}; // RC522 UIDs are usually <= 10 bytes; adjust if needed
      char* p = uidHex;
      for (byte i = 0; i < r.uid.size; i++) {
        sprintf(p, "%02X", r.uid.uidByte[i]);
        p += 2;
      }

      const char* category = CATEGORY_OF_IDX(idx);

      // Beep on detection
      ledcWriteTone(BUZZER_PIN, 1000);
      vTaskDelay(pdMS_TO_TICKS(500));
      ledcWriteTone(BUZZER_PIN, 0);

      // Log & notify JSON: {"uid":"...","category":"..."}
      Serial.printf("[Reader %u][%s] UID:%s\n", idx, category, uidHex);
      String payload = String("{\"uid\":\"") + uidHex + "\",\"category\":\"" + category + "\"}";
      notify_json(payload);

      // Clean end & debounce
      r.PICC_HaltA();
      r.PCD_StopCrypto1();
      vTaskDelay(pdMS_TO_TICKS(80));
    }
    vTaskDelay(pdMS_TO_TICKS(5));
  }
}

void setup() {
  Serial.begin(115200);
  delay(300);
  while (!Serial) delay(10);

  // SPI bus for all readers
  SPI.begin(PIN_SCK, PIN_MISO, PIN_MOSI);

  // ---- BLE init ----
  BLEDevice::init("ESP32 Server");
  BLEDevice::setMTU(185); // optional
  g_server = BLEDevice::createServer();
  g_server->setCallbacks(new ServerCallbacks());

  BLEService* svc = g_server->createService(SERVICE_UUID);

  g_char = svc->createCharacteristic(
    CHAR_UUID,
    BLECharacteristic::PROPERTY_NOTIFY
  );
  g_char->addDescriptor(new BLE2902()); // CCCD for notifications

  svc->start();

  // Advertise the service UUID so centrals can find it
  BLEAdvertising* adv = g_server->getAdvertising();
  adv->addServiceUUID(SERVICE_UUID);
  adv->setScanResponse(true);
  adv->start();
  Serial.println("[BLE] Advertising started");

  // ---- Start RFID task ----
  Serial.println("Starting: 3× RC522, shared RST, tap→JSON notify");
  xTaskCreatePinnedToCore(RFIDBuzzerTask, "RFIDBuzzerTask",
                          6144, nullptr, 3, nullptr, 1);
}

void loop() {
  // nothing; tasks and BLE callbacks do the work
}
