from gpiozero import DistanceSensor, Buzzer # libraries afstandssensor en buzzer
import time # library voor tijdsfuncties
import subprocess # library voor uitvoeren van systeemcommando's
import pyautogui # library voor muisinteractie

pyautogui.PAUSE = 0  # voorkomt extra vertraging bij pyautogui

TRIG_PIN = 23 # GPIO pinnen definiëren voor de afstandssensor en buzzer
ECHO_PIN = 24
BUZZER_PIN = 18

DETECT_DISTANCE = 0.5 # detectieafstand in meter
SCREEN_ON_TIME = 10 # scherm blijft 10 seconden aan zonder interactie nadat persoon weg is
LOOP_DELAY = 0.2 # korte pauze voor CPU ontlasting

sensor = DistanceSensor(
    echo=ECHO_PIN,
    trigger=TRIG_PIN,
    max_distance=2
) # definieren afstandssensor met max afstand van 2 meter

buzzer = Buzzer(BUZZER_PIN) # definieren buzzer

screen_is_on = False # schermstatus bijhouden


def turn_screen_on():
    global screen_is_on

    subprocess.run(
        ["wlr-randr", "--output", "HDMI-A-1", "--on"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    ) # aanzetten scherm

    screen_is_on = True # schermstatus aanpassen naar aan
    beep_once() # buzzer piept elke keer als scherm aangaat

    subprocess.run(
        ["wlr-randr", "--output", "HDMI-A-1", "--transform", "90"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    ) # scherm draaien


def turn_screen_off():
    global screen_is_on

    subprocess.run(
        ["wlr-randr", "--output", "HDMI-A-1", "--off"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    ) # uitzetten scherm

    screen_is_on = False # schermstatus aanpassen naar uit


def beep_once():
    buzzer.beep(on_time=0.5, off_time=0, n=1, background=True) # een keer piepen bij scherm aanzetten


def is_person_detected():
    distance = sensor.distance # afstand meten
    return distance <= DETECT_DISTANCE # persoon gedetecteerd als afstand binnen limiet


def is_interaction_detected(last_mouse_position):
    current_mouse_position = pyautogui.position() # huidige muispositie ophalen
    return current_mouse_position != last_mouse_position, current_mouse_position # vergelijken met vorige positie


try:
    turn_screen_off() # scherm starten in uit toestand

    while True:
        if is_person_detected(): # controleren of er een persoon is

            if not screen_is_on: # scherm aanzetten en buzzer activeren bij eerste detectie
                turn_screen_on()

            last_mouse_position = pyautogui.position() # startpositie muis opslaan
            last_activity_time = time.monotonic() # timer starten

            while screen_is_on: # zolang scherm aan staat blijven we detectie en interactie checken
                now = time.monotonic()

                if is_person_detected(): # zolang persoon aanwezig is blijft scherm aan
                    last_activity_time = now # timer resetten

                interaction_detected, current_mouse_position = is_interaction_detected(last_mouse_position)

                if interaction_detected: # als er interactie is
                    last_activity_time = now # timer resetten
                    last_mouse_position = current_mouse_position # muispositie updaten

                if now - last_activity_time >= SCREEN_ON_TIME: # 10 seconden geen persoon en geen interactie
                    turn_screen_off() # scherm uitzetten

                time.sleep(LOOP_DELAY) # korte pauze om CPU te ontlasten

        else:
            pass # geen wachttijd meer, blijft direct opnieuw scannen

        time.sleep(LOOP_DELAY) # korte pauze om CPU te ontlasten

except KeyboardInterrupt: # programma stoppen bij Ctrl+C
    buzzer.off() # buzzer uitschakelen
    turn_screen_off() # scherm uitzetten
    print("\nProgramma gestopt")