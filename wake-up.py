from gpiozero import DistanceSensor, LED
import time

# HC-SR04 pins
sensor = DistanceSensor(echo=24, trigger=23)

# LED op GPIO17
led = LED(17)

# afstand (in meter)
THRESHOLD = 0.8

while True:
    distance = sensor.distance
    print(f"Afstand: {distance*100:.1f} cm")

    if distance < THRESHOLD:
        led.on()
    else:
        led.off()

    time.sleep(0.2)