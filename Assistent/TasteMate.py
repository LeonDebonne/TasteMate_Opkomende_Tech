import speech_recognition as sr
from google import genai
import edge_tts
import asyncio
import pygame
import io
import json
import os
from key import GEMINI_API_KEY

# Verbinding maken met Gemini AI
client = genai.Client(api_key=GEMINI_API_KEY)

# Spraakherkenner aanmaken
r = sr.Recognizer()

# Audiospeler opstarten
pygame.mixer.init()

# Pad naar inventory bestand
base_dir = os.path.dirname(os.path.abspath(__file__))
inventory_path = os.path.join(base_dir, "..", "webserver", "inventory.json")


# Inventory omzetten naar leesbare tekst voor de context
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


# Lege lijst om de gespreksgeschiedenis in bij te houden
geschiedenis = []


# Functie om tekst uit te spreken via Microsoft edge-tts
async def speak(text):
    # Verzoek sturen naar Microsoft met de tekst en Nederlandse stem
    communicate = edge_tts.Communicate(text, voice="nl-NL-ColetteNeural")

    # Lege variabele om audio in op te slaan
    audio_data = b""

    # Audio stukje per stukje ontvangen en samenvoegen
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]

    # Audio in geheugen laden en afspelen
    pygame.mixer.music.load(io.BytesIO(audio_data))
    pygame.mixer.music.play()

    # Wachten tot audio klaar is
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)


# Hoofdfunctie van het programma
async def main():
    # Microfoon openen
    with sr.Microphone() as mic:
        # Eenmalig luisteren naar omgevingsgeluid om stilte te herkennen
        r.adjust_for_ambient_noise(mic, duration=1)
        print("Klaar! Stel je vraag.")

        try:
            # Blijf herhalen totdat er gestopt wordt
            while True:
                try:
                    # Luisteren naar microfoon, stopt na 60 seconden stilte
                    audio = r.listen(mic, timeout=60)

                    # Audio naar Google sturen en tekst terugkrijgen in het Nederlands
                    spoken = r.recognize_google(audio, language="nl-NL")
                    print(f"Jij: {spoken}")

                except sr.WaitTimeoutError:
                    # 60 seconden geen spraak -> afsluiten
                    print("Geen spraak gedetecteerd, assistent sluit af.")
                    break
                except sr.UnknownValueError:
                    # Spraak niet verstaan -> opnieuw proberen
                    print("Niet verstaan, probeer opnieuw.")
                    continue
                except sr.RequestError:
                    # Geen internetverbinding -> opnieuw proberen
                    print("Geen verbinding.")
                    continue

                # Vraag toevoegen aan geschiedenis
                geschiedenis.append({"role": "user", "content": spoken})

                # Maximaal 4 berichten onthouden, oudste verwijderen
                if len(geschiedenis) > 4:
                    geschiedenis.pop(0)

                # Inventory opnieuw inlezen zodat wijzigingen via de interface zichtbaar zijn
                with open(inventory_path, "r", encoding="utf-8") as f:
                    inventory = json.load(f)

                # Context opnieuw opbouwen met actuele inventory
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

                # Volledig gesprek opbouwen om naar Gemini te sturen
                berichten = actuele_context + "\n\n"
                for bericht in geschiedenis:
                    if bericht["role"] == "user":
                        berichten += f"Gebruiker: {bericht['content']}\n"
                    else:
                        berichten += f"Assistent: {bericht['content']}\n"

                # Gesprek naar Gemini sturen en antwoord ontvangen
                try:
                    resp = client.models.generate_content(
                        model="gemini-2.5-flash", contents=berichten
                    )
                    # Antwoord ophalen en "Assistent:" verwijderen als Gemini dat toevoegt
                    reply = resp.text.strip()
                    reply = reply.removeprefix("Assistent:").strip()
                except Exception as e:
                    print(f"Gemini fout: {e}")
                    await speak("Gemini is momenteel overbelast, probeer het opnieuw.")
                    continue

                print(f"Assistent: {reply}")

                # Antwoord toevoegen aan geschiedenis
                geschiedenis.append({"role": "assistant", "content": reply})

                # Antwoord uitspreken
                await speak(reply)
                print("Stel je volgende vraag.")

        except KeyboardInterrupt:
            # Ctrl+C opvangen en netjes afsluiten
            print("\nAssistent afgesloten via Ctrl+C. Tot ziens!")
            pygame.mixer.music.stop()
            pygame.mixer.quit()


# Programma starten
try:
    asyncio.run(main())
except KeyboardInterrupt:
    pass  # Stilletjes afsluiten, bericht is al geprint in main()