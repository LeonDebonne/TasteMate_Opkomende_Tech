import speech_recognition as sr
from google import genai
import edge_tts
import asyncio
import pygame
import io
from key import GEMINI_API_KEY

# Verbinding maken met Gemini AI
client = genai.Client(api_key=GEMINI_API_KEY)

# Spraakherkenner aanmaken
r = sr.Recognizer()

# Audiospeler opstarten
pygame.mixer.init()

# Instructies voor Gemini: wie hij is en welke producten hij kent
context = """
Je bent een koelkastassistent. Je helpt de gebruiker met het bijhouden van voedsel in de koelkast.
Je kent de locaties en houdbaarheidsdata van de volgende producten:

- Melk: bovenste schap, houdbaar tot 28/04/2026
- Kaas: middelste schap, houdbaar tot 10/05/2026
- Boter: deurrek, houdbaar tot 15/06/2026
- Yoghurt: onderste schap, houdbaar tot 30/04/2026
- Appelsap: deurrek, houdbaar tot 01/08/2026

Geef korte en duidelijke antwoorden. Begin je antwoord nooit met "Assistent:".
"""

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
        r.adjust_for_ambient_noise(mic, duration=0.5)
        print("Klaar! Stel je vraag.")

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

            # Volledig gesprek opbouwen om naar Gemini te sturen
            berichten = context + "\n\n"
            for bericht in geschiedenis:
                if bericht["role"] == "user":
                    berichten += f"Gebruiker: {bericht['content']}\n"
                else:
                    berichten += f"Assistent: {bericht['content']}\n"

            # Gesprek naar Gemini sturen en antwoord ontvangen
            resp = client.models.generate_content(
                model="gemini-2.5-flash", contents=berichten
            )

            # Antwoord ophalen en "Assistent:" verwijderen als Gemini dat toevoegt
            reply = resp.text.strip()
            reply = reply.removeprefix("Assistent:").strip()
            print(f"Assistent: {reply}")

            # Antwoord toevoegen aan geschiedenis
            geschiedenis.append({"role": "assistant", "content": reply})

            # Antwoord uitspreken
            await speak(reply)
            print("Stel je volgende vraag.")


# Programma starten
asyncio.run(main())
