import speech_recognition as sr
from google import genai
import edge_tts
import asyncio
import pygame
import io
from key import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)
r = sr.Recognizer()
pygame.mixer.init()

context = """
Je bent een koelkastassistent. Je helpt de gebruiker met het bijhouden van voedsel in de koelkast.
Je kent de locaties en houdbaarheidsdata van de volgende producten:

- Melk: bovenste schap, houdbaar tot 28/04/2026
- Kaas: middelste schap, houdbaar tot 10/05/2026
- Boter: deurrek, houdbaar tot 15/06/2026
- Yoghurt: onderste schap, houdbaar tot 30/04/2026
- Appelsap: deurrek, houdbaar tot 01/08/2026

Geef korte en duidelijke antwoorden.
"""

geschiedenis = []


async def speak(text):
    communicate = edge_tts.Communicate(text, voice="nl-NL-ColetteNeural")
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    pygame.mixer.music.load(io.BytesIO(audio_data))
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)


async def main():
    with sr.Microphone() as mic:
        r.adjust_for_ambient_noise(mic, duration=0.5)
        print("Klaar! Stel je vraag.")
        while True:
            try:
                spoken = r.recognize_google(r.listen(mic), language="nl-NL")
                print(f"Jij: {spoken}")
            except sr.UnknownValueError:
                print("Niet verstaan, probeer opnieuw.")
                continue
            except sr.RequestError:
                print("Geen verbinding.")
                continue

            geschiedenis.append({"role": "user", "content": spoken})

            # Onthoud maar de laatste 4 berichten (4 vragen + 4 antwoorden)
            if len(geschiedenis) > 4:
                geschiedenis.pop(0)

            berichten = context + "\n\n"
            for bericht in geschiedenis:
                if bericht["role"] == "user":
                    berichten += f"Gebruiker: {bericht['content']}\n"
                else:
                    berichten += f"Assistent: {bericht['content']}\n"

            resp = client.models.generate_content(
                model="gemini-2.5-flash", contents=berichten
            )
            reply = resp.text.strip()
            print("Assistent:", reply)

            geschiedenis.append({"role": "assistant", "content": reply})

            await speak(reply)
            print("Stel je volgende vraag.")


asyncio.run(main())
