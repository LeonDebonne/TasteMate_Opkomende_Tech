from gpiozero import Buzzer # library voor buzzer
from time import sleep # library voor tijdsvertraging

BUZZER_PIN = 18 #definieren GPIO pin

buzzer = Buzzer(BUZZER_PIN) # buzzer definieren

print("Buzzer test gestart")

try:
    while True:
        print("Buzzer AAN") # schrijven naar seriele monitor
        buzzer.on() # buzzer aanzetten
        sleep(1) # wachten voor 1s

        print("Buzzer UIT") # schrijven naar seriele monitor
        buzzer.off() # buzzer uitzetten
        sleep(1) # wachten voor 1s

except KeyboardInterrupt:
    buzzer.off() # buzzer uitzetten bij interuptie
    print("\nTest gestopt") # mogelijkheid test stoppen bij Ctrl + C