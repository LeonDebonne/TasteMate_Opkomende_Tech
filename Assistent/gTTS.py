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


with sr.Microphone() as mic:
    r.adjust_for_ambient_noise(mic, duration=1)
    print("Spreek nu...")
    try:
        spoken = r.recognize_google(r.listen(mic), language="nl-NL")
        print(f"Jij: {spoken}")
    except sr.UnknownValueError:
        print("Kon je stem niet verstaan, probeer opnieuw.")
        exit()
    except sr.RequestError:
        print("Geen verbinding met Google Speech API.")
        exit()

resp = client.models.generate_content(
    model="gemini-2.5-flash", contents=context + "\n\nVraag van gebruiker: " + spoken
)
reply = resp.text.strip()
print("Assistent:", reply)
asyncio.run(speak(reply))
