#include <DHTesp.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Arduino_JSON.h>
DHTesp dht;

const char* ssid = "Quang Tung";
const char* password = "dima6789";
const char* mqtt_server = "192.168.1.223";
//const char* mqtt_server = "91.121.93.94";

//const char* ssid = "iPhone_Quang";
//const char* password = "1234567899";
//const char* mqtt_server = "172.20.10.2";
//const char* mqtt_server = "91.121.93.94";


WiFiClient espClient;
PubSubClient client(espClient);

//cách cũ không dùng nữa///////////
#define MSG_BUFFER_SIZE  (50)
char msg[MSG_BUFFER_SIZE];
char temp_str[50];         
char humi_str[50];
char light_str[50];
char messageBuff[100];    //tạo ra 1 mảng để chứa chuỗi muốn gửi đi
int value = 0;
//////////////////////////////////


void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#define sub1 "relay_1"
#define sub2 "relay_2"
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
if (strstr(topic,sub1)){                      // lệnh strstr là tìm kiếm trong topic có sub1 hay không
    for (int i = 0; i < length; i++) {
      Serial.print((char)payload[i]);
    }
    Serial.println();
    if ((char)payload[0] == '0') {
      digitalWrite(D1, LOW);                  // Turn the LED on (relay mức tích cực thấp)
    } else {
      digitalWrite(D1, HIGH);                 // Turn the LED off by making the voltage HIGH
    }    
  }

  else if ( strstr(topic,sub2))
  {
    for (int i = 0; i < length; i++) {
      Serial.print((char)payload[i]);
    }
    Serial.println();
    // Switch on the LED if an 1 was received as first character
    if ((char)payload[0] == '0') {
      digitalWrite(D2, LOW);   // Turn the LED on (Note that LOW is the voltage level
    } else {
      digitalWrite(D2, HIGH);  // Turn the LED off by making the voltage HIGH
    }
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      client.subscribe(sub1);
      client.subscribe(sub2);
    } else {
      Serial.println(" try again in 2 seconds");
      // Wait 5 seconds before retrying
      delay(1000);
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#define dht_pin D5
#define dht_type DHT11

void setup() {
  pinMode(BUILTIN_LED, OUTPUT);     // Initialize the BUILTIN_LED pin as an output
  pinMode(D1, OUTPUT);
  pinMode(D2, OUTPUT);
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  dht.setup(dht_pin, DHTesp::dht_type); //for DHT11 Connect DHT sensor to GPIO 17
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
JSONVar data;       //lưu trữ giá trị cảm biến dưới dạng json

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
//    value++;
//    snprintf (msg, MSG_BUFFER_SIZE, "Update #%ld", value);
//    Serial.print("Publish message: ");
//    Serial.println(msg);

    int state_1 = digitalRead(D1);
    int state_2 = digitalRead(D2);
    float temp = dht.getTemperature();
    float humi = dht.getHumidity();
    float light = analogRead(A0);

    data["temperature"] = temp;
    data["humidity"] = humi;
    data["light"] = light;
    data["state_1"] = state_1;
    data["state_2"] = state_2;

    Serial.println(state_1);
    Serial.println(state_2);
    Serial.println();
    
    Serial.println(temp);
    Serial.println(humi);
    Serial.println(light);

    String jsonString = JSON.stringify(data);
    client.publish("sensor", jsonString.c_str());
        
//    snprintf (temp_str, 50, "%f",temp);     ////lưu string vào string temp_ str có độ dài được phép tối đa 50 kí tự 
//    Serial.println(temp_str);
//    client.publish("sensor/temp",temp_str );
//      Serial.println(temp);
//
//    snprintf (humi_str, 50, "%f", humi);      
//    Serial.println(humi_str);
//    client.publish("sensor/humi",humi_str);
//      Serial.println(humi);
    delay(1000);

}
