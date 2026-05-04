import speech_recognition as sr  # library voor spraakherkenning
from google import genai  # library voor Gemini AI
import edge_tts  # library voor tekst-naar-spraak
import asyncio  # library voor asynchrone functies
import pygame  # library voor audio afspelen
import io  # library voor geheugenbestanden
import json  # library voor JSON bestanden lezen
import os  # library voor bestandspaden
from key import GEMINI_API_KEY  # API sleutel importeren

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
        categories[c["id"]] = c["name"]  # categorie-id koppelen aan naam

    for product in inventory.get("products", []):
        categorie = categories.get(product.get("categoryId", ""), "Onbekend")  # categorie ophalen
        naam = product.get("name", "Onbekend")  # productnaam ophalen
        houdbaar = product.get("expiryDate", "onbekend")  # houdbaarheidsdatum ophalen
        regels.append(f"- {naam} (categorie: {categorie}, houdbaar tot: {houdbaar})")  # regel toevoegen

    if not regels:
        return "De koelkast is momenteel leeg."  # lege koelkast melding

    return "\n".join(regels)  # alle regels samenvoegen


# Lege lijst om de gespreksgeschiedenis in bij te houden
geschiedenis = []


# Functie om tekst uit te spreken via Microsoft edge-tts
async def speak(text):
    communicate = edge_tts.Communicate(text, voice="nl-NL-ColetteNeural")  # Nederlandse stem instellen

    audio_data = b""  # lege variabele om audio in op te slaan

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]  # audiofragmenten samenvoegen

    pygame.mixer.music.load(io.BytesIO(audio_data))  # audio in geheugen laden
    pygame.mixer.music.play()  # audio afspelen

    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)  # wachten tot audio klaar is


# Hoofdfunctie van het programma
async def main():
    with sr.Microphone() as mic:  # microfoon openen
        r.adjust_for_ambient_noise(mic, duration=1)  # omgevingsgeluid kalibreren
        print("Klaar! Stel je vraag.")

        try:
            while True:
                try:
                    audio = r.listen(mic, timeout=60)  # luisteren, stopt na 60 seconden stilte
                    spoken = r.recognize_google(audio, language="nl-NL")  # spraak naar tekst via Google
                    print(f"Jij: {spoken}")

                except sr.WaitTimeoutError:
                    print("Geen spraak gedetecteerd, assistent sluit af.")  # 60 seconden geen spraak -> afsluiten
                    break
                except sr.UnknownValueError:
                    print("Niet verstaan, probeer opnieuw.")  # spraak niet verstaan -> opnieuw proberen
                    continue
                except sr.RequestError:
                    print("Geen verbinding.")  # geen internet -> opnieuw proberen
                    continue

                geschiedenis.append({"role": "user", "content": spoken})  # vraag toevoegen aan geschiedenis

                if len(geschiedenis) > 4:
                    geschiedenis.pop(0)  # oudste bericht verwijderen, maximaal 4 onthouden

                with open(inventory_path, "r", encoding="utf-8") as f:
                    inventory = json.load(f)  # inventory opnieuw inlezen voor actuele gegevens

                # context opbouwen met actuele inventory en instructies voor Gemini
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
                        berichten += f"Gebruiker: {bericht['content']}\n"  # gebruikersbericht toevoegen
                    else:
                        berichten += f"Assistent: {bericht['content']}\n"  # assistentbericht toevoegen

                try:
                    resp = client.models.generate_content(
                        model="gemini-2.5-flash", contents=berichten  # gesprek naar Gemini sturen
                    )
                    reply = resp.text.strip()
                    reply = reply.removeprefix("Assistent:").strip()  # "Assistent:" verwijderen indien aanwezig
                except Exception as e:
                    print(f"Gemini fout: {e}")
                    await speak("Gemini is momenteel overbelast, probeer het opnieuw.")  # foutmelding uitspreken
                    continue

                print(f"Assistent: {reply}")
                geschiedenis.append({"role": "assistant", "content": reply})  # antwoord toevoegen aan geschiedenis
                await speak(reply)  # antwoord uitspreken
                print("Stel je volgende vraag.")

        except KeyboardInterrupt:
            print("\nAssistent afgesloten via Ctrl+C. Tot ziens!")  # afsluitbericht tonen
            pygame.mixer.music.stop()  # audio stoppen
            pygame.mixer.quit()  # audiospeler afsluiten


# Programma starten
try:
    asyncio.run(main())
except KeyboardInterrupt:
    pass  # stilletjes afsluiten, bericht is al geprint in main()