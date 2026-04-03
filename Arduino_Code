#include <LiquidCrystal.h>

const int rs = 12, en = 11, d4 = 5, d5 = 4, d6 = 3, d7 = 2;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

const int trigPin = 13;
const int echoPin = 8;
float duration, distance;

const int buzzer = 7;


bool screenOn = false;
unsigned long lastDetectedTime = 0;  
const unsigned long timeout = 10000; 

void setup() {
  lcd.begin(16, 2);
  pinMode(buzzer, OUTPUT);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);

  lcd.noDisplay();
}

void loop() {
  
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = (duration * 0.0343) / 2;

  Serial.print("Afstand: ");
  Serial.println(distance);

  
  if (distance <= 50) {
    lastDetectedTime = millis();  

    
    if (!screenOn) {
      lcd.display();
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("TasteMate Aan");
      lcd.setCursor(0, 1);
      lcd.print("12 producten");

      
      tone(buzzer, 1000);
      delay(500);
      noTone(buzzer);

      screenOn = true; 
    }
  }

  
  if (screenOn && millis() - lastDetectedTime >= timeout) {
    lcd.noDisplay();
    screenOn = false; 
  }

  delay(50);
}