from gpiozero import DistanceSensor, Buzzer
import time
import subprocess
import pyautogui

pyautogui.PAUSE = 0  # voorkomt extra vertraging bij pyautogui

TRIG_PIN = 23 # GPIO pinnen definiëren voor de afstandssensor en buzzer
ECHO_PIN = 24
BUZZER_PIN = 18

DETECT_DISTANCE = 0.5 # detectieafstand in meter
SCREEN_TIMEOUT = 10 # afsluittijd na laatste detectie
WAIT_NO_DETECTION = 30 # tijd tussen scans
LOOP_DELAY = 0.05  # sneller meten dan 0.2s

sensor = DistanceSensor(
    echo=ECHO_PIN,
    trigger=TRIG_PIN,
    max_distance=2
) # definieren afstandssensor met max afstand van 2 meter

buzzer = Buzzer(BUZZER_PIN) # definieren buzzer

screen_is_on = False # schermstatus bijhouden
last_detection_time = time.monotonic() # tijd van laastee detectie bijhouden
last_mouse_position = pyautogui.position() # locatie van de muis bijhouden
last_no_detection_message = 0 # tijd van laatste scan bijhouden


def turn_screen_on():
    subprocess.run(
        ["wlr-randr", "--output", "HDMI-A-1", "--on"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    ) # aanzetten scherm


def turn_screen_off():
    subprocess.run(
        ["wlr-randr", "--output", "HDMI-A-1", "--off"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    ) # uitzetten scherm


def beep_once():
    buzzer.beep(on_time=0.5, off_time=0, n=1, background=True) # een keer piepen bij detectie


try:
    turn_screen_off()

    while True:
        now = time.monotonic() # huidige tijd na start programma

        distance = sensor.distance # afstand meten
        current_mouse_position = pyautogui.position() # locatie muis meten

        person_detected = distance <= DETECT_DISTANCE # persoon gedetecteerd als afstand binnen limiet
        interaction_detected = current_mouse_position != last_mouse_position # interactie gedetecteerd als muis is bewogen

        if person_detected:
            last_detection_time = now # tijd van detectie resetten

            if not screen_is_on: # scherm aanzetten en piepen bij eerste detectie
                turn_screen_on()
                beep_once()
                screen_is_on = True

        if interaction_detected: # tijd van detecteie resetten bij interactie
            last_detection_time = now
            last_mouse_position = current_mouse_position

        if screen_is_on and now - last_detection_time >= SCREEN_TIMEOUT: # scherm uitzetten als er geen detectie of interactie is binnen de timeout
            turn_screen_off()
            screen_is_on = False

        if not screen_is_on and not person_detected: # regelmatig een bericht tonen als er niemand is gedetecteerd
            if now - last_no_detection_message >= WAIT_NO_DETECTION:
                print("Niemand gedetecteerd, wachten 30 seconden")
                last_no_detection_message = now

        time.sleep(LOOP_DELAY) # korte pauze om CPU te ontlasten

except KeyboardInterrupt: # programma stoppen bij Ctrl+C
    buzzer.off()
    print("\nProgramma gestopt")