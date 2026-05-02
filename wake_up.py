from gpiozero import DistanceSensor, Buzzer # libraries afstandssensor en buzzer
import time # library voor tijdsfuncties
import subprocess # library voor uitvoeren van systeemcommando's
import pyautogui # library voor muisinteractie

pyautogui.PAUSE = 0  # voorkomt extra vertraging bij pyautogui

TRIG_PIN = 23 # GPIO pinnen definiëren voor de afstandssensor en buzzer
ECHO_PIN = 24
BUZZER_PIN = 18

DETECT_DISTANCE = 0.5 # detectieafstand in meter
SCREEN_ON_TIME = 10 # scherm blijft 10 seconden aan na detectie
WAIT_NO_DETECTION = 30 # wachttijd als er niemand gedetecteerd wordt
WAIT_AFTER_INPUT = 30 # wachttijd na interactie
LOOP_DELAY = 0.2  # korte pauze voor CPU ontlasting

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

    screen_is_on = True
    beep_once() # buzzer piept elke keer als scherm aangaat
    subprocess.run(
        ["wlr-randr", "--output", "HDMI-A-1", "--transform", "90"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )


def turn_screen_off():
    global screen_is_on

    subprocess.run(
        ["wlr-randr", "--output", "HDMI-A-1", "--off"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    ) # uitzetten scherm

    screen_is_on = False



def beep_once():
    buzzer.beep(on_time=0.5, off_time=0, n=1, background=True) # een keer piepen bij detectie


def is_person_detected():
    distance = sensor.distance # afstand meten
    return distance <= DETECT_DISTANCE # persoon gedetecteerd als afstand binnen limiet


def is_interaction_detected(last_mouse_position):
    current_mouse_position = pyautogui.position() # huidige muispositie ophalen
    return current_mouse_position != last_mouse_position, current_mouse_position # vergelijken met vorige positie


try:
    turn_screen_off() # scherm starten in uit toestand

    while True:
        print("Scannen afstandssensor...")

        if is_person_detected(): # controleren of er een persoon is
            print("Persoon gedetecteerd")

            if not screen_is_on: # scherm aanzetten en buzzer activeren bij eerste detectie
                turn_screen_on()

            print("Scherm aan voor 10 seconden")
            time.sleep(SCREEN_ON_TIME) # scherm blijft minimaal 10 seconden aan

            last_mouse_position = pyautogui.position() # startpositie muis opslaan

            while screen_is_on: # zolang scherm aan staat blijven we interactie checken
                interaction_detected, current_mouse_position = is_interaction_detected(last_mouse_position)

                if interaction_detected: # als er interactie is

                    last_mouse_position = current_mouse_position # muispositie updaten

                    time.sleep(WAIT_AFTER_INPUT) # wachten na interactie

                else: # geen interactie meer
                    turn_screen_off() # scherm uitzetten

        else: # geen persoon gedetecteerd
            time.sleep(WAIT_NO_DETECTION) # wachten voor volgende scan

        time.sleep(LOOP_DELAY) # korte pauze om CPU te ontlasten

except KeyboardInterrupt: # programma stoppen bij Ctrl+C
    buzzer.off()
    turn_screen_off()
    print("\nProgramma gestopt")