from gpiozero import DistanceSensor, Buzzer # librarie voor afstandssensor en buzzer
import time # library voor tijdsvertraging
import subprocess # library voor uitvoeren systeemcommando's (scherm aan/uit)

TRIG_PIN = 23 # definieren GPIO pinnen
ECHO_PIN = 24
BUZZER_PIN = 18

sensor = DistanceSensor(
    echo=ECHO_PIN,
    trigger=TRIG_PIN,
    max_distance=2
) # sensor definieren

buzzer = Buzzer(BUZZER_PIN)

DETECT_DISTANCE = 0.5 # afstand voor detectie
SCREEN_TIMEOUT = 10 # scherm uit na 10 seconden zonder interactie
WAIT_NO_DETECTION = 30 # 30 seconden wachten als niemand gedetecteerd wordt

screen_is_on = False # variabele om schermstatus bij te houden
last_detection_time = 0 # tijd van laatste detectie bijhouden

def turn_screen_on():
    subprocess.run(["xset", "dpms", "force", "on"]) # functie om scherm aan te zetten

def turn_screen_off():
    subprocess.run(["xset", "dpms", "force", "off"]) # functie om scherm uit te zetten


def beep_once():
    buzzer.on()
    time.sleep(0.5)
    buzzer.off() # functie buzzer laten piepen

try:

    turn_screen_off()

    while True:

        distance = sensor.distance # afstand meten

        if distance <= DETECT_DISTANCE: # uitvoeren als afstand kleiner of gelijk is aan 50 cm

            last_detection_time = time.time() # tijd van laatste interactie opslaan

            if not screen_is_on: # alleen uitvoeren als scherm nog niet aan is

                turn_screen_on()
                beep_once()

                screen_is_on = True # schermstatus bijwerken

        if screen_is_on:

            if time.time() - last_detection_time >= SCREEN_TIMEOUT: # controleren of er 10 seconden geen interactie is

                turn_screen_off()
                screen_is_on = False
                time.sleep(WAIT_NO_DETECTION)

        time.sleep(0.2)

except KeyboardInterrupt: # programma stoppen bij Ctrl + C
    print("\nProgramma gestopt")