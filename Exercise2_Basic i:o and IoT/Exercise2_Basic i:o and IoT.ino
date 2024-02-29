// Pin definitions for ultrasonic sensor, button, and LED

#define TRIG_PIN 9 // Ultrasonic Sensor
#define ECHO_PIN 10 // Ultrasonic Sensor
#define BUTTON_PIN 2 // Push Button
#define LED_PIN 8 // LED pin

#include <LiquidCrystal.h>

// LCD pin connections

const int rs = 12, en = 11, d4 = 6, d5 = 5, d6 = 4, d7 = 3;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

// Timer variables
int minutes = 0;
int secondes = 0;
boolean timerStarted = false;
boolean state = false;
char timeline[16];

void setup() {
  Serial.begin(9600); // Start serial communication at 9600 baud rate
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT); 
  lcd.begin(16, 2);
}

void loop() {
  long duration, distance;
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  duration = pulseIn(ECHO_PIN, HIGH);
  distance = (duration/2) / 29.1;

  int buttonState = digitalRead(BUTTON_PIN); 
  // Read the state of the pushbutton
  // // Send distance, buttonState, and state separated by a comma
  Serial.print(distance);
  Serial.print(",");
  Serial.print(buttonState);
  Serial.print(",");
  Serial.println(state);
  
  delay(100);

  // Check if distance is less than 50 cm and state is false, then start timer
  if (distance < 50 && state == false) {
    timerStarted = true;
  }

  if (timerStarted) {
    // Display the timer
    lcd.clear();
    lcd.setCursor(0, 0); // first row
    lcd.print("Happy Break");
    lcd.setCursor(0, 1); // second row
    sprintf(timeline, "%02d mins %02d secs", minutes, secondes);
    lcd.print(timeline);
  
    delay(1000); // Wait for a second
    secondes++; // Increment the seconds
  
    // Reset seconds and increment minutes after 60 seconds
    if (secondes == 60) {
      secondes = 0;
      minutes++;
    }
  } else {
    lcd.clear(); // Clear the LCD if the timer is not started
    lcd.setCursor(0, 0);
    lcd.print("Work Twerk Work");
    lcd.setCursor(0, 1);
    lcd.print("You've Got This!");
  }

  if (secondes == 40){ // if seconds reach 40 then change state to true
    state = true;
  }

  // LED alert for break period end
  
  if (state) {. // if state is true 
    timerStarted = false; // timerStarted changes to false
    lcd.clear(); // LCD clears
    lcd.setCursor(0, 0);
    lcd.print("Break Over");
    lcd.setCursor(0, 1);
    lcd.print("Time to Work");
    // making LED blink
    digitalWrite(LED_PIN, HIGH); // Turn the LED on
    delay(100);                 // Wait for a second (1000 milliseconds)
    digitalWrite(LED_PIN, LOW);  // Turn the LED off
    delay(100);
  } else {
    digitalWrite(LED_PIN, LOW);
  }

}