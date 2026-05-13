import speech_recognition as sr
from google import genai
import edge_tts
import asyncio
import pygame
import io
import json
import os
from gpiozero import Button, Buzzer
from key import GEMINI_API_KEY

# Audio via ALSA gebruiken, nodig voor Raspberry Pi / MAX98357A
os.environ["SDL_AUDIODRIVER"] = "alsa"

# Audiospeler initialiseren
pygame.mixer.init(
    frequency=44100,
    size=-16,
    channels=2,
    buffer=512
)

# Gemini verbinden
client = genai.Client(api_key=GEMINI_API_KEY)

# Spraakherkenner
r = sr.Recognizer()

# Knop op GPIO17
# Knop aangesloten tussen GPIO17 en GND
BUTTON_PIN = 17
button = Button(BUTTON_PIN, pull_up=True, bounce_time=0.1)

# Buzzer op GPIO27
BUZZER_PIN = 27
buzzer = Buzzer(BUZZER_PIN)

# Luistertijd na knop
PHRASE_TIME_LIMIT = 10

# USB microfoon index
# Run eerst de code en kijk welk nummer jouw USB PnP microfoon heeft
MIC_DEVICE_INDEX = 0

# Inventory bestand
base_dir = os.path.dirname(os.path.abspath(__file__))
inventory_path = os.path.join(base_dir, "..", "webserver", "inventory.json")

# Conversatiegeschiedenis
geschiedenis = []


def toon_microfoons():
    print("Beschikbare microfoons:")

    for index, name in enumerate(sr.Microphone.list_microphone_names()):
        print(index, name)


def inventory_naar_tekst(inventory):
    regels = []
    categories = {}

    # Categorieën verzamelen
    for c in inventory.get("categories", []):
        categories[c["id"]] = c["name"]

    # Producten omzetten naar leesbare tekst
    for product in inventory.get("products", []):

        categorie = categories.get(
            product.get("categoryId", ""),
            "Onbekend"
        )

        naam = product.get("name", "Onbekend")
        houdbaar = product.get("expiryDate", "onbekend")

        regels.append(
            f"- {naam} categorie {categorie} houdbaar tot {houdbaar}"
        )

    # Als koelkast leeg is
    if not regels:
        return "De koelkast is momenteel leeg."

    return "\n".join(regels)


async def piep_twee_maal():
    """Laat de buzzer 2 maal piepen."""
    for _ in range(2):
        buzzer.on()
        await asyncio.sleep(1)
        buzzer.off()
        await asyncio.sleep(1)


async def speak(text):

    # Tekst naar spraak via Edge TTS
    communicate = edge_tts.Communicate(
        text=text,
        voice="nl-NL-ColetteNeural"
    )

    audio_data = b""

    # Audio chunks verzamelen
    async for chunk in communicate.stream():

        if chunk["type"] == "audio":
            audio_data += chunk["data"]

    # Audio in geheugen laden
    audio_file = io.BytesIO(audio_data)
    audio_file.seek(0)

    # Audio afspelen
    pygame.mixer.music.load(audio_file)
    pygame.mixer.music.play()

    # Wachten tot audio klaar is
    while pygame.mixer.music.get_busy():
        await asyncio.sleep(0.1)


async def main():

    toon_microfoons()

    print(f"Gebruikte microfoon index: {MIC_DEVICE_INDEX}")
    print("Klaar. Druk op de knop om te spreken.")

    # Microfoon openen
    with sr.Microphone(device_index=MIC_DEVICE_INDEX) as mic:

        # Achtergrondgeluid kalibreren
        r.adjust_for_ambient_noise(mic, duration=1)

        try:
            while True:

                # Wachten op knopdruk
                print("Wachten op knop...")
                button.wait_for_press()

                print("Knop ingedrukt.")

                # Buzzer 2 maal laten piepen
                await piep_twee_maal()

                print("Assistent luistert nu...")

                try:

                    # Audio opnemen
                    audio = r.listen(
                        mic,
                        timeout=60,
			phrase_time_limit=PHRASE_TIME_LIMIT
                    )

                    print("Luisteren gestopt.")
                    print("Spraak wordt omgezet naar tekst...")

                    # Spraak naar tekst
                    spoken = r.recognize_google(
                        audio,
                        language="nl-NL"
                    )

                    print(f"Jij: {spoken}")

                except sr.UnknownValueError:

                    print("Niet verstaan, probeer opnieuw.")

                    await speak(
                        "Ik heb je niet goed verstaan."
                    )

                    continue

                except sr.RequestError:

                    print(
                        "Geen verbinding met spraakherkenning."
                    )

                    await speak(
                        "Er is geen verbinding met de spraakherkenning."
                    )

                    continue

                # Gebruikersvraag opslaan
                geschiedenis.append({
                    "role": "user",
                    "content": spoken
                })

                # Geschiedenis beperken
                if len(geschiedenis) > 4:
                    geschiedenis.pop(0)

                # Inventory laden
                try:

                    with open(
                        inventory_path,
                        "r",
                        encoding="utf-8"
                    ) as f:

                        inventory = json.load(f)

                except FileNotFoundError:

                    await speak(
                        "Ik kan de inventaris niet vinden."
                    )

                    continue

                # Context voor Gemini
                actuele_context = f"""
Je bent een koelkastassistent.

Je helpt de gebruiker met het bijhouden van voedsel in de koelkast.

De categorieën zijn verschillende onderverdelingen in de koelkast.

In de categorieën zijn verschillende producten terug te vinden met hun houdbaarheidsdata.

{inventory_naar_tekst(inventory)}

Geef enkel outputs die op menselijke conversatie lijken.

Antwoord alleen op de vraag, als er wordt gevraagd welke product er in de koelkast zitten dan worden alleen de producten benoemd, de categorie waar deze in zit en de houdbaarheidsdatum worden niet meteen verteld, enkel als er daar naar wordt gevraagd.

Geef geen extra informatie tenzij hier expliciet om gevraagd wordt.

Geef korte en duidelijke antwoorden.

Begin je antwoord nooit met Assistent.

Gebruik alleen gegevens uit de bovenstaande inventarislijst. Verzin nooit product.

Spreek nooit tekens uit zoals *, antwoord specifiek alleen op de vraag geef geen extra info.
"""

                berichten = actuele_context + "\n\n"

                # Conversatiegeschiedenis toevoegen
                for bericht in geschiedenis:

                    if bericht["role"] == "user":

                        berichten += (
                            f"Gebruiker: {bericht['content']}\n"
                        )

                    else:

                        berichten += (
                            f"Assistent: {bericht['content']}\n"
                        )

                try:

                    #Gemini oproepen
                    await asyncio.sleep(1)
                    resp = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=berichten
                    )

                    reply = resp.text.strip()

                    reply = reply.removeprefix(
                        "Assistent:"
                    ).strip()

                except Exception as e:

                    print(f"Gemini fout: {e}")

                    await speak(
                        "Gemini is momenteel overbelast."
                    )

                    continue

                print(f"Assistent: {reply}")

                # Antwoord opslaan
                geschiedenis.append({
                    "role": "assistant",
                    "content": reply
                })

                # Antwoord uitspreken
                await speak(reply)

                print(
                    "Druk opnieuw op de knop voor een nieuwe vraag."
                )

        except KeyboardInterrupt:

            print("\nAssistent afgesloten via Ctrl+C.")

            pygame.mixer.music.stop()
            pygame.mixer.quit()


try:
    asyncio.run(main())

except KeyboardInterrupt:
    pass