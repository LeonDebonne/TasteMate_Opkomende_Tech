from gpiozero import DistanceSensor #library voor afstandssensor
from time import sleep #library voor tijdsvertraging

TRIG_PIN = 23 #definieren GPIO pinnen
ECHO_PIN = 24

sensor = DistanceSensor(echo=ECHO_PIN, trigger=TRIG_PIN, max_distance=2.0) # sensor definieren

print("Afstandssensor test gestart") 
print("Druk Ctrl + C om te stoppen")

try:
    while True: # oneidige loop tot interuptie
        afstand_cm = sensor.distance * 100 # omrekenen afstand naar centimeters
        print(f"Afstand: {afstand_cm:.1f} cm") # scrijven naar seriele monitor
        sleep(0.5) #wachten voor 0.5s

except KeyboardInterrupt:
    print("\nTest gestopt") # mogelijkheid test stoppen bij Ctrl + C