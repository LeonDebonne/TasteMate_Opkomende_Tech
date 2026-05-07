import speech_recognition as sr
from google import genai
import edge_tts
import asyncio
import pygame
import io
import json
import os
from gpiozero import Button
from key import GEMINI_API_KEY

# Audio via ALSA gebruiken, nodig voor Raspberry Pi / MAX98357A
os.environ["SDL_AUDIODRIVER"] = "alsa"

# Gemini verbinden
client = genai.Client(api_key=GEMINI_API_KEY)

# Spraakherkenner
r = sr.Recognizer()

# Audiospeler
pygame.mixer.init(frequency=44100)

# Knop
BUTTON_PIN = 17
button = Button(BUTTON_PIN, pull_up=True)

# Luistertijd na knop
LISTEN_TIME = 60

# USB microfoon index
# Run eerst de code en kijk welk nummer jouw USB PnP microfoon heeft
MIC_DEVICE_INDEX = 2

# Inventory bestand
base_dir = os.path.dirname(os.path.abspath(__file__))
inventory_path = os.path.join(base_dir, "..", "webserver", "inventory.json")


def toon_microfoons():
    print("Beschikbare microfoons:")
    for index, name in enumerate(sr.Microphone.list_microphone_names()):
        print(index, name)


def inventory_naar_tekst(inventory):
    regels = []
    categories = {}

    for c in inventory.get("categories", []):
        categories[c["id"]] = c["name"]

    for product in inventory.get("products", []):
        categorie = categories.get(product.get("categoryId", ""), "Onbekend")
        naam = product.get("name", "Onbekend")
        houdbaar = product.get("expiryDate", "onbekend")
        regels.append(f"- {naam} (categorie: {categorie}, houdbaar tot: {houdbaar})")

    if not regels:
        return "De koelkast is momenteel leeg."

    return "\n".join(regels)


geschiedenis = []


async def speak(text):
    communicate = edge_tts.Communicate(
        text,
        voice="nl-NL-ColetteNeural"
    )

    audio_data = b""

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]

    pygame.mixer.music.load(io.BytesIO(audio_data))
    pygame.mixer.music.play()

    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)


async def main():
    toon_microfoons()

    print(f"Gebruikte microfoon index: {MIC_DEVICE_INDEX}")
    print("Klaar. Druk op de knop om 60 seconden te spreken.")

    with sr.Microphone(device_index=MIC_DEVICE_INDEX) as mic:
        r.adjust_for_ambient_noise(mic, duration=1)

        try:
            while True:
                try:
                    print("Wachten op knop...")
                    button.wait_for_press()

                    print("Knop ingedrukt.")
                    print("Assistent luistert nu 60 seconden...")

                    audio = r.record(mic, duration=LISTEN_TIME)

                    print("Luisteren gestopt.")
                    print("Spraak wordt omgezet naar tekst...")

                    spoken = r.recognize_google(audio, language="nl-NL")
                    print(f"Jij: {spoken}")

                except sr.UnknownValueError:
                    print("Niet verstaan, probeer opnieuw.")
                    await speak("Ik heb je niet goed verstaan.")
                    continue

                except sr.RequestError:
                    print("Geen verbinding met spraakherkenning.")
                    await speak("Er is geen verbinding met de spraakherkenning.")
                    continue

                geschiedenis.append({"role": "user", "content": spoken})

                if len(geschiedenis) > 4:
                    geschiedenis.pop(0)

                with open(inventory_path, "r", encoding="utf-8") as f:
                    inventory = json.load(f)

                actuele_context = f"""
Je bent een koelkastassistent. Je helpt de gebruiker met het bijhouden van voedsel in de koelkast.
De categorieën zijn verschillende onderverdelingen in de koelkast. Bv. Sauzen
In de categorieën zijn verschillende producten terug te vinden met hun bijhorende houdbaarheidsdata.

{inventory_naar_tekst(inventory)}

Geef enkel outputs die op menselijke conversatie lijkt. Geen leestekens of speciale tekens voorlezen.
Antwoord alleen op de vraag, geen extra informatie zoals houdbaarheidsdata of positie meegeven als hier niet expliciet om gevraagd word.
Geef korte en duidelijke antwoorden. Begin je antwoord nooit met "Assistent:".
Gebruik alleen gegevens uit de bovenstaande lijst.
Gebruik correcte leestekens in je antwoorden, zoals komma's bij opsommingen en punten aan het einde van zinnen.
"""

                berichten = actuele_context + "\n\n"

                for bericht in geschiedenis:
                    if bericht["role"] == "user":
                        berichten += f"Gebruiker: {bericht['content']}\n"
                    else:
                        berichten += f"Assistent: {bericht['content']}\n"

                try:
                    resp = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=berichten
                    )

                    reply = resp.text.strip()
                    reply = reply.removeprefix("Assistent:").strip()

                except Exception as e:
                    print(f"Gemini fout: {e}")
                    await speak("Gemini is momenteel overbelast, probeer het opnieuw.")
                    continue

                print(f"Assistent: {reply}")

                geschiedenis.append({"role": "assistant", "content": reply})

                await speak(reply)

                print("Druk opnieuw op de knop voor een nieuwe vraag.")

        except KeyboardInterrupt:
            print("\nAssistent afgesloten via Ctrl+C.")
            pygame.mixer.music.stop()
            pygame.mixer.quit()


try:
    asyncio.run(main())
except KeyboardInterrupt:
    pass