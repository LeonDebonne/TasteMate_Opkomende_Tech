import speech_recognition as sr, pyttsx3
from google import genai

client = genai.Client(api_key="AIzaSyADRg_s4c4VD2DXAsmEUVtdsJj3nbbVtD0")
r = sr.Recognizer()
tts = pyttsx3.init()

tts.setProperty(
    "voice",
    "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Speech\\Voices\\Tokens\\TTS_MS_NL-NL_HANNA_11.0",
)

# Info over de koelkast
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

with sr.Microphone() as mic:
    r.adjust_for_ambient_noise(mic, duration=1)
    print("Speak...")
    try:
        spoken = r.recognize_google(r.listen(mic))
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
print("Assistant : ", reply)
tts.say(reply)
tts.runAndWait()
