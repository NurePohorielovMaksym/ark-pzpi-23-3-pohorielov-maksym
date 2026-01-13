#ifndef CONFIG_H
#define CONFIG_H

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <algorithm>   

const char* const WIFI_SSID       = "Wokwi-GUEST";
const char* const WIFI_PASS       = "";

const char* const SERVER_URL      = "http://192.168.0.180:3000";  
const char* const DEVICE_API_KEY  = "b033d1b5a0c69b960757532aae8b43731d4a1c64bc3380e8694efe94855e37ff";
const char* const DEVICE_SERIAL   = "ABC-123456";

const int POT_TIME_PIN      = 34;
const int BTN_FEED_PIN      = 4;
const int BTN_REFILL_PIN    = 15;
const int LED_RED_PIN       = 2;
const int LED_GREEN_PIN     = 5;
const int SERVO_PIN         = 18;

const int DEFAULT_CAPACITY         = 1000;
const int LOW_FOOD_THRESHOLD_PCT   = 30;
const unsigned long HEARTBEAT_MS   = 30000UL;
const unsigned long SCHEDULE_MS    = 60000UL;
const int MAX_SCHEDULES            = 10;
const unsigned long DEBOUNCE_MS    = 300UL;
const int LOOP_DELAY_MS            = 50;

const int PET_ID = 1;      
const int DEVICE_ID = 1;    
const char* const FOOD_TYPE = "Dry"; 
const int REFILL_AMOUNT = 39;

struct DeviceState {
  int  deviceId         = 0;
  int  petId            = 0;
  int  foodLevel        = DEFAULT_CAPACITY;
  int  capacity         = DEFAULT_CAPACITY;
  int  recommendedPortion = 50;
  bool isConnected      = false;
  int  simulatedMinutes = 0;
  int  lastMinutes      = -1;
  unsigned long lastHeartbeat   = 0;
  unsigned long lastScheduleFetch = 0;
};

struct ScheduleItem {
  int  hour;
  int  minute;
  int  portionGrams;
  bool enabled;
};

struct ScheduleList {
  ScheduleItem items[MAX_SCHEDULES];
  int count = 0;
};
extern Servo feeder;
extern DeviceState state;
extern ScheduleList schedules;
extern int lastFedMinute;

void connectWiFi();
bool fetchPetProfile();
bool fetchSchedules();
void sendHeartbeat();
bool sendFeedRequest(int grams);
bool sendRefillRequest(int grams);
void reportAutoFeed(int grams);
void handleButtons();
void simulateTimeFromPot();
void checkAutoFeeding();
void updateLEDIndicators();
void executeDispense(int grams);
void setLED(const char* mode);
bool updateFoodLevel();

#endif