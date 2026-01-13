#include "config.h" 

Servo feeder;
DeviceState state;
ScheduleList schedules;
int lastFedMinute = -1;

void setup() {
  Serial.begin(115200);
  delay(1500);
  Serial.println("\n┌─────────────────────────────────────────────┐");
  Serial.println("│     Smart Feeder IoT Device   v2026.01      │");
  Serial.println("└─────────────────────────────────────────────┘");

  pinMode(POT_TIME_PIN,    INPUT);
  pinMode(BTN_FEED_PIN,    INPUT_PULLUP);
  pinMode(BTN_REFILL_PIN,  INPUT_PULLUP);
  pinMode(LED_RED_PIN,     OUTPUT);
  pinMode(LED_GREEN_PIN,   OUTPUT);

  digitalWrite(LED_RED_PIN,   LOW);
  digitalWrite(LED_GREEN_PIN, LOW);

  feeder.attach(SERVO_PIN);
  feeder.write(0);

  setLED("starting");

  connectWiFi();

  if (fetchPetProfile()) {
    state.isConnected = true;
    fetchSchedules();
    updateLEDIndicators();
    Serial.println("Система успішно ініціалізована ✓");
  } else {
    Serial.println("!!! Не вдалося отримати профіль пристрою !!!");
    setLED("error");
  }
}

void loop() {
  simulateTimeFromPot();
  handleButtons();
  checkAutoFeeding();
  updateLEDIndicators();
  
  unsigned long now = millis();
  
  if (state.isConnected && (now - state.lastHeartbeat > HEARTBEAT_MS)) {
    sendHeartbeat();
    state.lastHeartbeat = now;
  }
  
  if (state.isConnected && (now - state.lastScheduleFetch > SCHEDULE_MS)) {
    fetchSchedules();
    state.lastScheduleFetch = now;
  }

  delay(LOOP_DELAY_MS);
}

void connectWiFi() {
  Serial.printf("[WiFi] Підключення до %s ", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts++ < 25) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Підключено! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Не вдалося підключитися до Wi-Fi");
  }
}

bool fetchPetProfile() {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/devices/my-pet-profile/" + String(DEVICE_SERIAL);

  Serial.println("Запит профілю: " + url);

  http.begin(url);
  http.setTimeout(5000);
  http.addHeader("x-device-key", DEVICE_API_KEY);
  http.addHeader("ngrok-skip-browser-warning", "true");

  int code = http.GET();

  if (code == 200) {
    String payload = http.getString();
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      Serial.println("Відповідь:");
      serializeJsonPretty(doc, Serial); 
      Serial.println(); 

      JsonObject profile = doc["profile"];
      state.petId            = profile["petId"] | 13;
      state.deviceId         = profile["deviceId"];
      state.recommendedPortion = profile["recommendedPortionGrams"] | 50;
      if (profile.containsKey("capacity")) state.capacity = profile["capacity"];
      
    } else {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
    }
    
    http.end();
    return true;
  }

  Serial.printf("[PROFILE] GET failed -> %d\n", code);
  http.end();
  return false;
}

bool fetchSchedules() {
  if (!state.isConnected || state.petId == 0) return false;

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/schedules/pets/" + String(state.petId);

  Serial.println("Запит розкладів: " + url);

  http.begin(url);
  http.addHeader("x-device-key", DEVICE_API_KEY);
  http.addHeader("ngrok-skip-browser-warning", "true");

  int code = http.GET();
  if (code != 200) {
    Serial.printf("[SCHEDULE] GET failed -> %d\n", code);
    http.end();
    return false;
  }

  String payload = http.getString();
  StaticJsonDocument<2048> doc;
  DeserializationError err = deserializeJson(doc, payload);
  
  if (err) {
    Serial.println("[SCHEDULE] JSON parse error");
    http.end();
    return false;
  }

  JsonArray arr = doc["schedules"];
  schedules.count = std::min(static_cast<int>(arr.size()), MAX_SCHEDULES);

  for (int i = 0; i < schedules.count; i++) {
    schedules.items[i].hour         = arr[i]["hour"];
    schedules.items[i].minute       = arr[i]["minute"];
    schedules.items[i].portionGrams = arr[i]["portionGrams"];
    schedules.items[i].enabled      = arr[i]["enabled"];
  }

  Serial.printf("[SCHEDULE] Завантажено %d розкладів:\r\n", schedules.count);
  
  for (int i = 0; i < schedules.count; i++) {
      Serial.printf("Час: %02d:%02d , Порція: %d\r\n", 
                    schedules.items[i].hour, 
                    schedules.items[i].minute, 
                    schedules.items[i].portionGrams);
  }
  http.end();
  return true;
}

bool sendRefillRequest(int grams) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Немає з'єднання!");
    return false;
  }

  WiFiClient client;
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/devices/" + String(DEVICE_ID) + "/refill";
  
  Serial.print("[HTTP] POST Refill: ");
  Serial.println(url);

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["grams"] = grams;
  
  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  bool success = false;

  if (httpCode > 0) {
    Serial.printf("[HTTP] Code: %d\n", httpCode);
    String payload = http.getString();
    
    Serial.println("[SERVER] Response:");
    DynamicJsonDocument responseDoc(1024); 
    DeserializationError error = deserializeJson(responseDoc, payload); 
    
    if (!error) {
       serializeJsonPretty(responseDoc, Serial); 
       Serial.println(); 

       // Сервер зазвичай повертає: "data": { "added": 200, "totalNow": 400 ... }
       if (responseDoc.containsKey("data")) {
          JsonObject data = responseDoc["data"];
          if (data.containsKey("totalNow")) {
            state.foodLevel = data["totalNow"];
            Serial.printf("[SYNC] Food Level updated after refill: %d g\n", state.foodLevel);
            updateLEDIndicators(); 
          }
       }
    }

    if (httpCode == 200 || httpCode == 201) {
      success = true;
    }
  } else {
    Serial.printf("[HTTP] Failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
  return success;
}

void sendHeartbeat() {
  if (!state.isConnected || state.deviceId == 0) return;

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/devices/heartbeat";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<64> doc;
  doc["deviceId"] = state.deviceId;
  String json;
  serializeJson(doc, json);

  int code = http.POST(json);
  if (code == 200) {
    Serial.println("[HEARTBEAT] OK");
  } else {
    Serial.printf("[HEARTBEAT] Error %d\n", code);
  }

  http.end();
}

bool updateFoodLevel() {
  Serial.printf("[FOOD] Поточний рівень: %d/%d г\r\n", state.foodLevel, state.capacity);
  return true;
}

void simulateTimeFromPot() {
  int raw = analogRead(POT_TIME_PIN);
  state.simulatedMinutes = map(raw, 0, 4095, 0, 1439);

  if (state.simulatedMinutes != state.lastMinutes) {
    int h = state.simulatedMinutes / 60;
    int m = state.simulatedMinutes % 60;
    Serial.printf("[TIME] %02d:%02d\r\n", h, m); 
    state.lastMinutes = state.simulatedMinutes;
  }
}

void executeDispense(int grams) {
  Serial.printf("[SERVO] Видача %d г... ", grams);
  feeder.write(90);
  delay(grams * 12);  
  feeder.write(0);
  Serial.println("виконано");
}

void updateLEDIndicators() {
  if (state.capacity <= 0) return; 

  int pct = (state.foodLevel * 100L) / state.capacity;

  if (pct > LOW_FOOD_THRESHOLD_PCT) {
    digitalWrite(LED_GREEN_PIN, HIGH);
    digitalWrite(LED_RED_PIN, LOW);
  } else {
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_RED_PIN, HIGH);
  }
}

void setLED(const char* mode) {
  if (strcmp(mode, "error") == 0) {
    digitalWrite(LED_GREEN_PIN, LOW); 
    for (int i = 0; i < 3; i++) {
      digitalWrite(LED_RED_PIN, HIGH); delay(200);
      digitalWrite(LED_RED_PIN, LOW);  delay(200);
    }
  } else if (strcmp(mode, "starting") == 0) {
    digitalWrite(LED_RED_PIN, HIGH);
    digitalWrite(LED_GREEN_PIN, HIGH);
    delay(1000);
  } else if (strcmp(mode, "ok") == 0) {
    digitalWrite(LED_RED_PIN, LOW);
    digitalWrite(LED_GREEN_PIN, LOW);
    delay(100);
    digitalWrite(LED_GREEN_PIN, HIGH);
    delay(300);
  }
  
  updateLEDIndicators();
}

bool sendFeedRequest(int grams) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Немає з'єднання!");
    return false;
  }

  WiFiClient client;
  HTTPClient http;

  String url = String(SERVER_URL) + "/api/schedules/pets/" + String(PET_ID) + "/feed-now";
  
  Serial.print("[HTTP] POST: ");
  Serial.println(url);

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["portionGrams"] = grams;
  doc["foodType"] = FOOD_TYPE; 

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  bool success = false;

  if (httpCode > 0) {
    Serial.printf("[HTTP] Code: %d\n", httpCode);
    String payload = http.getString();
    
    DynamicJsonDocument responseDoc(1024); 
    DeserializationError error = deserializeJson(responseDoc, payload); 

    if (!error) {
      Serial.println("[SERVER] Response:");
      serializeJsonPretty(responseDoc, Serial); 
      Serial.println(); 

      if (responseDoc.containsKey("event")) {
        JsonObject eventObj = responseDoc["event"];

        // 1. СИНХРОНІЗАЦІЯ
        if (eventObj.containsKey("foodLevel")) {
          state.foodLevel = eventObj["foodLevel"];
          updateLEDIndicators(); 
        }

        // 2. ПОПЕРЕДЖЕННЯ
        if (eventObj.containsKey("warning")) {
          const char* msg = eventObj["warning"];
          Serial.println("\n****************************************");
          Serial.print("[SERVER ALERT] ⚠️  ");
          Serial.println(msg);
          Serial.println("****************************************\n");
        }
      }
    } else {
      Serial.println("[RAW] " + payload);
    }

    if (httpCode == 201 || httpCode == 200) {
      success = true;
    }
  } else {
    Serial.printf("[HTTP] Failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
  return success;
}

void reportAutoFeed(int grams) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClient client;
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/schedules/pets/" + String(PET_ID) + "/feed-auto";
  
  Serial.print("[HTTP] AUTO REPORT: ");
  Serial.println(url);

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["portionGrams"] = grams;
  doc["foodType"] = FOOD_TYPE; 

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);

  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println("[SERVER] Auto Response:");
    
    DynamicJsonDocument responseDoc(1024);
    DeserializationError error = deserializeJson(responseDoc, payload);

    if (!error) {
      serializeJsonPretty(responseDoc, Serial);
      Serial.println();

      if (responseDoc.containsKey("event")) {
        JsonObject eventObj = responseDoc["event"];

        if (eventObj.containsKey("foodLevel")) {
           int serverFoodLevel = eventObj["foodLevel"];              
           state.foodLevel = serverFoodLevel; 
           updateLEDIndicators(); 
           Serial.printf("[SYNC] Food Level updated: %d g\n", state.foodLevel);
        }

        if (eventObj.containsKey("warning")) {
           const char* msg = eventObj["warning"];
           Serial.println("\n****************************************");
           Serial.print("[SERVER ALERT] ⚠️  ");
           Serial.println(msg);
           Serial.println("****************************************\n");
        } else {
           Serial.println("[SERVER] Status: OK");
        }
      }
    }
  } else {
    Serial.printf("[HTTP] Error: %s\n", http.errorToString(httpCode).c_str());
  }
  http.end();
}

void checkAutoFeeding() {
  if (schedules.count == 0) return;

  int currentTotalMinutes = state.simulatedMinutes;

  if (currentTotalMinutes <= lastFedMinute) {
    lastFedMinute = currentTotalMinutes;
    return;
  }

  for (int t = lastFedMinute + 1; t <= currentTotalMinutes; t++) {
    int h = t / 60;
    int m = t % 60;

    for (int i = 0; i < schedules.count; i++) {
      auto& sch = schedules.items[i];
      if (sch.enabled && sch.hour == h && sch.minute == m) {
        
        Serial.printf("\r\n[AUTO] ⏰ СПРАЦЮВАВ РОЗКЛАД! %02d:%02d — %d г\r\n", h, m, sch.portionGrams);

        executeDispense(sch.portionGrams);
        state.foodLevel -= sch.portionGrams;
        
        reportAutoFeed(sch.portionGrams);
        
        updateFoodLevel();
        updateLEDIndicators();
      }
    }
  }

  lastFedMinute = currentTotalMinutes;
}

void handleButtons() {
  static unsigned long lastFeed = 0;
  static unsigned long lastRefill = 0;
  unsigned long now = millis();

  if (digitalRead(BTN_FEED_PIN) == LOW && now - lastFeed > DEBOUNCE_MS) {
    lastFeed = now;
    Serial.println("[ЗЕЛЕНА] Запит на годування...");

    bool serverApproved = sendFeedRequest(state.recommendedPortion);

    if (serverApproved) {
      Serial.println("[SERVER] Дозвіл отримано! Видаю корм...");
      executeDispense(state.recommendedPortion);
      state.foodLevel -= state.recommendedPortion; 
      updateLEDIndicators(); 
    } else {
      Serial.println("[SERVER] Відмова (помилка або мало корму в БД)");
      setLED("error"); 
    }
  }
  
  if (digitalRead(BTN_REFILL_PIN) == LOW && now - lastRefill > DEBOUNCE_MS) {
    lastRefill = now;
    Serial.println("[BTN] Поповнення запасів...");

    bool success = sendRefillRequest(REFILL_AMOUNT);

    if (success) {
      Serial.println("Поповнення успішне!");
      setLED("ok"); 
    } else {
      Serial.println("Помилка поповнення!");
      setLED("error");
    }
  }
}